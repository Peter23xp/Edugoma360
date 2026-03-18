import { z } from 'zod';

// ── Legacy batch DTO ──────────────────────────────────────────────────────────
export const CreateAttendanceDto = z.object({
    studentId: z.string().uuid(),
    classId: z.string().uuid(),
    termId: z.string().uuid(),
    date: z.string(),
    period: z.enum(['MATIN', 'APRES_MIDI']),
    status: z.enum(['PRESENT', 'ABSENT', 'JUSTIFIED', 'SICK']),
    justification: z.string().optional(),
});

export const BatchAttendanceDto = z.object({
    attendances: z.array(CreateAttendanceDto).min(1),
});

// ── NEW: Daily Roll Call DTO ──────────────────────────────────────────────────
export const RollCallRecordDto = z.object({
    studentId: z.string().uuid(),
    status: z.enum(['PRESENT', 'ABSENT', 'RETARD', 'JUSTIFIED', 'SICK']),
    remark: z.string().optional(),
    arrivalTime: z.string().optional(), // HH:MM
    isJustified: z.boolean().optional().default(false),
});

export const SaveDailyRollCallDto = z.object({
    classId: z.string().uuid('classId doit être un UUID valide'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date au format YYYY-MM-DD'),
    period: z.enum(['MATIN', 'APRES_MIDI', 'SOIR']),
    termId: z.string().uuid().optional(),
    records: z.array(RollCallRecordDto).min(1, 'Au moins un enregistrement requis'),
});

export type SaveDailyRollCallInput = z.infer<typeof SaveDailyRollCallDto>;
