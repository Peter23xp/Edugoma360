import { Router } from 'express';
import { ConvocationsController } from './convocations.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', ConvocationsController.list);
router.post('/', ConvocationsController.create);
router.put('/:id/status', ConvocationsController.updateStatus);
router.get('/search-students', ConvocationsController.searchStudents);

export { router as convocationsRoutes };
