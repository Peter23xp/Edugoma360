import { Router } from 'express';
import { absencesController } from './absences.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/absences/stats - Dashboard stats (admins only)
router.get(
    '/stats',
    requirePermission('teachers:read'),
    (req, res) => absencesController.getStats(req, res)
);

// GET /api/absences/my-balance - Leave balance for the connected teacher
router.get(
    '/my-balance',
    (req, res) => absencesController.getMyBalance(req, res)
);

// GET /api/absences - List all leave requests (filtered)
router.get(
    '/',
    requirePermission('teachers:read'),
    (req, res) => absencesController.getRequests(req, res)
);

// POST /api/absences - Create a leave request
router.post(
    '/',
    (req, res) => absencesController.createRequest(req, res)
);

// PUT /api/absences/:id/approve - Approve a request
router.put(
    '/:id/approve',
    requirePermission('teachers:update'),
    (req, res) => {
        req.body = { status: 'APPROVED', ...req.body };
        absencesController.updateStatus(req, res);
    }
);

// PUT /api/absences/:id/reject - Reject a request
router.put(
    '/:id/reject',
    requirePermission('teachers:update'),
    (req, res) => {
        req.body = { status: 'REJECTED', ...req.body };
        absencesController.updateStatus(req, res);
    }
);

// PATCH /api/absences/:id/status - Generic status update
router.patch(
    '/:id/status',
    requirePermission('teachers:update'),
    (req, res) => absencesController.updateStatus(req, res)
);

// DELETE /api/absences/:id - Cancel (if pending)
router.delete(
    '/:id',
    (req, res) => {
        req.body = { status: 'CANCELLED' };
        absencesController.updateStatus(req, res);
    }
);

export default router;
