import { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { JustificationData } from '@edugoma360/shared';

interface ApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    justification: JustificationData | null;
    onApprove: (id: string, comment: string) => Promise<void>;
    isApproving: boolean;
}

export default function ApprovalModal({ isOpen, onClose, justification, onApprove, isApproving }: ApprovalModalProps) {
    const [comment, setComment] = useState('');

    if (!isOpen || !justification) return null;

    const handleApprove = async () => {
        await onApprove(justification.id, comment);
        setComment('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl flex flex-col max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={20} />
                        Approuver le justificatif
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
                        <X size={20} />
                    </button>
                </div>

                    <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 mb-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-xl"></div>
                        <p className="text-sm text-neutral-800 font-medium mb-1">
                            Absence du {new Date(justification.absence.date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-neutral-500">
                            Élève: {justification.student.nom} {justification.student.postNom}
                        </p>
                        <p className="text-xs text-neutral-600 mt-2 flex items-center gap-1.5">
                            <AlertTriangle size={14} className="text-green-600" />
                            En approuvant, l'absence sera marquée comme justifiée dans le système.
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Observations (optionnel)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Ex: Certificat médical conforme..."
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-24"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleApprove}
                            disabled={isApproving}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50",
                                isApproving && "cursor-not-allowed"
                            )}
                        >
                            <CheckCircle size={16} />
                            {isApproving ? 'Traitement...' : 'Approuver'}
                        </button>
                </div>
            </div>
        </div>
    );
}
