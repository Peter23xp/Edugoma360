import { db } from './db';

export interface SyncQueueItem {
    id: string;
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
    data: SyncQueueItem['data']
): Promise<string> {
    const item: SyncQueueItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
        syncStatus: 'pending',
    };

    await db.syncQueue.add(item);
    return item.id;
}

/**
 * Get all pending items in the queue
 */
export async function getPendingQueueItems(): Promise<SyncQueueItem[]> {
    return db.syncQueue.where('syncStatus').equals('pending').toArray();
}

/**
 * Get queue count
 */
export async function getQueueCount(): Promise<number> {
    return db.syncQueue.where('syncStatus').equals('pending').count();
}

/**
 * Mark item as syncing
 */
export async function markAsSyncing(id: string): Promise<void> {
    await db.syncQueue.update(id, { syncStatus: 'syncing' });
}

/**
 * Mark item as error
 */
export async function markAsError(id: string, errorMessage: string): Promise<void> {
    await db.syncQueue.update(id, {
        syncStatus: 'error',
        errorMessage,
    });
}

/**
 * Remove item from queue (after successful sync)
 */
export async function removeFromQueue(id: string): Promise<void> {
    await db.syncQueue.delete(id);
}

/**
 * Clear all successfully synced items
 */
export async function clearSyncedItems(): Promise<void> {
    const pending = await db.syncQueue.where('syncStatus').equals('pending').toArray();
    const syncing = await db.syncQueue.where('syncStatus').equals('syncing').toArray();
    
    // Keep only pending and syncing items
    const keepIds = [...pending, ...syncing].map(item => item.id);
    
    await db.syncQueue.where('id').noneOf(keepIds).delete();
}

/**
 * Get error items
 */
export async function getErrorItems(): Promise<SyncQueueItem[]> {
    return db.syncQueue.where('syncStatus').equals('error').toArray();
}

/**
 * Retry error items
 */
export async function retryErrorItems(): Promise<void> {
    const errorItems = await getErrorItems();
    
    for (const item of errorItems) {
        await db.syncQueue.update(item.id, {
            syncStatus: 'pending',
            errorMessage: undefined,
        });
    }
}
