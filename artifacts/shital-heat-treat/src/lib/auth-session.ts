import type { User } from "@workspace/api-client-react";

const TOKEN_KEY = "sht_session_token";
const USER_KEY = "sht_session_user";

export function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSessionToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getSessionUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

