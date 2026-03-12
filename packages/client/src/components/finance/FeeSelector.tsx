import { formatFC } from '@edugoma360/shared';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { FeeDue } from '@edugoma360/shared';

interface FeeSelectorProps {
  fees: FeeDue[] | null;
  isLoading: boolean;
  selectedFeeIds: string[];
  onToggleFee: (feeId: string) => void;
  onSelectAll: () => void;
}

export function FeeSelector({ fees, isLoading, selectedFeeIds, onToggleFee, onSelectAll }: FeeSelectorProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center text-neutral-400 gap-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-sm font-medium">Chargement des frais...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!fees || fees.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 mb-1">Aucun frais en attente</h3>
          <p className="text-xs text-neutral-500 max-w-xs">
            Cet élève n'a actuellement aucun frais scolaire en attente de paiement.
          </p>
        </div>
      </div>
    );
  }

  const allSelected = fees.length > 0 && selectedFeeIds.length === fees.length;

  return (
    <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Sélectionner les frais à payer
            <span className="ml-2 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{fees.length}</span>
          </h3>
        </div>
        <button
          onClick={onSelectAll}
          className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {allSelected ? 'Désélectionner tout' : 'Tout sélectionner'}
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-neutral-100">
        {fees.map((fee) => {
          const isChecked = selectedFeeIds.includes(fee.feeId);
          return (
            <label
              key={fee.feeId}
              className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors duration-150
                ${isChecked ? 'bg-primary/5' : 'hover:bg-neutral-50'}`}
            >
              <div className="pt-0.5 shrink-0">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                  ${isChecked
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-neutral-300'
                  }`}>
                  {isChecked && (
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleFee(fee.feeId)}
                  className="hidden"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">{fee.name}</span>
                  <span className="text-sm font-bold text-neutral-900 font-mono">{formatFC(fee.remainingBalance)}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-neutral-500">
                    Total: {formatFC(fee.amountDue)}
                  </span>
                  {fee.amountPaid > 0 && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      Payé: {formatFC(fee.amountPaid)}
                    </span>
                  )}
                  {fee.status === 'OVERDUE' && (
                    <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                      <AlertCircle size={10} /> En retard
                    </span>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
