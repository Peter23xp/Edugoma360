/**
 * Format un nom congolais dans l'ordre officiel : NOM POSTNOM Prénom
 * - NOM : MAJUSCULES
 * - POSTNOM : MAJUSCULES
 * - Prénom : Première lettre majuscule seulement
 */
export function formatStudentName(nom: string, postNom: string, prenom?: string | null): string {
    const parts = [nom.toUpperCase(), postNom.toUpperCase()];
    if (prenom) {
        parts.push(prenom.charAt(0).toUpperCase() + prenom.slice(1));
    }
    return parts.join(' ');
}

/**
 * Retourne les initiales d'un élève (NOM + POSTNOM)
 */
export function getInitials(nom: string, postNom: string): string {
    return `${(nom[0] || '').toUpperCase()}${(postNom[0] || '').toUpperCase()}`;
}
