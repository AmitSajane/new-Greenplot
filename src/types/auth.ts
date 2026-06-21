export type UserRole = 'farmer' | 'owner';

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  role: UserRole;
  email?: string;
  /** Free-text location label (e.g. "Kasba, Purnea, Bihar"). */
  location?: string;
  district?: string;
  state?: string;
  /** True if the phone number is reachable on WhatsApp. */
  hasWhatsapp?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
