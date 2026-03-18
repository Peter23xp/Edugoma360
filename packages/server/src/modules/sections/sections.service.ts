import prisma from '../../lib/prisma';

export const getSections = async (schoolId: string) => {
    // We fetch sections along with their related subjects and a count of their classes
    const sections = await prisma.section.findMany({
        where: { schoolId },
        include: {
            _count: {
                select: { classes: true }
            },
            subjects: {
                include: {
                    subject: true
                }
            }
        },
        orderBy: [
            { code: 'asc' },
            { year: 'asc' }
        ]
    });

    // We format the raw DB output to match the frontend expectations
    const formatted = sections.map(s => {
        return {
            id: s.id,
            name: s.name,
            code: s.code,
            year: s.year,
            classCount: s._count.classes,
            studentCount: 0, // This would require deeper grouping through Enrollments if needed
            subjects: s.subjects.map(ss => ({
                id: ss.subject.id,
                name: ss.subject.name,
                abbreviation: ss.subject.abbreviation,
                maxScore: ss.subject.maxScore,
                isEliminatory: ss.subject.isEliminatory,
                elimThreshold: ss.subject.elimThreshold,
                coefficient: ss.coefficient,
                displayOrder: ss.subject.displayOrder
            })).sort((a, b) => a.displayOrder - b.displayOrder)
        };
    });

    // Let's group by Code to have representations like "Scientifique (Sc) - Années 3, 4, 5, 6"
    // Since the UI mockup shows "Scientifique (Sc) Années: 3ème, 4ème..."
    // as a single card, we group them if they have the same name/code.
    
    // Actually, the PRISMA schema has `year: Int` per Section. 
    // Example: { name: "Scientifique", code: "Sc", year: 3 }, { name: "Scientifique", code: "Sc", year: 4 }
    // We will group them by `code` to form the "UI Section".
    
    const groups: Record<string, any> = {};

    sections.forEach(s => {
        if (!groups[s.code]) {
            groups[s.code] = {
                id: s.code, // Unique identifier for the group
                name: s.name,
                code: s.code,
                years: [],
                classCount: 0,
                studentCount: 0,
                // We'll collect unique subjects across all years of this Section group
                subjectsMap: new Map<string, any>()
            };
        }

        const group = groups[s.code];
        group.years.push(s.year);
        group.classCount += s._count.classes;
        
        // Add subjects to map
        s.subjects.forEach(ss => {
            if (!group.subjectsMap.has(ss.subjectId)) {
                group.subjectsMap.set(ss.subjectId, {
                    id: ss.subject.id,
                    name: ss.subject.name,
                    abbreviation: ss.subject.abbreviation,
                    maxScore: ss.subject.maxScore,
                    isEliminatory: ss.subject.isEliminatory,
                    elimThreshold: ss.subject.elimThreshold,
                    coefficient: ss.coefficient,    // UI simplification: assuming same coeff across years
                    displayOrder: ss.subject.displayOrder,
                    type: 'PRINCIPALE' // mock value matching mockup if needed or add to prisma
                });
            }
        });
    });

    // Convert map to array and sort
    return Object.values(groups).map(g => ({
        id: g.id,
        name: g.name,
        code: g.code,
        years: g.years.sort(),
        classCount: g.classCount,
        studentCount: g.studentCount,
        subjects: Array.from(g.subjectsMap.values()).sort((a: any, b: any) => a.displayOrder - b.displayOrder)
    }));
};

// ---------------------------------------------------------------------------------------------------------
export const createSection = async (schoolId: string, data: any) => {
    // The UI creates a "Group Section" (example: "Scientifique" for years [3, 4, 5, 6])
    // So we need to create one Prisma Section per year.
    return prisma.$transaction(async (tx) => {
        const createdSections = [];
        for (const y of data.years) {
            const section = await tx.section.create({
                data: {
                    schoolId,
                    name: data.name,
                    code: data.code,
                    year: Number(y)
                }
            });
            createdSections.push(section);
        }
        return createdSections;
    });
};

export const updateSection = async (schoolId: string, groupCode: string, data: any) => {
    // Basic logic for updating section names.
    // Handling year changes (adding/removing years) is more complex if they have classes.
    // Simplifying this to just update the string fields globally for all matching sections.
    const result = await prisma.section.updateMany({
        where: { schoolId, code: groupCode },
        data: {
            name: data.name,
            code: data.code
        }
    });
    return result;
};

export const deleteSection = async (schoolId: string, groupCode: string) => {
    // Business rule: Impossible de supprimer une section si elle a des classes
    const existingClasses = await prisma.class.count({
        where: {
            schoolId,
            section: { code: groupCode }
        }
    });

    if (existingClasses > 0) {
        throw new Error("Impossible de supprimer cette section car elle contient des classes actives.");
    }

    // First delete all `subject_sections` links
    await prisma.subjectSection.deleteMany({
        where: { section: { schoolId, code: groupCode } }
    });

    // Then delete the sections
    await prisma.section.deleteMany({
        where: { schoolId, code: groupCode }
    });
};

// ---------------------------------------------------------------------------------------------------------
export const addSubject = async (schoolId: string, groupCode: string, data: any) => {
    // We add the Subject first.
    return prisma.$transaction(async (tx) => {
        // Find existing subject or create new
        let subject = await tx.subject.findFirst({
            where: { schoolId, name: data.name, abbreviation: data.code }
        });

        if (!subject) {
            subject = await tx.subject.create({
                data: {
                    schoolId,
                    name: data.name,
                    abbreviation: data.code, // Form sends "code" but DB is "abbreviation"
                    maxScore: Number(data.maxScore) || 20,
                    isEliminatory: data.isRequired || false,
                    elimThreshold: data.hasThreshold ? Number(data.thresholdScore) : null,
                    displayOrder: 0
                }
            });
        }

        // Get all underlying Prisma sections that belong to this group Code
        const sections = await tx.section.findMany({
            where: { schoolId, code: groupCode }
        });

        // Link the subject to all of them
        for (const s of sections) {
            // Check if link already exists
            const existingLink = await tx.subjectSection.findFirst({
                where: { sectionId: s.id, subjectId: subject.id }
            });

            if (!existingLink) {
                await tx.subjectSection.create({
                    data: {
                        sectionId: s.id,
                        subjectId: subject.id,
                        coefficient: Number(data.coefficient) || 1
                    }
                });
            }
        }
        
        return {
            id: subject.id,
            name: subject.name,
            abbreviation: subject.abbreviation,
            maxScore: subject.maxScore,
            isEliminatory: subject.isEliminatory,
            elimThreshold: subject.elimThreshold,
            coefficient: Number(data.coefficient) || 1
        };
    });
};

export const updateSubject = async (schoolId: string, groupCode: string, subjectId: string, data: any) => {
    return prisma.$transaction(async (tx) => {
        // Update general subject properties
        const updated = await tx.subject.update({
            where: { id: subjectId },
            data: {
                name: data.name,
                abbreviation: data.code, // The frontend's "code"
                maxScore: Number(data.maxScore) || 20,
                isEliminatory: data.isRequired || false,
                elimThreshold: data.hasThreshold ? Number(data.thresholdScore) : null,
            }
        });

        // Update coefficient specifically for this section group
        if (data.coefficient) {
            const sections = await tx.section.findMany({ where: { schoolId, code: groupCode } });
            const sectionIds = sections.map(s => s.id);
            
            await tx.subjectSection.updateMany({
                where: { subjectId: subjectId, sectionId: { in: sectionIds } },
                data: { coefficient: Number(data.coefficient) }
            });
        }

        return {
            ...updated,
            coefficient: Number(data.coefficient) || 1
        };
    });
};

export const removeSubject = async (schoolId: string, groupCode: string, subjectId: string) => {
    // Removing subject from THIS section group.
    return prisma.$transaction(async (tx) => {
        const sections = await tx.section.findMany({ where: { schoolId, code: groupCode } });
        const sectionIds = sections.map(s => s.id);

        await tx.subjectSection.deleteMany({
            where: { subjectId: subjectId, sectionId: { in: sectionIds } }
        });

        // We don't delete the Subject from DB because it might be used by another section group
        // If it's orphaned, ideally we'd clean it up, but it's okay to keep as a school-wide subject template.
    });
};
