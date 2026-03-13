
import { AlertCircle, Users, TrendingDown } from 'lucide-react';
import { formatFC } from '@edugoma360/shared';

interface DebtStatsCardsProps {
  stats: {
    totalDebt: number;
    over90Days: number;
    studentsCount: number;
  };
}

export function DebtStatsCards({ stats }: DebtStatsCardsProps) {
  const cards = [
    {
      label: 'Total des Créances',
      value: formatFC(stats.totalDebt),
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100'
    },
    {
      label: 'Retard > 90 jours',
      value: formatFC(stats.over90Days),
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100'
    },
    {
      label: 'Élèves concernés',
      value: `${stats.studentsCount} élèves`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className={`p-5 rounded-2xl border ${card.border} ${card.bg} shadow-sm flex items-center gap-4`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
            <card.icon className={card.color} size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {card.label}
            </p>
            <p className={`text-xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
