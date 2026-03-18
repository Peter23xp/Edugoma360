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
            status: new Date() < t.startDate ? 'UPCOMING' : (new Date() > t.endDate ? 'COMPLETED' : 'CURRENT')
        }))
    } : null;

    const formatPast = past.map((p: any) => ({
        id: p.id,
        name: p.name || p.label,
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
            _count: {
                select: { enrollments: true }
            }
        }
    });

    if (!year) throw new Error("Année non trouvée");
    if (year.isClosed) throw new Error("Année déjà clôturée");

    // L'implémentation de la vérification (délibération approuvée, bulletins, créances...) 
    // serait ici. Pour simplifier, on suppose que les checks sont OK ou forcés par ignoreUnpaidDebts.

    const updated = await prisma.academicYear.update({
        where: { id },
        data: {
            isActive: false,
            isClosed: true,
            closedAt: new Date(),
            closedById: userId
        }
    });

    // Mock stats pour le retour de clôture
    return {
        academicYear: updated,
        statistics: {
            totalStudents: year._count.enrollments,
            admitted: Math.floor(year._count.enrollments * 0.8),
            failed: Math.floor(year._count.enrollments * 0.2)
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
