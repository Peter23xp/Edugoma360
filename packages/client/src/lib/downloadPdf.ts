import api from './api';

/**
 * Télécharge un PDF depuis l'API (avec le token Authorization)
 * et l'ouvre dans le navigateur via un lien <a> temporaire.
 * Évite le 401 (window.open ne joint pas les headers)
 * et le bloqueur de popups (blob URL dans window.open bloqué).
 */
export async function openPdfFromApi(url: string, _filename = 'document.pdf'): Promise<void> {
    try {
        const response = await api.get(url, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';         // essaie d'ouvrir dans un onglet
        a.rel = 'noopener';
        // pas de 'download' : laisse le navigateur afficher le PDF
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Libérer la mémoire après un délai
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 30000);
    } catch (e) {
        console.error('Erreur téléchargement PDF:', e);
        throw e;
    }
}
