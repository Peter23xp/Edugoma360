/**
 * syncGrades.ts — Moteur de synchronisation des notes offline → serveur
 *
 * Fonctionnement :
 *  1. Récupère les items "pending" dans la queue Dexie
 *  2. Envoie chaque item vers POST /api/grades (ou /api/grades/sync en batch)
 *  3. En cas de conflit (409), signale le conflit pour résolution manuelle
 *  4. En cas d'erreur réseau, conserve l'item dans la queue avec status "error"
 *  5. S'abonne à l'événement "online" pour relancer automatiquement
 */

import api from '../api';
import {
    getPendingQueueItems,
    markAsSyncing,
    markAsError,
    removeFromQueue,
    retryErrorItems,
    type SyncQueueItem,
} from './gradeQueue';

export interface SyncResult {
    synced: number;
    errors: number;
    conflicts: ConflictItem[];
}

export interface ConflictItem {
    queueId: string;
    localData: SyncQueueItem['data'];
    serverData: {
        score: number;
        updatedAt: string;
        updatedByName: string;
    };
}

let isSyncing = false;
let onlineSyncUnsubscribe: (() => void) | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Synchronisation principale
// ─────────────────────────────────────────────────────────────────────────────

export async function syncGrades(): Promise<SyncResult> {
    if (isSyncing) {
        return { synced: 0, errors: 0, conflicts: [] };
    }

    isSyncing = true;
    const result: SyncResult = { synced: 0, errors: 0, conflicts: [] };

    try {
        // 1. Relancer les items en erreur (retry)
        await retryErrorItems();

        // 2. Récupérer tous les items pending
        const pending = await getPendingQueueItems();
        if (pending.length === 0) {
            return result;
        }

        // 3. Traiter chaque item
        for (const item of pending) {
            await markAsSyncing(item.id);

            try {
                await syncSingleItem(item);
                await removeFromQueue(item.id);
                result.synced++;
            } catch (error: unknown) {
                if (isConflictError(error)) {
                    // Conflit 409 : note modifiée par quelqu'un d'autre entre-temps
                    const conflict = extractConflict(item, error);
                    result.conflicts.push(conflict);
                    await markAsError(item.id, `Conflit: note modifiée par ${conflict.serverData.updatedByName}`);
                } else {
                    const msg = error instanceof Error ? error.message : 'Erreur réseau';
                    await markAsError(item.id, msg);
                    result.errors++;
                }
            }
        }
    } finally {
        isSyncing = false;
    }

    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Synchronisation batch (plus efficace pour >5 items)
// ─────────────────────────────────────────────────────────────────────────────

export async function syncGradesBatch(): Promise<SyncResult> {
    if (isSyncing) {
        return { synced: 0, errors: 0, conflicts: [] };
    }

    isSyncing = true;
    const result: SyncResult = { synced: 0, errors: 0, conflicts: [] };

    try {
        await retryErrorItems();
        const pending = await getPendingQueueItems();
        if (pending.length === 0) return result;

        // Marquer tout comme "syncing"
        for (const item of pending) {
            await markAsSyncing(item.id);
        }

        // Envoi batch
        const payload = pending.map((item) => ({
            _queueId: item.id,
            ...item.data,
        }));

        const res = await api.post('/grades/sync', { grades: payload });
        const serverResults = res.data?.results ?? [];

        // Traiter les résultats
        for (const sr of serverResults) {
            if (sr.success) {
                await removeFromQueue(sr._queueId);
                result.synced++;
            } else if (sr.conflict) {
                const original = pending.find((p) => p.id === sr._queueId);
                if (original) {
                    result.conflicts.push({
                        queueId: sr._queueId,
                        localData: original.data,
                        serverData: sr.serverData,
                    });
                    await markAsError(sr._queueId, `Conflit: ${sr.message}`);
                }
            } else {
                await markAsError(sr._queueId, sr.message ?? 'Erreur serveur');
                result.errors++;
            }
        }
    } catch {
        // En cas d'erreur globale (réseau), tout reste "syncing" → sera retried
        isSyncing = false;
    } finally {
        isSyncing = false;
    }

    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Résoudre un conflit : garder la version locale
// ─────────────────────────────────────────────────────────────────────────────

export async function resolveConflictKeepLocal(queueId: string): Promise<void> {
    const items = await getPendingQueueItems();
    const item = items.find((i) => i.id === queueId);
    if (!item) return;

    await markAsSyncing(queueId);
    try {
        await api.post('/grades', { ...item.data, forceOverwrite: true });
        await removeFromQueue(queueId);
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Erreur';
        await markAsError(queueId, msg);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Résoudre un conflit : garder la version serveur
// ─────────────────────────────────────────────────────────────────────────────

export async function resolveConflictKeepServer(queueId: string): Promise<void> {
    await removeFromQueue(queueId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Démarrer le sync automatique au retour de connexion
// ─────────────────────────────────────────────────────────────────────────────

export function startAutoSync(onSync?: (result: SyncResult) => void): void {
    stopAutoSync(); // Éviter les doublons

    const handleOnline = async () => {
        const pending = await getPendingQueueItems();
        if (pending.length === 0) return;

        const result = pending.length > 5
            ? await syncGradesBatch()
            : await syncGrades();

        onSync?.(result);
    };

    window.addEventListener('online', handleOnline);
    onlineSyncUnsubscribe = () => window.removeEventListener('online', handleOnline);

    // Lancer au démarrage si déjà online et items en attente
    if (navigator.onLine) {
        handleOnline();
    }
}

export function stopAutoSync(): void {
    onlineSyncUnsubscribe?.();
    onlineSyncUnsubscribe = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers privés
// ─────────────────────────────────────────────────────────────────────────────

async function syncSingleItem(item: SyncQueueItem): Promise<void> {
    if (item.type === 'grade_create') {
        await api.post('/grades', item.data);
    } else {
        await api.put(`/grades/${item.data.studentId}`, item.data);
    }
}

function isConflictError(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status === 409
    );
}

function extractConflict(item: SyncQueueItem, error: unknown): ConflictItem {
    const serverData = (
        error as { response?: { data?: { serverData?: ConflictItem['serverData'] } } }
    )?.response?.data?.serverData ?? {
        score: 0,
        updatedAt: new Date().toISOString(),
        updatedByName: 'Inconnu',
    };

    return {
        queueId: item.id,
        localData: item.data,
        serverData,
    };
}
