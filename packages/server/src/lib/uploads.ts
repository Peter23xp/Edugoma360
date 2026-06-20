import path from 'path';
import fs from 'fs';

/**
 * Source unique de vérité pour le dossier des fichiers générés/téléversés.
 *
 * IMPORTANT : doit correspondre EXACTEMENT au montage statique dans app.ts
 *   app.use('/uploads', express.static(UPLOADS_ROOT))
 *
 * Tout module qui écrit un fichier destiné à être servi via `/uploads/...`
 * DOIT passer par `ensureUploadDir()` / `uploadUrl()` ci-dessous, sinon le
 * fichier est écrit hors du dossier servi et renvoie un 404 au client.
 */
export const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');

/**
 * Garantit l'existence d'un sous-dossier de `uploads/` et renvoie son chemin absolu.
 * Ex: ensureUploadDir('bulletins') -> <UPLOADS_ROOT>/bulletins (créé si absent).
 */
export function ensureUploadDir(...sub: string[]): string {
    const dir = path.join(UPLOADS_ROOT, ...sub);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

/**
 * Construit l'URL publique correspondante (toujours en slashes web).
 * Ex: uploadUrl('bulletins', 'x.pdf') -> '/uploads/bulletins/x.pdf'
 */
export function uploadUrl(...parts: string[]): string {
    return '/uploads/' + parts.map((p) => p.replace(/\\/g, '/')).join('/');
}
