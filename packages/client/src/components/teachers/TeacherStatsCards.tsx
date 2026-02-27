import React from 'react';
import { Users, TrendingUp, CalendarX, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TeacherStatsCardsProps {
    stats?: {
        totalTeachers: number;
        activeTeachers: number;
        onLeave: number;
        suspended: number;
        studentTeacherRatio: number;
        lastMonthTeachers?: number;
    };
    isLoading?: boolean;
}

const TeacherStatsCards: React.FC<TeacherStatsCardsProps> = ({ stats, isLoading }) => {
    if (isLoading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse h-36" />
                ))}
            </div>
        );
    }

    const totalChange = stats.lastMonthTeachers
        ? stats.totalTeachers - stats.lastMonthTeachers
        : 0;

    const cards = [
        {
            id: 'total-teachers',
            title: 'Total Enseignants',
            value: stats.totalTeachers,
            sub: totalChange !== 0
                ? `${totalChange > 0 ? '+' : ''}${totalChange} ce mois`
                : `${stats.activeTeachers} actifs`,
            change: totalChange,
            icon: <Users size={24} />,
            color: 'from-green-600 to-green-700',
            lightColor: 'bg-green-50 text-green-700',
        },
        {
            id: 'student-ratio',
            title: 'Ratio Élèves/Enseignant',
            value: stats.studentTeacherRatio?.toFixed(1) ?? '—',
            sub: 'élèves par enseignant',
            icon: <TrendingUp size={24} />,
            color: 'from-blue-500 to-blue-700',
            lightColor: 'bg-blue-50 text-blue-700',
        },
        {
            id: 'on-leave',
            title: 'En congé',
            value: stats.onLeave,
            sub: stats.onLeave === 0
                ? 'Aucun en congé actuellement'
                : `${stats.onLeave} absent${stats.onLeave > 1 ? 's' : ''} aujourd'hui`,
            icon: <CalendarX size={24} />,
            color: 'from-amber-500 to-amber-600',
            lightColor: 'bg-amber-50 text-amber-700',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map(card => (
                <div
                    key={card.id}
                    id={card.id}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative"
                >
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-gray-50 opacity-50 group-hover:scale-125 transition-transform duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.lightColor}`}>
                                {card.icon}
                            </div>
                            {card.change !== undefined && card.change !== 0 && (
                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-xl ${card.change > 0
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-600'
                                    }`}>
                                    {card.change > 0
                                        ? <ArrowUpRight size={14} />
                                        : <ArrowDownRight size={14} />
                                    }
                                    {Math.abs(card.change)}
                                </span>
                            )}
                        </div>
                        <div className="text-4xl font-black text-gray-900 tabular-nums">{card.value}</div>
                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">{card.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TeacherStatsCards;
