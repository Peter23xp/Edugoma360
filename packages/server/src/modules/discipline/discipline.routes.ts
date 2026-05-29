import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import prisma from '../../lib/prisma';

const router = Router();
router.use(authenticate);

router.get('/', requireRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const { status, search } = req.query;

    const records = await prisma.disciplineRecord.findMany({
      where: {
        student: { schoolId },
        ...(status ? { status: status as string } : {}),
        ...(search ? { student: { schoolId, OR: [{ nom: { contains: search as string } }, { postNom: { contains: search as string } }] } } : {}),
      },
      include: {
        student: {
          select: {
            nom: true, postNom: true, prenom: true, matricule: true,
            enrollments: { take: 1, orderBy: { enrolledAt: 'desc' }, include: { class: { select: { name: true } } } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const stats = {
      total: records.length,
      open: records.filter(r => r.status === 'OPEN').length,
      resolved: records.filter(r => r.status === 'RESOLVED').length,
    };

    res.json({ records, stats });
  } catch (e) { next(e); }
});

router.post('/', requireRole('SUPER_ADMIN', 'PREFET'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const { studentId, description, witnesses, sanction, date } = req.body;

    const student = await prisma.student.findFirst({ where: { id: studentId, schoolId } });
    if (!student) return res.status(404).json({ error: 'Élève non trouvé' });

    const record = await prisma.disciplineRecord.create({
      data: { studentId, description, witnesses, sanction, date: new Date(date), status: 'OPEN' },
      include: { student: { select: { nom: true, postNom: true, matricule: true } } },
    });

    res.status(201).json({ record });
  } catch (e) { next(e); }
});

router.put('/:id/resolve', requireRole('SUPER_ADMIN', 'PREFET'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) return res.status(401).json({ error: 'Non autorisé' });
    const { resolution } = req.body;

    const record = await prisma.disciplineRecord.findFirst({
      where: { id: req.params.id, student: { schoolId } },
    });
    if (!record) return res.status(404).json({ error: 'Dossier non trouvé' });

    const updated = await prisma.disciplineRecord.update({
      where: { id: req.params.id },
      data: { status: 'RESOLVED', resolution },
      include: { student: { select: { nom: true, postNom: true } } },
    });

    res.json({ record: updated });
  } catch (e) { next(e); }
});

export default router;
