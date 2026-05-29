import { Router } from 'express';
import { ExportsController } from './exports.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.post('/quick', ExportsController.quickExport);
router.get('/history', ExportsController.getHistory);
router.get('/schedules', ExportsController.getSchedules);
router.post('/schedules', ExportsController.createSchedule);
router.delete('/schedules/:id', ExportsController.deleteSchedule);
export { router as exportsRoutes };
