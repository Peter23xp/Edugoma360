/**
 * EduGoma 360 — Teacher Matricule Generator
 *
 * Format : ENS-{YEAR}-{PROVINCE}-{SCHOOL_CODE}-{SEQUENCE}
 * Example: ENS-26-NK-GOM-042
 */

/**
 * Generates a unique teacher registration number (matricule)
 * @param year - Year suffix (e.g. 26 for 2026)
 * @param provinceCode - Province code (e.g. 'NK' for Nord-Kivu)
 * @param schoolCode - School code (e.g. 'GOM' for Goma)
 * @param sequence - Sequential number for the school (1, 2, 3...)
 * @returns Formatted matricule string (e.g. 'ENS-26-NK-GOM-001')
 */
export function generateTeacherMatricule(
    year: number,
    provinceCode: string,
    schoolCode: string,
    sequence: number
): string {
    const yr = (year % 100).toString().padStart(2, '0');
    const prov = provinceCode.toUpperCase().substring(0, 2);
    const sch = schoolCode.toUpperCase().substring(0, 3);
    const seq = sequence.toString().padStart(3, '0');

    return `ENS-${yr}-${prov}-${sch}-${seq}`;
}

/**
 * Validates the format of a teacher matricule
 * @param matricule - Matricule to validate
 */
export function isValidTeacherMatricule(matricule: string): boolean {
    const regex = /^ENS-\d{2}-[A-Z]{2}-[A-Z]{3}-\d{3,4}$/;
    return regex.test(matricule);
}

/**
 * Parses a teacher matricule and returns its components
 */
export function parseTeacherMatricule(matricule: string): {
    year: number;
    province: string;
    school: string;
    sequence: number;
} | null {
    const match = matricule.match(/^ENS-(\d{2})-([A-Z]{2})-([A-Z]{3})-(\d{3,4})$/);
    if (!match) return null;
    return {
        year: parseInt(match[1]),
        province: match[2],
        school: match[3],
        sequence: parseInt(match[4], 10),
    };
}

/**
 * Extract sequence number from a teacher matricule
 */
export function extractTeacherSequence(matricule: string): number {
    const parsed = parseTeacherMatricule(matricule);
    return parsed?.sequence ?? 0;
}
