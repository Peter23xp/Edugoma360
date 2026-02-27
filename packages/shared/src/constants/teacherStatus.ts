/**
 * Teacher status constants — used across the application
 * IMPORTANT: These values must match the Prisma schema enum values exactly.
 */
export const TEACHER_STATUS = {
    ACTIF: { label: 'Actif', color: '#166534' },
    EN_CONGE: { label: 'En congé', color: '#B45309' },
    SUSPENDU: { label: 'Suspendu', color: '#9B1C1C' },
    ARCHIVE: { label: 'Archivé', color: '#6B7280' },
} as const;

export type TeacherStatusKey = keyof typeof TEACHER_STATUS;

export const CONTRACT_TYPES = ['PERMANENT', 'TEMPORAIRE', 'VACATION', 'STAGIAIRE'] as const;
export type ContractTypeKey = typeof CONTRACT_TYPES[number];

export const ADMINISTRATIVE_FUNCTIONS = [
    'AUCUNE',
    'PREFET',
    'DIRECTEUR',
    'CHEF_TRAVAUX',
    'SURVEILLANT',
] as const;
export type AdminFunctionKey = typeof ADMINISTRATIVE_FUNCTIONS[number];

/** Human-readable labels for leave types */
export const ABSENCE_TYPE_LABELS: Record<string, string> = {
    MALADIE: 'Maladie',
    PERSONNEL: 'Personnel',
    FORMATION: 'Formation',
    MATERNITE: 'Maternité',
    DECES: 'Décès familial',
    ANNUEL: 'Annuel',
    CIRCONSTANCE: 'Circonstance',
};

/** Human-readable labels for leave status */
export const ABSENCE_STATUS_LABELS: Record<string, string> = {
    PENDING: 'En attente',
    APPROVED: 'Approuvé',
    REJECTED: 'Refusé',
    CANCELLED: 'Annulé',
};
