// lib/auth.ts

/**
 * Gets the current session token from localStorage
 */
export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("session_token");
}

/**
 * Gets the current user email from localStorage
 */
export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_email");
}

/**
 * Saves the session token and user email to localStorage
 */
export function setSession(token: string, email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("session_token", token);
  localStorage.setItem("user_email", email);
}

/**
 * Clears the session from localStorage
 */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("session_token");
  localStorage.removeItem("user_email");
}

/**
 * Checks if a user is currently logged in (has a session token)
 */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("session_token");
}
