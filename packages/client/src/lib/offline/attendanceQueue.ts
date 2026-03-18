/**
 * Attendance Queue — Offline-first roll call operations
 * Uses the existing EduGoma360 Dexie database (attendances table + syncQueue)
 */
import db from './db';

export type RollCallPeriod = 'MATIN' | 'APRES_MIDI' | 'SOIR';
export type RollCallStatus = 'PRESENT' | 'ABSENT' | 'RETARD' | 'JUSTIFIED' | 'SICK';

export interface RollCallRecord {
    studentId: string;
    status: RollCallStatus;
    remark?: string;
    arrivalTime?: string; // HH:MM if late
    isJustified: boolean;
}

export interface AttendanceQueueItem {
    date: string;         // ISO date YYYY-MM-DD
    classId: string;
    termId: string;
    period: RollCallPeriod;
    records: RollCallRecord[];
    recordedById: string;
    createdAt: string;
}

/**
 * Save a full roll call batch to offline queue
 */
export async function saveRollCallOffline(item: AttendanceQueueItem): Promise<void> {
    const { date, classId, termId, period, records, recordedById } = item;

    // Upsert each student's attendance into the offline attendances table
    for (const record of records) {
        await db.attendances.put({
            studentId: record.studentId,
            classId,
            termId,
            date,
            period: period === 'SOIR' ? 'APRES_MIDI' : period, // Map SOIR → APRES_MIDI for DB compat
            status: mapStatus(record.status),
            justification: record.remark,
            recordedById,
            syncStatus: 'PENDING',
            localUpdatedAt: Date.now(),
        });
    }

    // Enqueue single sync operation for the whole batch
    await db.syncQueue.add({
        entityType: 'attendance',
        entityId: `${classId}-${date}-${period}`,
        action: 'create',
        payload: JSON.stringify(item),
        attempts: 0,
        syncStatus: 'pending',
        createdAt: Date.now(),
    });
}

/**
 * Get pending roll call count for badge display
 */
export async function getPendingRollCallCount(): Promise<number> {
    return db.syncQueue
        .where('entityType')
        .equals('attendance')
        .and((item) => item.syncStatus === 'pending')
        .count();
}

/**
 * Get all pending roll call items for sync
 */
export async function getPendingRollCalls(): Promise<Array<{ id: number; payload: AttendanceQueueItem }>> {
    const items = await db.syncQueue
        .where('entityType')
        .equals('attendance')
        .and((item) => item.syncStatus === 'pending')
        .toArray();

    return items.map((item) => ({
        id: item.id!,
        payload: JSON.parse(item.payload) as AttendanceQueueItem,
    }));
}

/**
 * Mark a queued item as synced and remove it
 */
export async function markRollCallSynced(id: number): Promise<void> {
    await db.syncQueue.delete(id);
}

/**
 * Mark a queued item as error
 */
export async function markRollCallError(id: number, errorMsg: string): Promise<void> {
    await db.syncQueue.update(id, {
        syncStatus: 'error',
        errorMsg,
        lastAttemptAt: Date.now(),
    });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapStatus(status: RollCallStatus): 'PRESENT' | 'ABSENT' | 'JUSTIFIED' | 'SICK' {
    switch (status) {
        case 'PRESENT':    return 'PRESENT';
        case 'ABSENT':     return 'ABSENT';
        case 'RETARD':     return 'JUSTIFIED'; // stored as JUSTIFIED with arrivalTime
        case 'JUSTIFIED':  return 'JUSTIFIED';
        case 'SICK':       return 'SICK';
    }
}
