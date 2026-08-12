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
  /** When the user accepted the Terms & Conditions + Privacy Policy (combined,
   *  one checkbox at registration). Undefined/null if never accepted. */
  acceptedTermsAndPoliciesAt?: string;
  /** Public URL of the user's uploaded profile photo, if any. */
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
