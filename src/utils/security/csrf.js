export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token, storedToken) {
  if (!token || !storedToken) return false;
  return token === storedToken;
}

export function setCSRFCookie(token) {
  document.cookie = `XSRF-TOKEN=${token}; path=/; SameSite=Strict`;
}

export function getCSRFCookie() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? match[1] : null;
}