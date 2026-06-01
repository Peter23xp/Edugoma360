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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F1E12]/45 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-neutral-200 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                        <h2 className="text-base font-bold text-neutral-900">
                            Verrouiller les notes ?
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 text-neutral-400 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm text-orange-800 font-medium">
                            âš ï¸ Cette action est irréversible sans l'autorisation du Préfet.
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
                <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={lockMutation.isPending}
                        className="px-4 py-2 text-sm font-medium border border-neutral-300 text-neutral-700
                                   hover:bg-neutral-50 rounded-lg transition-colors
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => lockMutation.mutate()}
                        disabled={lockMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2 bg-error text-white
                                   rounded-lg hover:bg-error-hover font-medium text-sm
                                   transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
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
