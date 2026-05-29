import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types/auth';
import {
  verifyOTP,
  getUserRoleByPhone,
  getUserByPhone,
  registerUser,
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
  completeProfile: (phoneNumber: string, name: string, role: UserRole, email?: string) => void;
  logout: () => void;
  getUserRole: (phoneNumber: string) => UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (phoneNumber: string, otp: string) => {
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
    } catch (error) {
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Called after OTP verification when a new user completes sign-up,
   * or when an existing user updates their profile.
   *
   * Saves the user into the in-memory registry so future logins succeed,
   * then sets the current session user.
   */
  const completeProfile = useCallback(
    (phoneNumber: string, name: string, role: UserRole, email?: string) => {
      const newUser: User = {
        id: `user-${phoneNumber}`,
        name: name.trim(),
        phoneNumber,
        role,
        email: email?.trim() || undefined,
      };
      // Persist into the auth service registry so login works next time
      registerUser(newUser);
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const getUserRole = useCallback((phoneNumber: string) => {
    return getUserRoleByPhone(phoneNumber);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        completeProfile,
        logout,
        getUserRole,
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
