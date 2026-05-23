import {
  initDefaultUser,
  handleLogin,
  handleRegister,
  handleGetProfile,
} from './mock-server';

let patched = false;

function getAuthHeader(init?: RequestInit): string {
  if (!init?.headers) return '';
  if (init.headers instanceof Headers) {
    return init.headers.get('Authorization') ?? '';
  }
  if (Array.isArray(init.headers)) {
    const entry = init.headers.find(([k]) => k.toLowerCase() === 'authorization');
    return entry?.[1] ?? '';
  }
  const record = init.headers as Record<string, string>;
  const key = Object.keys(record).find((k) => k.toLowerCase() === 'authorization');
  return key ? record[key] : '';
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ code: 0, message: 'ok', data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ code: status, message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getBodyText(init?: RequestInit): string {
  if (typeof init?.body === 'string') return init.body;
  return '';
}

async function mockHandler(url: string, init?: RequestInit): Promise<Response | null> {
  const method = init?.method ?? 'GET';

  if (method === 'POST' && url.includes('/auth/login')) {
    try {
      const body = JSON.parse(getBodyText(init) || '{}');
      return jsonResponse(handleLogin(body.email, body.password));
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : '请求失败');
    }
  }

  if (method === 'POST' && url.includes('/auth/register')) {
    try {
      const body = JSON.parse(getBodyText(init) || '{}');
      return jsonResponse(handleRegister(body.username, body.email, body.password));
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : '请求失败');
    }
  }

  if (method === 'GET' && url.includes('/auth/profile')) {
    try {
      const token = getAuthHeader(init);
      return jsonResponse(handleGetProfile(token));
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : '未登录', 401);
    }
  }

  return null;
}

export function setupAuthMocks() {
  if (patched) return;
  patched = true;

  initDefaultUser();

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const mockResponse = await mockHandler(url, init);
    if (mockResponse) return mockResponse;
    return originalFetch(input, init);
  };
}
