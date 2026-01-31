import { User, UserRole } from '../types/auth';

// Dummy phone numbers for role-based login
const FARMER_PHONE = '8073584715';
const OWNER_PHONE = '8217642715';

// Dummy user data
const DUMMY_USERS: Record<string, User> = {
  [FARMER_PHONE]: {
    id: '1',
    name: 'Ramesh Kumar',
    phoneNumber: FARMER_PHONE,
    role: 'farmer',
    email: 'ramesh@example.com',
  },
  [OWNER_PHONE]: {
    id: '2',
    name: 'Rajesh Singh',
    phoneNumber: OWNER_PHONE,
    role: 'owner',
    email: 'rajesh@example.com',
  },
};

/**
 * Determines user role based on phone number
 */
export const getUserRoleByPhone = (phoneNumber: string): UserRole | null => {
  if (phoneNumber === FARMER_PHONE) {
    return 'farmer';
  }
  if (phoneNumber === OWNER_PHONE) {
    return 'owner';
  }
  return null;
};

/**
 * Verifies OTP and returns user data
 */
export const verifyOTP = async (
  phoneNumber: string,
  otp: string,
): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Dummy OTP verification - accept any 4 digit OTP for demo
  if (otp.length !== 4) {
    return { success: false, error: 'Invalid OTP format' };
  }

  const user = DUMMY_USERS[phoneNumber];
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  return { success: true, user };
};

/**
 * Sends OTP to phone number
 */
export const sendOTP = async (
  phoneNumber: string,
): Promise<{ success: boolean; error?: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const role = getUserRoleByPhone(phoneNumber);
  if (!role) {
    return { success: false, error: 'Phone number not registered' };
  }

  return { success: true };
};

/**
 * Gets user by phone number
 */
export const getUserByPhone = (phoneNumber: string): User | null => {
  return DUMMY_USERS[phoneNumber] || null;
};
