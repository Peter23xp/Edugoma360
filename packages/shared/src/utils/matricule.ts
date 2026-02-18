/**
 * Génère un matricule unique pour un élève
 * Format: PROVINCE-VILLE-CODE_ECOLE-SEQUENCE
 * Exemple: NK-GOM-ISS001-0234
 */
export function generateMatricule(
    province: string,
    ville: string,
    schoolCode: string,
    sequence: number
): string {
    const seq = sequence.toString().padStart(4, '0');
    return `${province}-${ville}-${schoolCode}-${seq}`;
}

/**
 * Obtient le code de province (2-3 lettres)
 */
export function getProvinceCode(province: string): string {
    const codes: Record<string, string> = {
        'Nord-Kivu': 'NK',
        'Sud-Kivu': 'SK',
        'Kinshasa': 'KIN',
        'Haut-Katanga': 'HK',
        'Kongo-Central': 'KC',
        'Ituri': 'ITU',
        'Tshopo': 'TSH',
        'Équateur': 'EQU',
        'Maniema': 'MAN',
        'Tanganyika': 'TAN',
        'Haut-Lomami': 'HL',
        'Lualaba': 'LUA',
        'Kasaï': 'KAS',
        'Kasaï-Central': 'KAC',
        'Kasaï-Oriental': 'KAO',
        'Lomami': 'LOM',
        'Sankuru': 'SAN',
        'Kwilu': 'KWI',
        'Kwango': 'KWA',
        'Mai-Ndombe': 'MND',
        'Mongala': 'MON',
        'Nord-Ubangi': 'NU',
        'Sud-Ubangi': 'SU',
        'Tshuapa': 'TSU',
        'Bas-Uele': 'BU',
        'Haut-Uele': 'HU',
    };

    return codes[province] || province.substring(0, 3).toUpperCase();
}

/**
 * Obtient le code de ville (3 lettres)
 */
export function getCityCode(ville: string): string {
    const codes: Record<string, string> = {
        'Goma': 'GOM',
        'Bukavu': 'BUK',
        'Kinshasa': 'KIN',
        'Lubumbashi': 'LUB',
        'Mbuji-Mayi': 'MBM',
        'Kananga': 'KAN',
        'Kisangani': 'KIS',
        'Beni': 'BEN',
        'Butembo': 'BUT',
        'Uvira': 'UVI',
        'Kolwezi': 'KOL',
        'Likasi': 'LIK',
        'Matadi': 'MAT',
        'Mbandaka': 'MBA',
        'Bunia': 'BUN',
    };

    return codes[ville] || ville.substring(0, 3).toUpperCase();
}

/**
 * Parse un matricule pour extraire ses composants
 */
export function parseMatricule(matricule: string): {
    province: string;
    ville: string;
    schoolCode: string;
    sequence: number;
} | null {
    const parts = matricule.split('-');
    if (parts.length !== 4) return null;

    return {
        province: parts[0],
        ville: parts[1],
        schoolCode: parts[2],
        sequence: parseInt(parts[3], 10),
    };
}

/**
 * Valide le format d'un matricule
 */
export function isValidMatricule(matricule: string): boolean {
    const regex = /^[A-Z]{2,3}-[A-Z]{3}-[A-Z0-9]+-\d{4}$/;
    return regex.test(matricule);
}
