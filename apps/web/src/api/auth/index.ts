import { saveAuthData, clearAuthData } from '../auth-store';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthData {
  accessToken: string;
  tokenType: 'Bearer';
  user: UserInfo;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<AuthData> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockUser: UserInfo = {
    id: 'mock-user-001',
    username: payload.email.split('@')[0],
    email: payload.email,
    avatarUrl: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const data: AuthData = {
    accessToken: 'mock-token-' + Date.now(),
    tokenType: 'Bearer',
    user: mockUser,
  };

  saveAuthData(data.accessToken, data.user);

  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthData> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockUser: UserInfo = {
    id: 'mock-user-001',
    username: payload.username,
    email: payload.email,
    avatarUrl: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const data: AuthData = {
    accessToken: 'mock-token-' + Date.now(),
    tokenType: 'Bearer',
    user: mockUser,
  };

  saveAuthData(data.accessToken, data.user);

  return data;
}

export async function getProfile(): Promise<UserInfo> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    id: 'mock-user-001',
    username: 'demo',
    email: 'demo@example.com',
    avatarUrl: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function logout() {
  clearAuthData();
}
