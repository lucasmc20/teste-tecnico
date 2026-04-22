import type { ApiErrorPayload, Item, ItemInput } from './types';

const DEFAULT_TIMEOUT_MS = 10_000;

const normalizeBase = (value: string) => value.replace(/\/+$/, '');

const netlifySiteUrl = () => process.env.URL ?? process.env.DEPLOY_PRIME_URL ?? process.env.DEPLOY_URL;

export const serverApiBase = () => {
  const explicit = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (explicit) return normalizeBase(explicit);

  const siteUrl = netlifySiteUrl();
  if (siteUrl) return `${normalizeBase(siteUrl)}/api`;

  return 'http://localhost:3333';
};

export const clientApiBase = () => {
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit) return normalizeBase(explicit);

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }

  return serverApiBase();
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly payload?: ApiErrorPayload;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

const resolveBase = () =>
  typeof window === 'undefined' ? serverApiBase() : clientApiBase();

type FetcherOptions = RequestInit & {
  cache?: RequestCache;
  token?: string | null;
  timeoutMs?: number;
};

const parseBody = (text: string): unknown => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const mergeHeaders = (token?: string | null, headers?: HeadersInit, hasBody?: boolean): HeadersInit => {
  const result: Record<string, string> = {};

  if (hasBody) {
    result['Content-Type'] = 'application/json';
  }

  if (token) {
    result.Authorization = `Bearer ${token}`;
  }

  if (!headers) return result;

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      result[key] = value;
    }
    return result;
  }

  return { ...result, ...headers };
};

const doRequest = async (path: string, options: FetcherOptions = {}) => {
  const { token, timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${resolveBase()}${path}`, {
      ...rest,
      signal: rest.signal ?? controller.signal,
      headers: mergeHeaders(token, rest.headers, Boolean(rest.body)),
    });
    const text = await res.text();
    return { res, body: parseBody(text) };
  } finally {
    clearTimeout(timeoutId);
  }
};

const toApiPayload = (body: unknown): ApiErrorPayload | undefined => {
  if (!body || typeof body !== 'object') return undefined;
  const maybe = body as Partial<ApiErrorPayload>;
  if (typeof maybe.message === 'string') {
    return {
      error: typeof maybe.error === 'string' ? maybe.error : 'ApiError',
      message: maybe.message,
      details: Array.isArray(maybe.details) ? maybe.details : undefined,
    };
  }
  return undefined;
};

const request = async <T>(path: string, options: FetcherOptions = {}): Promise<T> => {
  const { res, body } = await doRequest(path, options);

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const payload = toApiPayload(body);
    throw new ApiError(
      res.status,
      payload?.message ?? (typeof body === 'string' && body ? body : 'Erro ao comunicar com a API'),
      payload,
    );
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data;
  }

  return body as T;
};

export interface ListResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
}

const listRaw = async (
  params: { search?: string; page?: number; limit?: number } = {},
  init?: FetcherOptions,
): Promise<ListResponse> => {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs}` : '';

  const { res, body } = await doRequest(`/items${query}`, {
    cache: 'no-store',
    ...init,
  });

  if (!res.ok) {
    const payload = toApiPayload(body);
    throw new ApiError(
      res.status,
      payload?.message ?? (typeof body === 'string' && body ? body : 'Erro ao comunicar com a API'),
      payload,
    );
  }

  const parsedBody = body as {
    data?: Item[];
    meta?: { total?: number; page?: number; limit?: number };
  };
  const data = Array.isArray(parsedBody?.data) ? parsedBody.data : [];

  return {
    items: data,
    total: parsedBody.meta?.total ?? data.length,
    page: parsedBody.meta?.page ?? 1,
    limit: parsedBody.meta?.limit ?? 20,
  };
};

export const itemsApi = {
  list: (
    params?: { search?: string; page?: number; limit?: number },
    init?: FetcherOptions,
  ) => listRaw(params, init),
  listAll: (init?: FetcherOptions) => listRaw({}, init).then((r) => r.items),
  getById: (id: string, init?: FetcherOptions) =>
    request<Item>(`/items/${id}`, { cache: 'no-store', ...init }),
  create: (data: ItemInput, token?: string | null) =>
    request<Item>('/items', { method: 'POST', body: JSON.stringify(data), token }),
  update: (id: string, data: Partial<ItemInput>, token?: string | null) =>
    request<Item>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  remove: (id: string, token?: string | null) =>
    request<void>(`/items/${id}`, { method: 'DELETE', token }),
};

