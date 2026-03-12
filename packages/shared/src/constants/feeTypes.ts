// ── Types de Frais Scolaires — RDC ───────────────────────────────────────────

export type FeeTypeCode =
  | 'INSCRIPTION'
  | 'REINSCRIPTION'
  | 'FRAIS_SCOLAIRE'
  | 'MINERVAL'
  | 'FONCTIONNEMENT'
  | 'EXAMEN'
  | 'BULLETIN'
  | 'CANTINE'
  | 'TRANSPORT'
  | 'UNIFORME'
  | 'LIVRE'
  | 'ASSURANCE'
  | 'AUTRE';

export type FeeFrequency = 'MONTHLY' | 'TRIMESTRAL' | 'ANNUAL' | 'UNIQUE' | 'CUSTOM';
export type FeeScope = 'SCHOOL' | 'SECTION' | 'CLASS';

export interface FeeTypeDefinition {
  code: FeeTypeCode;
  label: string;
  frequency: FeeFrequency;
  required: boolean;
  description: string;
}

export const FEE_TYPES: Record<FeeTypeCode, FeeTypeDefinition> = {
  INSCRIPTION: {
    code: 'INSCRIPTION',
    label: "Frais d'inscription",
    frequency: 'UNIQUE',
    required: true,
    description: "Frais payés une seule fois à la première inscription",
  },
  REINSCRIPTION: {
    code: 'REINSCRIPTION',
    label: 'Frais de réinscription',
    frequency: 'ANNUAL',
    required: true,
    description: "Frais annuels pour les anciens élèves",
  },
  FRAIS_SCOLAIRE: {
    code: 'FRAIS_SCOLAIRE',
    label: 'Frais scolaires',
    frequency: 'TRIMESTRAL',
    required: true,
    description: "Frais scolaires payés par trimestre",
  },
  MINERVAL: {
    code: 'MINERVAL',
    label: 'Minerval mensuel',
    frequency: 'MONTHLY',
    required: true,
    description: "Frais mensuels de scolarité (9 mois: sept-juin)",
  },
  FONCTIONNEMENT: {
    code: 'FONCTIONNEMENT',
    label: 'Frais de fonctionnement',
    frequency: 'TRIMESTRAL',
    required: true,
    description: "Frais de fonctionnement de l'école",
  },
  EXAMEN: {
    code: 'EXAMEN',
    label: "Frais d'examen",
    frequency: 'TRIMESTRAL',
    required: true,
    description: "Frais d'examen par trimestre",
  },
  BULLETIN: {
    code: 'BULLETIN',
    label: 'Frais de bulletin',
    frequency: 'TRIMESTRAL',
    required: true,
    description: "Frais de bulletin par trimestre",
  },
  CANTINE: {
    code: 'CANTINE',
    label: 'Cantine',
    frequency: 'MONTHLY',
    required: false,
    description: "Frais de cantine mensuels (optionnel)",
  },
  TRANSPORT: {
    code: 'TRANSPORT',
    label: 'Transport scolaire',
    frequency: 'MONTHLY',
    required: false,
    description: "Frais de transport scolaire mensuels (optionnel)",
  },
  UNIFORME: {
    code: 'UNIFORME',
    label: 'Uniforme',
    frequency: 'UNIQUE',
    required: false,
    description: "Frais d'uniforme scolaire",
  },
  LIVRE: {
    code: 'LIVRE',
    label: 'Manuels scolaires',
    frequency: 'ANNUAL',
    required: false,
    description: "Frais de manuels scolaires annuels",
  },
  ASSURANCE: {
    code: 'ASSURANCE',
    label: 'Assurance scolaire',
    frequency: 'ANNUAL',
    required: false,
    description: "Assurance scolaire annuelle",
  },
  AUTRE: {
    code: 'AUTRE',
    label: 'Autre frais',
    frequency: 'CUSTOM',
    required: false,
    description: "Autre type de frais",
  },
};

export const FEE_TYPE_CODES = Object.keys(FEE_TYPES) as FeeTypeCode[];

export const FEE_FREQUENCY_LABELS: Record<FeeFrequency, string> = {
  MONTHLY: 'Mensuel (9 mois)',
  TRIMESTRAL: 'Trimestriel (3 fois)',
  ANNUAL: 'Annuel (1 fois)',
  UNIQUE: 'Paiement unique',
  CUSTOM: 'Personnalisé',
};

export const FEE_SCOPE_LABELS: Record<FeeScope, string> = {
  SCHOOL: "Toute l'école",
  SECTION: 'Sections spécifiques',
  CLASS: 'Classes spécifiques',
};

// ── Templates de frais prédéfinis ──────────────────────────────────────────────

export interface FeeTemplate {
  name: string;
  description: string;
  fees: Array<{
    type: FeeTypeCode;
    label: string;
    amount: number;
    frequency: FeeFrequency;
    scope: FeeScope;
    required: boolean;
  }>;
}

export const FEE_TEMPLATES: FeeTemplate[] = [
  {
    name: 'École Officielle RDC Standard',
    description: "Configuration standard pour une école publique/officielle en RDC",
    fees: [
      { type: 'INSCRIPTION', label: "Frais d'inscription nouveau", amount: 50000, frequency: 'UNIQUE', scope: 'SCHOOL', required: true },
      { type: 'REINSCRIPTION', label: 'Frais de réinscription', amount: 30000, frequency: 'ANNUAL', scope: 'SCHOOL', required: true },
      { type: 'MINERVAL', label: 'Minerval Tronc Commun', amount: 25000, frequency: 'MONTHLY', scope: 'SCHOOL', required: true },
      { type: 'EXAMEN', label: "Frais d'examen", amount: 10000, frequency: 'TRIMESTRAL', scope: 'SCHOOL', required: true },
      { type: 'BULLETIN', label: 'Frais de bulletin', amount: 3000, frequency: 'TRIMESTRAL', scope: 'SCHOOL', required: true },
    ],
  },
  {
    name: 'École Privée Goma Standard',
    description: "Configuration pour une école privée à Goma",
    fees: [
      { type: 'INSCRIPTION', label: "Frais d'inscription", amount: 100000, frequency: 'UNIQUE', scope: 'SCHOOL', required: true },
      { type: 'REINSCRIPTION', label: 'Frais de réinscription', amount: 75000, frequency: 'ANNUAL', scope: 'SCHOOL', required: true },
      { type: 'MINERVAL', label: 'Minerval mensuel', amount: 50000, frequency: 'MONTHLY', scope: 'SCHOOL', required: true },
      { type: 'EXAMEN', label: "Frais d'examen", amount: 15000, frequency: 'TRIMESTRAL', scope: 'SCHOOL', required: true },
      { type: 'BULLETIN', label: 'Frais de bulletin', amount: 5000, frequency: 'TRIMESTRAL', scope: 'SCHOOL', required: true },
      { type: 'CANTINE', label: 'Cantine', amount: 30000, frequency: 'MONTHLY', scope: 'SCHOOL', required: false },
      { type: 'TRANSPORT', label: 'Transport scolaire', amount: 25000, frequency: 'MONTHLY', scope: 'SCHOOL', required: false },
    ],
  },
  {
    name: 'École Conventionnée',
    description: "Configuration pour une école conventionnée (catholique, protestante, etc.)",
    fees: [
      { type: 'INSCRIPTION', label: "Frais d'inscription", amount: 75000, frequency: 'UNIQUE', scope: 'SCHOOL', required: true },
      { type: 'REINSCRIPTION', label: 'Frais de réinscription', amount: 50000, frequency: 'ANNUAL', scope: 'SCHOOL', required: true },
      { type: 'MINERVAL', label: 'Minerval mensuel', amount: 35000, frequency: 'MONTHLY', scope: 'SCHOOL', required: true },
      { type: 'EXAMEN', label: "Frais d'examen", amount: 10000, frequency: 'TRIMESTRAL', scope: 'SCHOOL', required: true },
      { type: 'BULLETIN', label: 'Frais de bulletin', amount: 3000, frequency: 'TRIMESTRAL', scope: 'SCHOOL', required: true },
      { type: 'ASSURANCE', label: 'Assurance scolaire', amount: 15000, frequency: 'ANNUAL', scope: 'SCHOOL', required: false },
    ],
  },
];

// ── Legacy exports (backward compat) ──────────────────────────────────────────
export type FeeCategory = 'MINERVAL' | 'FONCTIONNEMENT' | 'EXAMEN' | 'ASSURANCE' | 'DIVERS';

export const FEE_CATEGORY_LABELS: Record<FeeCategory, string> = {
  MINERVAL: 'Minerval',
  FONCTIONNEMENT: 'Frais de Fonctionnement',
  EXAMEN: "Frais d'Examen",
  ASSURANCE: 'Assurance Scolaire',
  DIVERS: 'Frais Divers',
};

export const DEFAULT_FEE_TYPES = FEE_TEMPLATES[0].fees;

export const REFERENCE_AMOUNTS_FC: Record<string, number> = {
  'Minerval (Frais scolaires annuels)': 5000,
  'Frais de Fonctionnement — Trimestre 1': 75000,
  'Frais de Fonctionnement — Trimestre 2': 75000,
  'Frais de Fonctionnement — Trimestre 3': 75000,
  "Frais d'Examen d'État (6ème)": 50000,
  'Assurance Scolaire': 15000,
  'Frais de Laboratoire': 25000,
  'Frais de Stage': 30000,
};
