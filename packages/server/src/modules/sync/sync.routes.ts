import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { syncController } from './sync.controller';

const router = Router();
router.use(authenticate);

router.post('/push', requirePermission('sync:manage'), (req, res, next) => syncController.pushSync(req, res, next));
router.get('/status', requirePermission('sync:read'), (req, res, next) => syncController.getSyncStatus(req, res, next));

export default router;
