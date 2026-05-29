import { Router } from 'express';
import { AnnouncementsController } from './announcements.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', AnnouncementsController.list);
router.get('/active', AnnouncementsController.getActive);
router.post('/', AnnouncementsController.create);
router.put('/:id', AnnouncementsController.update);
router.post('/:id/archive', AnnouncementsController.archive);
router.post('/:id/view', AnnouncementsController.recordView);

export { router as announcementsRoutes };
