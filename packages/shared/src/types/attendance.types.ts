import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────
export type AttendancePeriod = 'MATIN' | 'APRES_MIDI';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'JUSTIFIED' | 'SICK';

// ── Attendance Interface ──────────────────────────────────────────────────────
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

// ── Labels ────────────────────────────────────────────────────────────────────
export const ATTENDANCE_PERIOD_LABELS: Record<AttendancePeriod, string> = {
    MATIN: 'Matin',
    APRES_MIDI: 'Après-midi',
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
    PRESENT: 'Présent',
    ABSENT: 'Absent',
    JUSTIFIED: 'Justifié',
    SICK: 'Malade',
};
