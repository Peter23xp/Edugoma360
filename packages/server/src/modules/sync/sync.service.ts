import prisma from '../../lib/prisma';

export class SyncService {
    async processSyncQueue(items: any[], userId: string, schoolId: string) {
        const results = [];

        for (const item of items) {
            try {
                switch (item.entityType) {
                    case 'grade':
                        await prisma.grade.upsert({
                            where: {
                                studentId_subjectId_termId_evalType: {
                                    studentId: item.payload.studentId,
                                    subjectId: item.payload.subjectId,
                                    termId: item.payload.termId,
                                    evalType: item.payload.evalType,
                                },
                            },
                            update: { score: item.payload.score, syncStatus: 'SYNCED' },
                            create: { ...item.payload, createdById: userId, syncStatus: 'SYNCED' },
                        });
                        results.push({ id: item.id, status: 'SYNCED' });
                        break;

                    case 'attendance':
                        await prisma.attendance.upsert({
                            where: {
                                studentId_date_period: {
                                    studentId: item.payload.studentId,
                                    date: new Date(item.payload.date),
                                    period: item.payload.period,
                                },
                            },
                            update: { status: item.payload.status, syncStatus: 'SYNCED' },
                            create: { ...item.payload, date: new Date(item.payload.date), recordedById: userId, syncStatus: 'SYNCED' },
                        });
                        results.push({ id: item.id, status: 'SYNCED' });
                        break;

                    default:
                        results.push({ id: item.id, status: 'UNSUPPORTED', error: `Type "${item.entityType}" non supporté` });
                }
            } catch (error) {
                results.push({
                    id: item.id,
                    status: 'FAILED',
                    error: error instanceof Error ? error.message : 'Erreur inconnue',
                });
            }
        }

        return results;
    }

    async getSyncStatus(schoolId: string) {
        const pendingGrades = await prisma.grade.count({
            where: { student: { schoolId }, syncStatus: 'PENDING' },
        });
        const pendingAttendances = await prisma.attendance.count({
            where: { class: { schoolId }, syncStatus: 'PENDING' },
        });
        const conflictGrades = await prisma.grade.count({
            where: { student: { schoolId }, syncStatus: 'CONFLICT' },
        });

        return {
            pendingGrades,
            pendingAttendances,
            conflictGrades,
            lastSync: new Date().toISOString(),
        };
    }
}

export const syncService = new SyncService();
