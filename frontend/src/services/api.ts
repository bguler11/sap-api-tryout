import type { Environment, EnvironmentApi, CatalogApiResult, OpenApiSpec, ProxyResponse, RequestHistory, ApiCheckResult, AuthState, User, Variant, VariantList } from '../types';

const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) {
      const err = await res.json().catch(() => ({ error: 'Oturum süreniz dolmuş veya geçersiz. Çıkış yapılıyor...' }));
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: err.error || 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.' }));
      throw new Error(err.error || 'Oturum süresi doldu');
    }
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthState>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, name?: string) =>
    request<AuthState>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  me: () => request<{ user: User }>('/auth/me'),
};

export const environmentsApi = {
  getAll: () => request<Environment[]>('/environments'),
  create: (data: Omit<Environment, 'id' | 'created_at' | 'updated_at' | 'user_id'> & { password: string }) =>
    request<Environment>('/environments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Environment> & { password?: string }) =>
    request<Environment>(`/environments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/environments/${id}`, { method: 'DELETE' }),
};

export const environmentApisApi = {
  getAll: (environmentId: number) =>
    request<EnvironmentApi[]>(`/environment-apis?environmentId=${environmentId}`),
  add: (data: { environmentId: number; name: string; description?: string; serviceName: string; serviceUrl?: string; protocol?: string }) =>
    request<{ api: EnvironmentApi; arrangementMessage: string }>('/environment-apis', {
      method: 'POST',
      body: JSON.stringify({
        environmentId: data.environmentId,
        name: data.name,
        description: data.description,
        serviceName: data.serviceName,
        serviceUrl: data.serviceUrl,
        protocol: data.protocol,
      }),
    }),
  getSpec: (id: number) => request<OpenApiSpec>(`/environment-apis/${id}/spec`),
  getSandboxSpec: (id: number) => request<any>(`/environment-apis/${id}/sandbox-spec`),
  getSandboxRawSpec: (id: number) => request<any>(`/environment-apis/${id}/sandbox-raw-spec`),
  uploadSpec: (id: number, spec: object) =>
    request<{ ok: boolean; id: number }>(`/environment-apis/${id}/spec`, {
      method: 'POST',
      body: JSON.stringify(spec),
    }),
  refresh: (id: number) => request<EnvironmentApi>(`/environment-apis/${id}/refresh`, { method: 'POST' }),
  arrange: (id: number) => request<{ status: string; message: string }>(`/environment-apis/${id}/arrange`, { method: 'POST' }),
  delete: (id: number) => request<void>(`/environment-apis/${id}`, { method: 'DELETE' }),
  checkAll: (environmentId: number) =>
    request<Record<number, ApiCheckResult>>('/sap/apis/check-all', {
      method: 'POST',
      body: JSON.stringify({ environmentId }),
    }),
  checkArrangements: (environmentId: number) =>
    request<Record<number, { exists: boolean; checkable: boolean; noMapping: boolean; scenarioId: string; status: string }>>('/environment-apis/check-arrangements', {
      method: 'POST',
      body: JSON.stringify({ environmentId }),
    }),
};

export const sapCatalogApi = {
  search: (q: string) =>
    request<CatalogApiResult[]>(`/environment-apis/catalog-search?q=${encodeURIComponent(q)}`),
};

export const proxyApi = {
  execute: (payload: {
    environmentId: number;
    apiId?: string;
    method: string;
    path: string;
    queryParams?: Record<string, string>;
    body?: any;
    headers?: Record<string, string>;
  }) => request<ProxyResponse>('/proxy', { method: 'POST', body: JSON.stringify(payload) }),
};

export const historyApi = {
  getAll: (limit?: number) =>
    request<RequestHistory[]>(`/history${limit ? `?limit=${limit}` : ''}`),
};

export const commScenarioMapApi = {
  getAll: () => fetch(`${BASE}/comm-scenario-map`).then(r => r.json()) as Promise<{ service_name: string; scenario_id: string; updated_at: string; api_title: string | null; scenario_description: string | null }[]>,
  bulkUpsert: (entries: { service_name: string; scenario_id: string }[]) =>
    fetch(`${BASE}/comm-scenario-map/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entries),
    }).then(r => r.json()),
  delete: (serviceName: string) =>
    fetch(`${BASE}/comm-scenario-map/${encodeURIComponent(serviceName)}`, { method: 'DELETE' }),
};

export const variantsApi = {
  getAll: (environmentId: number, apiId: string, method: string, path: string) =>
    request<VariantList>(`/variants?environmentId=${environmentId}&apiId=${encodeURIComponent(apiId)}&method=${encodeURIComponent(method)}&path=${encodeURIComponent(path)}`),

  createUser: (data: { api_id: string; method: string; path: string; name: string; params: Record<string, any> }) =>
    request<Variant>('/variants/user', { method: 'POST', body: JSON.stringify(data) }),

  deleteUser: (id: number) =>
    request<void>(`/variants/user/${id}`, { method: 'DELETE' }),

  createGlobal: (data: { environment_id: number; api_id: string; method: string; path: string; name: string; params: Record<string, any> }) =>
    request<Variant>('/variants/global', { method: 'POST', body: JSON.stringify(data) }),

  deleteGlobal: (id: number) =>
    request<void>(`/variants/global/${id}`, { method: 'DELETE' }),
};
