import { useCallback, useEffect, useRef } from 'react';
import { processQueue, startPeriodicSync } from '../lib/offline/sync';
import { useOfflineStore } from '../stores/offline.store';
import toast from 'react-hot-toast';

/**
 * Hook to manage sync lifecycle
 */
export function useSync() {
    const { isOnline, isSyncing, pendingCount } = useOfflineStore();
    const cleanupRef = useRef<(() => void) | null>(null);

    // Start periodic sync
    useEffect(() => {
        cleanupRef.current = startPeriodicSync(5 * 60 * 1000);
        return () => cleanupRef.current?.();
    }, []);

    // Auto-sync when coming back online
    useEffect(() => {
        if (isOnline && pendingCount > 0) {
            syncNow();
        }
    }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

    const syncNow = useCallback(async () => {
        if (isSyncing) return;
        useOfflineStore.getState().setSyncing(true);
        try {
            const result = await processQueue();
            if (result.synced > 0) {
                toast.success(`${result.synced} élément(s) synchronisé(s)`);
            }
            if (result.failed > 0) {
                toast.error(`${result.failed} erreur(s) de synchronisation`);
            }
            useOfflineStore.getState().setLastSync(Date.now());
        } catch {
            toast.error('Erreur de synchronisation');
        } finally {
            useOfflineStore.getState().setSyncing(false);
        }
    }, [isSyncing]);

    return { syncNow, isSyncing, pendingCount };
}
