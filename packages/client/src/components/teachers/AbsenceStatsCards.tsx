import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Calendar, CalendarCheck, CalendarX } from 'lucide-react';

interface AbsenceStatsCardsProps {
    stats?: any;
    isTeacher?: boolean;
}

export default function AbsenceStatsCards({ stats, isTeacher = false }: AbsenceStatsCardsProps) {
    // PREFET view: pending, approval rate, absences this week
    const prefetCards = [
        {
            id: 'pending-count',
            label: 'En attente',
            value: stats?.totalPending ?? 0,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            id: 'approved-month',
            label: 'Approuvés ce mois',
            value: stats?.totalApprovedMonth ?? 0,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            id: 'absents-today',
            label: 'Absents aujourd\'hui',
            value: stats?.currentAbsents ?? 0,
            icon: AlertCircle,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
        },
    ];

    // TEACHER view: days taken / 20, remaining, pending
    const teacherCards = [
        {
            id: 'days-taken',
            label: 'Jours pris',
            value: `${stats?.pris ?? 0} / ${stats?.total ?? 20}`,
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            id: 'days-remaining',
            label: 'Jours restants',
            value: stats?.restants ?? 20,
            icon: CalendarCheck,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            id: 'my-pending',
            label: 'En attente',
            value: stats?.pending ?? 0,
            icon: CalendarX,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
    ];

    const cards = isTeacher ? teacherCards : prefetCards;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
                <div
                    key={card.id}
                    id={card.id}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6"
                >
                    <div className={`p-4 ${card.bg} ${card.color} rounded-2xl flex-shrink-0`}>
                        <card.icon size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                            {card.label}
                        </p>
                        <p className="text-2xl font-black text-gray-900 tabular-nums">{card.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
