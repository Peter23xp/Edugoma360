import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Début du peuplement de l\'année académique, des sections et des classes...\n');

    const school = await prisma.school.findFirst();
    if (!school) {
        console.error('❌ Aucune école trouvée. Veuillez d\'abord exécuter "npm run db:seed"');
        return;
    }

    const schoolId = school.id;

    // ── 1. Create Academic Year ────────────────────────────────────────────────
    console.log('📅 Création de l\'année académique 2025-2026...');
    const academicYear = await prisma.academicYear.upsert({
        where: { schoolId_label: { schoolId, label: '2025-2026' } },
        update: { isActive: true },
        create: {
            schoolId,
            label: '2025-2026',
            startDate: new Date('2025-09-02'),
            endDate: new Date('2026-07-02'),
            isActive: true,
        },
    });

    // ── 2. Create Terms ────────────────────────────────────────────────────────
    console.log('📅 Création des trimestres...');
    const terms = [
        { number: 1, label: 'Premier Trimestre', start: '2025-09-02', end: '2025-12-20' },
        { number: 2, label: 'Deuxième Trimestre', start: '2026-01-05', end: '2026-03-30' },
        { number: 3, label: 'Troisième Trimestre', start: '2026-04-15', end: '2026-07-02' },
    ];

    for (const term of terms) {
        await prisma.term.upsert({
            where: { academicYearId_number: { academicYearId: academicYear.id, number: term.number } },
            update: {},
            create: {
                academicYearId: academicYear.id,
                number: term.number,
                label: term.label,
                startDate: new Date(term.start),
                endDate: new Date(term.end),
                isActive: term.number === 1,
            },
        });
    }

    // ── 3. Create Sections ─────────────────────────────────────────────────────
    console.log('🏫 Création des sections (Maternelle, Primaire, EB, Humanités)...');

    const sectionsData = [
        { name: 'Maternelle', code: 'MAT', year: 3 },
        { name: 'Primaire', code: 'PRI', year: 6 },
        { name: 'Education de Base (7e et 8e)', code: 'EB', year: 2 },
        { name: 'Pédagogie Générale', code: 'HPG', year: 4 },
        { name: 'Scientifique (Biologie-Chimie)', code: 'HBC', year: 4 },
        { name: 'Scientifique (Math-Physique)', code: 'HMP', year: 4 },
        { name: 'Commerciale et Gestion', code: 'HCG', year: 4 },
    ];

    const sections = [];
    for (const sec of sectionsData) {
        const section = await prisma.section.upsert({
            where: { schoolId_code_year: { schoolId, code: sec.code, year: sec.year } },
            update: {},
            create: {
                schoolId,
                name: sec.name,
                code: sec.code,
                year: sec.year,
            },
        });
        sections.push(section);
    }

    // ── 4. Create Classes ──────────────────────────────────────────────────────
    console.log('🏫 Création des classes associées aux sections...');

    const classesData: any[] = [];

    // Maternelle
    const matSection = sections.find(s => s.code === 'MAT')!;
    ['1ère Maternelle', '2ème Maternelle', '3ème Maternelle'].forEach(name => {
        classesData.push({ schoolId, sectionId: matSection.id, name, isActive: true, maxStudents: 30 });
    });

    // Primaire
    const priSection = sections.find(s => s.code === 'PRI')!;
    ['1ère Primaire', '2ème Primaire', '3ème Primaire', '4ème Primaire', '5ème Primaire', '6ème Primaire'].forEach(name => {
        // Créeons 2 classes par niveau
        ['A', 'B'].forEach(letter => {
            classesData.push({ schoolId, sectionId: priSection.id, name: `${name} ${letter}`, isActive: true, maxStudents: 40 });
        });
    });

    // EB
    const ebSection = sections.find(s => s.code === 'EB')!;
    ['7ème EB', '8ème EB'].forEach(name => {
        ['A', 'B'].forEach(letter => {
            classesData.push({ schoolId, sectionId: ebSection.id, name: `${name} ${letter}`, isActive: true, maxStudents: 45 });
        });
    });

    // Humanités
    const humaSections = [
        { code: 'HPG', prefix: 'Pédagogie Générale' },
        { code: 'HBC', prefix: 'Bio-Chimie' },
        { code: 'HMP', prefix: 'Math-Physique' },
        { code: 'HCG', prefix: 'Commerciale & Gestion' },
    ];

    for (const h of humaSections) {
        const hSec = sections.find(s => s.code === h.code)!;
        ['1ère', '2ème', '3ème', '4ème'].forEach(level => {
            classesData.push({ schoolId, sectionId: hSec.id, name: `${level} ${h.prefix}`, isActive: true, maxStudents: 40 });
        });
    }

    for (const cl of classesData) {
        await prisma.class.upsert({
            where: { schoolId_name: { schoolId, name: cl.name } },
            update: {},
            create: cl,
        });
    }

    console.log('\n✅ Données académiques (Année, Sections, Classes) créées avec succès !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
