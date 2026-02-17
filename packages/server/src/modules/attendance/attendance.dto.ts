import { z } from 'zod';

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
