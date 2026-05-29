import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { libraryService } from './library.service';

const router = Router();
router.use(authenticate);

router.get('/', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const { matiere, niveau, disponible, search } = req.query;
    const data = await libraryService.getBooks(schoolId, {
      matiere: matiere as string,
      niveau: niveau as string,
      disponible: disponible as string,
      search: search as string,
    });
    res.json(data);
  } catch (e) { next(e); }
});

router.post('/', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const book = await libraryService.createBook(schoolId, req.body);
    res.status(201).json({ book });
  } catch (e) { next(e); }
});

router.put('/:id', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const book = await libraryService.updateBook(schoolId, req.params.id, req.body);
    res.json({ book });
  } catch (e) { next(e); }
});

router.post('/:id/loan', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    const userId = req.user?.id;
    if (!schoolId || !userId) return res.status(401).json({ error: 'Non autorisé' });
    const loan = await libraryService.createLoan(schoolId, req.params.id, userId, req.body);
    res.status(201).json({ loan });
  } catch (e) { next(e); }
});

router.get('/loans', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const { status, bookId, studentId } = req.query;
    const loans = await libraryService.getLoans(schoolId, {
      status: status as string,
      bookId: bookId as string,
      studentId: studentId as string,
    });
    res.json({ loans });
  } catch (e) { next(e); }
});

router.get('/loans/overdue', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const loans = await libraryService.getOverdueLoans(schoolId);
    res.json({ loans });
  } catch (e) { next(e); }
});

router.post('/loans/:id/return', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const loan = await libraryService.returnLoan(schoolId, req.params.id, req.body);
    res.json({ loan });
  } catch (e) { next(e); }
});

export default router;
