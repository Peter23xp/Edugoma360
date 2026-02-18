import { Router } from 'express';
import multer from 'multer';
import { studentsController } from './students.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowed = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv'));
        }
    },
});

router.use(authenticate);

// List & search
router.get('/', requirePermission('students:read'), (req, res, next) => studentsController.getStudents(req, res, next));

// Export to Excel
router.get('/export', requirePermission('students:read'), (req, res, next) => studentsController.exportStudents(req, res, next));

// Import template
router.get('/import-template', requirePermission('students:read'), (req, res, next) => studentsController.getImportTemplate(req, res, next));

// Import from Excel
router.post('/import', requirePermission('students:create'), upload.single('file'), (req, res, next) => studentsController.importStudents(req, res, next));

// Batch archive
router.patch('/batch-archive', requirePermission('students:delete'), (req, res, next) => studentsController.batchArchive(req, res, next));

// Single student CRUD
router.get('/:id', requirePermission('students:read'), (req, res, next) => studentsController.getStudentById(req, res, next));
router.post('/', requirePermission('students:create'), (req, res, next) => studentsController.createStudent(req, res, next));
router.put('/:id', requirePermission('students:update'), (req, res, next) => studentsController.updateStudent(req, res, next));
router.delete('/:id', requirePermission('students:delete'), (req, res, next) => studentsController.archiveStudent(req, res, next));

// Student detail routes
router.get('/:id/academic-history', requirePermission('students:read'), (req, res, next) => studentsController.getAcademicHistory(req, res, next));
router.get('/:id/attestation', requirePermission('students:read'), (req, res, next) => studentsController.generateAttestation(req, res, next));
router.get('/:id/card', requirePermission('students:read'), (req, res, next) => studentsController.generateStudentCard(req, res, next));

export default router;
