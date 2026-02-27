import React from 'react';
import { X, AlertTriangle, UserCheck, RefreshCw } from 'lucide-react';

interface ConflictWarningProps {
    isOpen: boolean;
    onClose: () => void;
    onReplace: () => void;
    conflictData: {
        className: string;
        subjectName: string;
        existingTeacherName: string;
        newTeacherName: string;
    } | null;
}

export const ConflictWarning: React.FC<ConflictWarningProps> = ({
    isOpen,
    onClose,
    onReplace,
    conflictData
}) => {
    if (!isOpen || !conflictData) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border-2 border-red-50 animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b-2 border-red-50 flex justify-between items-center bg-red-50/50">
                    <div className="flex items-center gap-4 text-red-600">
                        <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-500/20"><AlertTriangle size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black text-red-900 uppercase tracking-tight leading-none mb-1">Conflit Détecté</h2>
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none mt-1">Donnée déjà présente dans cette cellule</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 text-slate-300 rounded-2xl transition-all border border-slate-100"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-50 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Classe :</span>
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">{conflictData.className}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Matière :</span>
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">{conflictData.subjectName}</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6 p-4 bg-white border-2 border-slate-50 rounded-2xl">
                            <div className="p-3 bg-slate-100 text-slate-400 rounded-xl"><UserCheck size={20} /></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enseignant actuel :</p>
                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">{conflictData.existingTeacherName}</p>
                            </div>
                        </div>

                        <div className="flex justify-center -my-3 relative z-10">
                            <div className="w-10 h-10 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white rotate-45 transform">
                                <RefreshCw size={18} className="-rotate-45" />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 p-4 bg-green-50 border-2 border-green-50 rounded-2xl">
                            <div className="p-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-600/10"><UserCheck size={20} /></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-green-600/60 uppercase tracking-widest mb-1">Nouvelle affectation :</p>
                                <p className="text-sm font-black text-green-900 uppercase tracking-tight leading-none">{conflictData.newTeacherName}</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight text-center px-8 italic">
                        Une classe ne peut avoir qu'un seul enseignant par matière. <br />
                        Voulez-vous remplacer l'affectation existante ?
                    </p>
                </div>

                <div className="px-8 pb-8 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                        Annuler
                    </button>
                    <button
                        onClick={onReplace}
                        className="flex-[2] py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-red-900/20"
                    >
                        Remplacer M. {conflictData.existingTeacherName.split(' ')[0]}
                    </button>
                </div>
            </div>
        </div>
    );
};
