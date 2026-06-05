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
