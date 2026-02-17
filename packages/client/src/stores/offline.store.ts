import { create } from 'zustand';

interface OfflineState {
    isOnline: boolean;
    pendingCount: number;
    lastSyncAt: number | null;
    isSyncing: boolean;

    setOnline: (value: boolean) => void;
    setPending: (count: number) => void;
    incrementPending: () => void;
    decrementPending: () => void;
    setSyncing: (value: boolean) => void;
    setLastSync: (timestamp: number) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
    isOnline: navigator.onLine,
    pendingCount: 0,
    lastSyncAt: null,
    isSyncing: false,

    setOnline: (value) => set({ isOnline: value }),
    setPending: (count) => set({ pendingCount: count }),
    incrementPending: () => set((s) => ({ pendingCount: s.pendingCount + 1 })),
    decrementPending: () => set((s) => ({ pendingCount: Math.max(0, s.pendingCount - 1) })),
    setSyncing: (value) => set({ isSyncing: value }),
    setLastSync: (timestamp) => set({ lastSyncAt: timestamp }),
}));

// ── Listen for online/offline events ──────────────────────────────────────
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => useOfflineStore.getState().setOnline(true));
    window.addEventListener('offline', () => useOfflineStore.getState().setOnline(false));
}
