/**
 * Formules officielles de calcul des moyennes selon le système EPSP-RDC
 *
 * ⚠️  RÈGLES RDC (EPSP) :
 *   - Interrogation : 30% (pondération 0.3)
 *   - Travaux Pratiques : 20% (pondération 0.2)
 *   - Examen : 50% (pondération 0.5)
 *   - Arrondi : au 0.5 le plus proche (ex: 14.3 → 14.5 ; 14.7 → 15.0)
 */

export interface SubjectGrade {
    subjectId: string;
    coefficient: number;
    interro?: number | null;
    tp?: number | null;
    exam?: number | null;
    maxScore: number; // 10 ou 20
}

export interface SubjectAverage {
    subjectId: string;
    average: number | null;
    rank: number;
    isEliminatory: boolean;
    hasFailed: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// ARRONDI RDC — au 0.5 le plus proche
// Exemples : 14.3 → 14.5 | 14.7 → 15.0 | 14.25 → 14.5 | 14.74 → 15.0
// ─────────────────────────────────────────────────────────────────────────────
export function roundToHalf(value: number): number {
    return Math.round(value * 2) / 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOYENNE MATIÈRE
// Formule officielle RDC : Inter×0.3 + TP×0.2 + Exam×0.5
// - Retourne null si l'Examen est absent (note bloquante)
// - Calcule une moyenne partielle si Inter ou TP manquant
// ─────────────────────────────────────────────────────────────────────────────
export function calculateSubjectAverage(grades: {
    interro?: number | null;
    tp?: number | null;
    exam?: number | null;
}): number | null {
    // L'examen est OBLIGATOIRE pour calculer la moyenne
    if (grades.exam === undefined || grades.exam === null) {
        return null;
    }

    // Poids officiels RDC EPSP
    const WEIGHTS = { interro: 0.3, tp: 0.2, exam: 0.5 };

    let total = 0;
    let totalWeight = 0;

    // Examen (obligatoire)
    total += grades.exam * WEIGHTS.exam;
    totalWeight += WEIGHTS.exam;

    // Interrogation (optionnelle)
    if (grades.interro !== undefined && grades.interro !== null) {
        total += grades.interro * WEIGHTS.interro;
        totalWeight += WEIGHTS.interro;
    }

    // TP (optionnel)
    if (grades.tp !== undefined && grades.tp !== null) {
        total += grades.tp * WEIGHTS.tp;
        totalWeight += WEIGHTS.tp;
    }

    return totalWeight > 0 ? total / totalWeight : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOTAL DES POINTS
// Formule : Σ(Moyenne_matière × Coefficient)
// - Les matières sans note (null) sont exclues du total
// ─────────────────────────────────────────────────────────────────────────────
export function calculateTotalPoints(
    grades: Array<{ average: number | null; coefficient: number }>
): number {
    const total = grades.reduce((sum, g) => {
        if (g.average === null) return sum;
        return sum + g.average * g.coefficient;
    }, 0);

    return Math.round(total * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOYENNE GÉNÉRALE (avec arrondi RDC au 0.5 près)
// Formule : Total / Σ Coefficients
// ─────────────────────────────────────────────────────────────────────────────
export function calculateGeneralAverage(
    totalPoints: number,
    totalCoefficients: number
): number {
    if (totalCoefficients <= 0) return 0;
    const raw = totalPoints / totalCoefficients;
    return roundToHalf(raw);
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSEMENT (ex-æquo supportés)
// - Tri décroissant par moyenne
// - Ex-æquo : même rang
// - Rang suivant = rang précédent + nombre d'ex-æquo
// ─────────────────────────────────────────────────────────────────────────────
export function calculateRanking(
    students: Array<{ id: string; average: number }>
): Array<{ id: string; rank: number }> {
    const sorted = [...students].sort((a, b) => {
        if (b.average !== a.average) return b.average - a.average;
        return 0; // tri stable pour ex-æquo
    });

    const result: Array<{ id: string; rank: number }> = [];
    let currentRank = 1;

    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i].average < sorted[i - 1].average) {
            currentRank = i + 1;
        }
        result.push({ id: sorted[i].id, rank: currentRank });
    }

    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// DÉCISION AUTO (délibération)
// ─────────────────────────────────────────────────────────────────────────────
export function suggestDecision(average: number): string {
    if (average >= 16) return 'GREAT_DISTINCTION';
    if (average >= 14) return 'DISTINCTION';
    if (average >= 10) return 'ADMITTED';
    if (average >= 8) return 'ADJOURNED';
    return 'FAILED';
}

// ─────────────────────────────────────────────────────────────────────────────
// VÉRIFICATION NOTE ÉLIMINATOIRE
// ─────────────────────────────────────────────────────────────────────────────
export function checkEliminatory(
    score: number,
    threshold: number,
    isEliminatorySubject: boolean
): boolean {
    return isEliminatorySubject && score < threshold;
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALISATION NOTE SUR /20
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeScore(score: number, maxScore: number): number {
    if (maxScore === 0) return 0;
    return (score / maxScore) * 20;
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCUL MOYENNE MATIÈRE DEPUIS LISTE DE NOTES BRUTES
// ─────────────────────────────────────────────────────────────────────────────
export function calculateStudentSubjectAverage(
    grades: { evalType: string; score: number; maxScore: number }[]
): number | null {
    const gradesByType: { interro?: number; tp?: number; exam?: number } = {};

    grades.forEach((grade) => {
        const normalized = normalizeScore(grade.score, grade.maxScore);

        switch (grade.evalType) {
            case 'INTERRO':
                gradesByType.interro = normalized;
                break;
            case 'TP':
                gradesByType.tp = normalized;
                break;
            case 'EXAM_TRIM':
            case 'EXAM_SYNTH':
                gradesByType.exam = normalized;
                break;
        }
    });

    return calculateSubjectAverage(gradesByType);
}

// ─────────────────────────────────────────────────────────────────────────────
// STATISTIQUES DE CLASSE
// ─────────────────────────────────────────────────────────────────────────────
export function calculateClassStats(averages: number[]): {
    classAverage: number;
    successRate: number;
    highestAverage: number;
    lowestAverage: number;
    standardDeviation: number;
} {
    if (averages.length === 0) {
        return { classAverage: 0, successRate: 0, highestAverage: 0, lowestAverage: 0, standardDeviation: 0 };
    }

    const classAverage = roundToHalf(averages.reduce((a, b) => a + b, 0) / averages.length);
    const successRate = Math.round((averages.filter((a) => a >= 10).length / averages.length) * 100);
    const highestAverage = Math.max(...averages);
    const lowestAverage = Math.min(...averages);

    const variance = averages.reduce((sum, a) => sum + Math.pow(a - classAverage, 2), 0) / averages.length;
    const standardDeviation = Math.round(Math.sqrt(variance) * 100) / 100;

    return { classAverage, successRate, highestAverage, lowestAverage, standardDeviation };
}
