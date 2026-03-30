import prisma from '../../lib/prisma';

export const getAcademicYears = async (schoolId: string) => {
    // Current
    const current = await prisma.academicYear.findFirst({
        where: { schoolId, isActive: true },
        include: { terms: { orderBy: { number: 'asc' } } }
    });

    // Past
    const past = await prisma.academicYear.findMany({
        where: { schoolId, isActive: false, isClosed: true },
        orderBy: { startDate: 'desc' },
        include: {
            _count: {
                select: { enrollments: true, terms: true }
            }
        }
    });

    const formatCurrent = current ? {
        id: current.id,
        name: current.name || current.label,
        startDate: current.startDate,
        endDate: current.endDate,
        isActive: current.isActive,
        isClosed: current.isClosed,
        type: current.type,
        terms: current.terms.map((t: any) => ({
            id: t.id,
            number: t.number,
            startDate: t.startDate,
            endDate: t.endDate,
            isActive: t.isActive,
            status: t.isActive ? 'CURRENT' : (new Date() < t.startDate ? 'UPCOMING' : (new Date() > t.endDate ? 'COMPLETED' : 'CURRENT'))
        }))
    } : null;

    const formatPast = past.map((p: any) => ({
        id: p.id,
        name: p.name || p.label,
        startDate: p.startDate,
        endDate: p.endDate,
        closedAt: p.closedAt,
        studentCount: p._count.enrollments,
        termCount: p._count.terms
    }));

    return { current: formatCurrent, past: formatPast };
};

export const createAcademicYear = async (schoolId: string, data: any) => {
    return prisma.$transaction(async (tx: any) => {
        if (data.activateImmediately) {
            await tx.academicYear.updateMany({
                where: { schoolId },                 
                data: { isActive: false, isClosed: true, closedAt: new Date() }
            });
        }

        const newYear = await tx.academicYear.create({
            data: {
                schoolId,
                name: data.name,
                label: data.name, // compatibility
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                type: data.type,
                isActive: data.activateImmediately,
                terms: {
                    create: data.terms.map((t: any) => ({
                        number: t.number,
                        label: `Trimestre ${t.number}`,
                        startDate: new Date(t.startDate),
                        endDate: new Date(t.endDate)
                    }))
                }
            },
            include: { terms: true }
        });

        return newYear;
    });
};

export const closeAcademicYear = async (schoolId: string, id: string, userId: string, ignoreUnpaidDebts: boolean) => {
    // 1. Fetch Year
    const year = await prisma.academicYear.findFirst({
        where: { id, schoolId },
        include: {
            terms: { select: { id: true, number: true } },
            _count: {
                select: { enrollments: true }
            }
        }
    });

    if (!year) throw new Error("Année non trouvée");
    if (year.isClosed) throw new Error("Année déjà clôturée");

    // 2. Fetch real stats from deliberations of terms in this year
    // We count students based on the decision in DelibResult
    // Usually, the final decision is in the last term's deliberation
    const termIds = year.terms.map(t => t.id);
    const results = await prisma.delibResult.findMany({
        where: { deliberation: { termId: { in: termIds } } },
        select: { decision: true, studentId: true, deliberation: { select: { term: { select: { number: true } } } } }
    });

    // Strategy: take the latest available decision for each student
    const studentDecisions = new Map<string, string>();
    for (const r of results) {
        // Simple logic: if multiple terms have deliberations, the one with highest number wins (final)
        studentDecisions.set(r.studentId, r.decision);
    }

    const decisions = Array.from(studentDecisions.values());
    const admitted = decisions.filter(d => ['REUSSITE', 'PRODUIT', 'PASSE_SANS_ECHEC', 'EXEMPT'].includes(d.toUpperCase())).length;
    const failed = decisions.filter(d => ['ECHEC', 'AJOURNE', 'NON_PRODUIT', 'REDOUBLE'].includes(d.toUpperCase())).length;

    const updated = await prisma.academicYear.update({
        where: { id },
        data: {
            isActive: false,
            isClosed: true,
            closedAt: new Date(),
            closedById: userId
        }
    });

    return {
        academicYear: updated,
        statistics: {
            totalStudents: year._count.enrollments,
            admitted: admitted || 0,
            failed: failed || 0,
            undecided: Math.max(0, year._count.enrollments - (admitted + failed))
        }
    };
};

export const updateAcademicYear = async (schoolId: string, id: string, data: any) => {
    return prisma.$transaction(async (tx: any) => {
        const year = await tx.academicYear.findFirst({
            where: { id, schoolId }
        });

        if (!year) throw new Error("Année non trouvée");
        if (year.isClosed) throw new Error("Impossible de modifier une année clôturée");

        // Supprimer les anciens termes
        await tx.term.deleteMany({
            where: { academicYearId: id }
        });

        // Mettre à jour l'année et recréer les termes
        const updated = await tx.academicYear.update({
            where: { id },
            data: {
                name: data.name,
                label: data.name,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                type: data.type,
                terms: {
                    create: data.terms.map((t: any) => ({
                        number: t.number,
                        label: `Trimestre ${t.number}`,
                        startDate: new Date(t.startDate),
                        endDate: new Date(t.endDate)
                    }))
                }
            },
            include: { terms: { orderBy: { number: 'asc' } } }
        });

        return updated;
    });
};

export const activateAcademicYear = async (schoolId: string, id: string) => {
    return prisma.$transaction(async (tx) => {
        // 1. Deactivate all years for this school
        await tx.academicYear.updateMany({
            where: { schoolId },
            data: { isActive: false }
        });

        // 2. Activate target year
        const updated = await tx.academicYear.update({
            where: { id, schoolId },
            data: { isActive: true }
        });

        return updated;
    });
};

export const activateTerm = async (schoolId: string, termId: string) => {
    return prisma.$transaction(async (tx) => {
        // 1. Find term to get its academicYearId
        const term = await tx.term.findUnique({
            where: { id: termId },
            include: { academicYear: true }
        });

        if (!term || term.academicYear.schoolId !== schoolId) {
            throw new Error("Période non trouvée");
        }

        // 2. Deactivate all terms in this academic year
        await tx.term.updateMany({
            where: { academicYearId: term.academicYearId },
            data: { isActive: false }
        });

        // 3. Activate target term
        const updated = await tx.term.update({
            where: { id: termId },
            data: { isActive: true }
        });

        // 4. Ensure academic year is also active
        await tx.academicYear.update({
            where: { id: term.academicYearId },
            data: { isActive: true }
        });

        // 5. Deactivate other years for school (safety)
        await tx.academicYear.updateMany({
            where: { schoolId, NOT: { id: term.academicYearId } },
            data: { isActive: false }
        });

        return updated;
    });
};
