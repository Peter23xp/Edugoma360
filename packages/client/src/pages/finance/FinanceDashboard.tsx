import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { formatFC } from '@edugoma360/shared';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function FinanceDashboard() {
    const { data: stats } = useQuery({
        queryKey: ['finance-stats'],
        queryFn: async () => (await api.get('/finance/stats')).data,
    });

    const mockMonthly = [
        { month: 'Sept', montant: 1250000 }, { month: 'Oct', montant: 980000 },
        { month: 'Nov', montant: 1100000 }, { month: 'Déc', montant: 750000 },
        { month: 'Jan', montant: 1350000 }, { month: 'Fév', montant: 890000 },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><Wallet size={22} /> Finances</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-stat">
                    <p className="text-xs text-neutral-500">Recettes totales</p>
                    <p className="text-2xl font-bold text-primary mt-1">{stats?.totalRevenue ? formatFC(stats.totalRevenue) : '—'}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-success"><TrendingUp size={12} /> ce trimestre</div>
                </div>
                <div className="card-stat">
                    <p className="text-xs text-neutral-500">Paiements ce mois</p>
                    <p className="text-2xl font-bold text-secondary mt-1">{stats?.monthlyPayments ?? '—'}</p>
                </div>
                <div className="card-stat">
                    <p className="text-xs text-neutral-500">Élèves en règle</p>
                    <p className="text-2xl font-bold text-success mt-1">{stats?.paidStudents ?? '—'}</p>
                </div>
                <div className="card-stat">
                    <p className="text-xs text-neutral-500">Impayés totaux</p>
                    <p className="text-2xl font-bold text-danger mt-1">{stats?.totalDebts ? formatFC(stats.totalDebts) : '—'}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-danger"><AlertCircle size={12} /> {stats?.debtStudents ?? 0} élèves</div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-300/50 p-5">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Recettes mensuelles (FC)</h3>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={mockMonthly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => formatFC(v)} />
                        <Bar dataKey="montant" fill="#1B5E20" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
