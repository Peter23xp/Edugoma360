import { School, CheckCircle, Users, DoorOpen } from 'lucide-react';
import { ClassStats } from '../../hooks/useClasses';

interface ClassStatsCardsProps {
    stats: ClassStats;
}

const cards = (s: ClassStats) => [
    {
        label: 'Total classes',
        value: String(s.total),
        sub: `${s.total} classes actives`,
        icon: School,
        color: 'text-info',
        bg: 'bg-info-light',
    },
    {
        label: 'Classes complètes',
        value: `${s.complete}/${s.total}`,
        sub: s.complete >= s.total * 0.8 ? 'Bon remplissage' : `${s.total - s.complete} sous effectif`,
        icon: CheckCircle,
        color: s.complete >= s.total * 0.8 ? 'text-primary' : 'text-warning',
        bg: s.complete >= s.total * 0.8 ? 'bg-primary/5' : 'bg-warning-light',
    },
    {
        label: 'Effectif moyen',
        value: `${s.avgStudents} élèves`,
        sub: `Total : ${s.totalStudents} élèves`,
        icon: Users,
        color: 'text-info',
        bg: 'bg-info-light',
    },
    {
        label: 'Salles utilisées',
        value: `${s.roomsUsed}/${s.total}`,
        sub: s.total - s.roomsUsed > 0 ? `${s.total - s.roomsUsed} sans salle` : 'Toutes attribuées',
        icon: DoorOpen,
        color: 'text-neutral-700',
        bg: 'bg-neutral-100',
    },
];

export default function ClassStatsCards({ stats }: ClassStatsCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards(stats).map((k, i) => (
                <div
                    key={i}
                    className="bg-white border border-neutral-300/50 rounded-lg p-5 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                    <div className={`p-2.5 rounded-lg ${k.bg} shrink-0`}>
                        <k.icon size={18} className={k.color} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-neutral-500 truncate">{k.label}</p>
                        <p className={`text-lg font-bold mt-0.5 truncate ${k.color}`}>{k.value}</p>
                        <p className="text-xs text-neutral-500 truncate">{k.sub}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
