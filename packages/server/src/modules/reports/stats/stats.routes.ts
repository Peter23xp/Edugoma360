import { Router } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import { StatsService } from './stats.service';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || '';
    const { tab = 'presence', academicYearId } = req.query as any;
    const data = await StatsService.getStats(schoolId, tab, academicYearId);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export { router as statsRoutes };
