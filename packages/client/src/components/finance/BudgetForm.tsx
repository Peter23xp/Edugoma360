import { useState } from 'react';
import { Plus, X, Trash2, RefreshCw, Save } from 'lucide-react';
import { formatFC } from '@edugoma360/shared';
import { Budget } from '../../hooks/useBudgets';
import toast from 'react-hot-toast';

interface BudgetFormProps {
  academicYearId: string;
  academicYearLabel?: string;
  existing?: Budget | null;
  onSave: (data: {
    academicYearId: string;
    categories: { name: string; amount: number }[];
    monthlyDistribution: 'UNIFORM' | 'CUSTOM';
    months?: { month: number; amount: number }[];
  }) => Promise<void>;
  onClose: () => void;
}

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export function BudgetForm({ academicYearId, academicYearLabel, existing, onSave, onClose }: BudgetFormProps) {
  const [categories, setCategories] = useState<{ name: string; amount: string }[]>(
    existing?.categories.length
      ? existing.categories.map(c => ({ name: c.name, amount: String(c.amount) }))
      : [
          { name: 'Minerval', amount: '' },
          { name: 'Inscription', amount: '' },
          { name: 'Réinscription', amount: '' },
        ]
  );
  const [distribution, setDistribution] = useState<'UNIFORM' | 'CUSTOM'>(
    existing?.monthlyDistribution ?? 'UNIFORM'
  );
  const [customMonths, setCustomMonths] = useState<Record<number, string>>(
    existing?.months
      ? Object.fromEntries(existing.months.map(m => [m.month, String(m.amount)]))
      : {}
  );
  const [isSaving, setIsSaving] = useState(false);

  const total = categories.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const customTotal = Object.values(customMonths).reduce((s, v) => s + (Number(v) || 0), 0);

  const addCategory = () => setCategories(prev => [...prev, { name: '', amount: '' }]);
  const removeCategory = (i: number) => setCategories(prev => prev.filter((_, idx) => idx !== i));
  const updateCategory = (i: number, field: 'name' | 'amount', val: string) => {
    setCategories(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  };

  const handleSubmit = async () => {
    const validCats = categories.filter(c => c.name && Number(c.amount) > 0);
    if (validCats.length === 0) {
      toast.error('Ajoutez au moins une catégorie avec un montant.');
      return;
    }
    if (distribution === 'CUSTOM') {
      const diff = Math.abs(customTotal - total);
      if (diff > 100) {
        toast.error(`La répartition mensuelle (${formatFC(customTotal)}) doit être égale au total annuel (${formatFC(total)}).`);
        return;
      }
    }
    setIsSaving(true);
    try {
      await onSave({
        academicYearId,
        categories: validCats.map(c => ({ name: c.name, amount: Number(c.amount) })),
        monthlyDistribution: distribution,
        months: distribution === 'CUSTOM'
          ? Object.entries(customMonths)
              .filter(([, v]) => Number(v) > 0)
              .map(([month, amount]) => ({ month: Number(month), amount: Number(amount) }))
          : [],
      });
      toast.success('Budget enregistré avec succès !');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      {/* Sheet on mobile (slides from bottom), centered modal on sm+ */}
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-xl shadow-2xl flex flex-col border-t sm:border border-neutral-200 max-h-[92dvh] rounded-t-2xl">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex-none flex justify-between items-center px-5 py-4 border-b border-neutral-100 bg-neutral-50/60 rounded-t-2xl">
          {/* Drag handle on mobile */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-neutral-300 rounded-full sm:hidden" />
          <div>
            <h2 className="text-base font-bold text-neutral-900">Budget Annuel</h2>
            <p className="text-xs text-neutral-500">{academicYearLabel ?? 'Année en cours'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">

          {/* Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Revenus par catégorie</h3>
              <button
                type="button"
                onClick={addCategory}
                className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
              >
                <Plus size={12} /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {categories.map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cat.name}
                    placeholder="Ex : Minerval"
                    onChange={e => updateCategory(i, 'name', e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-neutral-900"
                  />
                  <input
                    type="number"
                    min="0"
                    value={cat.amount}
                    placeholder="FC"
                    onChange={e => updateCategory(i, 'amount', e.target.value)}
                    className="w-28 sm:w-36 shrink-0 px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-bold text-neutral-900 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => removeCategory(i)}
                    className="p-1.5 text-neutral-300 hover:text-red-500 transition-colors rounded-lg shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5">
              <span className="text-xs sm:text-sm font-bold text-neutral-700">TOTAL ANNUEL</span>
              <span className="text-sm sm:text-base font-bold text-primary">{formatFC(total)}</span>
            </div>
          </div>

          {/* Monthly distribution */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Répartition mensuelle</h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {(['UNIFORM', 'CUSTOM'] as const).map(opt => (
                <label
                  key={opt}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer flex-1 transition-colors ${distribution === opt ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:bg-neutral-50'}`}
                >
                  <input
                    type="radio"
                    name="distribution"
                    value={opt}
                    checked={distribution === opt}
                    onChange={() => setDistribution(opt)}
                    className="text-primary focus:ring-primary h-4 w-4 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className={`text-sm font-semibold ${distribution === opt ? 'text-primary' : 'text-neutral-700'}`}>
                      {opt === 'UNIFORM' ? 'Uniforme' : 'Personnalisée'}
                    </p>
                    <p className="text-xs text-neutral-400 leading-snug">
                      {opt === 'UNIFORM' ? 'Divisé uniformément sur tous les mois' : 'Définissez le montant mois par mois'}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {distribution === 'CUSTOM' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
                  {MONTH_NAMES.map((name, idx) => {
                    const m = idx + 1;
                    return (
                      <div key={m} className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-2">
                        <span className="text-xs font-bold text-neutral-500 w-6 shrink-0">{name}</span>
                        <input
                          type="number"
                          min="0"
                          value={customMonths[m] ?? ''}
                          placeholder="0"
                          onChange={e => setCustomMonths(prev => ({ ...prev, [m]: e.target.value }))}
                          className="flex-1 min-w-0 text-xs font-bold bg-transparent outline-none text-neutral-900 text-right"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className={`flex justify-between items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold ${Math.abs(customTotal - total) <= 100 ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  <span>Total mensuel</span>
                  <span>{formatFC(customTotal)} / {formatFC(total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="flex-none px-4 sm:px-5 py-4 border-t border-neutral-100 bg-white rounded-b-2xl flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Enregistrement...' : 'Enregistrer le budget'}
          </button>
        </div>
      </div>
    </div>
  );
}
