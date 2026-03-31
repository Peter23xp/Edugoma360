import prisma from '../../lib/prisma';

interface CreateClassDto {
    schoolId: string;
    sectionId: string;
    name: string;
    maxStudents: number;
    room?: string;
    titulaireId?: string;
}

interface UpdateClassDto {
    maxStudents?: number;
    isActive?: boolean;
    room?: string;
    titulaireId?: string | null;
}

interface ClassFilters {
    schoolId: string;
    sectionId?: string;
    status?: 'active' | 'archived';
    search?: string;
}

interface TeacherAssignment {
    subjectId: string;
    teacherId: string;
}

export class ClassesService {
    /**
     * Get all classes with filters
     */
    async getClasses(filters: ClassFilters) {
        const where: any = {
            schoolId: filters.schoolId,
        };

        if (filters.sectionId) {
            where.sectionId = filters.sectionId;
        }

        if (filters.status === 'active') {
            where.isActive = true;
        } else if (filters.status === 'archived') {
            where.isActive = false;
        }

        if (filters.search) {
            where.name = {
                contains: filters.search,
            };
        }

        const classes = await prisma.class.findMany({
            where,
            include: {
                titulaire: true,
                section: {
                    include: {
                        subjects: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        teacherAssignments: true,
                    },
                },
            },
            orderBy: [{ name: 'asc' }],
        });

        // Enrich with computed fields
        const enriched = classes.map(c => ({
            ...c,
            currentStudents: c._count.enrollments,
            subjectsAssigned: c._count.teacherAssignments,
            totalSubjects: (c.section as any)?.subjects?.length ?? 0,
        }));

        return { classes: enriched };
    }

    /**
     * Get a single class by ID with full details
     */
    async getClassById(classId: string, schoolId: string) {
        const classData = await prisma.class.findFirst({
            where: {
                id: classId,
                schoolId,
            },
            include: {
                section: {
                    include: {
                        subjects: {
                            include: { subject: true },
                        },
                    },
                },
                titulaire: {
                    select: {
                        id: true, nom: true, postNom: true, prenom: true,
                        telephone: true, email: true, photoUrl: true,
                    },
                },
                teacherAssignments: {
                    include: {
                        teacher: {
                            select: { id: true, nom: true, postNom: true, prenom: true, telephone: true },
                        },
                        subject: {
                            select: { id: true, name: true, abbreviation: true, maxScore: true },
                        },
                    },
                },
                enrollments: {
                    where: { academicYear: { isActive: true } },
                    include: {
                        student: {
                            select: {
                                id: true, matricule: true, nom: true, postNom: true,
                                prenom: true, sexe: true, photoUrl: true, statut: true,
                            },
                        },
                    },
                    orderBy: { student: { nom: 'asc' } },
                },
                _count: {
                    select: {
                        enrollments: true,
                        teacherAssignments: true,
                    },
                },
            },
        });

        if (!classData) {
            throw new Error('CLASS_NOT_FOUND');
        }

        // Map students from enrollments
        const students = classData.enrollments.map(e => ({
            ...e.student,
            enrollmentId: e.id,
            enrolledAt: e.enrolledAt,
        }));

        // Get section subjects count
        const totalSubjects = classData.section?.subjects?.length ?? 0;

        return {
            class: {
                ...classData,
                enrollments: undefined, // Don't send raw enrollments
            },
            students,
            totalSubjects,
            currentStudents: classData._count.enrollments,
            subjectsAssigned: classData._count.teacherAssignments,
        };
    }

    /**
     * Create a new class
     */
    async createClass(data: CreateClassDto) {
        // Check if class name already exists
        const existing = await prisma.class.findFirst({
            where: {
                schoolId: data.schoolId,
                name: data.name,
            },
        });

        if (existing) {
            throw new Error('CLASS_NAME_EXISTS');
        }

        // Validate section exists
        const section = await prisma.section.findFirst({
            where: {
                id: data.sectionId,
                schoolId: data.schoolId,
            },
        });

        if (!section) {
            throw new Error('SECTION_NOT_FOUND');
        }

        // Create class
        const newClass = await prisma.class.create({
            data: {
                schoolId: data.schoolId,
                sectionId: data.sectionId,
                name: data.name,
                room: data.room,
                titulaireId: data.titulaireId,
                maxStudents: data.maxStudents,
                isActive: true,
            },
            include: {
                section: true,
            },
        });

        return { class: newClass };
    }

    /**
     * Update a class
     */
    async updateClass(classId: string, schoolId: string, data: UpdateClassDto) {
        // Check class exists
        const existingClass = await prisma.class.findFirst({
            where: {
                id: classId,
                schoolId,
            },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        if (!existingClass) {
            throw new Error('CLASS_NOT_FOUND');
        }

        // Validate maxStudents if provided
        if (data.maxStudents !== undefined) {
            const currentStudentCount = existingClass._count.enrollments;
            if (data.maxStudents < currentStudentCount) {
                throw new Error(
                    `CANNOT_REDUCE_MAX_STUDENTS: La classe contient actuellement ${currentStudentCount} élèves`
                );
            }
        }

        // Update class
        const updatedClass = await prisma.class.update({
            where: { id: classId },
            data: {
                maxStudents: data.maxStudents,
                isActive: data.isActive,
                room: data.room,
                titulaireId: data.titulaireId,
            },
            include: {
                section: true,
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        return { class: updatedClass };
    }

    /**
     * Archive a class (soft delete)
     */
    async archiveClass(classId: string, schoolId: string) {
        // Check class exists
        const existingClass = await prisma.class.findFirst({
            where: {
                id: classId,
                schoolId,
            },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        if (!existingClass) {
            throw new Error('CLASS_NOT_FOUND');
        }

        // Check if class has enrollments
        if (existingClass._count.enrollments > 0) {
            throw new Error(
                `CANNOT_ARCHIVE_CLASS_WITH_STUDENTS: La classe contient ${existingClass._count.enrollments} inscriptions`
            );
        }

        // Archive class
        const archivedClass = await prisma.class.update({
            where: { id: classId },
            data: { isActive: false },
            include: {
                section: true,
            },
        });

        return { class: archivedClass };
    }

    /**
     * Assign teachers to subjects for a class
     */
    async assignTeachers(classId: string, schoolId: string, assignments: TeacherAssignment[], titulaireId?: string) {
        // Verify class exists
        const classData = await prisma.class.findFirst({
            where: {
                id: classId,
                schoolId,
            },
        });

        if (!classData) {
            throw new Error('CLASS_NOT_FOUND');
        }

        const activeYear = await prisma.academicYear.findFirst({
            where: { schoolId, isActive: true }
        });

        if (!activeYear) throw new Error('NO_ACTIVE_ACADEMIC_YEAR');

        // Delete existing assignments
        await prisma.teacherClassSubject.deleteMany({
            where: { classId },
        });

        // Update titulaireId on the class
        await prisma.class.update({
            where: { id: classId },
            data: { titulaireId },
        });

        // Create new assignments
        const createdAssignments = await Promise.all(
            assignments.map((assignment) =>
                prisma.teacherClassSubject.create({
                    data: {
                        teacherId: assignment.teacherId,
                        classId,
                        subjectId: assignment.subjectId,
                        academicYearId: activeYear.id,
                    },
                    include: {
                        teacher: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                            },
                        },
                        subject: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                })
            )
        );

        return { assignments: createdAssignments };
    }

    /**
     * Get teacher assignments for a class
     */
    async getClassAssignments(classId: string, schoolId: string) {
        // Verify class exists
        const classData = await prisma.class.findFirst({
            where: {
                id: classId,
                schoolId,
            },
        });

        if (!classData) {
            throw new Error('CLASS_NOT_FOUND');
        }

        const assignments = await prisma.teacherClassSubject.findMany({
            where: { classId },
            include: {
                teacher: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return { assignments, titulaireId: classData.titulaireId };
    }

    /**
     * Generate Timetable for a class
     */
    async generateTimetable(classId: string, schoolId: string, preferences?: any) {
        // Find active academic year for the school
        const activeYear = await prisma.academicYear.findFirst({
            where: { schoolId, isActive: true },
        });

        if (!activeYear) {
            throw new Error('NO_ACTIVE_ACADEMIC_YEAR');
        }

        // Import the generator
        const { generateTimetable } = require('../../lib/timetable/timetableGenerator');

        const result = await generateTimetable({
            schoolId,
            academicYearId: activeYear.id,
            classId,
            days: ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'],
            periodsPerDay: 8,
        });

        return result;
    }
}

export const classesService = new ClassesService();
