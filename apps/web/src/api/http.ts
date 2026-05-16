// 定义项目内统一支持的 HTTP 方法，后续接口调用统一使用这里的类型约束。
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// 定义 URL 查询参数允许的值类型，数组会被展开成多个同名 query 参数。
export type QueryValue = string | number | boolean | null | undefined;

// 定义请求参数对象，所有业务模块都通过这个结构传入查询参数、请求体和请求头。
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

// 定义后端常见的统一响应结构；如果后端返回裸数据，也可以直接用泛型 T 接收。
export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

// 定义单次请求的扩展配置，保留 fetch 原生能力，同时补充 query、timeout、auth 等常用选项。
export interface RequestOptions<TBody = unknown>
  extends Omit<RequestInit, 'body' | 'method' | 'headers'> {
  method?: HttpMethod;
  query?: QueryParams;
  body?: TBody;
  headers?: HeadersInit;
  timeout?: number;
  auth?: boolean;
}

// 定义接口错误对象，方便页面层拿到 HTTP 状态码、业务错误码和原始响应。
export class ApiError extends Error {
  status: number;
  code?: number | string;
  payload?: unknown;

  constructor(message: string, status: number, code?: number | string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

// 读取 Vite 环境变量中的 API 地址；没有配置时默认走 /api，方便本地代理和生产网关统一接入。
const API_BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ??
  '/api';

// 设置默认超时时间，避免请求长期挂起导致页面一直处于 loading 状态。
const DEFAULT_TIMEOUT = 15000;

// 在内存中保存 token，避免 API 层直接绑定某个登录模块；登录模块可以通过 setAuthToken 注入。
let authToken: string | null = null;

// 对外提供设置 token 的方法，通常在登录成功或刷新 token 后调用。
export function setAuthToken(token: string | null) {
  authToken = token;
}

// 对外提供读取 token 的方法，便于调试或特殊请求场景复用。
export function getAuthToken() {
  return authToken;
}

// 对外提供清空 token 的方法，通常在退出登录或 token 失效时调用。
export function clearAuthToken() {
  authToken = null;
}

// 判断请求体是否属于浏览器原生可直接发送的类型，这类数据不应该被 JSON.stringify。
function isNativeBody(body: unknown): body is BodyInit {
  return (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams ||
    typeof body === 'string'
  );
}

// 将 query 对象转换为 URL 查询字符串，自动过滤 null 和 undefined。
function toQueryString(query?: QueryParams) {
  if (!query) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined) {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    if (value !== null && value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

// 拼接基础地址、接口路径和查询参数，同时兼容绝对 URL，便于以后请求第三方服务。
function buildUrl(path: string, query?: QueryParams) {
  const isAbsoluteUrl = /^https?:\/\//i.test(path);
  const baseUrl = isAbsoluteUrl ? path : `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const queryString = toQueryString(query);

  if (!queryString) {
    return baseUrl;
  }

  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}`;
}

// 统一解析响应体，优先按 JSON 处理；如果不是 JSON，则返回文本内容。
async function parseResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json() as Promise<unknown>;
  }

  return response.text();
}

// 根据请求体类型生成最终请求头，JSON 请求自动补充 Content-Type。
function createHeaders(body: unknown, headers?: HeadersInit, auth = true) {
  const finalHeaders = new Headers(headers);

  if (auth && authToken && !finalHeaders.has('Authorization')) {
    finalHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  if (body !== undefined && !isNativeBody(body) && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  return finalHeaders;
}

// 统一序列化请求体，普通对象默认转 JSON，FormData 等原生类型保持原样。
function createBody(body: unknown) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isNativeBody(body)) {
    return body;
  }

  return JSON.stringify(body);
}

// 从后端响应中提取错误信息，兼容 message、msg、error 等常见字段。
function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const message = record.message ?? record.msg ?? record.error;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

// 从后端响应中提取业务错误码，方便页面层做精细化错误处理。
function getErrorCode(payload: unknown) {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const code = record.code;

    if (typeof code === 'string' || typeof code === 'number') {
      return code;
    }
  }

  return undefined;
}

// 项目统一请求函数，所有模块 API 都建议基于它封装，保证错误、超时、鉴权逻辑一致。
export async function request<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
) {
  const {
    method = 'GET',
    query,
    body,
    headers,
    timeout = DEFAULT_TIMEOUT,
    auth = true,
    signal,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(buildUrl(path, query), {
      ...fetchOptions,
      method,
      headers: createHeaders(body, headers, auth),
      body: method === 'GET' ? undefined : createBody(body),
      signal: controller.signal,
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(payload, response.statusText || '请求失败'),
        response.status,
        getErrorCode(payload),
        payload,
      );
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('请求超时或已取消', 0, 'REQUEST_ABORTED');
    }

    throw new ApiError(error instanceof Error ? error.message : '网络请求异常', 0, 'NETWORK_ERROR');
  } finally {
    window.clearTimeout(timeoutId);
  }
}

// 提供 GET 快捷方法，适合查询列表、详情等只需要 query 参数的接口。
function get<TResponse>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return request<TResponse>(path, { ...options, method: 'GET' });
}

// 提供 POST 快捷方法，适合创建资源、提交表单、触发动作等接口。
function post<TResponse, TBody = unknown>(
  path: string,
  body?: TBody,
  options?: Omit<RequestOptions<TBody>, 'method' | 'body'>,
) {
  return request<TResponse, TBody>(path, { ...options, method: 'POST', body });
}

// 提供 PUT 快捷方法，适合完整更新某个资源。
function put<TResponse, TBody = unknown>(
  path: string,
  body?: TBody,
  options?: Omit<RequestOptions<TBody>, 'method' | 'body'>,
) {
  return request<TResponse, TBody>(path, { ...options, method: 'PUT', body });
}

// 提供 PATCH 快捷方法，适合局部更新某个资源。
function patch<TResponse, TBody = unknown>(
  path: string,
  body?: TBody,
  options?: Omit<RequestOptions<TBody>, 'method' | 'body'>,
) {
  return request<TResponse, TBody>(path, { ...options, method: 'PATCH', body });
}

// 提供 DELETE 快捷方法，适合删除资源；必要时也可以携带请求体。
function remove<TResponse, TBody = unknown>(
  path: string,
  body?: TBody,
  options?: Omit<RequestOptions<TBody>, 'method' | 'body'>,
) {
  return request<TResponse, TBody>(path, { ...options, method: 'DELETE', body });
}

// 汇总导出统一 HTTP 客户端，业务模块中优先使用 http.get / http.post 等语义化方法。
export const http = {
  get,
  post,
  put,
  patch,
  delete: remove,
  request,
};
