import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateTeacherStatuses } from '../modules/teachers/teachers.cron';
import prisma from '../lib/prisma';

// Mock Prisma
vi.mock('../lib/prisma', () => ({
    default: {
        teacherLeave: {
            findMany: vi.fn(),
        },
        teacher: {
            update: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback(prisma)),
    },
}));

// Mock SMS service
vi.mock('../services/sms.service', () => ({
    sendSms: vi.fn().mockResolvedValue({ success: true }),
}));

describe('CRON - updateTeacherStatuses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should update teacher status to EN_CONGE when leave starts today', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const mockLeavesStarting = [
            {
                id: 'leave-1',
                teacherId: 'teacher-1',
                teacher: { id: 'teacher-1', nom: 'MUKASA', telephone: '+243990000000' }
            }
        ];

        // First call for starting leaves, second for ending leaves
        (prisma.teacherLeave.findMany as any)
            .mockResolvedValueOnce(mockLeavesStarting) // Starting today
            .mockResolvedValueOnce([]); // Ending yesterday

        await updateTeacherStatuses();

        expect(prisma.teacher.update).toHaveBeenCalledWith({
            where: { id: 'teacher-1' },
            data: { statut: 'EN_CONGE' }
        });
    });

    it('should update teacher status to ACTIF when leave ended yesterday', async () => {
        const mockLeavesEnding = [
            {
                id: 'leave-2',
                teacherId: 'teacher-2',
                teacher: { id: 'teacher-2', nom: 'KABILA', telephone: '+243991111111' }
            }
        ];

        (prisma.teacherLeave.findMany as any)
            .mockResolvedValueOnce([]) // Starting today
            .mockResolvedValueOnce(mockLeavesEnding); // Ending yesterday

        await updateTeacherStatuses();

        expect(prisma.teacher.update).toHaveBeenCalledWith({
            where: { id: 'teacher-2' },
            data: { statut: 'ACTIF' }
        });
    });

    it('should handle no leaves to update gracefully', async () => {
        (prisma.teacherLeave.findMany as any).mockResolvedValue([]);

        await updateTeacherStatuses();

        expect(prisma.teacher.update).not.toHaveBeenCalled();
    });
});
