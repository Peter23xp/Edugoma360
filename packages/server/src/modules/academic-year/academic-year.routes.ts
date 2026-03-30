import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as controller from './academic-year.controller';
import { requireRole } from '../settings/school/school.routes'; // Reusing requirement if exported or abstract it later

const router = Router();

router.use(authenticate);

router.get('/', controller.getAcademicYears);

router.post('/', requireRole(['PREFET', 'SUPER_ADMIN']), controller.createAcademicYear);
router.put('/:id', requireRole(['PREFET', 'SUPER_ADMIN']), controller.updateAcademicYear);
router.post('/:id/close', requireRole(['PREFET', 'SUPER_ADMIN']), controller.closeAcademicYear);
router.post('/:id/activate', requireRole(['PREFET', 'SUPER_ADMIN']), controller.activateAcademicYear);
router.post('/terms/:termId/activate', requireRole(['PREFET', 'SUPER_ADMIN']), controller.activateTerm);

export default router;
