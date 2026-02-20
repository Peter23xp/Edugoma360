import { Users, TrendingUp, Award, BookOpen } from 'lucide-react';
import type { ClassWithStats } from '@edugoma360/shared/types/academic';

interface ClassStatsCardProps {
    classData: ClassWithStats;
}

export default function ClassStatsCard({ classData }: ClassStatsCardProps) {
    const occupancyRate = classData.maxStudents > 0
        ? Math.round((classData.currentStudents / classData.maxStudents) * 100)
        : 0;

    const stats = [
        {
            icon: Users,
            label: 'Effectif',
            value: `${classData.currentStudents}/${classData.maxStudents}`,
            sub: `${occupancyRate}% d'occupation`,
            color: occupancyRate > 90 ? 'text-orange-600' : 'text-blue-600',
            bg: occupancyRate > 90 ? 'bg-orange-50' : 'bg-blue-50',
        },
        {
            icon: TrendingUp,
            label: 'Moy. classe',
            value: classData.averageScore !== null && classData.averageScore !== undefined
                ? `${classData.averageScore.toFixed(1)}/20`
                : '—',
            sub: 'Trimestre actuel',
            color: (classData.averageScore ?? 0) >= 10 ? 'text-green-600' : 'text-red-600',
            bg: (classData.averageScore ?? 0) >= 10 ? 'bg-green-50' : 'bg-red-50',
        },
        {
            icon: Award,
            label: 'Taux réussite',
            value: classData.successRate !== null && classData.successRate !== undefined
                ? `${classData.successRate}%`
                : '—',
            sub: 'Élèves ≥ 10/20',
            color: (classData.successRate ?? 0) >= 50 ? 'text-green-600' : 'text-orange-600',
            bg: (classData.successRate ?? 0) >= 50 ? 'bg-green-50' : 'bg-orange-50',
        },
        {
            icon: BookOpen,
            label: 'Matières',
            value: classData.subjectCount?.toString() ?? '—',
            sub: 'Cette section',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.label}
                        className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col gap-2"
                    >
                        <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                            <Icon size={18} className={stat.color} />
                        </div>
                        <p className="text-xl font-bold text-neutral-900">{stat.value}</p>
                        <div>
                            <p className="text-xs font-medium text-neutral-700">{stat.label}</p>
                            <p className="text-xs text-neutral-500">{stat.sub}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

