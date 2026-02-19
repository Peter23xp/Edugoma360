import * as XLSX from 'xlsx';

export interface StudentImportData {
    nom: string;
    postNom: string;
    prenom?: string;
    sexe: 'M' | 'F';
    dateNaissance: string;
    lieuNaissance: string;
    nationalite: string;
    className: string;
    statut: 'NOUVEAU' | 'REDOUBLANT' | 'TRANSFERE' | 'DEPLACE' | 'REFUGIE';
    ecoleOrigine?: string;
    resultatTenasosp?: number;
    nomPere?: string;
    telPere?: string;
    nomMere?: string;
    telMere?: string;
    nomTuteur?: string;
    telTuteur: string;
    tuteurPrincipal: 'pere' | 'mere' | 'tuteur';
}

export interface ParsedStudent {
    row: number;
    data: Partial<StudentImportData>;
    errors: string[];
    warnings: string[];
}

const PHONE_REGEX = /^\+243(81|82|97|98|89|90|91|92|93|94|95|96|97|98|99)\d{7}$/;

const COLUMN_MAPPING = {
    A: 'nom',
    B: 'postNom',
    C: 'prenom',
    D: 'sexe',
    E: 'dateNaissance',
    F: 'lieuNaissance',
    G: 'nationalite',
    H: 'className',
    I: 'statut',
    J: 'ecoleOrigine',
    K: 'resultatTenasosp',
    L: 'nomPere',
    M: 'telPere',
    N: 'nomMere',
    O: 'telMere',
    P: 'nomTuteur',
    Q: 'telTuteur',
    R: 'tuteurPrincipal',
};

export async function parseStudentsFile(file: File): Promise<ParsedStudent[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    reject(new Error('Impossible de lire le fichier'));
                    return;
                }

                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to array of arrays
                const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: '',
                    raw: false,
                });

                // Skip header row (row 0)
                const dataRows = rows.slice(1);

                const parsed: ParsedStudent[] = dataRows
                    .map((row, index) => {
                        const rowNum = index + 2; // +2 because Excel starts at 1 and we skip header

                        // Skip empty rows
                        if (row.every((cell) => !cell || cell.toString().trim() === '')) {
                            return null;
                        }

                        const data = parseRow(row);
                        const errors = validateRow(data, rowNum);
                        const warnings = checkWarnings(data, rowNum);

                        return { row: rowNum, data, errors, warnings };
                    })
                    .filter((row): row is ParsedStudent => row !== null);

                resolve(parsed);
            } catch (error: any) {
                reject(new Error(`Erreur lors de l'analyse du fichier: ${error.message}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Erreur lors de la lecture du fichier'));
        };

        reader.readAsBinaryString(file);
    });
}

function parseRow(row: any[]): Partial<StudentImportData> {
    const data: Partial<StudentImportData> = {};

    // Map columns to data fields
    row.forEach((cell, index) => {
        const columnLetter = String.fromCharCode(65 + index); // A, B, C, ...
        const fieldName = COLUMN_MAPPING[columnLetter as keyof typeof COLUMN_MAPPING];

        if (fieldName && cell !== undefined && cell !== null && cell !== '') {
            const value = cell.toString().trim();

            // Transform specific fields
            if (fieldName === 'nom' || fieldName === 'postNom') {
                data[fieldName] = value.toUpperCase();
            } else if (fieldName === 'sexe') {
                data[fieldName] = value.toUpperCase() as 'M' | 'F';
            } else if (fieldName === 'resultatTenasosp') {
                data[fieldName] = parseFloat(value);
            } else if (fieldName === 'statut') {
                data[fieldName] = value.toUpperCase() as any;
            } else if (fieldName === 'tuteurPrincipal') {
                data[fieldName] = value.toLowerCase() as 'pere' | 'mere' | 'tuteur';
            } else {
                (data as any)[fieldName] = value;
            }
        }
    });

    return data;
}

const validateRow = (data: Partial<StudentImportData>, _rowNum: number): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!data.nom || data.nom.length < 2) {
        errors.push('Nom manquant ou trop court (min 2 caractères)');
    }

    if (!data.postNom || data.postNom.length < 2) {
        errors.push('Post-nom manquant ou trop court (min 2 caractères)');
    }

    if (!data.sexe || !['M', 'F'].includes(data.sexe)) {
        errors.push('Sexe invalide (doit être M ou F)');
    }

    if (!data.dateNaissance) {
        errors.push('Date de naissance manquante');
    } else {
        // Validate date format
        const date = new Date(data.dateNaissance);
        if (isNaN(date.getTime())) {
            errors.push('Date de naissance invalide');
        } else {
            const age = new Date().getFullYear() - date.getFullYear();
            if (age < 5 || age > 30) {
                errors.push('Âge invalide (doit être entre 5 et 30 ans)');
            }
        }
    }

    if (!data.lieuNaissance || data.lieuNaissance.length < 2) {
        errors.push('Lieu de naissance manquant');
    }

    if (!data.nationalite || data.nationalite.length < 2) {
        errors.push('Nationalité manquante');
    }

    if (!data.className) {
        errors.push('Classe manquante');
    }

    if (!data.statut) {
        errors.push('Statut manquant');
    } else if (
        !['NOUVEAU', 'REDOUBLANT', 'TRANSFERE', 'DEPLACE', 'REFUGIE'].includes(data.statut)
    ) {
        errors.push('Statut invalide');
    }

    // École d'origine required if TRANSFERE
    if (data.statut === 'TRANSFERE' && !data.ecoleOrigine) {
        errors.push('École d\'origine requise pour un élève transféré');
    }

    // Validate TENASOSP result
    if (data.resultatTenasosp !== undefined) {
        if (data.resultatTenasosp < 0 || data.resultatTenasosp > 100) {
            errors.push('Résultat TENASOSP invalide (doit être entre 0 et 100)');
        }
    }

    // At least one phone required
    if (!data.telPere && !data.telMere && !data.telTuteur) {
        errors.push('Au moins un numéro de téléphone est requis');
    }

    // Validate phone formats
    if (data.telPere && !PHONE_REGEX.test(data.telPere)) {
        errors.push('Téléphone père invalide (format: +243XXXXXXXXX)');
    }

    if (data.telMere && !PHONE_REGEX.test(data.telMere)) {
        errors.push('Téléphone mère invalide (format: +243XXXXXXXXX)');
    }

    if (data.telTuteur && !PHONE_REGEX.test(data.telTuteur)) {
        errors.push('Téléphone tuteur invalide (format: +243XXXXXXXXX)');
    }

    // Validate tuteur principal
    if (!data.tuteurPrincipal) {
        errors.push('Tuteur principal manquant');
    } else if (!['pere', 'mere', 'tuteur'].includes(data.tuteurPrincipal)) {
        errors.push('Tuteur principal invalide (doit être pere, mere ou tuteur)');
    } else {
        // Check if tuteur principal has a phone
        const tuteurPhone =
            data.tuteurPrincipal === 'pere'
                ? data.telPere
                : data.tuteurPrincipal === 'mere'
                    ? data.telMere
                    : data.telTuteur;

        if (!tuteurPhone) {
            errors.push('Le tuteur principal doit avoir un numéro de téléphone');
        }
    }

    return errors;
}

const checkWarnings = (data: Partial<StudentImportData>, _rowNum: number): string[] => {
    const warnings: string[] = [];

    // Optional but recommended fields
    if (!data.prenom) {
        warnings.push('Prénom non renseigné');
    }

    if (!data.nomPere && !data.nomMere && !data.nomTuteur) {
        warnings.push('Aucun nom de parent/tuteur renseigné');
    }

    if (data.statut === 'NOUVEAU' && data.ecoleOrigine) {
        warnings.push('École d\'origine renseignée pour un nouvel élève');
    }

    return warnings;
}
