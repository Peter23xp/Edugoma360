import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────
export type Sexe = 'M' | 'F';

export type StudentStatus =
    | 'NOUVEAU'
    | 'REDOUBLANT'
    | 'TRANSFERE'
    | 'DEPLACE'
    | 'REFUGIE'
    | 'ARCHIVE';

// ── Student Interface ─────────────────────────────────────────────────────────
export interface Student {
    id: string;
    schoolId: string;
    matricule: string;
    nom: string;
    postNom: string;
    prenom?: string | null;
    sexe: Sexe;
    dateNaissance: Date | string;
    lieuNaissance: string;
    nationalite: string;
    photoUrl?: string | null;
    nomPere?: string | null;
    telPere?: string | null;
    nomMere?: string | null;
    telMere?: string | null;
    nomTuteur?: string | null;
    telTuteur?: string | null;
    statut: StudentStatus;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// ── Enrollment Interface ──────────────────────────────────────────────────────
export interface Enrollment {
    id: string;
    studentId: string;
    classId: string;
    academicYearId: string;
    ecoleOrigine?: string | null;
    resultatTenasosp?: number | null;
    enrolledAt: Date | string;
}

// ── Zod Schemas for Validation ────────────────────────────────────────────────
export const CreateStudentSchema = z.object({
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    postNom: z.string().min(2, 'Le post-nom doit contenir au moins 2 caractères'),
    prenom: z.string().optional(),
    sexe: z.enum(['M', 'F']),
    dateNaissance: z.string().or(z.date()),
    lieuNaissance: z.string().min(2, 'Le lieu de naissance est requis'),
    nationalite: z.string().default('Congolaise'),
    nomPere: z.string().optional(),
    telPere: z.string().regex(/^\+243\d{9}$/, 'Format: +243XXXXXXXXX').optional().or(z.literal('')),
    nomMere: z.string().optional(),
    telMere: z.string().regex(/^\+243\d{9}$/, 'Format: +243XXXXXXXXX').optional().or(z.literal('')),
    nomTuteur: z.string().optional(),
    telTuteur: z.string().regex(/^\+243\d{9}$/, 'Format: +243XXXXXXXXX').optional().or(z.literal('')),
    statut: z.enum(['NOUVEAU', 'REDOUBLANT', 'TRANSFERE', 'DEPLACE', 'REFUGIE']).default('NOUVEAU'),
    classId: z.string().uuid('Classe requise'),
    academicYearId: z.string().uuid('Année académique requise'),
    ecoleOrigine: z.string().optional(),
    resultatTenasosp: z.number().optional(),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;

export const UpdateStudentSchema = CreateStudentSchema.partial().omit({
    classId: true,
    academicYearId: true,
});

export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;

// ── Display Helper ────────────────────────────────────────────────────────────
/**
 * Format un nom congolais dans l'ordre officiel : NOM POSTNOM Prénom
 */
export function formatStudentName(student: Pick<Student, 'nom' | 'postNom' | 'prenom'>): string {
    const parts = [student.nom.toUpperCase(), student.postNom.toUpperCase()];
    if (student.prenom) {
        parts.push(student.prenom);
    }
    return parts.join(' ');
}
