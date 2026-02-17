import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────
export type EvalType = 'INTERROGATION' | 'TP' | 'EXAMEN_TRIMESTRIEL' | 'EXAMEN_SYNTHESE';
export type SyncStatus = 'SYNCED' | 'PENDING' | 'CONFLICT';
export type DelibStatus = 'DRAFT' | 'VALIDATED';
export type DelibDecision =
    | 'ADMITTED'
    | 'DISTINCTION'
    | 'GREAT_DISTINCTION'
    | 'ADJOURNED'
    | 'FAILED'
    | 'MEDICAL';

// ── Grade Interface ───────────────────────────────────────────────────────────
export interface Grade {
    id: string;
    studentId: string;
    subjectId: string;
    termId: string;
    evalType: EvalType;
    score: number;
    maxScore: number;
    observation?: string | null;
    isLocked: boolean;
    syncStatus: SyncStatus;
    createdById: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// ── Term Interface ────────────────────────────────────────────────────────────
export interface Term {
    id: string;
    academicYearId: string;
    number: number;
    label: string;
    startDate: Date | string;
    endDate: Date | string;
    examStartDate?: Date | string | null;
    examEndDate?: Date | string | null;
    isActive: boolean;
}

// ── Deliberation Interfaces ───────────────────────────────────────────────────
export interface Deliberation {
    id: string;
    classId: string;
    termId: string;
    status: DelibStatus;
    validatedAt?: Date | string | null;
    pvUrl?: string | null;
    createdAt: Date | string;
    results?: DelibResult[];
}

export interface DelibResult {
    id: string;
    deliberationId: string;
    studentId: string;
    generalAverage: number;
    totalPoints: number;
    rank: number;
    decision: DelibDecision;
    justification?: string | null;
}

// ── Subject Interface ─────────────────────────────────────────────────────────
export interface Subject {
    id: string;
    schoolId: string;
    name: string;
    abbreviation: string;
    maxScore: number;
    isEliminatory: boolean;
    elimThreshold?: number | null;
    displayOrder: number;
}

export interface SubjectSection {
    subjectId: string;
    sectionId: string;
    coefficient: number;
}

// ── Zod Schemas ───────────────────────────────────────────────────────────────
export const CreateGradeSchema = z.object({
    studentId: z.string().uuid(),
    subjectId: z.string().uuid(),
    termId: z.string().uuid(),
    evalType: z.enum(['INTERROGATION', 'TP', 'EXAMEN_TRIMESTRIEL', 'EXAMEN_SYNTHESE']),
    score: z.number().min(0, 'La note ne peut pas être négative'),
    maxScore: z.number().int().min(1).default(20),
    observation: z.string().optional(),
});

export type CreateGradeInput = z.infer<typeof CreateGradeSchema>;

export const BatchGradeSchema = z.object({
    grades: z.array(CreateGradeSchema).min(1, 'Au moins une note requise'),
});

export type BatchGradeInput = z.infer<typeof BatchGradeSchema>;

// ── Evaluation Weights (Official RDC) ─────────────────────────────────────────
export const EVAL_WEIGHTS: Record<EvalType, number> = {
    INTERROGATION: 0.25,
    TP: 0.15,
    EXAMEN_TRIMESTRIEL: 0.50,
    EXAMEN_SYNTHESE: 0.10,
};

export const EVAL_TYPE_LABELS: Record<EvalType, string> = {
    INTERROGATION: 'Interrogation',
    TP: 'Travaux Pratiques',
    EXAMEN_TRIMESTRIEL: 'Examen Trimestriel',
    EXAMEN_SYNTHESE: 'Examen de Synthèse',
};
