import { DELIB_DECISIONS, getDecisionColor, type DelibDecision } from '@edugoma360/shared/src/constants/decisions';

interface DecisionBadgeProps {
    decision: DelibDecision | null | undefined;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

const DECISION_ICONS: Record<string, string> = {
    ADMITTED: '✅',
    DISTINCTION: '🎖️',
    GREAT_DISTINCTION: '🏆',
    ADJOURNED: '⏳',
    FAILED: '❌',
    MEDICAL: '🏥',
};

export default function DecisionBadge({ decision, size = 'md', showIcon = true }: DecisionBadgeProps) {
    if (!decision) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500 border border-neutral-200`}>
                {showIcon && '—'} En attente
            </span>
        );
    }

    const config = DELIB_DECISIONS[decision];
    const colorClass = getDecisionColor(decision);
    const icon = DECISION_ICONS[decision] ?? '•';

    const sizeClass = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    }[size];

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${sizeClass} ${colorClass}`}
            title={config?.condition}
        >
            {showIcon && <span aria-hidden="true">{icon}</span>}
            {config?.label ?? decision}
        </span>
    );
}


