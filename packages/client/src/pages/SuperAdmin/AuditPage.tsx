import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Loader2, Search, RefreshCw, ChevronLeft, ChevronRight, Activity, Shield, CreditCard, UserPlus, Download, LogIn, Zap } from 'lucide-react';

interface AuditLog {
    id: string;
    actorId: string | null;
    actorRole: string | null;
    actorName: string | null;
    schoolId: string | null;
    schoolName: string | null;
    action: string;
    entity: string | null;
    entityId: string | null;
    summary: string;
    ip: string | null;
    createdAt: string;
}

const ACTION_ICONS: Record<string, any> = {
    LOGIN: LogIn, LOGOUT: LogIn, LOGIN_FAILED: Shield,
    SUSPEND: Shield, ACTIVATE: Zap,
    SUBSCRIPTION_UPDATE: CreditCard, PAYMENT: CreditCard,
    ADMIN_CREATE: UserPlus, ADMIN_PERMISSIONS_UPDATE: Shield,
    EXPORT: Download, NEW_SCHOOL: Activity,
};

const ACTION_COLORS: Record<string, string> = {
    LOGIN: 'bg-info-light text-info',
    LOGOUT: 'bg-neutral-100 text-neutral-500',
    LOGIN_FAILED: 'bg-error-light text-error',
    SUSPEND: 'bg-error-light text-error',
    ACTIVATE: 'bg-primary-lighter text-primary',
    SUBSCRIPTION_UPDATE: 'bg-accent-light text-accent',
    PAYMENT: 'bg-primary-lighter text-primary',
    ADMIN_CREATE: 'bg-info-light text-info',
    ADMIN_PERMISSIONS_UPDATE: 'bg-accent-light text-accent',
    EXPORT: 'bg-neutral-100 text-neutral-600',
    NEW_SCHOOL: 'bg-primary-lighter text-primary',
};

const ACTIONS = ['ALL', 'LOGIN', 'LOGIN_FAILED', 'SUSPEND', 'ACTIVATE', 'SUBSCRIPTION_UPDATE', 'PAYMENT', 'ADMIN_CREATE', 'EXPORT', 'NEW_SCHOOL'];

export default function AuditPage() {
    const [page, setPage]         = useState(1);
    const [search, setSearch]     = useState('');
    const [action, setAction]     = useState('ALL');
    const [liveMode, setLiveMode] = useState(false);
    const sinceRef                = useRef<string>(new Date().toISOString());

    const { data, isLoading, refetch } = useQuery<{ data: AuditLog[]; meta: any }>({
        queryKey: ['sa-audit', page, search, action],
        queryFn: () => api.get('/superadmin/audit', { params: { page, limit: 50, search, action } }).then(r => r.data),
    });

    const { data: liveData, refetch: refetchLive } = useQuery<{ data: AuditLog[] }>({
        queryKey: ['sa-audit-live'],
        queryFn: () => api.get('/superadmin/audit/recent', { params: { since: sinceRef.current } }).then(r => r.data),
        enabled: liveMode,
        refetchInterval: liveMode ? 10000 : false,
    });

    useEffect(() => {
        if (liveData?.data?.length) {
            sinceRef.current = liveData.data[0].createdAt;
            refetch();
        }
    }, [liveData]);

    const logs = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Audit & Activité</h1>
                    <p className="mt-1 text-sm text-neutral-700">Journal de toutes les actions critiques de la plateforme.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setLiveMode(v => !v)}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${liveMode ? 'border-primary bg-primary text-white' : 'border-neutral-300 bg-white hover:bg-neutral-50'}`}
                    >
                        <Activity className="h-4 w-4" />
                        {liveMode ? 'Live actif' : 'Mode live'}
                    </button>
                    <button onClick={() => refetch()} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50">
                        <RefreshCw className="h-4 w-4" /> Actualiser
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher dans les actions..." className="h-9 w-full rounded-md border border-neutral-300 pl-9 pr-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <select value={action} onChange={e => { setAction(e.target.value); setPage(1); }} className="h-9 rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none">
                    {ACTIONS.map(a => <option key={a} value={a}>{a === 'ALL' ? 'Toutes les actions' : a.replace(/_/g, ' ')}</option>)}
                </select>
            </div>

            {/* Live indicator */}
            {liveMode && (
                <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary-lighter px-4 py-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <p className="text-xs font-medium text-primary">Mode live activé — rafraîchissement toutes les 10 secondes</p>
                </div>
            )}

            {/* Logs timeline */}
            {isLoading ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
                <div className="space-y-2">
                    {logs.map(log => {
                        const Icon  = ACTION_ICONS[log.action] ?? Activity;
                        const color = ACTION_COLORS[log.action] ?? 'bg-neutral-100 text-neutral-500';
                        return (
                            <div key={log.id} className="flex items-start gap-4 rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${color}`}>{log.action.replace(/_/g, ' ')}</span>
                                        {log.entity && <span className="text-xs text-neutral-500">{log.entity}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ''}</span>}
                                    </div>
                                    <p className="mt-0.5 text-sm text-neutral-800">{log.summary}</p>
                                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-400">
                                        {log.actorName  && <span>👤 {log.actorName} ({log.actorRole})</span>}
                                        {log.schoolName && <span>🏫 {log.schoolName}</span>}
                                        {log.ip         && <span>🌐 {log.ip}</span>}
                                        <span>🕐 {new Date(log.createdAt).toLocaleString('fr-FR')}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {logs.length === 0 && (
                        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 py-16 text-neutral-400">
                            <Activity className="h-10 w-10" />
                            <p className="text-sm">Aucune activité trouvée.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-neutral-500">{meta.total} entrées · page {page}/{meta.totalPages}</p>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="inline-flex h-8 items-center gap-1 rounded-md border border-neutral-300 px-3 text-xs font-medium hover:bg-neutral-50 disabled:opacity-40">
                            <ChevronLeft className="h-3.5 w-3.5" /> Préc.
                        </button>
                        <button disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)} className="inline-flex h-8 items-center gap-1 rounded-md border border-neutral-300 px-3 text-xs font-medium hover:bg-neutral-50 disabled:opacity-40">
                            Suiv. <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
