import { Router } from 'express';
import { alertsController } from './alerts.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, (req, res, next) =>
  alertsController.getAlerts(req, res, next)
);

export default router;
