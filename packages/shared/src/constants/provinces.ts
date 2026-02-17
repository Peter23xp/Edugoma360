// ── Provinces de la RDC ──────────────────────────────────────────────────────

export interface Province {
    code: string;
    name: string;
    chefLieu: string;
    indicatif: string; // Indicatif téléphonique
    mainCities: string[];
}

/**
 * Les 26 provinces de la République Démocratique du Congo
 */
export const PROVINCES_RDC: Province[] = [
    { code: 'NK', name: 'Nord-Kivu', chefLieu: 'Goma', indicatif: '+243', mainCities: ['Goma', 'Butembo', 'Beni', 'Lubero', 'Rutshuru', 'Masisi'] },
    { code: 'SK', name: 'Sud-Kivu', chefLieu: 'Bukavu', indicatif: '+243', mainCities: ['Bukavu', 'Uvira', 'Kabare', 'Kalehe'] },
    { code: 'KIN', name: 'Kinshasa', chefLieu: 'Kinshasa', indicatif: '+243', mainCities: ['Kinshasa'] },
    { code: 'KC', name: 'Kongo-Central', chefLieu: 'Matadi', indicatif: '+243', mainCities: ['Matadi', 'Boma', 'Muanda'] },
    { code: 'KW', name: 'Kwango', chefLieu: 'Kenge', indicatif: '+243', mainCities: ['Kenge'] },
    { code: 'KL', name: 'Kwilu', chefLieu: 'Kikwit', indicatif: '+243', mainCities: ['Kikwit', 'Bandundu'] },
    { code: 'MA', name: 'Maï-Ndombe', chefLieu: 'Inongo', indicatif: '+243', mainCities: ['Inongo'] },
    { code: 'EQ', name: 'Équateur', chefLieu: 'Mbandaka', indicatif: '+243', mainCities: ['Mbandaka'] },
    { code: 'MG', name: 'Mongala', chefLieu: 'Lisala', indicatif: '+243', mainCities: ['Lisala', 'Bumba'] },
    { code: 'NUB', name: 'Nord-Ubangi', chefLieu: 'Gbadolite', indicatif: '+243', mainCities: ['Gbadolite'] },
    { code: 'SUB', name: 'Sud-Ubangi', chefLieu: 'Gemena', indicatif: '+243', mainCities: ['Gemena'] },
    { code: 'TS', name: 'Tshuapa', chefLieu: 'Boende', indicatif: '+243', mainCities: ['Boende'] },
    { code: 'TO', name: 'Tshopo', chefLieu: 'Kisangani', indicatif: '+243', mainCities: ['Kisangani'] },
    { code: 'BU', name: 'Bas-Uele', chefLieu: 'Buta', indicatif: '+243', mainCities: ['Buta'] },
    { code: 'HU', name: 'Haut-Uele', chefLieu: 'Isiro', indicatif: '+243', mainCities: ['Isiro'] },
    { code: 'IT', name: 'Ituri', chefLieu: 'Bunia', indicatif: '+243', mainCities: ['Bunia'] },
    { code: 'MN', name: 'Maniema', chefLieu: 'Kindu', indicatif: '+243', mainCities: ['Kindu'] },
    { code: 'TG', name: 'Tanganyika', chefLieu: 'Kalemie', indicatif: '+243', mainCities: ['Kalemie'] },
    { code: 'HK', name: 'Haut-Katanga', chefLieu: 'Lubumbashi', indicatif: '+243', mainCities: ['Lubumbashi', 'Likasi', 'Kolwezi'] },
    { code: 'HL', name: 'Haut-Lomami', chefLieu: 'Kamina', indicatif: '+243', mainCities: ['Kamina'] },
    { code: 'LU', name: 'Lualaba', chefLieu: 'Kolwezi', indicatif: '+243', mainCities: ['Kolwezi'] },
    { code: 'KS', name: 'Kasaï', chefLieu: 'Tshikapa', indicatif: '+243', mainCities: ['Tshikapa'] },
    { code: 'KC2', name: 'Kasaï-Central', chefLieu: 'Kananga', indicatif: '+243', mainCities: ['Kananga'] },
    { code: 'KO', name: 'Kasaï-Oriental', chefLieu: 'Mbuji-Mayi', indicatif: '+243', mainCities: ['Mbuji-Mayi'] },
    { code: 'LM', name: 'Lomami', chefLieu: 'Kabinda', indicatif: '+243', mainCities: ['Kabinda'] },
    { code: 'SN', name: 'Sankuru', chefLieu: 'Lusambo', indicatif: '+243', mainCities: ['Lusambo'] },
];

/**
 * Get province by code
 */
export function getProvinceByCode(code: string): Province | undefined {
    return PROVINCES_RDC.find((p) => p.code === code);
}

/**
 * Get cities for a province
 */
export function getCitiesForProvince(provinceCode: string): string[] {
    const province = PROVINCES_RDC.find((p) => p.code === provinceCode);
    return province?.mainCities ?? [];
}

/**
 * Get default province (Nord-Kivu for Goma)
 */
export function getDefaultProvince(): Province {
    return PROVINCES_RDC.find((p) => p.code === 'NK')!;
}
