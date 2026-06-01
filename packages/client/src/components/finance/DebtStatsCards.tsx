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
      label: 'Créances totales',
      value: formatFC(stats.totalDebt),
      icon: TrendingDown,
      tone: 'text-error bg-error-light',
    },
    {
      label: 'Retards de plus de 90 jours',
      value: formatFC(stats.over90Days),
      icon: AlertCircle,
      tone: 'text-accent bg-accent-light',
    },
    {
      label: 'Élèves concernés',
      value: `${stats.studentsCount} élève${stats.studentsCount > 1 ? 's' : ''}`,
      icon: Users,
      tone: 'text-info bg-info-light',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.tone}`}>
            <card.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-600">{card.label}</p>
            <p className="mt-1 text-xl font-bold text-neutral-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
