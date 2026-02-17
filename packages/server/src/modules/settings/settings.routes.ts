import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { settingsController } from './settings.controller';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('settings:read'), (req, res, next) => settingsController.getAll(req, res, next));
router.put('/:key', requirePermission('settings:update'), (req, res, next) => settingsController.updateSetting(req, res, next));

// Academic Year management
router.get('/academic-years', requirePermission('settings:read'), (req, res, next) => settingsController.getAcademicYears(req, res, next));
router.post('/academic-years', requirePermission('settings:academic_year'), (req, res, next) => settingsController.createAcademicYear(req, res, next));

// Classes management
router.get('/classes', requirePermission('settings:read'), (req, res, next) => settingsController.getClasses(req, res, next));

// Subjects management
router.get('/subjects', requirePermission('settings:read'), (req, res, next) => settingsController.getSubjects(req, res, next));

export default router;
