import type { Environment, SapApi, OpenApiSpec, ProxyResponse, RequestHistory, ApiCheckResult } from '../types';

const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const environmentsApi = {
  getAll: () => request<Environment[]>('/environments'),
  create: (data: Omit<Environment, 'id' | 'created_at' | 'updated_at'> & { password: string }) =>
    request<Environment>('/environments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Environment> & { password?: string }) =>
    request<Environment>(`/environments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/environments/${id}`, { method: 'DELETE' }),
};

export const sapApisApi = {
  getAll: () => request<SapApi[]>('/sap/apis'),
  getSpec: (apiId: string) => request<OpenApiSpec>(`/sap/apis/${apiId}/spec`),
  checkAccess: (apiId: string, environmentId: number) =>
    request<ApiCheckResult>(`/sap/apis/${apiId}/check`, {
      method: 'POST',
      body: JSON.stringify({ environmentId }),
    }),
};

export const proxyApi = {
  execute: (payload: {
    environmentId: number;
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
