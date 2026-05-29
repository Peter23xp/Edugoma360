/**
 * Helpers de normalisation des réponses API EduGoma 360.
 *
 * Chaque endpoint peut retourner des formes différentes :
 *   { classes: [...] }   { data: [...] }   [...] directement   { class: {...} }
 *
 * Ces fonctions extraient de manière robuste la donnée utile
 * quelle que soit la forme de la réponse.
 */

/** Extrait un tableau depuis une réponse API, quelle que soit sa forme. */
export function toList(data: any, ...keys: string[]): any[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    for (const key of keys) {
        if (Array.isArray(data[key])) return data[key];
    }
    // Fallback générique : chercher le premier champ tableau
    for (const val of Object.values(data)) {
        if (Array.isArray(val)) return val as any[];
    }
    return [];
}

/** Extrait un objet unique depuis une réponse API. */
export function toObject(data: any, ...keys: string[]): any {
    if (!data) return null;
    if (typeof data === 'object' && !Array.isArray(data)) {
        for (const key of keys) {
            if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
                return data[key];
            }
        }
    }
    return data;
}

// ── Fonctions spécialisées par domaine ───────────────────────────────────────

export const normalize = {
    /** GET /classes → { classes: [...] } */
    classes:  (d: any) => toList(d, 'classes', 'data'),

    /** GET /classes/:id → { class: {...} } */
    class:    (d: any) => toObject(d, 'class', 'data'),

    /** GET /settings/terms → { data: [...] }  — chaque terme a { id, label, number, ... } (pas "name") */
    terms:    (d: any) => toList(d, 'data', 'terms'),

    /** GET /students → { data: [...], total, page... } */
    students: (d: any) => toList(d, 'data', 'students'),

    /** GET /grades → { grades: [...] } */
    grades:   (d: any) => toList(d, 'grades', 'data'),

    /** GET /teachers → { data: [...] } ou [...] */
    teachers: (d: any) => toList(d, 'data', 'teachers'),

    /** GET /sections → [...] ou { data: [...] } */
    sections: (d: any) => toList(d, 'data', 'sections'),

    /** GET /subjects → [...] ou { data: [...] } */
    subjects: (d: any) => toList(d, 'data', 'subjects'),

    /** GET /academic-years → { data: [...] } */
    academicYears: (d: any) => toList(d, 'data', 'academicYears'),

    /** GET /payments → { data: [...] } */
    payments: (d: any) => toList(d, 'data', 'payments'),

    /**
     * Matières d'une classe = uniquement celles avec un enseignant assigné (teacherAssignments).
     * Fallback sur section.subjects si aucune affectation (classe non configurée).
     */
    classSubjects: (classData: any): any[] => {
        // Priorité : matières réellement affectées à cette classe
        const fromAssignments = (classData?.teacherAssignments ?? [])
            .map((a: any) => a.subject)
            .filter(Boolean);

        if (fromAssignments.length > 0) {
            // Dédoublonnage (un sujet peut avoir plusieurs profs)
            return Array.from(new Map(fromAssignments.map((s: any) => [s.id, s])).values());
        }

        // Fallback : toutes les matières de la section (classe non encore configurée)
        const fromSection = (classData?.section?.subjects ?? [])
            .map((ss: any) => ss.subject)
            .filter(Boolean);
        return Array.from(new Map(fromSection.map((s: any) => [s.id, s])).values());
    },
};
