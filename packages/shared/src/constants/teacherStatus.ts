export const TEACHER_STATUS = {
    ACTIF: { label: 'Actif', color: '#1B5E20' },
    CONGE: { label: 'En congé', color: '#F57F17' },
    SUSPENDU: { label: 'Suspendu', color: '#C62828' },
    ARCHIVE: { label: 'Archivé', color: '#757575' },
} as const;

export type TeacherStatusKey = keyof typeof TEACHER_STATUS;

export const CONTRACT_TYPES = ['PERMANENT', 'TEMPORAIRE', 'VACATION', 'STAGIAIRE'] as const;

export const ADMINISTRATIVE_FUNCTIONS = [
    'AUCUNE',
    'PREFET',
    'DIRECTEUR',
    'CHEF_TRAVAUX',
    'SURVEILLANT',
] as const;
