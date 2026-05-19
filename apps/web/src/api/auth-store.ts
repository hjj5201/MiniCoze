import { setAuthToken, clearAuthToken } from './http';
import type { UserInfo } from './auth';
const TOKEN_KEY = 'minicoze_token';
const USER_KEY = 'minicoze_user';
let currentUser: UserInfo | null = null;
let listeners: Array<() => void> = [];

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function readUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY);

    if (raw) {
      return JSON.parse(raw) as UserInfo;
    }
  } catch {
    // ignore
  }

  return null;
}

function persistToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

function persistUser(user: UserInfo | null) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // ignore
  }
}

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function subscribeToAuth(fn: () => void) {
  listeners.push(fn);

  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function getCurrentUser(): UserInfo | null {
  return currentUser;
}

export function isAuthenticated(): boolean {
  return currentUser !== null;
}

export function saveAuthData(token: string, user: UserInfo) {
  persistToken(token);
  persistUser(user);
  setAuthToken(token);
  currentUser = user;
  notifyListeners();
}

export function clearAuthData() {
  persistToken(null);
  persistUser(null);
  clearAuthToken();
  currentUser = null;
  notifyListeners();
}

export function restoreAuthData(): boolean {
  const token = readToken();
  const user = readUser();

  if (token && user) {
    setAuthToken(token);
    currentUser = user;

    return true;
  }

  return false;
}
