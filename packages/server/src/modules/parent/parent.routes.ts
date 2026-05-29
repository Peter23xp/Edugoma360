import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { parentService } from './parent.service';

const router = Router();

// All routes require authentication + PARENT role
router.use(authenticate);
router.use(requireRole('PARENT'));

/**
 * GET /api/parent/children
 * List all children linked to the authenticated parent
 */
router.get('/children', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const children = await parentService.getChildren(req.user!.userId);
        res.json({ data: children });
    } catch (e) {
        next(e);
    }
});

/**
 * GET /api/parent/children/:studentId/grades
 * Get grades for a specific child, optionally filtered by term
 */
router.get('/children/:studentId/grades', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studentId } = req.params;
        const termId = req.query.termId as string | undefined;
        const data = await parentService.getGrades(req.user!.userId, studentId, termId);
        res.json({ data });
    } catch (e) {
        next(e);
    }
});

/**
 * GET /api/parent/children/:studentId/attendance
 * Get attendance stats and absence list for a specific child
 */
router.get('/children/:studentId/attendance', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studentId } = req.params;
        const termId = req.query.termId as string | undefined;
        const data = await parentService.getAttendance(req.user!.userId, studentId, termId);
        res.json({ data });
    } catch (e) {
        next(e);
    }
});

/**
 * GET /api/parent/children/:studentId/payments
 * Get payment history and unpaid fees for a specific child
 */
router.get('/children/:studentId/payments', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studentId } = req.params;
        const data = await parentService.getPayments(req.user!.userId, studentId);
        res.json({ data });
    } catch (e) {
        next(e);
    }
});

export default router;
