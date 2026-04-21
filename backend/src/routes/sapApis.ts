import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import { getApiList, getApiSpec } from '../services/sapApiHub.service';
import { getEnvironmentById } from '../services/db.service';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(getApiList());
});

router.get('/:apiId/spec', (req: Request, res: Response) => {
  const spec = getApiSpec(req.params.apiId);
  if (!spec) return res.status(404).json({ error: 'API spec bulunamadı' });
  res.json(spec);
});

router.post('/:apiId/check', async (req: Request, res: Response) => {
  const { environmentId } = req.body;
  if (!environmentId) return res.status(400).json({ error: 'environmentId zorunludur' });

  const apis = getApiList();
  const api = apis.find(a => a.id === req.params.apiId);
  if (!api) return res.status(404).json({ error: 'API bulunamadı' });

  const env = getEnvironmentById(Number(environmentId));
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });

  const credentials = Buffer.from(`${env.username}:${env.password}`).toString('base64');
  const url = `${env.base_url.replace(/\/$/, '')}${api.testPath}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    });

    const accessible = response.status < 400;
    res.json({
      accessible,
      status: response.status,
      communicationScenario: api.communicationScenario,
    });
  } catch {
    res.json({ accessible: false, status: 0, communicationScenario: api.communicationScenario });
  }
});

export default router;
