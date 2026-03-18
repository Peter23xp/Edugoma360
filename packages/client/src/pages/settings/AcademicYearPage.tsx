import { useState } from 'react';
import { Plus, GraduationCap, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { useAcademicYears } from '../../hooks/useAcademicYears';
import AcademicYearCard from '../../components/settings/AcademicYearCard';
import CreateYearModal from '../../components/settings/CreateYearModal';
import EditYearModal from '../../components/settings/EditYearModal';
import CloseYearModal from '../../components/settings/CloseYearModal';

export default function AcademicYearPage() {
    const { data, isLoading, isError, createYear, isCreating, updateYear, isUpdating, closeYear, isClosing } = useAcademicYears();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [yearToClose, setYearToClose] = useState<{ id: string; name: string } | null>(null);

    const handleCreate = async (formData: any) => {
        await createYear(formData);
    };

    const handleUpdate = async (id: string, formData: any) => {
        await updateYear({ id, data: formData });
    };

    const handleClose = async (id: string, ignoreDebts: boolean) => {
        await closeYear({ id, ignoreUnpaidDebts: ignoreDebts });
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                <p className="text-sm text-neutral-500">Chargement des années scolaires…</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                <AlertCircle size={36} className="text-red-400" />
                <p className="text-sm font-medium text-neutral-700">Impossible de charger les données</p>
                <p className="text-xs text-neutral-400">Vérifiez votre connexion et réessayez.</p>
            </div>
        );
    }

    const totalPast = data?.past?.length ?? 0;
    const hasCurrent = !!data?.current;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white border border-neutral-200 rounded-2xl px-6 py-5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <GraduationCap size={24} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900">Années Scolaires</h1>
                        <p className="text-sm text-neutral-500 mt-0.5">Gérez les périodes académiques et leur structure</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm shrink-0"
                >
                    <Plus size={16} />
                    Nouvelle année
                </button>
            </div>

            {/* ── Summary KPIs ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    {
                        label: "Année active",
                        value: hasCurrent ? data!.current!.name : '—',
                        sub: hasCurrent ? `${data!.current!.terms?.length ?? 0} périodes` : 'Aucune',
                        icon: Calendar,
                        color: hasCurrent ? 'text-green-600' : 'text-neutral-400',
                        bg: hasCurrent ? 'bg-green-50' : 'bg-neutral-50',
                    },
                    {
                        label: 'Années archivées',
                        value: String(totalPast),
                        sub: totalPast > 0 ? `Depuis ${data!.past[data!.past.length - 1]?.name?.slice(0, 4) ?? '—'}` : 'Aucune',
                        icon: BookOpen,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50',
                    },
                    {
                        label: 'Élèves (année active)',
                        value: hasCurrent && (data!.current as any).studentCount ? String((data!.current as any).studentCount) : '—',
                        sub: 'inscrits',
                        icon: GraduationCap,
                        color: 'text-primary',
                        bg: 'bg-primary/5',
                    },
                ].map((k, i) => (
                    <div key={i} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                        <div className={`p-2 rounded-lg ${k.bg} shrink-0`}>
                            <k.icon size={16} className={k.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-neutral-500 truncate">{k.label}</p>
                            <p className={`text-base font-bold mt-0.5 truncate ${k.color}`}>{k.value}</p>
                            <p className="text-xs text-neutral-400 truncate">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Active Year ───────────────────────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Année active</h2>
                </div>
                {data?.current ? (
                    <AcademicYearCard
                        year={data.current}
                        isPast={false}
                        onEditClick={() => setShowEditModal(true)}
                        onCloseClick={() => setYearToClose({ id: data.current!.id, name: data.current!.name })}
                    />
                ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
                        <GraduationCap size={36} className="mx-auto text-orange-400 mb-3" />
                        <p className="font-semibold text-orange-800 text-base">Aucune année scolaire active</p>
                        <p className="text-sm text-orange-600 mt-1.5 mb-5">
                            Créez une année scolaire pour commencer à utiliser le système.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors"
                        >
                            <Plus size={16} /> Créer une année
                        </button>
                    </div>
                )}
            </section>

            {/* ── Past Years ────────────────────────────────────────────────── */}
            {totalPast > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-neutral-400" />
                            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Années précédentes</h2>
                        </div>
                        <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full">
                            {totalPast} archivée{totalPast > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data!.past.map(year => (
                            <AcademicYearCard key={year.id} year={year} isPast={true} />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Modals ────────────────────────────────────────────────────── */}
            <CreateYearModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreate}
                isSubmitting={isCreating}
                hasActiveYear={hasCurrent}
                activeYearName={data?.current?.name}
            />

            <EditYearModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleUpdate}
                isSubmitting={isUpdating}
                year={data?.current}
            />

            {yearToClose && (
                <CloseYearModal
                    isOpen={!!yearToClose}
                    yearId={yearToClose.id}
                    yearName={yearToClose.name}
                    onClose={() => setYearToClose(null)}
                    onSubmit={handleClose}
                    isSubmitting={isClosing}
                />
            )}
        </div>
    );
}
