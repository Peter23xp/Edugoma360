import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface ClassFormModalProps {
    classId: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormData {
    sectionId: string;
    name: string;
    maxStudents: number;
}

export default function ClassFormModal({ classId, onClose, onSuccess }: ClassFormModalProps) {
    const isEdit = !!classId;

    const [formData, setFormData] = useState<FormData>({
        sectionId: '',
        name: '',
        maxStudents: 45,
    });

    const [autoGenerateName, setAutoGenerateName] = useState(true);

    // Fetch existing class data for edit
    const { data: classData } = useQuery({
        queryKey: ['class', classId],
        queryFn: async () => {
            const response = await api.get(`/classes/${classId}`);
            return response.data;
        },
        enabled: isEdit,
    });

    // Fetch sections
    const { data: sectionsData } = useQuery({
        queryKey: ['sections'],
        queryFn: async () => {
            const response = await api.get('/settings/sections');
            return response.data;
        },
    });

    // Load class data for edit
    useEffect(() => {
        if (classData?.class) {
            setFormData({
                sectionId: classData.class.sectionId,
                name: classData.class.name,
                maxStudents: classData.class.maxStudents,
            });
            setAutoGenerateName(false);
        }
    }, [classData]);

    const sections = sectionsData?.data || [];

    // Auto-generate name
    useEffect(() => {
        if (autoGenerateName && formData.sectionId && !isEdit) {
            const section = sections.find((s: any) => s.id === formData.sectionId);
            if (section) {
                // Generate name like "1TC-A", "4ScA", "5PédB"
                const sectionCode = section.code || section.name.substring(0, 3);
                const name = `${sectionCode}-A`;
                setFormData((prev) => ({ ...prev, name }));
            }
        }
    }, [formData.sectionId, autoGenerateName, isEdit, sections]);

    // Create/Update mutation
    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            if (isEdit) {
                return api.patch(`/classes/${classId}`, {
                    maxStudents: data.maxStudents,
                });
            }
            return api.post('/classes', data);
        },
        onSuccess: () => {
            toast.success(isEdit ? 'Classe modifiée avec succès' : 'Classe créée avec succès');
            onSuccess();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Une erreur est survenue');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.sectionId) {
            toast.error('Veuillez sélectionner une section');
            return;
        }
        if (!formData.name.trim()) {
            toast.error('Le nom de la classe est requis');
            return;
        }
        if (formData.maxStudents < 20 || formData.maxStudents > 60) {
            toast.error('L\'effectif maximum doit être entre 20 et 60');
            return;
        }

        mutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-[#0F1E12]/45 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl border border-neutral-200 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <h2 className="text-base font-bold text-neutral-900">
                        {isEdit ? 'Modifier la classe' : 'Créer une classe'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 text-neutral-400 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Section */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                            Section <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.sectionId}
                            onChange={(e) =>
                                setFormData({ ...formData, sectionId: e.target.value })
                            }
                            disabled={isEdit}
                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm text-neutral-900 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                            required
                        >
                            <option value="">Sélectionnez une section</option>
                            {sections.map((section: any) => (
                                <option key={section.id} value={section.id}>
                                    {section.name}
                                </option>
                            ))}
                        </select>
                        {isEdit && (
                            <p className="text-xs text-neutral-500 mt-1">
                                La section ne peut pas être modifiée
                            </p>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                            Nom de la classe <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                setAutoGenerateName(false);
                            }}
                            disabled={isEdit}
                            placeholder="Ex: 4ScA, 1TC-B, 5PédA"
                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm text-neutral-900 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                            required
                        />
                        {!isEdit && (
                            <label className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    checked={autoGenerateName}
                                    onChange={(e) => setAutoGenerateName(e.target.checked)}
                                    className="w-4 h-4 text-primary focus:ring-primary/20"
                                />
                                <span className="text-sm text-neutral-600">
                                    Générer automatiquement
                                </span>
                            </label>
                        )}
                        {isEdit && (
                            <p className="text-xs text-neutral-500 mt-1">
                                Le nom ne peut pas être modifié
                            </p>
                        )}
                    </div>

                    {/* Max Students */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                            Effectif maximum <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="20"
                            max="60"
                            value={formData.maxStudents}
                            onChange={(e) =>
                                setFormData({ ...formData, maxStudents: parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm text-neutral-900"
                            required
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                            Entre 20 et 60 élèves
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 border-t border-neutral-200 flex gap-3 -mx-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
                            {isEdit ? 'Enregistrer' : 'Créer la classe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
