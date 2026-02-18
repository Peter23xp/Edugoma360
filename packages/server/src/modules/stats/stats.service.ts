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
}

export const statsService = new StatsService();
