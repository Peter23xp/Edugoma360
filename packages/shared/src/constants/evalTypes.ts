export const EVAL_TYPES = {
    INTERRO: { code: 'INTERRO', label: 'Interrogation', weight: 0.2 },
    TP: { code: 'TP', label: 'Travail Pratique', weight: 0.3 },
    EXAM_TRIM: { code: 'EXAM_TRIM', label: 'Examen trimestriel', weight: 0.5 },
    EXAM_SYNTH: { code: 'EXAM_SYNTH', label: 'Examen de synthèse', weight: 1.0 },
} as const;

export type EvalType = keyof typeof EVAL_TYPES;

export const EVAL_TYPE_OPTIONS = Object.values(EVAL_TYPES);
