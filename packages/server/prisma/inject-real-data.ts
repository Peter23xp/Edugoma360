import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);
const ACADEMIC_YEAR = '2025-2026';

type SeedStudent = {
  matricule: string;
  nom: string;
  postNom: string;
  prenom: string;
  sexe: string;
  birth: string;
  className: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
};

const sections = [
  { code: 'PRIM', name: 'Primaire', year: 1 },
  { code: 'SEC-GEN', name: 'Secondaire General', year: 1 },
  { code: 'SCI', name: 'Scientifique', year: 3 },
  { code: 'PED', name: 'Pedagogie', year: 3 },
];

const classes = [
  { name: '1ere Primaire A', sectionCode: 'PRIM', roomName: 'P1-A' },
  { name: '2eme Primaire A', sectionCode: 'PRIM', roomName: 'P2-A' },
  { name: '7eme EB A', sectionCode: 'SEC-GEN', roomName: 'B7-A' },
  { name: '8eme EB A', sectionCode: 'SEC-GEN', roomName: 'B8-A' },
  { name: '4eme Bio-Chimie', sectionCode: 'SCI', roomName: 'LAB-1' },
  { name: '5eme Pedagogie', sectionCode: 'PED', roomName: 'PED-5' },
];

const subjects = [
  { abbreviation: 'FR', name: 'Francais', displayOrder: 1 },
  { abbreviation: 'MATH', name: 'Mathematiques', displayOrder: 2 },
  { abbreviation: 'HIST', name: 'Histoire', displayOrder: 3 },
  { abbreviation: 'GEO', name: 'Geographie', displayOrder: 4 },
  { abbreviation: 'BIO', name: 'Biologie', displayOrder: 5 },
  { abbreviation: 'CHIM', name: 'Chimie', displayOrder: 6 },
  { abbreviation: 'PHY', name: 'Physique', displayOrder: 7 },
  { abbreviation: 'PEDA', name: 'Pedagogie generale', displayOrder: 8 },
];

const teachers = [
  { matricule: 'ENS-2026-001', nom: 'MULUME', postNom: 'KASEREKA', prenom: 'David', sexe: 'M', phone: '+243991100001', email: 'david.mulume@edugoma360.cd', subject: 'MATH' },
  { matricule: 'ENS-2026-002', nom: 'KAVIRA', postNom: 'MUMBERE', prenom: 'Aline', sexe: 'F', phone: '+243991100002', email: 'aline.kavira@edugoma360.cd', subject: 'FR' },
  { matricule: 'ENS-2026-003', nom: 'BAHATI', postNom: 'MUGISHA', prenom: 'Patrick', sexe: 'M', phone: '+243991100003', email: 'patrick.bahati@edugoma360.cd', subject: 'BIO' },
  { matricule: 'ENS-2026-004', nom: 'MAPENDO', postNom: 'SAFARI', prenom: 'Grace', sexe: 'F', phone: '+243991100004', email: 'grace.mapendo@edugoma360.cd', subject: 'PEDA' },
];

const students: SeedStudent[] = [
  { matricule: 'NK-GOM-UZI-0001', nom: 'KAMBALE', postNom: 'MUMBERE', prenom: 'Joel', sexe: 'M', birth: '2015-04-12', className: '1ere Primaire A', parentName: 'MUMBERE KATSUVA', parentPhone: '+243992200001', parentEmail: 'parent001@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0002', nom: 'KAVIRA', postNom: 'KAHINDO', prenom: 'Esther', sexe: 'F', birth: '2015-08-21', className: '1ere Primaire A', parentName: 'KAHINDO MUSA', parentPhone: '+243992200002', parentEmail: 'parent002@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0003', nom: 'MUTOMBO', postNom: 'LUKUSA', prenom: 'Daniel', sexe: 'M', birth: '2014-03-03', className: '2eme Primaire A', parentName: 'LUKUSA PASCAL', parentPhone: '+243992200003', parentEmail: 'parent003@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0004', nom: 'MASIKA', postNom: 'BIRUNGI', prenom: 'Sarah', sexe: 'F', birth: '2014-10-18', className: '2eme Primaire A', parentName: 'BIRUNGI JEAN', parentPhone: '+243992200004', parentEmail: 'parent004@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0005', nom: 'NZUZI', postNom: 'KALONJI', prenom: 'Junior', sexe: 'M', birth: '2012-01-09', className: '7eme EB A', parentName: 'KALONJI REMY', parentPhone: '+243992200005', parentEmail: 'parent005@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0006', nom: 'KABUYA', postNom: 'ILUNGA', prenom: 'Naomi', sexe: 'F', birth: '2012-06-27', className: '7eme EB A', parentName: 'ILUNGA ROSE', parentPhone: '+243992200006', parentEmail: 'parent006@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0007', nom: 'AMISI', postNom: 'KALOMBO', prenom: 'Jean', sexe: 'M', birth: '2011-11-05', className: '8eme EB A', parentName: 'KALOMBO THEO', parentPhone: '+243992200007', parentEmail: 'parent007@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0008', nom: 'KASONGO', postNom: 'MBUYI', prenom: 'Rachel', sexe: 'F', birth: '2011-02-14', className: '8eme EB A', parentName: 'MBUYI ALPHONSE', parentPhone: '+243992200008', parentEmail: 'parent008@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0009', nom: 'LUENDO', postNom: 'MAVUNGU', prenom: 'Cedric', sexe: 'M', birth: '2008-09-30', className: '4eme Bio-Chimie', parentName: 'MAVUNGU SIMON', parentPhone: '+243992200009', parentEmail: 'parent009@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0010', nom: 'NABINTU', postNom: 'MUKENDI', prenom: 'Clarisse', sexe: 'F', birth: '2008-12-01', className: '4eme Bio-Chimie', parentName: 'MUKENDI HELENE', parentPhone: '+243992200010', parentEmail: 'parent010@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0011', nom: 'BYAMUNGU', postNom: 'KABASELE', prenom: 'Prince', sexe: 'M', birth: '2007-05-23', className: '5eme Pedagogie', parentName: 'KABASELE BENOIT', parentPhone: '+243992200011', parentEmail: 'parent011@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0012', nom: 'UFITAMAHORO', postNom: 'KAMANA', prenom: 'Diane', sexe: 'F', birth: '2007-07-19', className: '5eme Pedagogie', parentName: 'KAMANA FLORENCE', parentPhone: '+243992200012', parentEmail: 'parent012@edugoma360.cd' },

  // --- 1ere Primaire A (6 de plus) ---
  { matricule: 'NK-GOM-UZI-0013', nom: 'MUHINDO', postNom: 'PALUKU', prenom: 'Samuel', sexe: 'M', birth: '2015-01-15', className: '1ere Primaire A', parentName: 'PALUKU KATEMBO', parentPhone: '+243992200013', parentEmail: 'parent013@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0014', nom: 'KAHINDO', postNom: 'KITSUKU', prenom: 'Merveille', sexe: 'F', birth: '2015-06-02', className: '1ere Primaire A', parentName: 'KITSUKU ANTOINE', parentPhone: '+243992200014', parentEmail: 'parent014@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0015', nom: 'KASEREKA', postNom: 'VIHAMBA', prenom: 'Josue', sexe: 'M', birth: '2015-03-22', className: '1ere Primaire A', parentName: 'VIHAMBA PALUKU', parentPhone: '+243992200015', parentEmail: 'parent015@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0016', nom: 'MBAMBU', postNom: 'TSONGO', prenom: 'Amani', sexe: 'M', birth: '2015-09-10', className: '1ere Primaire A', parentName: 'TSONGO MATHE', parentPhone: '+243992200016', parentEmail: 'parent016@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0017', nom: 'FURAHA', postNom: 'BAHATI', prenom: 'Neema', sexe: 'F', birth: '2015-11-28', className: '1ere Primaire A', parentName: 'BAHATI SIFA', parentPhone: '+243992200017', parentEmail: 'parent017@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0018', nom: 'KATEMBO', postNom: 'SIVIRI', prenom: 'Emmanuel', sexe: 'M', birth: '2015-02-07', className: '1ere Primaire A', parentName: 'SIVIRI JEAN-PAUL', parentPhone: '+243992200018', parentEmail: 'parent018@edugoma360.cd' },

  // --- 2eme Primaire A (6 de plus) ---
  { matricule: 'NK-GOM-UZI-0019', nom: 'PALUKU', postNom: 'KYAHI', prenom: 'Tresor', sexe: 'M', birth: '2014-05-17', className: '2eme Primaire A', parentName: 'KYAHI MUMBERE', parentPhone: '+243992200019', parentEmail: 'parent019@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0020', nom: 'SIFA', postNom: 'MUGOLI', prenom: 'Bernadette', sexe: 'F', birth: '2014-07-25', className: '2eme Primaire A', parentName: 'MUGOLI SAFARI', parentPhone: '+243992200020', parentEmail: 'parent020@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0021', nom: 'TSONGO', postNom: 'KAMATE', prenom: 'David', sexe: 'M', birth: '2014-01-30', className: '2eme Primaire A', parentName: 'KAMATE FELIX', parentPhone: '+243992200021', parentEmail: 'parent021@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0022', nom: 'MAHESHE', postNom: 'CHIRHALWIRA', prenom: 'Gloire', sexe: 'M', birth: '2014-08-14', className: '2eme Primaire A', parentName: 'CHIRHALWIRA BONANE', parentPhone: '+243992200022', parentEmail: 'parent022@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0023', nom: 'WIVINE', postNom: 'BUHENDWA', prenom: 'Esperance', sexe: 'F', birth: '2014-12-06', className: '2eme Primaire A', parentName: 'BUHENDWA MARC', parentPhone: '+243992200023', parentEmail: 'parent023@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0024', nom: 'MUMBERE', postNom: 'KAKULE', prenom: 'Jonathan', sexe: 'M', birth: '2014-04-19', className: '2eme Primaire A', parentName: 'KAKULE MUSUBAO', parentPhone: '+243992200024', parentEmail: 'parent024@edugoma360.cd' },

  // --- 7eme EB A (6 de plus) ---
  { matricule: 'NK-GOM-UZI-0025', nom: 'RIZIKI', postNom: 'NTAMBUKA', prenom: 'Aisha', sexe: 'F', birth: '2012-02-08', className: '7eme EB A', parentName: 'NTAMBUKA SADIKI', parentPhone: '+243992200025', parentEmail: 'parent025@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0026', nom: 'SAFARI', postNom: 'BISIMWA', prenom: 'Patient', sexe: 'M', birth: '2012-04-15', className: '7eme EB A', parentName: 'BISIMWA INNOCENT', parentPhone: '+243992200026', parentEmail: 'parent026@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0027', nom: 'MUGISHA', postNom: 'HABIMANA', prenom: 'Kevin', sexe: 'M', birth: '2012-10-03', className: '7eme EB A', parentName: 'HABIMANA PROSPER', parentPhone: '+243992200027', parentEmail: 'parent027@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0028', nom: 'REHEMA', postNom: 'NYAMWISI', prenom: 'Fatuma', sexe: 'F', birth: '2012-08-20', className: '7eme EB A', parentName: 'NYAMWISI ABUBAKAR', parentPhone: '+243992200028', parentEmail: 'parent028@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0029', nom: 'BONANE', postNom: 'NGABO', prenom: 'Christian', sexe: 'M', birth: '2012-11-12', className: '7eme EB A', parentName: 'NGABO SHUKURU', parentPhone: '+243992200029', parentEmail: 'parent029@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0030', nom: 'NEEMA', postNom: 'ZAWADI', prenom: 'Gloria', sexe: 'F', birth: '2012-05-31', className: '7eme EB A', parentName: 'ZAWADI PETRO', parentPhone: '+243992200030', parentEmail: 'parent030@edugoma360.cd' },

  // --- 8eme EB A (6 de plus) ---
  { matricule: 'NK-GOM-UZI-0031', nom: 'BARAKA', postNom: 'ZIHALIRWA', prenom: 'Fiston', sexe: 'M', birth: '2011-03-26', className: '8eme EB A', parentName: 'ZIHALIRWA CLAUDE', parentPhone: '+243992200031', parentEmail: 'parent031@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0032', nom: 'MAPENDO', postNom: 'BASHIGE', prenom: 'Josiane', sexe: 'F', birth: '2011-06-08', className: '8eme EB A', parentName: 'BASHIGE DAVID', parentPhone: '+243992200032', parentEmail: 'parent032@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0033', nom: 'SHUKURU', postNom: 'KALINDA', prenom: 'Eric', sexe: 'M', birth: '2011-09-14', className: '8eme EB A', parentName: 'KALINDA MURHULA', parentPhone: '+243992200033', parentEmail: 'parent033@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0034', nom: 'CHANCE', postNom: 'MIRINDI', prenom: 'Deborah', sexe: 'F', birth: '2011-01-22', className: '8eme EB A', parentName: 'MIRINDI GUSTAVE', parentPhone: '+243992200034', parentEmail: 'parent034@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0035', nom: 'KWETE', postNom: 'BULAMBO', prenom: 'Aristote', sexe: 'M', birth: '2011-07-04', className: '8eme EB A', parentName: 'BULAMBO XAVIER', parentPhone: '+243992200035', parentEmail: 'parent035@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0036', nom: 'ANUARITE', postNom: 'HANGI', prenom: 'Pascaline', sexe: 'F', birth: '2011-12-17', className: '8eme EB A', parentName: 'HANGI LEONARD', parentPhone: '+243992200036', parentEmail: 'parent036@edugoma360.cd' },

  // --- 4eme Bio-Chimie (6 de plus) ---
  { matricule: 'NK-GOM-UZI-0037', nom: 'CIZUNGU', postNom: 'MUGARUKA', prenom: 'Papy', sexe: 'M', birth: '2008-03-11', className: '4eme Bio-Chimie', parentName: 'MUGARUKA PROSPER', parentPhone: '+243992200037', parentEmail: 'parent037@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0038', nom: 'TUMAINI', postNom: 'RUTSHURU', prenom: 'Espe', sexe: 'F', birth: '2008-07-22', className: '4eme Bio-Chimie', parentName: 'RUTSHURU SADIKI', parentPhone: '+243992200038', parentEmail: 'parent038@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0039', nom: 'NTABUGI', postNom: 'KANYAMUHANDA', prenom: 'Fils', sexe: 'M', birth: '2008-05-05', className: '4eme Bio-Chimie', parentName: 'KANYAMUHANDA JOSEPH', parentPhone: '+243992200039', parentEmail: 'parent039@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0040', nom: 'ASIFIWE', postNom: 'KANIKI', prenom: 'Ruth', sexe: 'F', birth: '2008-10-29', className: '4eme Bio-Chimie', parentName: 'KANIKI SALUMU', parentPhone: '+243992200040', parentEmail: 'parent040@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0041', nom: 'MWANGAZA', postNom: 'BWENGE', prenom: 'Aimable', sexe: 'M', birth: '2008-01-18', className: '4eme Bio-Chimie', parentName: 'BWENGE AUGUSTIN', parentPhone: '+243992200041', parentEmail: 'parent041@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0042', nom: 'JEMIMA', postNom: 'MURHULA', prenom: 'Grace', sexe: 'F', birth: '2008-08-07', className: '4eme Bio-Chimie', parentName: 'MURHULA EMMANUEL', parentPhone: '+243992200042', parentEmail: 'parent042@edugoma360.cd' },

  // --- 5eme Pedagogie (6 de plus) ---
  { matricule: 'NK-GOM-UZI-0043', nom: 'MAOMBI', postNom: 'KANINGU', prenom: 'Isaac', sexe: 'M', birth: '2007-02-16', className: '5eme Pedagogie', parentName: 'KANINGU ETIENNE', parentPhone: '+243992200043', parentEmail: 'parent043@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0044', nom: 'MAPIGANO', postNom: 'LUBALA', prenom: 'Deborah', sexe: 'F', birth: '2007-04-09', className: '5eme Pedagogie', parentName: 'LUBALA MOSES', parentPhone: '+243992200044', parentEmail: 'parent044@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0045', nom: 'HABARI', postNom: 'BANDU', prenom: 'Jonathan', sexe: 'M', birth: '2007-08-25', className: '5eme Pedagogie', parentName: 'BANDU PHILIPPE', parentPhone: '+243992200045', parentEmail: 'parent045@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0046', nom: 'UPENDO', postNom: 'KIBANGU', prenom: 'Esther', sexe: 'F', birth: '2007-11-01', className: '5eme Pedagogie', parentName: 'KIBANGU ROBERT', parentPhone: '+243992200046', parentEmail: 'parent046@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0047', nom: 'MALAIKA', postNom: 'TEMBO', prenom: 'Rodrigue', sexe: 'M', birth: '2007-06-14', className: '5eme Pedagogie', parentName: 'TEMBO JOSEPH', parentPhone: '+243992200047', parentEmail: 'parent047@edugoma360.cd' },
  { matricule: 'NK-GOM-UZI-0048', nom: 'ZAWADI', postNom: 'MUKIZA', prenom: 'Amina', sexe: 'F', birth: '2007-09-30', className: '5eme Pedagogie', parentName: 'MUKIZA ABRAHAM', parentPhone: '+243992200048', parentEmail: 'parent048@edugoma360.cd' },
];

function date(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

async function main() {
  console.log('Injection des donnees realistes EduGoma360...\n');

  const passwordHash = await bcrypt.hash('Password@2026', BCRYPT_ROUNDS);

  const school = await prisma.school.findFirst({ orderBy: { createdAt: 'asc' } })
    ?? await prisma.school.create({
      data: {
        name: 'Complexe Scolaire Uzima',
        type: 'PRIVE',
        province: 'Nord-Kivu',
        ville: 'Goma',
        commune: 'Karisimbi',
        adresse: 'Avenue du Lac, Quartier Katindo',
        telephone: '+243970000000',
        email: 'contact@csuzima.cd',
        code: 'CSU-GOM',
      },
    });

  await prisma.school.update({
    where: { id: school.id },
    data: {
      name: school.name || 'Complexe Scolaire Uzima',
      type: school.type || 'PRIVE',
      province: school.province || 'Nord-Kivu',
      ville: school.ville || 'Goma',
      commune: school.commune ?? 'Karisimbi',
      adresse: school.adresse ?? 'Avenue du Lac, Quartier Katindo',
      telephone: school.telephone ?? '+243970000000',
      email: school.email ?? 'contact@csuzima.cd',
      devise: school.devise ?? 'Former, servir, reussir',
      langueEnseignement: school.langueEnseignement ?? 'FRANCAIS',
      systemeEvaluation: school.systemeEvaluation ?? 'NOTE_20',
      nombrePeriodes: school.nombrePeriodes ?? 'TRIMESTRES',
    },
  });

  const admin = await prisma.user.findFirst({
    where: { schoolId: school.id, role: 'SUPER_ADMIN' },
    orderBy: { createdAt: 'asc' },
  }) ?? await prisma.user.create({
    data: {
      schoolId: school.id,
      nom: 'Super',
      postNom: 'Admin',
      prenom: 'EduGoma360',
      phone: '+243990000001',
      email: 'admin@edugoma360.cd',
      role: 'SUPER_ADMIN',
      passwordHash,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const academicYear = await prisma.academicYear.upsert({
    where: { schoolId_label: { schoolId: school.id, label: ACADEMIC_YEAR } },
    update: { isActive: true, isClosed: false, type: 'TRIMESTRES' },
    create: {
      schoolId: school.id,
      label: ACADEMIC_YEAR,
      name: ACADEMIC_YEAR,
      startDate: date('2025-09-01'),
      endDate: date('2026-07-15'),
      type: 'TRIMESTRES',
      isActive: true,
    },
  });

  const termRecords = [];
  for (const term of [
    { number: 1, label: 'Premier trimestre', start: '2025-09-01', end: '2025-12-20', active: false },
    { number: 2, label: 'Deuxieme trimestre', start: '2026-01-05', end: '2026-03-28', active: true },
    { number: 3, label: 'Troisieme trimestre', start: '2026-04-13', end: '2026-07-15', active: false },
  ]) {
    termRecords.push(await prisma.term.upsert({
      where: { academicYearId_number: { academicYearId: academicYear.id, number: term.number } },
      update: { label: term.label, startDate: date(term.start), endDate: date(term.end), isActive: term.active },
      create: {
        academicYearId: academicYear.id,
        number: term.number,
        label: term.label,
        startDate: date(term.start),
        endDate: date(term.end),
        examStartDate: addDays(date(term.end), -7),
        examEndDate: date(term.end),
        isActive: term.active,
      },
    }));
  }

  const sectionByCode = new Map<string, { id: string }>();
  for (const section of sections) {
    const record = await prisma.section.upsert({
      where: { schoolId_code_year: { schoolId: school.id, code: section.code, year: section.year } },
      update: { name: section.name },
      create: { schoolId: school.id, ...section },
    });
    sectionByCode.set(section.code, record);
  }

  const subjectByAbbr = new Map<string, { id: string }>();
  for (const subject of subjects) {
    const record = await prisma.subject.upsert({
      where: { schoolId_abbreviation: { schoolId: school.id, abbreviation: subject.abbreviation } },
      update: { name: subject.name, displayOrder: subject.displayOrder },
      create: { schoolId: school.id, maxScore: 20, ...subject },
    });
    subjectByAbbr.set(subject.abbreviation, record);
  }

  for (const section of sectionByCode.values()) {
    for (const subject of subjectByAbbr.values()) {
      await prisma.subjectSection.upsert({
        where: { subjectId_sectionId: { subjectId: subject.id, sectionId: section.id } },
        update: {},
        create: { subjectId: subject.id, sectionId: section.id, coefficient: 1 },
      });
    }
  }

  const classByName = new Map<string, { id: string }>();
  for (const schoolClass of classes) {
    const section = sectionByCode.get(schoolClass.sectionCode);
    if (!section) throw new Error(`Section introuvable: ${schoolClass.sectionCode}`);

    const record = await prisma.class.upsert({
      where: { schoolId_name: { schoolId: school.id, name: schoolClass.name } },
      update: { sectionId: section.id, isActive: true },
      create: {
        schoolId: school.id,
        sectionId: section.id,
        name: schoolClass.name,
        maxStudents: 45,
        isActive: true,
      },
    });
    classByName.set(schoolClass.name, record);
  }

  const teacherRecords = [];
  for (const teacher of teachers) {
    const user = await prisma.user.upsert({
      where: { schoolId_phone: { schoolId: school.id, phone: teacher.phone } },
      update: { nom: teacher.nom, postNom: teacher.postNom, prenom: teacher.prenom, email: teacher.email, role: 'ENSEIGNANT', isActive: true },
      create: {
        schoolId: school.id,
        nom: teacher.nom,
        postNom: teacher.postNom,
        prenom: teacher.prenom,
        phone: teacher.phone,
        email: teacher.email,
        role: 'ENSEIGNANT',
        passwordHash,
        isActive: true,
        mustChangePassword: true,
      },
    });

    const record = await prisma.teacher.upsert({
      where: { matricule: teacher.matricule },
      update: {
        nom: teacher.nom,
        postNom: teacher.postNom,
        prenom: teacher.prenom,
        telephone: teacher.phone,
        email: teacher.email,
        statut: 'ACTIF',
        isActive: true,
        userId: user.id,
      },
      create: {
        schoolId: school.id,
        matricule: teacher.matricule,
        nom: teacher.nom,
        postNom: teacher.postNom,
        prenom: teacher.prenom,
        sexe: teacher.sexe,
        telephone: teacher.phone,
        email: teacher.email,
        adresse: 'Goma',
        niveauEtudes: 'Licence',
        domaineFormation: teacher.subject,
        dateEmbauche: date('2022-09-01'),
        typeContrat: 'CDI',
        fonction: 'Enseignant',
        userId: user.id,
      },
    });
    teacherRecords.push({ ...record, subject: teacher.subject });
  }

  const scienceTeacher = teacherRecords.find((teacher) => teacher.subject === 'BIO');
  for (const schoolClass of classes) {
    const classRecord = classByName.get(schoolClass.name);
    if (!classRecord) continue;

    const isLaboratory = schoolClass.roomName.startsWith('LAB');
    await prisma.room.upsert({
      where: { schoolId_name: { schoolId: school.id, name: schoolClass.roomName } },
      update: {
        type: isLaboratory ? 'LABORATORY' : 'CLASSROOM',
        capacity: 45,
        assignedClassId: classRecord.id,
        responsableId: isLaboratory ? scienceTeacher?.id : null,
      },
      create: {
        schoolId: school.id,
        name: schoolClass.roomName,
        type: isLaboratory ? 'LABORATORY' : 'CLASSROOM',
        capacity: 45,
        status: 'GOOD',
        building: isLaboratory ? 'Bloc Sciences' : 'Bloc Pedagogique',
        assignedClassId: classRecord.id,
        responsableId: isLaboratory ? scienceTeacher?.id : null,
        equipments: JSON.stringify(isLaboratory ? ['Tableau noir/blanc', 'Prises electriques'] : ['Tableau noir/blanc']),
      },
    });
  }

  let classIndex = 0;
  for (const teacher of teacherRecords) {
    const subject = subjectByAbbr.get(teacher.subject);
    const schoolClass = Array.from(classByName.values())[classIndex % classByName.size];
    classIndex += 1;
    if (!subject || !schoolClass) continue;

    await prisma.teacherClassSubject.upsert({
      where: {
        teacherId_classId_subjectId_academicYearId: {
          teacherId: teacher.id,
          classId: schoolClass.id,
          subjectId: subject.id,
          academicYearId: academicYear.id,
        },
      },
      update: { volumeHoraire: 6 },
      create: {
        teacherId: teacher.id,
        classId: schoolClass.id,
        subjectId: subject.id,
        academicYearId: academicYear.id,
        volumeHoraire: 6,
      },
    });
  }

  const studentRecords = [];
  for (const student of students) {
    const schoolClass = classByName.get(student.className);
    if (!schoolClass) throw new Error(`Classe introuvable: ${student.className}`);

    const parentUser = await prisma.user.upsert({
      where: { schoolId_phone: { schoolId: school.id, phone: student.parentPhone } },
      update: { email: student.parentEmail, role: 'PARENT', isActive: true },
      create: {
        schoolId: school.id,
        nom: student.parentName.split(' ')[0] ?? 'Parent',
        postNom: student.parentName.split(' ')[1] ?? 'Eleve',
        prenom: student.parentName.split(' ')[2] ?? null,
        phone: student.parentPhone,
        email: student.parentEmail,
        role: 'PARENT',
        passwordHash,
        isActive: true,
      },
    });

    const record = await prisma.student.upsert({
      where: { schoolId_matricule: { schoolId: school.id, matricule: student.matricule } },
      update: {
        nom: student.nom,
        postNom: student.postNom,
        prenom: student.prenom,
        sexe: student.sexe,
        parentUserId: parentUser.id,
        statut: 'ACTIF',
        isActive: true,
      },
      create: {
        schoolId: school.id,
        matricule: student.matricule,
        nom: student.nom,
        postNom: student.postNom,
        prenom: student.prenom,
        sexe: student.sexe,
        dateNaissance: date(student.birth),
        lieuNaissance: 'Goma',
        nationalite: 'Congolaise',
        nomTuteur: student.parentName,
        telTuteur: student.parentPhone,
        parentUserId: parentUser.id,
        statut: 'ACTIF',
        isActive: true,
      },
    });

    await prisma.enrollment.upsert({
      where: { studentId_academicYearId: { studentId: record.id, academicYearId: academicYear.id } },
      update: { classId: schoolClass.id },
      create: {
        studentId: record.id,
        classId: schoolClass.id,
        academicYearId: academicYear.id,
        ecoleOrigine: 'Ecole locale de Goma',
      },
    });

    studentRecords.push({ ...record, classId: schoolClass.id });
  }

  const feeTypes = [];
  for (const fee of [
    { type: 'INSCRIPTION', name: 'Frais inscription', amount: 50000, frequency: 'ANNUAL' },
    { type: 'SCOLARITE', name: 'Minerval mensuel', amount: 85000, frequency: 'MONTHLY' },
    { type: 'EXAMEN', name: 'Frais examens', amount: 30000, frequency: 'TERM' },
  ]) {
    const existing = await prisma.feeType.findFirst({
      where: { schoolId: school.id, academicYearId: academicYear.id, name: fee.name, deletedAt: null },
    });
    feeTypes.push(existing ?? await prisma.feeType.create({
      data: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        ...fee,
        scope: 'SCHOOL',
        isRequired: true,
        isActive: true,
      },
    }));
  }

  let receiptCounter = 1;
  for (const student of studentRecords.slice(0, 9)) {
    const totalDue = 165000;
    const amountPaid = receiptCounter % 3 === 0 ? 80000 : 165000;
    const receiptNumber = `REC-TEST-${ACADEMIC_YEAR}-${String(receiptCounter).padStart(4, '0')}`;
    receiptCounter += 1;

    const payment = await prisma.payment.upsert({
      where: { receiptNumber },
      update: {
        totalDue,
        amountPaid,
        remainingBalance: totalDue - amountPaid,
        paymentMethod: receiptCounter % 2 === 0 ? 'CASH' : 'MOBILE_MONEY',
        cashierId: admin.id,
      },
      create: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        receiptNumber,
        studentId: student.id,
        totalDue,
        amountPaid,
        remainingBalance: totalDue - amountPaid,
        currency: 'FC',
        paymentMethod: receiptCounter % 2 === 0 ? 'CASH' : 'MOBILE_MONEY',
        paymentDate: addDays(date('2026-02-01'), receiptCounter),
        cashierId: admin.id,
        observations: 'Paiement de test injecte automatiquement',
      },
    });

    for (const fee of feeTypes.slice(0, 2)) {
      await prisma.feePayment.upsert({
        where: { paymentId_feeId: { paymentId: payment.id, feeId: fee.id } },
        update: {},
        create: {
          paymentId: payment.id,
          feeId: fee.id,
          amountDue: Math.floor(totalDue / 2),
          amountPaid: Math.floor(amountPaid / 2),
        },
      });
    }
  }

  const activeTerm = termRecords.find((term) => term.isActive) ?? termRecords[1];
  const gradeSubjects = ['FR', 'MATH', 'BIO', 'HIST'].map((abbr) => subjectByAbbr.get(abbr)).filter(Boolean) as { id: string }[];

  let gradeSeed = 0;
  for (const student of studentRecords) {
    for (const subject of gradeSubjects) {
      const score = 9 + ((gradeSeed * 3) % 11);
      gradeSeed += 1;
      await prisma.grade.upsert({
        where: {
          studentId_subjectId_termId_evalType: {
            studentId: student.id,
            subjectId: subject.id,
            termId: activeTerm.id,
            evalType: 'PERIODE',
          },
        },
        update: { score, createdById: admin.id },
        create: {
          studentId: student.id,
          subjectId: subject.id,
          termId: activeTerm.id,
          evalType: 'PERIODE',
          score,
          maxScore: 20,
          observation: score >= 10 ? 'Satisfaisant' : 'A renforcer',
          createdById: admin.id,
        },
      });
    }
  }

  for (let day = 0; day < 5; day += 1) {
    const attendanceDate = addDays(date('2026-02-16'), day);
    for (const [index, student] of studentRecords.entries()) {
      await prisma.attendance.upsert({
        where: { studentId_date_period: { studentId: student.id, date: attendanceDate, period: 'MATIN' } },
        update: {},
        create: {
          studentId: student.id,
          classId: student.classId,
          termId: activeTerm.id,
          date: attendanceDate,
          period: 'MATIN',
          status: index % 7 === 0 ? 'ABSENT' : index % 5 === 0 ? 'RETARD' : 'PRESENT',
          recordedById: admin.id,
        },
      });
    }
  }

  await prisma.setting.upsert({
    where: { schoolId_key: { schoolId: school.id, key: 'exchange_rate' } },
    update: { value: JSON.stringify(2800) },
    create: { schoolId: school.id, key: 'exchange_rate', value: JSON.stringify(2800) },
  });

  console.log('Donnees injectees avec succes.');
  console.log(`Ecole: ${school.name}`);
  console.log(`Annee: ${ACADEMIC_YEAR}`);
  console.log(`Classes: ${classes.length}`);
  console.log(`Eleves: ${students.length}`);
  console.log(`Enseignants: ${teachers.length}`);
  console.log(`Mot de passe comptes test enseignants/parents: Password@2026`);
}

main()
  .catch((error) => {
    console.error('Erreur injection donnees realistes:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
