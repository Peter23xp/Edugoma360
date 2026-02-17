// ── Sections & Options du Système Éducatif Congolais ─────────────────────────
// Conforme au Programme National de l'EPSP/MEPST

export interface SectionDefinition {
    code: string;
    name: string;
    fullName: string;
    years: number[]; // Années concernées (1-6)
    options?: OptionDefinition[];
    defaultSubjects: SubjectDefinition[];
}

export interface OptionDefinition {
    code: string;
    name: string;
    specificSubjects: SubjectDefinition[];
}

export interface SubjectDefinition {
    name: string;
    abbreviation: string;
    maxScore: number;
    coefficient: number;
    isEliminatory: boolean;
    elimThreshold?: number;
}

// ── Tronc Commun (1ère et 2ème année) ────────────────────────────────────────
const TRONC_COMMUN_SUBJECTS: SubjectDefinition[] = [
    { name: 'Mathématiques', abbreviation: 'Math', maxScore: 20, coefficient: 4, isEliminatory: true, elimThreshold: 6 },
    { name: 'Français', abbreviation: 'Fr', maxScore: 20, coefficient: 4, isEliminatory: true, elimThreshold: 6 },
    { name: 'Anglais', abbreviation: 'Angl', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Kiswahili', abbreviation: 'Kisw', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Physique', abbreviation: 'Phys', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Chimie', abbreviation: 'Chim', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Biologie', abbreviation: 'Bio', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Géographie', abbreviation: 'Géo', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Histoire', abbreviation: 'Hist', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Éducation Civique', abbreviation: 'E.Civ', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Éducation Physique', abbreviation: 'E.P', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Religion', abbreviation: 'Rel', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Informatique', abbreviation: 'Info', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Dessin', abbreviation: 'Des', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Latin', abbreviation: 'Lat', maxScore: 20, coefficient: 2, isEliminatory: false },
];

// ── Section Scientifique ──────────────────────────────────────────────────────
const SCIENTIFIQUE_SUBJECTS: SubjectDefinition[] = [
    { name: 'Mathématiques', abbreviation: 'Math', maxScore: 20, coefficient: 5, isEliminatory: true, elimThreshold: 6 },
    { name: 'Physique', abbreviation: 'Phys', maxScore: 20, coefficient: 4, isEliminatory: true, elimThreshold: 6 },
    { name: 'Chimie', abbreviation: 'Chim', maxScore: 20, coefficient: 4, isEliminatory: true, elimThreshold: 6 },
    { name: 'Biologie', abbreviation: 'Bio', maxScore: 20, coefficient: 3, isEliminatory: false },
    { name: 'Français', abbreviation: 'Fr', maxScore: 20, coefficient: 3, isEliminatory: true, elimThreshold: 6 },
    { name: 'Anglais', abbreviation: 'Angl', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Géographie', abbreviation: 'Géo', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Histoire', abbreviation: 'Hist', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Éducation Civique', abbreviation: 'E.Civ', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Éducation Physique', abbreviation: 'E.P', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Informatique', abbreviation: 'Info', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Religion', abbreviation: 'Rel', maxScore: 20, coefficient: 1, isEliminatory: false },
];

// ── Section Commerciale & Gestion ─────────────────────────────────────────────
const COMMERCIALE_SUBJECTS: SubjectDefinition[] = [
    { name: 'Comptabilité', abbreviation: 'Compta', maxScore: 20, coefficient: 5, isEliminatory: true, elimThreshold: 6 },
    { name: 'Économie Politique', abbreviation: 'Eco.Pol', maxScore: 20, coefficient: 4, isEliminatory: true, elimThreshold: 6 },
    { name: 'Droit', abbreviation: 'Dr', maxScore: 20, coefficient: 3, isEliminatory: false },
    { name: 'Mathématiques Commerciales', abbreviation: 'M.Com', maxScore: 20, coefficient: 4, isEliminatory: true, elimThreshold: 6 },
    { name: 'Français', abbreviation: 'Fr', maxScore: 20, coefficient: 3, isEliminatory: true, elimThreshold: 6 },
    { name: 'Anglais', abbreviation: 'Angl', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Correspondance Commerciale', abbreviation: 'C.Com', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Géographie Économique', abbreviation: 'G.Eco', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Histoire', abbreviation: 'Hist', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Éducation Civique', abbreviation: 'E.Civ', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Informatique', abbreviation: 'Info', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Religion', abbreviation: 'Rel', maxScore: 20, coefficient: 1, isEliminatory: false },
];

// ── Section Pédagogique ───────────────────────────────────────────────────────
const PEDAGOGIQUE_SUBJECTS: SubjectDefinition[] = [
    { name: 'Pédagogie Générale', abbreviation: 'Péda.G', maxScore: 20, coefficient: 5, isEliminatory: true, elimThreshold: 6 },
    { name: 'Psychologie', abbreviation: 'Psych', maxScore: 20, coefficient: 4, isEliminatory: true, elimThreshold: 6 },
    { name: 'Didactique des Disciplines', abbreviation: 'Did', maxScore: 20, coefficient: 4, isEliminatory: false },
    { name: 'Français', abbreviation: 'Fr', maxScore: 20, coefficient: 3, isEliminatory: true, elimThreshold: 6 },
    { name: 'Mathématiques', abbreviation: 'Math', maxScore: 20, coefficient: 3, isEliminatory: false },
    { name: 'Sciences Naturelles', abbreviation: 'Sc.Nat', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Anglais', abbreviation: 'Angl', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Histoire', abbreviation: 'Hist', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Géographie', abbreviation: 'Géo', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Éducation Physique', abbreviation: 'E.P', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Éducation Civique', abbreviation: 'E.Civ', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Religion', abbreviation: 'Rel', maxScore: 20, coefficient: 1, isEliminatory: false },
];

// ── Section Littéraire ────────────────────────────────────────────────────────
const LITTERAIRE_SUBJECTS: SubjectDefinition[] = [
    { name: 'Français', abbreviation: 'Fr', maxScore: 20, coefficient: 5, isEliminatory: true, elimThreshold: 6 },
    { name: 'Philosophie', abbreviation: 'Phil', maxScore: 20, coefficient: 4, isEliminatory: true, elimThreshold: 6 },
    { name: 'Latin', abbreviation: 'Lat', maxScore: 20, coefficient: 4, isEliminatory: false },
    { name: 'Anglais', abbreviation: 'Angl', maxScore: 20, coefficient: 3, isEliminatory: false },
    { name: 'Histoire', abbreviation: 'Hist', maxScore: 20, coefficient: 3, isEliminatory: false },
    { name: 'Géographie', abbreviation: 'Géo', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Mathématiques', abbreviation: 'Math', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Éducation Civique', abbreviation: 'E.Civ', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Éducation Physique', abbreviation: 'E.P', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Kiswahili', abbreviation: 'Kisw', maxScore: 20, coefficient: 2, isEliminatory: false },
    { name: 'Religion', abbreviation: 'Rel', maxScore: 20, coefficient: 1, isEliminatory: false },
];

// ── Section Technique ─────────────────────────────────────────────────────────
const TECHNIQUE_BASE_SUBJECTS: SubjectDefinition[] = [
    { name: 'Mathématiques', abbreviation: 'Math', maxScore: 20, coefficient: 3, isEliminatory: true, elimThreshold: 6 },
    { name: 'Français', abbreviation: 'Fr', maxScore: 20, coefficient: 2, isEliminatory: true, elimThreshold: 6 },
    { name: 'Anglais', abbreviation: 'Angl', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Physique', abbreviation: 'Phys', maxScore: 20, coefficient: 3, isEliminatory: false },
    { name: 'Dessin Technique', abbreviation: 'D.Tech', maxScore: 20, coefficient: 3, isEliminatory: false },
    { name: 'Éducation Civique', abbreviation: 'E.Civ', maxScore: 20, coefficient: 1, isEliminatory: false },
    { name: 'Religion', abbreviation: 'Rel', maxScore: 20, coefficient: 1, isEliminatory: false },
];

// ── All Sections ──────────────────────────────────────────────────────────────
export const SECTIONS: SectionDefinition[] = [
    {
        code: 'TC',
        name: 'Tronc Commun',
        fullName: 'Cycle d\'Orientation — Tronc Commun',
        years: [1, 2],
        defaultSubjects: TRONC_COMMUN_SUBJECTS,
    },
    {
        code: 'SC',
        name: 'Scientifique',
        fullName: 'Section Scientifique',
        years: [3, 4, 5, 6],
        defaultSubjects: SCIENTIFIQUE_SUBJECTS,
    },
    {
        code: 'HCG',
        name: 'Commerciale & Gestion',
        fullName: 'Section Commerciale et Administrative / Gestion',
        years: [3, 4, 5, 6],
        defaultSubjects: COMMERCIALE_SUBJECTS,
    },
    {
        code: 'PEDA',
        name: 'Pédagogique',
        fullName: 'Section Pédagogique',
        years: [3, 4, 5, 6],
        defaultSubjects: PEDAGOGIQUE_SUBJECTS,
    },
    {
        code: 'LIT',
        name: 'Littéraire',
        fullName: 'Section Littéraire',
        years: [3, 4, 5, 6],
        defaultSubjects: LITTERAIRE_SUBJECTS,
    },
    {
        code: 'HT',
        name: 'Technique',
        fullName: 'Section Technique',
        years: [3, 4, 5, 6],
        defaultSubjects: TECHNIQUE_BASE_SUBJECTS,
        options: [
            {
                code: 'ELEC',
                name: 'Électricité',
                specificSubjects: [
                    { name: 'Électricité Générale', abbreviation: 'E.Gen', maxScore: 20, coefficient: 5, isEliminatory: true, elimThreshold: 6 },
                    { name: 'Électronique', abbreviation: 'Elec', maxScore: 20, coefficient: 4, isEliminatory: false },
                    { name: 'Installations Électriques', abbreviation: 'I.Elec', maxScore: 20, coefficient: 3, isEliminatory: false },
                    { name: 'Travaux Pratiques Électricité', abbreviation: 'TP.E', maxScore: 20, coefficient: 4, isEliminatory: false },
                ],
            },
            {
                code: 'MECA',
                name: 'Mécanique',
                specificSubjects: [
                    { name: 'Mécanique Appliquée', abbreviation: 'M.App', maxScore: 20, coefficient: 5, isEliminatory: true, elimThreshold: 6 },
                    { name: 'Technologie Mécanique', abbreviation: 'T.Méc', maxScore: 20, coefficient: 4, isEliminatory: false },
                    { name: 'Résistance des Matériaux', abbreviation: 'RDM', maxScore: 20, coefficient: 3, isEliminatory: false },
                    { name: 'Travaux Pratiques Mécanique', abbreviation: 'TP.M', maxScore: 20, coefficient: 4, isEliminatory: false },
                ],
            },
            {
                code: 'INFO',
                name: 'Informatique',
                specificSubjects: [
                    { name: 'Programmation', abbreviation: 'Prog', maxScore: 20, coefficient: 5, isEliminatory: true, elimThreshold: 6 },
                    { name: 'Systèmes d\'exploitation', abbreviation: 'S.Exp', maxScore: 20, coefficient: 3, isEliminatory: false },
                    { name: 'Réseaux Informatiques', abbreviation: 'Rés', maxScore: 20, coefficient: 3, isEliminatory: false },
                    { name: 'Base de Données', abbreviation: 'BDD', maxScore: 20, coefficient: 4, isEliminatory: false },
                    { name: 'Travaux Pratiques Informatique', abbreviation: 'TP.I', maxScore: 20, coefficient: 4, isEliminatory: false },
                ],
            },
            {
                code: 'BAT',
                name: 'Bâtiment',
                specificSubjects: [
                    { name: 'Construction', abbreviation: 'Cons', maxScore: 20, coefficient: 5, isEliminatory: true, elimThreshold: 6 },
                    { name: 'Topographie', abbreviation: 'Topo', maxScore: 20, coefficient: 3, isEliminatory: false },
                    { name: 'Matériaux de Construction', abbreviation: 'M.Con', maxScore: 20, coefficient: 3, isEliminatory: false },
                    { name: 'Travaux Pratiques Bâtiment', abbreviation: 'TP.B', maxScore: 20, coefficient: 4, isEliminatory: false },
                ],
            },
        ],
    },
];

/**
 * Get all subjects for a specific section (including option-specific subjects for Technique)
 */
export function getSectionSubjects(sectionCode: string, optionCode?: string): SubjectDefinition[] {
    const section = SECTIONS.find((s) => s.code === sectionCode);
    if (!section) return [];

    const subjects = [...section.defaultSubjects];

    if (optionCode && section.options) {
        const option = section.options.find((o) => o.code === optionCode);
        if (option) {
            subjects.push(...option.specificSubjects);
        }
    }

    return subjects;
}

/**
 * Get all available section codes
 */
export function getAllSectionCodes(): string[] {
    return SECTIONS.map((s) => s.code);
}

/**
 * Get section by code
 */
export function getSectionByCode(code: string): SectionDefinition | undefined {
    return SECTIONS.find((s) => s.code === code);
}

/**
 * Get available years for a section
 */
export function getSectionYears(sectionCode: string): number[] {
    const section = SECTIONS.find((s) => s.code === sectionCode);
    return section?.years ?? [];
}

/**
 * Generate class name in standard format: {year}{SectionCode}{letter}
 * e.g., "3ScA", "4PédB", "1TCA"
 */
export function generateClassName(year: number, sectionCode: string, letter: string = 'A'): string {
    return `${year}${sectionCode}${letter}`;
}
