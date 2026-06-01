import { useState, useMemo } from 'react';
import { X, CalendarDays, Check, Wallet, AlertTriangle } from 'lucide-react';
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
    return Array.from({ length: installments }).map((_, index) => {
      const due = new Date(start);
      due.setMonth(due.getMonth() + index);
      const amount = index === installments - 1
        ? totalDebt - perMonth * (installments - 1)
        : perMonth;
      return { date: due, amount };
    });
  }, [installments, startDate, totalDebt]);

  if (!isOpen) return null;

  return (
    <div className="edugoma-modal-overlay">
      <div className="edugoma-modal-panel max-w-lg">
        <div className="edugoma-modal-header">
          <div className="flex items-center gap-3">
            <div className="edugoma-modal-icon">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Plan de paiement</h2>
              <p className="text-xs text-neutral-500">Échelonnement de la créance</p>
            </div>
          </div>
          <button onClick={onClose} className="edugoma-modal-close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="edugoma-modal-body space-y-5">
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-neutral-500">Élève concerné</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">{studentName}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium text-neutral-500">Total exigible</p>
              <p className="mt-1 font-mono text-lg font-bold text-error">{formatFC(totalDebt)}</p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Nombre de mensualités</label>
            <div className="grid grid-cols-2 gap-2">
              {options.map((option) => {
                const perMonth = Math.round(totalDebt / option);
                const selected = installments === option;
                return (
                  <button
                    key={option}
                    onClick={() => setInstallments(option)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 h-3 w-3 rounded-full border ${selected ? 'border-primary bg-primary' : 'border-neutral-300'}`} />
                      <div>
                        <span className={`block text-sm font-semibold ${selected ? 'text-primary' : 'text-neutral-800'}`}>
                          {option} mensualités
                        </span>
                        <span className="mt-1 block font-mono text-xs text-neutral-500">
                          {formatFC(perMonth)} / mois
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Date de première échéance</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Échéancier prévu</label>
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              {schedule.map((item, index) => (
                <div
                  key={`${item.date.toISOString()}-${index}`}
                  className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${index !== schedule.length - 1 ? 'border-b border-neutral-100' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/5 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="text-neutral-700">
                      {item.date.toLocaleDateString('fr-CD', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-neutral-900">{formatFC(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-accent/25 bg-accent-light p-3 text-sm text-accent">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            La création du plan doit correspondre à un engagement signé des parents.
          </div>
        </div>

        <div className="edugoma-modal-footer">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Annuler
          </button>
          <button
            onClick={() => onSubmit({ totalAmount: totalDebt, installments, startDate })}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              Valider le plan
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
