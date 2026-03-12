import { DollarSign, TrendingUp, Layers } from 'lucide-react';
import type { FeeStats } from '../../hooks/useFees';

interface FeeStatsCardsProps {
  stats: FeeStats | undefined;
  isLoading: boolean;
}

export default function FeeStatsCards({ stats, isLoading }: FeeStatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-white rounded-xl border border-neutral-200 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Frais configurés',
      value: stats.total,
      subtitle: `${Object.keys(stats.byType).length} types différents`,
      icon: Layers,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total annuel moyen / élève',
      value: new Intl.NumberFormat('fr-FR').format(stats.totalAmount) + ' FC',
      subtitle: 'Tous frais confondus',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'À percevoir estimé',
      value: new Intl.NumberFormat('fr-FR').format(stats.totalAmount) + ' FC',
      subtitle: 'Par élève par an',
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
              <card.icon size={20} />
            </div>
          </div>
          <p className="text-xs font-semibold text-neutral-500 mb-1">{card.title}</p>
          <h3 className="text-xl font-bold text-neutral-900">{card.value}</h3>
          <p className="text-[11px] text-neutral-400 mt-1">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
