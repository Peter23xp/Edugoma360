import { useState, useMemo } from 'react';
import { X, CalendarDays, Check, Wallet } from 'lucide-react';
import { formatFC } from '@edugoma360/shared';

interface PaymentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { totalAmount: number; installments: number; startDate: string }) => void;
  studentName: string;
  totalDebt: number;
}

export function PaymentPlanModal({ isOpen, onClose, onSubmit, studentName, totalDebt }: PaymentPlanModalProps) {
  const [installments, setInstallments] = useState(4);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const options = [2, 3, 4, 6];

  const schedule = useMemo(() => {
    const perMonth = Math.round(totalDebt / installments);
    const start = new Date(startDate);
    return Array.from({ length: installments }).map((_, i) => {
      const due = new Date(start);
      due.setMonth(due.getMonth() + i);
      const amount = i === installments - 1
        ? totalDebt - perMonth * (installments - 1)
        : perMonth;
      return { date: due, amount };
    });
  }, [installments, startDate, totalDebt]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-orange-600 text-white flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Wallet size={20} /> Plan d'Apurement
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Student info */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Élève concerné</p>
              <p className="text-sm font-bold text-neutral-900">{studentName}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Total exigible</p>
              <p className="text-lg font-bold font-mono text-red-600">{formatFC(totalDebt)}</p>
            </div>
          </div>

          {/* Installment options */}
          <div>
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
              Paiement échelonné (Choix)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {options.map(n => {
                const perMonth = Math.round(totalDebt / n);
                return (
                  <button
                    key={n}
                    onClick={() => setInstallments(n)}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4
                      ${installments === n
                        ? 'border-orange-500 bg-orange-50 shadow-sm'
                        : 'border-neutral-100 hover:border-neutral-200 bg-white'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex flex-shrink-0 items-center justify-center transition-colors
                      ${installments === n ? 'border-orange-500' : 'border-neutral-300'}`}>
                      {installments === n && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <div>
                      <span className={`text-sm font-bold block mb-1 ${installments === n ? 'text-orange-700' : 'text-neutral-700'}`}>
                        {n} mensualités
                      </span>
                      <span className="text-xs font-mono font-medium text-neutral-500 block">
                        ≈ {formatFC(perMonth)} / mois
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start date */}
          <div>
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
              Date d'effet (1ère échéance)
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Schedule preview */}
          <div>
             <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
               Aperçu de l'échéancier généré
             </label>
             <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
               {schedule.map((item, i) => (
                 <div key={i} className={`flex items-center justify-between p-3.5 text-sm ${i !== schedule.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                   <div className="flex items-center gap-3">
                     <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                       Tr. {i + 1}
                     </div>
                     <span className="text-neutral-700 font-medium">
                       {item.date.toLocaleDateString('fr-CD', { day: '2-digit', month: 'long', year: 'numeric' })}
                     </span>
                   </div>
                   <span className="font-bold font-mono text-neutral-900">{formatFC(item.amount)}</span>
                 </div>
               ))}
             </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 italic text-[11px] text-neutral-500 font-medium leading-relaxed">
            ⚠️ Attention : La création de ce plan nécessite l'engagement signé des parents. Un rappel automatique de recouvrement sera envoyé 3 jours avant chaque date d'échéance validée.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button 
             onClick={onClose} 
             className="px-6 py-2.5 text-sm font-bold text-neutral-500 hover:text-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-200 rounded-xl"
          >
            Annuler
          </button>
          <button
            onClick={() => onSubmit({ totalAmount: totalDebt, installments, startDate })}
            className="px-8 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <Check size={16} /> Valider le plan
          </button>
        </div>

      </div>
    </div>
  );
}
