import { useState } from 'react';
import { CheckCircle, Clock, Lock, Shield, AlertCircle } from 'lucide-react';
import type { DeliberationStatus } from '@edugoma360/shared/types/academic';

interface ApprovalWorkflowProps {
    status: DeliberationStatus;
    approvedAt?: string | null;
    approverName?: string | null;
    totalStudents: number;
    studentsWithDecision: number;
    onApprove: () => void;
    isApproving?: boolean;
    canApprove?: boolean; // Préfet uniquement
}

type WorkflowStep = {
    key: string;
    label: string;
    description: string;
    icon: typeof CheckCircle;
};

const STEPS: WorkflowStep[] = [
    { key: 'DRAFT', label: 'Brouillon', description: 'Enseignants saisissent les décisions', icon: Clock },
    { key: 'VALIDATED', label: 'Validé', description: 'Toutes les décisions sont saisies', icon: CheckCircle },
    { key: 'APPROVED', label: 'Approuvé', description: 'Préfet a signé la délibération', icon: Shield },
];

export default function ApprovalWorkflow({
    status,
    approvedAt,
    approverName,
    totalStudents,
    studentsWithDecision,
    onApprove,
    isApproving = false,
    canApprove = false,
}: ApprovalWorkflowProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const currentIndex = STEPS.findIndex((s) => s.key === status);
    const allDecided = studentsWithDecision >= totalStudents;
    const canTriggerApproval = canApprove && status === 'VALIDATED' && allDecided;

    const handleApprove = () => {
        if (!showConfirm) {
            setShowConfirm(true);
            return;
        }
        onApprove();
        setShowConfirm(false);
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-700">Workflow d'approbation</h3>
                {status === 'APPROVED' && (
                    <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-100 px-2.5 py-1 rounded-full font-medium">
                        <Lock size={12} />
                        Délibération définitive
                    </span>
                )}
            </div>

            {/* Étapes visuelles */}
            <div className="flex items-center gap-0">
                {STEPS.map((step, i) => {
                    const isDone = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${isDone
                                        ? 'bg-primary border-primary text-white'
                                        : 'bg-white border-neutral-300 text-neutral-400'
                                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                                    <Icon size={16} />
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-medium ${isDone ? 'text-primary' : 'text-neutral-400'}`}>
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-neutral-400 max-w-24 text-center leading-tight">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 mb-8 ${i < currentIndex ? 'bg-primary' : 'bg-neutral-200'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progression des décisions */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-neutral-500">Décisions saisies</span>
                    <span className="text-xs font-semibold text-neutral-700">
                        {studentsWithDecision}/{totalStudents}
                    </span>
                </div>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: totalStudents > 0 ? `${(studentsWithDecision / totalStudents) * 100}%` : '0%' }}
                    />
                </div>
            </div>

            {/* Bouton approbation */}
            {status !== 'APPROVED' && canApprove && (
                <div className="space-y-3">
                    {!allDecided && (
                        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
                            <AlertCircle size={13} />
                            {totalStudents - studentsWithDecision} élève(s) sans décision
                        </div>
                    )}

                    {showConfirm ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
                            <p className="text-sm font-medium text-yellow-800">
                                ⚠️ Cette action est <strong>irréversible</strong>. La délibération sera définitivement approuvée et les bulletins pourront être générés.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 h-9 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isApproving}
                                    className="flex-1 h-9 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                                >
                                    <Shield size={14} />
                                    {isApproving ? 'Approbation…' : 'Confirmer'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleApprove}
                            disabled={!canTriggerApproval || isApproving}
                            className="w-full h-10 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Shield size={15} />
                            Approuver la délibération
                        </button>
                    )}
                </div>
            )}

            {/* Info approbation */}
            {status === 'APPROVED' && approvedAt && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <CheckCircle size={13} />
                    Approuvé par {approverName ?? 'le Préfet'} le{' '}
                    {new Date(approvedAt).toLocaleDateString('fr-CD', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
            )}
        </div>
    );
}

