export const SCHOOL_SECTIONS = [
    {
        code: 'TC',
        name: 'Tronc Commun',
        years: [1, 2],
        description: '1ère et 2ème année',
    },
    {
        code: 'SC',
        name: 'Scientifique',
        years: [3, 4, 5, 6],
        description: '3ème à 6ème année',
    },
    {
        code: 'HCG',
        name: 'Commerciale & Gestion',
        years: [3, 4, 5, 6],
        description: '3ème à 6ème année',
    },
    {
        code: 'PEDA',
        name: 'Pédagogique',
        years: [3, 4, 5, 6],
        description: '3ème à 6ème année',
    },
    {
        code: 'HT',
        name: 'Technique',
        years: [3, 4, 5, 6],
        description: '3ème à 6ème année',
        options: ['Électricité', 'Mécanique', 'Informatique', 'Construction'],
    },
    {
        code: 'LIT',
        name: 'Littéraire',
        years: [3, 4, 5, 6],
        description: '3ème à 6ème année',
    },
] as const;

export type SectionCode = 'TC' | 'SC' | 'HCG' | 'PEDA' | 'HT' | 'LIT';

export function getSectionName(code: SectionCode): string {
    const section = SCHOOL_SECTIONS.find((s) => s.code === code);
    return section?.name || code;
}

export function generateClassName(sectionCode: SectionCode, year: number, letter: string): string {
    if (sectionCode === 'TC') {
        return `TC-${year}${letter}`;
    }
    return `${year}${sectionCode}${letter}`;
}
