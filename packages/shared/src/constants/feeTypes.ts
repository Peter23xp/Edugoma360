// ── Types de Frais Scolaires Officiels — RDC ─────────────────────────────────

export interface FeeTypeDefinition {
    name: string;
    category: FeeCategory;
    termNumber: number | null; // null = annuel
    isRequired: boolean;
    description: string;
}

export type FeeCategory =
    | 'MINERVAL'
    | 'FONCTIONNEMENT'
    | 'EXAMEN'
    | 'ASSURANCE'
    | 'DIVERS';

export const FEE_CATEGORY_LABELS: Record<FeeCategory, string> = {
    MINERVAL: 'Minerval',
    FONCTIONNEMENT: 'Frais de Fonctionnement',
    EXAMEN: 'Frais d\'Examen',
    ASSURANCE: 'Assurance Scolaire',
    DIVERS: 'Frais Divers',
};

/**
 * Types de frais scolaires par défaut (montants à configurer par école)
 * Montants en FC — configurables dans les paramètres école
 */
export const DEFAULT_FEE_TYPES: FeeTypeDefinition[] = [
    {
        name: 'Minerval (Frais scolaires annuels)',
        category: 'MINERVAL',
        termNumber: null,
        isRequired: true,
        description: 'Frais d\'inscription annuels fixés par le MEPST',
    },
    {
        name: 'Frais de Fonctionnement — Trimestre 1',
        category: 'FONCTIONNEMENT',
        termNumber: 1,
        isRequired: true,
        description: 'Participation aux frais de fonctionnement du 1er trimestre',
    },
    {
        name: 'Frais de Fonctionnement — Trimestre 2',
        category: 'FONCTIONNEMENT',
        termNumber: 2,
        isRequired: true,
        description: 'Participation aux frais de fonctionnement du 2ème trimestre',
    },
    {
        name: 'Frais de Fonctionnement — Trimestre 3',
        category: 'FONCTIONNEMENT',
        termNumber: 3,
        isRequired: true,
        description: 'Participation aux frais de fonctionnement du 3ème trimestre',
    },
    {
        name: 'Frais d\'Examen d\'État (6ème)',
        category: 'EXAMEN',
        termNumber: null,
        isRequired: true,
        description: 'Frais d\'inscription à l\'Examen d\'État (uniquement 6ème année)',
    },
    {
        name: 'Assurance Scolaire',
        category: 'ASSURANCE',
        termNumber: null,
        isRequired: false,
        description: 'Couverture assurance accidents pour l\'année scolaire',
    },
    {
        name: 'Frais de Laboratoire',
        category: 'DIVERS',
        termNumber: null,
        isRequired: false,
        description: 'Frais pour l\'utilisation des laboratoires (sections scientifique et technique)',
    },
    {
        name: 'Frais de Stage',
        category: 'DIVERS',
        termNumber: null,
        isRequired: false,
        description: 'Frais de stage obligatoire (sections technique et pédagogique)',
    },
];

/**
 * Montants de référence en FC (ajustés par chaque école)
 */
export const REFERENCE_AMOUNTS_FC: Record<string, number> = {
    'Minerval (Frais scolaires annuels)': 5000,
    'Frais de Fonctionnement — Trimestre 1': 75000,
    'Frais de Fonctionnement — Trimestre 2': 75000,
    'Frais de Fonctionnement — Trimestre 3': 75000,
    'Frais d\'Examen d\'État (6ème)': 50000,
    'Assurance Scolaire': 15000,
    'Frais de Laboratoire': 25000,
    'Frais de Stage': 30000,
};
