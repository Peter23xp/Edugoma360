import prisma from '../../lib/prisma';
import { CreateLeaveRequestDto, UpdateLeaveStatusDto, AbsenceFilters } from './absences.dto';
import { differenceInDays, parseISO, isWeekend, addDays } from 'date-fns';
import { calculateDurationExcludingWeekends } from '@edugoma360/shared';

export class AbsencesService {
    /**
     * Get all leave requests with filters
     */
    async getLeaveRequests(schoolId: string, filters: AbsenceFilters) {
        const where: any = { schoolId };

        if (filters.teacherId) where.teacherId = filters.teacherId;
        if (filters.status) where.status = filters.status;
        if (filters.type) where.type = filters.type;
        if (filters.startDate && filters.endDate) {
            where.startDate = { gte: new Date(filters.startDate) };
            where.endDate = { lte: new Date(filters.endDate) };
        }

        return (prisma as any).teacherLeave.findMany({
            where,
            include: {
                teacher: {
                    select: { id: true, nom: true, postNom: true, prenom: true, matricule: true }
                },
                processedBy: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Create a new leave request
     */
    async createLeaveRequest(schoolId: string, data: CreateLeaveRequestDto) {
        const start = parseISO(data.startDate);
        const end = parseISO(data.endDate);
        const daysCount = calculateDurationExcludingWeekends(start, end);

        if (daysCount <= 0) throw new Error('La date de fin doit être après la date de début');

        const teacher = await prisma.teacher.findUnique({
            where: { id: data.teacherId }
        });

        if (!teacher) throw new Error('Enseignant non trouvé');

        // Rules for deduction from the 20-day balance
        // Compte si: ANNUEL, PERSONNEL, MALADIE (sans certificat)
        const shouldDeduct = ['ANNUEL', 'PERSONNEL'].includes(data.type) || (data.type === 'MALADIE' && !data.certificatUrl);

        if (shouldDeduct) {
            const t = teacher as any;
            const available = (t.congeGlobal || 20) - (t.congePris || 0);
            if (daysCount > available) {
                throw new Error(`Solde de congé insuffisant. Disponible: ${available} jours.`);
            }
        }

        return (prisma as any).teacherLeave.create({
            data: {
                ...data,
                startDate: start,
                endDate: end,
                schoolId,
                daysCount,
                status: 'PENDING'
            }
        });
    }

    /**
     * Update leave request status (Approve/Reject)
     */
    async updateLeaveStatus(id: string, userId: string, data: UpdateLeaveStatusDto) {
        const leave = await (prisma as any).teacherLeave.findUnique({
            where: { id },
            include: { teacher: true }
        });

        if (!leave) throw new Error('Demande de congé non trouvée');
        if (leave.status !== 'PENDING') throw new Error('Cette demande a déjà été traitée');

        if (data.status === 'REJECTED' && !data.observations) {
            throw new Error('Les observations sont obligatoires en cas de refus');
        }

        return prisma.$transaction(async (tx) => {
            const updated = await (tx as any).teacherLeave.update({
                where: { id },
                data: {
                    status: data.status,
                    observations: data.observations,
                    processedById: userId,
                    updatedAt: new Date()
                }
            });

            // If approved and should deduct from balance
            const shouldDeduct = ['ANNUEL', 'PERSONNEL'].includes(updated.type) || (updated.type === 'MALADIE' && !updated.certificatUrl);

            if (data.status === 'APPROVED' && shouldDeduct) {
                await tx.teacher.update({
                    where: { id: updated.teacherId },
                    data: {
                        congePris: { increment: updated.daysCount }
                    } as any
                });
            }

            return updated;
        });
    }

    /**
     * Get statistics for absences
     */
    async getAbsenceStats(schoolId: string) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalPending, totalApprovedMonth, currentAbsents] = await Promise.all([
            (prisma as any).teacherLeave.count({
                where: { schoolId, status: 'PENDING' }
            }),
            (prisma as any).teacherLeave.count({
                where: {
                    schoolId,
                    status: 'APPROVED',
                    startDate: { gte: startOfMonth }
                }
            }),
            (prisma as any).teacherLeave.count({
                where: {
                    schoolId,
                    status: 'APPROVED',
                    startDate: { lte: now },
                    endDate: { gte: now }
                }
            })
        ]);

        return {
            totalPending,
            totalApprovedMonth,
            currentAbsents
        };
    }

    /**
     * Calculate leave balance for a teacher
     */
    async calculateBalance(teacherId: string) {
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            select: { congeGlobal: true, congePris: true }
        });

        if (!teacher) throw new Error('Enseignant non trouvé');

        return {
            total: teacher.congeGlobal,
            pris: teacher.congePris,
            restants: teacher.congeGlobal - teacher.congePris
        };
    }
}

export const absencesService = new AbsencesService();
