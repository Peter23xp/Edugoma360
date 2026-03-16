import { BudgetCategory } from '../../hooks/useBudgets';
import { formatFC } from '@edugoma360/shared';
import { AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

interface BudgetTrackingProps {
  categories: BudgetCategory[];
}

function getRateConfig(rate: number) {
  if (rate >= 90) return {
    color: 'text-green-600',
    bg: 'bg-green-500',
    badge: 'bg-green-100 text-green-700 border-green-200',
    icon: <CheckCircle2 size={13} className="text-green-500 shrink-0" />,
  };
  if (rate >= 70) return {
    color: 'text-yellow-600',
    bg: 'bg-yellow-500',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <AlertTriangle size={13} className="text-yellow-500 shrink-0" />,
  };
  return {
    color: 'text-red-600',
    bg: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: <TrendingDown size={13} className="text-red-500 shrink-0" />,
  };
}

export function BudgetTracking({ categories }: BudgetTrackingProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10 text-sm text-neutral-400">
        Aucune catégorie budgétaire définie. Configurez votre budget annuel.
      </div>
    );
  }

  const totalBudgeted = categories.reduce((s, c) => s + c.budgeted, 0);
  const totalRealized = categories.reduce((s, c) => s + c.realized, 0);
  const totalRate = totalBudgeted > 0 ? Math.round((totalRealized / totalBudgeted) * 100) : 0;
  const totalCfg = getRateConfig(totalRate);

  return (
    <>
      {/* ── Desktop table (md+) ────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="text-left px-5 py-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">Catégorie</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">Budget prévu</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">Réalisé</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">Écart</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">Taux</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {categories.map(cat => {
              const cfg = getRateConfig(cat.rate);
              return (
                <tr key={cat.category} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {cfg.icon}
                      <span className="font-semibold text-neutral-800">{cat.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-neutral-700">{formatFC(cat.budgeted)}</td>
                  <td className="px-4 py-4 text-right font-bold text-neutral-900">{formatFC(cat.realized)}</td>
                  <td className={`px-4 py-4 text-right font-bold ${cat.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cat.variance >= 0 ? '+' : ''}{formatFC(cat.variance)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}>
                      {cat.rate}%
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-28 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${cfg.bg}`}
                        style={{ width: `${Math.min(cat.rate, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-50 border-t-2 border-neutral-200">
              <td className="px-5 py-3 font-bold text-neutral-800 text-xs uppercase tracking-widest">Total</td>
              <td className="px-4 py-3 text-right font-bold text-neutral-700">{formatFC(totalBudgeted)}</td>
              <td className="px-4 py-3 text-right font-bold text-neutral-900">{formatFC(totalRealized)}</td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${totalCfg.badge}`}>
                  {totalRate}%
                </span>
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Mobile cards (< md) ───────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {categories.map(cat => {
          const cfg = getRateConfig(cat.rate);
          return (
            <div key={cat.category} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3">
              {/* Category name + rate badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {cfg.icon}
                  <span className="font-semibold text-neutral-800 truncate">{cat.category}</span>
                </div>
                <span className={`inline-flex items-center shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}>
                  {cat.rate}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${cfg.bg}`}
                  style={{ width: `${Math.min(cat.rate, 100)}%` }}
                />
              </div>

              {/* Amounts grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-neutral-50 rounded-lg p-2">
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wide">Prévu</p>
                  <p className="text-xs font-bold text-neutral-700 mt-0.5">{formatFC(cat.budgeted)}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-2">
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wide">Réalisé</p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">{formatFC(cat.realized)}</p>
                </div>
                <div className={`rounded-lg p-2 ${cat.variance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wide">Écart</p>
                  <p className={`text-xs font-bold mt-0.5 ${cat.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cat.variance >= 0 ? '+' : ''}{formatFC(cat.variance)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Mobile total summary */}
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border font-bold text-sm ${totalCfg.badge}`}>
          <span className="uppercase tracking-widest text-xs">Total global</span>
          <div className="flex items-center gap-2">
            <span>{formatFC(totalRealized)} / {formatFC(totalBudgeted)}</span>
            <span className="px-2 py-0.5 rounded-full border text-xs">{totalRate}%</span>
          </div>
        </div>
      </div>
    </>
  );
}
