import { RefreshCw, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useSync } from '../../hooks/useSync';
import { useOffline } from '../../hooks/useOffline';
import { formatDate } from '../../lib/utils';

export default function SyncPage() {
    const { syncNow, isSyncing, pendingCount } = useSync();
    const { isOnline, lastSyncAt } = useOffline();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><RefreshCw size={22} /> Synchronisation</h1>

            {/* Status */}
            <div className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={isOnline ? 'online-dot' : 'offline-dot'} />
                        <span className="text-sm font-medium">{isOnline ? 'Connecté au serveur' : 'Mode hors-ligne'}</span>
                    </div>
                    {lastSyncAt && <span className="text-xs text-neutral-400">Dernière sync : {formatDate(new Date(lastSyncAt))}</span>}
                </div>

                <div className="flex items-center gap-3 p-4 bg-neutral-100 rounded-lg">
                    {pendingCount === 0 ? (
                        <><CheckCircle size={20} className="text-success" /><span className="text-sm">Tout est synchronisé</span></>
                    ) : (
                        <><AlertCircle size={20} className="text-warning" /><span className="text-sm"><strong>{pendingCount}</strong> élément(s) en attente de synchronisation</span></>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-3">
                <h3 className="text-sm font-semibold">Actions</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={syncNow} disabled={isSyncing || !isOnline || pendingCount === 0} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
                        <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100 text-danger">
                        <Trash2 size={14} /> Vider le cache local
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="bg-info-bg rounded-lg p-4 text-xs text-info space-y-1">
                <p className="font-medium">Fonctionnement hors-ligne :</p>
                <ul className="list-disc list-inside space-y-0.5">
                    <li>Les notes, présences et paiements sont enregistrés localement</li>
                    <li>La synchronisation se fait automatiquement toutes les 5 minutes</li>
                    <li>En cas de conflit, la version la plus récente est conservée</li>
                    <li>Les données locales sont supprimées après synchronisation réussie</li>
                </ul>
            </div>
        </div>
    );
}
