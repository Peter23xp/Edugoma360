import { Users, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StatsOverviewProps {
    data: {
        totalActive: number;
        averageClassGrade: number;
        successRate: number;
        averageWorkload: number;
        trends: {
            teachers: string;
            grade: string;
            successRate: string;
        };
    };
    isLoading: boolean;
}

export default function StatsOverview({ data, isLoading }: StatsOverviewProps) {
    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-white rounded-xl border border-neutral-200 animate-pulse" />
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Enseignants actifs',
            value: data.totalActive,
            trend: data.trends.teachers,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            status: 'Stable'
        },
        {
            title: 'Moy. classes enseignants',
            value: `${data.averageClassGrade} / 20`,
            trend: data.trends.grade,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            status: data.averageClassGrade >= 12 ? 'Bon' : 'Moyen'
        },
        {
            title: 'Taux réussite global',
            value: `${data.successRate}%`,
            trend: data.trends.successRate,
            icon: CheckCircle2,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            status: data.successRate >= 70 ? 'Satisfaisant' : 'À améliorer'
        },
        {
            title: 'Charge moy. hebdo',
            value: `${data.averageWorkload} h`,
            trend: 'Stable',
            icon: Clock,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            status: 'Équilibré'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div key={index} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className={cn("p-2 rounded-lg", card.bg, card.color)}>
                            <card.icon size={20} />
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                            card.trend.startsWith('+') ? "bg-emerald-100 text-emerald-700" :
                                card.trend.startsWith('-') ? "bg-rose-100 text-rose-700" : "bg-neutral-100 text-neutral-600"
                        )}>
                            {card.trend}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-neutral-500 mb-1">{card.title}</p>
                        <h3 className="text-2xl font-bold text-neutral-900">{card.value}</h3>
                        <p className="text-[10px] text-neutral-400 mt-1 font-medium italic">
                            Status: <span className="text-neutral-600">{card.status}</span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
