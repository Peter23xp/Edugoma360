import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, Wallet, CalendarCheck, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import { formatFC } from '@edugoma360/shared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1B5E20', '#F57F17', '#0D47A1', '#B71C1C', '#757575'];

export default function DashboardPage() {
    const { user, isAdmin, isFinance, isTeacher } = useAuth();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/settings/dashboard-stats');
            return res.data;
        },
    });

    const statCards = [
        { label: 'Élèves inscrits', value: stats?.totalStudents ?? '—', icon: Users, color: 'text-primary', bg: 'bg-success-bg', change: stats?.studentChange },
        { label: 'Enseignants', value: stats?.totalTeachers ?? '—', icon: GraduationCap, color: 'text-info', bg: 'bg-info-bg' },
        { label: 'Recettes (FC)', value: stats?.totalRevenue ? formatFC(stats.totalRevenue) : '—', icon: Wallet, color: 'text-secondary', bg: 'bg-warning-bg', roles: ['SUPER_ADMIN', 'ECONOME'] },
        { label: 'Présences aujourd\'hui', value: stats?.attendanceRate ? `${stats.attendanceRate}%` : '—', icon: CalendarCheck, color: 'text-primary', bg: 'bg-success-bg' },
    ];

    const mockEnrollmentData = [
        { class: '1ère A', garcons: 22, filles: 18 },
        { class: '1ère B', garcons: 20, filles: 21 },
        { class: '2ème A', garcons: 19, filles: 17 },
        { class: '3ème SC', garcons: 15, filles: 12 },
        { class: '3ème COM', garcons: 14, filles: 16 },
        { class: '4ème SC', garcons: 13, filles: 10 },
        { class: '4ème PED', garcons: 11, filles: 15 },
    ];

    const mockPaymentPie = [
        { name: 'Payé', value: 68 },
        { name: 'Partiel', value: 18 },
        { name: 'Impayé', value: 14 },
    ];

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                    Bonjour, {user?.prenom || user?.nom} 👋
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                    Voici un résumé de la situation de l'école
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => {
                    if (card.roles && !card.roles.some((r) => user?.role === r)) return null;
                    return (
                        <div key={card.label} className="card-stat">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-neutral-500 font-medium">{card.label}</p>
                                    <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                                        {isLoading ? <span className="animate-pulse bg-neutral-200 rounded w-16 h-7 inline-block" /> : card.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${card.bg}`}>
                                    <card.icon size={22} className={card.color} />
                                </div>
                            </div>
                            {card.change != null && (
                                <div className="mt-3 flex items-center gap-1 text-xs">
                                    {card.change >= 0 ? (
                                        <TrendingUp size={12} className="text-success" />
                                    ) : (
                                        <TrendingDown size={12} className="text-danger" />
                                    )}
                                    <span className={card.change >= 0 ? 'text-success' : 'text-danger'}>
                                        {card.change >= 0 ? '+' : ''}{card.change}%
                                    </span>
                                    <span className="text-neutral-400">vs trimestre précédent</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enrollment Chart */}
                <div className="bg-white rounded-xl border border-neutral-300/50 p-5">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-4">Effectifs par classe</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={mockEnrollmentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                            <XAxis dataKey="class" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="garcons" name="Garçons" fill="#1B5E20" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="filles" name="Filles" fill="#F57F17" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment Pie */}
                {(isAdmin() || isFinance()) && (
                    <div className="bg-white rounded-xl border border-neutral-300/50 p-5">
                        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Situation des paiements</h3>
                        <div className="flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={mockPaymentPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {mockPaymentPie.map((_, idx) => (
                                            <Cell key={idx} fill={COLORS[idx]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions / Alerts */}
            <div className="bg-white rounded-xl border border-neutral-300/50 p-5">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Alertes récentes</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-warning-bg rounded-lg">
                        <AlertCircle size={16} className="text-warning flex-shrink-0" />
                        <p className="text-xs text-neutral-700">
                            <span className="font-semibold">12 élèves</span> ont un solde impayé de plus de 30 jours
                        </p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-info-bg rounded-lg">
                        <AlertCircle size={16} className="text-info flex-shrink-0" />
                        <p className="text-xs text-neutral-700">
                            Les notes du <span className="font-semibold">2ème trimestre</span> pour la 3ème SCa ne sont pas encore verrouillées
                        </p>
                    </div>
                    {isTeacher() && (
                        <div className="flex items-center gap-3 p-3 bg-success-bg rounded-lg">
                            <CalendarCheck size={16} className="text-success flex-shrink-0" />
                            <p className="text-xs text-neutral-700">
                                N'oubliez pas de prendre les <span className="font-semibold">présences du matin</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
