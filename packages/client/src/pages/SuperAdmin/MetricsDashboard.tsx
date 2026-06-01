import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
    AlertCircle,
    Building2,
    CheckCircle,
    Clock,
    Loader2,
    MessageSquare,
    RefreshCw,
    TrendingUp,
} from 'lucide-react';

interface Metrics {
    totalSchools: number;
    activeSchools: number;
    trialSchools: number;
    expiredSchools: number;
    mrr: number;
    totalSmsThisMonth: number;
    schoolsByPlan: { planId: string | null; planName: string; slug: string; count: number }[];
    month: string;
}

interface SchoolRow {
    id: string;
    name: string;
    subdomain: string | null;
    createdAt: string;
    subscriptions: { status: string; endDate: string }[];
    plan: { name: string; slug: string } | null;
    _count: { students: number };
}

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

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.PENDING}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    tone: 'primary' | 'info' | 'accent' | 'error';
}

function KpiCard({ title, value, subtitle, icon: Icon, tone }: KpiCardProps) {
    const tones = {
        primary: 'bg-primary-lighter text-primary',
        info: 'bg-info-light text-info',
        accent: 'bg-accent-light text-accent',
        error: 'bg-error-light text-error',
    };

    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700">{title}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-md ${tones[tone]}`}>
                    <Icon className="h-4 w-4" />
                </span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-neutral-900">{value}</p>
            <p className="mt-1 text-xs text-neutral-700">{subtitle}</p>
        </div>
    );
}

export default function MetricsDashboard() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [recentSchools, setRecentSchools] = useState<SchoolRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            setError('Impossible de charger les métriques de la plateforme.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="flex h-72 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="mx-auto mt-12 max-w-md rounded-lg border border-error/30 bg-error-light p-5 text-center">
                <AlertCircle className="mx-auto mb-3 h-8 w-8 text-error" />
                <p className="text-sm font-medium text-error">{error}</p>
                <button onClick={fetchData} className="mt-4 h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Vue plateforme</h1>
                    <p className="mt-1 text-sm text-neutral-700">Synthèse SaaS, écoles, abonnements et usage SMS pour {metrics.month}.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
                >
                    <RefreshCw className="h-4 w-4" />
                    Actualiser
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard title="Écoles actives" value={metrics.activeSchools} subtitle={`sur ${metrics.totalSchools} écoles`} icon={CheckCircle} tone="primary" />
                <KpiCard title="Périodes d'essai" value={metrics.trialSchools} subtitle="écoles à convertir" icon={Clock} tone="info" />
                <KpiCard title="Revenu mensuel" value={`$${metrics.mrr.toLocaleString()}`} subtitle="abonnements actifs" icon={TrendingUp} tone="accent" />
                <KpiCard title="SMS envoyés" value={metrics.totalSmsThisMonth.toLocaleString()} subtitle="ce mois-ci" icon={MessageSquare} tone="primary" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                <section className="rounded-lg border border-neutral-200 bg-white">
                    <div className="border-b border-neutral-200 px-5 py-4">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                            <Building2 className="h-4 w-4 text-primary" />
                            Répartition par plan
                        </h2>
                    </div>
                    <div className="divide-y divide-neutral-200">
                        {metrics.schoolsByPlan.length === 0 ? (
                            <p className="p-5 text-sm text-neutral-700">Aucune école rattachée à un plan.</p>
                        ) : metrics.schoolsByPlan.map((plan) => (
                            <div key={plan.planId ?? 'none'} className="flex items-center justify-between px-5 py-4">
                                <div>
                                    <p className="text-sm font-semibold text-neutral-900">{plan.planName}</p>
                                    <p className="text-xs text-neutral-700">{plan.slug || 'sans-slug'}</p>
                                </div>
                                <span className="text-xl font-bold tabular-nums text-primary">{plan.count}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    <div className="border-b border-neutral-200 px-5 py-4">
                        <h2 className="text-sm font-semibold text-neutral-900">Dernières écoles inscrites</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-100">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-700">École</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-700">Plan</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-700">Élèves</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-700">Statut</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-700">Inscription</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {recentSchools.map((school) => {
                                    const subscription = school.subscriptions?.[0];
                                    return (
                                        <tr key={school.id} className="hover:bg-primary-lighter/40">
                                            <td className="px-5 py-3">
                                                <p className="font-semibold text-neutral-900">{school.name}</p>
                                                <p className="text-xs text-neutral-700">{school.subdomain ?? 'sans-sous-domaine'}.edugoma360.cd</p>
                                            </td>
                                            <td className="px-5 py-3 text-neutral-700">{school.plan?.name ?? 'Aucun'}</td>
                                            <td className="px-5 py-3 tabular-nums text-neutral-900">{school._count.students}</td>
                                            <td className="px-5 py-3"><StatusBadge status={subscription?.status ?? 'PENDING'} /></td>
                                            <td className="px-5 py-3 text-neutral-700">{new Date(school.createdAt).toLocaleDateString('fr-FR')}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
