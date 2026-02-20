/**
 * Tests unitaires — gradeCalc.ts
 * Formules officielles EPSP-RDC
 *
 * Exécution : npm test -- gradeCalc.test.ts
 * Objectif  : 23/23 tests ✅
 */

import { describe, it, expect } from 'vitest';
import {
    roundToHalf,
    calculateSubjectAverage,
    calculateTotalPoints,
    calculateGeneralAverage,
    calculateRanking,
    suggestDecision,
    normalizeScore,
    calculateClassStats,
} from './gradeCalc';

// ─────────────────────────────────────────────────────────────────────────────
// 1. roundToHalf — Arrondi RDC au 0.5 près (6 cas requis)
// ─────────────────────────────────────────────────────────────────────────────
describe('roundToHalf — Arrondi RDC', () => {
    it('14.3 → 14.5', () => expect(roundToHalf(14.3)).toBe(14.5));
    it('14.7 → 15.0', () => expect(roundToHalf(14.7)).toBe(15.0));
    it('14.25 → 14.5', () => expect(roundToHalf(14.25)).toBe(14.5));
    it('14.74 → 15.0', () => expect(roundToHalf(14.74)).toBe(15.0));
    it('10.0 → 10.0', () => expect(roundToHalf(10.0)).toBe(10.0));
    it('9.9 → 10.0', () => expect(roundToHalf(9.9)).toBe(10.0));
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. calculateSubjectAverage — Formule Inter×0.3 + TP×0.2 + Exam×0.5 (3 cas)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateSubjectAverage — Formule RDC', () => {
    it('Retourne null si exam absent', () => {
        expect(calculateSubjectAverage({ interro: 15, tp: 12 })).toBeNull();
    });

    it('Calcule correctement avec les 3 notes (Inter=14, TP=16, Exam=12)', () => {
        // Attendu : (14×0.3 + 16×0.2 + 12×0.5) / (0.3+0.2+0.5) = (4.2+3.2+6.0)/1.0 = 13.4
        const result = calculateSubjectAverage({ interro: 14, tp: 16, exam: 12 });
        expect(result).toBeCloseTo(13.4, 1);
    });

    it('Calcule avec exam seulement (Inter et TP absents)', () => {
        // Attendu : (0 + 0 + 15×0.5) / 0.5 = 15.0
        const result = calculateSubjectAverage({ exam: 15 });
        expect(result).toBeCloseTo(15.0, 1);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. calculateTotalPoints — Σ(Moy × Coeff) (4 cas)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateTotalPoints — Total des points', () => {
    it('Calcule correctement pour 2 matières', () => {
        // Math(coeff 3, moy 14) + Phys(coeff 2, moy 12) = 42 + 24 = 66
        const result = calculateTotalPoints([
            { average: 14, coefficient: 3 },
            { average: 12, coefficient: 2 },
        ]);
        expect(result).toBe(66);
    });

    it('Exclut les matières avec average null', () => {
        const result = calculateTotalPoints([
            { average: 14, coefficient: 3 },
            { average: null, coefficient: 2 },
        ]);
        expect(result).toBe(42);
    });

    it('Retourne 0 pour liste vide', () => {
        expect(calculateTotalPoints([])).toBe(0);
    });

    it('Arrondit à 2 décimales', () => {
        const result = calculateTotalPoints([{ average: 13.333, coefficient: 3 }]);
        expect(result).toBe(40.00);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. calculateGeneralAverage — Total / Σ Coeffs + arrondi RDC (5 cas)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateGeneralAverage — Moyenne générale + arrondi', () => {
    it('66 pts / 5 coeffs = 13.2 → 13.5 (arrondi RDC)', () => {
        expect(calculateGeneralAverage(66, 5)).toBe(13.5);
    });

    it('75 pts / 5 coeffs = 15.0 → 15.0', () => {
        expect(calculateGeneralAverage(75, 5)).toBe(15.0);
    });

    it('Retourne 0 si coefficients = 0', () => {
        expect(calculateGeneralAverage(50, 0)).toBe(0);
    });

    it('14.3 brut → 14.5 après arrondi', () => {
        // 71.5 / 5 = 14.3
        expect(calculateGeneralAverage(71.5, 5)).toBe(14.5);
    });

    it('14.7 brut → 15.0 après arrondi', () => {
        // 73.5 / 5 = 14.7
        expect(calculateGeneralAverage(73.5, 5)).toBe(15.0);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. calculateRanking — Ex-æquo supportés (5 cas)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateRanking — Ex-æquo', () => {
    it('Classe 3 élèves sans ex-æquo', () => {
        const result = calculateRanking([
            { id: 'A', average: 15 },
            { id: 'B', average: 12 },
            { id: 'C', average: 10 },
        ]);
        const map = Object.fromEntries(result.map((r) => [r.id, r.rank]));
        expect(map['A']).toBe(1);
        expect(map['B']).toBe(2);
        expect(map['C']).toBe(3);
    });

    it('Ex-æquo : même rang', () => {
        const result = calculateRanking([
            { id: 'A', average: 15 },
            { id: 'B', average: 15 },
            { id: 'C', average: 14 },
        ]);
        const map = Object.fromEntries(result.map((r) => [r.id, r.rank]));
        expect(map['A']).toBe(1);
        expect(map['B']).toBe(1);
        expect(map['C']).toBe(3); // Rang 3 et non 2
    });

    it('Rang suivant décalé après ex-æquo', () => {
        const result = calculateRanking([
            { id: 'A', average: 15 },
            { id: 'B', average: 15 },
            { id: 'C', average: 14.5 },
            { id: 'D', average: 13 },
        ]);
        const map = Object.fromEntries(result.map((r) => [r.id, r.rank]));
        expect(map['A']).toBe(1);
        expect(map['B']).toBe(1);
        expect(map['C']).toBe(3);
        expect(map['D']).toBe(4);
    });

    it('Retourne liste vide pour entrée vide', () => {
        expect(calculateRanking([])).toEqual([]);
    });

    it('Un seul élève → rang 1', () => {
        const result = calculateRanking([{ id: 'A', average: 12 }]);
        expect(result[0].rank).toBe(1);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. suggestDecision — Décisions auto (5 cas)
// ─────────────────────────────────────────────────────────────────────────────
describe('suggestDecision — Seuils RDC', () => {
    it('Moy ≥ 16 → GREAT_DISTINCTION', () => expect(suggestDecision(16)).toBe('GREAT_DISTINCTION'));
    it('14 ≤ Moy < 16 → DISTINCTION', () => expect(suggestDecision(14)).toBe('DISTINCTION'));
    it('10 ≤ Moy < 14 → ADMITTED', () => expect(suggestDecision(10)).toBe('ADMITTED'));
    it('8 ≤ Moy < 10 → ADJOURNED', () => expect(suggestDecision(8)).toBe('ADJOURNED'));
    it('Moy < 8 → FAILED', () => expect(suggestDecision(7.9)).toBe('FAILED'));
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. normalizeScore — Mise à l'échelle /20 (2 cas bonus)
// ─────────────────────────────────────────────────────────────────────────────
describe('normalizeScore', () => {
    it('8/10 → 16/20', () => expect(normalizeScore(8, 10)).toBe(16));
    it('15/20 → 15/20', () => expect(normalizeScore(15, 20)).toBe(15));
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. calculateClassStats (2 cas bonus)
// ─────────────────────────────────────────────────────────────────────────────
describe('calculateClassStats', () => {
    it('Calcule taux de réussite correctement', () => {
        const stats = calculateClassStats([15, 12, 9, 8, 7]);
        expect(stats.successRate).toBe(40); // 2/5 = 40%
    });

    it('Retourne zéros pour liste vide', () => {
        const stats = calculateClassStats([]);
        expect(stats.classAverage).toBe(0);
        expect(stats.successRate).toBe(0);
    });
});
