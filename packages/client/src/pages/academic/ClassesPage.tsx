import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import ClassCard from '../../components/academic/ClassCard';
import ClassFormModal from '../../components/academic/ClassFormModal';
import TeacherAssignmentModal from '../../components/academic/TeacherAssignmentModal';

interface ClassFilters {
    sectionId?: string;
    status?: 'active' | 'archived';
    search?: string;
}

export default function ClassesPage() {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<ClassFilters>({ status: 'active' });
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [editingClassId, setEditingClassId] = useState<string | null>(null);

    // Fetch classes
    const { data: classesData, isLoading } = useQuery({
        queryKey: ['classes', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.sectionId) params.append('sectionId', filters.sectionId);
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);

            const response = await api.get(`/classes?${params.toString()}`);
            return response.data;
        },
    });

    // Fetch sections for filters
    const { data: sectionsData } = useQuery({
        queryKey: ['sections'],
        queryFn: async () => {
            const response = await api.get('/settings/sections');
            return response.data;
        },
    });

    // Archive mutation
    const archiveMutation = useMutation({
        mutationFn: async (classId: string) => {
            await api.delete(`/classes/${classId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            toast.success('Classe archivée avec succès');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'archivage');
        },
    });

    const handleEdit = (classId: string) => {
        setEditingClassId(classId);
        setIsFormModalOpen(true);
    };

    const handleAssignTeachers = (classId: string) => {
        setSelectedClassId(classId);
        setIsAssignmentModalOpen(true);
    };

    const handleArchive = (classId: string) => {
        if (confirm('Êtes-vous sûr de vouloir archiver cette classe ?')) {
            archiveMutation.mutate(classId);
        }
    };

    const handleCreateNew = () => {
        setEditingClassId(null);
        setIsFormModalOpen(true);
    };

    const classes = classesData?.classes || [];
    const sections = sectionsData?.data || [];

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">
                                Gestion des Classes
                            </h1>
                            <p className="text-sm text-neutral-600 mt-1">
                                Créer et gérer les classes de l'école
                            </p>
                        </div>

                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary 
                                       text-white rounded-lg hover:bg-primary-dark font-medium 
                                       text-sm transition-colors"
                        >
                            <Plus size={16} />
                            Créer une classe
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <input
                                type="text"
                                placeholder="Rechercher une classe..."
                                value={filters.search || ''}
                                onChange={(e) =>
                                    setFilters({ ...filters, search: e.target.value })
                                }
                                className="w-full pl-10 pr-4 py-2 border border-neutral-300 
                                           rounded-lg text-sm focus:ring-2 focus:ring-primary/20 
                                           focus:border-primary"
                            />
                        </div>

                        {/* Section filter */}
                        <select
                            value={filters.sectionId || ''}
                            onChange={(e) =>
                                setFilters({ ...filters, sectionId: e.target.value || undefined })
                            }
                            className="px-4 py-2 border border-neutral-300 rounded-lg text-sm 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       bg-white"
                        >
                            <option value="">Toutes les sections</option>
                            {sections.map((section: any) => (
                                <option key={section.id} value={section.id}>
                                    {section.name}
                                </option>
                            ))}
                        </select>

                        {/* Status filter */}
                        <select
                            value={filters.status || 'active'}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    status: e.target.value as 'active' | 'archived',
                                })
                            }
                            className="px-4 py-2 border border-neutral-300 rounded-lg text-sm 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       bg-white"
                        >
                            <option value="active">Classes actives</option>
                            <option value="archived">Classes archivées</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 
                                        border-b-2 border-primary" />
                        <p className="text-sm text-neutral-600 mt-4">Chargement...</p>
                    </div>
                ) : classes.length === 0 ? (
                    <div className="text-center py-12">
                        <Filter size={48} className="mx-auto text-neutral-400 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                            Aucune classe trouvée
                        </h3>
                        <p className="text-sm text-neutral-600 mb-6">
                            {filters.search || filters.sectionId
                                ? 'Essayez de modifier vos filtres'
                                : 'Commencez par créer votre première classe'}
                        </p>
                        {!filters.search && !filters.sectionId && (
                            <button
                                onClick={handleCreateNew}
                                className="inline-flex items-center gap-2 px-4 py-2 
                                           bg-primary text-white rounded-lg hover:bg-primary-dark"
                            >
                                <Plus size={16} />
                                Créer une classe
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="mb-6">
                            <p className="text-sm text-neutral-600">
                                {classes.length} classe{classes.length > 1 ? 's' : ''} trouvée
                                {classes.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map((classItem: any) => (
                                <ClassCard
                                    key={classItem.id}
                                    classData={classItem}
                                    onEdit={handleEdit}
                                    onAssignTeachers={handleAssignTeachers}
                                    onArchive={handleArchive}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            {isFormModalOpen && (
                <ClassFormModal
                    classId={editingClassId}
                    onClose={() => {
                        setIsFormModalOpen(false);
                        setEditingClassId(null);
                    }}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['classes'] });
                        setIsFormModalOpen(false);
                        setEditingClassId(null);
                    }}
                />
            )}

            {isAssignmentModalOpen && selectedClassId && (
                <TeacherAssignmentModal
                    classId={selectedClassId}
                    onClose={() => {
                        setIsAssignmentModalOpen(false);
                        setSelectedClassId(null);
                    }}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['classes'] });
                        setIsAssignmentModalOpen(false);
                        setSelectedClassId(null);
                    }}
                />
            )}
        </div>
    );
}
