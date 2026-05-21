import { http } from '../http';
import { registerMockHandler } from '../http';
import type { HttpMethod } from '../http';
import { saveAuthData, clearAuthData } from './auth-store';
import {
  initDefaultUser,
  handleLogin,
  handleRegister,
  handleGetProfile,
} from './mock-server';
import type { AuthData, UserInfo } from './types';

// ---------- 类型重导出 ----------
export type { UserInfo, AuthData, LoginPayload, RegisterPayload } from './types';

// ---------- Mock 拦截器注册 ----------
function registerMock(
  method: HttpMethod,
  path: string,
  handler: (body: unknown, headers: Headers) => unknown,
) {
  registerMockHandler(method, path, async (body, headers) => {
    try {
      const data = await handler(body, headers);
      return { code: 0, message: 'ok', data };
    } catch (err) {
      const message = err instanceof Error ? err.message : '请求失败';
      return Promise.reject(
        Object.assign(new Error(message), { code: 400, mockReject: true }),
      );
    }
  });
}

export function setupAuthMocks() {
  initDefaultUser();
  registerMock('POST', 'auth/login', (body) => {
    const { email, password } = body as { email: string; password: string };
    return handleLogin(email, password);
  });
  registerMock('POST', 'auth/register', (body) => {
    const { username, email, password } = body as {
      username: string;
      email: string;
      password: string;
    };
    return handleRegister(username, email, password);
  });
  registerMock('GET', 'auth/profile', (_body, headers) => {
    const auth = headers.get('Authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    return handleGetProfile(token);
  });
}

// ---------- API 方法 ----------

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
