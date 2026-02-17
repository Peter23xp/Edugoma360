// ── Jours Fériés Nationaux — RDC ─────────────────────────────────────────────

export interface Holiday {
    date: string; // MM-DD format
    name: string;
    nameSw?: string; // Swahili name
    isSchoolHoliday: boolean;
}

/**
 * Jours fériés nationaux de la République Démocratique du Congo
 */
export const RDC_HOLIDAYS: Holiday[] = [
    { date: '01-01', name: 'Jour de l\'An', nameSw: 'Mwaka Mpya', isSchoolHoliday: true },
    { date: '01-04', name: 'Journée des Martyrs de l\'Indépendance', nameSw: 'Siku ya Mashahidi', isSchoolHoliday: true },
    { date: '01-16', name: 'Journée de Laurent-Désiré Kabila', isSchoolHoliday: true },
    { date: '01-17', name: 'Journée de Patrice Émery Lumumba', nameSw: 'Siku ya Lumumba', isSchoolHoliday: true },
    { date: '05-01', name: 'Fête du Travail', nameSw: 'Siku ya Kazi', isSchoolHoliday: true },
    { date: '05-17', name: 'Journée de la Libération', isSchoolHoliday: true },
    { date: '06-30', name: 'Fête de l\'Indépendance', nameSw: 'Siku ya Uhuru', isSchoolHoliday: true },
    { date: '08-01', name: 'Journée des Parents', nameSw: 'Siku ya Wazazi', isSchoolHoliday: true },
    { date: '10-27', name: 'Journée de l\'Armée', isSchoolHoliday: true },
    { date: '11-17', name: 'Journée de l\'Armée (Forces Armées)', isSchoolHoliday: false },
    { date: '12-25', name: 'Noël', nameSw: 'Krismasi', isSchoolHoliday: true },
];

/**
 * Vérifie si une date est un jour férié national
 */
export function isHoliday(date: Date): Holiday | undefined {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const mmdd = `${month}-${day}`;
    return RDC_HOLIDAYS.find((h) => h.date === mmdd);
}

/**
 * Get all school holidays for a given year
 */
export function getSchoolHolidays(year: number): Array<Holiday & { fullDate: Date }> {
    return RDC_HOLIDAYS
        .filter((h) => h.isSchoolHoliday)
        .map((h) => {
            const [month, day] = h.date.split('-').map(Number);
            return {
                ...h,
                fullDate: new Date(year, month - 1, day),
            };
        });
}

/**
 * Périodes de vacances scolaires typiques en RDC
 */
export const SCHOOL_VACATION_PERIODS = [
    { name: 'Vacances de Noël', startMMDD: '12-20', endMMDD: '01-05' },
    { name: 'Vacances de Pâques', startMMDD: '03-28', endMMDD: '04-08' },
    { name: 'Grandes Vacances', startMMDD: '07-01', endMMDD: '09-01' },
];
