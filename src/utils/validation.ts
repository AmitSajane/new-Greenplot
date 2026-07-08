/** Shared validation helpers for forms across screens. */

export const isMinTrimmedLength = (value: string, min: number): boolean =>
  value.trim().length >= min;

export const isValidProfileName = (name: string, minLength = 2): boolean =>
  isMinTrimmedLength(name, minLength);

export const isOptionalEmail = (email: string): boolean => {
  const trimmed = email.trim();
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

export const normalizeIndianMobileNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits.slice(0, 10);
};

export const sanitizeIndianMobileInput = (value: string): string => {
  const digits = normalizeIndianMobileNumber(value);
  if (!digits) return '';
  return /^[6-9]/.test(digits) ? digits : '';
};

export const isValidIndianMobileNumber = (value: string): boolean => {
  const digits = normalizeIndianMobileNumber(value);
  return /^[6-9]\d{9}$/.test(digits) && !/^(\d)\1{9}$/.test(digits);
};
