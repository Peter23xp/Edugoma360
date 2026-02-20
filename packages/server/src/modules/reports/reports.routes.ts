import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { reportsController } from './reports.controller';
import { palmaresService } from './palmares.service';

const router = Router();
router.use(authenticate);

// Bulletin routes
router.get('/bulletin/:studentId/:termId', requirePermission('reports:bulletins'), (req, res, next) => reportsController.generateBulletin(req, res, next));
router.get('/bulletin/:studentId', requirePermission('reports:bulletins'), (req, res, next) => {
    req.params.termId = req.query.termId as string;
    reportsController.generateBulletin(req, res, next);
});

// Palmares routes
router.get('/palmares/:classId/:termId', requirePermission('reports:palmares'), async (req, res, next) => {
    try {
        const data = await palmaresService.getPalmares(
            req.params.classId,
            req.params.termId,
            req.user!.schoolId
        );
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/palmares/:classId/:termId/pdf', requirePermission('reports:palmares'), async (req, res, next) => {
    try {
        const pdf = await palmaresService.generatePalmaresPdf(
            req.params.classId,
            req.params.termId,
            req.user!.schoolId
        );
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="palmares_${req.params.classId}.pdf"`);
        res.send(pdf);
    } catch (error) {
        next(error);
    }
});

// Receipt route
router.get('/receipt/:paymentId', requirePermission('finance:read'), (req, res, next) => reportsController.generateReceipt(req, res, next));

export default router;
