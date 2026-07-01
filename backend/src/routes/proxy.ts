import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import { getEnvironmentByIdUnsafe, getEnvironmentApiById, addRequestHistory } from '../services/db.service';
import { globalProxyAgent } from '../services/proxyAgent';

const router = Router();

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

async function fetchCsrfToken(
  baseUrl: string,
  path: string,
  credentials: string
): Promise<{ token: string; cookies: string }> {
  const tokenUrl = `${baseUrl}${path}`;
  const response = await fetch(tokenUrl, {
    agent: globalProxyAgent,
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
      'x-csrf-token': 'Fetch',
      Accept: 'application/json',
    },
  });
  const token = response.headers.get('x-csrf-token') || '';
  const rawHeaders = (response.headers as any).raw();
  const setCookieHeaders: string[] = rawHeaders['set-cookie'] || [];
  const cookies = setCookieHeaders.map((c: string) => c.split(';')[0]).join('; ');
  return { token, cookies };
}

router.post('/', async (req: Request, res: Response) => {
  const { environmentId, apiId, method, path, queryParams, body, headers: extraHeaders } = req.body;

  if (!environmentId || !method || !path) {
    return res.status(400).json({ error: 'environmentId, method ve path zorunludur' });
  }

  const env = getEnvironmentByIdUnsafe(Number(environmentId));
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });

  const credentials = Buffer.from(`${env.username}:${env.password}`).toString('base64');
  const baseUrl = env.base_url.replace(/\/$/, '');

  let resolvedPath = path;
  if (apiId && !path.startsWith('/sap/')) {
    const api = getEnvironmentApiById(Number(apiId));
    if (api?.service_url) {
      const serviceUrl = api.service_url.replace(/\/$/, '');
      resolvedPath = `${serviceUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    }
  }

  let url = `${baseUrl}${resolvedPath}`;

  if (apiId) {
    const api = getEnvironmentApiById(Number(apiId));
    if (api && api.protocol === 'SOAP') {
      // SOAP isteklerinde, operasyon ismi sadece UI kırılımı içindir. Ağ isteği her zaman baz SOAP URL'ine atılır.
      let finalServiceUrl = api.service_url;
      if (finalServiceUrl.startsWith('/sap/bc/srt/sap/')) {
        finalServiceUrl = finalServiceUrl.replace('/sap/bc/srt/sap/', '/sap/bc/srt/scs_ext/sap/');
      }
      url = `${baseUrl}${finalServiceUrl}`;
    }
  }

  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const paramStr = params.toString();
    if (paramStr) url += `?${paramStr}`;
  }

  const isSOAP = resolvedPath.includes('/sap/bc/srt/') || (extraHeaders?.['Content-Type'] || '').toLowerCase().includes('xml');

  const requestHeaders: Record<string, string> = {
    Authorization: `Basic ${credentials}`,
    Accept: isSOAP ? 'text/xml' : 'application/json',
    'Content-Type': isSOAP ? 'text/xml; charset=utf-8' : 'application/json',
    ...(extraHeaders || {}),
  };

  const isMutating = MUTATING_METHODS.includes(method.toUpperCase());

  if (isMutating && !isSOAP) {
    try {
      const serviceRoot = resolvedPath.split('/').slice(0, 6).join('/') + '/$metadata';
      const { token, cookies } = await fetchCsrfToken(baseUrl, serviceRoot, credentials);
      console.log('[CSRF] token fetch path:', serviceRoot, '| token:', token, '| cookies:', cookies?.substring(0, 80));
      if (token) requestHeaders['x-csrf-token'] = token;
      if (cookies) requestHeaders['Cookie'] = cookies;
    } catch (e: any) {
      console.log('[CSRF] token fetch failed:', e.message);
    }
  }

  const startTime = Date.now();

  try {
    const fetchOptions: any = { agent: globalProxyAgent, method: method.toUpperCase(), headers: requestHeaders };
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
      fetchOptions.body = typeof body === 'string' ? body : (isSOAP ? body : JSON.stringify(body));
    }

    console.log('[PROXY] →', method.toUpperCase(), url);
    console.log('[PROXY] headers:', JSON.stringify(requestHeaders));
    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;
    console.log('[PROXY] ←', response.status, response.statusText);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => { responseHeaders[key] = value; });

    const contentType = response.headers.get('content-type') || '';
    const responseBody = contentType.includes('application/json')
      ? await response.json()
      : await response.text();
    console.log('[PROXY] ←', response.status, response.statusText);

    addRequestHistory({
      environment_id: Number(environmentId),
      method: method.toUpperCase(),
      path,
      status_code: response.status,
      duration_ms: duration,
    });

    res.json({ status: response.status, statusText: response.statusText, headers: responseHeaders, body: responseBody, duration_ms: duration, url });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    res.status(502).json({ error: 'SAP sistemine bağlanılamadı', message: error.message, duration_ms: duration, url });
  }
});

export default router;
