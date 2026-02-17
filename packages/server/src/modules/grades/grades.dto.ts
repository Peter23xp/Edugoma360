import { z } from 'zod';

export const CreateGradeDto = z.object({
    studentId: z.string().uuid(),
    subjectId: z.string().uuid(),
    termId: z.string().uuid(),
    evalType: z.enum(['INTERROGATION', 'TP', 'EXAMEN_TRIMESTRIEL', 'EXAMEN_SYNTHESE']),
    score: z.number().min(0),
    maxScore: z.number().int().min(1).default(20),
    observation: z.string().optional(),
});

export const BatchGradeDto = z.object({
    grades: z.array(CreateGradeDto).min(1, 'Au moins une note requise'),
});

export const GradeQueryDto = z.object({
    classId: z.string().uuid().optional(),
    subjectId: z.string().uuid().optional(),
    termId: z.string().uuid().optional(),
    evalType: z.enum(['INTERROGATION', 'TP', 'EXAMEN_TRIMESTRIEL', 'EXAMEN_SYNTHESE']).optional(),
    studentId: z.string().uuid().optional(),
});
