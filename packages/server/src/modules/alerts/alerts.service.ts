import prisma from '../../lib/prisma';

export class AlertsService {
  async getAlerts(schoolId: string, status?: string) {
    const alerts: any[] = [];

    // 1. Élèves avec paiements en retard > 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });

    if (activeYear) {
      const studentsWithDebts = await prisma.student.findMany({
        where: {
          schoolId,
          isActive: true,
          payments: {
            none: {
              academicYearId: activeYear.id,
              paidAt: { gte: thirtyDaysAgo },
            },
          },
        },
        take: 5,
      });

      studentsWithDebts.forEach((student) => {
        alerts.push({
          id: `debt-${student.id}`,
          type: 'warning',
          message: `${student.nom} ${student.postNom} : Aucun paiement depuis 30 jours`,
          href: `/students/${student.id}`,
          createdAt: new Date().toISOString(),
        });
      });
    }

    // 2. Classes avec appel non fait aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const classes = await prisma.class.findMany({
      where: { schoolId, isActive: true },
      include: {
        attendances: {
          where: { date: today },
          take: 1,
        },
      },
    });

    classes.forEach((cls) => {
      if (cls.attendances.length === 0) {
        alerts.push({
          id: `attendance-${cls.id}`,
          type: 'warning',
          message: `Classe ${cls.name} : Appel non fait aujourd'hui`,
          href: `/attendance/daily?classId=${cls.id}`,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // 3. Notes manquantes (exemple simplifié)
    const activeTerm = await prisma.term.findFirst({
      where: {
        academicYear: { schoolId, isActive: true },
        isActive: true,
      },
    });

    if (activeTerm) {
      // Vérifier s'il y a des classes sans notes pour ce trimestre
      const classesWithoutGrades = await prisma.class.findMany({
        where: {
          schoolId,
          isActive: true,
          enrollments: {
            some: {
              student: {
                grades: {
                  none: {
                    termId: activeTerm.id,
                  },
                },
              },
            },
          },
        },
        take: 3,
      });

      classesWithoutGrades.forEach((cls) => {
        alerts.push({
          id: `grades-${cls.id}`,
          type: 'error',
          message: `Classe ${cls.name} : Notes manquantes pour le trimestre actif`,
          href: `/grades?classId=${cls.id}`,
          createdAt: new Date().toISOString(),
        });
      });
    }

    return {
      alerts: alerts.slice(0, 10), // Limiter à 10 alertes
      total: alerts.length,
    };
  }
}

export const alertsService = new AlertsService();
