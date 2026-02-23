import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Plus,
    Upload,
    Users,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStudents, type StudentListItem } from '../../hooks/useStudents';
import StudentFilters from '../../components/students/StudentFilters';
import StudentRow from '../../components/students/StudentRow';
import BulkActionsBar from '../../components/students/BulkActionsBar';
import ImportModal from '../../components/students/ImportModal';
import ConfirmModal from '../../components/shared/ConfirmModal';
import EmptyState from '../../components/shared/EmptyState';
import api from '../../lib/api';

export default function StudentsListPage() {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // â”€â”€ Filter state, synced with URL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const classId = searchParams.get('class') ?? '';
    const section = searchParams.get('section') ?? '';
    const status = searchParams.get('status') ?? 'NOUVEAU';
    const search = searchParams.get('q') ?? '';
    const page = parseInt(searchParams.get('page') ?? '1', 10);

    // Responsive limit
    const [limit] = useState(() => (window.innerWidth < 768 ? 10 : 25));

    const updateParams = useCallback(
        (updates: Record<string, string>) => {
            const newParams = new URLSearchParams(searchParams.toString());
            for (const [key, value] of Object.entries(updates)) {
                if (value) {
                    newParams.set(key, value);
                } else {
                    newParams.delete(key);
                }
            }
            setSearchParams(newParams, { replace: true });
        },
        [searchParams, setSearchParams],
    );

    // Convenience updaters
    const setClassId = useCallback((v: string) => updateParams({ class: v, page: '1' }), [updateParams]);
    const setSection = useCallback((v: string) => updateParams({ section: v, page: '1' }), [updateParams]);
    const setStatus = useCallback((v: string) => updateParams({ status: v, page: '1' }), [updateParams]);
    const setSearch = useCallback((v: string) => updateParams({ q: v, page: '1' }), [updateParams]);
    const setPage = useCallback((p: number) => updateParams({ page: String(p) }), [updateParams]);

    // â”€â”€ Data fetching â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const filters = useMemo(
        () => ({
            classId: classId || undefined,
            section: section || undefined,
            status: status || undefined,
            q: search || undefined,
            page,
            limit,
        }),
        [classId, section, status, search, page, limit],
    );

    const {
        students,
        total,
        totalPages,
        isLoading,
        isFetching,
        batchArchiveMutation,
        archiveMutation,
    } = useStudents(filters);

    // â”€â”€ Selection state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Reset selection on page/filter change
    useEffect(() => {
        setSelectedIds(new Set());
    }, [page, classId, section, status, search]);

    const handleSelect = useCallback((id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    }, []);

    const allOnPageSelected = students.length > 0 && students.every((s) => selectedIds.has(s.id));
    const someOnPageSelected = students.some((s) => selectedIds.has(s.id));

    const toggleSelectAll = useCallback(() => {
        if (allOnPageSelected) {
            // Deselect all on page
            setSelectedIds((prev) => {
                const next = new Set(prev);
                students.forEach((s) => next.delete(s.id));
                return next;
            });
        } else {
            // Select all on page
            setSelectedIds((prev) => {
                const next = new Set(prev);
                students.forEach((s) => next.add(s.id));
                return next;
            });
        }
    }, [allOnPageSelected, students]);

    // â”€â”€ Modals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);

    // â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleRowAction = useCallback(
        (action: 'view' | 'edit' | 'card' | 'transfer' | 'archive', id: string) => {
            switch (action) {
                case 'view':
                    navigate(`/students/${id}`);
                    break;
                case 'edit':
                    navigate(`/students/${id}/edit`);
                    break;
                case 'card':
                    navigate(`/students/${id}/card`);
                    break;
                case 'transfer':
                    // TODO: Open transfer modal
                    break;
                case 'archive':
                    setArchiveTargetId(id);
                    setArchiveModalOpen(true);
                    break;
            }
        },
        [navigate],
    );

    const handleArchiveConfirm = useCallback(async () => {
        if (archiveTargetId) {
            await archiveMutation.mutateAsync(archiveTargetId);
        }
        setArchiveModalOpen(false);
        setArchiveTargetId(null);
    }, [archiveTargetId, archiveMutation]);

    const handleBulkExport = useCallback(async () => {
        try {
            const ids = Array.from(selectedIds).join(',');
            const res = await api.get('/students/export', {
                params: { ids },
                responseType: 'blob',
            });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            const today = new Date().toISOString().split('T')[0];
            a.download = `eleves-selection-${today}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // Handle error
        }
    }, [selectedIds]);

    const handleBulkPrint = useCallback(() => {
        window.print();
    }, []);

    const handleBulkArchive = useCallback(async () => {
        const ids = Array.from(selectedIds);
        await batchArchiveMutation.mutateAsync({ ids, reason: 'Archivage groupé' });
        setSelectedIds(new Set());
    }, [selectedIds, batchArchiveMutation]);

    const handleImportSuccess = useCallback(() => {
        // Refresh the query
        window.location.reload();
    }, []);

    // â”€â”€ Page numbers for pagination â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const pageNumbers = useMemo(() => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push('...');
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                pages.push(i);
            }
            if (page < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    }, [page, totalPages]);

    const hasFiltersActive = !!(classId || section || (status && status !== 'NOUVEAU') || search);

    return (
        <div className="space-y-4 pb-20">
            {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
                        <GraduationCap size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                            Gestion des Élèves
                        </h1>
                        <p className="text-sm text-neutral-500">
                            {isLoading ? (
                                <span className="inline-block w-20 h-3 bg-neutral-200 rounded animate-pulse" />
                            ) : (
                                <>
                                    <span className="font-semibold text-neutral-700">{total}</span>{' '}
                                    élève{total !== 1 ? 's' : ''} inscrit{total !== 1 ? 's' : ''}
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {hasRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE') && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setImportModalOpen(true)}
                            className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium 
                                       border border-neutral-300 rounded-xl hover:bg-neutral-50 
                                       hover:border-neutral-400 transition-all duration-200 
                                       text-neutral-700 shadow-sm"
                        >
                            <Upload size={15} />
                            <span className="hidden sm:inline">Importer</span>
                        </button>
                        <button
                            onClick={() => navigate('/students/new')}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium 
                                       bg-gradient-to-r from-primary to-primary-light text-white 
                                       rounded-xl hover:shadow-lg hover:shadow-primary/25 
                                       transition-all duration-200 hover:-translate-y-0.5 shadow-md"
                        >
                            <Plus size={15} />
                            <span>Inscrire</span>
                        </button>
                    </div>
                )}
            </div>

            {/* â”€â”€ Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <StudentFilters
                classId={classId}
                section={section}
                status={status}
                search={search}
                onClassChange={setClassId}
                onSectionChange={setSection}
                onStatusChange={setStatus}
                onSearchChange={setSearch}
            />

            {/* â”€â”€ Loading skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {isLoading && (
                <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
                    <div className="animate-pulse space-y-0">
                        <div className="h-12 bg-neutral-100" />
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 border-t border-neutral-50">
                                <div className="w-4 h-4 bg-neutral-200 rounded" />
                                <div className="w-9 h-9 bg-neutral-200 rounded-full" />
                                <div className="w-16 h-3 bg-neutral-200 rounded" />
                                <div className="flex-1 h-3 bg-neutral-200 rounded" />
                                <div className="w-12 h-5 bg-neutral-200 rounded-full" />
                                <div className="w-14 h-5 bg-neutral-200 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* â”€â”€ Empty state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {!isLoading && students.length === 0 && (
                <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
                    <EmptyState
                        icon={<Users size={28} />}
                        title="Aucun élève trouvé"
                        description={
                            hasFiltersActive
                                ? 'Modifiez vos filtres pour voir plus de résultats.'
                                : "Aucun élève inscrit cette année. Commencez par inscrire un élève."
                        }
                        action={
                            !hasFiltersActive &&
                                hasRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE') ? (
                                <button
                                    onClick={() => navigate('/students/new')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                                               bg-primary text-white rounded-lg hover:bg-primary-dark 
                                               transition-colors"
                                >
                                    <Plus size={14} />
                                    Inscrire le premier élève
                                </button>
                            ) : undefined
                        }
                    />
                </div>
            )}

            {/* â”€â”€ Data table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {!isLoading && students.length > 0 && (
                <div
                    className={`bg-white rounded-xl border border-neutral-300/50 overflow-hidden shadow-sm transition-opacity duration-200 ${isFetching ? 'opacity-70' : 'opacity-100'
                        }`}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full" id="students-table">
                            <thead>
                                <tr className="table-header">
                                    {/* Select all */}
                                    <th className="w-12 px-3 py-3">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={allOnPageSelected}
                                                ref={(el) => {
                                                    if (el) {
                                                        el.indeterminate = someOnPageSelected && !allOnPageSelected;
                                                    }
                                                }}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded border-neutral-300 text-primary 
                                                           focus:ring-primary/20 cursor-pointer"
                                            />
                                        </div>
                                    </th>
                                    <th className="w-14 px-2 py-3 text-left">Photo</th>
                                    <th className="px-3 py-3 text-left">Matricule</th>
                                    <th className="px-3 py-3 text-left">Nom Complet</th>
                                    <th className="px-3 py-3 text-left hidden md:table-cell">Classe</th>
                                    <th className="px-3 py-3 text-left hidden sm:table-cell">Statut</th>
                                    <th className="w-12 px-2 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {students.map((student: StudentListItem) => (
                                    <StudentRow
                                        key={student.id}
                                        student={student}
                                        isSelected={selectedIds.has(student.id)}
                                        onSelect={handleSelect}
                                        onAction={handleRowAction}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* â”€â”€ Pagination â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
                        <p className="text-xs text-neutral-500">
                            Total :{' '}
                            <span className="font-semibold text-neutral-700">{total}</span> élèves
                            <span className="text-neutral-300 mx-1.5">|</span>
                            Affichage : {limit}/page
                        </p>

                        {/* Desktop pagination */}
                        <div className="hidden sm:flex items-center gap-1">
                            <button
                                onClick={() => setPage(1)}
                                disabled={page <= 1}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 
                                           disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsLeft size={14} />
                            </button>
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page <= 1}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 
                                           disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {pageNumbers.map((p, idx) =>
                                p === '...' ? (
                                    <span key={`dots-${idx}`} className="px-1 text-neutral-400 text-xs">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p as number)}
                                        className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-all duration-150 ${p === page
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-neutral-600 hover:bg-neutral-100'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ),
                            )}

                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 
                                           disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => setPage(totalPages)}
                                disabled={page >= totalPages}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 
                                           disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsRight size={14} />
                            </button>
                        </div>

                        {/* Mobile pagination */}
                        <div className="flex sm:hidden items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page <= 1}
                                className="p-2 rounded-lg bg-neutral-100 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <span className="text-xs text-neutral-600 font-medium">
                                Page {page}/{totalPages}
                            </span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages}
                                className="p-2 rounded-lg bg-neutral-100 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* â”€â”€ Bulk Actions Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <BulkActionsBar
                count={selectedIds.size}
                onExport={handleBulkExport}
                onPrint={handleBulkPrint}
                onArchive={handleBulkArchive}
                onClear={() => setSelectedIds(new Set())}
                isArchiving={batchArchiveMutation.isPending}
            />

            {/* â”€â”€ Import Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <ImportModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={handleImportSuccess}
            />

            {/* â”€â”€ Archive Confirm Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <ConfirmModal
                isOpen={archiveModalOpen}
                title="Archiver cet élève ?"
                message="L'élève sera déplacé dans les archives. Cette action peut être annulée par un administrateur."
                confirmLabel="Archiver"
                variant="warning"
                onConfirm={handleArchiveConfirm}
                onCancel={() => {
                    setArchiveModalOpen(false);
                    setArchiveTargetId(null);
                }}
            />
        </div>
    );
}
