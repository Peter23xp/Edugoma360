import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Plus, Loader2, CheckCircle2, Power, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import ScreenBadge from '../../components/shared/ScreenBadge';
import toast from 'react-hot-toast';

interface AcademicYear {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  terms: { id: string; label: string }[];
}

export default function AcademicYearPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useQuery<AcademicYear[]>({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const res = await api.get('/settings/academic-years');
      return res.data?.data ?? res.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => api.post('/settings/academic-years', { label, startDate, endDate }),
    onSuccess: () => {
      toast.success('Année académique créée !');
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setShowForm(false);
      setLabel('');
      setStartDate('');
      setEndDate('');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const activateMutation = useMutation({
    mutationFn: async (yearId: string) =>
      api.patch(`/settings/academic-years/${yearId}/activate`),
    onSuccess: () => {
      toast.success('Année académique activée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      // Also invalidate budgets so the budget page refreshes
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['context'] });
    },
    onError: () => toast.error("Erreur lors de l'activation"),
  });

  const years: AcademicYear[] = data ?? [];
  const activeYear = years.find((y) => y.isActive);

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/20">
            <CalendarCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Années Académiques</h1>
            <p className="text-sm text-neutral-500">
              {activeYear
                ? `Année active : ${activeYear.label}`
                : '⚠️ Aucune année active — activez-en une ci-dessous'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={14} /> Nouvelle année
        </button>
      </div>

      {/* ─── Warning if no active year ──────────────────────────── */}
      {!isLoading && !activeYear && years.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Aucune année académique active
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Le module Finance ne peut pas fonctionner sans une année académique active.
              Cliquez sur <strong>Activer</strong> pour en définir une.
            </p>
          </div>
        </div>
      )}

      {/* ─── Create Form ────────────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-4 shadow-sm animate-in fade-in duration-200"
        >
          <h2 className="text-sm font-bold text-neutral-800">Nouvelle année académique</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Label *</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="2025-2026"
                required
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="input-label">Date de début *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="input-label">Date de fin *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-60"
            >
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Créer
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* ─── Academic Years Table ───────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : years.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
          <CalendarCheck size={40} className="mx-auto text-neutral-300 mb-3" />
          <p className="text-sm font-medium text-neutral-500">Aucune année académique</p>
          <p className="text-xs text-neutral-400 mt-1">Créez votre première année pour commencer</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Année</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Période</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Trimestres</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {years.map((year) => (
                <tr key={year.id} className={`transition-colors ${year.isActive ? 'bg-primary/5' : 'hover:bg-neutral-50'}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {year.isActive && <CheckCircle2 size={15} className="text-primary shrink-0" />}
                      <span className={`font-semibold ${year.isActive ? 'text-primary' : 'text-neutral-800'}`}>
                        {year.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-neutral-500">
                    {new Date(year.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' → '}
                    {new Date(year.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-neutral-500">
                    {year.terms?.length ?? 0} trimestre(s)
                  </td>
                  <td className="px-5 py-4">
                    {year.isActive
                      ? <ScreenBadge label="Active" variant="success" />
                      : <ScreenBadge label="Inactive" variant="neutral" />
                    }
                  </td>
                  <td className="px-5 py-4 text-right">
                    {!year.isActive && (
                      <button
                        onClick={() => activateMutation.mutate(year.id)}
                        disabled={activateMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                      >
                        {activateMutation.isPending
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Power size={12} />
                        }
                        Activer
                      </button>
                    )}
                    {year.isActive && (
                      <span className="text-xs text-primary font-medium">✓ En cours</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
