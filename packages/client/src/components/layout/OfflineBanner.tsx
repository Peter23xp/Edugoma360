import { WifiOff, RefreshCw } from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';
import { useSync } from '../../hooks/useSync';

export default function OfflineBanner() {
    const { isOffline, pendingCount } = useOffline();
    const { syncNow, isSyncing } = useSync();

    if (!isOffline) return null;

    return (
        <div className="bg-warning text-white px-4 py-2 flex items-center justify-between text-sm no-print animate-slide-in">
            <div className="flex items-center gap-2">
                <WifiOff size={16} />
                <span className="font-medium">
                    Mode hors-ligne — Les modifications seront synchronisées automatiquement
                </span>
                {pendingCount > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {pendingCount} en attente
                    </span>
                )}
            </div>
            <button
                onClick={syncNow}
                disabled={isSyncing}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-medium transition-colors"
            >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                Réessayer
            </button>
        </div>
    );
}
