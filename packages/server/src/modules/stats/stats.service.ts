import prisma from '../../lib/prisma';

export class StatsService {
  /**
   * Get enrollment statistics
   */
  async getEnrollment(schoolId: string, academicYearId?: string) {
    const whereClause: any = {
      schoolId,
      isActive: true,
    };

    // Get active academic year if not provided
    if (!academicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { schoolId, isActive: true },
      });
      academicYearId = activeYear?.id;
    }

    // Count total students
    const total = await prisma.student.count({ where: whereClause });

    // Count by section (via enrollments)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        academicYearId,
        student: { schoolId, isActive: true },
      },
      include: {
        class: {
          include: {
            section: true,
          },
        },
      },
    });

    const bySection: Record<string, number> = {};
    enrollments.forEach((enrollment) => {
      const sectionName = enrollment.class.section.name;
      bySection[sectionName] = (bySection[sectionName] || 0) + 1;
    });

    return { total, bySection };
  }

  /**
   * Get class averages for current term
   */
  async getClassAverages(schoolId: string) {
    // Get active term
    const activeTerm = await prisma.term.findFirst({
      where: {
        academicYear: { schoolId, isActive: true },
        isActive: true,
      },
    });

    if (!activeTerm) {
      return { averages: [] };
    }

    // Get all classes
    const classes = await prisma.class.findMany({
      where: { schoolId, isActive: true },
      include: {
        enrollments: {
          where: {
            academicYear: { isActive: true },
          },
          include: {
            student: true,
          },
        },
      },
    });

    const averages = await Promise.all(
      classes.map(async (cls) => {
        const studentIds = cls.enrollments.map((e) => e.studentId);

        if (studentIds.length === 0) {
          return {
            classId: cls.id,
            className: cls.name,
            average: 0,
            studentCount: 0,
          };
        }

        // Calculate average for this class
        const grades = await prisma.grade.findMany({
          where: {
            studentId: { in: studentIds },
            termId: activeTerm.id,
          },
        });

        if (grades.length === 0) {
          return {
            classId: cls.id,
            className: cls.name,
            average: 0,
            studentCount: studentIds.length,
          };
        }

        const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
        const average = totalScore / grades.length;

        return {
          classId: cls.id,
          className: cls.name,
          average: Math.round(average * 10) / 10,
          studentCount: studentIds.length,
        };
      })
    );

    return { averages: averages.filter((a) => a.studentCount > 0) };
  }

  async getDashboardSummary(schoolId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const activeYear = await prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
      include: { terms: { where: { isActive: true }, take: 1 } },
    });
    const activeTerm = activeYear?.terms[0] ?? null;

    const [
      totalStudents,
      activeClasses,
      activeTeachers,
      presentToday,
      absencesTodayRaw,
      classesDoneToday,
      weekAttendanceRaw,
      gradesCount,
      totalEnrollments,
      feeTypes,
      monthPayments,
      allPaymentBalances,
      recentPaymentsRaw,
      cashSessionRaw,
      openAlerts,
      openConvocations,
      calendarEvents,
      enrollmentsBySection,
    ] = await Promise.all([
      prisma.student.count({ where: { schoolId, isActive: true } }),
      prisma.class.count({ where: { schoolId, isActive: true } }),
      prisma.teacher.count({ where: { schoolId, isActive: true } }),
      prisma.attendance.count({
        where: { student: { schoolId }, date: today, status: 'PRESENT' },
      }),
      prisma.attendance.findMany({
        where: { student: { schoolId }, date: today, status: 'ABSENT' },
        include: {
          student: {
            select: {
              id: true, nom: true, postNom: true,
              enrollments: {
                take: 1, orderBy: { enrolledAt: 'desc' },
                include: { class: { select: { name: true } } },
              },
            },
          },
        },
      }),
      prisma.attendance.groupBy({
        by: ['classId'],
        where: { student: { schoolId }, date: today },
      }),
      prisma.attendance.findMany({
        where: {
          student: { schoolId },
          date: { gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000) },
        },
        select: { date: true, status: true },
      }),
      activeTerm
        ? prisma.grade.count({ where: { student: { schoolId }, termId: activeTerm.id } })
        : Promise.resolve(0),
      activeYear
        ? prisma.enrollment.count({ where: { academicYearId: activeYear.id, student: { schoolId, isActive: true } } })
        : Promise.resolve(0),
      activeYear
        ? prisma.feeType.findMany({ where: { schoolId, academicYearId: activeYear.id, isActive: true } })
        : Promise.resolve([]),
      prisma.payment.findMany({
        where: { schoolId, paymentDate: { gte: firstOfMonth, lte: lastOfMonth } },
        select: { amountPaid: true },
      }),
      prisma.payment.findMany({
        where: { schoolId, remainingBalance: { gt: 0 } },
        select: { studentId: true, remainingBalance: true },
      }),
      prisma.payment.findMany({
        where: { schoolId },
        orderBy: { paymentDate: 'desc' },
        take: 5,
        include: { student: { select: { nom: true, postNom: true } } },
      }),
      prisma.cashSession.findFirst({
        where: { schoolId, status: 'OPEN' },
        include: { cashier: { select: { nom: true, postNom: true } } },
        orderBy: { openedAt: 'desc' },
      }),
      prisma.announcement.count({
        where: { schoolId, endDate: { gte: now }, priority: 'URGENT' },
      }),
      prisma.convocation.count({ where: { schoolId, status: 'PENDING' } }),
      prisma.announcement.findMany({
        where: { schoolId, startDate: { gte: today } },
        orderBy: { startDate: 'asc' },
        take: 3,
        select: { titre: true, startDate: true, priority: true },
      }),
      activeYear
        ? prisma.enrollment.findMany({
            where: { academicYearId: activeYear.id, student: { schoolId, isActive: true } },
            include: { class: { include: { section: { select: { name: true } } } } },
          })
        : Promise.resolve([] as any[]),
    ]);

    // Enrollment by section
    const bySection: Record<string, number> = {};
    for (const enr of enrollmentsBySection) {
      const name = (enr as any).class?.section?.name || 'Autre';
      bySection[name] = (bySection[name] || 0) + 1;
    }

    // Attendance today
    const attendanceToday = {
      rate: totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0,
      present: presentToday,
      total: totalStudents,
      classesDone: classesDoneToday.length,
      classesTotal: activeClasses,
    };

    // 7-day attendance
    const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const weekMap: Record<string, { present: number; total: number }> = {};
    for (const rec of weekAttendanceRaw) {
      const key = rec.date.toISOString().split('T')[0];
      if (!weekMap[key]) weekMap[key] = { present: 0, total: 0 };
      weekMap[key].total += 1;
      if (rec.status === 'PRESENT') weekMap[key].present += 1;
    }
    const attendanceWeek = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const slot = weekMap[key] || { present: 0, total: totalStudents };
      attendanceWeek.push({
        day: DAY_NAMES[d.getDay()],
        date: key,
        rate: slot.total > 0 ? Math.round((slot.present / slot.total) * 100) : 0,
        present: slot.present,
        total: slot.total,
      });
    }

    // Absences with consecutive detection
    const absencesToday = await Promise.all(absencesTodayRaw.map(async (a) => {
      const recentCount = await prisma.attendance.count({
        where: {
          studentId: a.studentId,
          status: 'ABSENT',
          date: { gte: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), lte: today },
        },
      });
      return {
        studentId: a.studentId,
        nom: a.student.nom,
        postNom: a.student.postNom,
        className: a.student.enrollments[0]?.class?.name || '—',
        isConsecutive: recentCount >= 3,
      };
    }));

    // Grades progress
    const gradesProgress = {
      done: gradesCount,
      total: totalEnrollments,
      percent: totalEnrollments > 0 ? Math.round((gradesCount / totalEnrollments) * 100) : 0,
    };

    // Finance
    const collectedThisMonth = monthPayments.reduce((s, p) => s + p.amountPaid, 0);
    const expectedPerStudent = feeTypes.reduce((s, f) => s + f.amount, 0);
    const expectedThisMonth = expectedPerStudent * totalStudents;
    const totalDebts = allPaymentBalances.reduce((s, p) => s + p.remainingBalance, 0);
    const debtorsCount = new Set(allPaymentBalances.map((p) => p.studentId)).size;
    const recoveryRate = expectedThisMonth > 0
      ? Math.round((collectedThisMonth / expectedThisMonth) * 100)
      : 0;

    // Payment trend (6 months) — sequential to avoid overwhelming DB
    const paymentTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const first = new Date(d.getFullYear(), d.getMonth(), 1);
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(d);
      const agg = await prisma.payment.aggregate({
        where: { schoolId, paymentDate: { gte: first, lte: last } },
        _sum: { amountPaid: true },
      });
      paymentTrend.push({
        label,
        expected: Math.round(expectedThisMonth),
        collected: agg._sum.amountPaid || 0,
      });
    }

    // Recent payments
    const recentPayments = recentPaymentsRaw.map((p) => ({
      studentNom: `${p.student.nom} ${p.student.postNom}`,
      amount: p.amountPaid,
      method: p.paymentMethod,
      minutesAgo: Math.round((now.getTime() - new Date(p.paymentDate).getTime()) / 60000),
    }));

    // Cash session
    const cashSession = cashSessionRaw
      ? {
          isOpen: true,
          cashierName: `${cashSessionRaw.cashier.nom} ${cashSessionRaw.cashier.postNom}`,
          openedAt: cashSessionRaw.openedAt.toISOString(),
        }
      : { isOpen: false, cashierName: null, openedAt: null };

    // Next events
    const nextEvents = calendarEvents.map((e) => ({
      title: e.titre,
      date: e.startDate.toISOString(),
      type: e.priority,
    }));

    return {
      enrollment: { total: totalStudents, bySection },
      activeClasses,
      activeTeachers,
      attendanceToday,
      attendanceWeek,
      absencesToday,
      gradesProgress,
      finance: { collectedThisMonth, expectedThisMonth, totalDebts, debtorsCount, recoveryRate },
      paymentTrend,
      recentPayments,
      cashSession,
      pendingAlerts: openAlerts,
      pendingConvocations: openConvocations,
      nextEvents,
    };
  }
}

export const statsService = new StatsService();
