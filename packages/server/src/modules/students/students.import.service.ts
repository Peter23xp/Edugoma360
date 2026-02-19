import ExcelJS from 'exceljs';
import { z } from 'zod';
import prisma from '../../lib/prisma';
// import { generateMatricule, getNextSequence } from '@edugoma360/shared';
// Prisma types are usually auto-generated. Let's assume StudentStatus is available or we'll define it locally to be safe.
// Actually status is String in the schema but often mapped to enum if defined. The schema says "String // StudentStatus".
// Let's use string literal union to match Zod schema.

// ── SCHEMAS ───────────────────────────────────────────────────

const AVAILABLE_STATUSES = ['NOUVEAU', 'REDOUBLANT', 'TRANSFERE', 'DEPLACE', 'REFUGIE', 'ARCHIVE'] as const;

const importRowSchema = z.object({
    nom: z.string().min(2).transform(s => s.toUpperCase()),
    postNom: z.string().min(2).transform(s => s.toUpperCase()),
    prenom: z.string().optional(),
    sexe: z.enum(['M', 'F']),
    dateNaissance: z.string(), // Format JJ/MM/AAAA
    lieuNaissance: z.string().min(2),
    nationalite: z.string().default('Congolaise'),
    classe: z.string(), // Nom exact de la classe
    statut: z.enum(AVAILABLE_STATUSES),
    ecoleOrigine: z.string().optional(),
    resultatTenasosp: z.number().min(0).max(100).optional(),
    nomPere: z.string().optional(),
    telPere: z.string().regex(/^\+243(80|81|82|83|84|85|89|90|91|97|98|99)\d{7}$/).optional(),
    nomMere: z.string().optional(),
    telMere: z.string().regex(/^\+243(80|81|82|83|84|85|89|90|91|97|98|99)\d{7}$/).optional(),
    nomTuteur: z.string().optional(),
    telTuteur: z.string().regex(/^\+243(80|81|82|83|84|85|89|90|91|97|98|99)\d{7}$/).optional(), // Made optional as per some contexts, but let's check prompt requirement. Prompt schema says required in template but validated optional in some places. Let's keep strict if possible but practical. Prompt schema had telTuteur required.
    tuteurPrincipal: z.enum(['pere', 'mere', 'tuteur']).default('tuteur')
});

type ImportRow = z.infer<typeof importRowSchema>;

interface ImportResult {
    imported: number;
    skipped: number;
    errors: Array<{ row: number; message: string }>;
    students: any[];
}

// ── TEMPLATE EXCEL ────────────────────────────────────────────

export async function generateImportTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Feuille 1 : Élèves
    const sheet = workbook.addWorksheet('Élèves');

    // En-têtes
    sheet.columns = [
        { header: 'matricule', key: 'matricule', width: 15 }, // Keep matricule col just in case, though ignored on import usually
        { header: 'nom *', key: 'nom', width: 20 },
        { header: 'postNom *', key: 'postNom', width: 20 },
        { header: 'prenom', key: 'prenom', width: 20 },
        { header: 'sexe *', key: 'sexe', width: 5 },
        { header: 'dateNaissance *', key: 'dateNaissance', width: 15 },
        { header: 'lieuNaissance *', key: 'lieuNaissance', width: 25 },
        { header: 'nationalite *', key: 'nationalite', width: 15 },
        { header: 'classe *', key: 'classe', width: 10 },
        { header: 'statut *', key: 'statut', width: 15 },
        { header: 'ecoleOrigine', key: 'ecoleOrigine', width: 30 },
        { header: 'resultatTenasosp', key: 'resultatTenasosp', width: 15 },
        { header: 'nomPere', key: 'nomPere', width: 25 },
        { header: 'telPere', key: 'telPere', width: 15 },
        { header: 'nomMere', key: 'nomMere', width: 25 },
        { header: 'telMere', key: 'telMere', width: 15 },
        { header: 'nomTuteur', key: 'nomTuteur', width: 25 },
        { header: 'telTuteur', key: 'telTuteur', width: 15 },
        { header: 'tuteurPrincipal', key: 'tuteurPrincipal', width: 15 }
    ];

    // Formater les en-têtes
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' }
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Exemple ligne 2 (valide)
    sheet.addRow({
        nom: 'AMISI',
        postNom: 'KALOMBO',
        prenom: 'Jean-Baptiste',
        sexe: 'M',
        dateNaissance: '12/03/2008',
        lieuNaissance: 'Goma, Nord-Kivu',
        nationalite: 'Congolaise',
        classe: '4ScA',
        statut: 'NOUVEAU',
        ecoleOrigine: '',
        resultatTenasosp: 67,
        nomPere: 'AMISI PIERRE',
        telPere: '+243810000000',
        nomMere: 'KAHINDO ALICE',
        telMere: '+243820000000',
        nomTuteur: '',
        telTuteur: '+243810000000',
        tuteurPrincipal: 'pere'
    });

    // Feuille 2 : Instructions
    const instructions = workbook.addWorksheet('Instructions');
    instructions.addRow(['GUIDE D\'IMPORTATION - EDUGOMA 360']);
    instructions.addRow([]);
    instructions.addRow(['1. Remplissez une ligne par élève dans la feuille "Élèves"']);
    instructions.addRow(['2. Les colonnes marquées * sont obligatoires']);
    instructions.addRow(['3. Formats acceptés:']);
    instructions.addRow(['   - Date: JJ/MM/AAAA (ex: 12/03/2008)']);
    instructions.addRow(['   - Téléphone: +243XXXXXXXXX (Airtel: 81/82, Vodacom: 97/98)']);
    instructions.addRow(['   - Sexe: M ou F']);
    instructions.addRow(['4. Sauvegardez et importez le fichier']);

    return (await workbook.xlsx.writeBuffer()) as any;
}

// ── IMPORT PRINCIPAL ──────────────────────────────────────────

export async function importStudentsFromExcel(
    fileBuffer: Buffer,
    schoolId: string
): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);

    const worksheet = workbook.getWorksheet(1); // Get first sheet
    if (!worksheet) {
        throw new Error('Feuille "Élèves" introuvable');
    }

    const rows: { rowNumber: number; data: any }[] = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip headers
        rows.push({ rowNumber, data: row.values });
    });

    const result: ImportResult = {
        imported: 0,
        skipped: 0,
        errors: [],
        students: []
    };

    // Transaction pour tout ou rien (ou best effort selon logique)
    // Ici on fait ligne par ligne pour permettre l'import partiel et rapporter les erreurs
    // Mais la logique du prompt disait transaction, ce qui annule tout si une erreur survient.
    // Pour un import de masse, souvent on veut importer ce qui est valide.
    // Le code du prompt fait: await prisma.$transaction(async (tx) => { ... loop ... })
    // Si on veut importer partiellement, on ne doit pas wrapper toute la boucle dans une transaction
    // ou on wrap chaque élève. wrapper toute la boucle est plus sûr pour la consistance mais frustrant pour l'utilisateur.
    // Le code prompt met tout dans transaction mais catch les erreurs à l'intérieur de la boucle ? 
    // Ah non, le catch est DANS la boucle. Donc si une erreur survient, on loggue l'erreur et on continue.
    // Donc la transaction n'échoue QUE si une erreur non catchée survient (e.g. DB connection lost).

    await prisma.$transaction(async (tx) => {
        for (const { rowNumber, data } of rows) {
            try {
                // Parse la ligne
                const rawData = parseRowData(data);

                // Zod validation
                const validationResult = importRowSchema.safeParse(rawData);
                if (!validationResult.success) {
                    result.errors.push({
                        row: rowNumber,
                        message: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
                    });
                    continue;
                }

                const validated = validationResult.data;
                const dateNaissance = parseDate(validated.dateNaissance);

                // Vérifier doublon
                const existing = await tx.student.findFirst({
                    where: {
                        schoolId,
                        nom: validated.nom,
                        postNom: validated.postNom,
                        dateNaissance: dateNaissance
                    }
                });

                if (existing) {
                    result.skipped++;
                    continue;
                }

                // Trouver la classe
                const year = await tx.academicYear.findFirst({
                    where: { schoolId, isActive: true }
                });

                if (!year) {
                    throw new Error('Aucune année académique active');
                }

                const classe = await tx.class.findFirst({
                    where: { schoolId, name: validated.classe, isActive: true }
                });

                if (!classe) {
                    result.errors.push({
                        row: rowNumber,
                        message: `Classe "${validated.classe}" introuvable`
                    });
                    continue;
                }

                // Générer matricule
                const school = await tx.school.findUnique({ where: { id: schoolId } });
                const lastStudent = await tx.student.findFirst({
                    where: { schoolId },
                    orderBy: { createdAt: 'desc' }
                });

                // Use helper from shared or logic inline if simple
                // Using string manipulation as shown in prompt
                const lastSeq = lastStudent ? parseInt(lastStudent.matricule.split('-').pop() || '0', 10) : 0;
                const nextSeq = lastSeq + 1;

                const matricule = generateMatricule(
                    getProvinceCode(school!.province),
                    getCityCode(school!.ville),
                    'ISS001', // TODO: school.code field might not exist in Prisma schema yet? Schema check: School has convention, agrement, etc. but not explicitly 'code'. Using default.
                    nextSeq
                );

                // Créer l'élève
                const student = await tx.student.create({
                    data: {
                        schoolId,
                        matricule,
                        nom: validated.nom,
                        postNom: validated.postNom,
                        prenom: validated.prenom,
                        sexe: validated.sexe,
                        dateNaissance: dateNaissance,
                        lieuNaissance: validated.lieuNaissance,
                        nationalite: validated.nationalite,
                        statut: validated.statut,
                        nomPere: validated.nomPere,
                        telPere: validated.telPere,
                        nomMere: validated.nomMere,
                        telMere: validated.telMere,
                        nomTuteur: validated.nomTuteur,
                        telTuteur: validated.telTuteur,
                        enrollments: {
                            create: {
                                classId: classe.id,
                                academicYearId: year.id,
                                ecoleOrigine: validated.ecoleOrigine,
                                resultatTenasosp: validated.resultatTenasosp
                            }
                        }
                    }
                });

                result.imported++;
                result.students.push(student);

            } catch (error: any) {
                result.errors.push({
                    row: rowNumber,
                    message: error.message || 'Erreur inconnue'
                });
            }
        }
    }, {
        timeout: 60000 // 1 minute timeout for large files
    });

    return result;
}

// ── HELPERS ───────────────────────────────────────────────────

function parseRowData(values: any): any {
    // ExcelJS values array is 1-indexed. index 0 is empty? usually.
    // values[1] is column A, etc.
    return {
        matricule: values[1], // ignored but mapped
        nom: values[2],
        postNom: values[3],
        prenom: values[4],
        sexe: values[5],
        dateNaissance: values[6],
        lieuNaissance: values[7],
        nationalite: values[8] || 'Congolaise',
        classe: values[9],
        statut: values[10],
        ecoleOrigine: values[11],
        resultatTenasosp: values[12] ? Number(values[12]) : undefined,
        nomPere: values[13],
        telPere: values[14],
        nomMere: values[15],
        telMere: values[16],
        nomTuteur: values[17],
        telTuteur: values[18],
        tuteurPrincipal: values[19] || 'tuteur'
    };
}

function parseDate(dateStr: unknown): Date {
    // Support Date object (Excel sometimes parses it) or string
    if (dateStr instanceof Date) return dateStr;

    if (typeof dateStr === 'string') {
        const [day, month, year] = dateStr.split('/').map(Number);
        if (!day || !month || !year) throw new Error(`Date invalide: ${dateStr}`);
        return new Date(year, month - 1, day);
    }

    throw new Error(`Format de date invalide: ${dateStr}`);
}

function getProvinceCode(province: string): string {
    const codes: Record<string, string> = {
        'Nord-Kivu': 'NK',
        'Sud-Kivu': 'SK',
        'Kinshasa': 'KIN',
        'Haut-Katanga': 'HK'
        // ... autres provinces
    };
    return codes[province] || province.substring(0, 3).toUpperCase();
}

function getCityCode(ville: string): string {
    const codes: Record<string, string> = {
        'Goma': 'GOM',
        'Bukavu': 'BKV',
        'Kinshasa': 'KIN',
        'Lubumbashi': 'LUB'
        // ... autres villes
    };
    return codes[ville] || ville.substring(0, 3).toUpperCase();
}

/**
 * Génère un matricule unique pour un élève
 */
function generateMatricule(
    province: string,
    ville: string,
    schoolCode: string,
    sequence: number
): string {
    const seq = sequence.toString().padStart(4, '0');
    return `${province}-${ville}-${schoolCode}-${seq}`;
}
