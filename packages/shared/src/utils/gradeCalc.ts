// ── Calcul des Notes — Système Éducatif RDC ──────────────────────────────────
// Fonctions de calcul officielles conformes au programme EPSP

import type { EvalType } from '../types/grade.types';
import { EVAL_WEIGHTS } from '../types/grade.types';

/**
 * Score d'une évaluation
 */
export interface EvalScore {
    evalType: EvalType;
    score: number;
    maxScore: number;
}

/**
 * Moyenne d'une matière (pour un trimestre)
 */
export interface SubjectAverage {
    subjectId: string;
    subjectName: string;
    coefficient: number;
    average: number;
    maxScore: number;
    totalPoints: number;
    isEliminatory: boolean;
    isEliminated: boolean;
    scores: EvalScore[];
}

/**
 * Résultat d'un élève (pour classement)
 */
export interface StudentResult {
    studentId: string;
    studentName: string;
    generalAverage: number;
    totalPoints: number;
    totalCoefficients: number;
    rank: number;
    hasEliminatoryFailure: boolean;
    subjectAverages: SubjectAverage[];
}

/**
 * Calcule la moyenne d'une matière pour un trimestre
 * Pondération par type d'évaluation selon le système officiel RDC :
 * - Interrogation : 25%
 * - TP : 15%
 * - Examen Trimestriel : 50%
 * - Examen de Synthèse : 10%
 * 
 * @param scores - Les notes de l'élève pour cette matière
 * @param customWeights - Pondérations personnalisées (optionnel)
 * @returns La moyenne pondérée sur la base du maxScore
 */
export function calculateSubjectAverage(
    scores: EvalScore[],
    customWeights?: Partial<Record<EvalType, number>>,
): number {
    if (scores.length === 0) return 0;

    const weights = { ...EVAL_WEIGHTS, ...customWeights };

    // Group scores by eval type and calculate average per type
    const scoresByType = new Map<EvalType, EvalScore[]>();
    for (const score of scores) {
        const existing = scoresByType.get(score.evalType) ?? [];
        existing.push(score);
        scoresByType.set(score.evalType, existing);
    }

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [evalType, typeScores] of scoresByType) {
        const weight = weights[evalType] ?? 0;
        if (weight === 0) continue;

        // Average all scores of the same type
        const avgScore = typeScores.reduce((sum, s) => sum + (s.score / s.maxScore), 0) / typeScores.length;

        weightedSum += avgScore * weight;
        totalWeight += weight;
    }

    if (totalWeight === 0) return 0;

    // Return average normalized to maxScore (typically 20)
    const maxScore = scores[0]?.maxScore ?? 20;
    return Math.round((weightedSum / totalWeight) * maxScore * 100) / 100;
}

/**
 * Calcule la moyenne générale pondérée par coefficients
 * 
 * @param subjectAverages - Moyennes par matière avec coefficients
 * @returns La moyenne générale pondérée
 */
export function calculateGeneralAverage(
    subjectAverages: Array<{ average: number; coefficient: number; maxScore?: number }>,
): { average: number; totalPoints: number; totalCoefficients: number } {
    if (subjectAverages.length === 0) {
        return { average: 0, totalPoints: 0, totalCoefficients: 0 };
    }

    let totalPoints = 0;
    let totalCoefficients = 0;

    for (const sa of subjectAverages) {
        totalPoints += sa.average * sa.coefficient;
        totalCoefficients += sa.coefficient;
    }

    if (totalCoefficients === 0) {
        return { average: 0, totalPoints: 0, totalCoefficients: 0 };
    }

    const average = Math.round((totalPoints / totalCoefficients) * 100) / 100;

    return { average, totalPoints, totalCoefficients };
}

/**
 * Calcule le classement des élèves avec gestion des ex-aequo
 * Les ex-aequo reçoivent le même rang, et le rang suivant est décalé.
 * 
 * @param students - Liste des résultats des élèves
 * @returns Les résultats avec les rangs attribués
 * 
 * @example
 * // Si 3 élèves ont les moyennes 18, 16, 16, 14
 * // Rangs: 1er, 2ème ex-aequo, 2ème ex-aequo, 4ème
 */
export function calculateRanking(
    students: Array<{ studentId: string; generalAverage: number; totalPoints: number }>,
): Array<{ studentId: string; generalAverage: number; totalPoints: number; rank: number }> {
    if (students.length === 0) return [];

    // Sort by general average descending, then total points descending for tiebreaker
    const sorted = [...students].sort((a, b) => {
        if (b.generalAverage !== a.generalAverage) {
            return b.generalAverage - a.generalAverage;
        }
        return b.totalPoints - a.totalPoints;
    });

    const ranked = sorted.map((student, index) => {
        let rank = index + 1;

        // Check for ex-aequo with previous student
        if (index > 0 && sorted[index - 1].generalAverage === student.generalAverage) {
            // Find the rank of the first student with the same average
            const firstSameAvg = sorted.findIndex((s) => s.generalAverage === student.generalAverage);
            rank = firstSameAvg + 1;
        }

        return { ...student, rank };
    });

    return ranked;
}

/**
 * Détermine la décision de délibération basée sur la moyenne et les notes éliminatoires
 * Selon les normes EPSP-RDC :
 * - ≥ 70% (14/20) : Distinction
 * - ≥ 80% (16/20) : Grande Distinction
 * - ≥ 50% (10/20) : Admis
 * - < 50% (10/20) : Ajourné
 * - Note éliminatoire : Refusé (même si moyenne suffisante)
 * 
 * @param average - Moyenne générale
 * @param hasEliminatoryFailure - A une note en dessous du seuil éliminatoire
 * @param maxScore - Score maximum (défaut: 20)
 * @returns La décision suggérée
 */
export function getDelibDecision(
    average: number,
    hasEliminatoryFailure: boolean,
    maxScore: number = 20,
): 'GREAT_DISTINCTION' | 'DISTINCTION' | 'ADMITTED' | 'ADJOURNED' | 'FAILED' {
    // Eliminatory failure → FAILED regardless of average
    if (hasEliminatoryFailure) {
        return 'FAILED';
    }

    const percentage = (average / maxScore) * 100;

    if (percentage >= 80) return 'GREAT_DISTINCTION';
    if (percentage >= 70) return 'DISTINCTION';
    if (percentage >= 50) return 'ADMITTED';

    return 'ADJOURNED';
}

/**
 * Vérifie si une note est en dessous du seuil éliminatoire
 * 
 * @param score - La note de l'élève
 * @param threshold - Le seuil éliminatoire
 * @param isEliminatory - Si la matière est éliminatoire
 * @returns true si la note est en dessous du seuil éliminatoire
 */
export function checkEliminatory(
    score: number,
    threshold: number | undefined | null,
    isEliminatory: boolean,
): boolean {
    if (!isEliminatory || threshold == null) return false;
    return score < threshold;
}

/**
 * Formatte la mention de délibération en français
 */
export function getDelibDecisionLabel(
    decision: string,
): string {
    const labels: Record<string, string> = {
        GREAT_DISTINCTION: 'Grande Distinction',
        DISTINCTION: 'Distinction',
        ADMITTED: 'Admis',
        ADJOURNED: 'Ajourné',
        FAILED: 'Refusé',
        MEDICAL: 'Cas Médical',
    };
    return labels[decision] ?? decision;
}

/**
 * Formatte un rang avec le suffixe approprié en français
 * @example formatRank(1) → "1er", formatRank(2) → "2ème"
 */
export function formatRank(rank: number): string {
    if (rank === 1) return '1er';
    return `${rank}ème`;
}

/**
 * Calcule le pourcentage d'une note
 */
export function scoreToPercentage(score: number, maxScore: number = 20): number {
    if (maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100 * 100) / 100;
}
