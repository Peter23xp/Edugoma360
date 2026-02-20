/**
 * Types académiques partagés — EduGoma 360
 * Utilisés par le client ET le serveur
 *
 * Note: Grade est renommé AcademicGrade et AcademicYear en AcademicYearInfo
 * pour éviter les conflits avec grade.types.ts et school.types.ts
 */

import type { DelibDecision } from '../constants/decisions';
import type { EvalType } from '../constants/evalTypes';

// ─────────────────────────────────────────────────────────────────────────────
// CLASSES
// ─────────────────────────────────────────────────────────────────────────────

export interface AcademicClass {
    id: string;
    schoolId: string;
    name: string;
    sectionId: string;
    sectionName: string;
    academicYearId: string;
    maxStudents: number;
    currentStudents: number;
    homeroomTeacherId?: string | null;
    homeroomTeacherName?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ClassWithStats extends AcademicClass {
    averageScore?: number | null;
    successRate?: number | null;
    subjectCount?: number;
}

export interface TeacherAssignment {
    id: string;
    classId: string;
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    coefficient: number;
    isEliminatory: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOI DU TEMPS
// ─────────────────────────────────────────────────────────────────────────────

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

export interface TimetablePeriod {
    id: string;
    classId: string;
    className?: string;
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    dayOfWeek: DayOfWeek;
    periodNumber: number; // 1-8
    startTime: string;   // "08:00"
    endTime: string;     // "08:50"
    isRecreation: boolean;
    academicYearId: string;
}

export interface TimetableConflict {
    type: 'teacher' | 'class';
    message: string;
    conflictingPeriodId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTES (GRADES)
// ─────────────────────────────────────────────────────────────────────────────

/** Grade enrichi pour le module académique (plus complet que grade.types.ts:Grade) */
export interface AcademicGrade {
    id: string;
    studentId: string;
    subjectId: string;
    classId: string;
    termId: string;
    evalType: EvalType;
    score: number | null;
    maxScore: number;
    observation?: string | null;
    isLocked: boolean;
    lockedAt?: string | null;
    lockedBy?: string | null;
    teacherId: string;
    schoolId: string;
    createdAt: string;
    updatedAt: string;
}

export interface GradeFiltersState {
    classId: string;
    subjectId: string;
    termId: string;
    evalType: EvalType | '';
}

export interface GradeWithStudent extends AcademicGrade {
    studentName: string;
    studentMatricule: string;
}

export interface GradesMatrixData {
    students: Array<{
        id: string;
        matricule: string;
        nom: string;
        postNom: string;
        prenom?: string | null;
    }>;
    subjects: Array<{
        id: string;
        name: string;
        coefficient: number;
        isEliminatory: boolean;
    }>;
    grades: Record<string, Record<string, number | null>>; // grades[studentId][subjectId]
    averages: Record<string, number | null>;              // averages[studentId]
    ranks: Record<string, number>;                         // ranks[studentId]
}

// ─────────────────────────────────────────────────────────────────────────────
// MOYENNES
// ─────────────────────────────────────────────────────────────────────────────

export interface StudentAverage {
    studentId: string;
    studentName: string;
    studentMatricule: string;
    photoUrl?: string | null;
    termId: string;
    subjectAverages: Array<{
        subjectId: string;
        subjectName: string;
        coefficient: number;
        average: number | null;
        isEliminatory: boolean;
        hasFailed: boolean;
    }>;
    totalPoints: number;
    generalAverage: number | null;
    rank: number;
    status: 'ADMITTED' | 'ADJOURNED' | 'FAILED';
    isComplete: boolean; // toutes les notes saisies
}

export interface ClassAveragesData {
    classId: string;
    className: string;
    termId: string;
    termName: string;
    students: StudentAverage[];
    classAverage: number;
    successRate: number;
    highestAverage: number;
    lowestAverage: number;
    termHistory?: Array<{
        termId: string;
        termName: string;
        classAverage: number;
    }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// DÉLIBÉRATION
// ─────────────────────────────────────────────────────────────────────────────

export type DeliberationStatus = 'DRAFT' | 'VALIDATED' | 'APPROVED';

export interface DeliberationStudent {
    studentId: string;
    studentName: string;
    studentMatricule: string;
    photoUrl?: string | null;
    t1Average: number | null;
    t2Average: number | null;
    t3Average: number | null;
    annualAverage: number | null;
    rank: number;
    suggestedDecision: DelibDecision;
    finalDecision: DelibDecision | null;
    decisionNote?: string | null;
    isEliminatory: boolean;
}

export interface DeliberationData {
    id?: string;
    classId: string;
    className: string;
    academicYearId: string;
    status: DeliberationStatus;
    students: DeliberationStudent[];
    approvedAt?: string | null;
    approvedBy?: string | null;
    approverName?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface DeliberationStats {
    total: number;
    admitted: number;
    adjourned: number;
    failed: number;
    distinction: number;
    greatDistinction: number;
    successRate: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// BULLETINS
// ─────────────────────────────────────────────────────────────────────────────

export interface BulletinData {
    student: {
        id: string;
        matricule: string;
        nom: string;
        postNom: string;
        prenom?: string | null;
        photoUrl?: string | null;
        dateNaissance: string;
        className: string;
        sectionName: string;
    };
    school: {
        name: string;
        logoUrl?: string | null;
        province: string;
        ville: string;
        address: string;
        code?: string | null;
    };
    academicYear: string;
    term: {
        id: string;
        name: string;
        number: 1 | 2 | 3;
    };
    grades: Array<{
        subjectName: string;
        coefficient: number;
        interro: number | null;
        tp: number | null;
        exam: number | null;
        average: number | null;
        rank: number | null;
        maxScore: number;
        isEliminatory: boolean;
    }>;
    totalPoints: number;
    generalAverage: number | null;
    rank: number;
    totalStudents: number;
    decision: DelibDecision | null;
    absences: {
        justified: number;
        unjustified: number;
    };
    conductObservations?: string | null;
    generalObservations?: string | null;
    homeroomTeacher?: string | null;
    prefectSignature?: string | null;
    deliberationApproved: boolean;
}

export interface BulletinGenerationJob {
    jobId: string;
    classId: string;
    termId: string;
    status: 'PENDING' | 'PROCESSING' | 'DONE' | 'ERROR';
    total: number;
    processed: number;
    errors: number;
    zipUrl?: string | null;
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PALMARÈS
// ─────────────────────────────────────────────────────────────────────────────

export interface PalmaresEntry {
    rank: number;
    student: {
        id: string;
        matricule: string;
        nom: string;
        postNom: string;
        prenom?: string | null;
        photoUrl?: string | null;
    };
    generalAverage: number;
    totalPoints: number;
    decision: DelibDecision;
    mention: string;
}

export interface PalmaresData {
    classId: string;
    className: string;
    termId: string;
    termName: string;
    academicYear: string;
    entries: PalmaresEntry[];
    stats: {
        classAverage: number;
        successRate: number;
        highestAverage: number;
        lowestAverage: number;
        standardDeviation: number;
        totalStudents: number;
    };
    approvedAt?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIMESTRE / ANNÉE SCOLAIRE
// ─────────────────────────────────────────────────────────────────────────────

export interface AcademicTerm {
    id: string;
    name: string;
    number: 1 | 2 | 3;
    startDate: string;
    endDate: string;
    academicYearId: string;
    isActive: boolean;
}

/** Année scolaire pour le module académique (alias de school.types.ts:AcademicYear) */
export interface AcademicYearInfo {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    schoolId: string;
}
