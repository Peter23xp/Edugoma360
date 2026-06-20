import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import api from '../../lib/api';

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

const TYPE_COLORS: Record<string, string> = {
    PAYMENT_SUCCESS:   'bg-primary-lighter text-primary',
    PAYMENT_FAILED:    'bg-error-light text-error',
    NEW_SCHOOL:        'bg-info-light text-info',
    SUB_EXPIRING_30:   'bg-accent-light text-accent',
    SUB_EXPIRING_7:    'bg-accent-light text-accent',
    SUB_EXPIRING_1:    'bg-error-light text-error',
    SMS_QUOTA_80:      'bg-accent-light text-accent',
    SMS_QUOTA_100:     'bg-error-light text-error',
    ANOMALY:           'bg-error-light text-error',
};

export default function NotificationBell() {
    const qc = useQueryClient();
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const { data: countData } = useQuery<{ count: number }>({
        queryKey: ['sa-notif-count'],
        queryFn: () => api.get('/superadmin/notifications/count').then(r => r.data),
        refetchInterval: 30000,
    });

    const { data: notifsData } = useQuery<{ data: Notification[] }>({
        queryKey: ['sa-notifs-panel'],
        queryFn: () => api.get('/superadmin/notifications?limit=15').then(r => r.data),
        enabled: open,
    });

    const readMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/superadmin/notifications/${id}/read`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-notif-count'] }); qc.invalidateQueries({ queryKey: ['sa-notifs-panel'] }); },
    });

    const readAllMutation = useMutation({
        mutationFn: () => api.patch('/superadmin/notifications/read-all'),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-notif-count'] }); qc.invalidateQueries({ queryKey: ['sa-notifs-panel'] }); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/superadmin/notifications/${id}`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-notifs-panel'] }); qc.invalidateQueries({ queryKey: ['sa-notif-count'] }); },
    });

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
        }
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const count = countData?.count ?? 0;
    const notifs = notifsData?.data ?? [];

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => setOpen(v => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
                        {count > 99 ? '99' : count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl sm:w-96">
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                        <h3 className="text-sm font-semibold text-neutral-900">Notifications {count > 0 && <span className="ml-1 rounded-full bg-error px-1.5 text-[10px] text-white">{count}</span>}</h3>
                        <div className="flex items-center gap-1">
                            {count > 0 && (
                                <button onClick={() => readAllMutation.mutate()} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100" title="Tout marquer lu">
                                    <CheckCheck className="h-3.5 w-3.5" /> Tout lire
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-neutral-100"><X className="h-4 w-4 text-neutral-400" /></button>
                        </div>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100">
                        {notifs.length === 0 && (
                            <div className="flex flex-col items-center gap-2 py-10 text-neutral-400">
                                <Bell className="h-8 w-8" />
                                <p className="text-sm">Aucune notification</p>
                            </div>
                        )}
                        {notifs.map(n => (
                            <div key={n.id} className={`group flex gap-3 px-4 py-3 hover:bg-neutral-50 ${!n.isRead ? 'bg-primary-lighter/20' : ''}`}>
                                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                                <div className="min-w-0 flex-1">
                                    <p className={`text-xs font-semibold ${!n.isRead ? 'text-neutral-900' : 'text-neutral-700'}`}>{n.title}</p>
                                    <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">{n.message}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[n.type] ?? 'bg-neutral-100 text-neutral-500'}`}>{n.type.replace(/_/g, ' ')}</span>
                                        <span className="text-[10px] text-neutral-400">{new Date(n.createdAt).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.isRead && (
                                        <button onClick={() => readMutation.mutate(n.id)} className="rounded p-1 hover:bg-primary-lighter" title="Marquer lu"><Check className="h-3.5 w-3.5 text-primary" /></button>
                                    )}
                                    <button onClick={() => deleteMutation.mutate(n.id)} className="rounded p-1 hover:bg-error-light" title="Supprimer"><Trash2 className="h-3.5 w-3.5 text-error" /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-neutral-200 px-4 py-2">
                        <a href="/superadmin/notifications" className="block text-center text-xs font-medium text-primary hover:underline">Voir toutes les notifications →</a>
                    </div>
                </div>
            )}
        </div>
    );
}
