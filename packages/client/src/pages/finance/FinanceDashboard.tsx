import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, AlertCircle, Users, Receipt } from 'lucide-react';
import api from '../../lib/api';
import { formatFC } from '@edugoma360/shared';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function FinanceDashboard() {
    const { data: statsData } = useQuery({
        queryKey: ['finance-stats'],
        queryFn: async () => {
            const res = await api.get('/finance/stats');
            return res.data?.data ?? res.data;
        },
    });

    const { data: monthlyRaw } = useQuery({
        queryKey: ['finance-monthly'],
        queryFn: async () => {
            const res = await api.get('/finance/monthly-revenue');
            // Backend returns { data: [...] } with { month, revenue }
            return res.data?.data ?? res.data ?? [];
        },
    });

    const stats = statsData || {};
    const monthlyRevenue = Array.isArray(monthlyRaw) ? monthlyRaw : [];

    return (
        <div className="space-y-4 pb-20">
            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
                    <Wallet size={22} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                        Tableau de bord Finance
                    </h1>
                    <p className="text-sm text-neutral-500">Vue d'ensemble des finances</p>
                </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Recettes totales"
                    value={stats.totalRevenue ? formatFC(stats.totalRevenue) : '0 FC'}
                    icon={<TrendingUp size={16} className="text-primary" />}
                    accent="text-primary"
                />
                <StatCard
                    label="Attendu (budgété)"
                    value={stats.totalExpected ? formatFC(stats.totalExpected) : '0 FC'}
                    icon={<Receipt size={16} className="text-blue-600" />}
                    accent="text-blue-700"
                />
                <StatCard
                    label="Paiements ce mois"
                    value={stats.monthlyPayments != null ? String(stats.monthlyPayments) : '—'}
                    icon={<Users size={16} className="text-green-600" />}
                    accent="text-green-700"
                />
                <StatCard
                    label="Impayés totaux"
                    value={stats.totalDebt ? formatFC(stats.totalDebt) : '0 FC'}
                    icon={<AlertCircle size={16} className="text-red-500" />}
                    accent="text-red-700"
                    subtext={stats.debtStudents != null ? `${stats.debtStudents} élèves` : undefined}
                />
            </div>

            {/* ── Monthly Revenue Chart ──────────────────────── */}
            <div className="bg-white rounded-xl border border-neutral-300/50 p-5">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Recettes mensuelles (FC)</h3>
                {monthlyRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v: number) => formatFC(v)} />
                            <Bar dataKey="revenue" fill="#1B5E20" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[280px] flex items-center justify-center text-neutral-500 text-sm">
                        Aucune donnée disponible
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    accent,
    subtext,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    accent: string;
    subtext?: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-neutral-300/50 p-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-neutral-500">{label}</p>
                {icon}
            </div>
            <p className={`text-2xl font-bold ${accent}`}>{value}</p>
            {subtext && (
                <p className="text-xs text-neutral-500 mt-1">{subtext}</p>
            )}
        </div>
    );
}
