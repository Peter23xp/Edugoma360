import { useOfflineStore } from '../stores/offline.store';
import { useEffect, useState } from 'react';
import { getPendingCount } from '../lib/offline/sync';

/**
 * Hook for offline status and pending sync count
 */
export function useOffline() {
    const { isOnline, pendingCount, lastSyncAt, isSyncing } = useOfflineStore();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        getPendingCount().then((count) => {
            useOfflineStore.getState().setPending(count);
            setInitialized(true);
        });
    }, []);

    return {
        isOnline,
        isOffline: !isOnline,
        pendingCount,
        lastSyncAt,
        isSyncing,
        hasPending: pendingCount > 0,
        initialized,
    };
}
