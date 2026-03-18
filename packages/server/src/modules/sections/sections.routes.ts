import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as controller from './sections.controller';
import { requireRole } from '../settings/school/school.routes';

const router = Router();

router.use(authenticate);

// List sections with subjects and classes count
router.get('/', controller.getSections);

// Create new section
router.post('/', requireRole(['PREFET', 'SUPER_ADMIN']), controller.createSection);

// Update section
router.put('/:id', requireRole(['PREFET', 'SUPER_ADMIN']), controller.updateSection);

// Delete section
router.delete('/:id', requireRole(['PREFET', 'SUPER_ADMIN']), controller.deleteSection);

// Manage subjects in a section
router.post('/:id/subjects', requireRole(['PREFET', 'SUPER_ADMIN']), controller.addSubject);
router.put('/:sectionId/subjects/:subjectId', requireRole(['PREFET', 'SUPER_ADMIN']), controller.updateSubject);
router.delete('/:sectionId/subjects/:subjectId', requireRole(['PREFET', 'SUPER_ADMIN']), controller.removeSubject);

export default router;
