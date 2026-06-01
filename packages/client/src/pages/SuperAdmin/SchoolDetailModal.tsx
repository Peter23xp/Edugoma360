import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Calendar, CheckCircle, CreditCard, Loader2, MessageSquare, Users, X } from 'lucide-react';

interface SubscriptionHistory {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    amountPaid: number;
    currency: string;
    paymentMethod: string | null;
    notes: string | null;
    createdAt: string;
}

interface SchoolDetail {
    id: string;
    name: string;
    subdomain: string | null;
    telephone: string | null;
    email: string | null;
    ville: string;
    province: string;
    plan: { id: string; name: string; slug: string; maxStudents: number; maxSmsPerMonth: number } | null;
    subscriptions: SubscriptionHistory[];
    _count: { students: number; teachers: number; users: number };
    smsThisMonth: number;
    createdAt: string;
}

interface Plan { id: string; name: string; slug: string; }
interface Props { schoolId: string; onClose: () => void; }

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Actif',
    TRIAL: 'Essai',
    EXPIRED: 'Expiré',
    SUSPENDED: 'Suspendu',
    PENDING: 'En attente',
};

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: 'bg-primary-lighter text-primary',
    TRIAL: 'bg-info-light text-info',
    EXPIRED: 'bg-error-light text-error',
    SUSPENDED: 'bg-accent-light text-accent',
    PENDING: 'bg-neutral-100 text-neutral-700',
};

function Badge({ status }: { status: string }) {
    return (
        <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.PENDING}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

export default function SchoolDetailModal({ schoolId, onClose }: Props) {
    const [school, setSchool] = useState<SchoolDetail | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'info' | 'subscriptions' | 'renew'>('info');
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        planId: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status: 'ACTIVE',
        amountPaid: 0,
        currency: 'USD',
        notes: '',
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [detailRes, plansRes] = await Promise.all([
                api.get(`/superadmin/schools/${schoolId}`),
                api.get('/public/plans'),
            ]);
            const detail: SchoolDetail = detailRes.data.data;
            setSchool(detail);
            setPlans(plansRes.data.data ?? []);
            setForm((current) => ({ ...current, planId: detail.plan?.id ?? '' }));
            setLoading(false);
        };
        load();
    }, [schoolId]);

    const handleRenew = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!school) return;
        setSaving(true);
        try {
            await api.patch(`/superadmin/schools/${school.id}/subscription`, form);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/45 p-4" onClick={onClose}>
            <div
                className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900">{loading ? 'Chargement' : school?.name}</h2>
                        {!loading && school && <p className="text-sm text-neutral-700">{school.subdomain ?? 'sans-sous-domaine'}.edugoma360.cd</p>}
                    </div>
                    <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100" aria-label="Fermer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex h-48 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : school && (
                    <>
                        <div className="border-b border-neutral-200 px-6 pt-4">
                            <div className="flex gap-1">
                                {(['info', 'subscriptions', 'renew'] as const).map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setTab(item)}
                                        className={`h-10 rounded-t-md px-3 text-sm font-semibold transition-colors ${
                                            tab === item ? 'bg-primary text-white' : 'text-neutral-700 hover:bg-neutral-100'
                                        }`}
                                    >
                                        {{ info: 'Informations', subscriptions: 'Historique', renew: 'Abonnement' }[item]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            {tab === 'info' && (
                                <div className="space-y-5">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {[
                                            [Users, school._count.students, 'Élèves'],
                                            [Users, school._count.teachers, 'Enseignants'],
                                            [MessageSquare, school.smsThisMonth, 'SMS ce mois'],
                                        ].map(([Icon, value, label]) => {
                                            const StatIcon = Icon as typeof Users;
                                            return (
                                                <div key={String(label)} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                                    <StatIcon className="mb-3 h-5 w-5 text-primary" />
                                                    <p className="text-2xl font-bold tabular-nums text-neutral-900">{String(value)}</p>
                                                    <p className="text-sm text-neutral-700">{String(label)}</p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="rounded-lg border border-neutral-200">
                                        {[
                                            ['Ville', school.ville],
                                            ['Province', school.province],
                                            ['Téléphone', school.telephone ?? 'Non renseigné'],
                                            ['Email', school.email ?? 'Non renseigné'],
                                            ['Plan actuel', school.plan?.name ?? 'Aucun'],
                                            ['Maximum élèves', school.plan?.maxStudents === -1 ? 'Illimité' : String(school.plan?.maxStudents ?? 'Non défini')],
                                            ['Quota SMS/mois', String(school.plan?.maxSmsPerMonth ?? 'Non défini')],
                                            ['Inscrite le', new Date(school.createdAt).toLocaleDateString('fr-FR')],
                                        ].map(([label, value]) => (
                                            <div key={label} className="flex items-start justify-between gap-4 border-b border-neutral-200 px-4 py-3 last:border-b-0">
                                                <span className="text-sm font-medium text-neutral-700">{label}</span>
                                                <span className="text-right text-sm text-neutral-900">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {tab === 'subscriptions' && (
                                <div className="space-y-3">
                                    {school.subscriptions.length === 0 ? (
                                        <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-700">Aucun historique d’abonnement.</p>
                                    ) : school.subscriptions.map((subscription) => (
                                        <div key={subscription.id} className="rounded-lg border border-neutral-200 bg-white p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <Badge status={subscription.status} />
                                                <span className="text-xs text-neutral-700">{new Date(subscription.createdAt).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                            <div className="space-y-2 text-sm text-neutral-700">
                                                <p className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    {new Date(subscription.startDate).toLocaleDateString('fr-FR')} à {new Date(subscription.endDate).toLocaleDateString('fr-FR')}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-primary" />
                                                    {subscription.amountPaid} {subscription.currency}, {subscription.paymentMethod ?? 'mode non renseigné'}
                                                </p>
                                                {subscription.notes && <p className="text-sm text-neutral-700">{subscription.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {tab === 'renew' && (
                                <form onSubmit={handleRenew} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="space-y-1">
                                            <span className="text-sm font-medium text-neutral-700">Plan</span>
                                            <select value={form.planId} onChange={(event) => setForm({ ...form, planId: event.target.value })} className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10">
                                                {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                                            </select>
                                        </label>
                                        <label className="space-y-1">
                                            <span className="text-sm font-medium text-neutral-700">Statut</span>
                                            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10">
                                                {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                            </select>
                                        </label>
                                        <label className="space-y-1">
                                            <span className="text-sm font-medium text-neutral-700">Date de début</span>
                                            <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10" />
                                        </label>
                                        <label className="space-y-1">
                                            <span className="text-sm font-medium text-neutral-700">Date de fin</span>
                                            <input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10" />
                                        </label>
                                        <label className="space-y-1">
                                            <span className="text-sm font-medium text-neutral-700">Montant payé</span>
                                            <input type="number" min="0" value={form.amountPaid} onChange={(event) => setForm({ ...form, amountPaid: parseFloat(event.target.value) || 0 })} className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10" />
                                        </label>
                                        <label className="space-y-1">
                                            <span className="text-sm font-medium text-neutral-700">Devise</span>
                                            <select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10">
                                                <option>USD</option>
                                                <option>CDF</option>
                                            </select>
                                        </label>
                                    </div>
                                    <label className="block space-y-1">
                                        <span className="text-sm font-medium text-neutral-700">Notes</span>
                                        <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} className="w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10" />
                                    </label>
                                    <button type="submit" disabled={saving} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                        {saving ? 'Enregistrement' : 'Appliquer l’abonnement'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
