import prisma from '../../lib/prisma';
import {
    calculateTeacherPerformance,
    calculateSuccessRate,
    calculateWorkload,
    calculateAttendanceRate,
    determinePerformanceBadge,
    determineWorkloadStatus
} from '@edugoma360/shared/utils/teacherStats';

export class TeachersReportsService {
    /**
     * Get overview metrics
     */
    async getOverview(schoolId: string, filters: { termId?: string; sectionId?: string }) {
        const { termId, sectionId } = filters;

        // 1. Total active teachers
        const totalActive = await prisma.teacher.count({
            where: { schoolId, isActive: true }
        });

        // 2. Fetch all assignments and grades to calculate global averages
        const assignments = await prisma.teacherClassSubject.findMany({
            where: {
                class: {
                    schoolId,
                    ...(sectionId ? { sectionId } : {})
                }
            },
            include: {
                class: true,
                teacher: true
            }
        });

        const teacherIds = Array.from(new Set(assignments.map(a => a.teacherId)));

        // This is a bit complex to calculate school-wide average for teachers specifically.
        // Let's get all grades for the term and school
        const grades = await prisma.grade.findMany({
            where: {
                termId,
                student: {
                    schoolId,
                    ...(sectionId ? { enrollments: { some: { class: { sectionId } } } } : {})
                }
            }
        });

        const schoolAvg = grades.length > 0
            ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
            : 0;

        const passedCount = grades.filter(g => g.score >= 10).length;
        const successRate = grades.length > 0 ? (passedCount / grades.length) * 100 : 0;

        // Calculate average workload
        const totalWorkload = assignments.reduce((sum, a) => sum + (a.volumeHoraire || 0), 0);
        const avgWorkload = teacherIds.length > 0 ? totalWorkload / teacherIds.length : 0;

        return {
            totalActive,
            averageClassGrade: Number(schoolAvg.toFixed(1)),
            successRate: Math.round(successRate),
            averageWorkload: Number(avgWorkload.toFixed(1)),
            trends: {
                teachers: "+2", // Mocking trends for now
                grade: "+0.3",
                successRate: "+5%"
            }
        };
    }

    /**
     * Get rankings
     */
    async getRanking(schoolId: string, filters: { termId: string; sortBy: string }) {
        const { termId, sortBy } = filters;

        // 1. Get all teachers
        const teachers = await prisma.teacher.findMany({
            where: { schoolId, isActive: true },
            include: {
                assignments: {
                    include: {
                        class: true,
                        subject: true
                    }
                },
                attendances: {
                    where: {
                        // For simplicity, let's say last 30 days or term-related
                        // but attendance isn't strictly term-bound in schema.
                        // We'll filter by date if needed.
                    }
                }
            }
        });

        const ranking = await Promise.all(teachers.map(async (teacher) => {
            // Get grades for this teacher's assignments in this term
            const assignmentsList = (teacher as any).assignments.map((a: any) => ({ classId: a.classId, subjectId: a.subjectId }));

            const teacherGrades = await prisma.grade.findMany({
                where: {
                    termId,
                    ...(assignmentsList.length > 0 ? {
                        OR: assignmentsList.map((a: any) => ({
                            subjectId: a.subjectId,
                            student: { enrollments: { some: { classId: a.classId } } }
                        }))
                    } : { id: 'none' }) // Ensure it returns nothing if no assignments
                }
            });

            const avgGrade = calculateTeacherPerformance(teacherGrades.map(g => g.score));
            const successRate = calculateSuccessRate(teacherGrades.map(g => ({ average: g.score })));
            const workload = calculateWorkload((teacher as any).assignments);
            const attendanceRate = calculateAttendanceRate((teacher as any).attendances as any);

            return {
                id: teacher.id,
                name: `${teacher.nom} ${teacher.prenom || ''}`.trim(),
                photoUrl: teacher.photoUrl,
                averageGrade: avgGrade,
                successRate,
                workload,
                attendanceRate,
                classesCount: Array.from(new Set((teacher as any).assignments.map((a: any) => a.classId))).length,
                badge: determinePerformanceBadge(avgGrade, successRate),
                workloadStatus: determineWorkloadStatus(workload),
                evolution: 0.2 // Mock evolution
            };
        }));

        // Sort by criteria
        if (sortBy === 'performance') {
            ranking.sort((a, b) => b.averageGrade - a.averageGrade);
        } else if (sortBy === 'workload') {
            ranking.sort((a, b) => b.workload - a.workload);
        } else if (sortBy === 'attendance') {
            ranking.sort((a, b) => b.attendanceRate - a.attendanceRate);
        }

        return ranking.map((item, index) => ({ ...item, rank: index + 1 }));
    }

    /**
     * Get workload data specifically
     */
    async getWorkloadData(schoolId: string) {
        const teachers = await prisma.teacher.findMany({
            where: { schoolId, isActive: true },
            include: {
                assignments: {
                    include: {
                        class: {
                            include: { enrollments: true }
                        }
                    }
                }
            }
        });

        return teachers.map(t => {
            const hours = t.assignments.reduce((sum, a) => sum + (a.volumeHoraire || 0), 0);
            const classIds = new Set(t.assignments.map(a => a.classId));

            // Total students across all unique classes assigned
            const uniqueClasses = Array.from(new Set(t.assignments.map(a => a.class)));
            const studentsCount = uniqueClasses.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0);

            return {
                id: t.id,
                name: `${t.nom} ${t.prenom || ''}`.trim(),
                hours,
                classes: classIds.size,
                students: studentsCount,
                status: determineWorkloadStatus(hours)
            };
        });
    }

    /**
     * Get attendance heatmap
     */
    async getAttendanceHeatmap(schoolId: string, startDate: Date, endDate: Date) {
        const teachers = await prisma.teacher.findMany({
            where: { schoolId, isActive: true },
            include: {
                attendances: {
                    where: {
                        date: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                }
            }
        });

        return teachers.map(t => ({
            id: t.id,
            name: `${t.nom} ${t.prenom || ''}`.trim(),
            days: (t as any).attendances.map((a: any) => ({
                date: a.date.toISOString().split('T')[0],
                status: a.status
            }))
        }));
    }

    /**
     * Get performance chart data
     */
    async getPerformanceChart(schoolId: string, teacherIds?: string[]) {
        // Fetch all terms for the current active year
        const terms = await prisma.term.findMany({
            where: { academicYear: { schoolId, isActive: true } },
            orderBy: { number: 'asc' }
        });

        const data = await Promise.all(terms.map(async (term) => {
            const row: any = { term: term.label };

            // School average for this term
            const schoolGrades = await prisma.grade.findMany({
                where: { termId: term.id }
            });
            row.schoolAverage = schoolGrades.length > 0
                ? Number((schoolGrades.reduce((sum, g) => sum + g.score, 0) / schoolGrades.length).toFixed(1))
                : 0;

            // Individual teacher averages
            if (teacherIds && teacherIds.length > 0) {
                for (const tId of teacherIds) {
                    const tAssignments = await prisma.teacherClassSubject.findMany({
                        where: { teacherId: tId }
                    });

                    const tGrades = await prisma.grade.findMany({
                        where: {
                            termId: term.id,
                            ...(tAssignments.length > 0 ? {
                                OR: tAssignments.map(a => ({
                                    subjectId: a.subjectId,
                                    student: { enrollments: { some: { classId: a.classId } } }
                                }))
                            } : { id: 'none' })
                        }
                    });

                    row[tId] = tGrades.length > 0
                        ? Number((tGrades.reduce((sum, g) => sum + g.score, 0) / tGrades.length).toFixed(1))
                        : 0;
                }
            }

            return row;
        }));

        return data;
    }

    /**
     * Export report data (CSV/Excel/PDF)
     */
    async export(schoolId: string, filters: { format: string; termId?: string }) {
        // In a real app, this would generate a PDF or Excel
        // For now, we return data that can be used by the frontend to generate a CSV
        // or we would use a library like 'exceljs' or 'pdfkit'

        const teachers = await prisma.teacher.findMany({
            where: { schoolId, isActive: true },
            include: {
                assignments: { include: { class: true, subject: true } }
            }
        });

        const data = teachers.map(t => ({
            Matricule: t.matricule,
            Nom: `${t.nom} ${t.postNom} ${t.prenom || ''}`.trim(),
            Sexe: t.sexe,
            Telephone: t.telephone,
            TypeContrat: t.typeContrat,
            Fonction: t.fonction,
            Workload: (t as any).assignments.reduce((sum: number, a: any) => sum + (a.volumeHoraire || 0), 0) + 'h',
            Affectations: (t as any).assignments.map((a: any) => `${a.class?.code || '?'}-${a.subject?.code || '?'}`).join(', ')
        }));

        return {
            filename: `rapport_enseignants_${new Date().toISOString().split('T')[0]}.${filters.format === 'excel' ? 'xlsx' : 'csv'}`,
            data
        };
    }
}

export const teachersReportsService = new TeachersReportsService();
