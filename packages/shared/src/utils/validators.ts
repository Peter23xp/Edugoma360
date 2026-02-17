// ── Validateurs Partagés ─────────────────────────────────────────────────────

import { z } from 'zod';

/**
 * Valide un numéro de téléphone congolais (+243XXXXXXXXX)
 */
export const phoneRegex = /^\+243\d{9}$/;

export function isValidCongoPhone(phone: string): boolean {
    return phoneRegex.test(phone);
}

/**
 * Valide et formatte un numéro de téléphone RDC
 * Accepte: 0812345678, +243812345678, 243812345678
 * Retourne: +243812345678
 */
export function formatCongoPhone(phone: string): string | null {
    // Remove all non-digit except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Handle local format: 0XXXXXXXXX → +243XXXXXXXXX
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = '+243' + cleaned.slice(1);
    }

    // Handle without +: 243XXXXXXXXX → +243XXXXXXXXX
    if (cleaned.startsWith('243') && cleaned.length === 12) {
        cleaned = '+' + cleaned;
    }

    if (phoneRegex.test(cleaned)) {
        return cleaned;
    }

    return null;
}

/**
 * Valide une année académique au format "XXXX-XXXX"
 */
export function isValidAcademicYear(label: string): boolean {
    const match = label.match(/^(\d{4})-(\d{4})$/);
    if (!match) return false;
    const [, start, end] = match;
    return parseInt(end) === parseInt(start) + 1;
}

/**
 * Valide un score (note)
 */
export function isValidScore(score: number, maxScore: number = 20): boolean {
    return score >= 0 && score <= maxScore && Number.isFinite(score);
}

/**
 * Valide une adresse email
 */
export const emailSchema = z.string().email('Adresse email invalide');

/**
 * Schema Zod pour un numéro de téléphone RDC
 */
export const congoPhoneSchema = z
    .string()
    .regex(phoneRegex, 'Format requis: +243XXXXXXXXX');

/**
 * Schema Zod pour une année académique
 */
export const academicYearSchema = z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'Format requis: XXXX-XXXX')
    .refine(isValidAcademicYear, 'L\'année de fin doit suivre l\'année de début');

/**
 * Schema Zod pour un score/note
 */
export function scoreSchema(maxScore: number = 20) {
    return z
        .number()
        .min(0, 'La note ne peut pas être négative')
        .max(maxScore, `La note ne peut pas dépasser ${maxScore}`);
}

/**
 * Sanitize une chaîne de texte (noms, etc.)
 */
export function sanitizeName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
}

/**
 * Vérifie si une chaîne contient uniquement des caractères alphanumériques français
 */
export function isFrenchAlphanumeric(str: string): boolean {
    return /^[a-zA-ZÀ-ÿ0-9\s'-]+$/.test(str);
}

/**
 * Vérifie la force d'un mot de passe
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Au moins 8 caractères requis');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Au moins une lettre majuscule requise');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Au moins une lettre minuscule requise');
    }
    if (!/\d/.test(password)) {
        errors.push('Au moins un chiffre requis');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.push('Au moins un caractère spécial requis');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
