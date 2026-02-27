import prisma from '../../lib/prisma';

export interface AssignmentFilters {
    sectionId?: string;
    classId?: string;
    searchTeacher?: string;
    academicYearId: string;
}

export class AssignmentsService {
    /**
     * Get all assignments, classes and subjects for the matrix
     */
    async getMatrixData(schoolId: string, filters: AssignmentFilters) {
        const { academicYearId, sectionId, classId, searchTeacher } = filters;

        // 1. Get Classes (filtered)
        const classes = await prisma.class.findMany({
            where: {
                schoolId,
                isActive: true,
                ...(sectionId ? { sectionId } : {}),
                ...(classId ? { id: classId } : {}),
            },
            include: { section: true },
            orderBy: { name: 'asc' },
        });

        // 2. Get Subjects linked to these classes' sections
        const sectionsIds = Array.from(new Set(classes.map(c => c.sectionId)));

        const subjectSections = await prisma.subjectSection.findMany({
            where: {
                sectionId: { in: sectionsIds }
            },
            include: {
                subject: true,
            }
        });

        // Unique subjects across all sections involved
        const subjectsMap = new Map();
        subjectSections.forEach(ss => {
            if (!subjectsMap.has(ss.subjectId)) {
                subjectsMap.set(ss.subjectId, {
                    ...ss.subject,
                    sections: []
                });
            }
            subjectsMap.get(ss.subjectId).sections.push(ss.sectionId);
        });
        const subjects = Array.from(subjectsMap.values());

        // 3. Get Assignments
        const assignments = await prisma.teacherClassSubject.findMany({
            where: {
                class: { schoolId },
                academicYearId,
                ...(searchTeacher ? {
                    teacher: {
                        OR: [
                            { nom: { contains: searchTeacher } },
                            { postNom: { contains: searchTeacher } },
                            { prenom: { contains: searchTeacher } },
                        ]
                    }
                } : {})
            },
            include: {
                teacher: {
                    select: { id: true, nom: true, postNom: true, prenom: true }
                },
                class: { select: { id: true, name: true } },
                subject: { select: { id: true, name: true, abbreviation: true } }
            }
        });

        // 4. Calculate Stats
        const totalPossibleCells = classes.length * subjects.length; // rough estimate
        const filledCells = assignments.length;

        // Conflicts: Same class + same subject + multiple teachers (Prisma unique constraint usually prevents this but let's check logic)
        // Wait, schema has @@unique([teacherId, classId, subjectId, academicYearId])
        // It DOES allow multiple teachers for same class+subject if they are different teachers. 
        // Logic requirement says: "Une classe ne peut avoir qu'UN SEUL enseignant par matière"
        // So we need to detect if multiple exist.

        const cellMap = new Map();
        assignments.forEach(a => {
            const key = `${a.classId}-${a.subjectId}`;
            if (!cellMap.has(key)) cellMap.set(key, []);
            cellMap.get(key).push(a);
        });

        let conflicts = 0;
        cellMap.forEach(items => {
            if (items.length > 1) conflicts++;
        });

        // Overload: > 20h
        const teacherHours = new Map();
        assignments.forEach(a => {
            const h = teacherHours.get(a.teacherId) || 0;
            teacherHours.set(a.teacherId, h + (a.volumeHoraire || 0));
        });

        let overloaded = 0;
        teacherHours.forEach(h => {
            if (h > 20) overloaded++;
        });

        return {
            classes,
            subjects,
            assignments: assignments.map(a => ({
                id: a.id,
                teacherId: a.teacherId,
                teacherName: `${a.teacher.nom} ${a.teacher.prenom || ''}`.trim(),
                classId: a.classId,
                className: a.class.name,
                subjectId: a.subjectId,
                subjectName: a.subject.name,
                abbreviation: a.subject.abbreviation,
                volumeHoraire: a.volumeHoraire
            })),
            stats: {
                total: filledCells,
                emptyCells: totalPossibleCells - filledCells,
                conflicts,
                overloaded
            }
        };
    }

    /**
     * Create or update an assignment 
     */
    async createAssignment(schoolId: string, data: any) {
        const { teacherId, classId, subjectId, volumeHoraire, academicYearId } = data;

        // Check if teacher can teach this subject
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            include: { subjects: true }
        });

        if (!teacher) throw new Error('Enseignant non trouvé');

        const canTeach = teacher.subjects.some(s => s.id === subjectId);
        if (!canTeach) {
            throw new Error(`Cet enseignant n'est pas habilité à enseigner cette matière.`);
        }

        // Check for existing assignment for this class + subject (Conflict check)
        const existing = await prisma.teacherClassSubject.findFirst({
            where: { classId, subjectId, academicYearId },
            include: { teacher: true }
        });

        if (existing && existing.teacherId !== teacherId) {
            // This is a conflict. 
            // In a simple create, we throw an error for the frontend to handle and show ConflictWarning
            return {
                conflict: true,
                existingAssignment: existing
            };
        }

        // Overload check (Warning only, handled by client/stats, but let's check limit)
        const currentHours = await this.getTeacherTotalHours(teacherId, academicYearId);
        if (currentHours + (volumeHoraire || 0) > 30) {
            throw new Error(`Limite absolue de 30h/semaine dépassée pour cet enseignant.`);
        }

        const assignment = await prisma.teacherClassSubject.upsert({
            where: {
                teacherId_classId_subjectId_academicYearId: {
                    teacherId, classId, subjectId, academicYearId
                }
            },
            update: { volumeHoraire },
            create: { teacherId, classId, subjectId, academicYearId, volumeHoraire },
            include: {
                teacher: { select: { id: true, nom: true, postNom: true, prenom: true } },
                class: { select: { id: true, name: true } },
                subject: { select: { id: true, name: true, abbreviation: true } }
            }
        });

        return { assignment };
    }

    /**
     * Bulk assignment
     */
    async bulkAssign(schoolId: string, data: any) {
        const { teacherId, subjectId, classes, academicYearId } = data;

        const results = [];
        const conflicts = [];

        for (const item of classes) {
            const res = await this.createAssignment(schoolId, {
                teacherId,
                subjectId,
                classId: item.classId,
                volumeHoraire: item.volumeHoraire,
                academicYearId
            }) as any;

            if (res.conflict) {
                conflicts.push(res.existingAssignment);
            } else {
                results.push(res.assignment);
            }
        }

        return { assignments: results, conflicts };
    }

    /**
     * Remove assignment
     */
    async removeAssignment(id: string) {
        await prisma.teacherClassSubject.delete({
            where: { id }
        });
        return { success: true };
    }

    /**
     * Replace teacher in a conflicting assignment
     */
    async replaceTeacher(id: string, newTeacherId: string) {
        // 1. Get the assignment to know the subject
        const assignment = await prisma.teacherClassSubject.findUnique({
            where: { id },
            include: { subject: true }
        });
        if (!assignment) throw new Error('Affectation non trouvée');

        // 2. Check eligibility of new teacher
        const teacher = await prisma.teacher.findUnique({
            where: { id: newTeacherId },
            include: { subjects: true }
        });
        if (!teacher) throw new Error('Enseignant non trouvé');

        const canTeach = teacher.subjects.some(s => s.id === assignment.subjectId);
        if (!canTeach) {
            throw new Error(`Cet enseignant n'est pas habilité à enseigner cette matière (${assignment.subject.name}).`);
        }

        // 3. Update
        return prisma.teacherClassSubject.update({
            where: { id },
            data: { teacherId: newTeacherId },
            include: {
                teacher: { select: { id: true, nom: true, prenom: true } }
            }
        });
    }

    private async getTeacherTotalHours(teacherId: string, academicYearId: string): Promise<number> {
        const res = await prisma.teacherClassSubject.aggregate({
            where: { teacherId, academicYearId },
            _sum: { volumeHoraire: true }
        });
        return res._sum.volumeHoraire || 0;
    }
}

export const assignmentsService = new AssignmentsService();
