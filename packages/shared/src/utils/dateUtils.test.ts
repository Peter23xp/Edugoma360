import { describe, it, expect } from 'vitest';
import { calculateDurationExcludingWeekends } from './dateUtils';

describe('Date Utilities', () => {
    it('should calculate duration correctly for a week', () => {
        // Monday 2024-03-04 to Friday 2024-03-08 -> 5 days
        const duration = calculateDurationExcludingWeekends('2024-03-04', '2024-03-08');
        expect(duration).toBe(5);
    });

    it('should exclude weekends', () => {
        // Friday 2024-03-08 to Monday 2024-03-11 -> 2 working days (Fri, Mon)
        const duration = calculateDurationExcludingWeekends('2024-03-08', '2024-03-11');
        expect(duration).toBe(2);
    });

    it('should return 1 for the same working day', () => {
        const duration = calculateDurationExcludingWeekends('2024-03-04', '2024-03-04');
        expect(duration).toBe(1);
    });

    it('should return 0 for a weekend day', () => {
        // Sunday 2024-03-10 to Sunday 2024-03-10
        const duration = calculateDurationExcludingWeekends('2024-03-10', '2024-03-10');
        expect(duration).toBe(0);
    });

    it('should return 0 if end is before start', () => {
        const duration = calculateDurationExcludingWeekends('2024-03-08', '2024-03-04');
        expect(duration).toBe(0);
    });

    it('should handle a full month correctly', () => {
        // March 2024 has 31 days, starts on Friday, ends on Sunday.
        // It has 5 weekends (9,10, 16,17, 23,24, 30,31) + 2 March (Sat) + 3 March (Sun)
        // Wait, 1, 2(S), 3(S)...
        // Let's just trust date-fns and count
        const duration = calculateDurationExcludingWeekends('2024-03-01', '2024-03-31');
        // Total days: 31. Weekends: 2,3, 9,10, 16,17, 23,24, 30,31 (10 days)
        // 31 - 10 = 21
        expect(duration).toBe(21);
    });
});
