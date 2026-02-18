export const RDC_NATIONAL_HOLIDAYS = [
    { date: '01-01', label: 'Nouvel An' },
    { date: '01-04', label: "Journée des Martyrs de l'Indépendance" },
    { date: '01-16', label: 'Assassinat de Lumumba' },
    { date: '01-17', label: 'Assassinat de Laurent-Désiré Kabila' },
    { date: '05-01', label: 'Fête du Travail' },
    { date: '05-17', label: 'Journée de la Libération' },
    { date: '06-30', label: "Fête de l'Indépendance" },
    { date: '08-01', label: 'Fête des Parents' },
    { date: '12-25', label: 'Noël' },
] as const;

export type NationalHoliday = (typeof RDC_NATIONAL_HOLIDAYS)[number];

/**
 * Get the full date for a holiday in a given year
 * @param holiday The holiday object with date in MM-DD format
 * @param year The year to get the date for
 * @returns Date object for the holiday
 */
export function getHolidayDate(holiday: NationalHoliday, year: number): Date {
    const [month, day] = holiday.date.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Get all holidays for a given year
 * @param year The year to get holidays for
 * @returns Array of holiday objects with full dates
 */
export function getHolidaysForYear(year: number): Array<{ date: Date; label: string }> {
    return RDC_NATIONAL_HOLIDAYS.map((holiday) => ({
        date: getHolidayDate(holiday, year),
        label: holiday.label,
    }));
}
