import prisma from '../../lib/prisma';
import type { z } from 'zod';
import type { BatchAttendanceDto } from './attendance.dto';

export class AttendanceService {
    async recordBatchAttendance(data: z.infer<typeof BatchAttendanceDto>, userId: string) {
        return prisma.$transaction(
            data.attendances.map((att) =>
                prisma.attendance.upsert({
                    where: {
                        studentId_date_period: {
                            studentId: att.studentId,
                            date: new Date(att.date),
                            period: att.period,
                        },
                    },
                    update: { status: att.status, justification: att.justification },
                    create: {
                        studentId: att.studentId,
                        classId: att.classId,
                        termId: att.termId,
                        date: new Date(att.date),
                        period: att.period,
                        status: att.status,
                        justification: att.justification,
                        recordedById: userId,
                    },
                }),
            ),
        );
    }

    async getDailyAttendance(classId: string, date: string, period: string) {
        return prisma.attendance.findMany({
            where: { classId, date: new Date(date), period: period as any },
            include: {
                student: { select: { id: true, nom: true, postNom: true, prenom: true, matricule: true } },
            },
            orderBy: { student: { nom: 'asc' } },
        });
    }

    async getAttendanceReport(classId: string, termId: string) {
        const attendances = await prisma.attendance.findMany({
            where: { classId, termId },
            include: { student: { select: { id: true, nom: true, postNom: true } } },
        });

        // Group by student and calculate summary
        const studentMap = new Map<string, any>();

        for (const att of attendances) {
            if (!studentMap.has(att.studentId)) {
                studentMap.set(att.studentId, {
                    studentId: att.studentId,
                    studentName: `${att.student.nom} ${att.student.postNom}`,
                    totalPresent: 0, totalAbsent: 0, totalJustified: 0, totalSick: 0, totalDays: 0,
                });
            }
            const summary = studentMap.get(att.studentId)!;
            summary.totalDays++;
            if (att.status === 'PRESENT') summary.totalPresent++;
            else if (att.status === 'ABSENT') summary.totalAbsent++;
            else if (att.status === 'JUSTIFIED') summary.totalJustified++;
            else if (att.status === 'SICK') summary.totalSick++;
        }

        return Array.from(studentMap.values()).map((s) => ({
            ...s,
            attendanceRate: s.totalDays > 0 ? Math.round((s.totalPresent / s.totalDays) * 100) : 0,
        }));
    }
    async getTodayRate(schoolId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all active students
        const totalStudents = await prisma.student.count({
            where: { schoolId, isActive: true },
        });

        if (totalStudents === 0) {
            return { rate: 0, present: 0, total: 0 };
        }

        // Count present students today
        const presentCount = await prisma.attendance.count({
            where: {
                date: today,
                status: 'PRESENT',
                student: { schoolId, isActive: true },
            },
        });

        const rate = Math.round((presentCount / totalStudents) * 100);

        return {
            rate,
            present: presentCount,
            total: totalStudents,
        };
    }
}

export const attendanceService = new AttendanceService();
