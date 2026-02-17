import prisma from '../../lib/prisma';

export class TeachersService {
    async getTeachers(schoolId: string) {
        return prisma.teacher.findMany({
            where: { schoolId, isActive: true },
            include: { assignments: { include: { class: true, subject: true } } },
            orderBy: { nom: 'asc' },
        });
    }

    async createTeacher(schoolId: string, data: any) {
        return prisma.teacher.create({
            data: { ...data, schoolId },
        });
    }

    async updateTeacher(id: string, data: any) {
        return prisma.teacher.update({
            where: { id },
            data,
        });
    }

    async assignSubjectToTeacher(teacherId: string, classId: string, subjectId: string) {
        return prisma.teacherClassSubject.create({
            data: { teacherId, classId, subjectId },
        });
    }

    async removeAssignment(teacherId: string, classId: string, subjectId: string) {
        return prisma.teacherClassSubject.delete({
            where: {
                teacherId_classId_subjectId: { teacherId, classId, subjectId },
            },
        });
    }
}

export const teachersService = new TeachersService();
