import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { JustificationData } from '@edugoma360/shared';

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    justification: JustificationData | null;
    onReject: (id: string, rejectionReason: string, comment: string) => Promise<void>;
    isRejecting: boolean;
}

const REJECTION_MOTIVES = [
    { id: 'NON_CONFORME', label: 'Document non conforme' },
    { id: 'ILLISIBLE', label: 'Document illisible' },
    { id: 'DATE_INCORRECTE', label: 'Date ne correspond pas' },
    { id: 'SIGNATURE_MANQUANTE', label: 'Signature manquante' },
    { id: 'AUTRE', label: 'Autre' },
];

export default function RejectionModal({ isOpen, onClose, justification, onReject, isRejecting }: RejectionModalProps) {
    const [rejectionReason, setRejectionReason] = useState<string>('NON_CONFORME');
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    if (!isOpen || !justification) return null;

    const handleReject = async () => {
        if (!comment.trim()) {
            setError('Les détails sont obligatoires pour un rejet');
            return;
        }
        await onReject(justification.id, rejectionReason, comment);
        setComment('');
        setRejectionReason('NON_CONFORME');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl flex flex-col max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                        <AlertCircle className="text-red-600" size={20} />
                        Rejeter le justificatif
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
                        <X size={20} />
                    </button>
                </div>

                    <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 mb-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-xl"></div>
                        <p className="text-sm text-neutral-800 font-medium mb-1">
                            Absence du {new Date(justification.absence.date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-neutral-500">
                            Élève: {justification.student.nom} {justification.student.postNom}
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Motif du rejet *
                            </label>
                            <div className="space-y-2">
                                {REJECTION_MOTIVES.map((motive) => (
                                    <label key={motive.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="rejectionReason"
                                            value={motive.id}
                                            checked={rejectionReason === motive.id}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="text-red-600 focus:ring-red-500 h-4 w-4"
                                        />
                                        <span className="text-sm text-neutral-700">{motive.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Détails (obligatoire) *
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => {
                                    setComment(e.target.value);
                                    if (e.target.value.trim()) setError('');
                                }}
                                placeholder="La date sur le certificat..."
                                className={cn(
                                    "w-full px-3 py-2 border rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 resize-none h-24",
                                    error ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-neutral-300 focus:ring-red-500/20 focus:border-red-500"
                                )}
                            />
                            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleReject}
                            disabled={isRejecting}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50",
                                isRejecting && "cursor-not-allowed"
                            )}
                        >
                            <AlertCircle size={16} />
                            {isRejecting ? 'Traitement...' : 'Rejeter'}
                        </button>
                </div>
            </div>
        </div>
    );
}
