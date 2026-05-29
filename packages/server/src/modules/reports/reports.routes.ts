import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { reportsController } from './reports.controller';
import { palmaresService } from './palmares.service';
import teacherReportsRoutes from './teachers-reports.routes';

const router = Router();
router.use(authenticate);

// Teacher reports
router.use('/teachers', teacherReportsRoutes);

// Bulletin routes
router.get('/bulletin/:studentId/:termId', requirePermission('reports:bulletins'), (req, res, next) => reportsController.generateBulletin(req, res, next));
router.get('/bulletin/:studentId', requirePermission('reports:bulletins'), (req, res, next) => {
    req.params.termId = req.query.termId as string;
    reportsController.generateBulletin(req, res, next);
});

// Palmares routes
router.get('/palmares/:classId/:termId', requirePermission('reports:palmares'), async (req, res, next) => {
    try {
        const data = await palmaresService.getPalmares(
            req.params.classId,
            req.params.termId,
            req.user!.schoolId
        );
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/palmares/:classId/:termId/pdf', requirePermission('reports:palmares'), async (req, res, next) => {
    try {
        const pdf = await palmaresService.generatePalmaresPdf(
            req.params.classId,
            req.params.termId,
            req.user!.schoolId
        );
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="palmares_${req.params.classId}.pdf"`);
        res.send(pdf);
    } catch (error) {
        next(error);
    }
});

// Receipt route
router.get('/receipt/:paymentId', requirePermission('finance:read'), (req, res, next) => reportsController.generateReceipt(req, res, next));

// Exam national — 6th year admitted students list
router.get('/exam-national', requirePermission('reports:palmares'), async (req, res, next) => {
    try {
        const schoolId = req.user!.schoolId;
        const { classId, academicYearId } = req.query;

        const activeYear = academicYearId
            ? await (await import('../../lib/prisma')).default.academicYear.findUnique({ where: { id: academicYearId as string } })
            : await (await import('../../lib/prisma')).default.academicYear.findFirst({ where: { schoolId, isActive: true } });

        const prisma = (await import('../../lib/prisma')).default;

        const where: any = {
            schoolId,
            isActive: true,
            enrollments: {
                some: {
                    ...(activeYear ? { academicYearId: activeYear.id } : {}),
                    class: {
                        ...(classId ? { id: classId as string } : {}),
                        section: { year: 6 },
                    },
                },
            },
        };

        const students = await prisma.student.findMany({
            where,
            include: {
                enrollments: {
                    orderBy: { enrolledAt: 'desc' },
                    take: 1,
                    include: { class: { select: { name: true } } },
                },
                delibResults: {
                    orderBy: { deliberation: { createdAt: 'desc' } },
                    take: 1,
                    select: { generalAverage: true, rank: true, decision: true },
                },
            },
            orderBy: [{ nom: 'asc' }, { postNom: 'asc' }],
        });

        const mapped = students.map(s => ({
            id: s.id,
            nom: s.nom,
            postNom: s.postNom,
            prenom: s.prenom,
            matricule: s.matricule,
            sexe: s.sexe,
            dateNaissance: s.dateNaissance,
            lieuNaissance: s.lieuNaissance,
            className: s.enrollments[0]?.class?.name || '—',
            generalAverage: s.delibResults[0]?.generalAverage || null,
            rank: s.delibResults[0]?.rank || null,
            decision: s.delibResults[0]?.decision || null,
        }));

        res.json({ students: mapped, total: mapped.length });
    } catch (error) {
        next(error);
    }
});

export default router;
