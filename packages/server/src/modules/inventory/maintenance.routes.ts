import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { uploadPhoto } from '../../middleware/upload.middleware';
import { maintenanceService } from './maintenance.service';
import path from 'path';
import fs from 'fs/promises';

const router = Router();
router.use(authenticate);

router.get('/', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const { status, urgency, roomId } = req.query;
    const data = await maintenanceService.getRequests(schoolId, {
      status: status as string,
      urgency: urgency as string,
      roomId: roomId as string,
    });
    res.json(data);
  } catch (e) { next(e); }
});

router.get('/costs', requireRole('SUPER_ADMIN', 'PREFET'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const data = await maintenanceService.getCostSummary(schoolId, year, month);
    res.json(data);
  } catch (e) { next(e); }
});

router.get('/:id', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const request = await maintenanceService.getRequest(schoolId, req.params.id);
    res.json({ request });
  } catch (e) { next(e); }
});

router.post('/', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), uploadPhoto.single('photo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    const userId = req.user?.id;
    if (!schoolId || !userId) return res.status(401).json({ error: 'Non autorisé' });

    let photoUrl: string | undefined;
    if (req.file) {
      const uploadDir = path.resolve(process.cwd(), 'uploads', 'maintenance');
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      await fs.writeFile(path.join(uploadDir, filename), req.file.buffer);
      photoUrl = `/uploads/maintenance/${filename}`;
    }

    const data = { ...req.body, photoUrl };
    if (data.estimatedCost) data.estimatedCost = parseFloat(data.estimatedCost);
    const request = await maintenanceService.createRequest(schoolId, userId, data);
    res.status(201).json({ request });
  } catch (e) { next(e); }
});

router.put('/:id/status', requireRole('SUPER_ADMIN', 'PREFET'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const request = await maintenanceService.updateStatus(schoolId, req.params.id, req.body);
    res.json({ request });
  } catch (e) { next(e); }
});

export default router;
