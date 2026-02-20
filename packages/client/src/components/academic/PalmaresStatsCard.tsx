import { TrendingUp, TrendingDown, Award, BarChart2, Percent } from 'lucide-react';
import type { PalmaresData } from '@edugoma360/shared/types/academic';

interface PalmaresStatsCardProps {
    data: PalmaresData;
}

export default function PalmaresStatsCard({ data }: PalmaresStatsCardProps) {
    const { stats } = data;

    const cards = [
        {
            icon: TrendingUp,
            label: 'Meilleure moyenne',
            value: `${stats.highestAverage.toFixed(1)}/20`,
            color: 'text-green-600',
            bg: 'bg-green-50',
        },
        {
            icon: TrendingDown,
            label: 'Moyenne la plus basse',
            value: `${stats.lowestAverage.toFixed(1)}/20`,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
        },
        {
            icon: Award,
            label: 'Moyenne de classe',
            value: `${stats.classAverage.toFixed(1)}/20`,
            color: (stats.classAverage >= 10 ? 'text-blue-600' : 'text-red-600'),
            bg: (stats.classAverage >= 10 ? 'bg-blue-50' : 'bg-red-50'),
        },
        {
            icon: Percent,
            label: 'Taux de réussite',
            value: `${stats.successRate}%`,
            color: (stats.successRate >= 50 ? 'text-green-600' : 'text-red-600'),
            bg: (stats.successRate >= 50 ? 'bg-green-50' : 'bg-red-50'),
        },
        {
            icon: BarChart2,
            label: 'Écart-type',
            value: stats.standardDeviation.toFixed(2),
            sub: 'Dispersion des résultats',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
        {
            icon: TrendingUp,
            label: 'Total élèves',
            value: stats.totalStudents.toString(),
            color: 'text-neutral-600',
            bg: 'bg-neutral-100',
        },
    ];

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
                            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                            <p className="text-xs font-medium text-neutral-700 mt-0.5">{card.label}</p>
                            {card.sub && <p className="text-xs text-neutral-400">{card.sub}</p>}
                        </div>
                    );
                })}
            </div>

            {/* Barre taux réussite */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Taux de réussite</span>
                    <span className="text-sm font-bold">{stats.successRate}%</span>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${stats.successRate >= 50 ? 'bg-green-500' : 'bg-orange-400'}`}
                        style={{ width: `${stats.successRate}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>
            </div>
        </div>
    );
}

