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
        return (
            <div className="p-12 text-center">
                <span className="inline-block w-24 h-3 bg-neutral-200 rounded animate-pulse" />
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="py-16 text-center">
                <p className="text-sm text-neutral-500">Aucune demande trouvée</p>
            </div>
        );
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            default: return 'bg-neutral-100 text-neutral-700';
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
            <table className="w-full" id="absences-table">
                <thead>
                    <tr className="table-header">
                        <th className="px-4 py-3 text-left">Enseignant</th>
                        <th className="px-3 py-3 text-left hidden sm:table-cell">Type</th>
                        <th className="px-3 py-3 text-left">Période</th>
                        <th className="px-3 py-3 text-center hidden md:table-cell">Jours</th>
                        <th className="px-3 py-3 text-center">Statut</th>
                        <th className="px-3 py-3 text-right w-16">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-neutral-50/50 transition-colors group">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 flex-shrink-0">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-800 group-hover:text-primary transition-colors">
                                            {req.teacher.nom} {req.teacher.postNom} {req.teacher.prenom}
                                        </p>
                                        <p className="text-[11px] text-neutral-400">{req.teacher.matricule}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-3 hidden sm:table-cell">
                                <span className="text-xs font-medium text-neutral-600">{req.type}</span>
                            </td>
                            <td className="px-3 py-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-neutral-700">
                                        Du {format(new Date(req.startDate), 'dd MMM', { locale: fr })} au {format(new Date(req.endDate), 'dd MMM yyyy', { locale: fr })}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">
                                        Demandé le {format(new Date(req.createdAt), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                            </td>
                            <td className="px-3 py-3 text-center hidden md:table-cell">
                                <span className="text-sm font-semibold text-neutral-700">{req.daysCount}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-semibold", getStatusStyles(req.status))}>
                                    {getStatusLabel(req.status)}
                                </span>
                            </td>
                            <td className="px-3 py-3 text-right">
                                {req.status === 'PENDING' ? (
                                    <button
                                        onClick={() => onAction(req)}
                                        className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark 
                                                   transition-all shadow-sm hover:shadow-md hover:shadow-primary/20"
                                        title="Traiter la demande"
                                    >
                                        <ShieldCheck size={14} />
                                    </button>
                                ) : (
                                    <button className="p-1.5 bg-neutral-100 text-neutral-400 rounded-lg cursor-not-allowed">
                                        <ExternalLink size={14} />
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
