
import { TrendingUp, TrendingDown, Users, Wallet, CreditCard, Activity } from 'lucide-react';
import { formatFC } from '@edugoma360/shared';

interface FinancialDashboardProps {
  kpis: {
    totalRevenue: number;
    totalDebts: number;
    recoveryRate: number;
    avgRevenuePerStudent: number;
    paymentsCount: number;
    avgPaymentAmount: number;
  };
}

export function FinancialDashboard({ kpis }: FinancialDashboardProps) {
  const cards = [
    { label: 'Revenus totaux', value: formatFC(kpis.totalRevenue), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Créances totales', value: formatFC(kpis.totalDebts), icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Recouvrement', value: `${kpis.recoveryRate}%`, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Moyenne / Élève', value: formatFC(kpis.avgRevenuePerStudent), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Transactions', value: kpis.paymentsCount, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Panier Moyen', value: formatFC(kpis.avgPaymentAmount), icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm flex flex-col gap-2">
           <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
              <card.icon className={card.color} size={20} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{card.label}</p>
              <p className={`text-lg font-bold text-neutral-900`}>{card.value}</p>
           </div>
        </div>
      ))}
    </div>
  );
}
