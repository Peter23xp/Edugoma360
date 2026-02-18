# 🚀 PROMPT D'INITIALISATION — EDUGOMA 360
> Copie-colle ce prompt dans **Cursor AI / Claude Code / Windsurf / Bolt / v0**
> pour générer la structure complète du projet en une seule session.

---

## CONTEXTE DU PROJET

Tu vas initialiser le projet **EduGoma 360** — un système web fullstack de gestion complète d'école secondaire basé à **Goma, Nord-Kivu, République Démocratique du Congo**.

Le système gère : inscriptions des élèves, notes & bulletins officiels, finances en Francs Congolais, présences, communication SMS parents, rapports EPSP. Il doit fonctionner **hors-ligne** (offline-first), être optimisé pour Android et les réseaux 3G.

---

## STACK TECHNIQUE IMPOSÉE

```
Frontend Web  : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
State         : Zustand (global) + React Query / TanStack Query (server state)
Offline       : Dexie.js (IndexedDB wrapper) + Service Worker (Workbox)
Backend       : Node.js 20 + Express + TypeScript
ORM           : Prisma
Base données  : PostgreSQL (production) + SQLite (dev local)
Auth          : JWT (httpOnly cookie) + bcrypt + RBAC
SMS           : Africa's Talking SDK
PDF           : Puppeteer (bulletins, reçus, rapports)
Excel         : ExcelJS (import/export)
Upload        : Multer + Sharp (redimensionnement photos)
Tests         : Vitest (unit) + Playwright (e2e)
Linting       : ESLint + Prettier
Monorepo      : npm workspaces (packages: client, server, shared)
```

---

## INSTRUCTION PRINCIPALE

**Génère la structure complète du monorepo EduGoma 360 avec :**

1. Tous les fichiers de configuration (package.json, tsconfig, vite.config, tailwind.config, prisma schema, .env.example)
2. L'architecture de dossiers complète (voir ci-dessous)
3. Le schéma Prisma complet avec tous les modèles
4. Les routes Express complètes avec middlewares
5. Les composants React de base (layout, navigation, auth)
6. Le système offline/sync Dexie.js
7. Les seeds de données initiales pour Goma/RDC

---

## ARCHITECTURE DE DOSSIERS À GÉNÉRER

```
edugoma360/
├── package.json                    # Workspace root
├── .env.example
├── .gitignore
├── README.md
│
├── packages/
│   │
│   ├── shared/                     # Types & utils partagés
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   ├── student.types.ts
│   │   │   │   ├── grade.types.ts
│   │   │   │   ├── finance.types.ts
│   │   │   │   ├── attendance.types.ts
│   │   │   │   ├── user.types.ts
│   │   │   │   └── api.types.ts
│   │   │   ├── constants/
│   │   │   │   ├── sections.ts     # Sections & options RDC
│   │   │   │   ├── feeTypes.ts     # Types de frais officiels
│   │   │   │   ├── roles.ts        # Rôles RBAC
│   │   │   │   ├── holidays.ts     # Fêtes nationales RDC
│   │   │   │   └── provinces.ts    # Provinces RDC
│   │   │   └── utils/
│   │   │       ├── matricule.ts    # Générateur matricule MEPST
│   │   │       ├── gradeCalc.ts    # Calcul moyennes officiel RDC
│   │   │       ├── currency.ts     # Conversion FC/USD
│   │   │       └── validators.ts   # Validateurs partagés
│   │   └── tsconfig.json
│   │
│   ├── server/                     # Backend Express + Prisma
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Schéma complet (voir ci-dessous)
│   │   │   ├── migrations/
│   │   │   └── seed.ts             # Données initiales Goma/RDC
│   │   └── src/
│   │       ├── index.ts            # Entrée serveur
│   │       ├── app.ts              # Setup Express
│   │       ├── config/
│   │       │   ├── env.ts
│   │       │   ├── database.ts
│   │       │   └── cors.ts
│   │       ├── middleware/
│   │       │   ├── auth.middleware.ts
│   │       │   ├── rbac.middleware.ts
│   │       │   ├── rateLimit.middleware.ts
│   │       │   ├── upload.middleware.ts
│   │       │   └── errorHandler.middleware.ts
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   │   ├── auth.routes.ts
│   │       │   │   ├── auth.controller.ts
│   │       │   │   ├── auth.service.ts
│   │       │   │   └── auth.dto.ts
│   │       │   ├── students/
│   │       │   │   ├── students.routes.ts
│   │       │   │   ├── students.controller.ts
│   │       │   │   ├── students.service.ts
│   │       │   │   └── students.dto.ts
│   │       │   ├── grades/
│   │       │   │   ├── grades.routes.ts
│   │       │   │   ├── grades.controller.ts
│   │       │   │   ├── grades.service.ts
│   │       │   │   └── grades.dto.ts
│   │       │   ├── finance/
│   │       │   │   ├── finance.routes.ts
│   │       │   │   ├── finance.controller.ts
│   │       │   │   ├── finance.service.ts
│   │       │   │   └── finance.dto.ts
│   │       │   ├── attendance/
│   │       │   │   ├── attendance.routes.ts
│   │       │   │   ├── attendance.controller.ts
│   │       │   │   ├── attendance.service.ts
│   │       │   │   └── attendance.dto.ts
│   │       │   ├── teachers/
│   │       │   │   ├── teachers.routes.ts
│   │       │   │   ├── teachers.controller.ts
│   │       │   │   └── teachers.service.ts
│   │       │   ├── sms/
│   │       │   │   ├── sms.routes.ts
│   │       │   │   ├── sms.controller.ts
│   │       │   │   └── sms.service.ts  # Africa's Talking
│   │       │   ├── reports/
│   │       │   │   ├── reports.routes.ts
│   │       │   │   ├── reports.controller.ts
│   │       │   │   ├── reports.service.ts
│   │       │   │   └── templates/      # HTML templates Puppeteer
│   │       │   │       ├── bulletin.html
│   │       │   │       ├── receipt.html
│   │       │   │       └── palmares.html
│   │       │   ├── sync/
│   │       │   │   ├── sync.routes.ts
│   │       │   │   ├── sync.controller.ts
│   │       │   │   └── sync.service.ts # Gestion conflits offline
│   │       │   └── settings/
│   │       │       ├── settings.routes.ts
│   │       │       └── settings.service.ts
│   │       └── lib/
│   │           ├── prisma.ts
│   │           ├── jwt.ts
│   │           ├── pdf.ts          # Wrapper Puppeteer
│   │           ├── excel.ts        # Wrapper ExcelJS
│   │           └── sms.ts          # Wrapper Africa's Talking
│   │
│   └── client/                     # Frontend React + Vite
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── router.tsx          # TanStack Router ou React Router v6
│           ├── assets/
│           │   └── logo.svg
│           ├── styles/
│           │   └── globals.css     # Variables CSS palette EduGoma360
│           ├── lib/
│           │   ├── api.ts          # Axios client configuré
│           │   ├── offline/
│           │   │   ├── db.ts       # Dexie schema
│           │   │   ├── sync.ts     # Queue de sync
│           │   │   └── sw.ts       # Service Worker Workbox
│           │   └── utils.ts
│           ├── stores/
│           │   ├── auth.store.ts
│           │   ├── school.store.ts
│           │   └── offline.store.ts
│           ├── hooks/
│           │   ├── useAuth.ts
│           │   ├── useOffline.ts
│           │   ├── useSync.ts
│           │   └── useSMS.ts
│           ├── components/
│           │   ├── ui/             # shadcn/ui components
│           │   ├── layout/
│           │   │   ├── AppLayout.tsx
│           │   │   ├── Sidebar.tsx
│           │   │   ├── Header.tsx
│           │   │   ├── Footer.tsx
│           │   │   └── OfflineBanner.tsx
│           │   └── shared/
│           │       ├── ScreenBadge.tsx
│           │       ├── ApiStatus.tsx
│           │       ├── SyncIndicator.tsx
│           │       ├── ConfirmModal.tsx
│           │       ├── DataTable.tsx
│           │       └── EmptyState.tsx
│           └── pages/
│               ├── auth/
│               │   ├── LoginPage.tsx       # SCR-001
│               │   └── ForgotPassword.tsx  # SCR-002
│               ├── dashboard/
│               │   └── DashboardPage.tsx   # SCR-003
│               ├── students/
│               │   ├── StudentsListPage.tsx   # SCR-005
│               │   ├── StudentDetailPage.tsx  # SCR-006
│               │   └── StudentFormPage.tsx    # SCR-007
│               ├── grades/
│               │   ├── GradeEntryPage.tsx     # SCR-012
│               │   ├── AveragesPage.tsx       # SCR-014
│               │   ├── DeliberationPage.tsx   # SCR-015
│               │   └── BulletinPage.tsx       # SCR-016
│               ├── finance/
│               │   ├── FinanceDashboard.tsx   # SCR-021
│               │   ├── PaymentFormPage.tsx    # SCR-022
│               │   └── DebtsPage.tsx          # SCR-024
│               ├── attendance/
│               │   ├── DailyAttendancePage.tsx # SCR-028
│               │   └── AttendanceReportPage.tsx # SCR-030
│               ├── communication/
│               │   ├── SendSMSPage.tsx         # SCR-032
│               │   └── ConvocationsPage.tsx    # SCR-034
│               ├── parent-portal/
│               │   └── ParentHomePage.tsx      # SCR-036
│               ├── reports/
│               │   └── ReportsPage.tsx         # SCR-040
│               └── settings/
│                   ├── SchoolSetupPage.tsx     # SCR-004
│                   ├── AcademicYearPage.tsx    # SCR-044
│                   ├── SubjectsPage.tsx        # SCR-045
│                   └── SyncPage.tsx            # SCR-047
```

---

## SCHÉMA PRISMA COMPLET À GÉNÉRER

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = env("DATABASE_PROVIDER") // "postgresql" | "sqlite"
  url      = env("DATABASE_URL")
}

// ── SCHOOL (Multi-tenant) ─────────────────────────────────────────────────────
model School {
  id           String   @id @default(uuid())
  name         String
  logoUrl      String?
  type         SchoolType
  convention   String?  // Catholique, Protestante, etc.
  agrement     String?  // N° agrément MEPST
  province     String   @default("Nord-Kivu")
  ville        String   @default("Goma")
  commune      String?
  adresse      String?
  telephone    String?
  email        String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  users        User[]
  students     Student[]
  teachers     Teacher[]
  classes      Class[]
  sections     Section[]
  subjects     Subject[]
  academicYears AcademicYear[]
  feeTypes     FeeType[]
  payments     Payment[]
  smsLogs      SmsLog[]

  @@map("schools")
}

enum SchoolType {
  OFFICIELLE
  CONVENTIONNEE
  PRIVEE
}

// ── USER & AUTH ───────────────────────────────────────────────────────────────
model User {
  id           String   @id @default(uuid())
  schoolId     String
  school       School   @relation(fields: [schoolId], references: [id])
  nom          String
  postNom      String
  prenom       String?
  email        String?
  phone        String   // +243XXXXXXXXX
  passwordHash String
  role         UserRole
  isActive     Boolean  @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  gradesCreated Grade[]
  paymentsCreated Payment[]
  attendanceTaken Attendance[]

  @@unique([schoolId, phone])
  @@unique([schoolId, email])
  @@map("users")
}

enum UserRole {
  SUPER_ADMIN
  PREFET
  ECONOME
  SECRETAIRE
  ENSEIGNANT
  PARENT
}

// ── ACADEMIC YEAR ─────────────────────────────────────────────────────────────
model AcademicYear {
  id           String   @id @default(uuid())
  schoolId     String
  school       School   @relation(fields: [schoolId], references: [id])
  label        String   // "2024-2025"
  startDate    DateTime
  endDate      DateTime
  isActive     Boolean  @default(false)
  createdAt    DateTime @default(now())

  terms        Term[]
  enrollments  Enrollment[]
  payments     Payment[]

  @@unique([schoolId, label])
  @@map("academic_years")
}

// ── TERM (Trimestre) ──────────────────────────────────────────────────────────
model Term {
  id             String       @id @default(uuid())
  academicYearId String
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
  number         Int          // 1, 2, 3
  label          String       // "Trimestre 1"
  startDate      DateTime
  endDate        DateTime
  examStartDate  DateTime?
  examEndDate    DateTime?
  isActive       Boolean      @default(false)

  grades         Grade[]
  deliberations  Deliberation[]
  attendances    Attendance[]

  @@unique([academicYearId, number])
  @@map("terms")
}

// ── SECTION & CLASS ───────────────────────────────────────────────────────────
model Section {
  id       String  @id @default(uuid())
  schoolId String
  school   School  @relation(fields: [schoolId], references: [id])
  name     String  // "Scientifique", "Commerciale", "Pédagogique", "Technique", "Littéraire", "Tronc Commun"
  code     String  // "SC", "HCG", "PEDA", "HT", "LIT", "TC"
  year     Int     // 1-6

  classes  Class[]
  subjects SubjectSection[]

  @@unique([schoolId, code, year])
  @@map("sections")
}

model Class {
  id        String  @id @default(uuid())
  schoolId  String
  school    School  @relation(fields: [schoolId], references: [id])
  sectionId String
  section   Section @relation(fields: [sectionId], references: [id])
  name      String  // "4ScA", "5PédB"
  maxStudents Int   @default(45)
  isActive  Boolean @default(true)

  enrollments  Enrollment[]
  teacherAssignments TeacherClassSubject[]
  attendances  Attendance[]
  deliberations Deliberation[]

  @@unique([schoolId, name])
  @@map("classes")
}

// ── SUBJECT (Matière) ─────────────────────────────────────────────────────────
model Subject {
  id              String  @id @default(uuid())
  schoolId        String
  school          School  @relation(fields: [schoolId], references: [id])
  name            String  // "Mathématiques"
  abbreviation    String  // "Math"
  maxScore        Int     @default(20)  // 10 ou 20
  isEliminatory   Boolean @default(false)
  elimThreshold   Float?  // Seuil éliminatoire
  displayOrder    Int     @default(0)

  sections        SubjectSection[]
  grades          Grade[]
  assignments     TeacherClassSubject[]

  @@unique([schoolId, abbreviation])
  @@map("subjects")
}

model SubjectSection {
  subjectId   String
  subject     Subject @relation(fields: [subjectId], references: [id])
  sectionId   String
  section     Section @relation(fields: [sectionId], references: [id])
  coefficient Int     @default(1)

  @@id([subjectId, sectionId])
  @@map("subject_sections")
}

// ── STUDENT ───────────────────────────────────────────────────────────────────
model Student {
  id           String        @id @default(uuid())
  schoolId     String
  school       School        @relation(fields: [schoolId], references: [id])
  matricule    String        // NK-GOM-ISS001-0234
  nom          String
  postNom      String
  prenom       String?
  sexe         Sexe
  dateNaissance DateTime
  lieuNaissance String
  nationalite  String        @default("Congolaise")
  photoUrl     String?
  nomPere      String?
  telPere      String?
  nomMere      String?
  telMere      String?
  nomTuteur    String?
  telTuteur    String?       // Numéro prioritaire SMS
  statut       StudentStatus @default(NOUVEAU)
  isActive     Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  enrollments  Enrollment[]
  payments     Payment[]
  attendances  Attendance[]
  disciplineRecords DisciplineRecord[]

  @@unique([schoolId, matricule])
  @@map("students")
}

enum Sexe {
  M
  F
}

enum StudentStatus {
  NOUVEAU
  REDOUBLANT
  TRANSFERE
  DEPLACE
  REFUGIE
  ARCHIVE
}

// ── ENROLLMENT (Inscription annuelle) ────────────────────────────────────────
model Enrollment {
  id             String       @id @default(uuid())
  studentId      String
  student        Student      @relation(fields: [studentId], references: [id])
  classId        String
  class          Class        @relation(fields: [classId], references: [id])
  academicYearId String
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
  ecoleOrigine   String?
  resultatTenasosp Float?
  enrolledAt     DateTime     @default(now())

  @@unique([studentId, academicYearId])
  @@map("enrollments")
}

// ── TEACHER ───────────────────────────────────────────────────────────────────
model Teacher {
  id          String        @id @default(uuid())
  schoolId    String
  school      School        @relation(fields: [schoolId], references: [id])
  nom         String
  postNom     String
  prenom      String?
  matriculeMepst String?
  diplome     String?
  phone       String?
  statut      TeacherStatus @default(NON_PAYE)
  isActive    Boolean       @default(true)

  assignments TeacherClassSubject[]

  @@map("teachers")
}

enum TeacherStatus {
  MECHANISE
  NON_PAYE
  NOUVELLE_UNITE
  VACATAIRE
}

model TeacherClassSubject {
  id        String  @id @default(uuid())
  teacherId String
  teacher   Teacher @relation(fields: [teacherId], references: [id])
  classId   String
  class     Class   @relation(fields: [classId], references: [id])
  subjectId String
  subject   Subject @relation(fields: [subjectId], references: [id])

  @@unique([teacherId, classId, subjectId])
  @@map("teacher_class_subjects")
}

// ── GRADE (Note) ──────────────────────────────────────────────────────────────
model Grade {
  id          String   @id @default(uuid())
  studentId   String
  student     Student  @relation(fields: [studentId], references: [id], onDelete: NoAction) // via Enrollment
  subjectId   String
  subject     Subject  @relation(fields: [subjectId], references: [id])
  termId      String
  term        Term     @relation(fields: [termId], references: [id])
  evalType    EvalType
  score       Float
  maxScore    Int      @default(20)
  observation String?
  isLocked    Boolean  @default(false)
  syncStatus  SyncStatus @default(SYNCED)
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([studentId, subjectId, termId, evalType])
  @@map("grades")
}

enum EvalType {
  INTERROGATION
  TP
  EXAMEN_TRIMESTRIEL
  EXAMEN_SYNTHESE
}

enum SyncStatus {
  SYNCED
  PENDING
  CONFLICT
}

// ── DELIBERATION ──────────────────────────────────────────────────────────────
model Deliberation {
  id             String            @id @default(uuid())
  classId        String
  class          Class             @relation(fields: [classId], references: [id])
  termId         String
  term           Term              @relation(fields: [termId], references: [id])
  status         DelibStatus       @default(DRAFT)
  validatedAt    DateTime?
  pvUrl          String?
  createdAt      DateTime          @default(now())

  results        DelibResult[]

  @@unique([classId, termId])
  @@map("deliberations")
}

model DelibResult {
  id              String       @id @default(uuid())
  deliberationId  String
  deliberation    Deliberation @relation(fields: [deliberationId], references: [id])
  studentId       String
  generalAverage  Float
  totalPoints     Float
  rank            Int
  decision        DelibDecision
  justification   String?

  @@unique([deliberationId, studentId])
  @@map("delib_results")
}

enum DelibStatus {
  DRAFT
  VALIDATED
}

enum DelibDecision {
  ADMITTED
  DISTINCTION
  GREAT_DISTINCTION
  ADJOURNED
  FAILED
  MEDICAL
}

// ── ATTENDANCE (Présence) ─────────────────────────────────────────────────────
model Attendance {
  id            String          @id @default(uuid())
  studentId     String
  student       Student         @relation(fields: [studentId], references: [id])
  classId       String
  class         Class           @relation(fields: [classId], references: [id])
  termId        String
  term          Term            @relation(fields: [termId], references: [id])
  date          DateTime        @db.Date
  period        AttendancePeriod
  status        AttendanceStatus
  justification String?
  syncStatus    SyncStatus      @default(SYNCED)
  recordedById  String
  recordedBy    User            @relation(fields: [recordedById], references: [id])
  createdAt     DateTime        @default(now())

  @@unique([studentId, date, period])
  @@map("attendances")
}

enum AttendancePeriod {
  MATIN
  APRES_MIDI
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  JUSTIFIED
  SICK
}

// ── DISCIPLINE ────────────────────────────────────────────────────────────────
model DisciplineRecord {
  id          String          @id @default(uuid())
  studentId   String
  student     Student         @relation(fields: [studentId], references: [id])
  date        DateTime
  description String
  witnesses   String?
  sanction    SanctionType
  status      DisciplineStatus @default(OPEN)
  resolution  String?
  createdAt   DateTime        @default(now())

  @@map("discipline_records")
}

enum SanctionType {
  AVERTISSEMENT_ORAL
  AVERTISSEMENT_ECRIT
  RETENUE
  EXCLUSION_TEMPORAIRE
  CONSEIL_DISCIPLINE
}

enum DisciplineStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  ARCHIVED
}

// ── FINANCE ───────────────────────────────────────────────────────────────────
model FeeType {
  id          String   @id @default(uuid())
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])
  name        String   // "Minerval", "Frais de fonctionnement T1"
  amount      Int      // En FC
  termNumber  Int?     // 1, 2, 3 ou null si annuel
  isRequired  Boolean  @default(true)
  isActive    Boolean  @default(true)

  payments    Payment[]

  @@map("fee_types")
}

model Payment {
  id             String      @id @default(uuid())
  receiptNumber  String      // NK-GOM-ISS001-2025-0847
  studentId      String
  student        Student     @relation(fields: [studentId], references: [id])
  feeTypeId      String
  feeType        FeeType     @relation(fields: [feeTypeId], references: [id])
  schoolId       String
  school         School      @relation(fields: [schoolId], references: [id])
  academicYearId String
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
  amountDue      Int         // FC
  amountPaid     Int         // FC
  currency       Currency    @default(FC)
  exchangeRate   Float?      // Taux FC/USD si paiement en USD
  paymentMode    PaymentMode
  reference      String?     // N° transaction Mobile Money
  paidAt         DateTime
  createdById    String
  createdBy      User        @relation(fields: [createdById], references: [id])
  createdAt      DateTime    @default(now())

  @@unique([schoolId, receiptNumber])
  @@map("payments")
}

enum Currency {
  FC
  USD
}

enum PaymentMode {
  ESPECES
  AIRTEL_MONEY
  MPESA
  ORANGE_MONEY
  VIREMENT
}

// ── SMS LOG ───────────────────────────────────────────────────────────────────
model SmsLog {
  id           String    @id @default(uuid())
  schoolId     String
  school       School    @relation(fields: [schoolId], references: [id])
  recipient    String    // Numéro de téléphone
  message      String
  language     String    @default("fr") // "fr" | "sw"
  status       SmsStatus
  provider     String    @default("africas_talking")
  costFc       Int?      // Coût estimé en FC
  sentAt       DateTime  @default(now())
  errorMsg     String?

  @@map("sms_logs")
}

enum SmsStatus {
  SENT
  FAILED
  PENDING
  DELIVERED
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
model Setting {
  id       String @id @default(uuid())
  schoolId String
  key      String
  value    String // JSON string
  updatedAt DateTime @updatedAt

  @@unique([schoolId, key])
  @@map("settings")
}
```

---

## FICHIERS CRITIQUES À GÉNÉRER EN ENTIER

### 1. `packages/shared/src/constants/sections.ts`
Génère les constantes complètes de toutes les sections et options du système éducatif congolais : Tronc Commun (1ère-2ème), Scientifique, Commerciale & Gestion, Pédagogique, Technique (options: Électricité, Mécanique, Informatique, Bâtiment), Littéraire. Inclure les années concernées et les matières par défaut.

### 2. `packages/shared/src/utils/gradeCalc.ts`
Génère les fonctions de calcul officielles du système éducatif RDC :
- `calculateSubjectAverage(scores, evalWeights)` — pondération par type d'évaluation
- `calculateGeneralAverage(subjectAverages, coefficients)` — moyenne générale pondérée
- `calculateRanking(students)` — classement avec gestion des ex-aequo
- `getDelibDecision(average, hasEliminatory)` — suggestion automatique de décision
- `checkEliminatory(score, threshold, isEliminatory)` — vérification note éliminatoire

### 3. `packages/shared/src/utils/matricule.ts`
Génère le générateur de matricule MEPST format `{PROVINCE}-{VILLE}-{ECOLE}-{SEQUENCE}` :
- `generateMatricule(schoolCode, sequence)` → `"NK-GOM-ISS001-0001"`
- `validateMatricule(matricule)` → boolean
- `parseMatricule(matricule)` → `{ province, ville, ecole, sequence }`

### 4. `packages/server/src/middleware/rbac.middleware.ts`
Génère le middleware RBAC complet avec la matrice de permissions :
- Chaque route définit les rôles autorisés
- `requireRole(...roles: UserRole[])` middleware factory
- `requireOwnership(resourceType)` pour les ressources propres (notes enseignant)

### 5. `packages/server/src/modules/grades/grades.service.ts`
Génère le service complet de gestion des notes avec :
- `createOrUpdateGrade()` — upsert avec vérification du rôle enseignant
- `batchSaveGrades()` — sauvegarde en lot optimisée (transaction Prisma)
- `calculateAverages(classId, termId)` — délègue à gradeCalc shared
- `lockGrades(classId, termId)` — verrouillage post-délibération
- `batchSyncOfflineGrades()` — gestion sync depuis Dexie.js

### 6. `packages/client/src/lib/offline/db.ts`
Génère le schéma Dexie.js complet pour le stockage offline :
```typescript
// Tables offline: students, grades, attendance, payments, sync_queue
// Schema versionné avec migrations Dexie
// Interface SyncQueueItem pour la file d'attente des actions offline
```

### 7. `packages/client/src/pages/grades/GradeEntryPage.tsx`
Génère le composant React complet de saisie des notes (SCR-012) :
- Sélecteurs classe / matière / trimestre / type d'évaluation
- Table de saisie avec input par élève (validation min/max selon matière)
- Badge statut par ligne (saisi, en attente, note basse)
- Barre de progression (X/N élèves saisis + moyenne provisoire)
- Gestion offline : sauvegarde Dexie si pas de connexion
- Boutons : Enregistrer en batch, Brouillon, Verrouiller

### 8. `packages/client/src/pages/finance/PaymentFormPage.tsx`
Génère le composant React complet d'enregistrement de paiement (SCR-022) :
- Autocomplete recherche élève avec solde dû affiché
- Calcul automatique solde restant en temps réel
- Support bi-devise FC / USD avec taux configurable
- Sélection type de frais depuis l'API
- Génération et affichage du reçu PDF post-soumission

### 9. `packages/server/prisma/seed.ts`
Génère le seed complet avec :
- 1 école de démonstration : "Institut Technique de Goma" (Goma, Nord-Kivu)
- 1 compte Super Admin : admin@edugoma360.cd / Admin@2025
- 1 compte Préfet, 1 Économe, 1 Secrétaire, 2 Enseignants
- Toutes les sections et classes pour l'année 2024-2025
- 20 matières avec coefficients officiels (Scientifique)
- 30 élèves de démonstration avec noms congolais réalistes
- 5 types de frais (Minerval, Fonctionnement T1/T2/T3, Examen État)
- Notes de démonstration pour le T1 2024-2025

### 10. `packages/server/src/modules/reports/templates/bulletin.html`
Génère le template HTML du bulletin scolaire officiel conforme EPSP-RDC :
- En-tête : Logo + Nom école + Province Nord-Kivu + Ville de Goma
- N° de bulletin, année scolaire, infos élève
- Tableau des matières avec colonnes : Matière | Coeff | Inter | TP | Exam | Total | Moy | Rang
- Récapitulatif général + décision en gras (ADMIS / AJOURNÉ / REFUSÉ)
- Zone signature Préfet + cachet + signature parent
- CSS print optimisé A4

---

## FICHIERS DE CONFIGURATION À GÉNÉRER

### `.env.example`
```env
# Base de données
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://edugoma:password@localhost:5432/edugoma360

# JWT
JWT_SECRET=change_this_to_a_very_long_secret_minimum_32_characters
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=30d

# Africa's Talking SMS
AT_API_KEY=your_africas_talking_api_key
AT_USERNAME=your_username
AT_SENDER_ID=EduGoma360
AT_ENV=sandbox  # sandbox | production

# Stockage fichiers
STORAGE_TYPE=local  # local | s3 | minio
STORAGE_LOCAL_PATH=./uploads
STORAGE_BUCKET=edugoma-uploads
STORAGE_ENDPOINT=http://localhost:9000

# App
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# École par défaut
DEFAULT_CURRENCY=FC
DEFAULT_PROVINCE=Nord-Kivu
DEFAULT_VILLE=Goma
EXCHANGE_RATE_FC_USD=2500  # Taux FC/USD par défaut

# Sécurité
MAX_LOGIN_ATTEMPTS=3
LOCKOUT_DURATION_MINUTES=15
BCRYPT_ROUNDS=12

# Sync offline
OFFLINE_SYNC_INTERVAL_MS=300000   # 5 minutes
SYNC_BATCH_SIZE=100
```

### `package.json` (root workspace)
```json
{
  "name": "edugoma360",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "npm run dev --workspace=packages/server",
    "dev:client": "npm run dev --workspace=packages/client",
    "build": "npm run build --workspaces",
    "db:migrate": "npm run db:migrate --workspace=packages/server",
    "db:seed": "npm run db:seed --workspace=packages/server",
    "db:studio": "npm run db:studio --workspace=packages/server",
    "test": "npm run test --workspaces",
    "lint": "eslint packages/*/src --ext .ts,.tsx",
    "setup": "npm install && npm run db:migrate && npm run db:seed"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## PALETTE CSS À IMPLÉMENTER (TailwindCSS extend)

```javascript
// tailwind.config.ts
colors: {
  primary:   { DEFAULT: '#1B5E20', light: '#2E7D32', dark: '#1A4E1B' },
  secondary: { DEFAULT: '#F57F17', light: '#FBC02D', dark: '#E65100' },
  info:      { DEFAULT: '#0D47A1', light: '#1565C0', bg: '#E3F2FD' },
  success:   { DEFAULT: '#2E7D32', bg: '#E8F5E9' },
  warning:   { DEFAULT: '#F57F17', bg: '#FFF8E1' },
  danger:    { DEFAULT: '#B71C1C', bg: '#FFEBEE' },
  neutral:   { 900: '#212121', 700: '#424242', 500: '#757575', 300: '#BDBDBD', 100: '#F5F5F5' }
}
```

---

## RÈGLES DE DÉVELOPPEMENT ABSOLUES

```
1. OFFLINE-FIRST   → Toute écriture → Dexie.js d'abord, API ensuite. Jamais de blocage UX sur erreur réseau.
2. TYPESCRIPT STRICT → noImplicitAny: true, strictNullChecks: true sur tous les packages.
3. VALIDATION DTOs  → Zod sur le client ET le serveur pour tous les inputs utilisateur.
4. RBAC STRICT     → Chaque endpoint vérifie le rôle. Les boutons inaccessibles sont masqués (hidden, pas disabled).
5. PRISMA TRANSACTIONS → toute opération multi-table utilise prisma.$transaction([]).
6. FC PAR DÉFAUT   → Toutes les sommes stockées en Francs Congolais (entiers). USD = conversion à l'affichage.
7. MATRICULE AUTO  → Jamais de saisie manuelle du matricule par l'utilisateur.
8. NOMS CONGOLAIS  → Ordre d'affichage : NOM POSTNOM Prénom (ex: AMISI KALOMBO Jean-Baptiste).
9. SMS SWAHILI     → Tous les templates SMS disponibles en français ET swahili.
10. PDF OFFICIEL   → Les bulletins générés respectent EXACTEMENT la maquette EPSP-RDC.
11. ERREURS API    → Format standard : { error: { code, message, field? } } sur tous les endpoints.
12. SEED RÉALISTE  → Les données de seed utilisent des noms congolais authentiques (Amisi, Bahati, Ciza, Dusabe, Furaha...).
```

---

## COMMANDES POST-INIT À EXÉCUTER

```bash
# 1. Installer toutes les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Créer la base de données et appliquer les migrations
npm run db:migrate

# 4. Charger les données initiales (école demo + utilisateurs + classes)
npm run db:seed

# 5. Lancer en développement (frontend + backend en parallèle)
npm run dev

# 6. Ouvrir Prisma Studio (optionnel, pour voir les données)
npm run db:studio

# Accès:
# Frontend : http://localhost:5173
# Backend API : http://localhost:3000/api
# Admin demo : admin@edugoma360.cd / Admin@2025
```

---

## POINTS D'ATTENTION IMPORTANTS

- **Goma spécifique** : Le réseau est instable. Tester systématiquement le mode offline (couper le WiFi et vérifier que l'app fonctionne).
- **Android** : Tester sur Chrome Android avec émulation d'appareil bas de gamme (Moto G4, Galaxy A10).
- **Réseau 3G** : Utiliser Lighthouse avec throttling 3G pour valider les performances (cible: < 3s LCP).
- **Impression** : Les bulletins doivent s'imprimer correctement sur des imprimantes HP DeskJet sans couleur (prévoir version noir & blanc).
- **Africa's Talking** : Utiliser le mode sandbox pour les tests SMS, basculer en production uniquement pour le déploiement réel.
- **Prisma + SQLite** : Pour le développement local sans PostgreSQL, définir `DATABASE_PROVIDER=sqlite` et `DATABASE_URL=file:./dev.db`.

---

*EduGoma 360 — Système de Gestion d'École Secondaire — Goma, Nord-Kivu, RDC*
*v1.0.0 — Prompt d'initialisation généré le Février 2025*
