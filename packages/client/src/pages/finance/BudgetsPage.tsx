import { useState } from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import { BudgetForm } from '../../components/finance/BudgetForm';
import { BudgetChart } from '../../components/finance/BudgetChart';
import { BudgetTracking } from '../../components/finance/BudgetTracking';
import {
  TrendingUp, AlertTriangle, CheckCircle2, RefreshCw,
  Edit3, BarChart3, PiggyBank, Target,
} from 'lucide-react';
import { formatFC } from '@edugoma360/shared';
import toast from 'react-hot-toast';

function KpiCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-2 sm:gap-3">
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${accent ?? 'bg-primary/10'}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-widest leading-tight">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5 tracking-tight leading-tight">{value}</p>
        {sub && <p className="text-[11px] sm:text-xs text-neutral-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  const { getBudget, upsertBudget } = useBudgets();
  const { data, isLoading, refetch } = getBudget;
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <p className="text-sm font-medium text-neutral-500">Chargement du budget...</p>
      </div>
    );
  }

  const tracking = data?.tracking;
  const budget = data?.budget;
  const academicYearId = data?.academicYearId ?? '';
  const yearLabel = budget?.academicYear?.label ?? (data?.academicYearId ? 'Année en cours' : 'Aucune année active');

  const realizationRate = tracking?.realizationRate ?? 0;
  const rateColor = realizationRate >= 90 ? 'text-green-600' : realizationRate >= 70 ? 'text-yellow-600' : 'text-red-600';

  if (getBudget.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-6 sm:p-8 text-center bg-white border border-neutral-200 rounded-3xl shadow-sm mx-auto max-w-lg">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="text-red-500" size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Impossible de charger les budgets</h2>
          <p className="text-sm text-neutral-500">
            Aucune année académique <strong>active</strong> n&apos;est configurée. Activez-en une dans les paramètres.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => refetch()}
            className="w-full sm:w-auto px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-semibold hover:bg-neutral-200 transition-colors"
          >
            Réessayer
          </button>
          <a
            href="/settings/academic-year"
            className="w-full sm:w-auto text-center px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            Configurer l&apos;année scolaire
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">

      {/* ─── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <PiggyBank size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight truncate">Budgets &amp; Prévisions</h1>
            <p className="text-xs sm:text-sm text-neutral-500 truncate">Suivi financier — {yearLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!academicYearId) {
              toast.error("Veuillez d'abord activer une année académique dans les paramètres.");
              return;
            }
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all whitespace-nowrap shrink-0"
        >
          <Edit3 size={14} />
          <span>{budget ? 'Modifier le budget' : 'Configurer le budget'}</span>
        </button>
      </div>

      {/* ─── Alerts ────────────────────────────────────────────────── */}
      {tracking?.alerts && tracking.alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 space-y-1.5 animate-in fade-in duration-400">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <AlertTriangle size={12} /> Alertes budgétaires
          </p>
          {tracking.alerts.map((alert, i) => (
            <p key={i} className="text-xs sm:text-sm text-amber-800">{alert}</p>
          ))}
        </div>
      )}

      {/* ─── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard
          icon={<Target size={18} className="text-indigo-600" />}
          label="Budget total"
          value={formatFC(tracking?.totalBudget ?? 0)}
          sub={budget ? `${budget.categories.length} catégorie(s)` : 'Non configuré'}
          accent="bg-indigo-50"
        />
        <KpiCard
          icon={<TrendingUp size={18} className="text-green-600" />}
          label="Revenus réalisés"
          value={formatFC(tracking?.totalRealized ?? 0)}
          sub="Sur l'année en cours"
          accent="bg-green-50"
        />
        <KpiCard
          icon={<BarChart3 size={18} className={realizationRate >= 70 ? 'text-green-600' : 'text-red-600'} />}
          label="Taux de réalisation"
          value={`${realizationRate}%`}
          sub={realizationRate >= 90 ? '🟢 Excellent' : realizationRate >= 70 ? '🟡 En cours' : '🔴 Attention requise'}
          accent={realizationRate >= 90 ? 'bg-green-50' : realizationRate >= 70 ? 'bg-yellow-50' : 'bg-red-50'}
        />
      </div>

      {/* ─── Chart ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-2">
            <BarChart3 size={15} className="text-indigo-500" />
            <span>Suivi mensuel — Prévu vs Réalisé</span>
          </h2>
          <button
            type="button"
            onClick={() => refetch()}
            className="p-1.5 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors shrink-0"
          >
            <RefreshCw size={13} />
          </button>
        </div>
        {tracking?.byMonth && tracking.byMonth.length > 0 ? (
          <BudgetChart data={tracking.byMonth} />
        ) : (
          <div className="h-[160px] sm:h-[200px] flex items-center justify-center text-sm text-neutral-400">
            Aucune donnée mensuelle disponible
          </div>
        )}
      </div>

      {/* ─── Category table ────────────────────────────────────────── */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between gap-2">
          <h2 className="text-xs sm:text-sm font-bold text-neutral-900">Détail par catégorie de revenus</h2>
          {tracking && tracking.byCategory.length > 0 && (
            <span className={`text-xs font-bold shrink-0 ${rateColor}`}>
              {realizationRate >= 90
                ? <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Objectif atteint</span>
                : `${100 - realizationRate}% restant`}
            </span>
          )}
        </div>
        <div className="p-3 sm:p-5">
          <BudgetTracking categories={tracking?.byCategory ?? []} />
        </div>
      </div>

      {/* ─── Form Modal ────────────────────────────────────────────── */}
      {showForm && academicYearId && (
        <BudgetForm
          academicYearId={academicYearId}
          academicYearLabel={yearLabel}
          existing={budget}
          onSave={async (payload) => { await upsertBudget.mutateAsync(payload); }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
