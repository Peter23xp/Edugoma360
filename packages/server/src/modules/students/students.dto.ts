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
    perPage: z.coerce.number().optional().default(20),
    search: z.string().optional(),
    classId: z.string().uuid().optional(),
    sectionId: z.string().uuid().optional(),
    statut: z.enum(['NOUVEAU', 'REDOUBLANT', 'TRANSFERE', 'DEPLACE', 'REFUGIE', 'ARCHIVE']).optional(),
    sexe: z.enum(['M', 'F']).optional(),
    sortBy: z.string().optional().default('nom'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
