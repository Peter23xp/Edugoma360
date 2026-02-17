import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';

export default function ApiStatus() {
    const { isOnline, isSyncing, pendingCount } = useOffline();

    return (
        <div className="flex items-center gap-2 text-xs">
            {isOnline ? (
                <span className="flex items-center gap-1 text-success">
                    <Wifi size={12} /> API OK
                </span>
            ) : (
                <span className="flex items-center gap-1 text-warning">
                    <WifiOff size={12} /> Hors-ligne
                </span>
            )}
            {isSyncing && (
                <span className="flex items-center gap-1 text-info">
                    <Loader2 size={12} className="animate-spin" /> Sync...
                </span>
            )}
            {pendingCount > 0 && (
                <span className="bg-secondary/10 text-secondary px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    {pendingCount} en attente
                </span>
            )}
        </div>
    );
}
