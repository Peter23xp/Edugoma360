import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { DELIB_DECISIONS, DelibDecision } from '@edugoma360/shared/src/constants/decisions';

interface DeliberationSummaryProps {
    className: string;
    termLabel: string;
    prefetName: string;
    decisions: Record<string, { decision: DelibDecision; justification: string }>;
    suggestions: Record<string, DelibDecision>;
    totalStudents: number;
}

export default function DeliberationSummary({
    className,
    termLabel,
    prefetName,
    decisions,
    suggestions,
    totalStudents,
}: DeliberationSummaryProps) {
    // Count decisions
    const counts = {
        admitted: 0,
        distinction: 0,
        greatDistinction: 0,
        adjourned: 0,
        failed: 0,
        medical: 0,
    };

    Object.values(decisions).forEach((d) => {
        switch (d.decision) {
            case 'ADMITTED':
                counts.admitted++;
                break;
            case 'DISTINCTION':
                counts.distinction++;
                break;
            case 'GREAT_DISTINCTION':
                counts.greatDistinction++;
                break;
            case 'ADJOURNED':
                counts.adjourned++;
                break;
            case 'FAILED':
                counts.failed++;
                break;
            case 'MEDICAL':
                counts.medical++;
                break;
        }
    });

    const totalAdmitted = counts.admitted + counts.distinction + counts.greatDistinction;
    const successRate = ((totalAdmitted / totalStudents) * 100).toFixed(0);

    // Count modified decisions
    const modifiedCount = Object.entries(decisions).filter(
        ([studentId, d]) => d.decision !== suggestions[studentId]
    ).length;

    return (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">
                Récapitulatif de la Délibération
            </h3>

            <div className="space-y-4">
                {/* Info générale */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-200">
                    <div>
                        <p className="text-sm text-neutral-600">Classe</p>
                        <p className="text-base font-semibold text-neutral-900">{className}</p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-600">Trimestre</p>
                        <p className="text-base font-semibold text-neutral-900">{termLabel}</p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-600">Date</p>
                        <p className="text-base font-semibold text-neutral-900">
                            {new Date().toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-600">Président</p>
                        <p className="text-base font-semibold text-neutral-900">{prefetName}</p>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-600" />
                            <span className="text-sm font-medium text-green-900">
                                Admis (toutes catégories)
                            </span>
                        </div>
                        <span className="text-lg font-bold text-green-900">
                            {totalAdmitted} ({successRate}%)
                        </span>
                    </div>

                    {counts.greatDistinction > 0 && (
                        <div className="flex items-center justify-between pl-8 py-2">
                            <span className="text-sm text-neutral-700">Grande Distinction</span>
                            <span className="text-sm font-semibold text-yellow-700">
                                {counts.greatDistinction}
                            </span>
                        </div>
                    )}

                    {counts.distinction > 0 && (
                        <div className="flex items-center justify-between pl-8 py-2">
                            <span className="text-sm text-neutral-700">Distinction</span>
                            <span className="text-sm font-semibold text-green-700">
                                {counts.distinction}
                            </span>
                        </div>
                    )}

                    {counts.admitted > 0 && (
                        <div className="flex items-center justify-between pl-8 py-2">
                            <span className="text-sm text-neutral-700">Admis simple</span>
                            <span className="text-sm font-semibold text-green-600">
                                {counts.admitted}
                            </span>
                        </div>
                    )}

                    {counts.adjourned > 0 && (
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={20} className="text-orange-600" />
                                <span className="text-sm font-medium text-orange-900">Ajournés</span>
                            </div>
                            <span className="text-lg font-bold text-orange-900">
                                {counts.adjourned} (
                                {((counts.adjourned / totalStudents) * 100).toFixed(0)}%)
                            </span>
                        </div>
                    )}

                    {counts.failed > 0 && (
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <XCircle size={20} className="text-red-600" />
                                <span className="text-sm font-medium text-red-900">Refusés</span>
                            </div>
                            <span className="text-lg font-bold text-red-900">
                                {counts.failed} ({((counts.failed / totalStudents) * 100).toFixed(0)}
                                %)
                            </span>
                        </div>
                    )}

                    {counts.medical > 0 && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium text-blue-900">
                                Reportés (Maladie)
                            </span>
                            <span className="text-lg font-bold text-blue-900">{counts.medical}</span>
                        </div>
                    )}
                </div>

                {/* Modifications */}
                {modifiedCount > 0 && (
                    <div className="pt-4 border-t border-neutral-200">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-amber-900">
                                Décisions modifiées: {modifiedCount}
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                                (contre suggestion automatique)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

