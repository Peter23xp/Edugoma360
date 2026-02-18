import { Router } from 'express';
import { statsController } from './stats.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/enrollment', authenticate, (req, res, next) =>
  statsController.getEnrollment(req, res, next)
);

router.get('/class-averages', authenticate, (req, res, next) =>
  statsController.getClassAverages(req, res, next)
);

export default router;
