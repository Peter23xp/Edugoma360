import { z } from 'zod';

export const CreateStudentDto = z.object({
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    postNom: z.string().min(2, 'Le post-nom doit contenir au moins 2 caractères'),
    prenom: z.string().optional(),
    sexe: z.enum(['M', 'F']),
    dateNaissance: z.string(),
    lieuNaissance: z.string().min(2),
    nationalite: z.string().default('Congolaise'),
    nomPere: z.string().optional(),
    telPere: z.string().optional(),
    nomMere: z.string().optional(),
    telMere: z.string().optional(),
    nomTuteur: z.string().optional(),
    telTuteur: z.string().optional(),
    statut: z.enum(['NOUVEAU', 'REDOUBLANT', 'TRANSFERE', 'DEPLACE', 'REFUGIE']).default('NOUVEAU'),
    classId: z.string().uuid(),
    academicYearId: z.string().uuid(),
    ecoleOrigine: z.string().optional(),
    resultatTenasosp: z.number().optional(),
});

export const UpdateStudentDto = CreateStudentDto.partial().omit({
    classId: true,
    academicYearId: true,
});

export const StudentQueryDto = z.object({
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(25),
    q: z.string().optional(),
    classId: z.string().optional(),
    section: z.string().optional(),
    status: z.enum(['NOUVEAU', 'REDOUBLANT', 'TRANSFERE', 'DEPLACE', 'REFUGIE', 'ARCHIVE']).optional(),
    sexe: z.enum(['M', 'F']).optional(),
    sortBy: z.string().optional().default('nom'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    // Legacy support
    search: z.string().optional(),
    perPage: z.coerce.number().optional(),
    statut: z.enum(['NOUVEAU', 'REDOUBLANT', 'TRANSFERE', 'DEPLACE', 'REFUGIE', 'ARCHIVE']).optional(),
    sectionId: z.string().optional(),
});

export const BatchArchiveDto = z.object({
    ids: z.array(z.string().uuid()).min(1, 'Il faut au moins un élève'),
    reason: z.string().optional().default('Archivage groupé'),
});

export const ExportQueryDto = z.object({
    ids: z.string().optional(), // CSV of IDs
    classId: z.string().optional(),
    section: z.string().optional(),
    status: z.string().optional(),
    q: z.string().optional(),
});
