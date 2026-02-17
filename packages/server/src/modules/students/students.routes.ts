import { Router } from 'express';
import { studentsController } from './students.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('students:read'), (req, res, next) => studentsController.getStudents(req, res, next));
router.get('/:id', requirePermission('students:read'), (req, res, next) => studentsController.getStudentById(req, res, next));
router.post('/', requirePermission('students:create'), (req, res, next) => studentsController.createStudent(req, res, next));
router.put('/:id', requirePermission('students:update'), (req, res, next) => studentsController.updateStudent(req, res, next));
router.delete('/:id', requirePermission('students:delete'), (req, res, next) => studentsController.archiveStudent(req, res, next));

export default router;
