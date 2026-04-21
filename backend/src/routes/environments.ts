import { Router, Request, Response } from 'express';
import {
  getAllEnvironments,
  getEnvironmentById,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from '../services/db.service';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const envs = getAllEnvironments();
  res.json(envs);
});

router.get('/:id', (req: Request, res: Response) => {
  const env = getEnvironmentById(Number(req.params.id));
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });
  const { password: _p, ...safeEnv } = env;
  res.json(safeEnv);
});

router.post('/', (req: Request, res: Response) => {
  const { name, base_url, username, password, description } = req.body;
  if (!name || !base_url || !username || !password) {
    return res.status(400).json({ error: 'name, base_url, username ve password zorunludur' });
  }
  const env = createEnvironment({ name, base_url, username, password, description });
  res.status(201).json(env);
});

router.put('/:id', (req: Request, res: Response) => {
  const { name, base_url, username, password, description } = req.body;
  const env = updateEnvironment(Number(req.params.id), { name, base_url, username, password, description });
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });
  res.json(env);
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = deleteEnvironment(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'Environment bulunamadı' });
  res.status(204).send();
});

export default router;
