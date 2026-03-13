import { useState, useEffect } from 'react';
import { X, DollarSign, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-primary text-white flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <DollarSign size={20} /> {fee ? 'Modifier le frais' : 'Nouveau frais'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
           {/* Section 1: Informations principales */}
           <div className="space-y-4">
               <div>
                 <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block">
                     Type de frais
                 </label>
                 <select
                   value={form.type}
                   onChange={(e) => setForm({ ...form, type: e.target.value as FeeTypeCode })}
                   className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                 >
                   {FEE_TYPE_CODES.map((code) => (
                     <option key={code} value={code}>
                       {FEE_TYPES[code].label}
                     </option>
                   ))}
                 </select>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block">
                        Libellé
                    </label>
                    <input
                      type="text"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      placeholder="Ex: Minerval 4ème Scientifique"
                      className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block">
                        Montant (FC)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={form.amount || ''}
                        onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
                        placeholder="30000"
                        className="w-full h-11 px-4 pr-12 bg-white border border-neutral-200 rounded-xl text-sm font-bold font-mono text-neutral-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                        min={0}
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">FC</span>
                    </div>
                  </div>
               </div>
           </div>

           <div className="h-px w-full bg-neutral-100" />

           {/* Section 2: Configuration */}
           <div className="space-y-4">
               <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block">
                     Applicable à
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                     {(Object.keys(FEE_SCOPE_LABELS) as FeeScope[]).map((scope) => (
                        <button
                           key={scope}
                           type="button"
                           onClick={() => setForm({ ...form, scope, sectionIds: [], classIds: [] })}
                           className={`flex-1 py-2.5 px-4 rounded-xl border-2 transition-all text-sm font-bold
                              ${form.scope === scope
                                 ? 'border-primary bg-primary/5 text-primary'
                                 : 'border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200'}`}
                        >
                           {FEE_SCOPE_LABELS[scope]}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Section picker */}
               {form.scope === 'SECTION' && (
                 <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                   <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
                      Sections associées
                   </label>
                   <div className="flex flex-wrap gap-2">
                     {sections.map((s: any) => (
                       <button
                         key={s.id}
                         type="button"
                         onClick={() => toggleSection(s.id)}
                         className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2
                           ${form.sectionIds.includes(s.id)
                             ? 'bg-primary border-primary text-white shadow-sm'
                             : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                       >
                         {s.name}
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               {/* Class picker */}
               {form.scope === 'CLASS' && (
                 <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                   <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
                      Classes associées
                   </label>
                   <div className="flex flex-wrap gap-2">
                     {classes.map((c: any) => (
                       <button
                         key={c.id}
                         type="button"
                         onClick={() => toggleClass(c.id)}
                         className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2
                           ${form.classIds.includes(c.id)
                             ? 'bg-primary border-primary text-white shadow-sm'
                             : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                       >
                         {c.name}
                       </button>
                     ))}
                   </div>
                 </div>
               )}
               
               <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block">
                     Fréquence
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                     {(Object.entries(FEE_FREQUENCY_LABELS) as [FeeFrequency, string][])
                        .filter(([key]) => key !== 'CUSTOM')
                        .map(([key, label]) => (
                           <button
                              key={key}
                              type="button"
                              onClick={() => setForm({ ...form, frequency: key })}
                              className={`py-2 px-3 rounded-xl border-2 transition-all flex items-center gap-2
                                 ${form.frequency === key
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-neutral-100 bg-white hover:border-neutral-200'}`}
                           >
                              <div className={`w-4 h-4 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors
                                 ${form.frequency === key ? 'border-primary' : 'border-neutral-300'}`}>
                                 {form.frequency === key && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                              <span className={`text-sm font-bold ${form.frequency === key ? 'text-primary' : 'text-neutral-600'}`}>
                                 {label}
                              </span>
                           </button>
                        ))}
                  </div>
               </div>

               {/* Months picker */}
               {(form.frequency === 'MONTHLY' || form.frequency === 'TRIMESTRAL') && (
                 <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                   <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
                      Mois ciblés
                   </label>
                   <div className="flex flex-wrap gap-2">
                     {MONTHS.map((m) => (
                       <button
                         key={m.value}
                         type="button"
                         onClick={() => toggleMonth(m.value)}
                         className={`w-12 h-10 rounded-lg text-xs font-bold transition-all border-2
                           ${form.months.includes(m.value)
                             ? 'bg-primary border-primary text-white shadow-sm'
                             : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                       >
                         {m.label}
                       </button>
                     ))}
                   </div>
                 </div>
               )}
           </div>

           <div className="h-px w-full bg-neutral-100" />
           
           {/* Section 3: Options */}
           <div className="space-y-4">
               {/* Required toggle */}
               <div className="flex items-center gap-4">
                 <button
                   type="button"
                   onClick={() => setForm({ ...form, required: !form.required })}
                   className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                     ${form.required ? 'bg-primary' : 'bg-neutral-200'}`}
                 >
                   <span
                     aria-hidden="true"
                     className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${form.required ? 'translate-x-5' : 'translate-x-0'}`}
                   />
                 </button>
                 <span className="text-sm font-bold text-neutral-700">Ce frais est obligatoire</span>
               </div>

               {/* Observations */}
               <div>
                 <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block">
                     Observations
                 </label>
                 <textarea
                   value={form.observations}
                   onChange={(e) => setForm({ ...form, observations: e.target.value })}
                   rows={2}
                   placeholder="Notes ou remarques optionnelles..."
                   className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-colors placeholder:text-neutral-400"
                 />
               </div>
           </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-neutral-500 hover:text-neutral-700 transition-colors bg-transparent border border-transparent rounded-xl"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !form.label || !form.amount}
            className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting ? (
               'Enregistrement...'
            ) : (
               <>
                  <Check size={16} />
                  {fee ? 'Sauvegarder les modifications' : 'Créer le frais'}
               </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
