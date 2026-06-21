-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "type" TEXT NOT NULL,
    "convention" TEXT,
    "agrement" TEXT,
    "province" TEXT NOT NULL DEFAULT 'Nord-Kivu',
    "ville" TEXT NOT NULL DEFAULT 'Goma',
    "commune" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "logoThumbnailUrl" TEXT,
    "logoIconUrl" TEXT,
    "avenue" TEXT,
    "numero" TEXT,
    "reference" TEXT,
    "telephonePrincipal" TEXT,
    "telephoneSecondaire" TEXT,
    "siteWeb" TEXT,
    "numeroAgrement" TEXT,
    "dateAgrement" DATETIME,
    "devise" TEXT,
    "langueEnseignement" TEXT,
    "systemeEvaluation" TEXT,
    "nombrePeriodes" TEXT,
    "nomOfficiel" TEXT,
    "nomCourt" TEXT,
    "code" TEXT,
    "subdomain" TEXT,
    "planId" TEXT,
    "trialEndsAt" DATETIME,
    CONSTRAINT "schools_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT,
    "nom" TEXT NOT NULL,
    "postNom" TEXT NOT NULL,
    "prenom" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "permissions" TEXT DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "lastLoginIp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "otp_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "name" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "type" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" DATETIME,
    "closedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "academic_years_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "terms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "academicYearId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "examStartDate" DATETIME,
    "examEndDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "terms_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    CONSTRAINT "sections_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "titulaireId" TEXT,
    "maxStudents" INTEGER NOT NULL DEFAULT 45,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "classes_titulaireId_fkey" FOREIGN KEY ("titulaireId") REFERENCES "teachers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "classes_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 20,
    "isEliminatory" BOOLEAN NOT NULL DEFAULT false,
    "elimThreshold" REAL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "subjects_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subject_sections" (
    "subjectId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "coefficient" INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY ("subjectId", "sectionId"),
    CONSTRAINT "subject_sections_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "subject_sections_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "postNom" TEXT NOT NULL,
    "prenom" TEXT,
    "sexe" TEXT NOT NULL,
    "dateNaissance" DATETIME NOT NULL,
    "lieuNaissance" TEXT NOT NULL,
    "nationalite" TEXT NOT NULL DEFAULT 'Congolaise',
    "photoUrl" TEXT,
    "nomPere" TEXT,
    "telPere" TEXT,
    "nomMere" TEXT,
    "telMere" TEXT,
    "nomTuteur" TEXT,
    "telTuteur" TEXT,
    "parentUserId" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'NOUVEAU',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "students_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "ecoleOrigine" TEXT,
    "resultatTenasosp" REAL,
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enrollments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "matriculeMepst" TEXT,
    "nom" TEXT NOT NULL,
    "postNom" TEXT NOT NULL,
    "prenom" TEXT,
    "sexe" TEXT NOT NULL,
    "dateNaissance" DATETIME,
    "lieuNaissance" TEXT,
    "nationalite" TEXT NOT NULL DEFAULT 'Congolaise',
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "photoUrl" TEXT,
    "niveauEtudes" TEXT,
    "domaineFormation" TEXT,
    "universite" TEXT,
    "anneeObtention" INTEGER,
    "specialisations" TEXT,
    "compteBancaire" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "dateEmbauche" DATETIME,
    "typeContrat" TEXT,
    "fonction" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    "congeGlobal" INTEGER NOT NULL DEFAULT 20,
    "congePris" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "teachers_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teacher_leaves" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "observations" TEXT,
    "certificatUrl" TEXT,
    "processedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "teacher_leaves_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "teacher_leaves_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "teacher_leaves_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teacher_certificates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "organisme" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "fichierUrl" TEXT,
    CONSTRAINT "teacher_certificates_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teacher_class_subjects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "volumeHoraire" INTEGER DEFAULT 0,
    CONSTRAINT "teacher_class_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "teacher_class_subjects_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "teacher_class_subjects_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "timetable_periods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherClassSubjectId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "periodSlot" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "timetable_periods_teacherClassSubjectId_fkey" FOREIGN KEY ("teacherClassSubjectId") REFERENCES "teacher_class_subjects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "grades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "evalType" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 20,
    "observation" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "syncStatus" TEXT NOT NULL DEFAULT 'SYNCED',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "grades_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "grades_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "grades_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deliberations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "validatedAt" DATETIME,
    "pvUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deliberations_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "deliberations_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "delib_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deliberationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "generalAverage" REAL NOT NULL,
    "totalPoints" REAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "decision" TEXT NOT NULL,
    "justification" TEXT,
    CONSTRAINT "delib_results_deliberationId_fkey" FOREIGN KEY ("deliberationId") REFERENCES "deliberations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "delib_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "justification" TEXT,
    "syncStatus" TEXT NOT NULL DEFAULT 'SYNCED',
    "recordedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attendances_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendances_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendances_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teacher_attendances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "justification" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "teacher_attendances_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "teacher_attendances_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "teacher_attendances_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "discipline_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "witnesses" TEXT,
    "sanction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "discipline_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fee_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'AUTRE',
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'SCHOOL',
    "sectionIds" TEXT NOT NULL DEFAULT '[]',
    "classIds" TEXT NOT NULL DEFAULT '[]',
    "frequency" TEXT NOT NULL DEFAULT 'ANNUAL',
    "months" TEXT NOT NULL DEFAULT '[]',
    "termNumber" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "observations" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "fee_types_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fee_types_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "totalDue" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL,
    "remainingBalance" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'FC',
    "exchangeRate" REAL,
    "paymentMethod" TEXT NOT NULL,
    "transactionRef" TEXT,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cashierId" TEXT NOT NULL,
    "observations" TEXT,
    "receiptUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "installments" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payment_plans_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payment_plans_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "installments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "amount" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" DATETIME,
    CONSTRAINT "installments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "payment_plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fee_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "feeId" TEXT NOT NULL,
    "amountDue" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fee_payments_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fee_payments_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "fee_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sms_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'africas_talking',
    "costFc" INTEGER,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMsg" TEXT,
    CONSTRAINT "sms_logs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "settings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cash_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "cashierId" TEXT NOT NULL,
    "openingBalance" INTEGER NOT NULL,
    "closingBalance" INTEGER,
    "totalReceived" INTEGER NOT NULL,
    "totalSpent" INTEGER NOT NULL,
    "theoreticalBalance" INTEGER NOT NULL,
    "actualBalance" INTEGER,
    "discrepancy" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    CONSTRAINT "cash_sessions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cash_sessions_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cash_movements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "receiptUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cash_movements_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "cash_sessions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "monthlyDistribution" TEXT NOT NULL DEFAULT 'UNIFORM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "budgets_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "budgets_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budget_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    CONSTRAINT "budget_categories_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budget_months" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    CONSTRAINT "budget_months_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "justifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "attendanceRecordId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonDetails" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" DATETIME,
    "reviewComment" TEXT,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "justifications_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "justifications_attendanceRecordId_fkey" FOREIGN KEY ("attendanceRecordId") REFERENCES "attendances" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "justifications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "justifications_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "justifications_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sms_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT,
    "template" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "totalRecipients" INTEGER NOT NULL,
    "validRecipients" INTEGER NOT NULL,
    "invalidRecipients" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "scheduledAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "sentSMS" INTEGER NOT NULL DEFAULT 0,
    "failedSMS" INTEGER NOT NULL DEFAULT 0,
    "cost" REAL NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sms_campaigns_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sms_campaigns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sms_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "messageId" TEXT,
    "cost" REAL,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sms_messages_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "sms_campaigns" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "email_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "recipientEmails" TEXT NOT NULL,
    "totalRecipients" INTEGER NOT NULL,
    "sentEmails" INTEGER NOT NULL DEFAULT 0,
    "failedEmails" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "scheduledAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "attachmentUrls" TEXT NOT NULL DEFAULT '[]',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "email_campaigns_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "email_campaigns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "convocations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentPhone" TEXT,
    "parentEmail" TEXT,
    "parentQualite" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "dateRendezVous" DATETIME NOT NULL,
    "heureRendezVous" TEXT NOT NULL,
    "lieu" TEXT NOT NULL DEFAULT 'Bureau du Préfet',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "confirmedAt" DATETIME,
    "attendedAt" DATETIME,
    "pdfUrl" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "smsSent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "actions" TEXT NOT NULL DEFAULT '[]',
    "reminderD3Sent" BOOLEAN NOT NULL DEFAULT false,
    "reminderD1Sent" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "convocations_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "convocations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "convocations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT '[]',
    "classIds" TEXT NOT NULL DEFAULT '[]',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "sendPush" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "announcements_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "announcements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "announcement_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "announcement_views_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "announcement_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "saved_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filters" TEXT NOT NULL DEFAULT '{}',
    "options" TEXT NOT NULL DEFAULT '{}',
    "pdfUrl" TEXT,
    "excelUrl" TEXT,
    "generatedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_reports_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "saved_reports_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "export_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "fileUrl" TEXT NOT NULL,
    "filters" TEXT NOT NULL DEFAULT '{}',
    "generatedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "export_history_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "export_history_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "export_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "dayOfMonth" INTEGER,
    "dayOfWeek" INTEGER,
    "time" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "recipients" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" DATETIME,
    "nextRunAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "export_schedules_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "export_schedules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "material_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "goodQty" INTEGER NOT NULL DEFAULT 0,
    "usedQty" INTEGER NOT NULL DEFAULT 0,
    "brokenQty" INTEGER NOT NULL DEFAULT 0,
    "unitValue" REAL NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "acquiredAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "material_items_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "reason" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_movements_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "material_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "auteur" TEXT,
    "isbn" TEXT,
    "matiere" TEXT NOT NULL,
    "niveaux" TEXT NOT NULL DEFAULT '[]',
    "totalQty" INTEGER NOT NULL,
    "availableQty" INTEGER NOT NULL,
    "etat" TEXT NOT NULL,
    "unitValue" REAL,
    "acquiredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "books_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "book_loans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "exemplaire" TEXT,
    "notes" TEXT,
    "loanDate" DATETIME NOT NULL,
    "expectedReturn" DATETIME NOT NULL,
    "actualReturn" DATETIME,
    "etatRetour" TEXT,
    "coutReparation" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "book_loans_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "book_loans_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "book_loans_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GOOD',
    "building" TEXT,
    "floor" TEXT,
    "assignedClassId" TEXT,
    "responsableId" TEXT,
    "equipments" TEXT NOT NULL DEFAULT '[]',
    "stateDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "rooms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rooms_assignedClassId_fkey" FOREIGN KEY ("assignedClassId") REFERENCES "classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "rooms_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "teachers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "maintenance_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "roomId" TEXT,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "technicien" TEXT,
    "estimatedCost" REAL,
    "actualCost" REAL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "reportedById" TEXT NOT NULL,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "maintenance_requests_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "maintenance_requests_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "maintenance_requests_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "priceUSD" REAL NOT NULL DEFAULT 0,
    "priceCDF" REAL NOT NULL DEFAULT 0,
    "maxStudents" INTEGER NOT NULL DEFAULT 300,
    "maxTeachers" INTEGER NOT NULL DEFAULT 20,
    "maxSmsPerMonth" INTEGER NOT NULL DEFAULT 100,
    "durationDays" INTEGER NOT NULL DEFAULT 30,
    "features" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "planId" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentRef" TEXT,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscriptions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "actorRole" TEXT,
    "actorName" TEXT,
    "schoolId" TEXT,
    "schoolName" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "summary" TEXT,
    "before" TEXT,
    "after" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_TeacherSubjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TeacherSubjects_A_fkey" FOREIGN KEY ("A") REFERENCES "subjects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TeacherSubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_code_key" ON "schools"("code");

-- CreateIndex
CREATE UNIQUE INDEX "schools_subdomain_key" ON "schools"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "users_schoolId_phone_key" ON "users"("schoolId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_schoolId_email_key" ON "users"("schoolId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_schoolId_label_key" ON "academic_years"("schoolId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "terms_academicYearId_number_key" ON "terms"("academicYearId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "sections_schoolId_code_year_key" ON "sections"("schoolId", "code", "year");

-- CreateIndex
CREATE UNIQUE INDEX "classes_schoolId_name_key" ON "classes"("schoolId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_schoolId_abbreviation_key" ON "subjects"("schoolId", "abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "students_schoolId_matricule_key" ON "students"("schoolId", "matricule");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_studentId_academicYearId_key" ON "enrollments"("studentId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_matricule_key" ON "teachers"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_userId_key" ON "teachers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_schoolId_telephone_key" ON "teachers"("schoolId", "telephone");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_class_subjects_teacherId_classId_subjectId_academicYearId_key" ON "teacher_class_subjects"("teacherId", "classId", "subjectId", "academicYearId");

-- CreateIndex
CREATE INDEX "timetable_periods_dayOfWeek_periodSlot_idx" ON "timetable_periods"("dayOfWeek", "periodSlot");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_periods_teacherClassSubjectId_dayOfWeek_periodSlot_key" ON "timetable_periods"("teacherClassSubjectId", "dayOfWeek", "periodSlot");

-- CreateIndex
CREATE UNIQUE INDEX "grades_studentId_subjectId_termId_evalType_key" ON "grades"("studentId", "subjectId", "termId", "evalType");

-- CreateIndex
CREATE UNIQUE INDEX "deliberations_classId_termId_key" ON "deliberations"("classId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "delib_results_deliberationId_studentId_key" ON "delib_results"("deliberationId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_date_period_key" ON "attendances"("studentId", "date", "period");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_attendances_teacherId_date_key" ON "teacher_attendances"("teacherId", "date");

-- CreateIndex
CREATE INDEX "fee_types_schoolId_academicYearId_isActive_idx" ON "fee_types"("schoolId", "academicYearId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receiptNumber_key" ON "payments"("receiptNumber");

-- CreateIndex
CREATE INDEX "payments_schoolId_studentId_idx" ON "payments"("schoolId", "studentId");

-- CreateIndex
CREATE INDEX "payments_receiptNumber_idx" ON "payments"("receiptNumber");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "fee_payments_paymentId_feeId_key" ON "fee_payments"("paymentId", "feeId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_schoolId_key_key" ON "settings"("schoolId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "cash_sessions_schoolId_date_cashierId_key" ON "cash_sessions"("schoolId", "date", "cashierId");

-- CreateIndex
CREATE INDEX "cash_movements_sessionId_createdAt_idx" ON "cash_movements"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_schoolId_academicYearId_key" ON "budgets"("schoolId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_months_budgetId_month_key" ON "budget_months"("budgetId", "month");

-- CreateIndex
CREATE INDEX "justifications_status_createdAt_idx" ON "justifications"("status", "createdAt");

-- CreateIndex
CREATE INDEX "justifications_studentId_idx" ON "justifications"("studentId");

-- CreateIndex
CREATE INDEX "sms_campaigns_schoolId_status_idx" ON "sms_campaigns"("schoolId", "status");

-- CreateIndex
CREATE INDEX "sms_campaigns_createdAt_idx" ON "sms_campaigns"("createdAt");

-- CreateIndex
CREATE INDEX "sms_messages_campaignId_status_idx" ON "sms_messages"("campaignId", "status");

-- CreateIndex
CREATE INDEX "email_campaigns_schoolId_status_idx" ON "email_campaigns"("schoolId", "status");

-- CreateIndex
CREATE INDEX "email_campaigns_createdAt_idx" ON "email_campaigns"("createdAt");

-- CreateIndex
CREATE INDEX "convocations_studentId_status_idx" ON "convocations"("studentId", "status");

-- CreateIndex
CREATE INDEX "convocations_dateRendezVous_idx" ON "convocations"("dateRendezVous");

-- CreateIndex
CREATE INDEX "convocations_schoolId_createdAt_idx" ON "convocations"("schoolId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "convocations_schoolId_numero_key" ON "convocations"("schoolId", "numero");

-- CreateIndex
CREATE INDEX "announcements_schoolId_startDate_endDate_idx" ON "announcements"("schoolId", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_views_announcementId_userId_key" ON "announcement_views"("announcementId", "userId");

-- CreateIndex
CREATE INDEX "saved_reports_schoolId_type_idx" ON "saved_reports"("schoolId", "type");

-- CreateIndex
CREATE INDEX "export_history_schoolId_createdAt_idx" ON "export_history"("schoolId", "createdAt");

-- CreateIndex
CREATE INDEX "export_schedules_schoolId_isActive_idx" ON "export_schedules"("schoolId", "isActive");

-- CreateIndex
CREATE INDEX "material_items_schoolId_category_idx" ON "material_items"("schoolId", "category");

-- CreateIndex
CREATE INDEX "stock_movements_itemId_createdAt_idx" ON "stock_movements"("itemId", "createdAt");

-- CreateIndex
CREATE INDEX "books_schoolId_matiere_idx" ON "books"("schoolId", "matiere");

-- CreateIndex
CREATE INDEX "book_loans_bookId_status_idx" ON "book_loans"("bookId", "status");

-- CreateIndex
CREATE INDEX "book_loans_studentId_status_idx" ON "book_loans"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_assignedClassId_key" ON "rooms"("assignedClassId");

-- CreateIndex
CREATE INDEX "rooms_schoolId_type_status_idx" ON "rooms"("schoolId", "type", "status");

-- CreateIndex
CREATE INDEX "rooms_responsableId_idx" ON "rooms"("responsableId");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_schoolId_name_key" ON "rooms"("schoolId", "name");

-- CreateIndex
CREATE INDEX "maintenance_requests_schoolId_status_urgency_idx" ON "maintenance_requests"("schoolId", "status", "urgency");

-- CreateIndex
CREATE INDEX "maintenance_requests_roomId_idx" ON "maintenance_requests"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_slug_key" ON "subscription_plans"("slug");

-- CreateIndex
CREATE INDEX "subscriptions_schoolId_status_idx" ON "subscriptions"("schoolId", "status");

-- CreateIndex
CREATE INDEX "subscriptions_endDate_idx" ON "subscriptions"("endDate");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_schoolId_idx" ON "notifications"("schoolId");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_schoolId_idx" ON "audit_logs"("schoolId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_TeacherSubjects_AB_unique" ON "_TeacherSubjects"("A", "B");

-- CreateIndex
CREATE INDEX "_TeacherSubjects_B_index" ON "_TeacherSubjects"("B");

