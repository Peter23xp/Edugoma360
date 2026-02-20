import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import type { GradeStats } from '../../hooks/useGrades';

interface GradeStatsCardProps {
    stats: GradeStats;
    totalStudents: number;
    className?: string;
}

export default function GradeStatsCard({ stats, totalStudents, className = '' }: GradeStatsCardProps) {
    const progressPercent = totalStudents > 0
        ? Math.round((stats.filled / totalStudents) * 100)
        : 0;

    const cards = [
        {
            icon: CheckCircle,
            label: 'Notes saisies',
            value: `${stats.filled}/${totalStudents}`,
            color: 'text-green-600',
            bg: 'bg-green-50',
        },
        {
            icon: Clock,
            label: 'Manquantes',
            value: stats.missing.toString(),
            color: stats.missing > 0 ? 'text-orange-600' : 'text-neutral-400',
            bg: stats.missing > 0 ? 'bg-orange-50' : 'bg-neutral-50',
        },
        {
            icon: TrendingUp,
            label: 'Moy. classe',
            value: stats.classAverage !== null ? `${stats.classAverage.toFixed(1)}/20` : '—',
            color: (stats.classAverage ?? 0) >= 10 ? 'text-green-600' : 'text-red-600',
            bg: (stats.classAverage ?? 0) >= 10 ? 'bg-green-50' : 'bg-red-50',
        },
        {
            icon: AlertTriangle,
            label: 'Notes < 10',
            value: stats.belowTen.toString(),
            color: stats.belowTen > 0 ? 'text-red-600' : 'text-neutral-400',
            bg: stats.belowTen > 0 ? 'bg-red-50' : 'bg-neutral-50',
        },
    ];

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Barre de progression */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">Progression de saisie</span>
                    <span className="text-sm font-bold text-neutral-900">{progressPercent}%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <p className="text-xs text-neutral-500 mt-1">{stats.filled} sur {totalStudents} élèves notés</p>
            </div>

            {/* Cartes stats */}
            <div className="grid grid-cols-2 gap-3">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white rounded-xl border border-neutral-200 p-3">
                            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                                <Icon size={16} className={card.color} />
                            </div>
                            <p className="text-lg font-bold text-neutral-900">{card.value}</p>
                            <p className="text-xs text-neutral-500">{card.label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

