import { X, Save } from 'lucide-react';
import { useState } from 'react';
import { DELIB_DECISIONS, type DelibDecision } from '@edugoma360/shared';
import type { DeliberationStudent } from '@edugoma360/shared';
import DecisionBadge from './DecisionBadge';

interface DecisionModalProps {
    student: DeliberationStudent;
    onSave: (decision: DelibDecision, note?: string) => void;
    onClose: () => void;
    isLoading?: boolean;
}

export default function DecisionModal({ student, onSave, onClose, isLoading }: DecisionModalProps) {
    const [decision, setDecision] = useState<DelibDecision>(
        student.finalDecision ?? student.suggestedDecision
    );
    const [note, setNote] = useState(student.decisionNote ?? '');

    const handleSave = () => {
        onSave(decision, note || undefined);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F1E12]/45 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-neutral-200 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-bold text-neutral-900">Décision délibération</h2>
                        <p className="text-xs text-neutral-500">{student.studentName} — {student.studentMatricule}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 text-neutral-400 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Moyennes résumé */}
                    <div className="grid grid-cols-3 gap-3 bg-neutral-50 rounded-lg p-3">
                        {[
                            { label: 'T1', value: student.t1Average },
                            { label: 'T2', value: student.t2Average },
                            { label: 'T3', value: student.t3Average },
                        ].map((t) => (
                            <div key={t.label} className="text-center">
                                <p className="text-xs text-neutral-500">{t.label}</p>
                                <p className={`text-lg font-bold ${(t.value ?? 0) >= 10 ? 'text-green-600' : 'text-orange-600'}`}>
                                    {t.value !== null ? t.value?.toFixed(1) : '—'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Moyenne annuelle */}
                    <div className="flex items-center justify-between bg-neutral-900 text-white rounded-lg p-4">
                        <span className="text-sm font-medium">Moyenne annuelle</span>
                        <span className={`text-2xl font-black ${(student.annualAverage ?? 0) >= 10 ? 'text-green-400' : 'text-red-400'}`}>
                            {student.annualAverage !== null ? `${student.annualAverage?.toFixed(1)}/20` : '—'}
                        </span>
                    </div>

                    {/* Suggestion */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">Décision suggérée :</span>
                        <DecisionBadge decision={student.suggestedDecision} size="sm" />
                    </div>

                    {/* Sélecteur décision */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Décision finale</label>
                        <div className="grid grid-cols-1 gap-2">
                            {(Object.keys(DELIB_DECISIONS) as DelibDecision[]).map((key) => (
                                <label
                                    key={key}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${decision === key
                                            ? 'border-primary bg-primary/5'
                                            : 'border-neutral-200 hover:border-neutral-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="decision"
                                        value={key}
                                        checked={decision === key}
                                        onChange={() => setDecision(key)}
                                        className="accent-primary"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-neutral-800">{DELIB_DECISIONS[key].label}</p>
                                        <p className="text-xs text-neutral-500">{DELIB_DECISIONS[key].condition}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Note / observation */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Note du conseil (optionnel)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Observation particulière du conseil de classe…"
                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg resize-none focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm text-neutral-900"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-10 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 h-10 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Save size={15} />
                        {isLoading ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
}


