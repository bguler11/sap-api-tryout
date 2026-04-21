import { Router, Request, Response } from 'express';
import { getRequestHistory } from '../services/db.service';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  res.json(getRequestHistory(limit));
});

export default router;
