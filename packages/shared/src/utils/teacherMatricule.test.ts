import { describe, it, expect } from 'vitest';
import {
    generateTeacherMatricule,
    isValidTeacherMatricule,
    parseTeacherMatricule,
    extractTeacherSequence
} from './teacherMatricule';

describe('Teacher Matricule Utility', () => {
    it('should generate a valid matricule', () => {
        const mat = generateTeacherMatricule(2025, 'NORD-KIVU', 'INSTITUT GOMA', 42);
        // Format: ENS-2025-NK-INS-00042
        expect(mat).toBe('ENS-2025-NK-INS-00042');
    });

    it('should handle small names and default province', () => {
        const mat = generateTeacherMatricule(2024, 'KINSHASA', 'NY', 1);
        expect(mat).toBe('ENS-2024-KN-NY-00001');
    });

    it('should validate correct matricules', () => {
        expect(isValidTeacherMatricule('ENS-2025-NK-GOM-00001')).toBe(true);
        expect(isValidTeacherMatricule('ENS-1999-KN-ABC-12345')).toBe(true);
    });

    it('should reject invalid formats', () => {
        expect(isValidTeacherMatricule('ENS-202-NK-GOM-00001')).toBe(false); // short year
        expect(isValidTeacherMatricule('MAT-2025-NK-GOM-00001')).toBe(false); // wrong prefix
        expect(isValidTeacherMatricule('ENS-2025-NORDKIVU-GOM-00001')).toBe(false); // too long province
    });

    it('should extract sequence correctly', () => {
        expect(extractTeacherSequence('ENS-2025-NK-GOM-00042')).toBe(42);
        expect(extractTeacherSequence('INVALID')).toBe(0);
    });

    it('should parse matricule components', () => {
        const parsed = parseTeacherMatricule('ENS-2025-NK-GOM-00123');
        expect(parsed).toEqual({
            year: '2025',
            province: 'NK',
            school: 'GOM',
            sequence: '00123'
        });
    });
});
