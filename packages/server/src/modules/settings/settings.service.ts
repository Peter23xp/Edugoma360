import prisma from '../../lib/prisma';

export class SettingsService {
    async getAll(schoolId: string) {
        const settings = await prisma.setting.findMany({ where: { schoolId } });
        const result: Record<string, any> = {};
        for (const s of settings) {
            try { result[s.key] = JSON.parse(s.value); }
            catch { result[s.key] = s.value; }
        }
        return result;
    }

    async set(schoolId: string, key: string, value: any) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        return prisma.setting.upsert({
            where: { schoolId_key: { schoolId, key } },
            update: { value: stringValue },
            create: { schoolId, key, value: stringValue },
        });
    }

    async get(schoolId: string, key: string) {
        const setting = await prisma.setting.findUnique({
            where: { schoolId_key: { schoolId, key } },
        });
        if (!setting) return null;
        try { return JSON.parse(setting.value); }
        catch { return setting.value; }
    }

    async getAcademicYears(schoolId: string) {
        console.log(`[SETTINGS] Fetching academic years for school: ${schoolId}`);
        try {
            return await prisma.academicYear.findMany({
                where: { schoolId },
                include: { terms: true },
                orderBy: { startDate: 'desc' },
            });
        } catch (error) {
            console.error('[SETTINGS] Error in getAcademicYears:', error);
            throw error;
        }
    }

    async createAcademicYear(schoolId: string, data: {
        label: string; startDate: string; endDate: string;
        terms?: Array<{ number: number; label: string; startDate: string; endDate: string }>;
    }) {
        console.log(`[SETTINGS] Creating academic year for school: ${schoolId}`, data);
        return prisma.$transaction(async (tx) => {
            const year = await tx.academicYear.create({
                data: {
                    schoolId,
                    label: data.label,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    isActive: false,
                },
            });

            if (data.terms && Array.isArray(data.terms)) {
                for (const term of data.terms) {
                    await tx.term.create({
                        data: {
                            academicYearId: year.id,
                            number: term.number,
                            label: term.label,
                            startDate: new Date(term.startDate),
                            endDate: new Date(term.endDate),
                        },
                    });
                }
            }

            return year;
        });
    }

    async activateAcademicYear(schoolId: string, yearId: string) {
        return prisma.$transaction(async (tx) => {
            // Deactivate all academic years for this school
            await tx.academicYear.updateMany({
                where: { schoolId },
                data: { isActive: false },
            });
            // Activate the target year
            return tx.academicYear.update({
                where: { id: yearId },
                data: { isActive: true },
                include: { terms: true },
            });
        });
    }

    async getClasses(schoolId: string) {
        return prisma.class.findMany({
            where: { schoolId, isActive: true },
            include: { section: true, _count: { select: { enrollments: true } } },
            orderBy: { name: 'asc' },
        });
    }

    async getSubjects(schoolId: string) {
        return prisma.subject.findMany({
            where: { schoolId },
            include: { sections: { include: { section: true } } },
            orderBy: { displayOrder: 'asc' },
        });
    }

    async getContext(schoolId: string) {
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
        });

        const activeYear = await prisma.academicYear.findFirst({
            where: { schoolId, isActive: true },
            include: { terms: true },
        });

        return {
            school,
            academicYear: activeYear,
        };
    }

    async getTerms(schoolId: string) {
        const activeYear = await prisma.academicYear.findFirst({
            where: { schoolId, isActive: true },
            include: { terms: { orderBy: { number: 'asc' } } },
        });

        return activeYear?.terms || [];
    }

    async getSections(schoolId: string) {
        return prisma.section.findMany({
            where: { schoolId },
            orderBy: { name: 'asc' },
        });
    }
}

export const settingsService = new SettingsService();
