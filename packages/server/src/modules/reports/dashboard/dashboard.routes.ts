import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', DashboardController.get);
export { router as dashboardRoutes };
