// Utility functions for auth (now primarily cookie-based)

export function getToken(): string | null {
  // We can't access HttpOnly cookies from JS.
  // This function is kept for legacy support in some components, 
  // but will mostly return null now.
  return null;
}

export function removeToken() {
  // Logout is handled via the /auth/logout endpoint which clears cookies.
}

export function isAuthenticated(): boolean {
  // This is now purely dummy, real check happens in middleware and AuthContext
  return true; 
}
