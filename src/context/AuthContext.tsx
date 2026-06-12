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
  logout: () => void;
}

/** Phone is the real identifier; we back it with a synthetic email Supabase never shows. */
const cleanPhone = (phone: string) => phone.replace(/\D/g, '');
const phoneToEmail = (phone: string) => `${cleanPhone(phone)}@greenplot.app`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Build the app User from a Supabase session + the profiles row.
  const loadUserFromSession = useCallback(async (uid: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('name, role, phone, email').eq('id', uid).single();
    setUser({
      id: uid,
      name: data?.name || 'User',
      role: (data?.role as UserRole) || 'farmer',
      email: data?.email || undefined,
      phoneNumber: data?.phone || '',
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
