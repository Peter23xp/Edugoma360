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
        return prisma.academicYear.findMany({
            where: { schoolId },
            include: { terms: true },
            orderBy: { startDate: 'desc' },
        });
    }

    async createAcademicYear(schoolId: string, data: {
        label: string; startDate: string; endDate: string;
        terms: Array<{ number: number; label: string; startDate: string; endDate: string }>;
    }) {
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

            return year;
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
}

export const settingsService = new SettingsService();
