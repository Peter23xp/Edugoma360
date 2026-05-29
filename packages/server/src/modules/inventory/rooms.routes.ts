import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { roomsService } from './rooms.service';

const router = Router();
router.use(authenticate);

router.get('/', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const { type, status } = req.query;
    const data = await roomsService.getRooms(schoolId, { type: type as string, status: status as string });
    res.json(data);
  } catch (e) { next(e); }
});

router.get('/occupancy', requireRole('SUPER_ADMIN', 'PREFET'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const data = await roomsService.getOccupancy(schoolId);
    res.json({ occupancy: data });
  } catch (e) { next(e); }
});

router.post('/', requireRole('SUPER_ADMIN', 'PREFET'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const room = await roomsService.createRoom(schoolId, req.body);
    res.status(201).json({ room });
  } catch (e) { next(e); }
});

router.put('/:id', requireRole('SUPER_ADMIN', 'PREFET'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const room = await roomsService.updateRoom(schoolId, req.params.id, req.body);
    res.json({ room });
  } catch (e) { next(e); }
});

router.delete('/:id', requireRole('SUPER_ADMIN', 'PREFET'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    await roomsService.deleteRoom(schoolId, req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
