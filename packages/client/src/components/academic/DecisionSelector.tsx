import { DELIB_DECISIONS, DelibDecision, getDecisionColor } from '@edugoma360/shared/src/constants/decisions';

interface DecisionSelectorProps {
    studentId: string;
    studentName: string;
    average: number;
    suggestion: DelibDecision;
    currentDecision: DelibDecision;
    justification: string;
    onDecisionChange: (studentId: string, decision: DelibDecision) => void;
    onJustificationChange: (studentId: string, justification: string) => void;
    disabled?: boolean;
}

export default function DecisionSelector({
    studentId,
    studentName,
    average,
    suggestion,
    currentDecision,
    justification,
    onDecisionChange,
    onJustificationChange,
    disabled = false,
}: DecisionSelectorProps) {
    const isDifferentFromSuggestion = currentDecision !== suggestion;
    const needsJustification = isDifferentFromSuggestion && !justification;

    return (
        <tr className={`${getDecisionColor(currentDecision)} border-b`}>
            <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                {studentName}
            </td>
            <td className="px-4 py-3 text-sm text-center font-semibold">
                {average.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-sm">
                <span className="text-neutral-600">
                    {DELIB_DECISIONS[suggestion].label}
                </span>
            </td>
            <td className="px-4 py-3">
                <select
                    value={currentDecision}
                    onChange={(e) => onDecisionChange(studentId, e.target.value as DelibDecision)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                    {Object.entries(DELIB_DECISIONS).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value.label}
                        </option>
                    ))}
                </select>
            </td>
            <td className="px-4 py-3">
                <input
                    type="text"
                    value={justification}
                    onChange={(e) => onJustificationChange(studentId, e.target.value)}
                    disabled={disabled || !isDifferentFromSuggestion}
                    placeholder={isDifferentFromSuggestion ? 'Justification requise' : 'Non requis'}
                    className={`w-full px-3 py-2 border rounded-lg text-sm 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               disabled:opacity-50 disabled:cursor-not-allowed
                               ${needsJustification ? 'border-red-300 bg-red-50' : 'border-neutral-300 bg-white'}`}
                />
                {needsJustification && (
                    <p className="text-xs text-red-600 mt-1">
                        Justification obligatoire
                    </p>
                )}
            </td>
        </tr>
    );
}

