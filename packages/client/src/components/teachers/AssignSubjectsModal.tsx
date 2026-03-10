import React, { useState } from 'react';
import { X, BookOpen, School, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

interface AssignSubjectsModalProps {
    teacherId: string;
    teacherName: string;
    isOpen: boolean;
    onClose: () => void;
}

const MAX_CLASSES = 10;

const AssignSubjectsModal: React.FC<AssignSubjectsModalProps> = ({
    teacherId,
    teacherName,
    isOpen,
    onClose,
}) => {
    const queryClient = useQueryClient();
    const [selectedClassSubjects, setSelectedClassSubjects] = useState<
        Array<{ classId: string; subjectId: string; volumeHoraire: number }>
    >([]);

    const { data: classes = [] } = useQuery({
        queryKey: ['all-classes'],
        queryFn: async () => {
            const { data } = await api.get('/classes');
            return data.data || data;
        },
        enabled: isOpen,
    });

    const { data: subjects = [] } = useQuery({
        queryKey: ['all-subjects'],
        queryFn: async () => {
            const { data } = await api.get('/settings/subjects');
            return data.data || data;
        },
        enabled: isOpen,
    });

    const assignMutation = useMutation({
        mutationFn: async () => {
            const { data } = await api.post(`/teachers/${teacherId}/assign`, {
                affectations: selectedClassSubjects
            });
            return data;
        },
        onSuccess: () => {
            toast.success('Classes attribuées avec succès !');
            queryClient.invalidateQueries({ queryKey: ['teacher', teacherId] });
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'attribution');
        }
    });

    if (!isOpen) return null;

    const totalClasses = selectedClassSubjects.length;
    const isOverLimit = totalClasses >= MAX_CLASSES;

    const toggleClassSubject = (classId: string, subjectId: string) => {
        const exists = selectedClassSubjects.some(cs => cs.classId === classId && cs.subjectId === subjectId);

        if (exists) {
            setSelectedClassSubjects(prev => prev.filter(cs => !(cs.classId === classId && cs.subjectId === subjectId)));
        } else {
            if (isOverLimit) {
                toast.error(`Maximum ${MAX_CLASSES} classes autorisées`);
                return;
            }
            setSelectedClassSubjects(prev => [...prev, { classId, subjectId, volumeHoraire: 2 }]);
        }
    };

    const updateVolumeHoraire = (classId: string, subjectId: string, value: number) => {
        setSelectedClassSubjects(prev =>
            prev.map(cs =>
                cs.classId === classId && cs.subjectId === subjectId
                    ? { ...cs, volumeHoraire: value }
                    : cs
            )
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                            <BookOpen size={24} className="text-green-700" />
                            Attribuer des Classes
                        </h2>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {teacherName} — {totalClasses}/{MAX_CLASSES} classes
                        </p>
                    </div>
                    <button id="close-assign-modal" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                        <X size={22} />
                    </button>
                </div>

                {/* Limit warning */}
                {isOverLimit && (
                    <div className="mx-6 mt-4 flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-xs font-bold">
                        <AlertTriangle size={16} />
                        Maximum {MAX_CLASSES} classes atteint
                    </div>
                )}

                {/* Class × Subject grid */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {classes.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">
                            Aucune classe disponible
                        </div>
                    ) : (
                        classes.map((cls: any) => (
                            <div key={cls.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                                <div className="flex items-center gap-3 p-3 bg-gray-50/50">
                                    <School size={16} className="text-green-700" />
                                    <span className="font-black text-gray-900 text-sm uppercase tracking-wide">{cls.name}</span>
                                    <span className="text-xs text-gray-400 font-bold uppercase">{cls.section?.code}</span>
                                </div>
                                <div className="p-3 flex flex-wrap gap-2">
                                    {subjects.map((sub: any) => {
                                        const isSelected = selectedClassSubjects.some(
                                            cs => cs.classId === cls.id && cs.subjectId === sub.id
                                        );
                                        const current = selectedClassSubjects.find(
                                            cs => cs.classId === cls.id && cs.subjectId === sub.id
                                        );
                                        return (
                                            <div key={sub.id} className="flex flex-col items-center gap-1">
                                                <button
                                                    id={`assign-${cls.id}-${sub.id}`}
                                                    onClick={() => toggleClassSubject(cls.id, sub.id)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isSelected
                                                        ? 'bg-green-700 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700'
                                                        }`}
                                                >
                                                    {isSelected && <CheckCircle size={12} />}
                                                    {sub.abbreviation || sub.name}
                                                </button>
                                                {isSelected && (
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={30}
                                                        value={current?.volumeHoraire || 2}
                                                        onChange={(e) => updateVolumeHoraire(cls.id, sub.id, parseInt(e.target.value))}
                                                        className="w-14 text-center text-xs border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        title="Périodes/semaine"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-3">
                    <button
                        id="cancel-assign"
                        onClick={onClose}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        id="save-assign"
                        onClick={() => assignMutation.mutate()}
                        disabled={selectedClassSubjects.length === 0 || assignMutation.isPending}
                        className="flex-1 py-3 bg-green-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-800 transition-all shadow-lg shadow-green-700/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {assignMutation.isPending ? (
                            <><Loader2 size={18} className="animate-spin" /> Attribution...</>
                        ) : (
                            <>Attribuer {totalClasses} classe{totalClasses > 1 ? 's' : ''}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignSubjectsModal;
