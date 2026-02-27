import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AbsencesService } from '../modules/absences/absences.service';
import prisma from '../lib/prisma';

// Mock Prisma
vi.mock('../lib/prisma', () => ({
    default: {
        teacher: {
            findUnique: vi.fn(),
        },
    },
}));

describe('AbsencesService - calculateBalance', () => {
    let absencesService: AbsencesService;

    beforeEach(() => {
        absencesService = new AbsencesService();
        vi.clearAllMocks();
    });

    it('should calculate balance correctly for a teacher', async () => {
        const mockTeacher = {
            id: 'teacher-1',
            congeGlobal: 20,
            congePris: 5,
        };

        (prisma.teacher.findUnique as any).mockResolvedValue(mockTeacher);

        const result = await absencesService.calculateBalance('teacher-1');

        expect(result).toEqual({
            total: 20,
            pris: 5,
            restants: 15,
        });
        expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
            where: { id: 'teacher-1' },
            select: { congeGlobal: true, congePris: true },
        });
    });

    it('should use default values if congeGlobal/congePris are missing (though they have defaults)', async () => {
        const mockTeacher = {
            id: 'teacher-2',
            congeGlobal: 22,
            congePris: 0,
        };

        (prisma.teacher.findUnique as any).mockResolvedValue(mockTeacher);

        const result = await absencesService.calculateBalance('teacher-2');

        expect(result.restants).toBe(22);
    });

    it('should throw error if teacher not found', async () => {
        (prisma.teacher.findUnique as any).mockResolvedValue(null);

        await expect(absencesService.calculateBalance('invalid-id')).rejects.toThrow('Enseignant non trouvé');
    });
});
