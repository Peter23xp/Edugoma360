import { prisma } from '../../lib/prisma';

interface CreateClassDto {
    schoolId: string;
    sectionId: string;
    name: string;
    maxStudents: number;
}

interface UpdateClassDto {
    maxStudents?: number;
    isActive?: boolean;
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
                mode: 'insensitive',
            };
        }

        const classes = await prisma.class.findMany({
            where,
            include: {
                section: true,
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
            orderBy: [{ name: 'asc' }],
        });

        return { classes };
    }

    /**
     * Get a single class by ID
     */
    async getClassById(classId: string, schoolId: string) {
        const classData = await prisma.class.findFirst({
            where: {
                id: classId,
                schoolId,
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

        if (!classData) {
            throw new Error('CLASS_NOT_FOUND');
        }

        return { class: classData };
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
    async assignTeachers(classId: string, schoolId: string, assignments: TeacherAssignment[]) {
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

        // Delete existing assignments
        await prisma.teacherClassSubject.deleteMany({
            where: { classId },
        });

        // Create new assignments
        const createdAssignments = await Promise.all(
            assignments.map((assignment) =>
                prisma.teacherClassSubject.create({
                    data: {
                        teacherId: assignment.teacherId,
                        classId,
                        subjectId: assignment.subjectId,
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

        return { assignments };
    }
}

export const classesService = new ClassesService();
