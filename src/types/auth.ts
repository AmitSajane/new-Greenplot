export type UserRole = 'farmer' | 'owner';

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  role: UserRole;
  email?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
