import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Début du peuplement de la base de données...\n');

    const BCRYPT_ROUNDS = 12;

    // ── 1. Create School ──────────────────────────────────────────────────────
    console.log('🏫 Création de l\'école...');
    const school = await prisma.school.upsert({
        where: { id: 'school-001' },
        update: {},
        create: {
            id: 'school-001',
            name: 'Institut Technique de Goma',
            type: 'CONVENTIONNEE',
            convention: 'Protestante',
            agrement: 'NK/EPSP/2024/0042',
            province: 'Nord-Kivu',
            ville: 'Goma',
            commune: 'Goma',
            adresse: 'Avenue du Rond-Point, Q. Les Volcans',
            telephone: '+243970000001',
            email: 'info@itg-goma.cd',
        },
    });

    // ── 2. Create Users ───────────────────────────────────────────────────────
    console.log('👥 Création des utilisateurs...');
    const users = [
        { nom: 'KAHINDO', postNom: 'MUTABESHA', prenom: 'Jean', phone: '+243990000001', email: 'admin@edugoma360.cd', role: 'SUPER_ADMIN', password: 'Admin@2025' },
        { nom: 'MUHINDO', postNom: 'KASEREKA', prenom: 'Patrick', phone: '+243990000002', role: 'PREFET', password: 'Prefet@2024' },
        { nom: 'KAMBALE', postNom: 'MUSAVULI', prenom: 'Marie', phone: '+243990000003', role: 'ECONOME', password: 'Econome@2024' },
        { nom: 'KAVIRA', postNom: 'MAOMBI', prenom: 'Grace', phone: '+243990000004', role: 'SECRETAIRE', password: 'Secret@2024' },
        { nom: 'PALUKU', postNom: 'KAMBASU', prenom: 'Emmanuel', phone: '+243990000005', role: 'ENSEIGNANT', password: 'Prof@2024' },
        { nom: 'MASIKA', postNom: 'SIVIHWA', prenom: 'Aline', phone: '+243990000006', role: 'ENSEIGNANT', password: 'Prof@2024' },
        { nom: 'KASEREKA', postNom: 'LUSENGE', prenom: 'Benjamin', phone: '+243990000007', role: 'ENSEIGNANT', password: 'Prof@2024' },
        { nom: 'KAHINDO', postNom: 'MUHASANYA', prenom: 'Solange', phone: '+243990000008', role: 'PARENT', password: 'Parent@2024' },
    ];

    const createdUsers: any[] = [];
    for (const u of users) {
        const hash = await bcrypt.hash(u.password, BCRYPT_ROUNDS);
        const user = await prisma.user.upsert({
            where: { schoolId_phone: { schoolId: school.id, phone: u.phone } },
            update: {},
            create: {
                schoolId: school.id,
                nom: u.nom,
                postNom: u.postNom,
                prenom: u.prenom,
                phone: u.phone,
                email: (u as any).email ?? null,
                role: u.role as any,
                passwordHash: hash,
            },
        });
        createdUsers.push(user);
    }

    // ── 3. Academic Year & Terms ──────────────────────────────────────────────
    console.log('📅 Création de l\'année académique 2024-2025...');
    const academicYear = await prisma.academicYear.upsert({
        where: { schoolId_label: { schoolId: school.id, label: '2024-2025' } },
        update: {},
        create: {
            schoolId: school.id,
            label: '2024-2025',
            startDate: new Date('2024-09-02'),
            endDate: new Date('2025-06-30'),
            isActive: true,
        },
    });

    const termsData = [
        { number: 1, label: '1er Trimestre', start: '2024-09-02', end: '2024-12-20' },
        { number: 2, label: '2ème Trimestre', start: '2025-01-06', end: '2025-03-28' },
        { number: 3, label: '3ème Trimestre', start: '2025-04-07', end: '2025-06-30' },
    ];

    const terms: any[] = [];
    for (const t of termsData) {
        const term = await prisma.term.upsert({
            where: { academicYearId_number: { academicYearId: academicYear.id, number: t.number } },
            update: {},
            create: {
                academicYearId: academicYear.id,
                number: t.number,
                label: t.label,
                startDate: new Date(t.start),
                endDate: new Date(t.end),
                isActive: t.number === 2,
            },
        });
        terms.push(term);
    }

    // ── 4. Sections ───────────────────────────────────────────────────────────
    console.log('📚 Création des sections...');
    const sectionsData = [
        { name: 'Tronc Commun', code: 'TC', year: 1 },
        { name: 'Tronc Commun', code: 'TC', year: 2 },
        { name: 'Scientifique', code: 'SCIENT', year: 3 },
        { name: 'Scientifique', code: 'SCIENT', year: 4 },
        { name: 'Commerciale & Administrative', code: 'COMM', year: 3 },
        { name: 'Commerciale & Administrative', code: 'COMM', year: 4 },
        { name: 'Pédagogique', code: 'PEDAG', year: 3 },
        { name: 'Pédagogique', code: 'PEDAG', year: 4 },
        { name: 'Littéraire', code: 'LIT', year: 3 },
        { name: 'Littéraire', code: 'LIT', year: 4 },
        { name: 'Technique', code: 'HT', year: 3 },
        { name: 'Technique', code: 'HT', year: 4 },
    ];

    const sections: any[] = [];
    for (const s of sectionsData) {
        const section = await prisma.section.upsert({
            where: { schoolId_code_year: { schoolId: school.id, code: s.code, year: s.year } },
            update: {},
            create: { schoolId: school.id, ...s },
        });
        sections.push(section);
    }

    // ── 5. Classes ────────────────────────────────────────────────────────────
    console.log('🏠 Création des classes...');
    const classesData = [
        { name: '1ère A', sectionCode: 'TC', year: 1 },
        { name: '1ère B', sectionCode: 'TC', year: 1 },
        { name: '2ème A', sectionCode: 'TC', year: 2 },
        { name: '3ème SCIENT A', sectionCode: 'SCIENT', year: 3 },
        { name: '3ème COMM A', sectionCode: 'COMM', year: 3 },
        { name: '4ème SCIENT A', sectionCode: 'SCIENT', year: 4 },
        { name: '4ème PEDAG A', sectionCode: 'PEDAG', year: 4 },
    ];

    const classes: any[] = [];
    for (const c of classesData) {
        const section = sections.find((s) => s.code === c.sectionCode && s.year === c.year);
        if (!section) continue;
        const cls = await prisma.class.upsert({
            where: { schoolId_name: { schoolId: school.id, name: c.name } },
            update: {},
            create: { schoolId: school.id, name: c.name, sectionId: section.id, maxStudents: 45 },
        });
        classes.push(cls);
    }

    // ── 6. Subjects ───────────────────────────────────────────────────────────
    console.log('📖 Création des matières...');
    const subjectsData = [
        { name: 'Mathématiques', abbr: 'MATH', eliminatory: true, elimThreshold: 10, order: 1 },
        { name: 'Physique', abbr: 'PHYS', eliminatory: true, elimThreshold: 10, order: 2 },
        { name: 'Chimie', abbr: 'CHIM', eliminatory: false, order: 3 },
        { name: 'Biologie', abbr: 'BIOL', eliminatory: false, order: 4 },
        { name: 'Français', abbr: 'FRAN', eliminatory: true, elimThreshold: 10, order: 5 },
        { name: 'Anglais', abbr: 'ANGL', eliminatory: false, order: 6 },
        { name: 'Histoire', abbr: 'HIST', eliminatory: false, order: 7 },
        { name: 'Géographie', abbr: 'GEO', eliminatory: false, order: 8 },
        { name: 'Éducation Civique', abbr: 'EDCV', eliminatory: false, order: 9 },
        { name: 'Religion', abbr: 'REL', eliminatory: false, order: 10 },
        { name: 'Éducation Physique', abbr: 'EDPH', eliminatory: false, order: 11 },
        { name: 'Informatique', abbr: 'INFO', eliminatory: false, order: 12 },
        { name: 'Comptabilité', abbr: 'COMPTA', eliminatory: true, elimThreshold: 10, order: 13 },
        { name: 'Économie Politique', abbr: 'ECOPOL', eliminatory: false, order: 14 },
        { name: 'Psychologie', abbr: 'PSYCHO', eliminatory: false, order: 15 },
        { name: 'Pédagogie Générale', abbr: 'PEDAG', eliminatory: true, elimThreshold: 10, order: 16 },
        { name: 'Dessin', abbr: 'DES', eliminatory: false, order: 17 },
        { name: 'Kiswahili', abbr: 'KISW', eliminatory: false, order: 18 },
        { name: 'Latin', abbr: 'LAT', eliminatory: false, order: 19 },
        { name: 'Philosophie', abbr: 'PHILO', eliminatory: false, order: 20 },
    ];

    const subjects: any[] = [];
    for (const s of subjectsData) {
        const subject = await prisma.subject.upsert({
            where: { schoolId_abbreviation: { schoolId: school.id, abbreviation: s.abbr } },
            update: {},
            create: {
                schoolId: school.id,
                name: s.name,
                abbreviation: s.abbr,
                isEliminatory: s.eliminatory,
                elimThreshold: s.elimThreshold ?? null,
                displayOrder: s.order,
            },
        });
        subjects.push(subject);
    }

    // ── 7. Subject ↔ Section assignments ──────────────────────────────────────
    console.log('🔗 Association matières ↔ sections...');
    const commonSubjects = ['MATH', 'FRAN', 'ANGL', 'HIST', 'GEO', 'EDCV', 'REL', 'EDPH'];
    const sectionSubjects: Record<string, { abbr: string; coeff: number }[]> = {
        TC: [...commonSubjects.map((a) => ({ abbr: a, coeff: a === 'MATH' || a === 'FRAN' ? 3 : 2 })), { abbr: 'PHYS', coeff: 2 }, { abbr: 'BIOL', coeff: 2 }],
        SCIENT: [...commonSubjects.map((a) => ({ abbr: a, coeff: a === 'MATH' ? 4 : a === 'FRAN' ? 3 : 1 })), { abbr: 'PHYS', coeff: 4 }, { abbr: 'CHIM', coeff: 3 }, { abbr: 'BIOL', coeff: 3 }, { abbr: 'INFO', coeff: 1 }],
        COMM: [...commonSubjects.map((a) => ({ abbr: a, coeff: a === 'FRAN' ? 3 : 1 })), { abbr: 'COMPTA', coeff: 4 }, { abbr: 'ECOPOL', coeff: 3 }, { abbr: 'INFO', coeff: 2 }],
        PEDAG: [...commonSubjects.map((a) => ({ abbr: a, coeff: a === 'FRAN' ? 3 : 1 })), { abbr: 'PSYCHO', coeff: 3 }, { abbr: 'PEDAG', coeff: 4 }, { abbr: 'BIOL', coeff: 2 }],
        LIT: [...commonSubjects.map((a) => ({ abbr: a, coeff: a === 'FRAN' ? 4 : a === 'HIST' || a === 'GEO' ? 3 : 1 })), { abbr: 'LAT', coeff: 3 }, { abbr: 'PHILO', coeff: 3 }, { abbr: 'KISW', coeff: 2 }, { abbr: 'DES', coeff: 1 }],
        HT: [...commonSubjects.map((a) => ({ abbr: a, coeff: a === 'MATH' ? 3 : a === 'FRAN' ? 2 : 1 })), { abbr: 'PHYS', coeff: 3 }, { abbr: 'CHIM', coeff: 2 }, { abbr: 'DES', coeff: 3 }, { abbr: 'INFO', coeff: 2 }],
    };

    for (const section of sections) {
        const subjectList = sectionSubjects[section.code];
        if (!subjectList) continue;
        for (const { abbr, coeff } of subjectList) {
            const subject = subjects.find((s) => s.abbreviation === abbr);
            if (!subject) continue;
            await prisma.subjectSection.upsert({
                where: { subjectId_sectionId: { subjectId: subject.id, sectionId: section.id } },
                update: { coefficient: coeff },
                create: { subjectId: subject.id, sectionId: section.id, coefficient: coeff },
            });
        }
    }

    // ── 8. Teachers ───────────────────────────────────────────────────────────
    console.log('👨‍🏫 Création des enseignants...');
    const teachersData = [
        { nom: 'PALUKU', postNom: 'KAMBASU', prenom: 'Emmanuel', phone: '+243990000005', diplome: 'Licence en Mathématiques', statut: 'MECHANISE' as const },
        { nom: 'MASIKA', postNom: 'SIVIHWA', prenom: 'Aline', phone: '+243990000006', diplome: 'Licence en Lettres Françaises', statut: 'MECHANISE' as const },
        { nom: 'KASEREKA', postNom: 'LUSENGE', prenom: 'Benjamin', phone: '+243990000007', diplome: 'Licence en Physique', statut: 'NON_PAYE' as const },
        { nom: 'KAHAMBU', postNom: 'NDUNGO', prenom: 'Jeanne', phone: '+243990000009', diplome: 'Graduat en Biologie', statut: 'NOUVELLE_UNITE' as const },
        { nom: 'MBUSA', postNom: 'KITSALI', prenom: 'Robert', phone: '+243990000010', diplome: 'Licence en Sciences Économiques', statut: 'VACATAIRE' as const },
    ];

    const teachers: any[] = [];
    for (const t of teachersData) {
        const teacher = await prisma.teacher.create({ data: { schoolId: school.id, ...t } });
        teachers.push(teacher);
    }

    // ── 9. Students ───────────────────────────────────────────────────────────
    console.log('🎒 Création des élèves...');
    const studentsData = [
        // 1ère A
        { nom: 'BAHATI', postNom: 'IRAGI', prenom: 'David', sexe: 'M' as const, dob: '2010-03-15', lieu: 'Goma', classIdx: 0 },
        { nom: 'FURAHA', postNom: 'KYALONDAWA', prenom: 'Sarah', sexe: 'F' as const, dob: '2010-07-22', lieu: 'Goma', classIdx: 0 },
        { nom: 'ISHARA', postNom: 'MUGABO', prenom: 'Josué', sexe: 'M' as const, dob: '2010-01-10', lieu: 'Sake', classIdx: 0 },
        { nom: 'KABUO', postNom: 'MWEZE', prenom: 'Amani', sexe: 'M' as const, dob: '2010-11-05', lieu: 'Goma', classIdx: 0 },
        { nom: 'KAVIRA', postNom: 'MAOMBI', prenom: 'Esther', sexe: 'F' as const, dob: '2010-05-30', lieu: 'Butembo', classIdx: 0 },
        { nom: 'MUGISHA', postNom: 'BARAKA', prenom: 'Samuel', sexe: 'M' as const, dob: '2010-09-12', lieu: 'Goma', classIdx: 0 },
        { nom: 'NEEMA', postNom: 'KAHINDO', prenom: 'Joy', sexe: 'F' as const, dob: '2010-02-28', lieu: 'Beni', classIdx: 0 },
        { nom: 'RIZIKI', postNom: 'HABIMANA', prenom: 'Noé', sexe: 'M' as const, dob: '2010-08-18', lieu: 'Goma', classIdx: 0 },
        { nom: 'SIFA', postNom: 'NYOTA', prenom: 'Grâce', sexe: 'F' as const, dob: '2010-12-01', lieu: 'Rutshuru', classIdx: 0 },
        { nom: 'TUMAINI', postNom: 'KAMBALE', prenom: 'Élie', sexe: 'M' as const, dob: '2010-04-20', lieu: 'Goma', classIdx: 0 },

        // 3ème SCIENT A
        { nom: 'AMANI', postNom: 'PALUKU', prenom: 'Christian', sexe: 'M' as const, dob: '2008-06-14', lieu: 'Goma', classIdx: 3 },
        { nom: 'BARAKA', postNom: 'KAMBALE', prenom: 'Gloire', sexe: 'M' as const, dob: '2008-03-08', lieu: 'Butembo', classIdx: 3 },
        { nom: 'FAIDA', postNom: 'MUHINDO', prenom: 'Rachel', sexe: 'F' as const, dob: '2008-10-25', lieu: 'Goma', classIdx: 3 },
        { nom: 'KAHINDO', postNom: 'KATUNGU', prenom: 'Espérance', sexe: 'F' as const, dob: '2008-01-17', lieu: 'Beni', classIdx: 3 },
        { nom: 'LUKA', postNom: 'MUSAVULI', prenom: 'Daniel', sexe: 'M' as const, dob: '2008-07-30', lieu: 'Goma', classIdx: 3 },
        { nom: 'MAPENDO', postNom: 'SIVIHWA', prenom: 'Josiane', sexe: 'F' as const, dob: '2008-04-12', lieu: 'Sake', classIdx: 3 },
        { nom: 'NDUNGO', postNom: 'KASEREKA', prenom: 'Moïse', sexe: 'M' as const, dob: '2008-09-03', lieu: 'Goma', classIdx: 3 },
        { nom: 'ZAWADI', postNom: 'MASIKA', prenom: 'Déborah', sexe: 'F' as const, dob: '2008-12-19', lieu: 'Lubero', classIdx: 3 },

        // 3ème COMM A
        { nom: 'BYAMUNGU', postNom: 'IRENGE', prenom: 'Patrick', sexe: 'M' as const, dob: '2008-02-14', lieu: 'Goma', classIdx: 4 },
        { nom: 'FIKIRI', postNom: 'BAHATI', prenom: 'Rebecca', sexe: 'F' as const, dob: '2008-08-07', lieu: 'Minova', classIdx: 4 },
        { nom: 'KABUO', postNom: 'NGABO', prenom: 'Jonathan', sexe: 'M' as const, dob: '2008-05-21', lieu: 'Goma', classIdx: 4 },
        { nom: 'MASIKA', postNom: 'FURAHA', prenom: 'Esther', sexe: 'F' as const, dob: '2008-11-13', lieu: 'Beni', classIdx: 4 },
        { nom: 'MUHINDO', postNom: 'KYABU', prenom: 'Abel', sexe: 'M' as const, dob: '2008-06-28', lieu: 'Goma', classIdx: 4 },

        // 4ème SCIENT A
        { nom: 'CIZA', postNom: 'KABUYA', prenom: 'Pacifique', sexe: 'M' as const, dob: '2007-03-22', lieu: 'Goma', classIdx: 5 },
        { nom: 'DUSABE', postNom: 'MUGABO', prenom: 'Victoire', sexe: 'F' as const, dob: '2007-07-14', lieu: 'Sake', classIdx: 5 },
        { nom: 'MUKIZA', postNom: 'PALUKU', prenom: 'Isaac', sexe: 'M' as const, dob: '2007-01-09', lieu: 'Goma', classIdx: 5 },

        // 4ème PEDAG A
        { nom: 'KAMBALE', postNom: 'KAGHENI', prenom: 'Rosette', sexe: 'F' as const, dob: '2007-09-18', lieu: 'Butembo', classIdx: 6 },
        { nom: 'IRAGI', postNom: 'BALUME', prenom: 'Moïse', sexe: 'M' as const, dob: '2007-05-02', lieu: 'Goma', classIdx: 6 },
        { nom: 'KAHAMBU', postNom: 'KATEMBO', prenom: 'Léa', sexe: 'F' as const, dob: '2007-11-25', lieu: 'Lubero', classIdx: 6 },
        { nom: 'MUHINDO', postNom: 'TSONGO', prenom: 'Jonas', sexe: 'M' as const, dob: '2007-04-17', lieu: 'Goma', classIdx: 6 },
    ];

    const createdStudents: any[] = [];
    let seq = 1;
    for (const s of studentsData) {
        const matricule = `NK-GOM-ITG001-${String(seq++).padStart(4, '0')}`;
        const student = await prisma.student.upsert({
            where: { schoolId_matricule: { schoolId: school.id, matricule } },
            update: {},
            create: {
                schoolId: school.id,
                matricule,
                nom: s.nom,
                postNom: s.postNom,
                prenom: s.prenom,
                sexe: s.sexe,
                dateNaissance: new Date(s.dob),
                lieuNaissance: s.lieu,
            },
        });

        // Create enrollment
        if (classes[s.classIdx]) {
            await prisma.enrollment.upsert({
                where: { studentId_academicYearId: { studentId: student.id, academicYearId: academicYear.id } },
                update: {},
                create: {
                    studentId: student.id,
                    classId: classes[s.classIdx].id,
                    academicYearId: academicYear.id,
                },
            });
        }

        createdStudents.push(student);
    }

    // ── 10. Fee Types ─────────────────────────────────────────────────────────
    console.log('💰 Création des types de frais...');
    const feeTypesData = [
        { name: 'Minerval', amount: 25000, isRequired: true },
        { name: 'Frais de Fonctionnement T1', amount: 15000, termNumber: 1 },
        { name: 'Frais de Fonctionnement T2', amount: 15000, termNumber: 2 },
        { name: 'Frais de Fonctionnement T3', amount: 15000, termNumber: 3 },
        { name: 'Frais d\'Examen', amount: 10000, termNumber: null },
        { name: 'Frais d\'Inscription', amount: 20000, isRequired: true },
        { name: 'Frais d\'Assurance', amount: 5000 },
        { name: 'Frais de Laboratoire', amount: 8000, termNumber: null },
    ];

    const feeTypes: any[] = [];
    for (const ft of feeTypesData) {
        const feeType = await prisma.feeType.create({
            data: {
                schoolId: school.id,
                name: ft.name,
                amount: ft.amount,
                termNumber: ft.termNumber ?? null,
                isRequired: ft.isRequired ?? true,
            },
        });
        feeTypes.push(feeType);
    }

    // ── 11. Sample Grades (1er Trimestre for 1ère A) ──────────────────────────
    console.log('📝 Création des notes d\'exemple...');
    const firstTermId = terms[0].id;
    const teacherUser = createdUsers.find((u) => u.role === 'ENSEIGNANT');
    const mathSubject = subjects.find((s) => s.abbreviation === 'MATH');
    const francaisSubject = subjects.find((s) => s.abbreviation === 'FRAN');

    if (teacherUser && mathSubject && francaisSubject) {
        const firstClassStudents = createdStudents.slice(0, 10);
        for (const student of firstClassStudents) {
            // Math grades
            await prisma.grade.upsert({
                where: { studentId_subjectId_termId_evalType: { studentId: student.id, subjectId: mathSubject.id, termId: firstTermId, evalType: 'INTERROGATION' } },
                update: {},
                create: {
                    studentId: student.id,
                    subjectId: mathSubject.id,
                    termId: firstTermId,
                    evalType: 'INTERROGATION',
                    score: Math.floor(Math.random() * 8) + 10, // 10-17
                    createdById: teacherUser.id,
                },
            });
            await prisma.grade.upsert({
                where: { studentId_subjectId_termId_evalType: { studentId: student.id, subjectId: mathSubject.id, termId: firstTermId, evalType: 'EXAMEN_TRIMESTRIEL' } },
                update: {},
                create: {
                    studentId: student.id,
                    subjectId: mathSubject.id,
                    termId: firstTermId,
                    evalType: 'EXAMEN_TRIMESTRIEL',
                    score: Math.floor(Math.random() * 10) + 8, // 8-17
                    createdById: teacherUser.id,
                },
            });

            // Français grades
            await prisma.grade.upsert({
                where: { studentId_subjectId_termId_evalType: { studentId: student.id, subjectId: francaisSubject.id, termId: firstTermId, evalType: 'INTERROGATION' } },
                update: {},
                create: {
                    studentId: student.id,
                    subjectId: francaisSubject.id,
                    termId: firstTermId,
                    evalType: 'INTERROGATION',
                    score: Math.floor(Math.random() * 7) + 11, // 11-17
                    createdById: teacherUser.id,
                },
            });
            await prisma.grade.upsert({
                where: { studentId_subjectId_termId_evalType: { studentId: student.id, subjectId: francaisSubject.id, termId: firstTermId, evalType: 'EXAMEN_TRIMESTRIEL' } },
                update: {},
                create: {
                    studentId: student.id,
                    subjectId: francaisSubject.id,
                    termId: firstTermId,
                    evalType: 'EXAMEN_TRIMESTRIEL',
                    score: Math.floor(Math.random() * 8) + 10, // 10-17
                    createdById: teacherUser.id,
                },
            });
        }
    }

    // ── 12. Sample Payments ───────────────────────────────────────────────────
    console.log('🧾 Création des paiements d\'exemple...');
    const economeUser = createdUsers.find((u) => u.role === 'ECONOME');
    if (economeUser) {
        const paymentModes = ['ESPECES', 'AIRTEL_MONEY', 'MPESA', 'ORANGE_MONEY'] as const;
        let paySeq = 1;
        for (let i = 0; i < 8; i++) {
            const student = createdStudents[i % createdStudents.length];
            const feeType = feeTypes[i % feeTypes.length];
            const receiptNumber = `ITG001-2024-${String(paySeq++).padStart(5, '0')}`;
            await prisma.payment.upsert({
                where: { schoolId_receiptNumber: { schoolId: school.id, receiptNumber } },
                update: {},
                create: {
                    receiptNumber,
                    studentId: student.id,
                    feeTypeId: feeType.id,
                    schoolId: school.id,
                    academicYearId: academicYear.id,
                    amountDue: feeType.amount,
                    amountPaid: feeType.amount,
                    currency: 'FC',
                    paymentMode: paymentModes[i % paymentModes.length],
                    paidAt: new Date(2024, 8 + Math.floor(i / 3), 5 + i * 3),
                    createdById: economeUser.id,
                },
            });
        }
    }

    // ── 13. Settings ──────────────────────────────────────────────────────────
    console.log('⚙️ Configuration des paramètres par défaut...');
    const defaultSettings: Record<string, any> = {
        'exchange_rate': 2500,
        'sms_language': 'fr',
        'bulletin_template': 'standard',
        'max_students_per_class': 45,
        'school_motto': 'Scientia et Virtus — La Science et la Vertu',
        'grading_scale': { max: 20, passing: 10 },
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
        await prisma.setting.upsert({
            where: { schoolId_key: { schoolId: school.id, key } },
            update: { value: JSON.stringify(value) },
            create: { schoolId: school.id, key, value: JSON.stringify(value) },
        });
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n✅ Peuplement terminé avec succès !');
    console.log('═══════════════════════════════════════════');
    console.log(`🏫 École: ${school.name}`);
    console.log(`👥 Utilisateurs: ${createdUsers.length}`);
    console.log(`📅 Année académique: ${academicYear.label}`);
    console.log(`📚 Sections: ${sections.length}`);
    console.log(`🏠 Classes: ${classes.length}`);
    console.log(`📖 Matières: ${subjects.length}`);
    console.log(`👨‍🏫 Enseignants: ${teachers.length}`);
    console.log(`🎒 Élèves: ${createdStudents.length}`);
    console.log(`💰 Types de frais: ${feeTypes.length}`);
    console.log('═══════════════════════════════════════════\n');

    console.log('🔐 Comptes de test:');
    for (const u of users) {
        const loginId = (u as any).email ? `${(u as any).email} / ${u.phone}` : u.phone;
        console.log(`   ${u.role.padEnd(15)} — ${loginId} / ${u.password}`);
    }
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du peuplement:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
