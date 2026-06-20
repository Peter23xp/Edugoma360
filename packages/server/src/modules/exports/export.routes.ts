import { Router } from 'express';
import { superAdminGuard } from '../superadmin/superadmin.guard';
import {
    exportSchoolsExcel,
    exportSubscriptionsExcel,
    exportSmsExcel,
    exportFinancialPDF,
    exportSchoolPDF,
} from './export.controller';

const router = Router();
router.use(superAdminGuard);

router.get('/schools',                exportSchoolsExcel);
router.get('/subscriptions',          exportSubscriptionsExcel);
router.get('/sms',                    exportSmsExcel);
router.get('/financial',              exportFinancialPDF);
router.get('/school/:id',             exportSchoolPDF);

export default router;
