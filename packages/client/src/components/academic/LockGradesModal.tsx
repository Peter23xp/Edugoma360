import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface LockGradesModalProps {
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    termId: string;
    evalType: string;
    evalTypeLabel: string;
    gradeCount: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function LockGradesModal({
    classId,
    className,
    subjectId,
    subjectName,
    termId,
    evalType,
    evalTypeLabel,
    gradeCount,
    onClose,
    onSuccess,
}: LockGradesModalProps) {
    const queryClient = useQueryClient();

    const lockMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/grades/lock', {
                classId,
                subjectId,
                termId,
                evalType,
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(`${data.locked} notes verrouillées avec succès`);
            queryClient.invalidateQueries({ queryKey: ['grades'] });
            onSuccess();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors du verrouillage');
        },
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center 
                                        justify-center">
                            <AlertTriangle size={20} className="text-orange-600" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">
                            Verrouiller les notes ?
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-neutral-100 rounded transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm text-orange-800 font-medium">
                            ⚠️ Cette action est irréversible sans l'autorisation du Préfet.
                        </p>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-neutral-600">Notes concernées:</span>
                            <span className="font-semibold text-neutral-900">{gradeCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-600">Classe:</span>
                            <span className="font-semibold text-neutral-900">{className}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-600">Matière:</span>
                            <span className="font-semibold text-neutral-900">{subjectName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-600">Type:</span>
                            <span className="font-semibold text-neutral-900">{evalTypeLabel}</span>
                        </div>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                        <p className="text-xs text-neutral-600">
                            Après verrouillage, vous ne pourrez plus modifier ces notes. Seul le
                            Préfet pourra les déverrouiller si nécessaire.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={lockMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-neutral-700 
                                   hover:bg-neutral-100 rounded-lg transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => lockMutation.mutate()}
                        disabled={lockMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white 
                                   rounded-lg hover:bg-orange-700 font-medium text-sm 
                                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {lockMutation.isPending && (
                            <Loader2 size={16} className="animate-spin" />
                        )}
                        Verrouiller définitivement
                    </button>
                </div>
            </div>
        </div>
    );
}

