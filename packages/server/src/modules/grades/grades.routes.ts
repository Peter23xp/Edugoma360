import { Router } from 'express';
import { gradesController } from './grades.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('grades:read'), (req, res, next) => gradesController.getGrades(req, res, next));
router.post('/', requirePermission('grades:create'), (req, res, next) => gradesController.createGrade(req, res, next));
router.post('/batch', requirePermission('grades:create'), (req, res, next) => gradesController.batchSaveGrades(req, res, next));
router.get('/averages/:classId/:termId', requirePermission('grades:read'), (req, res, next) => gradesController.calculateAverages(req, res, next));
router.post('/lock/:classId/:termId', requirePermission('grades:lock'), (req, res, next) => gradesController.lockGrades(req, res, next));

export default router;
