import { z } from 'zod';
import { subYears } from 'date-fns';

export const step1Schema = z.object({
    nom: z.string().min(2).max(50).transform(s => s.toUpperCase()),
    postNom: z.string().min(2).max(50).transform(s => s.toUpperCase()),
    prenom: z.string().max(50).optional(),
    sexe: z.enum(['M', 'F']),
    dateNaissance: z.coerce.date()
        .min(new Date('1950-01-01'))
        .max(subYears(new Date(), 21), "L'enseignant doit avoir au moins 21 ans"),
    lieuNaissance: z.string().min(2).max(100),
    nationalite: z.string().min(2),
    telephone: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/, "Numéro congolais invalide"),
    email: z.string().email().optional().or(z.literal('')),
    adresse: z.string().min(10).max(200),
});

export const step2Schema = z.object({
    niveauEtudes: z.enum(['D6', 'GRADUAT', 'LICENCE', 'MASTER', 'DOCTORAT']),
    domaineFormation: z.string().min(2).max(100),
    universite: z.string().min(2).max(100),
    anneeObtention: z.coerce.number()
        .min(1980)
        .max(new Date().getFullYear()),
    specialisations: z.string().max(300).optional(),
    matieres: z.array(z.string()).min(1, "Au moins une matière requise"),
    certificats: z.array(z.object({
        nom: z.string(),
        organisme: z.string(),
        annee: z.coerce.number(),
        // fichier is handled via multipart/form-data, so we might just have URLs or metadata here
    })).optional()
});

export const step3Schema = z.object({
    statut: z.enum(['ACTIF', 'CONGE', 'SUSPENDU', 'ARCHIVE']).default('ACTIF'),
    dateEmbauche: z.coerce.date().max(new Date(), "Date future non autorisée"),
    typeContrat: z.enum(['PERMANENT', 'TEMPORAIRE', 'VACATION', 'STAGIAIRE']),
    fonction: z.enum(['AUCUNE', 'PREFET', 'DIRECTEUR', 'CHEF_TRAVAUX', 'SURVEILLANT']).optional(),
    affectations: z.array(z.object({
        matiereId: z.string().uuid(),
        classeId: z.string().uuid(),
        volumeHoraire: z.coerce.number().min(1).max(30)
    })).optional()
});

export const createTeacherSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export const updateTeacherSchema = createTeacherSchema.partial();
