import { Router } from 'express';
import { feesController } from './fees.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

// GET /api/fees — List all fees with stats
router.get('/', requirePermission('finance:read'), (req, res, next) =>
  feesController.getFees(req, res, next)
);

// POST /api/fees — Create a new fee
router.post('/', requirePermission('finance:create'), (req, res, next) =>
  feesController.createFee(req, res, next)
);

// POST /api/fees/template — Create fees from a template
router.post('/template', requirePermission('finance:create'), (req, res, next) =>
  feesController.createFromTemplate(req, res, next)
);

// GET /api/fees/student/:studentId — Calculate student fees
router.get('/student/:studentId', requirePermission('finance:read'), (req, res, next) =>
  feesController.calculateStudentFees(req, res, next)
);

// PUT /api/fees/:id — Update a fee
router.put('/:id', requirePermission('finance:create'), (req, res, next) =>
  feesController.updateFee(req, res, next)
);

// PUT /api/fees/:id/archive — Archive a fee (soft delete)
router.put('/:id/archive', requirePermission('finance:create'), (req, res, next) =>
  feesController.archiveFee(req, res, next)
);

// DELETE /api/fees/:id — Delete a fee (only if no payments)
router.delete('/:id', requirePermission('finance:create'), (req, res, next) =>
  feesController.deleteFee(req, res, next)
);

export default router;
