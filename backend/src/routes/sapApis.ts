import { Router, Response } from 'express';
import fetch from 'node-fetch';
import { getEnvironmentApis, getEnvironmentById } from '../services/db.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.post('/check-all', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { environmentId } = req.body;
  if (!environmentId) return res.status(400).json({ error: 'environmentId zorunludur' });

  const env = getEnvironmentById(Number(environmentId), req.user!.id);
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });

  const apis = getEnvironmentApis(Number(environmentId));
  if (apis.length === 0) return res.json({});

  const credentials = Buffer.from(`${env.username}:${env.password}`).toString('base64');
  const baseUrl = env.base_url.replace(/\/$/, '');

  const result: Record<number, { accessible: boolean; status: number }> = {};

  await Promise.all(
    apis.map(async (api) => {
      const testUrl = `${baseUrl}${api.service_url}/$metadata`;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: { Authorization: `Basic ${credentials}`, Accept: 'application/xml' },
          signal: controller.signal,
        });
        clearTimeout(timer);
        const accessible = response.status >= 200 && response.status < 400;
        result[api.id] = { accessible, status: response.status };
      } catch {
        result[api.id] = { accessible: false, status: 0 };
      }
    })
  );

  res.json(result);
});

export default router;
