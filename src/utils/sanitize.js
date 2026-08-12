/**
 * Input Sanitization & XSS Prevention Utility
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
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

export function validatePhone(phone) {
  const re = /^[6-9]\d{9}$/;
  return re.test(String(phone).trim());
}

export function validateRollNumber(roll) {
  const re = /^[0-9]{2}[0-9A-Z]{3}[A-Z][0-9]{4}$/i;
  return re.test(String(roll).trim());
}
