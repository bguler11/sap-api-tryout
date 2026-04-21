export interface Environment {
  id: number;
  name: string;
  base_url: string;
  username: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SapApi {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  communicationScenario: string;
  testPath: string;
}

export interface ApiCheckResult {
  accessible: boolean;
  status: number;
  communicationScenario: string;
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
