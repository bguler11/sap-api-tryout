export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface AuthState {
  token: string;
  user: User;
}

export interface Environment {
  id: number;
  name: string;
  base_url: string;
  username: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EnvironmentApi {
  id: number;
  environment_id: number;
  name: string;
  description?: string;
  service_name: string;
  service_url: string;
  protocol: string;
  arrangement_status: 'ok' | 'failed' | 'pending';
  spec_cached_at?: string;
  created_at: string;
}

export interface ApiCheckResult {
  accessible: boolean;
  status: number;
}

export interface CatalogApiResult {
  name: string;
  title: string;
  description: string;
  subType: string;
  version: string;
}

export interface OpenApiParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: {
    type?: string;
    enum?: string[];
    example?: string | number;
  };
}

export interface OpenApiRequestBody {
  required?: boolean;
  content?: {
    [contentType: string]: {
      schema?: {
        type?: string;
        required?: string[];
        properties?: Record<string, { type?: string; description?: string; example?: any }>;
      };
    };
  };
}

export interface OpenApiOperation {
  summary?: string;
  operationId?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, { description?: string }>;
}

export interface OpenApiPathItem {
  get?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  patch?: OpenApiOperation;
  delete?: OpenApiOperation;
}

export interface OpenApiSpec {
  openapi: string;
  info: { title: string; version: string };
  paths: Record<string, OpenApiPathItem>;
  'x-sap-comm-scenario'?: string | null;
}

export interface Endpoint {
  path: string;
  method: string;
  operation: OpenApiOperation;
}

export interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  duration_ms: number;
  url: string;
}

export interface Variant {
  id: number;
  api_id: string;
  method: string;
  path: string;
  name: string;
  params: Record<string, any>;
  created_at: string;
  scope: 'user' | 'global';
  environment_id?: number;
  created_by?: number;
  created_by_email?: string;
}

export interface VariantList {
  user: Variant[];
  global: Variant[];
}

export interface RequestHistory {
  id: number;
  environment_id: number;
  environment_name: string;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  created_at: string;
}
