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
    School,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTeachers } from '../../hooks/useTeachers';
import { TeacherFilters } from '../../components/teachers/TeacherFilters';
import { TeacherRow } from '../../components/teachers/TeacherRow';
import BulkActionsBar from '../../components/students/BulkActionsBar';
import ImportTeachersModal from '../../components/teachers/ImportTeachersModal';
import ConfirmModal from '../../components/shared/ConfirmModal';
import EmptyState from '../../components/shared/EmptyState';
import api from '../../lib/api';

export const TeachersListPage: React.FC = () => {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // —— Filter state, synced with URL ——
    const subjectId = searchParams.get('subjectId') ?? '';
    const section = searchParams.get('section') ?? '';
    const status = searchParams.get('status') ?? '';
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
    const setSubjectId = useCallback((v: string) => updateParams({ subjectId: v, page: '1' }), [updateParams]);
    const setSection = useCallback((v: string) => updateParams({ section: v, page: '1' }), [updateParams]);
    const setStatus = useCallback((v: string) => updateParams({ status: v, page: '1' }), [updateParams]);
    const setSearch = useCallback((v: string) => updateParams({ q: v, page: '1' }), [updateParams]);
    const setPage = useCallback((p: number) => updateParams({ page: String(p) }), [updateParams]);

    // —— Data fetching ——
    const filters = useMemo(
        () => ({
            subjectId: subjectId || undefined,
            section: section || undefined,
            status: status || undefined,
            search: search || undefined,
            page,
            limit,
        }),
        [subjectId, section, status, search, page, limit],
    );

    const {
        teachersQuery,
        archiveMutation,
    } = useTeachers(filters);

    const { data: teachersData, isLoading, isFetching } = teachersQuery;
    const teachers = teachersData?.data || [];
    const total = teachersData?.total || 0;
    const totalPages = teachersData?.pages || 1;

    // —— Selection state ——
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Reset selection on page/filter change
    useEffect(() => {
        setSelectedIds(new Set());
    }, [page, subjectId, section, status, search]);

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

    const allOnPageSelected = teachers.length > 0 && teachers.every((t: any) => selectedIds.has(t.id));
    const someOnPageSelected = teachers.some((t: any) => selectedIds.has(t.id));

    const toggleSelectAll = useCallback(() => {
        if (allOnPageSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                teachers.forEach((t: any) => next.delete(t.id));
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                teachers.forEach((t: any) => next.add(t.id));
                return next;
            });
        }
    }, [allOnPageSelected, teachers]);

    // —— Modals ——
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);

    // —— Actions ——
    const handleRowAction = useCallback(
        (action: 'view' | 'edit' | 'archive', id: string) => {
            switch (action) {
                case 'view':
                    navigate(`/teachers/${id}`);
                    break;
                case 'edit':
                    navigate(`/teachers/${id}/edit`);
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
            const res = await api.get('/teachers/export', {
                params: { ids },
                responseType: 'blob',
            });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            const today = new Date().toISOString().split('T')[0];
            a.download = `enseignants-selection-${today}.xlsx`;
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
        // Implement batch archive if supported, or loop
        const ids = Array.from(selectedIds);
        for (const id of ids) {
            await archiveMutation.mutateAsync(id);
        }
        setSelectedIds(new Set());
    }, [selectedIds, archiveMutation]);

    // —— Page numbers for pagination ——
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

    const hasFiltersActive = !!(subjectId || section || status || search);

    return (
        <div className="space-y-4 pb-20">
            {/* —— Header —— */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
                        <School size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                            Gestion des Enseignants
                        </h1>
                        <p className="text-sm text-neutral-500">
                            {isLoading ? (
                                <span className="inline-block w-20 h-3 bg-neutral-200 rounded animate-pulse" />
                            ) : (
                                <>
                                    <span className="font-semibold text-neutral-700">{total}</span>{' '}
                                    enseignant{total !== 1 ? 's' : ''}
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
                            onClick={() => navigate('/teachers/new')}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium 
                                       bg-gradient-to-r from-primary to-primary-light text-white 
                                       rounded-xl hover:shadow-lg hover:shadow-primary/25 
                                       transition-all duration-200 hover:-translate-y-0.5 shadow-md"
                        >
                            <Plus size={15} />
                            <span>Ajouter</span>
                        </button>
                    </div>
                )}
            </div>

            {/* —— Filters —— */}
            <TeacherFilters
                subjectId={subjectId}
                section={section}
                status={status}
                search={search}
                onSubjectChange={setSubjectId}
                onSectionChange={setSection}
                onStatusChange={setStatus}
                onSearchChange={setSearch}
            />

            {/* —— Loading skeleton —— */}
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

            {/* —— Empty state —— */}
            {!isLoading && teachers.length === 0 && (
                <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
                    <EmptyState
                        icon={<Users size={28} />}
                        title="Aucun enseignant trouvé"
                        description={
                            hasFiltersActive
                                ? 'Modifiez vos filtres pour voir plus de résultats.'
                                : "Aucun enseignant de l'école. Commencez par ajouter un enseignant."
                        }
                        action={
                            !hasFiltersActive &&
                                hasRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE') ? (
                                <button
                                    onClick={() => navigate('/teachers/new')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                                               bg-primary text-white rounded-lg hover:bg-primary-dark 
                                               transition-colors"
                                >
                                    <Plus size={14} />
                                    Ajouter le premier enseignant
                                </button>
                            ) : undefined
                        }
                    />
                </div>
            )}

            {/* —— Data table —— */}
            {!isLoading && teachers.length > 0 && (
                <div
                    className={`bg-white rounded-xl border border-neutral-300/50 overflow-hidden shadow-sm transition-opacity duration-200 ${isFetching ? 'opacity-70' : 'opacity-100'
                        }`}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full" id="teachers-table">
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
                                    <th className="px-3 py-3 text-left">Enseignant</th>
                                    <th className="px-3 py-3 text-left hidden md:table-cell">Matières</th>
                                    <th className="px-3 py-3 text-center hidden sm:table-cell">Classes</th>
                                    <th className="px-3 py-3 text-left hidden sm:table-cell">Statut</th>
                                    <th className="w-12 px-2 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {teachers.map((teacher: any) => (
                                    <TeacherRow
                                        key={teacher.id}
                                        teacher={teacher}
                                        isSelected={selectedIds.has(teacher.id)}
                                        onSelect={handleSelect}
                                        onAction={handleRowAction}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* —— Pagination —— */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
                        <p className="text-xs text-neutral-500">
                            Total :{' '}
                            <span className="font-semibold text-neutral-700">{total}</span> enseignants
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

            {/* —— Bulk Actions Bar —— */}
            <BulkActionsBar
                count={selectedIds.size}
                onExport={handleBulkExport}
                onPrint={handleBulkPrint}
                onArchive={handleBulkArchive}
                onClear={() => setSelectedIds(new Set())}
                isArchiving={archiveMutation.isPending}
            />

            {/* —— Import Modal —— */}
            <ImportTeachersModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
            />

            {/* —— Archive Confirm Modal —— */}
            <ConfirmModal
                isOpen={archiveModalOpen}
                title="Archiver cet enseignant ?"
                message="L'enseignant sera séparé dans les archives. Cette action peut être annulée par un administrateur."
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
};
