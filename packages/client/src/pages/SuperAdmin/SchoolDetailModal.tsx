import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { X, Loader2, Calendar, Users, MessageSquare, CreditCard, CheckCircle } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubscriptionHistory {
    id:           string;
    status:       string;
    startDate:    string;
    endDate:      string;
    amountPaid:   number;
    currency:     string;
    paymentMethod: string | null;
    notes:        string | null;
    createdAt:    string;
}
interface SchoolDetail {
    id:           string;
    name:         string;
    subdomain:    string | null;
    telephone:    string | null;
    email:        string | null;
    ville:        string;
    province:     string;
    plan:         { id: string; name: string; slug: string; maxStudents: number; maxSmsPerMonth: number } | null;
    subscriptions: SubscriptionHistory[];
    _count:       { students: number; teachers: number; users: number };
    smsThisMonth: number;
    createdAt:    string;
}
interface Plan { id: string; name: string; slug: string; }

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/15 text-emerald-300', TRIAL: 'bg-blue-500/15 text-blue-300',
    EXPIRED: 'bg-red-500/15 text-red-300', SUSPENDED: 'bg-amber-500/15 text-amber-300',
    PENDING: 'bg-purple-500/15 text-purple-300',
};
const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Actif', TRIAL: 'Essai', EXPIRED: 'Expiré', SUSPENDED: 'Suspendu', PENDING: 'En attente',
};
function Badge({ status }: { status: string }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-700 text-gray-300'}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// ── SchoolDetailModal ─────────────────────────────────────────────────────────
interface Props { schoolId: string; onClose: () => void; }

export default function SchoolDetailModal({ schoolId, onClose }: Props) {
    const [school,   setSchool]   = useState<SchoolDetail | null>(null);
    const [plans,    setPlans]    = useState<Plan[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [tab,      setTab]      = useState<'info' | 'subscriptions' | 'renew'>('info');
    const [saving,   setSaving]   = useState(false);

    // Renewal form state
    const [form, setForm] = useState({
        planId:    '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate:   new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status:    'ACTIVE' as string,
        amountPaid: 0,
        currency:  'USD',
        notes:     '',
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [detailRes, plansRes] = await Promise.all([
                api.get(`/superadmin/schools/${schoolId}`),
                api.get('/public/plans'),
            ]);
            const d: SchoolDetail = detailRes.data.data;
            setSchool(d);
            setPlans(plansRes.data.data ?? []);
            setForm((f) => ({ ...f, planId: d.plan?.id ?? '' }));
            setLoading(false);
        };
        load();
    }, [schoolId]);

    const handleRenew = async (e: React.FormEvent) => {
        e.preventDefault();
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
        // Backdrop
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            {/* Drawer */}
            <div
                className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <h2 className="text-base font-semibold text-white">
                        {loading ? 'Chargement…' : school?.name}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-7 h-7 text-[#F57F17] animate-spin" />
                    </div>
                ) : school && (
                    <>
                        {/* Tabs */}
                        <div className="flex gap-1 px-6 pt-4">
                            {(['info', 'subscriptions', 'renew'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-[#1B5E20] text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                                >
                                    {{ info: 'Informations', subscriptions: 'Historique', renew: 'Modifier Abonnement' }[t]}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {/* ── INFO ── */}
                            {tab === 'info' && (
                                <div className="space-y-5">
                                    {/* Stats row */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-gray-800 rounded-xl p-3 text-center">
                                            <Users className="w-4 h-4 text-[#F57F17] mx-auto mb-1" />
                                            <p className="text-lg font-bold text-white">{school._count.students}</p>
                                            <p className="text-xs text-gray-500">Élèves</p>
                                        </div>
                                        <div className="bg-gray-800 rounded-xl p-3 text-center">
                                            <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-white">{school._count.teachers}</p>
                                            <p className="text-xs text-gray-500">Enseignants</p>
                                        </div>
                                        <div className="bg-gray-800 rounded-xl p-3 text-center">
                                            <MessageSquare className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-white">{school.smsThisMonth}</p>
                                            <p className="text-xs text-gray-500">SMS ce mois</p>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
                                        {[
                                            ['Sous-domaine',   `${school.subdomain}.edugoma360.cd`],
                                            ['Ville',          school.ville],
                                            ['Province',       school.province],
                                            ['Téléphone',      school.telephone ?? '—'],
                                            ['Email',          school.email ?? '—'],
                                            ['Plan actuel',    school.plan?.name ?? '—'],
                                            ['Max élèves',     school.plan?.maxStudents === -1 ? 'Illimité' : String(school.plan?.maxStudents ?? '—')],
                                            ['Quota SMS/mois', String(school.plan?.maxSmsPerMonth ?? '—')],
                                            ['Inscrite le',    new Date(school.createdAt).toLocaleDateString('fr-FR')],
                                        ].map(([label, value]) => (
                                            <div key={label} className="flex items-start justify-between gap-3">
                                                <span className="text-gray-500 flex-shrink-0">{label}</span>
                                                <span className="text-gray-200 text-right break-all">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── SUBSCRIPTIONS ── */}
                            {tab === 'subscriptions' && (
                                <div className="space-y-2">
                                    {school.subscriptions.length === 0 && (
                                        <p className="text-center text-gray-500 py-8">Aucun historique d'abonnement</p>
                                    )}
                                    {school.subscriptions.map((sub) => (
                                        <div key={sub.id} className="bg-gray-800 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge status={sub.status} />
                                                <span className="text-xs text-gray-500">
                                                    {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-400 space-y-1">
                                                <div className="flex gap-2">
                                                    <Calendar className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                                    <span>
                                                        {new Date(sub.startDate).toLocaleDateString('fr-FR')} → {new Date(sub.endDate).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <CreditCard className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                                    <span>${sub.amountPaid} {sub.currency} — {sub.paymentMethod ?? 'N/A'}</span>
                                                </div>
                                                {sub.notes && <p className="text-xs text-gray-500 italic ml-5">{sub.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── RENEW ── */}
                            {tab === 'renew' && (
                                <form onSubmit={handleRenew} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Plan</label>
                                            <select
                                                value={form.planId}
                                                onChange={(e) => setForm({ ...form, planId: e.target.value })}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1B5E20]"
                                            >
                                                {plans.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Statut</label>
                                            <select
                                                value={form.status}
                                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1B5E20]"
                                            >
                                                {['ACTIVE', 'TRIAL', 'PENDING', 'SUSPENDED', 'EXPIRED'].map((s) => (
                                                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Date de début</label>
                                            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1B5E20]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Date de fin</label>
                                            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1B5E20]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Montant payé (USD)</label>
                                            <input type="number" min="0" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1B5E20]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Devise</label>
                                            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1B5E20]"
                                            >
                                                <option>USD</option>
                                                <option>CDF</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Notes</label>
                                        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1B5E20] resize-none"
                                            placeholder="Référence de paiement, remarques…"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        {saving ? 'Enregistrement…' : 'Appliquer le nouvel abonnement'}
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
