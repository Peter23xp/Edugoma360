import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, School, AlertCircle, Search } from 'lucide-react';
import { useClasses, useSectionsForFilter } from '../../hooks/useClasses';
import ClassStatsCards from '../../components/settings/ClassStatsCards';
import ClassCard from '../../components/settings/ClassCard';
import CreateClassModal from '../../components/settings/CreateClassModal';
import EditClassModal from '../../components/settings/EditClassModal';
import AssignTeachersModal from '../../components/settings/AssignTeachersModal';
import TimetableGeneratorModal from '../../components/settings/TimetableGeneratorModal';

export default function ClassesManagementPage() {
    const navigate = useNavigate();
    const [filterSection, setFilterSection] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [assignTarget, setAssignTarget] = useState<{ id: string; name: string; sectionCode: string } | null>(null);
    const [timetableTarget, setTimetableTarget] = useState<{ id: string; name: string } | null>(null);
    const [editTarget, setEditTarget] = useState<any | null>(null);

    const { data: sectionsFilter } = useSectionsForFilter();
    const {
        data,
        isLoading,
        isError,
        createClass,
        isCreating,
        updateClass,
        isUpdating,
        deleteClass,
        assignTeachers,
        isAssigning,
        generateTimetable,
    } = useClasses(filterSection || undefined, searchTerm || undefined);

    // Unique section codes for filter dropdown
    const uniqueSections = useMemo(() => {
        if (!sectionsFilter) return [];
        const map = new Map<string, string>();
        sectionsFilter.forEach(s => map.set(s.code, s.name));
        return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
    }, [sectionsFilter]);

    // Group classes by section code
    const grouped = useMemo(() => {
        if (!data?.classes) return {};
        const map: Record<string, typeof data.classes> = {};
        for (const c of data.classes) {
            const key = c.section?.code || 'Autre';
            if (!map[key]) map[key] = [];
            map[key].push(c);
        }
        return map;
    }, [data?.classes]);

    // ── Handlers ─────────────────────────────────────────────────
    const handleCreate = async (formData: any) => {
        await createClass(formData);
    };

    const handleEdit = (id: string) => {
        const c = data?.classes.find(cl => cl.id === id);
        if (!c) return;
        setEditTarget(c);
    };

    const handleUpdateClass = async (id: string, updateData: any) => {
        await updateClass({ id, data: updateData });
    };

    const handleViewDetails = (id: string) => {
        // Navigate to class detail page
        navigate(`/settings/classes/${id}`);
    };

    const handleDelete = async (id: string) => {
        await deleteClass(id);
    };

    const handleOpenAssign = (id: string) => {
        const c = data?.classes.find(cl => cl.id === id);
        if (!c) return;
        setAssignTarget({ id: c.id, name: c.name, sectionCode: c.section?.code || '' });
    };

    const handleAssign = async (payload: { classId: string; assignments: any[]; titulaireId?: string }) => {
        await assignTeachers(payload);
    };

    const handleOpenTimetable = (id: string) => {
        const c = data?.classes.find(cl => cl.id === id);
        if (!c) return;
        setTimetableTarget({ id: c.id, name: c.name });
    };

    const stats = data?.stats || { total: 0, complete: 0, avgStudents: 0, roomsUsed: 0, totalStudents: 0 };
    const sectionKeys = Object.keys(grouped);

    return (
        <div className="space-y-8 pb-12">

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <School size={24} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Gestion des Classes</h1>
                        <p className="text-sm text-neutral-500 mt-0.5">Créez et gérez les classes, attribuez les enseignants</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-all shadow-sm shrink-0 w-full sm:w-auto"
                >
                    <Plus size={16} />
                    Créer classe
                </button>
            </div>

            {/* ── Stats ───────────────────────────────────────────────── */}
            <ClassStatsCards stats={stats} />

            {/* ── Filters ─────────────────────────────────────────────── */}
            <div className="bg-white border border-neutral-300/50 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row gap-4">
                <select
                    value={filterSection}
                    onChange={e => setFilterSection(e.target.value)}
                    className="border border-neutral-300/50 rounded-md px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:w-56 w-full sm:w-auto"
                >
                    <option value="">Toutes les sections</option>
                    {uniqueSections.map(s => (
                        <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                </select>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Rechercher une classe…"
                        className="w-full border border-neutral-300/50 rounded-md pl-10 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* ── Classes List & Loading States ───────────────────────── */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                    <p className="text-sm text-neutral-500">Recherche des classes…</p>
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                    <AlertCircle size={36} className="text-error" />
                    <p className="text-sm font-medium text-neutral-700">Impossible de charger les données</p>
                    <p className="text-xs text-neutral-500">Vérifiez votre connexion et réessayez.</p>
                </div>
            ) : sectionKeys.length === 0 ? (
                <div className="bg-white border border-neutral-300/50 rounded-lg p-12 text-center shadow-sm">
                    <School size={48} className="mx-auto text-neutral-300 mb-4" />
                    <p className="font-bold text-neutral-800 text-lg">Aucune classe trouvée</p>
                    <p className="text-sm text-neutral-500 mt-2 mb-6 max-w-sm mx-auto">
                        Il n'y a aucune classe correspondant à vos critères de recherche.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors shadow-sm w-full sm:w-auto"
                    >
                        <Plus size={16} /> Créer une classe
                    </button>
                </div>
            ) : (
                sectionKeys.map(sectionCode => (
                    <section key={sectionCode} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                {grouped[sectionCode][0]?.section?.name || sectionCode}
                            </h2>
                            <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                                {grouped[sectionCode].length} classe{grouped[sectionCode].length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {grouped[sectionCode].map(c => (
                                <ClassCard
                                    key={c.id}
                                    classItem={c}
                                    onEdit={handleEdit}
                                    onViewDetails={handleViewDetails}
                                    onAssignTeachers={handleOpenAssign}
                                    onViewTimetable={handleOpenTimetable}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </section>
                ))
            )}

            {/* ── Modals ──────────────────────────────────────────────── */}
            <CreateClassModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreate}
                isSubmitting={isCreating}
            />

            {assignTarget && (
                <AssignTeachersModal
                    isOpen={!!assignTarget}
                    onClose={() => setAssignTarget(null)}
                    onSubmit={handleAssign}
                    isSubmitting={isAssigning}
                    classId={assignTarget.id}
                    className={assignTarget.name}
                    sectionCode={assignTarget.sectionCode}
                />
            )}

            {timetableTarget && (
                <TimetableGeneratorModal
                    isOpen={!!timetableTarget}
                    onClose={() => setTimetableTarget(null)}
                    classId={timetableTarget.id}
                    className={timetableTarget.name}
                    generateTimetable={generateTimetable}
                />
            )}

            {editTarget && (
                <EditClassModal
                    isOpen={!!editTarget}
                    onClose={() => setEditTarget(null)}
                    onSubmit={handleUpdateClass}
                    isSubmitting={isUpdating}
                    classData={editTarget}
                />
            )}
        </div>
    );
}
