import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import {
  getAllEnvironments,
  getEnvironmentById,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from '../services/db.service';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res: Response) => {
  const envs = getAllEnvironments(req.user!.id);
  res.json(envs);
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const env = getEnvironmentById(Number(req.params.id), req.user!.id);
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });
  const { password: _p, ...safeEnv } = env;
  res.json(safeEnv);
});

router.post('/', (req: AuthRequest, res: Response) => {
  const { name, base_url, username, password, description } = req.body;
  if (!name || !base_url || !username || !password) {
    return res.status(400).json({ error: 'name, base_url, username ve password zorunludur' });
  }
  const env = createEnvironment({ user_id: req.user!.id, name, base_url, username, password, description });
  res.status(201).json(env);
});

router.put('/:id', (req: AuthRequest, res: Response) => {
  const { name, base_url, username, password, description } = req.body;
  const env = updateEnvironment(Number(req.params.id), req.user!.id, { name, base_url, username, password, description });
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });
  res.json(env);
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const deleted = deleteEnvironment(Number(req.params.id), req.user!.id);
  if (!deleted) return res.status(404).json({ error: 'Environment bulunamadı' });
  res.status(204).send();
});

export default router;
