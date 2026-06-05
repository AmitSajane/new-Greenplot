import { User, UserRole } from '../types/auth';

/**
 * In-memory user registry.
 * Populated when a user completes sign-up via completeProfile().
 * In a real app this would be backed by a server/database.
 */
const userRegistry: Record<string, User> = {};

/**
 * Register (or update) a user in the in-memory store.
 * Called by AuthContext.completeProfile after OTP is verified.
 */
export const registerUser = (user: User): void => {
  userRegistry[user.phoneNumber] = user;
};

/**
 * Returns the role of a registered user by phone number, or null if unknown.
 */
export const getUserRoleByPhone = (phoneNumber: string): UserRole | null => {
  return userRegistry[phoneNumber]?.role ?? null;
};

/**
 * Gets a registered user by phone number.
 */
export const getUserByPhone = (phoneNumber: string): User | null => {
  return userRegistry[phoneNumber] ?? null;
};

/**
 * Simulates sending an OTP to the given phone number.
 * Always succeeds — in a real app this would call your SMS gateway.
 */
export const sendOTP = async (
  _phoneNumber: string,
): Promise<{ success: boolean; error?: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
};

/**
 * Verifies the OTP entered by the user.
 *
 * Rules (demo mode — no real OTP service):
 *  - OTP must be exactly 4 digits (any combination accepted).
 *  - If the phone number belongs to a registered user → login succeeds.
 *  - If the phone number is not in the registry → user is new, must complete sign-up.
 */
export const verifyOTP = async (
  phoneNumber: string,
  otp: string,
): Promise<{ success: boolean; user?: User; error?: string; notRegistered?: boolean }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (otp.length !== 4) {
    return { success: false, error: 'Invalid OTP format' };
  }

  const user = userRegistry[phoneNumber];
  if (!user) {
    // Not yet registered — caller (OTPScreen) will redirect to ProfileSetup / RegisterScreen
    return { success: false, error: 'User not found', notRegistered: true };
  }

  return { success: true, user };
};
