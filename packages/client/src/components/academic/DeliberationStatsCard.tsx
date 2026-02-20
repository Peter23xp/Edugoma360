import { Users, CheckCircle, Clock, Award, XCircle, Star } from 'lucide-react';
import type { DeliberationStats } from '@edugoma360/shared/src/types/academic';

interface DeliberationStatsCardProps {
    stats: DeliberationStats;
}

export default function DeliberationStatsCard({ stats }: DeliberationStatsCardProps) {
    const cards = [
        {
            icon: Users,
            label: 'Total élèves',
            value: stats.total.toString(),
            color: 'text-neutral-600',
            bg: 'bg-neutral-100',
        },
        {
            icon: CheckCircle,
            label: 'Admis',
            value: stats.admitted.toString(),
            sub: `${stats.successRate}% de réussite`,
            color: 'text-green-600',
            bg: 'bg-green-50',
        },
        {
            icon: Clock,
            label: 'Ajournés',
            value: stats.adjourned.toString(),
            color: 'text-orange-600',
            bg: 'bg-orange-50',
        },
        {
            icon: XCircle,
            label: 'Refusés',
            value: stats.failed.toString(),
            color: 'text-red-600',
            bg: 'bg-red-50',
        },
        {
            icon: Award,
            label: 'Distinction',
            value: stats.distinction.toString(),
            color: 'text-green-700',
            bg: 'bg-green-100',
        },
        {
            icon: Star,
            label: 'Grande Dist.',
            value: stats.greatDistinction.toString(),
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
        },
    ];

    // Diagramme camembert simplifié (en CSS)
    const total = stats.total || 1;
    const admittedPct = Math.round((stats.admitted / total) * 100);
    const adjournedPct = Math.round((stats.adjourned / total) * 100);
    const failedPct = 100 - admittedPct - adjournedPct;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white rounded-xl border border-neutral-200 p-4">
                            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                                <Icon size={18} className={card.color} />
                            </div>
                            <p className="text-xl font-bold text-neutral-900">{card.value}</p>
                            <p className="text-xs font-medium text-neutral-700">{card.label}</p>
                            {card.sub && <p className="text-xs text-neutral-500 mt-0.5">{card.sub}</p>}
                        </div>
                    );
                })}
            </div>

            {/* Barre de répartition */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <p className="text-sm font-medium text-neutral-700 mb-3">Répartition des décisions</p>
                <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                    {admittedPct > 0 && (
                        <div className="bg-green-500 transition-all duration-700" style={{ width: `${admittedPct}%` }} title={`Admis: ${admittedPct}%`} />
                    )}
                    {adjournedPct > 0 && (
                        <div className="bg-orange-400 transition-all duration-700" style={{ width: `${adjournedPct}%` }} title={`Ajournés: ${adjournedPct}%`} />
                    )}
                    {failedPct > 0 && (
                        <div className="bg-red-400 transition-all duration-700" style={{ width: `${failedPct}%` }} title={`Refusés: ${failedPct}%`} />
                    )}
                </div>
                <div className="flex items-center gap-4 mt-2">
                    {[
                        { label: `Admis ${admittedPct}%`, bg: 'bg-green-500' },
                        { label: `Ajournés ${adjournedPct}%`, bg: 'bg-orange-400' },
                        { label: `Refusés ${failedPct}%`, bg: 'bg-red-400' },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-sm ${item.bg}`} />
                            <span className="text-xs text-neutral-500">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


