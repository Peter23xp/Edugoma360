import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format a date for display (DD/MM/YYYY) */
export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-CD', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/** Format full name in Congolese order: NOM POSTNOM Prénom */
export function formatStudentName(nom: string, postNom: string, prenom?: string | null): string {
    const parts = [nom.toUpperCase(), postNom.toUpperCase()];
    if (prenom) parts.push(prenom);
    return parts.join(' ');
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '…';
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
    let timer: ReturnType<typeof setTimeout>;
    return ((...args: unknown[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    }) as T;
}

/** Generate initials from name */
export function getInitials(nom: string, postNom: string): string {
    return `${nom.charAt(0)}${postNom.charAt(0)}`.toUpperCase();
}
