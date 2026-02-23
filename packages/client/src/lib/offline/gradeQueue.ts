import db from './db';

export interface GradeSyncItem {
    id: number;
    type: 'grade_create' | 'grade_update';
    data: {
        studentId: string;
        subjectId: string;
        termId: string;
        evalType: string;
        score: number;
        observation?: string;
    };
    timestamp: number;
    syncStatus: 'pending' | 'syncing' | 'error';
    errorMessage?: string;
}

/**
 * Add a grade to the sync queue
 */
export async function addToGradeQueue(
    type: 'grade_create' | 'grade_update',
    data: GradeSyncItem['data']
): Promise<number> {
    const item: Omit<GradeSyncItem, 'id'> = {
        type,
        data,
        timestamp: Date.now(),
        syncStatus: 'pending',
    };

    const id = await (db.syncQueue as any).add(item);
    return id;
}

/**
 * Get all pending items in the queue
 */
export async function getPendingQueueItems(): Promise<GradeSyncItem[]> {
    return (db.syncQueue as any).where('syncStatus').equals('pending').toArray();
}

/**
 * Get queue count
 */
export async function getQueueCount(): Promise<number> {
    return (db.syncQueue as any).where('syncStatus').equals('pending').count();
}

/**
 * Mark item as syncing
 */
export async function markAsSyncing(id: number): Promise<void> {
    await (db.syncQueue as any).update(id, { syncStatus: 'syncing' });
}

/**
 * Mark item as error
 */
export async function markAsError(id: number, errorMessage: string): Promise<void> {
    await (db.syncQueue as any).update(id, {
        syncStatus: 'error',
        errorMessage,
    });
}

/**
 * Remove item from queue (after successful sync)
 */
export async function removeFromQueue(id: number): Promise<void> {
    await (db.syncQueue as any).delete(id);
}

/**
 * Clear all successfully synced items
 */
export async function clearSyncedItems(): Promise<void> {
    const pending = await (db.syncQueue as any).where('syncStatus').equals('pending').toArray();
    const syncing = await (db.syncQueue as any).where('syncStatus').equals('syncing').toArray();

    // Keep only pending and syncing items
    const keepIds = [...pending, ...syncing].map(item => item.id);

    await (db.syncQueue as any).where('id').noneOf(keepIds).delete();
}

/**
 * Get error items
 */
export async function getErrorItems(): Promise<GradeSyncItem[]> {
    return (db.syncQueue as any).where('syncStatus').equals('error').toArray();
}

/**
 * Retry error items
 */
export async function retryErrorItems(): Promise<void> {
    const errorItems = await getErrorItems();

    for (const item of errorItems) {
        await (db.syncQueue as any).update(item.id, {
            syncStatus: 'pending',
            errorMessage: undefined,
        });
    }
}
