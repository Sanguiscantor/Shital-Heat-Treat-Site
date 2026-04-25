import type { User } from "@workspace/api-client-react";

const TOKEN_KEY = "sht_session_token";
const USER_KEY = "sht_session_user";

export function saveSession(token: string, user: User) {
  // Keep auth per-browser-tab so worker/client can stay logged in simultaneously.
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  // Remove old shared storage entries to avoid cross-tab session clobbering.
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSessionToken(): string | null {
  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  if (sessionToken) return sessionToken;
  // Fallback for older tabs that still stored auth in localStorage.
  return localStorage.getItem(TOKEN_KEY);
}

export function getSessionUser(): User | null {
  const raw = sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

