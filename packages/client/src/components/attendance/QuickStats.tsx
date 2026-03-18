/**
 * QuickStats — 4-card statistics bar for roll call screen
 */
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuickStatsProps {
    total: number;
    present: number;
    absent: number;
    late: number;
}

function pct(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
}

const stats = [
    {
        key: 'total',
        label: 'Total élèves',
        icon: Users,
        iconColor: 'text-neutral-500',
        bgColor: 'bg-neutral-50',
        borderColor: 'border-neutral-200',
        valueColor: 'text-neutral-700',
        showPct: false,
    },
    {
        key: 'present',
        label: 'Présents',
        icon: CheckCircle2,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        valueColor: 'text-green-700',
        showPct: true,
    },
    {
        key: 'absent',
        label: 'Absents',
        icon: XCircle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        valueColor: 'text-red-700',
        showPct: true,
    },
    {
        key: 'late',
        label: 'En retard',
        icon: Clock,
        iconColor: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        valueColor: 'text-orange-700',
        showPct: true,
    },
] as const;

export default function QuickStats({ total, present, absent, late }: QuickStatsProps) {
    const values: Record<string, number> = { total, present, absent, late };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(({ key, label, icon: Icon, iconColor, bgColor, borderColor, valueColor, showPct }) => (
                <div
                    key={key}
                    className={cn(
                        'rounded-xl border p-4 flex flex-col gap-2 transition-all duration-200',
                        bgColor,
                        borderColor
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                            {label}
                        </span>
                        <Icon size={16} className={iconColor} />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className={cn('text-2xl font-bold leading-none', valueColor)}>
                            {values[key]}
                        </span>
                        {showPct && total > 0 && (
                            <span className={cn('text-sm font-medium pb-0.5', valueColor, 'opacity-70')}>
                                {pct(values[key], total)}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
