import React, { useState } from 'react';
import { X, UserPlus, Info, CheckCircle2 } from 'lucide-react';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-neutral-300/50">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg shadow-md shadow-primary/20">
                            <UserPlus size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Affecter un enseignant</h2>
                            <p className="text-xs text-neutral-500">{context.subjectName} — {context.className}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 text-neutral-400 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                            Enseignant *
                        </label>
                        <select
                            value={teacherId}
                            onChange={(e) => setTeacherId(e.target.value)}
                            className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl 
                                       focus:bg-white focus:border-primary focus:outline-none focus:ring-2 
                                       focus:ring-primary/10 transition-all text-sm text-neutral-900 
                                       appearance-none cursor-pointer"
                        >
                            <option value="">Sélectionnez l'enseignant</option>
                            {eligibleTeachers.map(t => (
                                <option key={t.id} value={t.id}>{t.nom} {t.prenom} (Actuel: {t.totalHours || 0}h)</option>
                            ))}
                        </select>
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2">
                            <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-blue-800">
                                Seuls les enseignants habilités pour <span className="font-semibold">{context.subjectName}</span> sont affichés.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                            Volume horaire (heures/semaine) *
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={volumeHoraire}
                            onChange={(e) => setVolumeHoraire(Number(e.target.value))}
                            className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl 
                                       focus:bg-white focus:border-primary focus:outline-none focus:ring-2 
                                       focus:ring-primary/10 transition-all text-sm text-neutral-900"
                        />
                    </div>

                    {teacherId && (
                        <div className="flex gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-emerald-800">L'enseignant est disponible pour cette charge.</p>
                        </div>
                    )}
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
                        disabled={!teacherId}
                        onClick={handleAssign}
                        className="flex-1 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white 
                                   rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/25 
                                   transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    >
                        Valider l'affectation
                    </button>
                </div>
            </div>
        </div>
    );
};
