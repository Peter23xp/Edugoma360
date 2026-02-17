import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useSync } from '../../hooks/useSync';

export default function SyncIndicator() {
    const { isSyncing, pendingCount, syncNow } = useSync();

    if (pendingCount === 0 && !isSyncing) {
        return (
            <span className="flex items-center gap-1 text-xs text-success">
                <Check size={12} /> Synchronisé
            </span>
        );
    }

    return (
        <button
            onClick={syncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-secondary-dark transition-colors"
        >
            {isSyncing ? (
                <RefreshCw size={12} className="animate-spin" />
            ) : (
                <AlertCircle size={12} />
            )}
            {isSyncing ? 'Synchronisation...' : `${pendingCount} à synchroniser`}
        </button>
    );
}
