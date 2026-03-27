import { useState } from 'react';
import { Loader2, Calendar, AlertCircle } from 'lucide-react';

interface TimetableGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    className: string;
    generateTimetable: any; 
}

export default function TimetableGeneratorModal({ isOpen, onClose, classId, className, generateTimetable }: TimetableGeneratorModalProps) {
    const [isMorningMath, setIsMorningMath] = useState(true);
    const [isAfternoonPE, setIsAfternoonPE] = useState(true);
    const [avoidConsecutive, setAvoidConsecutive] = useState(true);
    const [respectTeacherAvail, setRespectTeacherAvail] = useState(true);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        const preferences = {
            morningMath: isMorningMath,
            afternoonPE: isAfternoonPE,
            avoidConsecutive: avoidConsecutive,
            respectTeacherAvail: respectTeacherAvail,
        };
        
        try {
            await generateTimetable.mutateAsync({ classId, preferences });
            onClose();
        } catch (error) {
            // Error managed in the hook via toast
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-300/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-md text-primary">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 uppercase">GÉNÉRER EMPLOI DU TEMPS</h2>
                            <p className="text-sm text-neutral-500 font-medium">Classe : {className}</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-6">
                    <div className="bg-primary/5 p-4 rounded-md border border-primary/20 flex gap-3 text-sm text-primary">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div>
                            <strong>INFO:</strong> L'algorithme va répartir automatiquement les matières assignées sur 6 jours (Lundi-Samedi) × 8 périodes.
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-neutral-900 mb-3 uppercase tracking-wider">Paramètres et Préférences</h3>
                        
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isMorningMath}
                                    onChange={e => setIsMorningMath(e.target.checked)}
                                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                                />
                                <span className="text-sm text-neutral-700">Privilégier les Mathématiques en matinée (concentration)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAfternoonPE}
                                    onChange={e => setIsAfternoonPE(e.target.checked)}
                                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                                />
                                <span className="text-sm text-neutral-700">Privilégier l'Éducation Physique en après-midi</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={avoidConsecutive}
                                    onChange={e => setAvoidConsecutive(e.target.checked)}
                                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                                />
                                <span className="text-sm text-neutral-700">Éviter + de 2 heures consécutives de la même matière</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={respectTeacherAvail}
                                    onChange={e => setRespectTeacherAvail(e.target.checked)}
                                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                                />
                                <span className="text-sm text-neutral-700">Respecter les disponibilités des enseignants (sans conflit)</span>
                            </label>
                        </div>
                    </div>

                    <div className="text-xs text-neutral-500 flex justify-end gap-1">
                        ⏱️ Génération estimée : 2-5 secondes
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-neutral-50 border-t border-neutral-300/50 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300/50 rounded-md hover:bg-neutral-50 transition-colors w-full sm:w-auto"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={generateTimetable.isPending}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm w-full sm:w-auto"
                    >
                        {generateTimetable.isPending ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                        Lancer la génération
                    </button>
                </div>
            </div>
        </div>
    );
}
