import { Router, Request, Response } from 'express';
import {
  getAllCommScenarios,
  upsertCommScenarioBulk,
  deleteCommScenario,
} from '../services/db.service';
import { getCatalogTitleMap } from '../services/sapCatalog.service';
import { SCENARIO_DESCRIPTIONS } from '../services/scenarioDescriptions';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const entries = getAllCommScenarios();
  const titleMap = getCatalogTitleMap();
  const result = entries.map(e => ({
    service_name: e.service_name,
    scenario_id: e.scenario_id,
    updated_at: e.updated_at,
    api_title: titleMap.get(e.service_name.toUpperCase()) ?? null,
    scenario_description: SCENARIO_DESCRIPTIONS[e.scenario_id.toUpperCase()] ?? null,
  }));
  res.json(result);
});

router.post('/bulk', (req: Request, res: Response) => {
  const entries: { service_name: string; scenario_id: string }[] = req.body;
  if (!Array.isArray(entries)) {
    return res.status(400).json({ error: 'Array bekleniyor' });
  }
  for (const e of entries) {
    if (!e.service_name || !e.scenario_id) {
      return res.status(400).json({ error: 'Her kayıtta service_name ve scenario_id zorunlu' });
    }
  }
  upsertCommScenarioBulk(entries);
  res.json({ ok: true, count: entries.length });
});

router.delete('/:serviceName', (req: Request, res: Response) => {
  const deleted = deleteCommScenario(req.params.serviceName);
  if (!deleted) return res.status(404).json({ error: 'Kayıt bulunamadı' });
  res.status(204).send();
});

export default router;
