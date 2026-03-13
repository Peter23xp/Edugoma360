
import { Clock, CheckCircle2, AlertCircle, Calendar, CalendarCheck, CalendarX } from 'lucide-react';

interface AbsenceStatsCardsProps {
    stats?: any;
    isTeacher?: boolean;
}

export default function AbsenceStatsCards({ stats, isTeacher = false }: AbsenceStatsCardsProps) {
    const prefetCards = [
        { id: 'pending-count', label: 'En attente', value: stats?.totalPending ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'approved-month', label: 'Approuvés ce mois', value: stats?.totalApprovedMonth ?? 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'absents-today', label: "Absents aujourd'hui", value: stats?.currentAbsents ?? 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    const teacherCards = [
        { id: 'days-taken', label: 'Jours pris', value: `${stats?.pris ?? 0} / ${stats?.total ?? 20}`, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'days-remaining', label: 'Jours restants', value: stats?.restants ?? 20, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'my-pending', label: 'En attente', value: stats?.pending ?? 0, icon: CalendarX, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const cards = isTeacher ? teacherCards : prefetCards;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cards.map((card) => (
                <div
                    key={card.id}
                    id={card.id}
                    className="bg-white p-4 rounded-xl border border-neutral-300/50 shadow-sm flex items-center gap-3"
                >
                    <div className={`p-2.5 ${card.bg} ${card.color} rounded-lg flex-shrink-0`}>
                        <card.icon size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500 font-medium">{card.label}</p>
                        <p className="text-lg font-bold text-neutral-900 tabular-nums">{card.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
