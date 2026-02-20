import { prisma } from '../../lib/prisma';

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

interface CreatePeriodDto {
    classId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: DayOfWeek;
    periodSlot: number;
}

interface TimetablePeriod {
    id: string;
    classId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: DayOfWeek;
    periodSlot: number;
    startTime: string;
    endTime: string;
    class: {
        id: string;
        name: string;
        section: {
            id: string;
            name: string;
            code: string;
        };
    };
    subject: {
        id: string;
        name: string;
        abbreviation: string;
    };
    teacher: {
        id: string;
        nom: string;
        prenom: string | null;
    };
}

// Horaires fixes des périodes
const PERIOD_TIMES: Record<number, { start: string; end: string }> = {
    1: { start: '07:30', end: '08:30' },
    2: { start: '08:30', end: '09:30' },
    3: { start: '10:00', end: '11:00' }, // Après récréation
    4: { start: '11:00', end: '12:00' },
    5: { start: '13:00', end: '14:00' }, // Après pause déjeuner
    6: { start: '14:00', end: '15:00' },
    7: { start: '15:00', end: '16:00' },
    8: { start: '16:00', end: '17:00' },
};

export class TimetableService {
    /**
     * Get timetable for a teacher
     */
    async getTeacherTimetable(teacherId: string, schoolId: string): Promise<{ periods: TimetablePeriod[] }> {
        // Verify teacher exists and belongs to school
        const teacher = await prisma.teacher.findFirst({
            where: {
                id: teacherId,
                schoolId,
            },
        });

        if (!teacher) {
            throw new Error('TEACHER_NOT_FOUND');
        }

        // Get all timetable periods for this teacher
        const dbPeriods = await prisma.timetablePeriod.findMany({
            where: {
                teacherClassSubject: {
                    teacherId,
                },
            },
            include: {
                teacherClassSubject: {
                    include: {
                        class: {
                            include: {
                                section: true,
                            },
                        },
                        subject: true,
                        teacher: true,
                    },
                },
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { periodSlot: 'asc' },
            ],
        });

        // Transform to response format
        const periods: TimetablePeriod[] = dbPeriods.map((period) => ({
            id: period.id,
            classId: period.teacherClassSubject.classId,
            subjectId: period.teacherClassSubject.subjectId,
            teacherId: period.teacherClassSubject.teacherId,
            dayOfWeek: period.dayOfWeek as DayOfWeek,
            periodSlot: period.periodSlot,
            startTime: period.startTime,
            endTime: period.endTime,
            class: {
                id: period.teacherClassSubject.class.id,
                name: period.teacherClassSubject.class.name,
                section: {
                    id: period.teacherClassSubject.class.section.id,
                    name: period.teacherClassSubject.class.section.name,
                    code: period.teacherClassSubject.class.section.code || 
                          period.teacherClassSubject.class.section.name.substring(0, 3),
                },
            },
            subject: {
                id: period.teacherClassSubject.subject.id,
                name: period.teacherClassSubject.subject.name,
                abbreviation: period.teacherClassSubject.subject.abbreviation,
            },
            teacher: {
                id: period.teacherClassSubject.teacher.id,
                nom: period.teacherClassSubject.teacher.nom,
                prenom: period.teacherClassSubject.teacher.prenom,
            },
        }));

        return { periods };
    }

    /**
     * Get timetable for a class
     */
    async getClassTimetable(classId: string, schoolId: string): Promise<{ periods: TimetablePeriod[] }> {
        // Verify class exists and belongs to school
        const classData = await prisma.class.findFirst({
            where: {
                id: classId,
                schoolId,
            },
        });

        if (!classData) {
            throw new Error('CLASS_NOT_FOUND');
        }

        // Get all timetable periods for this class
        const dbPeriods = await prisma.timetablePeriod.findMany({
            where: {
                teacherClassSubject: {
                    classId,
                },
            },
            include: {
                teacherClassSubject: {
                    include: {
                        class: {
                            include: {
                                section: true,
                            },
                        },
                        subject: true,
                        teacher: true,
                    },
                },
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { periodSlot: 'asc' },
            ],
        });

        // Transform to response format
        const periods: TimetablePeriod[] = dbPeriods.map((period) => ({
            id: period.id,
            classId: period.teacherClassSubject.classId,
            subjectId: period.teacherClassSubject.subjectId,
            teacherId: period.teacherClassSubject.teacherId,
            dayOfWeek: period.dayOfWeek as DayOfWeek,
            periodSlot: period.periodSlot,
            startTime: period.startTime,
            endTime: period.endTime,
            class: {
                id: period.teacherClassSubject.class.id,
                name: period.teacherClassSubject.class.name,
                section: {
                    id: period.teacherClassSubject.class.section.id,
                    name: period.teacherClassSubject.class.section.name,
                    code: period.teacherClassSubject.class.section.code || 
                          period.teacherClassSubject.class.section.name.substring(0, 3),
                },
            },
            subject: {
                id: period.teacherClassSubject.subject.id,
                name: period.teacherClassSubject.subject.name,
                abbreviation: period.teacherClassSubject.subject.abbreviation,
            },
            teacher: {
                id: period.teacherClassSubject.teacher.id,
                nom: period.teacherClassSubject.teacher.nom,
                prenom: period.teacherClassSubject.teacher.prenom,
            },
        }));

        return { periods };
    }

    /**
     * Create a timetable period
     */
    async createPeriod(data: CreatePeriodDto, schoolId: string) {
        // Verify class belongs to school
        const classData = await prisma.class.findFirst({
            where: {
                id: data.classId,
                schoolId,
            },
            include: {
                section: true,
            },
        });

        if (!classData) {
            throw new Error('CLASS_NOT_FOUND');
        }

        // Verify teacher-class-subject assignment exists
        const assignment = await prisma.teacherClassSubject.findFirst({
            where: {
                teacherId: data.teacherId,
                classId: data.classId,
                subjectId: data.subjectId,
            },
            include: {
                teacher: true,
                subject: true,
            },
        });

        if (!assignment) {
            throw new Error('ASSIGNMENT_NOT_FOUND: Cet enseignant n\'est pas assigné à cette matière pour cette classe');
        }

        // Check for conflicts - teacher already has a class at this time
        const teacherConflict = await prisma.timetablePeriod.findFirst({
            where: {
                teacherClassSubject: {
                    teacherId: data.teacherId,
                },
                dayOfWeek: data.dayOfWeek,
                periodSlot: data.periodSlot,
            },
        });

        if (teacherConflict) {
            throw new Error('TEACHER_CONFLICT: Cet enseignant a déjà un cours à cet horaire');
        }

        // Check for conflicts - class already has a course at this time
        const classConflict = await prisma.timetablePeriod.findFirst({
            where: {
                teacherClassSubject: {
                    classId: data.classId,
                },
                dayOfWeek: data.dayOfWeek,
                periodSlot: data.periodSlot,
            },
        });

        if (classConflict) {
            throw new Error('CLASS_CONFLICT: Cette classe a déjà un cours à cet horaire');
        }

        // Get time from period slot
        const timeSlot = PERIOD_TIMES[data.periodSlot];
        if (!timeSlot) {
            throw new Error('INVALID_PERIOD_SLOT');
        }

        // Create timetable period
        const dbPeriod = await prisma.timetablePeriod.create({
            data: {
                teacherClassSubjectId: assignment.id,
                dayOfWeek: data.dayOfWeek,
                periodSlot: data.periodSlot,
                startTime: timeSlot.start,
                endTime: timeSlot.end,
            },
        });

        const period: TimetablePeriod = {
            id: dbPeriod.id,
            classId: data.classId,
            subjectId: data.subjectId,
            teacherId: data.teacherId,
            dayOfWeek: data.dayOfWeek,
            periodSlot: data.periodSlot,
            startTime: dbPeriod.startTime,
            endTime: dbPeriod.endTime,
            class: {
                id: classData.id,
                name: classData.name,
                section: {
                    id: classData.section.id,
                    name: classData.section.name,
                    code: classData.section.code,
                },
            },
            subject: {
                id: assignment.subject.id,
                name: assignment.subject.name,
                abbreviation: assignment.subject.abbreviation,
            },
            teacher: {
                id: assignment.teacher.id,
                nom: assignment.teacher.nom,
                prenom: assignment.teacher.prenom,
            },
        };

        return { period };
    }

    /**
     * Delete a timetable period
     */
    async deletePeriod(periodId: string, schoolId: string) {
        // Verify period exists and belongs to school
        const period = await prisma.timetablePeriod.findFirst({
            where: {
                id: periodId,
                teacherClassSubject: {
                    class: {
                        schoolId,
                    },
                },
            },
        });

        if (!period) {
            throw new Error('PERIOD_NOT_FOUND');
        }

        // Delete the period
        await prisma.timetablePeriod.delete({
            where: { id: periodId },
        });

        return { success: true };
    }
}

export const timetableService = new TimetableService();
