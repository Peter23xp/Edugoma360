/**
 * EduGoma 360 — Shared Teacher Module Types (SCR-018 to SCR-020)
 *
 * NOTE: user.types.ts has legacy 'Teacher' and 'TeacherStatus' for payroll purposes.
 * These types here are the FULL teacher profile types for the teacher management module.
 */

export type TeacherModuleStatus = 'ACTIF' | 'EN_CONGE' | 'SUSPENDU' | 'ARCHIVE';

export type ContractType = 'PERMANENT' | 'TEMPORAIRE' | 'VACATION' | 'STAGIAIRE';

export type DiplomeLevel = 'D6' | 'GRADUAT' | 'LICENCE' | 'MASTER' | 'DOCTORAT';

export type AdministrativeFunction =
    | 'AUCUNE'
    | 'PREFET'
    | 'DIRECTEUR'
    | 'CHEF_TRAVAUX'
    | 'SURVEILLANT';

export interface TeacherCertificate {
    id: string;
    nom: string;
    organisme: string;
    annee: number;
    fichierUrl?: string;
}

export interface TeacherAssignmentDetail {
    id: string;
    teacherId: string;
    classId: string;
    subjectId: string;
    volumeHoraire: number;
    academicYearId: string;
    class: {
        id: string;
        name: string;
        section?: { id: string; name: string; code: string };
    };
    subject: {
        id: string;
        name: string;
        code: string;
    };
}

export interface TeacherProfile {
    id: string;
    schoolId: string;
    userId?: string;

    // Identity
    nom: string;
    postNom: string;
    prenom?: string;
    sexe: 'M' | 'F';
    dateNaissance: string | Date;
    lieuNaissance: string;
    nationalite: string;
    photoUrl?: string;

    // Contact
    telephone: string;
    email?: string;
    adresse: string;

    // Professional
    matricule: string;
    statut: TeacherModuleStatus;
    typeContrat: ContractType;
    fonction?: AdministrativeFunction;
    dateEmbauche: string | Date;

    // Academic
    niveauEtudes: DiplomeLevel;
    domaineFormation: string;
    universite: string;
    anneeObtention: number;
    specialisations?: string;

    // Leave balance
    congeGlobal: number;  // 20 days per year
    congePris: number;    // days taken so far

    // Optional RDC-specific fields
    numeroSecope?: string;
    compteBancaire?: string;

    // Relations
    subjects?: Array<{ id: string; name: string; code: string }>;
    assignments?: TeacherAssignmentDetail[];
    certificats?: TeacherCertificate[];

    isActive: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface TeacherModuleStats {
    totalTeachers: number;
    activeTeachers: number;
    onLeave: number;
    suspended: number;
    studentTeacherRatio: number;
    avgClassesPerTeacher: number;
}

export interface TeacherFilters {
    search?: string;
    status?: TeacherModuleStatus;
    subjectId?: string;
    section?: string;
    page?: number;
    limit?: number;
}
