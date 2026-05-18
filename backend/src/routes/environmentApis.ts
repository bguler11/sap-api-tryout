import { Router, Response } from 'express';
import fetch from 'node-fetch';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import {
  getEnvironmentApis,
  getEnvironmentApiById,
  createEnvironmentApi,
  updateEnvironmentApiSpec,
  updateEnvironmentApiArrangement,
  deleteEnvironmentApi,
  getEnvironmentByIdUnsafe,
  upsertCommScenarioBulk,
} from '../services/db.service';
import { fetchAndParseMetadata } from '../services/metadata.service';
import { ensureArrangement, checkArrangement } from '../services/arrangement.service';
import { searchSapCatalog } from '../services/sapCatalog.service';

const router = Router();
router.use(authMiddleware);

router.get('/catalog-search', async (req: AuthRequest, res: Response) => {
  const q = String(req.query.q || '');
  if (!q || q.length < 2) return res.json([]);
  try {
    const results = await searchSapCatalog(q);
    res.json(results);
  } catch (e: any) {
    res.json([]);
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const environmentId = Number(req.query.environmentId);
  if (!environmentId) return res.status(400).json({ error: 'environmentId zorunludur' });
  res.json(getEnvironmentApis(environmentId));
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { environmentId, name, description, serviceName } = req.body;
  if (!environmentId || !name || !serviceName) {
    return res.status(400).json({ error: 'environmentId, name ve serviceName zorunludur' });
  }

  const env = getEnvironmentByIdUnsafe(Number(environmentId));
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });

  let specJson: string;
  let serviceUrl: string;
  let protocol: string;

  try {
    const parsed = await fetchAndParseMetadata(serviceName);
    specJson = JSON.stringify(parsed.openapi);
    serviceUrl = parsed.serviceUrl;
    protocol = parsed.protocol;
  } catch (e: any) {
    const msg: string = e.message || '';
    let hint = msg;
    if (msg.includes('404')) hint = `Servis bulunamadı: "${serviceName}" — servis adını kontrol edin.`;
    else if (msg.includes('Catalog')) hint = `"${serviceName}" SAP Catalog'da kayıtlı değil.`;
    else if (msg.includes('abort') || msg.includes('timeout')) hint = `SAP Catalog'a bağlanılamadı (timeout). İnternet bağlantısını kontrol edin.`;
    return res.status(422).json({ error: hint });
  }

  if (protocol !== 'SOAP') {
    try {
      const plainPassword = env.password;
      const testUrl = `${env.base_url.replace(/\/$/, '')}${serviceUrl}/$metadata`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      let tenantRes: any;
      try {
        tenantRes = await fetch(testUrl, {
          signal: controller.signal,
          headers: {
            Authorization: 'Basic ' + Buffer.from(`${env.username}:${plainPassword}`).toString('base64'),
            Accept: 'application/xml',
          },
        });
      } finally {
        clearTimeout(timer);
      }
      if (!tenantRes.ok) {
        return res.status(400).json({
          error: `SAP sistemine erişilemiyor: HTTP ${tenantRes.status} — ${testUrl}`,
        });
      }
    } catch (e: any) {
      const msg: string = e.message || '';
      if (msg.includes('abort')) {
        return res.status(400).json({ error: `SAP sistemine bağlanılamadı (timeout). Base URL'i ve ağ bağlantısını kontrol edin.` });
      }
      return res.status(400).json({ error: `SAP sistemine erişilemiyor: ${msg}` });
    }
  }

  let api;
  try {
    api = createEnvironmentApi({
      environment_id: Number(environmentId),
      name,
      description: description || '',
      service_name: serviceName,
      service_url: serviceUrl,
      protocol,
      arrangement_status: 'pending',
    });
  } catch (e: any) {
    return res.status(409).json({ error: e.message });
  }

  updateEnvironmentApiSpec(api.id, specJson);

  const check = await checkArrangement(env.base_url, env.username, env.password, serviceName);
  if (check.checkable && check.exists) {
    updateEnvironmentApiArrangement(api.id, 'ok');
  }

  res.status(201).json({
    api: getEnvironmentApiById(api.id),
    arrangementMessage: !check.checkable
      ? null
      : check.exists
        ? `Arrangement mevcut (${check.scenarioId})`
        : check.noMapping
          ? `Bu API için scenario mapping bulunamadı. CommScenario sayfasından manuel ekleyin.`
          : `Bu API için ${check.scenarioId} scenariosu ile Communication Arrangement kurulması gerekiyor.`,
  });
});

router.get('/:id/spec', async (req: AuthRequest, res: Response) => {
  const api = getEnvironmentApiById(Number(req.params.id));
  if (!api) return res.status(404).json({ error: 'API bulunamadı' });
  if (!api.spec_cache) return res.status(404).json({ error: 'Spec henüz yüklenmedi' });
  res.json(JSON.parse(api.spec_cache));
});

router.post('/:id/spec', async (req: AuthRequest, res: Response) => {
  const api = getEnvironmentApiById(Number(req.params.id));
  if (!api) return res.status(404).json({ error: 'API bulunamadı' });

  const spec = req.body;
  if (!spec || typeof spec !== 'object') {
    return res.status(400).json({ error: 'Geçerli bir OpenAPI JSON objesi gönderin' });
  }

  let commScenario: string | null = spec['x-sap-comm-scenario'] || null;

  if (!commScenario) {
    const extOverview: any[] = spec['x-sap-ext-overview'] || [];
    for (const entry of extOverview) {
      if (entry.name === 'Communication Scenario' && Array.isArray(entry.values)) {
        for (const v of entry.values) {
          const match = String(v.text || '').match(/\(([A-Z0-9_]+)\)\s*$/);
          if (match) { commScenario = match[1]; break; }
        }
      }
      if (commScenario) break;
    }
  }

  if (!commScenario) {
    try {
      const { getApiDetail } = await import('../services/sapCatalog.service');
      const detail = await getApiDetail(api.service_name);
      if (detail.communicationScenario) commScenario = detail.communicationScenario;
    } catch {
      // catalog erişilemezse devam et
    }
  }

  if (commScenario) {
    spec['x-sap-comm-scenario'] = commScenario;
  }

  try {
    updateEnvironmentApiSpec(api.id, JSON.stringify(spec));
  } catch (e: any) {
    return res.status(500).json({ error: `Spec kaydedilemedi: ${e.message}` });
  }

  if (commScenario) {
    upsertCommScenarioBulk([{ service_name: api.service_name, scenario_id: commScenario }]);
  }

  res.json({ ok: true, id: api.id, commScenario });
});

router.post('/:id/refresh', async (req: AuthRequest, res: Response) => {
  const api = getEnvironmentApiById(Number(req.params.id));
  if (!api) return res.status(404).json({ error: 'API bulunamadı' });

  const env = getEnvironmentByIdUnsafe(api.environment_id);
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });

  let parsedOpenapi: any;
  try {
    const parsed = await fetchAndParseMetadata(api.service_name, api.spec_cache || undefined);
    parsedOpenapi = parsed.openapi;
    updateEnvironmentApiSpec(api.id, JSON.stringify(parsedOpenapi));
  } catch (e: any) {
    return res.status(422).json({ error: `Spec yenilenemedi: ${e.message}` });
  }

  const commScenario: string | undefined = parsedOpenapi?.['x-sap-comm-scenario'];
  if (commScenario && typeof commScenario === 'string') {
    upsertCommScenarioBulk([{ service_name: api.service_name, scenario_id: commScenario }]);
  }

  const check = await checkArrangement(env.base_url, env.username, env.password, api.service_name);
  if (check.checkable) {
    updateEnvironmentApiArrangement(api.id, check.exists ? 'ok' : 'pending');
  }

  res.json(getEnvironmentApiById(api.id));
});

router.post('/check-arrangements', async (req: AuthRequest, res: Response) => {
  const { environmentId } = req.body;
  if (!environmentId) return res.status(400).json({ error: 'environmentId zorunludur' });

  const env = getEnvironmentByIdUnsafe(Number(environmentId));
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });

  const apiList = getEnvironmentApis(Number(environmentId));
  if (apiList.length === 0) return res.json({});

  const results = await Promise.all(
    apiList.map(async api => {
      const check = await checkArrangement(env.base_url, env.username, env.password, api.service_name);
      if (!check.checkable) {
        return { id: api.id, exists: false, checkable: false, noMapping: check.noMapping, scenarioId: check.scenarioId, status: api.arrangement_status };
      }
      const newStatus = check.exists ? 'ok' : 'pending';
      if (api.arrangement_status !== newStatus) {
        updateEnvironmentApiArrangement(api.id, newStatus);
      }
      return { id: api.id, exists: check.exists, checkable: true, noMapping: check.noMapping, scenarioId: check.scenarioId, status: newStatus };
    })
  );

  const map: Record<number, { exists: boolean; checkable: boolean; noMapping: boolean; scenarioId: string; status: string }> = {};
  for (const r of results) map[r.id] = { exists: r.exists, checkable: r.checkable, noMapping: r.noMapping, scenarioId: r.scenarioId, status: r.status };

  res.json(map);
});

router.post('/:id/arrange', async (req: AuthRequest, res: Response) => {
  const api = getEnvironmentApiById(Number(req.params.id));
  if (!api) return res.status(404).json({ error: 'API bulunamadı' });

  const env = getEnvironmentByIdUnsafe(api.environment_id);
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });

  const result = await ensureArrangement(env.base_url, env.username, env.password, api.service_name);
  updateEnvironmentApiArrangement(api.id, result.status);

  res.json({ status: result.status, message: result.message });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const deleted = deleteEnvironmentApi(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'API bulunamadı' });
  res.status(204).send();
});

export default router;
