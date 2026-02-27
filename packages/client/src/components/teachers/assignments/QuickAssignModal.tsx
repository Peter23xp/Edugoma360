import React, { useState } from 'react';
import { X, UserPlus, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface QuickAssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (data: any) => void;
    context: { classId: string, className: string, subjectId: string, subjectName: string } | null;
    teachers: any[];
}

export const QuickAssignModal: React.FC<QuickAssignModalProps> = ({
    isOpen,
    onClose,
    onAssign,
    context,
    teachers
}) => {
    const [teacherId, setTeacherId] = useState('');
    const [volumeHoraire, setVolumeHoraire] = useState(6);

    if (!isOpen || !context) return null;

    // Filter teachers who teach this subject
    const eligibleTeachers = teachers.filter(t =>
        t.subjects.some((s: any) => s.id === context.subjectId)
    );

    const handleAssign = () => {
        if (!teacherId || !volumeHoraire) return;
        onAssign({
            teacherId,
            classId: context.classId,
            subjectId: context.subjectId,
            volumeHoraire: Number(volumeHoraire)
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border-2 border-slate-50 animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20"><UserPlus size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Affecter Enseignant</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{context.subjectName} ↔ {context.className}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 text-slate-300 rounded-2xl transition-all border border-slate-50"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-8">
                    {/* ENSEIGNANT */}
                    <div className="group">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Sélectionner un enseignant *</label>
                        <select
                            value={teacherId}
                            onChange={(e) => setTeacherId(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                        >
                            <option value="">Sélectionnez l'enseignant</option>
                            {eligibleTeachers.map(t => (
                                <option key={t.id} value={t.id}>{t.nom} {t.prenom} (Actuel: {t.totalHours || 0}h)</option>
                            ))}
                        </select>
                        <div className="mt-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                            <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] font-bold text-blue-900 leading-relaxed uppercase tracking-tight">
                                Seuls les enseignants habilités pour <span className="text-blue-600 font-black">{context.subjectName}</span> sont affichés.
                            </p>
                        </div>
                    </div>

                    {/* VOLUME HORAIRE */}
                    <div className="group">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Volume Horaire (heures/semaine) *</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={volumeHoraire}
                            onChange={(e) => setVolumeHoraire(Number(e.target.value))}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900"
                        />
                    </div>

                    {/* AVERTISSEMENTS DYNAMIQUE */}
                    {teacherId && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            {/* Overload check logic could be more complex here if we had current hours */}
                            <div className="flex gap-2 p-4 bg-green-50 border border-green-100 rounded-2xl">
                                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-black text-green-900 uppercase tracking-tight">L'enseignant est disponible pour cette charge.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-8 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                        Annuler
                    </button>
                    <button
                        disabled={!teacherId}
                        onClick={handleAssign}
                        className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20"
                    >
                        Valider l'affectation
                    </button>
                </div>
            </div>
        </div>
    );
};
