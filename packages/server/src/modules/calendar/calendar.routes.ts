import { Router } from 'express';
import { calendarController } from './calendar.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/upcoming', authenticate, (req, res, next) =>
  calendarController.getUpcoming(req, res, next)
);

export default router;
