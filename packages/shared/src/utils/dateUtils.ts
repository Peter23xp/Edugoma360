import { isWeekend, addDays, parseISO } from 'date-fns';

/**
 * Calcule la durée en jours excluant les weekends (Samedi/Dimanche)
 */
export function calculateDurationExcludingWeekends(start: Date | string, end: Date | string): number {
    const startDate = typeof start === 'string' ? parseISO(start) : start;
    const endDate = typeof end === 'string' ? parseISO(end) : end;

    if (endDate < startDate) return 0;

    let count = 0;
    let current = new Date(startDate);

    // Ensure we only check the date part
    current.setHours(0, 0, 0, 0);
    const lastDate = new Date(endDate);
    lastDate.setHours(0, 0, 0, 0);

    while (current <= lastDate) {
        if (!isWeekend(current)) {
            count++;
        }
        current = addDays(current, 1);
    }
    return count;
}
