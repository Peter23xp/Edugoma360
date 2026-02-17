// ── Générateur de Matricule MEPST ────────────────────────────────────────────
// Format: {PROVINCE}-{VILLE}-{ECOLE}-{SEQUENCE}
// Exemple: NK-GOM-ISS001-0001

/**
 * Structure d'un matricule décomposé
 */
export interface ParsedMatricule {
    province: string;
    ville: string;
    ecole: string;
    sequence: string;
}

/**
 * Regex de validation du format matricule MEPST
 */
const MATRICULE_REGEX = /^[A-Z]{2,4}-[A-Z]{3,4}-[A-Z]{2,6}\d{3}-\d{4,6}$/;

/**
 * Génère un matricule MEPST au format standard
 * 
 * @param schoolCode - Code de l'école (ex: "ISS001")
 * @param sequence - Numéro séquentiel de l'élève (ex: 1, 234, 1500)
 * @param provinceCode - Code province (défaut: "NK" pour Nord-Kivu)
 * @param villeCode - Code ville (défaut: "GOM" pour Goma)
 * @returns Matricule formaté (ex: "NK-GOM-ISS001-0001")
 * 
 * @example
 * generateMatricule('ISS001', 1) // → "NK-GOM-ISS001-0001"
 * generateMatricule('ISS001', 234) // → "NK-GOM-ISS001-0234"
 * generateMatricule('LYC003', 15, 'SK', 'BKV') // → "SK-BKV-LYC003-0015"
 */
export function generateMatricule(
    schoolCode: string,
    sequence: number,
    provinceCode: string = 'NK',
    villeCode: string = 'GOM',
): string {
    if (!schoolCode || schoolCode.length < 3) {
        throw new Error('Le code école doit contenir au moins 3 caractères');
    }
    if (sequence < 1) {
        throw new Error('Le numéro séquentiel doit être supérieur à 0');
    }

    const paddedSequence = String(sequence).padStart(4, '0');
    return `${provinceCode.toUpperCase()}-${villeCode.toUpperCase()}-${schoolCode.toUpperCase()}-${paddedSequence}`;
}

/**
 * Valide le format d'un matricule MEPST
 * 
 * @param matricule - Le matricule à valider
 * @returns true si le format est valide
 * 
 * @example
 * validateMatricule('NK-GOM-ISS001-0234') // → true
 * validateMatricule('Invalid') // → false
 */
export function validateMatricule(matricule: string): boolean {
    if (!matricule) return false;
    return MATRICULE_REGEX.test(matricule.toUpperCase().trim());
}

/**
 * Décompose un matricule MEPST en ses composants
 * 
 * @param matricule - Le matricule à analyser
 * @returns Les composants du matricule ou null si invalide
 * 
 * @example
 * parseMatricule('NK-GOM-ISS001-0234')
 * // → { province: 'NK', ville: 'GOM', ecole: 'ISS001', sequence: '0234' }
 */
export function parseMatricule(matricule: string): ParsedMatricule | null {
    if (!validateMatricule(matricule)) return null;

    const parts = matricule.toUpperCase().trim().split('-');
    if (parts.length !== 4) return null;

    return {
        province: parts[0],
        ville: parts[1],
        ecole: parts[2],
        sequence: parts[3],
    };
}

/**
 * Génère le prochain numéro de séquence basé sur le dernier matricule connu
 * 
 * @param lastMatricule - Le dernier matricule attribué
 * @returns Le prochain numéro de séquence
 */
export function getNextSequence(lastMatricule: string | null): number {
    if (!lastMatricule) return 1;

    const parsed = parseMatricule(lastMatricule);
    if (!parsed) return 1;

    return parseInt(parsed.sequence, 10) + 1;
}

/**
 * Génère un numéro de reçu pour les paiements
 * Format: {PROVINCE}-{VILLE}-{ECOLE}-{ANNEE}-{SEQUENCE}
 * 
 * @example
 * generateReceiptNumber('ISS001', 2025, 847) // → "NK-GOM-ISS001-2025-0847"
 */
export function generateReceiptNumber(
    schoolCode: string,
    year: number,
    sequence: number,
    provinceCode: string = 'NK',
    villeCode: string = 'GOM',
): string {
    const paddedSequence = String(sequence).padStart(4, '0');
    return `${provinceCode}-${villeCode}-${schoolCode}-${year}-${paddedSequence}`;
}
