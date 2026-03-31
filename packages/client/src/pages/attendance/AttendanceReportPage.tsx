import { useState } from 'react';
import {
    BarChart3, AlertTriangle, Trophy, FileBarChart,
    Users, XCircle, Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAttendanceReports } from '../../hooks/useAttendanceReports';
import ReportFilters from '../../components/attendance/ReportFilters';
import AttendanceCharts from '../../components/attendance/AttendanceCharts';
import ClassRankingTable from '../../components/attendance/ClassRankingTable';
import GenerateReportModal from '../../components/attendance/GenerateReportModal';

// Helper: get current month bounds
const getDefaultDates = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
        start: start.toISOString().slice(0, 10),
        end: now.toISOString().slice(0, 10),
    };
};

const defaults = getDefaultDates();

export default function AttendanceReportPage() {
    const [startDate, setStartDate] = useState(defaults.start);
    const [endDate, setEndDate] = useState(defaults.end);
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const { data, isLoading, isError } = useAttendanceReports({ startDate, endDate });

    const stats = data?.stats;
    const presenceRate = stats?.totalAttendanceRate ?? 0;

    const rateColor = (rate: number) => {
        if (rate >= 90) return 'text-green-700';
        if (rate >= 80) return 'text-orange-600';
        return 'text-red-600';
    };

    const KPIs = stats
        ? [
            {
                label: 'Taux de présence',
                value: `${presenceRate.toFixed(1)}%`,
                icon: BarChart3,
                iconBg: 'bg-green-100',
                iconColor: 'text-green-700',
                valueClass: cn("text-2xl font-bold", rateColor(presenceRate)),
                sub: presenceRate >= 90 ? '✓ Objectif atteint' : `Objectif : 90%`,
            },
            {
                label: 'Absences totales',
                value: stats.totalAbsences,
                icon: XCircle,
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-700',
                sub: `${stats.justifiedAbsences} justifiées · ${stats.notJustifiedAbsences} non just.`,
            },
            {
                label: 'Retards totaux',
                value: stats.totalLates,
                icon: Clock,
                iconBg: 'bg-orange-100',
                iconColor: 'text-orange-700',
                sub: stats.avgLateMinutes ? `Moy. ${Math.round(stats.avgLateMinutes)} min/retard` : '',
            },
            {
                label: 'Meilleure classe',
                value: data?.byClass?.length ? data.byClass.sort((a, b) => b.attendanceRate - a.attendanceRate)[0]?.className : '—',
                icon: Trophy,
                iconBg: 'bg-amber-100',
                iconColor: 'text-amber-600',
                sub: data?.byClass?.length
                    ? `${data.byClass.sort((a, b) => b.attendanceRate - a.attendanceRate)[0]?.attendanceRate.toFixed(1)}%`
                    : '',
            }
        ]
        : [];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Rapports de présence</h1>
                    <p className="text-sm text-neutral-500 mt-1">Statistiques, graphiques et analyses de présence.</p>
                </div>
                <button
                    onClick={() => setShowGenerateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-sm w-full sm:w-auto"
                >
                    <FileBarChart size={16} />
                    Générer rapport
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm px-5 py-4">
                <ReportFilters
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : isError ? (
                <div className="text-center py-20 flex flex-col items-center text-neutral-500">
                    <AlertTriangle size={36} className="text-red-300 mb-3" />
                    <p className="text-sm font-medium">Impossible de charger les données.</p>
                    <p className="text-xs text-neutral-400 mt-1">Vérifiez votre connexion et réessayez.</p>
                </div>
            ) : !data ? (
                <div className="text-center py-20 flex flex-col items-center text-neutral-400">
                    <BarChart3 size={40} className="mb-3 text-neutral-300" />
                    <p className="text-sm font-medium">Aucune donnée disponible pour cette période.</p>
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {KPIs.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <div key={i} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                                    <div className={cn("p-2.5 rounded-xl flex-shrink-0", kpi.iconBg)}>
                                        <Icon size={22} className={kpi.iconColor} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{kpi.label}</p>
                                        <p className={kpi.valueClass ?? "text-2xl font-bold text-neutral-900"}>
                                            {kpi.value}
                                        </p>
                                        {kpi.sub && (
                                            <p className="text-xs text-neutral-400 mt-1 truncate">{kpi.sub}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Charts */}
                    <AttendanceCharts data={data} />

                    {/* Ranking Table */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                            <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
                                <Trophy size={16} className="text-amber-500" />
                                Classement des classes
                            </h3>
                            <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">
                                {data.byClass.length} classes
                            </span>
                        </div>
                        <ClassRankingTable data={data.byClass} />
                    </div>

                    {/* At-Risk Students */}
                    {data.atRiskStudents?.length > 0 && (
                        <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-red-100 flex items-center justify-between bg-red-50/40">
                                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-red-500" />
                                    Élèves à risque
                                    <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                        Taux présence &lt; 80%
                                    </span>
                                </h3>
                                <span className="text-xs text-red-500 font-medium">{data.atRiskStudents.length} élèves</span>
                            </div>
                            <div className="divide-y divide-red-50">
                                {data.atRiskStudents.map((s) => (
                                    <div key={s.studentId} className="px-5 py-3 flex items-center justify-between hover:bg-red-50/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                                <Users size={14} className="text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900 text-sm">
                                                    {s.student.nom} {s.student.postNom}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {s.student.matricule} · {s.student.class}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="text-right">
                                                <p className="font-bold text-red-600">{s.attendanceRate.toFixed(1)}%</p>
                                                <p className="text-xs text-neutral-400">présence</p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="font-medium text-neutral-700">{s.notJustifiedAbsences}</p>
                                                <p className="text-xs text-neutral-400">non justifiées</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Generate Report Modal */}
            <GenerateReportModal
                isOpen={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    );
}
