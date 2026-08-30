import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/auth';
import {
  verifyOTP,
  getUserRoleByPhone,
  getUserByPhone,
  registerUser,
} from '../services/authService';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { isValidIndianMobileNumber, normalizeIndianMobileNumber } from '../utils/validation';

interface AuthResult {
  success: boolean;
  error?: string;
  isNewUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True once the saved session (if any) has been restored — false right after
   * app launch while that check is still in flight. Anything that fires a
   * Supabase read/write automatically on mount should wait for this instead of
   * racing the session restore. */
  authReady: boolean;
  /** True when auth is backed by Supabase (real accounts). */
  realAuth: boolean;
  // ── Mock (phone/OTP) — used when no backend ──
  login: (phoneNumber: string, otp: string) => Promise<AuthResult>;
  completeProfile: (phoneNumber: string, name: string, role: UserRole, email?: string) => void;
  getUserRole: (phoneNumber: string) => UserRole | null;
  // ── Supabase (phone/password) — used when backend is on ──
  signInWithPhone: (phone: string, password: string) => Promise<AuthResult>;
  signUpWithPhone: (phone: string, password: string, name: string, role: UserRole) => Promise<AuthResult>;
  /** Password-less onboarding: one screen → account + profile → dashboard. */
  onboard: (input: OnboardInput) => Promise<AuthResult>;
  /** Returning user: log in with phone only (profile already exists). */
  loginWithPhone: (phone: string) => Promise<AuthResult>;
  /** Edit an already-registered profile (name/location/WhatsApp/photo) —
   *  reuses the same save path as onboarding, merged over the current user
   *  so fields you don't pass keep their existing value. */
  updateProfile: (updates: ProfileUpdate) => Promise<AuthResult>;
  /** Waits for Supabase to fully tear down the session before clearing local
   *  user state — see the comment on the implementation for why. */
  logout: () => Promise<void>;
}

export interface ProfileUpdate {
  name?: string;
  location?: string;
  district?: string;
  state?: string;
  hasWhatsapp?: boolean;
  avatarUrl?: string;
}

export interface OnboardInput {
  name: string;
  role: UserRole;
  phone: string;
  location?: string;
  district?: string;
  state?: string;
  hasWhatsapp?: boolean;
  /** True when the user checked "I agree to the Terms & Conditions and
   *  Privacy Policy" on the registration screen. */
  acceptedTermsAndPolicies?: boolean;
}

/** Phone is the real identifier; we back it with a synthetic email Supabase never shows. */
const cleanPhone = normalizeIndianMobileNumber;
const phoneToEmail = (phone: string) => `${cleanPhone(phone)}@greenplot.app`;
/** Deterministic password from the phone — invisible to the farmer (no OTP / no typing). */
const phoneToPassword = (phone: string) => `GreenPlot-${cleanPhone(phone)}-v1`;
const roleLabel = (role?: UserRole | null) => (role === 'owner' ? 'owner' : 'farmer');
const roleArticle = (role?: UserRole | null) => (role === 'owner' ? 'an' : 'a');
const alreadyRegisteredMessage = (role?: UserRole | null) =>
  `You already registered with this number as ${roleArticle(role)} ${roleLabel(role)}. Please log in.`;

type ProfileRow = {
  id: string;
  name?: string | null;
  role?: UserRole | null;
  phone?: string | null;
  location?: string | null;
  district?: string | null;
  state?: string | null;
  has_whatsapp?: boolean | null;
  accepted_terms_and_policies?: string | null;
  avatar_url?: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Mock mode has no session to restore, so it's ready immediately.
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);

  const findProfileByPhone = useCallback(async (phone: string): Promise<ProfileRow | null> => {
    if (!supabase) return null;

    const digits = cleanPhone(phone);
    const variants = [digits, `91${digits}`, `+91${digits}`];

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, phone, location, district, state, has_whatsapp, accepted_terms_and_policies, avatar_url')
      .in('phone', variants)
      .limit(1);

    if (error || !data?.length) return null;
    return data[0] as ProfileRow;
  }, []);

  const findProfileById = useCallback(async (id: string): Promise<ProfileRow | null> => {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, phone, location, district, state, has_whatsapp, accepted_terms_and_policies, avatar_url')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return data as ProfileRow;
  }, []);

  const saveOwnProfile = useCallback(
    async (profile: ProfileRow): Promise<string | null> => {
      if (!supabase) return 'Backend not configured';

      const payload = {
        p_id: profile.id,
        p_name: profile.name || '',
        p_role: profile.role || 'farmer',
        p_phone: profile.phone || null,
        p_location: profile.location || null,
        p_district: profile.district || null,
        p_state: profile.state || null,
        p_has_whatsapp: profile.has_whatsapp ?? true,
        p_accepted_terms_and_policies: profile.accepted_terms_and_policies || null,
        p_avatar_url: profile.avatar_url || null,
      };

      const rpcResult = await supabase.rpc('save_own_profile', payload);
      if (!rpcResult.error) return null;

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: profile.id,
            name: payload.p_name,
            role: payload.p_role,
            phone: payload.p_phone,
            location: payload.p_location,
            district: payload.p_district,
            state: payload.p_state,
            has_whatsapp: payload.p_has_whatsapp,
            accepted_terms_and_policies: payload.p_accepted_terms_and_policies,
            avatar_url: payload.p_avatar_url,
          },
          { onConflict: 'id' },
        );

      return error?.message || null;
    },
    [],
  );

  // Build the app User from a Supabase session + the profiles row. Always
  // does a fresh read — sign-up/onboarding rely on that to see a profile row
  // they just wrote a moment earlier, so this must never serve a cached or
  // in-flight result from before that write. (An earlier version of this
  // function de-duped concurrent calls with an in-flight-promise cache —
  // removed after it caused exactly that: onboarding's own read-back reused
  // a premature result from onAuthStateChange's listener, fetched before the
  // just-written profile row existed, so new sign-ups could land with the
  // wrong role. The startup double-fetch that cache was meant to avoid is
  // now fixed structurally below instead — see the effect's own comment.)
  const loadUserFromSession = useCallback(async (uid: string, authUser?: SupabaseUser | null) => {
    if (!supabase) return;

    const metadata = authUser?.user_metadata as { name?: string; phone?: string } | undefined;
    const fallbackPhone = cleanPhone(metadata?.phone || authUser?.phone || authUser?.email || '');
    const fallbackName = metadata?.name?.trim() || '';

    const profileResult = await supabase
      .from('profiles')
      .select('name, role, phone, location, district, state, has_whatsapp, accepted_terms_and_policies, avatar_url')
      .eq('id', uid)
      .single();

    let profile = profileResult.data as ProfileRow | null;

    if (profileResult.error || !profile) {
      const minimalProfileResult = await supabase
        .from('profiles')
        .select('name, role, phone')
        .eq('id', uid)
        .single();

      profile = minimalProfileResult.data as typeof profile;
    }

    if (!profile) {
      const recoveredProfile: ProfileRow = {
        id: uid,
        name: fallbackName,
        role: 'farmer',
        phone: fallbackPhone,
      };

      await saveOwnProfile(recoveredProfile);

      setUser({
        id: recoveredProfile.id,
        name: recoveredProfile.name || '',
        role: recoveredProfile.role || 'farmer',
        email: authUser?.email || undefined,
        phoneNumber: recoveredProfile.phone || '',
      });
      return;
    }

    setUser({
      id: uid,
      name: profile.name?.trim() || fallbackName,
      role: profile.role || 'farmer',
      email: authUser?.email || undefined,
      phoneNumber: profile.phone || fallbackPhone,
      location: profile.location || undefined,
      district: profile.district || undefined,
      state: profile.state || undefined,
      hasWhatsapp: profile.has_whatsapp ?? undefined,
      acceptedTermsAndPoliciesAt: profile.accepted_terms_and_policies || undefined,
      avatarUrl: profile.avatar_url || undefined,
    });
  }, [saveOwnProfile]);

  // Restore a saved Supabase session on launch + react to auth changes.
  //
  // Driven entirely by onAuthStateChange, including its own guaranteed first
  // event — INITIAL_SESSION, fired exactly once per subscription with
  // whatever session (or none) was already saved from a previous launch —
  // rather than ALSO calling getSession() separately. A previous version
  // called getSession() here too, which raced its own loadUserFromSession
  // call against the one this same INITIAL_SESSION event fires below: same
  // session, two concurrent profile fetches, every single app open.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        (async () => {
          // Wait for the user's profile to actually finish loading before
          // marking auth ready — otherwise "ready" can fire while `user` is
          // still null, and anything that reads `user?.id` at that instant
          // sees nobody logged in. Guarded two ways so a flaky profile load
          // can never block startup forever: a timeout in case the request
          // just hangs, and try/finally in case it throws — either way,
          // authReady still gets set.
          try {
            const authUser = session?.user;
            if (authUser) {
              let profileLoaded = false;
              await Promise.race([
                loadUserFromSession(authUser.id, authUser).then(() => {
                  profileLoaded = true;
                }),
                new Promise<void>(resolve => setTimeout(() => resolve(), 4000)),
              ]);
              // The timeout won, not the real load — on a slow backend this
              // can take much longer than 4s. Rather than mark auth ready
              // with `user` still null (which drops an already-logged-in
              // person onto the onboarding screen until the slow load
              // eventually finishes in the background), show a minimal
              // session-derived profile right away; loadUserFromSession
              // silently upgrades it to the full profile once it resolves.
              if (!profileLoaded) {
                const metadata = authUser.user_metadata as { name?: string; phone?: string } | undefined;
                setUser(prev =>
                  prev ?? {
                    id: authUser.id,
                    name: metadata?.name?.trim() || '',
                    role: 'farmer',
                    email: authUser.email || undefined,
                    phoneNumber: cleanPhone(metadata?.phone || authUser.phone || authUser.email || ''),
                  },
                );
              }
            }
          } catch {
            // Profile load failed — fall through and mark ready anyway below.
          } finally {
            setAuthReady(true);
          }
        })();
        return;
      }
      if (session?.user) loadUserFromSession(session.user.id, session.user);
      else setUser(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadUserFromSession]);

  // ── Mock auth (phone/OTP) ───────────────────────────────────────────────────
  const login = useCallback(async (phoneNumber: string, otp: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await verifyOTP(phoneNumber, otp);
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      if (result.error === 'User not found' || result.notRegistered) {
        return { success: false, error: result.error, isNewUser: true };
      }
      return { success: false, error: result.error || 'Login failed' };
    } catch {
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeProfile = useCallback(
    (phoneNumber: string, name: string, role: UserRole, email?: string) => {
      const newUser: User = { id: `user-${phoneNumber}`, name: name.trim(), phoneNumber, role, email: email?.trim() || undefined };
      registerUser(newUser);
      setUser(newUser);
    },
    [],
  );

  const getUserRole = useCallback((phoneNumber: string) => getUserRoleByPhone(phoneNumber), []);

  // ── Supabase auth (phone/password, backed by a synthetic email) ─────────────
  const signInWithPhone = useCallback(async (phone: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { success: false, error: 'Backend not configured' };
    if (!isValidIndianMobileNumber(phone)) return { success: false, error: 'Enter a valid Indian mobile number.' };
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: phoneToEmail(phone), password });
      if (error) return { success: false, error: 'Wrong phone number or password.' };
      if (data.user) await loadUserFromSession(data.user.id, data.user);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, [loadUserFromSession]);

  const signUpWithPhone = useCallback(
    async (phone: string, password: string, name: string, role: UserRole): Promise<AuthResult> => {
      if (!supabase) return { success: false, error: 'Backend not configured' };
      const digits = cleanPhone(phone);
      if (!isValidIndianMobileNumber(phone)) return { success: false, error: 'Enter a valid Indian mobile number.' };
      setIsLoading(true);
      try {
        const existingProfile = await findProfileByPhone(digits);
        if (existingProfile) {
          return { success: false, error: alreadyRegisteredMessage(existingProfile.role) };
        }

        const { data, error } = await supabase.auth.signUp({
          email: phoneToEmail(phone),
          password,
          options: { data: { name: name.trim(), phone: digits, role } },
        });
        if (error) return { success: false, error: error.message };
        if (!data.session) {
          // Email confirmation is ON → blocks sign-up. Must be turned OFF in Supabase.
          return { success: false, error: 'Turn OFF "Confirm email" in Supabase → Authentication → Providers → Email, then try again.' };
        }
        await supabase.auth.setSession(data.session);
        const profileError = await saveOwnProfile({
          id: data.user!.id,
          name: name.trim(),
          role,
          phone: digits,
        });
        if (profileError) return { success: false, error: profileError };
        await loadUserFromSession(data.user!.id, data.user);
        return { success: true };
      } finally {
        setIsLoading(false);
      }
    },
    [findProfileByPhone, loadUserFromSession, saveOwnProfile],
  );

  // ── Password-less onboarding (single screen) ────────────────────────────────
  const onboard = useCallback(
    async (input: OnboardInput): Promise<AuthResult> => {
      const digits = cleanPhone(input.phone);
      if (!isValidIndianMobileNumber(input.phone)) return { success: false, error: 'Enter a valid Indian mobile number.' };
      if (!input.name.trim()) return { success: false, error: 'Please enter your name.' };
      if (!input.acceptedTermsAndPolicies) {
        return { success: false, error: 'Please agree to the Terms & Conditions and Privacy Policy to continue.' };
      }

      const acceptedTermsAndPoliciesAt = new Date().toISOString();
      const profileFields = {
        name: input.name.trim(),
        role: input.role,
        phone: digits,
        location: input.location || null,
        district: input.district || null,
        state: input.state || null,
        has_whatsapp: input.hasWhatsapp ?? true,
        accepted_terms_and_policies: acceptedTermsAndPoliciesAt,
      };

      // ── Mock mode (no backend): persist locally ──
      if (!supabase) {
        const existingRole = getUserRoleByPhone(digits);
        if (existingRole) {
          return { success: false, error: alreadyRegisteredMessage(existingRole) };
        }

        const newUser: User = {
          id: `user-${digits}`,
          name: profileFields.name,
          phoneNumber: digits,
          role: input.role,
          location: input.location,
          district: input.district,
          state: input.state,
          hasWhatsapp: profileFields.has_whatsapp,
          acceptedTermsAndPoliciesAt,
        };
        registerUser(newUser);
        setUser(newUser);
        return { success: true };
      }

      // ── Supabase mode: sign up (or sign in if the phone already exists) ──
      setIsLoading(true);
      try {
        const email = phoneToEmail(digits);
        const password = phoneToPassword(digits);
        const existingProfile = await findProfileByPhone(digits);
        if (existingProfile) {
          return { success: false, error: alreadyRegisteredMessage(existingProfile.role) };
        }

        let uid: string | undefined;
        let signedInUser: SupabaseUser | null | undefined;
        const signUp = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: profileFields.name,
              phone: digits,
              role: profileFields.role,
              location: profileFields.location,
              district: profileFields.district,
              state: profileFields.state,
              has_whatsapp: profileFields.has_whatsapp,
              accepted_terms_and_policies: profileFields.accepted_terms_and_policies,
            },
          },
        });

        if (signUp.error) {
          // Already registered → sign the returning user back in.
          const signIn = await supabase.auth.signInWithPassword({ email, password });
          if (signIn.error || !signIn.data.user) {
            return { success: false, error: 'This number is already registered, but login could not be restored.' };
          }
          uid = signIn.data.user.id;
          signedInUser = signIn.data.user;
          if (signIn.data.session) await supabase.auth.setSession(signIn.data.session);
          const signedInProfile = await findProfileById(uid);
          if (signedInProfile?.role) {
            return { success: false, error: alreadyRegisteredMessage(signedInProfile.role) };
          }
        } else if (signUp.data.session && signUp.data.user) {
          uid = signUp.data.user.id;
          signedInUser = signUp.data.user;
          await supabase.auth.setSession(signUp.data.session);
        } else {
          // No session → email confirmation is still ON in Supabase.
          return { success: false, error: 'Turn OFF "Confirm email" in Supabase → Authentication → Providers → Email.' };
        }

        const profileError = await saveOwnProfile({
          id: uid,
          ...profileFields,
        });
        if (profileError) return { success: false, error: profileError };
        await loadUserFromSession(uid, signedInUser);
        return { success: true };
      } catch {
        return { success: false, error: 'Something went wrong. Please try again.' };
      } finally {
        setIsLoading(false);
      }
    },
    [findProfileById, findProfileByPhone, loadUserFromSession, saveOwnProfile],
  );

  // ── Returning-user login (phone only) ──────────────────────────────────────
  const loginWithPhone = useCallback(
    async (phone: string): Promise<AuthResult> => {
      const digits = cleanPhone(phone);
      if (!isValidIndianMobileNumber(phone)) return { success: false, error: 'Enter a valid Indian mobile number.' };

      if (!supabase) {
        // Mock mode: only role is known by phone; treat missing as new user.
        const existingUser = getUserByPhone(digits);
        if (!existingUser) return { success: false, error: 'No account found for this number.', isNewUser: true };
        setUser(existingUser);
        return { success: true };
      }

      setIsLoading(true);
      // TEMP DEBUG LOGGING — remove once the slow-login issue is found.
      const t0 = Date.now();
      const elapsed = () => `${Date.now() - t0}ms`;
      try {
        console.log(`[LOGIN] calling signInWithPassword() at ${elapsed()}`);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: phoneToEmail(digits),
          password: phoneToPassword(digits),
        });
        console.log(`[LOGIN] signInWithPassword() returned at ${elapsed()}, error=`, error?.message || null);
        if (error || !data.user) {
          console.log(`[LOGIN] sign-in failed, checking findProfileByPhone() at ${elapsed()}`);
          const existingProfile = await findProfileByPhone(digits);
          console.log(`[LOGIN] findProfileByPhone() returned at ${elapsed()}, found=`, !!existingProfile);
          if (existingProfile) {
            return {
              success: false,
              error:
                'Profile found for this number, but login is out of sync. Ask admin to reset this account login.',
            };
          }
          return { success: false, error: 'No account found for this number. Please create one.', isNewUser: true };
        }
        console.log(`[LOGIN] calling loadUserFromSession() at ${elapsed()}`);
        await loadUserFromSession(data.user.id, data.user);
        console.log(`[LOGIN] loadUserFromSession() returned at ${elapsed()} — DONE`);
        return { success: true };
      } finally {
        setIsLoading(false);
      }
    },
    [findProfileByPhone, loadUserFromSession],
  );

  // ── Edit an already-registered profile ──────────────────────────────────────
  // Merges the given updates over the CURRENT user (not a partial DB patch) —
  // saveOwnProfile expects a full row, so anything not passed here keeps its
  // existing value instead of being wiped to null/default.
  const updateProfile = useCallback(
    async (updates: ProfileUpdate): Promise<AuthResult> => {
      if (!user) return { success: false, error: 'Not signed in.' };
      const merged: User = { ...user, ...updates };

      if (!supabase) {
        setUser(merged);
        return { success: true };
      }

      setIsLoading(true);
      try {
        const profileError = await saveOwnProfile({
          id: merged.id,
          name: merged.name,
          role: merged.role,
          phone: merged.phoneNumber,
          location: merged.location || null,
          district: merged.district || null,
          state: merged.state || null,
          has_whatsapp: merged.hasWhatsapp ?? true,
          accepted_terms_and_policies: merged.acceptedTermsAndPoliciesAt || null,
          avatar_url: merged.avatarUrl || null,
        });
        if (profileError) return { success: false, error: profileError };
        setUser(merged);
        return { success: true };
      } finally {
        setIsLoading(false);
      }
    },
    [user, saveOwnProfile],
  );

  // Awaits signOut() before clearing local user state. Previously this fired
  // signOut() without waiting and cleared the user immediately — if a login
  // for a DIFFERENT account started before that signOut had actually
  // finished on Supabase's side, the two session writes could race, leaving
  // a stale/broken session behind that then broke a later login for the
  // FIRST account (looked like "Account not found" even though the account
  // and profile were both fine). Awaiting it closes that race.
  //
  // Guarded two ways so a slow/flaky network can never strand someone
  // logged in with no feedback: a timeout in case signOut() just hangs, and
  // try/catch in case it throws — either way we still fall through and
  // clear the local session below, same as the session-restore guard above.
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        try {
          await Promise.race([
            supabase.auth.signOut(),
            new Promise<void>(resolve => setTimeout(() => resolve(), 4000)),
          ]);
        } catch {
          // Server-side sign-out failing shouldn't block logging out locally.
        }
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authReady,
        realAuth: isSupabaseConfigured,
        login,
        completeProfile,
        getUserRole,
        signInWithPhone,
        signUpWithPhone,
        onboard,
        loginWithPhone,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
