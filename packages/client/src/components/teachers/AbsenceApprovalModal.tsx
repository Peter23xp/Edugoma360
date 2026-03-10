import { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface AbsenceApprovalModalProps {
    request: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function AbsenceApprovalModal({ request, isOpen, onClose }: AbsenceApprovalModalProps) {
    const queryClient = useQueryClient();
    const [observations, setObservations] = useState('');

    const mutation = useMutation({
        mutationFn: (data: { status: string, observations: string }) =>
            api.patch(`/absences/${request.id}/status`, data),
        onSuccess: () => {
            toast.success('Demande traitée avec succès');
            queryClient.invalidateQueries({ queryKey: ['teacher-absences'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-absences-stats'] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors du traitement');
        }
    });

    if (!isOpen || !request) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-neutral-300/50">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg shadow-md shadow-primary/20">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Traiter la demande</h2>
                            <p className="text-xs text-neutral-500">{request.teacher.nom} {request.teacher.prenom}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 text-neutral-400 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    {/* Request details */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-neutral-500">Type de congé</p>
                                <p className="text-sm font-semibold text-neutral-800">{request.type}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-neutral-500">Durée</p>
                                <p className="text-sm font-semibold text-neutral-800">{request.daysCount} jours</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500">Période</p>
                            <p className="text-sm font-medium text-neutral-800 capitalize">
                                Du {format(new Date(request.startDate), 'dd MMMM', { locale: fr })} au {format(new Date(request.endDate), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500">Motif de l'enseignant</p>
                            <p className="text-sm text-neutral-600 leading-relaxed italic">"{request.reason}"</p>
                        </div>
                        {request.certificatUrl && (
                            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                                <span className="text-xs text-neutral-500">Pièce jointe</span>
                                <a
                                    href={request.certificatUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium 
                                               border border-blue-100 hover:bg-blue-100 transition-colors"
                                >
                                    Voir certificat
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Observations */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Observations du préfet</label>
                        <textarea
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            className="w-full h-24 px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl 
                                       focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 
                                       transition-all resize-none"
                            placeholder="Saisissez vos commentaires ou instructions..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                if (!observations.trim()) {
                                    toast.error('Veuillez saisir un motif pour le refus');
                                    return;
                                }
                                mutation.mutate({ status: 'REJECTED', observations });
                            }}
                            disabled={mutation.isPending}
                            className={cn(
                                "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                                !observations.trim()
                                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                    : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                            )}
                        >
                            <XCircle size={14} /> Refuser
                        </button>
                        <button
                            onClick={() => mutation.mutate({ status: 'APPROVED', observations })}
                            disabled={mutation.isPending}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl 
                                       text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={14} /> Approuver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
