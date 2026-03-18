import { useState, useCallback } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { useClasses } from '../../hooks/useClasses';
import { useAbsenceHistory } from '../../hooks/useAbsenceHistory';
import AbsenceStatsCards from '../../components/attendance/AbsenceStatsCards';
import AbsenceFilters, { type AbsenceFiltersState } from '../../components/attendance/AbsenceFilters';
import AbsenceTable from '../../components/attendance/AbsenceTable';
import StudentAbsenceModal from '../../components/attendance/StudentAbsenceModal';
import { useAuth } from '../../hooks/useAuth';
import type { AbsenceHistoryItem } from '@edugoma360/shared';

export default function AbsenceHistoryPage() {
    const { user } = useAuth();
    const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'PREFET';

    // ── State ──────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState<AbsenceFiltersState>({
        period: 'term',
        classIds: [],
        types: ['ABSENT', 'RETARD'],
        isJustified: undefined,
        studentSearch: '',
    });

    const [page, setPage] = useState(1);
    const limit = 25;

    // Modals
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [selectedAbsence, setSelectedAbsence] = useState<AbsenceHistoryItem | null>(null);

    // ── Queries ────────────────────────────────────────────────────────────
    const { data: classesData } = useClasses({ isActive: true });
    const classesList = classesData || [];

    const { 
        data: historyData, 
        isLoading: isHistoryLoading,
        exportData 
    } = useAbsenceHistory({ filters, page, limit });

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleFilterChange = useCallback((newFilters: AbsenceFiltersState) => {
        setFilters(newFilters);
        setPage(1); // Reset page on filter change
    }, []);

    const handleViewClick = useCallback((item: AbsenceHistoryItem) => {
        setSelectedAbsence(item);
        setSelectedStudentId(item.student.id);
    }, []);

    const handleEditClick = useCallback((item: AbsenceHistoryItem) => {
        if (!canEdit) return;
        setSelectedAbsence(item);
        setSelectedStudentId(item.student.id);
        // We'll pass an initial tab state to the modal to open on 'edit'
    }, [canEdit]);

    // ── Export Menu ────────────────────────────────────────────────────────
    const [isExportOpen, setIsExportOpen] = useState(false);

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-neutral-900 drop-shadow-sm flex items-center gap-3">
                        Historique des Absences
                        <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg uppercase tracking-wider">
                            Global
                        </span>
                    </h1>
                    <p className="text-neutral-500 mt-1 flex items-center gap-2">
                        <AlertCircle size={14} className="text-neutral-400" />
                        Consultez et exportez l'historique complet des présences
                    </p>
                </div>

                {/* Export Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setIsExportOpen(!isExportOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-xl shadow-md transition-all active:scale-95"
                    >
                        <Download size={18} />
                        Export
                    </button>

                    {isExportOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 z-50 overflow-hidden">
                            <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100">
                                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Format</span>
                            </div>
                            <button 
                                onClick={() => { exportData.mutate('excel'); setIsExportOpen(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-neutral-700 transition-colors"
                            >
                                Microsoft Excel (.xlsx)
                            </button>
                            <button 
                                onClick={() => { exportData.mutate('pdf'); setIsExportOpen(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-neutral-700 transition-colors border-t border-neutral-100"
                            >
                                Document PDF (.pdf)
                            </button>
                            <button 
                                onClick={() => { exportData.mutate('csv'); setIsExportOpen(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-neutral-700 transition-colors border-t border-neutral-100"
                            >
                                Fichier CSV (.csv)
                            </button>
                        </div>
                    )}
                    
                    {isExportOpen && (
                        <div className="fixed inset-0 z-40 transparent" onClick={() => setIsExportOpen(false)} />
                    )}
                </div>
            </header>

            {/* Stats Cards */}
            {historyData?.stats && (
                <AbsenceStatsCards stats={historyData.stats} />
            )}

            {/* Filters */}
            <AbsenceFilters 
                filters={filters} 
                onChange={handleFilterChange} 
                classes={classesList} 
            />

            {/* Table */}
            <AbsenceTable 
                data={historyData?.data || []}
                isLoading={isHistoryLoading}
                page={historyData?.page || 1}
                pages={historyData?.pages || 1}
                total={historyData?.total || 0}
                onPageChange={setPage}
                onViewClick={handleViewClick}
                onEditClick={handleEditClick}
                canEdit={canEdit}
            />

            {/* Details Modal */}
            <StudentAbsenceModal
                isOpen={!!selectedAbsence}
                onClose={() => {
                    setSelectedAbsence(null);
                    setSelectedStudentId(null);
                }}
                absence={selectedAbsence}
                studentId={selectedStudentId}
                canEdit={canEdit}
            />

        </div>
    );
}
