import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface TeacherAssignmentModalProps {
    classId: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface Assignment {
    subjectId: string;
    teacherId: string;
}

export default function TeacherAssignmentModal({
    classId,
    onClose,
    onSuccess,
}: TeacherAssignmentModalProps) {
    const [assignments, setAssignments] = useState<Record<string, string>>({});

    // Fetch class details
    const { data: classData } = useQuery({
        queryKey: ['class', classId],
        queryFn: async () => {
            const response = await api.get(`/classes/${classId}`);
            return response.data;
        },
    });

    // Fetch subjects for the class section
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects', classData?.class?.sectionId],
        queryFn: async () => {
            const response = await api.get('/subjects', {
                params: { sectionId: classData?.class?.sectionId },
            });
            return response.data;
        },
        enabled: !!classData?.class?.sectionId,
    });

    // Fetch teachers
    const { data: teachersData } = useQuery({
        queryKey: ['teachers'],
        queryFn: async () => {
            const response = await api.get('/teachers');
            return response.data;
        },
    });

    // Fetch existing assignments
    const { data: existingAssignments } = useQuery({
        queryKey: ['class-assignments', classId],
        queryFn: async () => {
            const response = await api.get(`/classes/${classId}/assignments`);
            return response.data;
        },
    });

    // Load existing assignments
    useEffect(() => {
        if (existingAssignments?.assignments) {
            const assignmentsMap: Record<string, string> = {};
            existingAssignments.assignments.forEach((assignment: any) => {
                assignmentsMap[assignment.subjectId] = assignment.teacherId;
            });
            setAssignments(assignmentsMap);
        }
    }, [existingAssignments]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async (data: Assignment[]) => {
            await api.post(`/classes/${classId}/assign-teachers`, { assignments: data });
        },
        onSuccess: () => {
            toast.success('Attributions enregistrées avec succès');
            onSuccess();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        },
    });

    const handleSave = () => {
        const assignmentsArray: Assignment[] = Object.entries(assignments)
            .filter(([_, teacherId]) => teacherId) // Only include assigned subjects
            .map(([subjectId, teacherId]) => ({ subjectId, teacherId }));

        saveMutation.mutate(assignmentsArray);
    };

    const subjects = subjectsData?.subjects || [];
    const teachers = teachersData?.teachers || [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900">
                            Attribution des cours
                        </h2>
                        <p className="text-sm text-neutral-600 mt-1">
                            {classData?.class?.name} — {classData?.class?.section?.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-neutral-100 rounded transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {subjects.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-600">
                                Aucune matière disponible pour cette section
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Table Header */}
                            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-neutral-200">
                                <div className="text-sm font-semibold text-neutral-700">
                                    Matière
                                </div>
                                <div className="text-sm font-semibold text-neutral-700">
                                    Enseignant assigné
                                </div>
                            </div>

                            {/* Assignments */}
                            {subjects.map((subject: any) => (
                                <div
                                    key={subject.id}
                                    className="grid grid-cols-2 gap-4 items-center py-3 
                                               border-b border-neutral-100"
                                >
                                    <div className="text-sm font-medium text-neutral-900">
                                        {subject.name}
                                    </div>
                                    <div>
                                        <select
                                            value={assignments[subject.id] || ''}
                                            onChange={(e) =>
                                                setAssignments({
                                                    ...assignments,
                                                    [subject.id]: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-neutral-300 
                                                       rounded-lg text-sm focus:ring-2 
                                                       focus:ring-primary/20 focus:border-primary 
                                                       bg-white"
                                        >
                                            <option value="">Non assigné</option>
                                            {teachers.map((teacher: any) => (
                                                <option key={teacher.id} value={teacher.id}>
                                                    {teacher.nom} {teacher.prenom}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            💡 Un enseignant peut être assigné à plusieurs matières dans plusieurs
                            classes. Les attributions peuvent être modifiées à tout moment.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t 
                                border-neutral-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-neutral-700 
                                   hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white 
                                   rounded-lg hover:bg-primary-dark font-medium text-sm 
                                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saveMutation.isPending ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Enregistrer les attributions
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
