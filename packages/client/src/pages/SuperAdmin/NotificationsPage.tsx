import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Bell, CheckCheck, Trash2, Loader2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    channel: string;
    isRead: boolean;
    createdAt: string;
    schoolId?: string;
}

const TYPE_LABELS: Record<string, string> = {
    PAYMENT_SUCCESS:  'Paiement confirmé',
    PAYMENT_FAILED:   'Paiement échoué',
    NEW_SCHOOL:       'Nouvelle école',
    SUB_EXPIRING_30:  'Expiration 30j',
    SUB_EXPIRING_7:   'Expiration 7j',
    SUB_EXPIRING_1:   'Expiration 1j',
    SMS_QUOTA_80:     'Quota SMS 80%',
    SMS_QUOTA_100:    'Quota SMS 100%',
    ANOMALY:          'Anomalie',
};

const TYPE_COLORS: Record<string, string> = {
    PAYMENT_SUCCESS:  'bg-primary-lighter text-primary',
    PAYMENT_FAILED:   'bg-error-light text-error',
    NEW_SCHOOL:       'bg-info-light text-info',
    SUB_EXPIRING_30:  'bg-accent-light text-accent',
    SUB_EXPIRING_7:   'bg-accent-light text-accent',
    SUB_EXPIRING_1:   'bg-error-light text-error',
    SMS_QUOTA_80:     'bg-accent-light text-accent',
    SMS_QUOTA_100:    'bg-error-light text-error',
    ANOMALY:          'bg-error-light text-error',
};

const CHANNEL_ICONS: Record<string, string> = { IN_APP: '🔔', EMAIL: '📧', SMS: '📱' };

export default function NotificationsPage() {
    const qc = useQueryClient();
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery<{ data: Notification[]; meta: { total: number; totalPages: number; unreadCount: number } }>({
        queryKey: ['sa-notifications', page, unreadOnly],
        queryFn: () => api.get('/superadmin/notifications', { params: { page, limit: 30, unread: unreadOnly } }).then(r => r.data),
    });

    const readAllMutation = useMutation({
        mutationFn: () => api.patch('/superadmin/notifications/read-all'),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-notifications'] }); qc.invalidateQueries({ queryKey: ['sa-notif-count'] }); toast.success('Toutes les notifications marquées comme lues.'); },
    });

    const readMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/superadmin/notifications/${id}/read`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-notifications'] }); qc.invalidateQueries({ queryKey: ['sa-notif-count'] }); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/superadmin/notifications/${id}`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-notifications'] }); qc.invalidateQueries({ queryKey: ['sa-notif-count'] }); toast.success('Notification supprimée.'); },
    });

    const notifs = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
                    <p className="mt-1 text-sm text-neutral-700">
                        {meta?.unreadCount ? <span className="font-semibold text-primary">{meta.unreadCount} non lue{meta.unreadCount > 1 ? 's' : ''}</span> : 'Aucune notification non lue'}
                        {meta?.total ? ` · ${meta.total} au total` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setUnreadOnly(v => !v); setPage(1); }}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${unreadOnly ? 'border-primary bg-primary text-white' : 'border-neutral-300 bg-white hover:bg-neutral-50'}`}
                    >
                        <Filter className="h-4 w-4" /> {unreadOnly ? 'Non lues seulement' : 'Toutes'}
                    </button>
                    {(meta?.unreadCount ?? 0) > 0 && (
                        <button onClick={() => readAllMutation.mutate()} disabled={readAllMutation.isPending} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50">
                            <CheckCheck className="h-4 w-4" /> Tout marquer lu
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 py-16 text-neutral-400">
                    <Bell className="h-10 w-10" />
                    <p className="text-sm">{unreadOnly ? 'Aucune notification non lue.' : 'Aucune notification.'}</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifs.map(n => (
                        <div key={n.id} className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${n.isRead ? 'border-neutral-200 bg-white' : 'border-primary/20 bg-primary-lighter/20'}`}>
                            <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.isRead ? 'bg-neutral-300' : 'bg-primary'}`} />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={`text-sm font-semibold ${n.isRead ? 'text-neutral-700' : 'text-neutral-900'}`}>{n.title}</p>
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[n.type] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                        {TYPE_LABELS[n.type] ?? n.type}
                                    </span>
                                    <span className="text-xs text-neutral-400">{CHANNEL_ICONS[n.channel]} {n.channel}</span>
                                </div>
                                <p className="mt-1 text-sm text-neutral-600">{n.message}</p>
                                <p className="mt-1.5 text-xs text-neutral-400">{new Date(n.createdAt).toLocaleString('fr-FR')}</p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                                {!n.isRead && (
                                    <button onClick={() => readMutation.mutate(n.id)} className="rounded p-1.5 text-neutral-400 hover:bg-primary-lighter hover:text-primary" title="Marquer comme lu">
                                        <CheckCheck className="h-4 w-4" />
                                    </button>
                                )}
                                <button onClick={() => deleteMutation.mutate(n.id)} className="rounded p-1.5 text-neutral-400 hover:bg-error-light hover:text-error" title="Supprimer">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-neutral-500">Page {page} / {meta.totalPages}</p>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 disabled:opacity-40">Préc.</button>
                        <button disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 disabled:opacity-40">Suiv.</button>
                    </div>
                </div>
            )}
        </div>
    );
}
