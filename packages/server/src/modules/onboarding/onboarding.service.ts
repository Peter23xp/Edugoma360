import prisma from '../../lib/prisma';

// ── slugify ───────────────────────────────────────────────────────────────────
// Converts a school name into a URL-safe subdomain slug.
// "Collège Saint-Raphaël Goma" → "college-saint-raphael-goma"
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_MAP: Record<string, string> = {
    à: 'a', â: 'a', ä: 'a', á: 'a', ã: 'a',
    è: 'e', é: 'e', ê: 'e', ë: 'e',
    ì: 'i', î: 'i', ï: 'i', í: 'i',
    ò: 'o', ô: 'o', ö: 'o', ó: 'o', õ: 'o',
    ù: 'u', û: 'u', ü: 'u', ú: 'u',
    ç: 'c', ñ: 'n',
    À: 'a', Â: 'a', Ä: 'a', Á: 'a',
    È: 'e', É: 'e', Ê: 'e', Ë: 'e',
    Ì: 'i', Î: 'i', Ï: 'i', Í: 'i',
    Ò: 'o', Ô: 'o', Ö: 'o', Ó: 'o',
    Ù: 'u', Û: 'u', Ü: 'u', Ú: 'u',
    Ç: 'c', Ñ: 'n',
};

/**
 * Converts any string into a subdomain-safe slug.
 *
 * Steps:
 *  1. Replace accented characters with ASCII equivalents
 *  2. Lowercase everything
 *  3. Replace any non-alphanumeric character with a hyphen
 *  4. Collapse multiple consecutive hyphens into one
 *  5. Strip leading/trailing hyphens
 *  6. Truncate to maxLength (default 30)
 */
export function slugify(text: string, maxLength = 30): string {
    const deaccented = text
        .split('')
        .map((ch) => ACCENT_MAP[ch] ?? ch)
        .join('');

    return deaccented
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')   // non-alphanumeric → hyphen
        .replace(/-+/g, '-')            // collapse multiple hyphens
        .replace(/^-|-$/g, '')          // strip leading/trailing hyphens
        .slice(0, maxLength);
}

// ── Subdomain availability ────────────────────────────────────────────────────

/**
 * Finds an available subdomain, appending -2, -3, … if the base slug is taken.
 * Returns the first available slug found.
 */
export async function findAvailableSubdomain(baseName: string): Promise<string> {
    const base = slugify(baseName);

    // Try base slug first
    const existing = await prisma.school.findUnique({ where: { subdomain: base } });
    if (!existing) return base;

    // Try numbered variants
    for (let i = 2; i <= 99; i++) {
        const candidate = `${base.slice(0, 27)}-${i}`; // keep total ≤ 30 chars
        const conflict = await prisma.school.findUnique({ where: { subdomain: candidate } });
        if (!conflict) return candidate;
    }

    // Extremely unlikely – fallback with timestamp suffix
    return `${base.slice(0, 24)}-${Date.now().toString(36).slice(-5)}`;
}

// ── Academic year helper ──────────────────────────────────────────────────────

/**
 * Returns the current academic year label and dates.
 * In DRC school calendar runs September → June.
 * If we are in July–August, the year has already "started" for the next cycle.
 */
export function currentAcademicYear(): {
    label: string;
    startDate: Date;
    endDate: Date;
} {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-indexed
    const year = now.getFullYear();

    // Sept–Dec → year/year+1 | Jan–Aug → year-1/year
    const startYear = month >= 9 ? year : year - 1;
    const endYear = startYear + 1;

    return {
        label: `${startYear}-${endYear}`,
        startDate: new Date(`${startYear}-09-01`),
        endDate: new Date(`${endYear}-06-30`),
    };
}
