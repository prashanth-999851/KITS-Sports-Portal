/**
 * Input Sanitization & Form Validation Utilities
 */

export function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).trim().toLowerCase());
}

export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.trim().replace(/[\s\-()]/g, '');
  const re = /^(\+91)?[6-9]\d{9}$/;
  return re.test(cleaned);
}

export function validateRollNumber(roll) {
  if (!roll || typeof roll !== 'string') return false;
  const cleaned = roll.trim();
  const rollRegex = /^(24|25|26)JR[15]A(02|04|05|12|42|43)((0[1-9]|[1-9][0-9])|[A-Z][0-9]|[A-Z]{2})$/i;
  return rollRegex.test(cleaned);
}

export function validateName(name) {
  if (!name || typeof name !== 'string') return false;
  const cleaned = name.trim();
  return cleaned.length >= 2 && cleaned.length <= 60 && /^[a-zA-Z\s.'-]+$/.test(cleaned);
}

export function validateSubject(subject) {
  if (!subject || typeof subject !== 'string') return false;
  const cleaned = subject.trim();
  return cleaned.length >= 3 && cleaned.length <= 150;
}

export function validateMessage(message) {
  if (!message || typeof message !== 'string') return false;
  const cleaned = message.trim();
  return cleaned.length >= 10 && cleaned.length <= 2000;
}
