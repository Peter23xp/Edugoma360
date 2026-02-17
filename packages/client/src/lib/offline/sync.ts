import db, { type SyncQueueItem } from './db';
import api from '../api';
import { useOfflineStore } from '../../stores/offline.store';

const BATCH_SIZE = 100;

/**
 * Add an item to the sync queue
 */
export async function enqueueSync(
    entityType: SyncQueueItem['entityType'],
    entityId: string,
    action: SyncQueueItem['action'],
    payload: Record<string, unknown>,
): Promise<void> {
    await db.syncQueue.add({
        entityType,
        entityId,
        action,
        payload: JSON.stringify(payload),
        attempts: 0,
        createdAt: Date.now(),
    });
    useOfflineStore.getState().incrementPending();
}

/**
 * Process the sync queue — sends pending items to the server
 */
export async function processQueue(): Promise<{ synced: number; failed: number }> {
    const items = await db.syncQueue
        .where('attempts')
        .below(5)
        .limit(BATCH_SIZE)
        .toArray();

    if (items.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;

    for (const item of items) {
        try {
            const payload = JSON.parse(item.payload);

            switch (item.entityType) {
                case 'grade':
                    if (item.action === 'create' || item.action === 'update') {
                        await api.post('/sync/grades', { items: [payload] });
                    }
                    break;
                case 'attendance':
                    if (item.action === 'create' || item.action === 'update') {
                        await api.post('/sync/attendance', { items: [payload] });
                    }
                    break;
                case 'payment':
                    if (item.action === 'create') {
                        await api.post('/finance/payments', payload);
                    }
                    break;
                case 'student':
                    if (item.action === 'create') {
                        await api.post('/students', payload);
                    } else if (item.action === 'update') {
                        await api.put(`/students/${item.entityId}`, payload);
                    }
                    break;
            }

            // Success — remove from queue
            await db.syncQueue.delete(item.id!);
            synced++;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            await db.syncQueue.update(item.id!, {
                attempts: item.attempts + 1,
                lastAttemptAt: Date.now(),
                errorMsg: msg,
            });
            failed++;
        }
    }

    useOfflineStore.getState().setPending(
        await db.syncQueue.count(),
    );

    return { synced, failed };
}

/**
 * Get the number of pending items in the sync queue
 */
export async function getPendingCount(): Promise<number> {
    return db.syncQueue.count();
}

/**
 * Clear all synced items from offline tables
 */
export async function clearSyncedData(): Promise<void> {
    await db.grades.where('syncStatus').equals('SYNCED').delete();
    await db.attendances.where('syncStatus').equals('SYNCED').delete();
    await db.payments.where('syncStatus').equals('SYNCED').delete();
}

/**
 * Start the periodic sync process
 */
export function startPeriodicSync(intervalMs: number = 5 * 60 * 1000): () => void {
    const interval = setInterval(async () => {
        if (navigator.onLine) {
            await processQueue();
        }
    }, intervalMs);

    return () => clearInterval(interval);
}
