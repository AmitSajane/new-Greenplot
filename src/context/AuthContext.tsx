import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/auth';
import {
  verifyOTP,
  getUserRoleByPhone,
  registerUser,
} from '../services/authService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthResult {
  success: boolean;
  error?: string;
  isNewUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  logout: () => void;
}

export interface OnboardInput {
  name: string;
  role: UserRole;
  phone: string;
  location?: string;
  district?: string;
  state?: string;
  hasWhatsapp?: boolean;
}

/** Phone is the real identifier; we back it with a synthetic email Supabase never shows. */
const cleanPhone = (phone: string) => phone.replace(/\D/g, '');
const phoneToEmail = (phone: string) => `${cleanPhone(phone)}@greenplot.app`;
/** Deterministic password from the phone — invisible to the farmer (no OTP / no typing). */
const phoneToPassword = (phone: string) => `GreenPlot-${cleanPhone(phone)}-v1`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Build the app User from a Supabase session + the profiles row.
  const loadUserFromSession = useCallback(async (uid: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('name, role, phone, email, location, district, state, has_whatsapp')
      .eq('id', uid)
      .single();
    setUser({
      id: uid,
      name: data?.name || 'User',
      role: (data?.role as UserRole) || 'farmer',
      email: data?.email || undefined,
      phoneNumber: data?.phone || '',
      location: data?.location || undefined,
      district: data?.district || undefined,
      state: data?.state || undefined,
      hasWhatsapp: data?.has_whatsapp ?? undefined,
    });
  }, []);

  // Restore a saved Supabase session on launch + react to auth changes.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) loadUserFromSession(data.session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadUserFromSession(session.user.id);
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
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: phoneToEmail(phone), password });
      if (error) return { success: false, error: 'Wrong phone number or password.' };
      if (data.user) await loadUserFromSession(data.user.id);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, [loadUserFromSession]);

  const signUpWithPhone = useCallback(
    async (phone: string, password: string, name: string, role: UserRole): Promise<AuthResult> => {
      if (!supabase) return { success: false, error: 'Backend not configured' };
      const digits = cleanPhone(phone);
      if (digits.length < 10) return { success: false, error: 'Enter a valid 10-digit mobile number.' };
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: phoneToEmail(phone),
          password,
          options: { data: { name: name.trim(), phone: digits } },
        });
        if (error) return { success: false, error: error.message };
        if (!data.session) {
          // Email confirmation is ON → blocks sign-up. Must be turned OFF in Supabase.
          return { success: false, error: 'Turn OFF "Confirm email" in Supabase → Authentication → Providers → Email, then try again.' };
        }
        await supabase.from('profiles').update({ name: name.trim(), role, phone: digits }).eq('id', data.user!.id);
        await loadUserFromSession(data.user!.id);
        return { success: true };
      } finally {
        setIsLoading(false);
      }
    },
    [loadUserFromSession],
  );

  // ── Password-less onboarding (single screen) ────────────────────────────────
  const onboard = useCallback(
    async (input: OnboardInput): Promise<AuthResult> => {
      const digits = cleanPhone(input.phone);
      if (digits.length < 10) return { success: false, error: 'Enter a valid 10-digit mobile number.' };
      if (!input.name.trim()) return { success: false, error: 'Please enter your name.' };

      const profileFields = {
        name: input.name.trim(),
        role: input.role,
        phone: digits,
        location: input.location || null,
        district: input.district || null,
        state: input.state || null,
        has_whatsapp: input.hasWhatsapp ?? true,
      };

      // ── Mock mode (no backend): persist locally ──
      if (!supabase) {
        const newUser: User = {
          id: `user-${digits}`,
          name: profileFields.name,
          phoneNumber: digits,
          role: input.role,
          location: input.location,
          district: input.district,
          state: input.state,
          hasWhatsapp: profileFields.has_whatsapp,
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

        let uid: string | undefined;
        const signUp = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: profileFields.name, phone: digits } },
        });

        if (signUp.error) {
          // Already registered → sign the returning user back in.
          const signIn = await supabase.auth.signInWithPassword({ email, password });
          if (signIn.error || !signIn.data.user) {
            return { success: false, error: 'This number is already registered on another device.' };
          }
          uid = signIn.data.user.id;
        } else if (signUp.data.session && signUp.data.user) {
          uid = signUp.data.user.id;
        } else {
          // No session → email confirmation is still ON in Supabase.
          return { success: false, error: 'Turn OFF "Confirm email" in Supabase → Authentication → Providers → Email.' };
        }

        // The on_auth_user_created trigger seeds the row; fill in all the details.
        await supabase.from('profiles').update(profileFields).eq('id', uid);
        await loadUserFromSession(uid);
        return { success: true };
      } catch {
        return { success: false, error: 'Something went wrong. Please try again.' };
      } finally {
        setIsLoading(false);
      }
    },
    [loadUserFromSession],
  );

  const logout = useCallback(() => {
    if (supabase) supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        realAuth: isSupabaseConfigured,
        login,
        completeProfile,
        getUserRole,
        signInWithPhone,
        signUpWithPhone,
        onboard,
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
