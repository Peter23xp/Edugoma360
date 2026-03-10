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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-red-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600 text-white rounded-lg shadow-md shadow-red-500/20">
                            <AlertTriangle size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-red-900">Conflit détecté</h2>
                            <p className="text-xs text-red-500">Donnée déjà présente dans cette cellule</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-100 text-red-400 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-neutral-500">Classe :</span>
                            <span className="text-sm font-semibold text-neutral-800">{conflictData.className}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-neutral-500">Matière :</span>
                            <span className="text-sm font-semibold text-neutral-800">{conflictData.subjectName}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl">
                            <div className="p-2 bg-neutral-100 text-neutral-400 rounded-lg">
                                <UserCheck size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-neutral-500">Enseignant actuel :</p>
                                <p className="text-sm font-semibold text-neutral-800">{conflictData.existingTeacherName}</p>
                            </div>
                        </div>

                        <div className="flex justify-center -my-1 relative z-10">
                            <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center shadow-md border-2 border-white">
                                <RefreshCw size={14} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
                                <UserCheck size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-emerald-600">Nouvelle affectation :</p>
                                <p className="text-sm font-semibold text-emerald-900">{conflictData.newTeacherName}</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-neutral-500 text-center leading-relaxed">
                        Une classe ne peut avoir qu'un seul enseignant par matière.<br />
                        Voulez-vous remplacer l'affectation existante ?
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl 
                                   text-sm font-medium hover:bg-neutral-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onReplace}
                        className="flex-[2] py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl 
                                   text-sm font-medium transition-all shadow-md"
                    >
                        Remplacer M. {conflictData.existingTeacherName.split(' ')[0]}
                    </button>
                </div>
            </div>
        </div>
    );
};
