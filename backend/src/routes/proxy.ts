import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import { getEnvironmentById, addRequestHistory } from '../services/db.service';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { environmentId, method, path, queryParams, body, headers: extraHeaders } = req.body;

  if (!environmentId || !method || !path) {
    return res.status(400).json({ error: 'environmentId, method ve path zorunludur' });
  }

  const env = getEnvironmentById(Number(environmentId));
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });

  const credentials = Buffer.from(`${env.username}:${env.password}`).toString('base64');

  const baseUrl = env.base_url.replace(/\/$/, '');
  let url = `${baseUrl}${path}`;

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

  const requestHeaders: Record<string, string> = {
    Authorization: `Basic ${credentials}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(extraHeaders || {}),
  };

  const startTime = Date.now();

  try {
    const fetchOptions: any = {
      method: method.toUpperCase(),
      headers: requestHeaders,
    };

    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let responseBody: any;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    addRequestHistory({
      environment_id: Number(environmentId),
      method: method.toUpperCase(),
      path,
      status_code: response.status,
      duration_ms: duration,
    });

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      duration_ms: duration,
      url,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    res.status(502).json({
      error: 'SAP sistemine bağlanılamadı',
      message: error.message,
      duration_ms: duration,
      url,
    });
  }
});

export default router;
