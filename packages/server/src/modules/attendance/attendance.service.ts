import prisma from '../../lib/prisma';
import type { z } from 'zod';
import type { BatchAttendanceDto } from './attendance.dto';

// ── Status mapping: RollCall statuses → stored values ────────────────────────
// RETARD is stored as JUSTIFIED with a justification containing the arrival time
function toStoredStatus(status: string): 'PRESENT' | 'ABSENT' | 'JUSTIFIED' | 'SICK' {
    switch (status) {
        case 'PRESENT':  return 'PRESENT';
        case 'ABSENT':   return 'ABSENT';
        case 'RETARD':   return 'JUSTIFIED';
        case 'JUSTIFIED':return 'JUSTIFIED';
        case 'SICK':     return 'SICK';
        default:         return 'ABSENT';
    }
}

function fromStoredStatus(status: string, justification?: string | null): 'PRESENT' | 'ABSENT' | 'RETARD' {
    if (status === 'PRESENT') return 'PRESENT';
    // If justification contains an arrival time marker it was a RETARD
    if ((status === 'JUSTIFIED') && justification?.startsWith('RETARD:')) return 'RETARD';
    return 'ABSENT';
}

// ── Roll-call record type ─────────────────────────────────────────────────────
interface RollCallRecord {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIED' | 'SICK';
    remark?: string;
    arrivalTime?: string;
    isJustified?: boolean;
}

interface SaveDailyPayload {
    classId: string;
    date: string;       // ISO date
    period: string;     // MATIN | APRES_MIDI | SOIR
    termId?: string;
    records: RollCallRecord[];
}

export class AttendanceService {

    // ─────────────────────────────────────────────────────────────────────────
    // LEGACY: batch record (used by existing DailyAttendancePage)
    // ─────────────────────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────────────────────
    // NEW: GET complete student list with existing attendance for roll call
    // ─────────────────────────────────────────────────────────────────────────
    async getDailyRollCall(classId: string, date: string, period: string) {
        const dateObj = new Date(date);

        // Resolve period: SOIR maps to APRES_MIDI for DB storage
        const dbPeriod = period === 'SOIR' ? 'APRES_MIDI' : period;

        // Get all enrolled students in this class (active academic year)
        const enrollments = await prisma.enrollment.findMany({
            where: {
                classId,
                academicYear: { isActive: true },
                student: { isActive: true },
            },
            include: {
                student: {
                    select: {
                        id: true,
                        matricule: true,
                        nom: true,
                        postNom: true,
                        prenom: true,
                        photoUrl: true,
                    },
                },
            },
            orderBy: [
                { student: { nom: 'asc' } },
                { student: { postNom: 'asc' } },
            ],
        });

        // Get class info
        const classInfo = await prisma.class.findUnique({
            where: { id: classId },
            select: { id: true, name: true },
        });

        // Get existing attendance records for this day/period
        const existing = await prisma.attendance.findMany({
            where: {
                classId,
                date: dateObj,
                period: dbPeriod,
            },
        });

        const existingMap = new Map(existing.map((e) => [e.studentId, e]));

        // Build student response list
        const students = enrollments.map((e) => {
            const att = existingMap.get(e.student.id);
            return {
                studentId: e.student.id,
                student: {
                    id: e.student.id,
                    matricule: e.student.matricule,
                    nom: e.student.nom,
                    postNom: e.student.postNom,
                    prenom: e.student.prenom ?? undefined,
                    photoUrl: e.student.photoUrl ?? undefined,
                },
                status: att ? fromStoredStatus(att.status, att.justification) : undefined,
                remark: att?.justification?.startsWith('RETARD:')
                    ? att.justification.split('|')[1]?.trim()
                    : att?.justification ?? undefined,
                arrivalTime: att?.justification?.startsWith('RETARD:')
                    ? att.justification.split('|')[0].replace('RETARD:', '').trim()
                    : undefined,
                isJustified: att?.status === 'JUSTIFIED',
            };
        });

        // Compute stats
        const present = students.filter((s) => s.status === 'PRESENT').length;
        const absent  = students.filter((s) => s.status === 'ABSENT').length;
        const late    = students.filter((s) => s.status === 'RETARD').length;

        return {
            classId,
            className: classInfo?.name ?? '',
            date,
            period,
            students,
            stats: { total: students.length, present, absent, late },
            isLocked: false, // Future: check prefect lock
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NEW: POST save full roll call batch
    // ─────────────────────────────────────────────────────────────────────────
    async saveDailyRollCall(payload: SaveDailyPayload, userId: string) {
        const { classId, date, period, termId, records } = payload;
        const dateObj = new Date(date);
        const dbPeriod = period === 'SOIR' ? 'APRES_MIDI' : period;

        // Resolve active termId if not provided
        let resolvedTermId = termId;
        if (!resolvedTermId) {
            const activeTerm = await prisma.term.findFirst({
                where: { academicYear: { isActive: true }, isActive: true },
                select: { id: true },
            });
            resolvedTermId = activeTerm?.id;
        }

        if (!resolvedTermId) {
            throw new Error('Aucune période scolaire active trouvée');
        }

        // Upsert each record
        await prisma.$transaction(
            records.map((record) => {
                // Encode RETARD info into justification field
                let justification: string | undefined;
                if (record.status === 'RETARD' && record.arrivalTime) {
                    // Format: "RETARD:HH:MM | remark"
                    justification = record.remark
                        ? `RETARD:${record.arrivalTime} | ${record.remark}`
                        : `RETARD:${record.arrivalTime}`;
                } else {
                    justification = record.remark;
                }

                return prisma.attendance.upsert({
                    where: {
                        studentId_date_period: {
                            studentId: record.studentId,
                            date: dateObj,
                            period: dbPeriod,
                        },
                    },
                    update: {
                        status: toStoredStatus(record.status),
                        justification,
                    },
                    create: {
                        studentId: record.studentId,
                        classId,
                        termId: resolvedTermId!,
                        date: dateObj,
                        period: dbPeriod,
                        status: toStoredStatus(record.status),
                        justification,
                        recordedById: userId,
                    },
                });
            }),
        );

        const present = records.filter((r) => r.status === 'PRESENT').length;
        const absent  = records.filter((r) => r.status === 'ABSENT').length;
        const late    = records.filter((r) => r.status === 'RETARD').length;

        return {
            message: 'Appel enregistré avec succès',
            stats: { present, absent, late },
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXISTING: daily attendance (used by old page)
    // ─────────────────────────────────────────────────────────────────────────
    async getDailyAttendance(classId: string, date: string, period: string) {
        return prisma.attendance.findMany({
            where: { classId, date: new Date(date), period: period as any },
            include: {
                student: { select: { id: true, nom: true, postNom: true, prenom: true, matricule: true } },
            },
            orderBy: { student: { nom: 'asc' } },
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXISTING: report & today rate
    // ─────────────────────────────────────────────────────────────────────────
    async getAttendanceReport(classId: string, termId: string) {
        const attendances = await prisma.attendance.findMany({
            where: { classId, termId },
            include: { student: { select: { id: true, nom: true, postNom: true } } },
        });

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

        const totalStudents = await prisma.student.count({
            where: { schoolId, isActive: true },
        });

        if (totalStudents === 0) return { rate: 0, present: 0, total: 0 };

        const presentCount = await prisma.attendance.count({
            where: {
                date: today,
                status: 'PRESENT',
                student: { schoolId, isActive: true },
            },
        });

        return {
            rate: Math.round((presentCount / totalStudents) * 100),
            present: presentCount,
            total: totalStudents,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NEW: Absence History (SCR-029)
    // ─────────────────────────────────────────────────────────────────────────
    async getAbsenceHistory(schoolId: string, filters: any) {
        const {
            page = 1,
            limit = 25,
            period,
            startDate,
            endDate,
            classIds,
            types,
            isJustified,
            studentSearch,
        } = filters;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        // 1. Build Where Clause
        const where: any = {
            class: { schoolId },
            status: { in: ['ABSENT', 'JUSTIFIED', 'SICK'] },
        };

        // Time filter
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        } else if (period) {
            // Handle pre-defined periods
            const now = new Date();
            let start = new Date();
            let end = new Date();
            
            switch (period) {
                case 'today':
                    start.setHours(0,0,0,0);
                    where.date = start;
                    break;
                case 'week':
                    start.setDate(now.getDate() - now.getDay());
                    start.setHours(0,0,0,0);
                    where.date = { gte: start };
                    break;
                case 'month':
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                    where.date = { gte: start };
                    break;
                case 'term':
                    // Get active term start
                    const activeTerm = await prisma.term.findFirst({
                        where: { academicYear: { schoolId, isActive: true }, isActive: true }
                    });
                    if (activeTerm) where.date = { gte: activeTerm.startDate };
                    break;
            }
        }

        if (classIds) {
            where.classId = { in: classIds.split(',') };
        }

        // Search
        if (studentSearch) {
            where.student = {
                OR: [
                    { nom: { contains: studentSearch } },
                    { postNom: { contains: studentSearch } },
                    { matricule: { contains: studentSearch } },
                ],
            };
        }

        // Logic for Justified / Types is complex because of RETARD mapping
        // We fetch all non-present and filter in JS if needed, or refine where
        // For now, let's fetch and filter/map properly
        
        const [totalCount, items] = await Promise.all([
            prisma.attendance.count({ where }),
            prisma.attendance.findMany({
                where,
                include: {
                    student: { select: { id: true, nom: true, postNom: true, prenom: true, matricule: true, photoUrl: true } },
                    class: { select: { id: true, name: true } },
                    recordedBy: { select: { id: true, nom: true, role: true } },
                },
                orderBy: { date: 'desc' },
                skip,
                take,
            })
        ]);

        // Map and Filter by type/justification
        let mappedData = items.map(att => {
            const isRetard = att.justification?.startsWith('RETARD:');
            const status: 'ABSENT' | 'RETARD' = isRetard ? 'RETARD' : 'ABSENT';
            const itemJustified = att.status === 'JUSTIFIED' || att.status === 'SICK';

            return {
                id: att.id,
                date: att.date.toISOString(),
                period: att.period,
                student: att.student,
                class: att.class,
                status,
                isJustified: itemJustified,
                remark: isRetard ? att.justification?.split('|')[1]?.trim() : att.justification,
                arrivalTime: isRetard ? att.justification?.split('|')[0].replace('RETARD:', '').trim() : undefined,
                createdBy: att.recordedBy,
            };
        });

        // Apply secondary filters
        if (isJustified !== undefined) {
            const target = isJustified === 'true';
            mappedData = mappedData.filter(d => d.isJustified === target);
        }
        if (types) {
            const typeList = types.split(',');
            mappedData = mappedData.filter(d => typeList.includes(d.status));
        }

        // Global stats (Simplified: would normally need a separate query for full range stats)
        const stats = {
            totalAbsences: totalCount,
            justified: items.filter(i => (i.status === 'JUSTIFIED' || i.status === 'SICK') && !i.justification?.startsWith('RETARD:')).length, 
            notJustified: items.filter(i => i.status === 'ABSENT').length,
            lates: items.filter(i => i.justification?.startsWith('RETARD:')).length,
        };

        return {
            data: mappedData,
            total: totalCount,
            page: Number(page),
            pages: Math.ceil(totalCount / take),
            stats
        };
    }

    async getStudentAbsenceStats(studentId: string) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const attendances = await prisma.attendance.findMany({
            where: {
                studentId,
                date: { gte: thirtyDaysAgo },
            },
        });

        const totalRecords = attendances.length;
        const totalAbsences = attendances.filter(a => a.status === 'ABSENT' || (a.status === 'JUSTIFIED' && !a.justification?.startsWith('RETARD:'))).length;
        const justifiedAbsences = attendances.filter(a => (a.status === 'JUSTIFIED' || a.status === 'SICK') && !a.justification?.startsWith('RETARD:')).length;
        const notJustifiedAbsences = attendances.filter(a => a.status === 'ABSENT').length;
        const totalLates = attendances.filter(a => a.justification?.startsWith('RETARD:')).length;

        // Simplified attendance rate: (Total - Absences) / Total
        // This is a rough estimate over the last 30 days
        const rate = totalRecords > 0 ? Math.round(((totalRecords - totalAbsences) / totalRecords) * 100) : 100;

        return {
            studentId,
            period: 30,
            stats: {
                totalAbsences,
                justifiedAbsences,
                notJustifiedAbsences,
                totalLates,
                attendanceRate: rate,
            },
            recentAbsences: attendances
                .filter(a => a.status !== 'PRESENT')
                .slice(0, 5)
                .map(a => ({
                    date: a.date.toISOString(),
                    period: a.period,
                    status: a.justification?.startsWith('RETARD:') ? 'RETARD' : 'ABSENT',
                    isJustified: a.status === 'JUSTIFIED' || a.status === 'SICK',
                })),
        };
    }

    // ── Rapports de présence (SCR-031) ───────────────────────────────────────────────
    
    async getReportStats(schoolId: string, query: any) {
        const { startDate, endDate, classIds } = query;
        
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59);

        // Build where clause - Attendance has no schoolId, filter via class.schoolId
        const dateFilter = { date: { gte: start, lte: end } };
        const classSchoolFilter = { class: { schoolId } };
        const classIdFilter = classIds ? { classId: { in: classIds.split(',') } } : {};

        const where = { ...dateFilter, ...classSchoolFilter, ...classIdFilter };

        // Fetch all attendance records in period
        const records = await prisma.attendance.findMany({
            where,
            include: {
                class: { select: { id: true, name: true } },
                student: { select: { id: true, nom: true, postNom: true, matricule: true } },
            },
            orderBy: { date: 'asc' },
        });

        // Aggregate stats
        let totalPresent = 0, totalAbsent = 0, totalLate = 0;
        const byDateMap = new Map<string, { present: number; absent: number; late: number }>();
        const byClassMap = new Map<string, { name: string; present: number; absent: number; late: number; total: number }>();
        const byStudentMap = new Map<string, { nom: string; postNom: string; matricule: string; className: string; present: number; total: number }>();

        for (const r of records) {
            const dateKey = r.date.toISOString().slice(0, 10);
            const isPresent = r.status === 'PRESENT';
            const isAbsent = r.status === 'ABSENT' || r.status === 'JUSTIFIED' || r.status === 'SICK';
            const isLate   = r.status === 'RETARD' || r.status === 'LATE';

            if (isPresent) totalPresent++;
            else if (isAbsent) totalAbsent++;
            else if (isLate) totalLate++;

            // By date
            if (!byDateMap.has(dateKey)) byDateMap.set(dateKey, { present: 0, absent: 0, late: 0 });
            const de = byDateMap.get(dateKey)!;
            if (isPresent) de.present++; else if (isAbsent) de.absent++; else if (isLate) de.late++;

            // By class
            if (!byClassMap.has(r.classId)) byClassMap.set(r.classId, { name: r.class.name, present: 0, absent: 0, late: 0, total: 0 });
            const ce = byClassMap.get(r.classId)!;
            ce.total++;
            if (isPresent) ce.present++; else if (isAbsent) ce.absent++; else if (isLate) ce.late++;

            // By student
            if (!byStudentMap.has(r.studentId)) byStudentMap.set(r.studentId, {
                nom: r.student.nom, postNom: r.student.postNom,
                matricule: r.student.matricule, className: r.class.name,
                present: 0, total: 0
            });
            const se = byStudentMap.get(r.studentId)!;
            se.total++;
            if (isPresent) se.present++;
        }

        const totalCount = totalPresent + totalAbsent + totalLate;
        const schoolAttendanceRate = totalCount > 0 ? Math.round((totalPresent / totalCount) * 1000) / 10 : 0;

        // Build evolution array
        const evolution = Array.from(byDateMap.entries()).map(([date, e]) => {
            const total = e.present + e.absent + e.late;
            return {
                date,
                attendanceRate: total > 0 ? Math.round((e.present / total) * 1000) / 10 : 0,
                present: e.present,
                absent: e.absent,
                late: e.late,
            };
        });

        // Build byClass array
        const byClass = Array.from(byClassMap.entries()).map(([classId, c]) => ({
            classId,
            className: c.name,
            studentCount: new Set(
                records.filter(r => r.classId === classId).map(r => r.studentId)
            ).size,
            attendanceRate: c.total > 0 ? Math.round((c.present / c.total) * 1000) / 10 : 0,
            absences: c.absent,
            lates: c.late,
            trend: 0,
        }));

        // At-risk students (< 80% attendance)
        const atRiskStudents = Array.from(byStudentMap.entries())
            .map(([studentId, s]) => ({
                studentId,
                student: { matricule: s.matricule, nom: s.nom, postNom: s.postNom, class: s.className },
                attendanceRate: s.total > 0 ? Math.round((s.present / s.total) * 1000) / 10 : 0,
                absences: s.total - s.present,
                notJustifiedAbsences: s.total - s.present,
            }))
            .filter(s => s.attendanceRate < 80)
            .slice(0, 20);

        return {
            period: { start: start.toISOString(), end: end.toISOString() },
            stats: {
                totalAttendanceRate: schoolAttendanceRate,
                totalAbsences: totalAbsent,
                justifiedAbsences: 0,
                notJustifiedAbsences: totalAbsent,
                totalLates: totalLate,
                avgLateMinutes: 0,
            },
            evolution,
            byClass,
            atRiskStudents,
        };
    }

    // ── Justificatifs d'absence (SCR-030) ────────────────────────────────────
    
    async getJustifications(schoolId: string, filters: any) {
        const { status, page = 1, limit = 12 } = filters;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = { schoolId };
        if (status) {
            where.status = status;
        }

        // Stats over the whole school for visualizations
        const [totalCount, items, statsRaw] = await Promise.all([
            (prisma as any).justification.count({ where }),
            (prisma as any).justification.findMany({
                where,
                include: {
                    student: { select: { id: true, nom: true, postNom: true, prenom: true, matricule: true, photoUrl: true } },
                    attendanceRecord: { select: { date: true, period: true, class: { select: { name: true } } } },
                    submittedBy: { select: { id: true, nom: true, phone: true } },
                    reviewedBy: { select: { id: true, nom: true, role: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            (prisma as any).justification.groupBy({
                by: ['status'],
                where: { schoolId },
                _count: { id: true }
            })
        ]);

        const stats = {
            pending: 0,
            approved: 0,
            rejected: 0,
            expired: 0
        };
        statsRaw.forEach((s: any) => {
            if (s.status === 'PENDING') stats.pending = s._count.id;
            if (s.status === 'APPROVED') stats.approved = s._count.id;
            if (s.status === 'REJECTED') stats.rejected = s._count.id;
            if (s.status === 'EXPIRED') stats.expired = s._count.id;
        });

        const mappedData = items.map((j: any) => ({
            id: j.id,
            attendanceRecordId: j.attendanceRecordId,
            student: {
                ...j.student,
                class: { name: j.attendanceRecord?.class?.name ?? '' }
            },
            absence: {
                date: j.attendanceRecord?.date ? new Date(j.attendanceRecord.date).toISOString() : new Date().toISOString(),
                period: j.attendanceRecord?.period ?? 'MORNING'
            },
            reason: j.reason,
            reasonDetails: j.reasonDetails,
            documentUrl: j.documentUrl,
            documentName: j.documentName,
            documentSize: j.documentSize,
            status: j.status,
            submittedBy: {
                id: j.submittedBy.id,
                nom: j.submittedBy.nom,
                relationship: 'Parent/Tuteur', // In a real system, derive from relationship metadata 
                phone: j.submittedBy.phone
            },
            submittedAt: j.createdAt.toISOString(),
            reviewedBy: j.reviewedBy,
            reviewedAt: j.reviewedAt?.toISOString(),
            reviewComment: j.reviewComment,
            rejectionReason: j.rejectionReason
        }));

        return {
            data: mappedData,
            total: totalCount,
            page: Number(page),
            pages: Math.ceil(totalCount / take),
            stats
        };
    }

    async approveJustification(id: string, data: { comment?: string, userId: string }) {
        return (prisma as any).justification.update({
            where: { id },
            data: {
                status: 'APPROVED',
                reviewedById: data.userId,
                reviewedAt: new Date(),
                reviewComment: data.comment
            }
        });
    }

    async rejectJustification(id: string, data: { rejectionReason: string, comment: string, userId: string }) {
        return (prisma as any).justification.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: data.rejectionReason,
                reviewComment: data.comment,
                reviewedById: data.userId,
                reviewedAt: new Date()
            }
        });
    }
}

export const attendanceService = new AttendanceService();
