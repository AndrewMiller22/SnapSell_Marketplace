const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\d{10}$/;

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizePhone = (value) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).replace(/\D/g, "")
    : "";

const isValidEmail = (value) => EMAIL_PATTERN.test(normalizeEmail(value));
const isValidPhone = (value) => PHONE_PATTERN.test(normalizePhone(value));

module.exports = {
  EMAIL_PATTERN,
  PHONE_PATTERN,
  normalizeEmail,
  normalizePhone,
  isValidEmail,
  isValidPhone
};
