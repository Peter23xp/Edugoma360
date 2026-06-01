import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
    School,
    TrendingUp,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    RefreshCw,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Metrics {
    totalSchools:       number;
    activeSchools:      number;
    trialSchools:       number;
    expiredSchools:     number;
    mrr:                number;
    totalSmsThisMonth:  number;
    schoolsByPlan:      { planId: string | null; planName: string; slug: string; count: number }[];
    month:              string;
}

interface School {
    id:           string;
    name:         string;
    subdomain:    string | null;
    createdAt:    string;
    subscriptions: { status: string; endDate: string }[];
    plan:         { name: string; slug: string } | null;
    _count:       { students: number };
}

// ── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    ACTIVE:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    TRIAL:     'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    EXPIRED:   'bg-red-500/15 text-red-300 border border-red-500/30',
    SUSPENDED: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    PENDING:   'bg-purple-500/15 text-purple-300 border border-purple-500/30',
};

const STATUS_LABELS: Record<string, string> = {
    ACTIVE:    'Actif',
    TRIAL:     'Essai',
    EXPIRED:   'Expiré',
    SUSPENDED: 'Suspendu',
    PENDING:   'En attente',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-500/15 text-gray-300'}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
    title:    string;
    value:    string | number;
    icon:     React.ElementType;
    color:    string;
    subtitle?: string;
}

function KpiCard({ title, value, icon: Icon, color, subtitle }: KpiCardProps) {
    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex items-start gap-4 hover:border-gray-700 transition-colors">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">{title}</p>
                <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}

// ── MetricsDashboard ──────────────────────────────────────────────────────────

export default function MetricsDashboard() {
    const [metrics,        setMetrics]        = useState<Metrics | null>(null);
    const [recentSchools,  setRecentSchools]  = useState<School[]>([]);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [metricsRes, schoolsRes] = await Promise.all([
                api.get('/superadmin/metrics'),
                api.get('/superadmin/schools?limit=10&page=1'),
            ]);
            setMetrics(metricsRes.data.data);
            setRecentSchools(schoolsRes.data.data ?? []);
        } catch {
            setError('Impossible de charger les métriques. Vérifiez votre connexion.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-[#F57F17] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-gray-400">{error}</p>
                <button onClick={fetchData} className="px-4 py-2 bg-[#1B5E20] rounded-lg text-sm text-white hover:bg-[#2E7D32] transition-colors">
                    Réessayer
                </button>
            </div>
        );
    }

    const m = metrics!;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Tableau de Bord Plateforme</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Période : {m.month}</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Actualiser
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Écoles actives"
                    value={m.activeSchools}
                    icon={CheckCircle}
                    color="bg-emerald-600"
                    subtitle={`sur ${m.totalSchools} total`}
                />
                <KpiCard
                    title="En période d'essai"
                    value={m.trialSchools}
                    icon={Clock}
                    color="bg-blue-600"
                    subtitle="abonnements TRIAL"
                />
                <KpiCard
                    title="MRR (USD)"
                    value={`$${m.mrr.toLocaleString()}`}
                    icon={TrendingUp}
                    color="bg-[#F57F17]"
                    subtitle="revenus du mois"
                />
                <KpiCard
                    title="SMS ce mois"
                    value={m.totalSmsThisMonth.toLocaleString()}
                    icon={MessageSquare}
                    color="bg-purple-600"
                    subtitle="envoyés sur la plateforme"
                />
            </div>

            {/* Schools by Plan */}
            {m.schoolsByPlan.length > 0 && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <School className="w-4 h-4 text-[#F57F17]" />
                        Répartition par Plan
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {m.schoolsByPlan.map((p) => (
                            <div key={p.planId ?? 'none'} className="bg-gray-800 rounded-lg p-3 text-center">
                                <p className="text-lg font-bold text-white">{p.count}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{p.planName}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Schools Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-800">
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        10 Dernières Écoles Inscrites
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">École</th>
                                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Sous-domaine</th>
                                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Plan</th>
                                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Élèves</th>
                                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Statut</th>
                                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Inscrite le</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSchools.map((school) => {
                                const sub = school.subscriptions?.[0];
                                return (
                                    <tr key={school.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-white">{school.name}</td>
                                        <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{school.subdomain}.edugoma360.cd</td>
                                        <td className="px-5 py-3.5">
                                            <span className="px-2 py-0.5 bg-[#1B5E20]/30 text-green-300 rounded text-xs border border-[#1B5E20]/50">
                                                {school.plan?.name ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-300 tabular-nums">{school._count.students}</td>
                                        <td className="px-5 py-3.5">
                                            <StatusBadge status={sub?.status ?? 'PENDING'} />
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-400 text-xs">
                                            {new Date(school.createdAt).toLocaleDateString('fr-FR')}
                                        </td>
                                    </tr>
                                );
                            })}
                            {recentSchools.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                                        Aucune école inscrite
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
