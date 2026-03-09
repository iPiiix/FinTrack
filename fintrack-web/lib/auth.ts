// Utility functions to handle JWT tokens on the frontend

const TOKEN_KEY = "fintrack_token";

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Check if user is logged in (simple client-side check)
export function isAuthenticated(): boolean {
  return !!getToken();
}
