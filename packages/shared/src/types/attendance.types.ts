import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────
/** Legacy periods (stored in DB) */
export type AttendancePeriod = 'MATIN' | 'APRES_MIDI';

/** Extended periods for UI (SOIR maps to APRES_MIDI in DB) */
export type RollCallPeriod = 'MATIN' | 'APRES_MIDI' | 'SOIR';

/** Legacy statuses (stored in DB) */
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'JUSTIFIED' | 'SICK';

/** Roll-call statuses shown in UI */
export type RollCallStatus = 'PRESENT' | 'ABSENT' | 'RETARD';

// ── Student for roll call ─────────────────────────────────────────────────────
export interface RollCallStudent {
    id: string;
    matricule: string;
    nom: string;
    postNom: string;
    prenom?: string;
    photoUrl?: string;
}

// ── Single student attendance entry ──────────────────────────────────────────
export interface StudentAttendanceEntry {
    studentId: string;
    student: RollCallStudent;
    status?: RollCallStatus;
    remark?: string;
    arrivalTime?: string; // HH:MM if RETARD
    isJustified: boolean;
}

// ── Full daily roll call response ────────────────────────────────────────────
export interface DailyRollCallResponse {
    classId: string;
    className: string;
    date: string;
    period: string;
    students: StudentAttendanceEntry[];
    stats: {
        total: number;
        present: number;
        absent: number;
        late: number;
    };
    isLocked: boolean;
}

// ── Attendance Interface (legacy) ─────────────────────────────────────────────
export interface Attendance {
    id: string;
    studentId: string;
    classId: string;
    termId: string;
    date: Date | string;
    period: AttendancePeriod;
    status: AttendanceStatus;
    justification?: string | null;
    syncStatus: 'SYNCED' | 'PENDING' | 'CONFLICT';
    recordedById: string;
    createdAt: Date | string;
}

// ── Attendance Summary ────────────────────────────────────────────────────────
export interface AttendanceSummary {
    studentId: string;
    studentName: string;
    totalPresent: number;
    totalAbsent: number;
    totalJustified: number;
    totalSick: number;
    totalDays: number;
    attendanceRate: number; // Percentage
}

// ── Absence History ──────────────────────────────────────────────────────────
export interface AbsenceHistoryItem {
    id: string;
    date: string;
    period: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'MATIN' | 'APRES_MIDI' | 'SOIR'; // Accommodate backend format
    student: {
        id: string;
        matricule: string;
        nom: string;
        postNom: string;
        prenom?: string;
        photoUrl?: string;
    };
    class: {
        id: string;
        name: string;
    };
    status: 'ABSENT' | 'LATE' | 'RETARD'; // Map to frontend 'LATE' or 'RETARD'
    remark?: string;
    arrivalTime?: string;
    isJustified: boolean;
    justificationFile?: string;
    createdBy: {
        id: string;
        nom: string;
        role: string;
    };
}

export interface AbsenceHistoryResponse {
    data: AbsenceHistoryItem[];
    total: number;
    page: number;
    pages: number;
    stats: {
        totalAbsences: number;
        justified: number;
        notJustified: number;
        lates: number;
    };
}

export interface StudentAbsenceStatsResponse {
    studentId: string;
    period: number;
    stats: {
        totalAbsences: number;
        justifiedAbsences: number;
        notJustifiedAbsences: number;
        totalLates: number;
        attendanceRate: number;
    };
    recentAbsences: Array<{
        date: string;
        period: string;
        status: string;
        isJustified: boolean;
    }>;
}

// ── Zod Schemas ───────────────────────────────────────────────────────────────
export const CreateAttendanceSchema = z.object({
    studentId: z.string().uuid(),
    classId: z.string().uuid(),
    termId: z.string().uuid(),
    date: z.string().or(z.date()),
    period: z.enum(['MATIN', 'APRES_MIDI']),
    status: z.enum(['PRESENT', 'ABSENT', 'JUSTIFIED', 'SICK']),
    justification: z.string().optional(),
});

export type CreateAttendanceInput = z.infer<typeof CreateAttendanceSchema>;

export const BatchAttendanceSchema = z.object({
    attendances: z.array(CreateAttendanceSchema).min(1, 'Au moins une présence requise'),
});

export type BatchAttendanceInput = z.infer<typeof BatchAttendanceSchema>;

// ── Roll Call Schemas ─────────────────────────────────────────────────────────
export const RollCallRecordSchema = z.object({
    studentId: z.string().uuid(),
    status: z.enum(['PRESENT', 'ABSENT', 'RETARD']),
    remark: z.string().optional(),
    arrivalTime: z.string().optional(),
    isJustified: z.boolean().default(false),
});

export const SaveRollCallSchema = z.object({
    classId: z.string().uuid(),
    date: z.string(),
    period: z.enum(['MATIN', 'APRES_MIDI', 'SOIR']),
    termId: z.string().uuid().optional(),
    records: z.array(RollCallRecordSchema).min(1),
});

export type RollCallRecord = z.infer<typeof RollCallRecordSchema>;
export type SaveRollCallInput = z.infer<typeof SaveRollCallSchema>;

// ── Justification Schema ──────────────────────────────────────────────────────
export const UpdateJustificationSchema = z.object({
    isJustified: z.boolean(),
    remark: z.string().optional(),
    justificationFile: z.string().optional(), // Ou un objet File coté client
});

export type UpdateJustificationInput = z.infer<typeof UpdateJustificationSchema>;

// ── Labels ────────────────────────────────────────────────────────────────────
export const ATTENDANCE_PERIOD_LABELS: Record<AttendancePeriod, string> = {
    MATIN: 'Matin',
    APRES_MIDI: 'Après-midi',
};

export const ROLL_CALL_PERIOD_LABELS: Record<RollCallPeriod, string> = {
    MATIN: 'Matin (7h30–12h30)',
    APRES_MIDI: 'Après-midi (12h30–17h)',
    SOIR: 'Soir (17h–20h)',
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
    PRESENT: 'Présent',
    ABSENT: 'Absent',
    JUSTIFIED: 'Justifié',
    SICK: 'Malade',
};

export const ROLL_CALL_STATUS_LABELS: Record<RollCallStatus, string> = {
    PRESENT: 'Présent',
    ABSENT: 'Absent',
    RETARD: 'En retard',
};

// ── Justifications (SCR-030) ──────────────────────────────────────────────────
export type JustificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type JustificationReason = 'MALADIE' | 'DECES_FAMILIAL' | 'RENDEZ_VOUS_MEDICAL' | 'AUTRE';

export interface JustificationData {
    id: string;
    attendanceRecordId: string;
    student: {
        id: string;
        matricule: string;
        nom: string;
        postNom: string;
        prenom?: string;
        photoUrl?: string;
        class: { name: string };
    };
    absence: {
        date: string;
        period: string;
    };
    reason: JustificationReason;
    reasonDetails: string;
    documentUrl: string;
    documentName: string;
    documentSize: number;
    status: JustificationStatus;
    submittedBy: {
        id: string;
        nom: string;
        relationship: string;
        phone: string;
    };
    submittedAt: string;
    reviewedBy?: {
        id: string;
        nom: string;
        role: string;
    };
    reviewedAt?: string;
    reviewComment?: string;
    rejectionReason?: string;
}

export interface JustificationsResponse {
    data: JustificationData[];
    total: number;
    page: number;
    pages: number;
    stats: {
        pending: number;
        approved: number;
        rejected: number;
        expired: number;
    };
}

