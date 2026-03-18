import React, { useState } from 'react';
import { 
    X, 
    CalendarDays, 
    Clock, 
    User, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle,
    FileText,
    UploadCloud,
    Phone,
    Mail
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { AbsenceHistoryItem } from '@edugoma360/shared';
import { useAbsenceHistory, useStudentAbsenceStats } from '../../hooks/useAbsenceHistory';

interface StudentAbsenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    absence: AbsenceHistoryItem | null;
    studentId: string | null;
    canEdit: boolean;
}

export default function StudentAbsenceModal({
    isOpen,
    onClose,
    absence,
    studentId,
    canEdit,
}: StudentAbsenceModalProps) {
    const [tab, setTab] = useState<'details' | 'edit'>('details');

    const [isJustified, setIsJustified] = useState(false);
    const [remark, setRemark] = useState('');

    const { data: statsData, isLoading: isStatsLoading } = useStudentAbsenceStats(isOpen ? studentId : null);
    const { updateJustification } = useAbsenceHistory({ filters: { period: 'all', classIds: [], types: [], studentSearch: '' }, page: 1 });

    // Initialize edit form when absence changes
    React.useEffect(() => {
        if (absence) {
            setIsJustified(absence.isJustified);
            setRemark(absence.remark || '');
            setTab('details'); // Default to details tab
        }
    }, [absence]);

    if (!isOpen || !absence) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;

        await updateJustification.mutateAsync({
            id: absence.id,
            data: {
                isJustified,
                remark,
                // justificationFile: file // Add when backend supports file upload
            }
        });
        
        onClose();
    };

    const StatusIcon = absence.status === 'LATE' || absence.status === 'RETARD' ? Clock : CalendarDays;
    const isLate = absence.status === 'LATE' || absence.status === 'RETARD';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onClose} />
            
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <header className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <h2 className="text-lg font-black text-neutral-800 uppercase tracking-wide">
                        {tab === 'edit' ? 'Modifier Justification' : 'Détails Absence'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </header>

                <div className="overflow-y-auto flex-1 p-6">
                    
                    {/* Tabs */}
                    {canEdit && (
                        <div className="flex gap-4 border-b border-neutral-100 mb-6">
                            <button
                                onClick={() => setTab('details')}
                                className={cn(
                                    "pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors",
                                    tab === 'details' ? "border-primary text-primary" : "border-transparent text-neutral-400 hover:text-neutral-600"
                                )}
                            >
                                Résumé & Historique
                            </button>
                            <button
                                onClick={() => setTab('edit')}
                                className={cn(
                                    "pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors",
                                    tab === 'edit' ? "border-primary text-primary" : "border-transparent text-neutral-400 hover:text-neutral-600"
                                )}
                            >
                                Gérer la justification
                            </button>
                        </div>
                    )}

                    {tab === 'details' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            
                            {/* Student Info Card */}
                            <div className="bg-neutral-50 rounded-xl p-4 flex gap-4">
                                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden shrink-0">
                                    {absence.student.photoUrl ? (
                                        <img src={absence.student.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-neutral-900 text-lg">
                                        {absence.student.nom} {absence.student.postNom} {absence.student.prenom}
                                    </h3>
                                    <p className="text-sm font-medium text-neutral-500 font-mono">
                                        MT: {absence.student.matricule}
                                    </p>
                                    <span className="inline-block mt-1 text-xs font-bold text-neutral-600 bg-neutral-200/60 px-2 py-0.5 rounded uppercase tracking-wider">
                                        Classe : {absence.class.name}
                                    </span>
                                </div>
                            </div>

                            {/* Absence details */}
                            <div>
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">L'Absence</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-neutral-50 p-3 rounded-xl">
                                        <div className="flex items-center gap-2 text-neutral-500 mb-1">
                                            <CalendarDays size={14} />
                                            <span className="text-xs font-semibold">Date & Période</span>
                                        </div>
                                        <p className="font-medium text-sm text-neutral-800">
                                            {new Date(absence.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            ({absence.period === 'MORNING' || absence.period === 'MATIN' ? 'Matin (7h30-12h30)' : 
                                              absence.period === 'AFTERNOON' || absence.period === 'APRES_MIDI' ? 'Après-midi (12h30-17h)' : 'Soir (17h-20h)'})
                                        </p>
                                    </div>
                                    <div className="bg-neutral-50 p-3 rounded-xl">
                                        <div className="flex items-center gap-2 text-neutral-500 mb-1">
                                            <StatusIcon size={14} />
                                            <span className="text-xs font-semibold">Statut</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "font-bold text-sm",
                                                isLate ? "text-orange-600" : "text-red-600"
                                            )}>
                                                {isLate ? 'En Retard' : 'Absent'}
                                                {absence.arrivalTime && ` (Arrivée : ${absence.arrivalTime})`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            {absence.isJustified ? (
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded">
                                                    <CheckCircle2 size={12} /> Justifié
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-widest bg-red-50 px-1.5 py-0.5 rounded">
                                                    <XCircle size={12} /> Non justifié
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Remark */}
                                <div className="mt-3 bg-neutral-50 p-3 rounded-xl">
                                    <div className="flex items-center gap-2 text-neutral-500 mb-1">
                                        <FileText size={14} />
                                        <span className="text-xs font-semibold">Remarque / Motif</span>
                                    </div>
                                    <p className="text-sm text-neutral-700 italic">
                                        {absence.remark ? `« ${absence.remark} »` : "Aucune remarque enregistrée."}
                                    </p>
                                    <div className="mt-2 text-[10px] text-neutral-400 uppercase tracking-wider">
                                        Enregistré par : {absence.createdBy.nom} ({absence.createdBy.role})
                                    </div>
                                </div>
                            </div>

                            {/* 30 Days Stats */}
                            <div>
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <AlertTriangle size={14} /> 
                                    Historique 30 derniers jours
                                </h4>
                                
                                {isStatsLoading ? (
                                    <div className="h-20 bg-neutral-50 rounded-xl animate-pulse" />
                                ) : statsData ? (
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center">
                                            <span className="text-2xl font-black text-red-600 leading-none">{statsData.stats.notJustifiedAbsences}</span>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-red-700/70 mt-1">Abs. NJ</span>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
                                            <span className="text-2xl font-black text-green-600 leading-none">{statsData.stats.justifiedAbsences}</span>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-green-700/70 mt-1">Abs. J</span>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex flex-col items-center justify-center text-center">
                                            <span className="text-2xl font-black text-orange-600 leading-none">{statsData.stats.totalLates}</span>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-orange-700/70 mt-1">Retards</span>
                                        </div>
                                        <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex flex-col items-center justify-center text-center">
                                            <span className="text-2xl font-black text-primary leading-none">{statsData.stats.attendanceRate}%</span>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-primary/70 mt-1">Présence</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-neutral-500 italic">Données non disponibles</p>
                                )}
                            </div>

                        </div>
                    )}

                    {tab === 'edit' && canEdit && (
                        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            
                            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4">
                                <h3 className="font-bold text-neutral-800 text-sm mb-4">Statut de l'absence</h3>
                                
                                <div className="space-y-3">
                                    <label className={cn(
                                        "flex items-start gap-3 p-3 rounded-xl border-2 transition-colors cursor-pointer",
                                        !isJustified ? "border-red-500 bg-red-50/50" : "border-neutral-200 bg-white hover:bg-neutral-50"
                                    )}>
                                        <input 
                                            type="radio" 
                                            checked={!isJustified} 
                                            onChange={() => setIsJustified(false)} 
                                            className="mt-1 w-4 h-4 text-red-500 border-neutral-300 focus:ring-red-500"
                                        />
                                        <div>
                                            <p className={cn("font-bold text-sm", !isJustified ? "text-red-700" : "text-neutral-700")}>
                                                Absence non justifiée
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-0.5">Aucun document n'a été fourni par les parents.</p>
                                        </div>
                                    </label>

                                    <label className={cn(
                                        "flex items-start gap-3 p-3 rounded-xl border-2 transition-colors cursor-pointer",
                                        isJustified ? "border-green-500 bg-green-50/50" : "border-neutral-200 bg-white hover:bg-neutral-50"
                                    )}>
                                        <input 
                                            type="radio" 
                                            checked={isJustified} 
                                            onChange={() => setIsJustified(true)} 
                                            className="mt-1 w-4 h-4 text-green-500 border-neutral-300 focus:ring-green-500"
                                        />
                                        <div>
                                            <p className={cn("font-bold text-sm", isJustified ? "text-green-700" : "text-neutral-700")}>
                                                Absence justifiée
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-0.5">Un motif valable ou document a été fourni.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Remarque */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-600 ml-1">Remarque ou Motif</label>
                                <textarea
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    placeholder="Ex: Certificat médical reçu ce matin, rendez-vous consulaire..."
                                    rows={3}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                />
                            </div>

                            {/* Piece Justificative (Mock) */}
                            {isJustified && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-bold text-neutral-600 ml-1">Pièce justificative (Optionnel)</label>
                                    <div className="w-full border-2 border-dashed border-neutral-300 rounded-xl p-6 flex flex-col items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:border-primary/50 transition-colors cursor-pointer">
                                        <UploadCloud size={24} className="mb-2" />
                                        <p className="text-sm font-medium">Glisser-déposer un fichier</p>
                                        <p className="text-xs text-neutral-400 mt-1">.pdf, .jpg, .png (Max: 5Mo)</p>
                                        
                                        <input type="file" className="hidden" />
                                    </div>
                                </div>
                            )}

                        </form>
                    )}

                </div>

                {/* Footer Actions */}
                <footer className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {tab === 'details' ? (
                        <>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-bold rounded-xl transition-colors">
                                    <Phone size={16} /> Contacter
                                </button>
                                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-bold rounded-xl transition-colors">
                                    <Mail size={16} /> Email
                                </button>
                            </div>
                            {canEdit && (
                                <button 
                                    onClick={() => setTab('edit')}
                                    className="w-full sm:w-auto px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
                                >
                                    Modifier
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => setTab('details')}
                                className="w-full sm:w-auto px-6 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-bold rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            
                            <button 
                                onClick={handleSave}
                                disabled={updateJustification.isPending}
                                className="w-full sm:w-auto px-8 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {updateJustification.isPending ? (
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                ) : 'Enregistrer'}
                            </button>
                        </>
                    )}
                </footer>

            </div>
        </div>
    );
}
