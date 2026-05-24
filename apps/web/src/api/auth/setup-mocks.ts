import { registerMockHandler, ApiError } from '../http';
import { initDefaultUser, handleLogin, handleRegister, handleGetProfile } from './mock-server';

let registered = false;

function errorResponse(message: string, status = 400): never {
  throw new ApiError(message, status);
}

export function setupAuthMocks() {
  if (registered) return;
  registered = true;

  initDefaultUser();

  registerMockHandler('POST', 'auth/login', async (body) => {
    try {
      const { email, password } = body as { email: string; password: string };
      const authData = handleLogin(email, password);
      return { code: 0, message: 'ok', data: authData };
    } catch (err) {
      errorResponse(err instanceof Error ? err.message : '请求失败');
    }
  });

  registerMockHandler('POST', 'auth/register', async (body) => {
    try {
      const { username, email, password } = body as {
        username: string;
        email: string;
        password: string;
      };
      const authData = handleRegister(username, email, password);
      return { code: 0, message: 'ok', data: authData };
    } catch (err) {
      errorResponse(err instanceof Error ? err.message : '请求失败');
    }
  });

  registerMockHandler('GET', 'auth/profile', async (_body, headers) => {
    try {
      const token = headers.get('Authorization')?.replace('Bearer ', '') ?? '';
      const userInfo = handleGetProfile(token);
      return { code: 0, message: 'ok', data: userInfo };
    } catch (err) {
      errorResponse(err instanceof Error ? err.message : '未登录', 401);
    }
  });
}