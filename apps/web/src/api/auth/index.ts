import { http } from '../http';
import { saveAuthData, clearAuthData } from './auth-store';
import type { AuthData, UserInfo } from './types';

export { setupAuthMocks } from './setup-mocks';
export type { UserInfo, AuthData, LoginPayload, RegisterPayload } from './types';

interface ApiResponse<T> {
  code: number;
  data: T;
}

export async function login(payload: { email: string; password: string }) {
  const res = await http.post<ApiResponse<AuthData>>('auth/login', payload);
  const authData = res.data;
  saveAuthData(authData.accessToken, authData.user);
  return authData;
}

export async function register(payload: {
  username: string;
  email: string;
  password: string;
}) {
  const res = await http.post<ApiResponse<AuthData>>('auth/register', payload);
  const authData = res.data;
  saveAuthData(authData.accessToken, authData.user);
  return authData;
}

export async function getProfile() {
  const res = await http.get<ApiResponse<UserInfo>>('auth/profile');
  return res.data;
}

export function logout() {
  clearAuthData();
}
