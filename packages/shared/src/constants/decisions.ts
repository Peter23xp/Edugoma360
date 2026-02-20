export const DELIB_DECISIONS = {
    ADMITTED: {
        code: 'ADMITTED',
        label: 'Admis(e)',
        color: 'green',
        condition: 'Moy ≥ 10/20 + aucune éliminatoire échouée',
    },
    DISTINCTION: {
        code: 'DISTINCTION',
        label: 'Admis(e) avec Distinction',
        color: 'darkgreen',
        condition: 'Moy ≥ 14/20',
    },
    GREAT_DISTINCTION: {
        code: 'GREAT_DISTINCTION',
        label: 'Admis(e) Grande Distinction',
        color: 'gold',
        condition: 'Moy ≥ 16/20',
    },
    ADJOURNED: {
        code: 'ADJOURNED',
        label: 'Ajourné(e)',
        color: 'orange',
        condition: '8/20 ≤ Moy < 10/20',
    },
    FAILED: {
        code: 'FAILED',
        label: 'Refusé(e)',
        color: 'red',
        condition: 'Moy < 8/20 OU éliminatoire échouée',
    },
    MEDICAL: {
        code: 'MEDICAL',
        label: 'Reporté(e) - Maladie',
        color: 'blue',
        condition: 'Décision spéciale Préfet avec justificatif',
    },
} as const;

export type DelibDecision = keyof typeof DELIB_DECISIONS;

export const getDecisionColor = (decision: DelibDecision): string => {
    const colors: Record<string, string> = {
        green: 'bg-green-100 text-green-800 border-green-200',
        darkgreen: 'bg-green-200 text-green-900 border-green-300',
        gold: 'bg-yellow-100 text-yellow-900 border-yellow-200',
        orange: 'bg-orange-100 text-orange-800 border-orange-200',
        red: 'bg-red-100 text-red-800 border-red-200',
        blue: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[DELIB_DECISIONS[decision].color] || colors.green;
};

export const getDecisionBadgeColor = (decision: DelibDecision): string => {
    const colors: Record<string, string> = {
        green: 'bg-green-600',
        darkgreen: 'bg-green-700',
        gold: 'bg-yellow-500',
        orange: 'bg-orange-600',
        red: 'bg-red-600',
        blue: 'bg-blue-600',
    };
    return colors[DELIB_DECISIONS[decision].color] || colors.green;
};
