import { useState } from 'react';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { FileDown, ChevronRight, BarChart3 } from 'lucide-react';
import { useTeacherStats } from '../../hooks/useTeacherStats';
import StatsOverview from '../../components/teachers/reports/StatsOverview';
import ReportFilters from '../../components/teachers/reports/ReportFilters';
import TeacherRankingTable from '../../components/teachers/reports/TeacherRankingTable';
import PerformanceChart from '../../components/teachers/reports/PerformanceChart';
import WorkloadDistribution from '../../components/teachers/reports/WorkloadDistribution';
import AttendanceHeatmap from '../../components/teachers/reports/AttendanceHeatmap';
import ExportReportModal from '../../components/teachers/reports/ExportReportModal';
import { toast } from 'react-hot-toast';

export default function TeacherReportsPage() {
    const navigate = useNavigate();
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        termId: '', // Should be initialized from active term query
        sectionId: '',
        subjectId: '',
        performance: '',
        search: '',
        startDate: '',
        endDate: '',
        teacherIds: []
    });

    const {
        useOverview,
        useRanking,
        usePerformanceChart,
        useWorkload,
        useAttendanceHeatmap
    } = useTeacherStats(filters);

    const { data: overview, isLoading: isOverviewLoading } = useOverview();
    const { data: ranking = [], isLoading: isRankingLoading } = useRanking('performance');
    const { data: perfChartData = [], isLoading: isPerfLoading } = usePerformanceChart();
    const { data: workloadData = [], isLoading: isWorkloadLoading } = useWorkload();
    const { data: attendanceData = [], isLoading: isAttendanceLoading } = useAttendanceHeatmap();

    const handleExport = async (format: 'pdf' | 'excel', options: any) => {
        const promise = (async () => {
            const res = await api.get('/reports/teachers/export', {
                params: {
                    format,
                    termId: filters.termId,
                    ...options
                }
            });

            // In a real browser, we would trigger a download
            console.log('Export result:', res.data);

            return res.data;
        })();

        toast.promise(
            promise,
            {
                loading: 'Génération du rapport...',
                success: (data) => `Rapport ${data.filename} généré avec succès`,
                error: (err) => err.response?.data?.error?.message || "Erreur lors de l'export"
            }
        );
        setIsExportModalOpen(false);
    };

    return (
        <div className="w-full max-w-full overflow-hidden space-y-4 lg:space-y-6 pb-24">
            {/* Header */}
            <div className="bg-background/95 backdrop-blur border-b border-neutral-200 shadow-sm py-4 mb-6 -mx-3 px-3 sm:-mx-4 sm:px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-neutral-500 text-xs sm:text-sm mb-1">
                            <span>Enseignants</span>
                            <ChevronRight size={14} />
                            <span className="text-primary font-medium">Rapports & Statistiques</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
                            <BarChart3 className="text-primary" /> Rapports & Performances
                        </h1>
                    </div>
                    <button
                        id="export-report"
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 h-11 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all w-full md:w-auto"
                    >
                        <FileDown size={18} />
                        Exporter le rapport
                    </button>
                </div>
            </div>

            {/* Filters */}
            <ReportFilters filters={filters} setFilters={setFilters} />

            {/* Section 1: Metrics */}
            <StatsOverview data={overview} isLoading={isOverviewLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ranking Table */}
                <div className="lg:col-span-2 space-y-6">
                    <TeacherRankingTable
                        data={ranking}
                        isLoading={isRankingLoading}
                        onTeacherClick={(id) => navigate(`/teachers/${id}`)}
                    />

                    {/* Performance Line Chart */}
                    <PerformanceChart data={perfChartData} isLoading={isPerfLoading} />
                </div>

                {/* Right Column: Workload & Heatmap */}
                <div className="space-y-6">
                    <WorkloadDistribution data={workloadData} isLoading={isWorkloadLoading} />
                    <AttendanceHeatmap data={attendanceData} isLoading={isAttendanceLoading} />
                </div>
            </div>

            {/* Export Modal */}
            <ExportReportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExport}
            />
        </div>
    );
}
