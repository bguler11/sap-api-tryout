import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import {
  getUserVariants,
  createUserVariant,
  deleteUserVariant,
  getGlobalVariants,
  createGlobalVariant,
  deleteGlobalVariant,
  getEnvironmentById,
} from '../services/db.service';

const router = Router();
router.use(authMiddleware);

router.get('/', (req: AuthRequest, res: Response) => {
  const { environmentId, apiId, method, path } = req.query as Record<string, string>;
  if (!environmentId || !apiId || !method || !path) {
    return res.status(400).json({ error: 'environmentId, apiId, method ve path zorunludur' });
  }

  const userVariants = getUserVariants(req.user!.id, apiId, method, path);
  const globalVariants = getGlobalVariants(Number(environmentId), apiId, method, path);

  res.json({ user: userVariants, global: globalVariants });
});

router.post('/user', (req: AuthRequest, res: Response) => {
  const { api_id, method, path, name, params } = req.body;
  if (!api_id || !method || !path || !name || !params) {
    return res.status(400).json({ error: 'api_id, method, path, name ve params zorunludur' });
  }
  const variant = createUserVariant({ user_id: req.user!.id, api_id, method, path, name, params });
  res.status(201).json(variant);
});

router.delete('/user/:id', (req: AuthRequest, res: Response) => {
  const deleted = deleteUserVariant(Number(req.params.id), req.user!.id);
  if (!deleted) return res.status(404).json({ error: 'Varyant bulunamadı' });
  res.status(204).send();
});

router.post('/global', (req: AuthRequest, res: Response) => {
  const { environment_id, api_id, method, path, name, params } = req.body;
  if (!environment_id || !api_id || !method || !path || !name || !params) {
    return res.status(400).json({ error: 'environment_id, api_id, method, path, name ve params zorunludur' });
  }
  const env = getEnvironmentById(Number(environment_id), req.user!.id);
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı veya erişim yetkiniz yok' });

  const variant = createGlobalVariant({
    environment_id: Number(environment_id),
    created_by: req.user!.id,
    api_id,
    method,
    path,
    name,
    params,
  });
  res.status(201).json(variant);
});

router.delete('/global/:id', (req: AuthRequest, res: Response) => {
  const deleted = deleteGlobalVariant(Number(req.params.id), req.user!.id);
  if (!deleted) return res.status(404).json({ error: 'Varyant bulunamadı veya sadece oluşturan kişi silebilir' });
  res.status(204).send();
});

export default router;
