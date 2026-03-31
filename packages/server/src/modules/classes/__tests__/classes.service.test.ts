import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassesService } from '../classes.service';
import prisma from '../../../lib/prisma';

// Mock prisma
vi.mock('../../../lib/prisma', () => ({
    default: {
        class: {
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        section: {
            findFirst: vi.fn(),
        },
        academicYear: {
            findFirst: vi.fn(),
        },
        teacherClassSubject: {
            deleteMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

describe('ClassesService', () => {
    let service: ClassesService;

    beforeEach(() => {
        service = new ClassesService();
        vi.clearAllMocks();
    });

    describe('assignTeachers', () => {
        it('should assign teachers correctly and delete old assignments', async () => {
            const classId = 'class-123';
            const schoolId = 'school-123';
            const assignments = [
                { subjectId: 'subj-1', teacherId: 'teach-1' },
                { subjectId: 'subj-2', teacherId: 'teach-2' },
            ];

            // Mock class exists
            (prisma.class.findFirst as any).mockResolvedValue({ id: classId, schoolId });
            // Mock academic year
            (prisma.academicYear.findFirst as any).mockResolvedValue({ id: 'year-123' });
            // Mock teacherClassSubject.create
            (prisma.teacherClassSubject.create as any)
                .mockResolvedValueOnce({ id: 'assign-1', subjectId: 'subj-1' })
                .mockResolvedValueOnce({ id: 'assign-2', subjectId: 'subj-2' });

            const result = await service.assignTeachers(classId, schoolId, assignments);

            expect(prisma.class.findFirst).toHaveBeenCalledWith({
                where: { id: classId, schoolId },
            });
            expect(prisma.academicYear.findFirst).toHaveBeenCalledWith({
                where: { schoolId, isActive: true },
            });
            expect(prisma.teacherClassSubject.deleteMany).toHaveBeenCalledWith({
                where: { classId },
            });
            expect(prisma.teacherClassSubject.create).toHaveBeenCalledTimes(2);
            expect(result.assignments).toHaveLength(2);
        });

        it('should throw if class not found', async () => {
            (prisma.class.findFirst as any).mockResolvedValue(null);

            await expect(
                service.assignTeachers('class-123', 'school-123', [])
            ).rejects.toThrow('CLASS_NOT_FOUND');
        });

        it('should throw if no active academic year', async () => {
            (prisma.class.findFirst as any).mockResolvedValue({ id: 'class-123' });
            (prisma.academicYear.findFirst as any).mockResolvedValue(null);

            await expect(
                service.assignTeachers('class-123', 'school-123', [])
            ).rejects.toThrow('NO_ACTIVE_ACADEMIC_YEAR');
        });
    });

    describe('generateClassName (logic simulation)', () => {
        // Simple test to document how class names should be generated
        const generateClassName = (sectionCode: string, year: number, letter: string) => {
            switch (sectionCode) {
                case 'TC':
                    return `TC-${year}${letter}`;
                case 'HCG':
                    return `${year}HCG-${letter}`;
                default:
                    return `${year}${sectionCode}${letter}`;
            }
        };

        it('generates correct name for Tronc Commun', () => {
            expect(generateClassName('TC', 1, 'A')).toBe('TC-1A');
        });

        it('generates correct name for HCG', () => {
            expect(generateClassName('HCG', 4, 'B')).toBe('4HCG-B');
        });

        it('generates correct name for default section (e.g. Scientifique)', () => {
            expect(generateClassName('Sc', 3, 'C')).toBe('3ScC');
        });
    });
});
