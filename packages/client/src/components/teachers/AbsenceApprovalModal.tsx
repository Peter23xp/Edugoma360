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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border-2 border-slate-50 animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20"><ShieldCheck size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Traiter la demande</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{request.teacher.nom} {request.teacher.prenom}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 text-slate-300 rounded-2xl transition-all border border-slate-50"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100/50 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type de Congé</p>
                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{request.type}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Durée</p>
                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{request.daysCount} Jours</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Période</p>
                            <p className="text-sm font-bold text-slate-800 capitalize">
                                Du {format(new Date(request.startDate), 'dd MMMM', { locale: fr })} au {format(new Date(request.endDate), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Motif de l'enseignant</p>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{request.reason}"</p>
                        </div>
                        {request.certificatUrl && (
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pièce jointe</span>
                                <a
                                    href={request.certificatUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all"
                                >
                                    Voir Certificat
                                </a>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Observations du Préfet</label>
                        <textarea
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            className="w-full h-24 p-5 text-sm bg-white border-2 border-slate-100 rounded-[32px] focus:border-primary focus:outline-none transition-all resize-none font-medium"
                            placeholder="Saisissez vos commentaires ou instructions..."
                        />
                    </div>

                    <div className="flex gap-4">
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
                                "flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                !observations.trim() ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-rose-50 hover:bg-rose-100 text-rose-600"
                            )}
                        >
                            <XCircle size={14} /> Refuser
                        </button>
                        <button
                            onClick={() => mutation.mutate({ status: 'APPROVED', observations })}
                            disabled={mutation.isPending}
                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={14} /> Approuver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
