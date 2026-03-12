import { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { FEE_TYPES, FEE_TYPE_CODES, FEE_FREQUENCY_LABELS, FEE_SCOPE_LABELS } from '@edugoma360/shared';
import type { FeeTypeCode, FeeFrequency, FeeScope } from '@edugoma360/shared';
import type { Fee } from '../../hooks/useFees';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

interface FeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  fee?: Fee | null;
  isSubmitting?: boolean;
}

const MONTHS = [
  { value: 9, label: 'Sept' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Déc' },
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Fév' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avr' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
];

export default function FeeFormModal({ isOpen, onClose, onSubmit, fee, isSubmitting }: FeeFormModalProps) {
  const [form, setForm] = useState({
    type: 'MINERVAL' as FeeTypeCode,
    label: '',
    amount: 0,
    scope: 'SCHOOL' as FeeScope,
    sectionIds: [] as string[],
    classIds: [] as string[],
    frequency: 'MONTHLY' as FeeFrequency,
    months: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6] as number[],
    required: true,
    observations: '',
  });

  // Fetch sections & classes
  const { data: sections = [] } = useQuery({
    queryKey: ['sections-list'],
    queryFn: async () => {
      const { data } = await api.get('/settings/sections');
      const arr = Array.isArray(data) ? data : (data?.sections || data?.data || []);
      return Array.isArray(arr) ? arr : [];
    },
    enabled: isOpen,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes-list'],
    queryFn: async () => {
      const { data } = await api.get('/settings/classes');
      const arr = Array.isArray(data) ? data : (data?.classes || data?.data || []);
      return Array.isArray(arr) ? arr : [];
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (fee) {
      setForm({
        type: (fee.type as FeeTypeCode) || 'AUTRE',
        label: fee.name,
        amount: fee.amount,
        scope: (fee.scope as FeeScope) || 'SCHOOL',
        sectionIds: fee.sectionIds || [],
        classIds: fee.classIds || [],
        frequency: (fee.frequency as FeeFrequency) || 'ANNUAL',
        months: fee.months || [],
        required: fee.isRequired,
        observations: fee.observations || '',
      });
    } else {
      setForm({
        type: 'MINERVAL',
        label: '',
        amount: 0,
        scope: 'SCHOOL',
        sectionIds: [],
        classIds: [],
        frequency: 'MONTHLY',
        months: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6],
        required: true,
        observations: '',
      });
    }
  }, [fee, isOpen]);

  // Auto-set frequency when type changes
  useEffect(() => {
    const typeDef = FEE_TYPES[form.type];
    if (typeDef && !fee) {
      setForm((prev) => ({
        ...prev,
        frequency: typeDef.frequency as FeeFrequency,
        required: typeDef.required,
        label: prev.label || typeDef.label,
      }));
    }
  }, [form.type, fee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const toggleMonth = (month: number) => {
    setForm((prev) => ({
      ...prev,
      months: prev.months.includes(month)
        ? prev.months.filter((m) => m !== month)
        : [...prev.months, month],
    }));
  };

  const toggleSection = (id: string) => {
    setForm((prev) => ({
      ...prev,
      sectionIds: prev.sectionIds.includes(id)
        ? prev.sectionIds.filter((s) => s !== id)
        : [...prev.sectionIds, id],
    }));
  };

  const toggleClass = (id: string) => {
    setForm((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(id)
        ? prev.classIds.filter((c) => c !== id)
        : [...prev.classIds, id],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign size={20} />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">
              {fee ? 'Modifier le frais' : 'Nouveau frais'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100">
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Type de frais *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as FeeTypeCode })}
              className="w-full h-10 px-3 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              {FEE_TYPE_CODES.map((code) => (
                <option key={code} value={code}>
                  {FEE_TYPES[code].label}
                </option>
              ))}
            </select>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Libellé *</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Ex: Minerval 4ème Scientifique"
              className="w-full h-10 px-3 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Montant *</label>
            <div className="relative">
              <input
                type="number"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
                placeholder="30000"
                className="w-full h-10 px-3 pr-12 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                min={0}
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">FC</span>
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Applicable à *</label>
            <div className="flex flex-col gap-2">
              {(Object.keys(FEE_SCOPE_LABELS) as FeeScope[]).map((scope) => (
                <label key={scope} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value={scope}
                    checked={form.scope === scope}
                    onChange={() => setForm({ ...form, scope, sectionIds: [], classIds: [] })}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-neutral-700">{FEE_SCOPE_LABELS[scope]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section picker */}
          {form.scope === 'SECTION' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Sections</label>
              <div className="flex flex-wrap gap-2">
                {sections.map((s: any) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSection(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      form.sectionIds.includes(s.id)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary/50'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Class picker */}
          {form.scope === 'CLASS' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Classes</label>
              <div className="flex flex-wrap gap-2">
                {classes.map((c: any) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClass(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      form.classIds.includes(c.id)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary/50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Fréquence *</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(FEE_FREQUENCY_LABELS) as [FeeFrequency, string][])
                .filter(([key]) => key !== 'CUSTOM')
                .map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      form.frequency === key
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={key}
                      checked={form.frequency === key}
                      onChange={() => setForm({ ...form, frequency: key })}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
            </div>
          </div>

          {/* Months picker (for monthly/trimestral) */}
          {(form.frequency === 'MONTHLY' || form.frequency === 'TRIMESTRAL') && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Mois de paiement</label>
              <div className="flex flex-wrap gap-2">
                {MONTHS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => toggleMonth(m.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      form.months.includes(m.value)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary/50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Required toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) => setForm({ ...form, required: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
            <span className="text-sm text-neutral-700">Ce frais est obligatoire</span>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Observations</label>
            <textarea
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
              rows={2}
              placeholder="Notes ou remarques..."
              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.label || !form.amount}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enregistrement...' : fee ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
