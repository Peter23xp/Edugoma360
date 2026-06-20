import { Router } from 'express';
import { superAdminGuard } from '../superadmin/superadmin.guard';
import { listAuditLogs, getRecentLogs, getAuditStats } from './audit.controller';

const router = Router();
router.use(superAdminGuard);

router.get('/',        listAuditLogs);
router.get('/recent',  getRecentLogs);
router.get('/stats',   getAuditStats);

export default router;
