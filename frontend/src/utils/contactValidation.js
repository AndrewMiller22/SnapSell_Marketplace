const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\d{10}$/;

export const normalizeEmail = (value) => value.trim().toLowerCase();
export const normalizePhone = (value) => value.replace(/\D/g, '');
export const isValidEmail = (value) => EMAIL_PATTERN.test(normalizeEmail(value));
export const isValidPhone = (value) => PHONE_PATTERN.test(normalizePhone(value));

export function parseSignupContact(rawValue) {
  const value = rawValue.trim();

  if (!value) {
    return { error: 'Enter your email address or 10-digit phone number.' };
  }

  const looksLikePhone = /^[\d\s()+.-]+$/.test(value);
  if (looksLikePhone) {
    const phone = normalizePhone(value);
    return PHONE_PATTERN.test(phone)
      ? { type: 'phone', value: phone }
      : { error: 'Phone numbers must contain exactly 10 digits.' };
  }

  if (!isValidEmail(value)) {
    return { error: 'Enter a valid email address, such as name@example.ca.' };
  }

  return { type: 'email', value: normalizeEmail(value) };
}
