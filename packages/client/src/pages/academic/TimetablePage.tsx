import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Loader2, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';
import TimetableGrid from '../../components/academic/TimetableGrid';
import PeriodFormModal from '../../components/academic/PeriodFormModal';
import type { TimetablePeriod, DayOfWeek } from '@edugoma360/shared/types/academic';

type ViewMode = 'teacher' | 'class';

// â”€â”€ Interface légère pour le modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface SelectedCell {
    dayOfWeek: DayOfWeek;
    periodNumber: number;
    existingPeriod?: TimetablePeriod; // undefined = création
}

export default function TimetablePage() {
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const isTeacher = user?.role === 'ENSEIGNANT';
    const isPrefet = user?.role === 'PREFET';

    const [viewMode, setViewMode] = useState<ViewMode>(isTeacher ? 'teacher' : 'class');
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
        isTeacher ? user?.id || '' : ''
    );
    const [selectedClassId, setSelectedClassId] = useState<string>('');

    // Modal état
    const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);

    // â”€â”€ Emploi du temps principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: timetableData, isLoading } = useQuery({
        queryKey: ['timetable', viewMode, selectedTeacherId, selectedClassId],
        queryFn: async () => {
            if (viewMode === 'teacher' && selectedTeacherId) {
                const response = await api.get(`/timetable/teacher/${selectedTeacherId}`);
                return response.data;
            } else if (viewMode === 'class' && selectedClassId) {
                const response = await api.get(`/timetable/class/${selectedClassId}`);
                return response.data;
            }
            return { periods: [] };
        },
        enabled:
            (viewMode === 'teacher' && !!selectedTeacherId) ||
            (viewMode === 'class' && !!selectedClassId),
    });

    // â”€â”€ Enseignants (Préfet) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: teachersData } = useQuery({
        queryKey: ['teachers'],
        queryFn: async () => {
            const response = await api.get('/teachers');
            return response.data;
        },
        enabled: isPrefet,
    });

    // â”€â”€ Classes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: classesData } = useQuery({
        queryKey: ['classes'],
        queryFn: async () => {
            const response = await api.get('/classes?status=active');
            return response.data;
        },
    });

    // â”€â”€ Matières (pour le modal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects'],
        queryFn: async () => {
            const response = await api.get('/subjects');
            return response.data;
        },
        enabled: isPrefet, // seulement utile pour l'édition
    });

    // â”€â”€ Mutation : ajouter une période â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const addPeriodMutation = useMutation({
        mutationFn: async (payload: {
            classId: string;
            subjectId: string;
            teacherId: string;
            dayOfWeek: DayOfWeek;
            periodNumber: number;
            academicYearId: string;
        }) => {
            const res = await api.post('/timetable', payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Cours ajouté avec succès');
            queryClient.invalidateQueries({ queryKey: ['timetable'] });
            setSelectedCell(null);
        },
        onError: () => {
            toast.error("Erreur lors de l'ajout du cours");
        },
    });

    // â”€â”€ Mutation : supprimer une période â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const deletePeriodMutation = useMutation({
        mutationFn: async (periodId: string) => {
            const res = await api.delete(`/timetable/${periodId}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Cours supprimé');
            queryClient.invalidateQueries({ queryKey: ['timetable'] });
            setSelectedCell(null);
        },
        onError: () => {
            toast.error('Erreur lors de la suppression');
        },
    });

    // â”€â”€ Vérification conflits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const checkConflicts = async (payload: {
        teacherId: string;
        classId: string;
        dayOfWeek: DayOfWeek;
        periodNumber: number;
        excludePeriodId?: string;
    }) => {
        try {
            const res = await api.post('/timetable/conflicts', payload);
            return res.data?.conflicts ?? [];
        } catch {
            return [];
        }
    };

    // â”€â”€ Handler : clic sur cellule (vide ou existante) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleCellClick = (period: TimetablePeriod) => {
        if (!isPrefet) return;

        if (period.id === '__new__') {
            // Cellule vide â†’ création
            setSelectedCell({
                dayOfWeek: period.dayOfWeek,
                periodNumber: period.periodNumber,
                existingPeriod: undefined,
            });
        } else {
            // Période existante â†’ modification
            setSelectedCell({
                dayOfWeek: period.dayOfWeek,
                periodNumber: period.periodNumber,
                existingPeriod: period,
            });
        }
    };

    const periods = timetableData?.periods || timetableData?.data || [];
    const teachers = teachersData?.teachers || [];
    const classes = classesData?.classes || [];
    const subjects = subjectsData?.subjects || [];

    // Académique year courant (depuis la première classe disponible ou user)
    const currentAcademicYearId =
        (user as any)?.school?.currentAcademicYearId ?? '';

    return (
        <div className="min-h-screen bg-neutral-50">

            {/* â”€â”€ En-tête â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">
                                Emploi du Temps
                            </h1>
                            <p className="text-sm text-neutral-600 mt-1">
                                Consultez les horaires de cours
                                {isPrefet && (
                                    <span className="ml-2 text-xs text-primary font-medium">
                                        Â· Cliquez sur une cellule pour ajouter ou modifier un cours
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar size={20} className="text-primary" />
                            {isPrefet && (
                                <button
                                    onClick={() =>
                                        setSelectedCell({
                                            dayOfWeek: 'MONDAY',
                                            periodNumber: 1,
                                        })
                                    }
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white
                                               rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    <PlusCircle size={16} />
                                    Ajouter un cours
                                </button>
                            )}
                        </div>
                    </div>

                    {/* â”€â”€ Filtres â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <div className="flex flex-wrap items-center gap-4">

                        {/* Basculer vue (Préfet seulement) */}
                        {isPrefet && (
                            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('teacher')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'teacher'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-neutral-600 hover:text-neutral-900'
                                        }`}
                                >
                                    Par enseignant
                                </button>
                                <button
                                    onClick={() => setViewMode('class')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'class'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-neutral-600 hover:text-neutral-900'
                                        }`}
                                >
                                    Par classe
                                </button>
                            </div>
                        )}

                        {/* Sélecteur enseignant (Préfet en mode enseignant) */}
                        {isPrefet && viewMode === 'teacher' && (
                            <select
                                value={selectedTeacherId}
                                onChange={(e) => setSelectedTeacherId(e.target.value)}
                                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm
                                           focus:ring-2 focus:ring-primary/20 focus:border-primary
                                           bg-white min-w-[250px]"
                            >
                                <option value="">Sélectionnez un enseignant</option>
                                {teachers.map((teacher: any) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.nom} {teacher.prenom || ''}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Sélecteur classe */}
                        {viewMode === 'class' && (
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm
                                           focus:ring-2 focus:ring-primary/20 focus:border-primary
                                           bg-white min-w-[250px]"
                            >
                                <option value="">Sélectionnez une classe</option>
                                {classes.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} — {c.section?.name ?? c.sectionName ?? ''}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* â”€â”€ Contenu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <Loader2 size={32} className="animate-spin mx-auto text-primary mb-4" />
                        <p className="text-sm text-neutral-600">
                            Chargement de l'emploi du temps…
                        </p>
                    </div>
                ) : !selectedTeacherId && !selectedClassId ? (
                    <div className="text-center py-12">
                        <Calendar size={48} className="mx-auto text-neutral-400 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                            Sélectionnez{' '}
                            {viewMode === 'teacher' ? 'un enseignant' : 'une classe'}
                        </h3>
                        <p className="text-sm text-neutral-600">
                            Utilisez le sélecteur ci-dessus pour afficher l'emploi du temps
                        </p>
                    </div>
                ) : periods.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar size={48} className="mx-auto text-neutral-400 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                            Aucun cours programmé
                        </h3>
                        <p className="text-sm text-neutral-600">
                            L'emploi du temps est vide pour le moment.
                            {isPrefet && (
                                <span className="block mt-1 text-primary">
                                    Cliquez sur une cellule pour ajouter un cours.
                                </span>
                            )}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <p className="text-sm text-neutral-600">
                                {periods.length} cours programmé{periods.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Grille emploi du temps */}
                        <TimetableGrid
                            periods={periods}
                            onEditPeriod={isPrefet ? handleCellClick : undefined}
                            showTeacher={viewMode === 'class'}
                            canEdit={isPrefet}
                        />

                        {/* Légende */}
                        <div className="mt-6 p-4 bg-white rounded-lg border border-neutral-200">
                            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                                Légende des couleurs
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { color: 'bg-blue-100 border-blue-300', label: 'Tronc Commun (TC)' },
                                    { color: 'bg-green-100 border-green-300', label: 'Scientifique (Sc)' },
                                    { color: 'bg-orange-100 border-orange-300', label: 'Histoire-Géo-Civisme (HCG)' },
                                    { color: 'bg-purple-100 border-purple-300', label: 'Pédagogie (Péd)' },
                                    { color: 'bg-red-100 border-red-300', label: 'Hôtellerie-Tourisme (HT)' },
                                    { color: 'bg-indigo-100 border-indigo-300', label: 'Littéraire (Lit)' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <div className={`w-4 h-4 ${item.color} border-2 rounded`} />
                                        <span className="text-xs text-neutral-600">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* â”€â”€ Modal PeriodFormModal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {selectedCell && isPrefet && (
                <PeriodFormModal
                    period={selectedCell.existingPeriod ?? null}
                    dayOfWeek={selectedCell.dayOfWeek}
                    periodNumber={selectedCell.periodNumber}
                    classes={classes.map((c: any) => ({
                        id: c.id,
                        name: c.name,
                        sectionName: c.section?.name ?? c.sectionName ?? '',
                    }))}
                    subjects={subjects.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        abbreviation: s.abbreviation ?? s.name.slice(0, 4).toUpperCase(),
                    }))}
                    teachers={teachers.map((t: any) => ({
                        id: t.id,
                        nom: t.nom,
                        prenom: t.prenom,
                    }))}
                    academicYearId={currentAcademicYearId}
                    onCheckConflicts={checkConflicts}
                    onSave={(payload) => addPeriodMutation.mutate(payload)}
                    onDelete={
                        selectedCell.existingPeriod
                            ? (id) => deletePeriodMutation.mutate(id)
                            : undefined
                    }
                    onClose={() => setSelectedCell(null)}
                    isLoading={
                        addPeriodMutation.isPending || deletePeriodMutation.isPending
                    }
                />
            )}
        </div>
    );
}
