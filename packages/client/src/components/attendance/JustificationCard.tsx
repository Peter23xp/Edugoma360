// JustificationCard.tsx
import { Download, Eye, CheckCircle, XCircle, Clock, FileText, User } from 'lucide-react';
import type { JustificationData } from '@edugoma360/shared';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface JustificationCardProps {
    data: JustificationData;
    onApprove: (data: JustificationData) => void;
    onReject: (data: JustificationData) => void;
    onViewDocument: (url: string) => void;
}

const statusConfig = {
    PENDING: {
        label: 'EN ATTENTE',
        icon: Clock,
        className: 'bg-orange-100 text-orange-700 border-orange-200',
        dotClass: 'bg-orange-500'
    },
    APPROVED: {
        label: 'APPROUVÉ',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 border-green-200',
        dotClass: 'bg-green-500'
    },
    REJECTED: {
        label: 'REJETÉ',
        icon: XCircle,
        className: 'bg-red-100 text-red-700 border-red-200',
        dotClass: 'bg-red-500'
    },
    EXPIRED: {
        label: 'EXPIRÉ',
        icon: Clock,
        className: 'bg-neutral-100 text-neutral-700 border-neutral-200',
        dotClass: 'bg-neutral-500'
    }
};

const reasonLabels: Record<string, string> = {
    MALADIE: 'Maladie',
    DECES_FAMILIAL: 'Décès familial',
    RENDEZ_VOUS_MEDICAL: 'Rendez-vous médical',
    AUTRE: 'Autre'
};

export default function JustificationCard({ data, onApprove, onReject, onViewDocument }: JustificationCardProps) {
    const config = statusConfig[data.status];
    const StatusIcon = config.icon;
    
    // Calculate days passed since submission
    const submitDate = new Date(data.submittedAt);
    const timeSinceString = formatDistanceToNow(submitDate, { addSuffix: true, locale: fr });
    const diffDays = Math.floor((new Date().getTime() - submitDate.getTime()) / (1000 * 3600 * 24));
    const isLate = diffDays > 5 && data.status === 'PENDING';

    const formatSize = (bytes: number) => {
        return (bytes / 1024).toFixed(1) + ' KB';
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                    config.className
                )}>
                    <StatusIcon size={12} />
                    {config.label}
                </span>

                {data.status === 'PENDING' && (
                    <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-md",
                        isLate ? "bg-red-50 text-red-600 border border-red-100" : "text-neutral-500"
                    )}>
                        {isLate ? `En attente depuis ${diffDays} jours` : `Soumis ${timeSinceString}`}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col gap-4">
                {/* Student Info */}
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold overflow-hidden border border-primary/20">
                        {data.student.photoUrl ? (
                            <img src={data.student.photoUrl} alt="Élève" className="w-full h-full object-cover" />
                        ) : (
                            <span>{data.student.nom.charAt(0)}{data.student.postNom.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold text-neutral-900 leading-none mb-1">
                            {data.student.nom} {data.student.postNom} {data.student.prenom}
                        </h4>
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                            Matricule: <span className="font-medium text-neutral-700">{data.student.matricule}</span>
                            <span className="mx-1">•</span>
                            Classe: <span className="font-medium text-primary">{data.student.class.name}</span>
                        </p>
                    </div>
                </div>

                {/* Absence Details */}
                <div className="bg-neutral-50 rounded-lg p-3 space-y-2 text-sm border border-neutral-100">
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                        <span className="text-neutral-500 font-medium">ABSENCE :</span>
                        <div className="text-neutral-800">
                            Date : {new Date(data.absence.date).toLocaleDateString('fr-FR')} <br/>
                            <span className="text-neutral-500 text-xs">Période : {data.absence.period}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                        <span className="text-neutral-500 font-medium">MOTIF :</span>
                        <div className="text-neutral-800">
                            <span className="font-medium">{reasonLabels[data.reason] || data.reason}</span>
                            <p className="text-xs text-neutral-600 mt-0.5 mt-1 border-l-2 border-neutral-300 pl-2">
                                "{data.reasonDetails}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Document */}
                <div>
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block">Pièce justificative</span>
                    <div className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <FileText size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                                {data.documentName}
                            </p>
                            <p className="text-xs text-neutral-500">
                                {formatSize(data.documentSize)}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => onViewDocument(data.documentUrl)}
                                className="p-1.5 text-neutral-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                title="Visualiser"
                            >
                                <Eye size={16} />
                            </button>
                            <a 
                                href={data.documentUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-neutral-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                title="Télécharger"
                            >
                                <Download size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Submitter */}
                <div className="mt-auto pt-3 border-t border-neutral-100">
                    <div className="flex items-start gap-2">
                        <User size={14} className="text-neutral-400 mt-0.5" />
                        <div className="text-xs">
                            <p className="text-neutral-500 mb-0.5">SOUMIS PAR :</p>
                            <p className="font-medium text-neutral-800">
                                {data.submittedBy.nom} ({data.submittedBy.relationship})
                            </p>
                            <p className="text-neutral-500">{data.submittedBy.phone}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px]">
                                {new Date(data.submittedAt).toLocaleString('fr-FR', {
                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {data.status === 'PENDING' && (
                <div className="p-3 border-t border-neutral-100 bg-neutral-50 flex gap-2">
                    <button
                        onClick={() => onReject(data)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                        <XCircle size={16} />
                        Rejeter
                    </button>
                    <button
                        onClick={() => onApprove(data)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <CheckCircle size={16} />
                        Approuver
                    </button>
                </div>
            )}
            {data.status === 'REJECTED' && data.rejectionReason && (
                 <div className="p-3 border-t border-red-100 bg-red-50 text-xs text-red-700">
                    <span className="font-medium">Motif du rejet:</span> {data.rejectionReason}
                    {data.reviewComment && <p className="mt-1 text-red-600">"{data.reviewComment}"</p>}
                </div>
            )}
        </div>
    );
}
