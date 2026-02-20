import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';
import TimetableGrid from '../../components/academic/TimetableGrid';

type ViewMode = 'teacher' | 'class';

export default function TimetablePage() {
    const user = useAuthStore((s) => s.user);
    const isTeacher = user?.role === 'ENSEIGNANT';
    const isPrefet = user?.role === 'PRÉFET';

    const [viewMode, setViewMode] = useState<ViewMode>(isTeacher ? 'teacher' : 'class');
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
        isTeacher ? user?.id || '' : ''
    );
    const [selectedClassId, setSelectedClassId] = useState<string>('');

    // Fetch timetable data
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
        enabled: (viewMode === 'teacher' && !!selectedTeacherId) || 
                 (viewMode === 'class' && !!selectedClassId),
    });

    // Fetch teachers (for Préfet)
    const { data: teachersData } = useQuery({
        queryKey: ['teachers'],
        queryFn: async () => {
            const response = await api.get('/teachers');
            return response.data;
        },
        enabled: isPrefet && viewMode === 'teacher',
    });

    // Fetch classes
    const { data: classesData } = useQuery({
        queryKey: ['classes'],
        queryFn: async () => {
            const response = await api.get('/classes?status=active');
            return response.data;
        },
        enabled: viewMode === 'class',
    });

    const periods = timetableData?.periods || [];
    const teachers = teachersData?.teachers || [];
    const classes = classesData?.classes || [];

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">
                                Emploi du Temps
                            </h1>
                            <p className="text-sm text-neutral-600 mt-1">
                                Consultez les horaires de cours
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar size={20} className="text-primary" />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* View Mode (only for Préfet) */}
                        {isPrefet && (
                            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('teacher')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium 
                                               transition-colors ${
                                                   viewMode === 'teacher'
                                                       ? 'bg-white text-primary shadow-sm'
                                                       : 'text-neutral-600 hover:text-neutral-900'
                                               }`}
                                >
                                    Par enseignant
                                </button>
                                <button
                                    onClick={() => setViewMode('class')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium 
                                               transition-colors ${
                                                   viewMode === 'class'
                                                       ? 'bg-white text-primary shadow-sm'
                                                       : 'text-neutral-600 hover:text-neutral-900'
                                               }`}
                                >
                                    Par classe
                                </button>
                            </div>
                        )}

                        {/* Teacher selector (for Préfet in teacher mode) */}
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

                        {/* Class selector */}
                        {viewMode === 'class' && (
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm 
                                           focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                           bg-white min-w-[250px]"
                            >
                                <option value="">Sélectionnez une classe</option>
                                {classes.map((classItem: any) => (
                                    <option key={classItem.id} value={classItem.id}>
                                        {classItem.name} - {classItem.section.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <Loader2 size={32} className="animate-spin mx-auto text-primary mb-4" />
                        <p className="text-sm text-neutral-600">Chargement de l'emploi du temps...</p>
                    </div>
                ) : !selectedTeacherId && !selectedClassId ? (
                    <div className="text-center py-12">
                        <Calendar size={48} className="mx-auto text-neutral-400 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                            Sélectionnez {viewMode === 'teacher' ? 'un enseignant' : 'une classe'}
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
                            L'emploi du temps est vide pour le moment
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Info */}
                        <div className="mb-6">
                            <p className="text-sm text-neutral-600">
                                {periods.length} cours programmé{periods.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Timetable Grid */}
                        <TimetableGrid
                            periods={periods}
                            showTeacher={viewMode === 'class'}
                            canEdit={isPrefet}
                        />

                        {/* Legend */}
                        <div className="mt-6 p-4 bg-white rounded-lg border border-neutral-200">
                            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                                Légende des couleurs
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 
                                                    rounded" />
                                    <span className="text-xs text-neutral-600">
                                        Tronc Commun (TC)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-100 border-2 border-green-300 
                                                    rounded" />
                                    <span className="text-xs text-neutral-600">
                                        Scientifique (Sc)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 
                                                    rounded" />
                                    <span className="text-xs text-neutral-600">
                                        Histoire-Géo-Civisme (HCG)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 
                                                    rounded" />
                                    <span className="text-xs text-neutral-600">Pédagogie (Péd)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-100 border-2 border-red-300 
                                                    rounded" />
                                    <span className="text-xs text-neutral-600">
                                        Hôtellerie-Tourisme (HT)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-indigo-100 border-2 border-indigo-300 
                                                    rounded" />
                                    <span className="text-xs text-neutral-600">Littéraire (Lit)</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
