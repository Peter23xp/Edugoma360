import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Loader2, Search, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Subscription {
    id: string;
    schoolId: string;
    school: { id: string; name: string; subdomain: string };
    planId: string | null;
    planName: string;
    startDate: string;
    endDate: string;
    status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'PENDING';
    amountPaid: number;
    currency: string;
    paymentMethod: string | null;
    notes: string | null;
    createdAt: string;
}

interface Plan { id: string; name: string; slug: string; }

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Actif', TRIAL: 'Essai', EXPIRED: 'Expiré', SUSPENDED: 'Suspendu', PENDING: 'En attente' };
const STATUS_STYLES: Record<string, string> = {
    ACTIVE: 'bg-primary-lighter text-primary',
    TRIAL: 'bg-info-light text-info',
    EXPIRED: 'bg-error-light text-error',
    SUSPENDED: 'bg-accent-light text-accent',
    PENDING: 'bg-neutral-100 text-neutral-600',
};

function StatusBadge({ status }: { status: string }) {
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.PENDING}`}>{STATUS_LABELS[status] ?? status}</span>;
}

const RENEW_EMPTY = { planId: '', status: 'ACTIVE' as string, startDate: '', endDate: '', amountPaid: 0, currency: 'USD', notes: '' };

export default function SubscriptionsPage() {
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    const [planFilter, setPlanFilter] = useState('');
    const [renewModal, setRenewModal] = useState<{ open: boolean; schoolId: string; schoolName: string } | null>(null);
    const [renewForm, setRenewForm] = useState(RENEW_EMPTY);

    const { data, isLoading, refetch } = useQuery<{ data: Subscription[]; meta: { total: number; page: number; limit: number; totalPages: number } }>({
        queryKey: ['sa-subscriptions', page, search, status, planFilter],
        queryFn: () => api.get('/superadmin/subscriptions', { params: { page, limit: 20, search, status, planId: planFilter || undefined } }).then(r => r.data),
    });

    const { data: plansData } = useQuery<{ data: Plan[] }>({
        queryKey: ['sa-plans-filter'],
        queryFn: () => api.get('/superadmin/plans').then(r => r.data),
    });

    const renewMutation = useMutation({
        mutationFn: ({ schoolId, body }: { schoolId: string; body: any }) =>
            api.patch(`/superadmin/schools/${schoolId}/subscription`, body).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['sa-subscriptions'] });
            toast.success('Abonnement renouvelé.');
            setRenewModal(null);
        },
        onError: () => toast.error('Erreur lors du renouvellement.'),
    });

    const subs = data?.data ?? [];
    const meta = data?.meta;

    const stats = {
        active: subs.filter(s => s.status === 'ACTIVE').length,
        trial: subs.filter(s => s.status === 'TRIAL').length,
        expired: subs.filter(s => s.status === 'EXPIRED').length,
        pending: subs.filter(s => s.status === 'PENDING').length,
    };

    function openRenew(sub: Subscription) {
        const today = new Date().toISOString().split('T')[0];
        const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        setRenewForm({ planId: sub.planId ?? '', status: 'ACTIVE', startDate: today, endDate: in30, amountPaid: sub.amountPaid, currency: sub.currency, notes: '' });
        setRenewModal({ open: true, schoolId: sub.schoolId, schoolName: sub.school.name });
    }

    function handleRenew(e: React.FormEvent) {
        e.preventDefault();
        if (!renewModal) return;
        renewMutation.mutate({ schoolId: renewModal.schoolId, body: renewForm });
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Abonnements</h1>
                    <p className="mt-1 text-sm text-neutral-700">Vue globale de tous les abonnements plateforme.</p>
                </div>
                <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50">
                    <RefreshCw className="h-4 w-4" /> Actualiser
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                    { label: 'Actifs', count: meta?.total ?? 0, style: 'bg-primary-lighter text-primary' },
                    { label: 'En essai', count: stats.trial, style: 'bg-info-light text-info' },
                    { label: 'Expirés', count: stats.expired, style: 'bg-error-light text-error' },
                    { label: 'En attente', count: stats.pending, style: 'bg-neutral-100 text-neutral-600' },
                ].map(c => (
                    <div key={c.label} className="rounded-lg border border-neutral-200 bg-white p-4">
                        <p className="text-xs font-medium text-neutral-600">{c.label}</p>
                        <p className={`mt-1 text-2xl font-bold tabular-nums ${c.style.split(' ')[1]}`}>{c.count}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher une école..." className="h-9 w-full rounded-md border border-neutral-300 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="h-9 rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none">
                    <option value="ALL">Tous les statuts</option>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }} className="h-9 rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none">
                    <option value="">Tous les plans</option>
                    {plansData?.data.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                {isLoading ? (
                    <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50">
                                <tr>
                                    {['École', 'Plan', 'Statut', 'Début', 'Fin', 'Montant', 'Méthode', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {subs.map(s => (
                                    <tr key={s.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-neutral-900">{s.school.name}</p>
                                            <p className="text-xs text-neutral-500">{s.school.subdomain}</p>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-700">{s.planName}</td>
                                        <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                                        <td className="px-4 py-3 tabular-nums text-neutral-600">{new Date(s.startDate).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-4 py-3 tabular-nums text-neutral-600">{new Date(s.endDate).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-4 py-3 tabular-nums font-medium">{s.amountPaid} {s.currency}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{s.paymentMethod ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => openRenew(s)} className="rounded-md bg-primary-lighter px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors">
                                                Renouveler
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {subs.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">Aucun abonnement trouvé.</p>}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-neutral-600">{meta.total} résultats · page {meta.page}/{meta.totalPages}</p>
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

            {/* Renew Modal */}
            {renewModal?.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                            <div>
                                <h2 className="text-base font-bold text-neutral-900">Renouveler l'abonnement</h2>
                                <p className="text-xs text-neutral-500">{renewModal.schoolName}</p>
                            </div>
                            <button onClick={() => setRenewModal(null)} className="rounded p-1 hover:bg-neutral-100"><X className="h-5 w-5 text-neutral-500" /></button>
                        </div>
                        <form onSubmit={handleRenew} className="space-y-4 p-6">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-neutral-700">Plan</label>
                                <select value={renewForm.planId} onChange={e => setRenewForm(p => ({ ...p, planId: e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none">
                                    <option value="">— Même plan —</option>
                                    {plansData?.data.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-neutral-700">Statut</label>
                                <select value={renewForm.status} onChange={e => setRenewForm(p => ({ ...p, status: e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none">
                                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Début</label>
                                    <input type="date" value={renewForm.startDate} onChange={e => setRenewForm(p => ({ ...p, startDate: e.target.value }))} required className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Fin</label>
                                    <input type="date" value={renewForm.endDate} onChange={e => setRenewForm(p => ({ ...p, endDate: e.target.value }))} required className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Montant payé</label>
                                    <input type="number" min={0} value={renewForm.amountPaid} onChange={e => setRenewForm(p => ({ ...p, amountPaid: +e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Devise</label>
                                    <select value={renewForm.currency} onChange={e => setRenewForm(p => ({ ...p, currency: e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none">
                                        <option>USD</option><option>CDF</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-neutral-700">Notes</label>
                                <textarea value={renewForm.notes} onChange={e => setRenewForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                            </div>
                            <div className="flex justify-end gap-3 border-t border-neutral-100 pt-3">
                                <button type="button" onClick={() => setRenewModal(null)} className="h-9 rounded-md border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50">Annuler</button>
                                <button type="submit" disabled={renewMutation.isPending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
                                    {renewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Appliquer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
