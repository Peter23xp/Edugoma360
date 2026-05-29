import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { MaterialStats } from '../../hooks/useMaterial';

interface Props {
  stats: MaterialStats;
}

export default function MaterialStatsCards({ stats }: Props) {
  const cards = [
    {
      label: 'Total articles',
      value: stats.totalItems,
      icon: Package,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Bon état',
      value: stats.goodItems,
      suffix: stats.totalItems > 0 ? `(${Math.round((stats.goodItems / stats.totalItems) * 100)}%)` : '',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Usé',
      value: stats.usedItems,
      suffix: stats.totalItems > 0 ? `(${Math.round((stats.usedItems / stats.totalItems) * 100)}%)` : '',
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      label: 'Hors service',
      value: stats.brokenItems,
      suffix: stats.totalItems > 0 ? `(${Math.round((stats.brokenItems / stats.totalItems) * 100)}%)` : '',
      icon: XCircle,
      color: 'text-red-600 bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xl font-bold">
                {card.value.toLocaleString('fr-FR')}
                {card.suffix && <span className="text-sm font-normal text-gray-400 ml-1">{card.suffix}</span>}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
