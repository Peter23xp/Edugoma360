import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, ExternalLink, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AbsencesListProps {
    requests: any[];
    isLoading: boolean;
    onAction: (request: any) => void;
}

export default function AbsencesList({ requests, isLoading, onAction }: AbsencesListProps) {
    if (isLoading) {
        return <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Chargement des données...</div>;
    }

    if (requests.length === 0) {
        return <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest">Aucune demande trouvée</div>;
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
            case 'REJECTED': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'APPROVED': return 'Approuvé';
            case 'REJECTED': return 'Refusé';
            default: return status;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/20">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[25%]">Enseignant</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[15%]">Type</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[25%]">Période</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[10%] text-center">Jours</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[15%] text-center">Statut</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[10%] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 leading-none mb-1 group-hover:text-primary transition-colors">
                                            {req.teacher.nom} {req.teacher.postNom} {req.teacher.prenom}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{req.teacher.matricule}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{req.type}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-800">
                                        Du {format(new Date(req.startDate), 'dd MMM', { locale: fr })} au {format(new Date(req.endDate), 'dd MMM yyyy', { locale: fr })}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Demandé le {format(new Date(req.createdAt), 'dd/MM/yyyy')}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-sm font-black text-slate-800">{req.daysCount}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm", getStatusStyles(req.status))}>
                                    {getStatusLabel(req.status)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {req.status === 'PENDING' ? (
                                    <button
                                        onClick={() => onAction(req)}
                                        className="p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                                        title="Traiter la demande"
                                    >
                                        <ShieldCheck size={16} />
                                    </button>
                                ) : (
                                    <button className="p-2 bg-slate-100 text-slate-400 rounded-xl cursor-not-allowed">
                                        <ExternalLink size={16} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
