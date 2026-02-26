import { z } from 'zod';
import { createTeacherSchema, updateTeacherSchema } from './teachers.validation';

export type CreateTeacherDto = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherDto = z.infer<typeof updateTeacherSchema>;

export interface TeacherFilters {
    search?: string;
    status?: string;
    subjectId?: string;
    section?: string;
    page?: number;
    limit?: number;
}
