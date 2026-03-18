import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSchool = async () => {
    // Only one school per installation
    return await prisma.school.findFirst();
};

export const updateSchool = async (data: any, logoUrls?: any) => {
    const defaultSchool = await prisma.school.findFirst();

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
        return await prisma.school.create({
            data: payload
        });
    }
};
