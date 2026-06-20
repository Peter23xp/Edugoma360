import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSchool = async (schoolId: string) => {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) return null;

    // Migrate old fields to new schema fields if not yet filled
    const migrated = {
        ...school,
        nomOfficiel: school.nomOfficiel || (school as any).name || null,
        nomCourt:    school.nomCourt    || (school as any).name || null,
        telephonePrincipal: school.telephonePrincipal || (school as any).telephone || null,
        commune: school.commune || (school as any).commune || null,
        avenue:  school.avenue  || (school as any).adresse  || null,
        type: (school.type === 'PRIVE' ? 'PRIVEE' : school.type) as any,
    };

    return migrated;
};

export const updateSchool = async (schoolId: string, data: any, logoUrls?: any) => {
    const defaultSchool = await prisma.school.findUnique({ where: { id: schoolId } });

    // Map Prisma schema properly
    const payload: any = {
        nomOfficiel: data.nomOfficiel,
        nomCourt: data.nomCourt,
        name: data.nomOfficiel, // Fallback for existing components
        province: data.province,
        ville: data.ville,
        commune: data.commune,
        avenue: data.avenue,
        numero: data.numero,
        reference: data.reference,
        telephonePrincipal: data.telephonePrincipal,
        telephone: data.telephonePrincipal, // Fallback
        telephoneSecondaire: data.telephoneSecondaire,
        email: data.email,
        siteWeb: data.siteWeb,
        type: data.type,
        numeroAgrement: data.numeroAgrement,
        dateAgrement: data.dateAgrement ? new Date(data.dateAgrement) : undefined,
        devise: data.devise,
        langueEnseignement: data.langueEnseignement,
        systemeEvaluation: data.systemeEvaluation,
        nombrePeriodes: data.nombrePeriodes,
    };

    if (data.code && !defaultSchool?.code) {
        payload.code = data.code; 
    }

    if (logoUrls) {
        payload.logoUrl = logoUrls.original;
        payload.logoThumbnailUrl = logoUrls.thumbnail;
        payload.logoIconUrl = logoUrls.icon;
    }

    if (defaultSchool) {
        return await prisma.school.update({
            where: { id: defaultSchool.id },
            data: payload
        });
    } else {
        // Créer une nouvelle école si elle n'existe pas encore
        return await prisma.school.create({
            data: { ...payload, id: schoolId }
        });
    }
};
