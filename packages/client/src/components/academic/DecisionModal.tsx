import { X, Save } from 'lucide-react';
import { useState } from 'react';
import { DELIB_DECISIONS, type DelibDecision } from '@edugoma360/shared/constants/decisions';
import type { DeliberationStudent } from '@edugoma360/shared/types/academic';
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900">Décision délibération</h2>
                        <p className="text-sm text-neutral-500">{student.studentName} — {student.studentMatricule}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                        <X size={18} className="text-neutral-500" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Moyennes résumé */}
                    <div className="grid grid-cols-3 gap-3 bg-neutral-50 rounded-xl p-3">
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
                    <div className="flex items-center justify-between bg-neutral-900 text-white rounded-xl p-4">
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
                        <label className="text-sm font-medium text-neutral-700">Décision finale</label>
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
                        <label className="text-sm font-medium text-neutral-700">Note du conseil (optionnel)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Observation particulière du conseil de classe…"
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-neutral-200">
                    <button
                        onClick={onClose}
                        className="flex-1 h-10 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 h-10 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <Save size={15} />
                        {isLoading ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

