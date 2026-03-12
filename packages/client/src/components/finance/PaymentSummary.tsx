import { formatFC, PAYMENT_METHODS } from '@edugoma360/shared';
import type { PaymentMethod } from '@edugoma360/shared';
import { Tag, Calendar, User, CreditCard } from 'lucide-react';

interface PaymentSummaryProps {
  student: any;
  selectedFees: any[];
  amountToPay: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
}

export function PaymentSummary({ student, selectedFees, amountToPay, paymentMethod, paymentDate }: PaymentSummaryProps) {
  const totalDue = selectedFees.reduce((sum, f) => sum + f.remainingBalance, 0);
  const toPay = Number(amountToPay) || 0;

  return (
    <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <h3 className="text-sm font-semibold text-neutral-900">Résumé de la transaction</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Élève */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
            <User size={13} className="text-neutral-500" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">Élève</span>
            <span className="block text-sm font-semibold text-neutral-900 truncate">{student.nom} {student.postNom}</span>
            <span className="block text-xs text-neutral-500 font-mono">{student.matricule}</span>
          </div>
        </div>

        <div className="border-t border-neutral-100" />

        {/* Frais */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
            <Tag size={13} className="text-neutral-500" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">Frais sélectionnés</span>
            {selectedFees.length > 0 ? (
              <span className="block text-sm text-neutral-700 leading-relaxed">
                {selectedFees.map(f => f.name).join(', ')}
              </span>
            ) : (
              <span className="block text-sm text-neutral-400 italic">Aucun</span>
            )}
            <span className="block text-xs text-neutral-500 mt-1">
              Total: <strong className="text-neutral-700">{formatFC(totalDue)}</strong>
            </span>
          </div>
        </div>

        <div className="border-t border-neutral-100" />

        {/* Méthode + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
              <CreditCard size={11} className="text-neutral-500" />
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">Moyen</span>
              <span className="block text-xs font-medium text-neutral-700">{PAYMENT_METHODS[paymentMethod] || paymentMethod}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar size={11} className="text-neutral-500" />
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">Date</span>
              <span className="block text-xs font-medium text-neutral-700">
                {new Date(paymentDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Montant à encaisser */}
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Montant à encaisser
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-primary tracking-tight">
            {formatFC(toPay)}
          </div>
          {toPay < totalDue && toPay > 0 && (
            <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-between items-center text-xs">
              <span className="text-orange-600 font-medium">Reste à payer</span>
              <span className="font-bold text-orange-600 font-mono">{formatFC(totalDue - toPay)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
