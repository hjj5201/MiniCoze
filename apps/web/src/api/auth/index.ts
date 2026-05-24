import { http, type ApiEnvelope } from '../http';
import { saveAuthData, clearAuthData } from './auth-store';
import type { AuthData, UserInfo, LoginPayload, RegisterPayload } from './types';

export { setupAuthMocks } from './setup-mocks';
export type { UserInfo, AuthData, LoginPayload, RegisterPayload } from './types';

export async function login(payload: LoginPayload) {
  const res = await http.post<ApiEnvelope<AuthData>>('auth/login', payload);
  const authData = res.data;
  saveAuthData(authData.accessToken, authData.user);
  return authData;
}

export async function register(payload: RegisterPayload) {
  const res = await http.post<ApiEnvelope<AuthData>>('auth/register', payload);
  const authData = res.data;
  saveAuthData(authData.accessToken, authData.user);
  return authData;
}

export async function getProfile() {
  const res = await http.get<ApiEnvelope<UserInfo>>('auth/profile');
  return res.data;
}

export function logout() {
  clearAuthData();
}
