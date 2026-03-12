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
      <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col items-center text-neutral-400 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-medium animate-pulse">Chargement des frais...</span>
        </div>
      </div>
    );
  }

  if (!fees || fees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-green-50 rounded-xl border border-green-200 text-green-800 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-[100px] z-0"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Le compte est en règle</h3>
          <p className="text-green-700/80 text-center font-medium max-w-sm">
            Cet élève n'a actuellement aucun frais scolaire ou autre exigence financière en attente de paiement.
          </p>
        </div>
      </div>
    );
  }

  const allSelected = fees.length > 0 && selectedFeeIds.length === fees.length;

  return (
    <div className="bg-white rounded-xl border border-neutral-300 overflow-hidden shadow-sm">
      <div className="p-5 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-neutral-900 flex items-center gap-3">
            Sélectionner les frais à payer
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{fees.length}</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-1">Cochez les éléments que vous souhaitez inclure dans ce paiement.</p>
        </div>
        <button
          onClick={onSelectAll}
          className="text-sm font-semibold text-primary hover:text-primary-700 transition-colors bg-white px-3 py-1.5 rounded-lg border border-neutral-200 shadow-sm hover:shadow"
        >
          {allSelected ? 'Désélectionner tout' : 'Tout sélectionner'}
        </button>
      </div>
      
      <div className="divide-y divide-neutral-100">
        {fees.map((fee) => (
          <label
            key={fee.feeId}
            className={`flex items-start gap-4 p-5 cursor-pointer transition-all duration-200 hover:bg-neutral-50 ${
              selectedFeeIds.includes(fee.feeId) ? 'bg-primary-50/40' : ''
            }`}
          >
            <div className="pt-0.5">
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                selectedFeeIds.includes(fee.feeId) 
                  ? 'bg-primary border-primary text-white shadow-sm' 
                  : 'bg-white border-neutral-300'
              }`}>
                {selectedFeeIds.includes(fee.feeId) && <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
              </div>
              <input
                type="checkbox"
                checked={selectedFeeIds.includes(fee.feeId)}
                onChange={() => onToggleFee(fee.feeId)}
                className="hidden"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 group-hover:text-primary transition-colors">{fee.name}</span>
                <span className="font-bold text-lg text-neutral-900 font-mono tracking-tight">{formatFC(fee.remainingBalance)}</span>
              </div>
              
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                  Total exigé: <span className="text-neutral-700">{formatFC(fee.amountDue)}</span>
                </span>
                
                {fee.amountPaid > 0 && (
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    Déjà payé: {formatFC(fee.amountPaid)}
                  </span>
                )}
                
                {fee.status === 'OVERDUE' && (
                  <span className="flex items-center gap-1.5 text-xs text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    <AlertCircle size={12} strokeWidth={2.5} />
                    En retard de paiement
                  </span>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
