import { useState } from 'react';
import { X, AlertTriangle, Loader2, Ban } from 'lucide-react';
import { formatFC } from '@edugoma360/shared';
import { usePaymentHistory } from '../../hooks/usePaymentHistory';
import type { PaymentHistoryItem } from '../../hooks/usePaymentHistory';

interface CancelPaymentModalProps {
  payment: PaymentHistoryItem;
  onClose: () => void;
  onCancelled: () => void;
}

const CANCEL_REASONS = [
  { value: 'ERREUR_SAISIE', label: 'Erreur de saisie' },
  { value: 'ANNULE_FAMILLE', label: 'Paiement annulé par la famille' },
  { value: 'DOUBLON', label: 'Doublon' },
  { value: 'AUTRE', label: 'Autre' },
] as const;

export function CancelPaymentModal({ payment, onClose, onCancelled }: CancelPaymentModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const { cancelPayment } = usePaymentHistory();

  const studentName = payment.student
    ? `${payment.student.nom} ${payment.student.postNom}`
    : '—';

  const isValid = reason && details.trim().length >= 5;

  const handleConfirm = async () => {
    if (!isValid) return;

    cancelPayment.mutate(
      {
        id: payment.id,
        dto: {
          reason: CANCEL_REASONS.find((r) => r.value === reason)?.label || reason,
          details: details.trim(),
        },
      },
      {
        onSuccess: () => {
          onCancelled();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-red-600 text-white flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle size={20} /> Annuler le paiement
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Warning Message */}
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
             <div className="mt-0.5 w-6 h-6 flex-shrink-0 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <AlertTriangle size={14} />
             </div>
             <div>
                <p className="text-sm font-bold text-red-800 mb-1">Attention, cette action est irréversible !</p>
                <p className="text-xs text-red-600 leading-relaxed font-medium">
                   Le montant retournera au solde impayé de l'élève. Le reçu associé sera invalidé et ne pourra plus servir de preuve de paiement valide.
                </p>
             </div>
          </div>

          {/* Payment Summary */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-3">
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
               Détails de la transaction
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-1">N° Reçu</p>
                 <p className="text-sm font-bold font-mono text-neutral-900">{payment.receiptNumber || '—'}</p>
              </div>
              <div className="text-right">
                 <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Montant</p>
                 <p className="text-lg font-bold font-mono text-red-600">{formatFC(payment.amountPaid)}</p>
              </div>
            </div>
            <div className="h-px w-full bg-neutral-200" />
            <div>
                 <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Élève concerné</p>
                 <p className="text-sm font-bold text-neutral-900">{studentName}</p>
            </div>
          </div>

          {/* Reason selection */}
          <div>
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
               Motif d'annulation <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {CANCEL_REASONS.map((r) => (
                  <button
                     key={r.value}
                     onClick={() => setReason(r.value)}
                     className={`py-3 px-4 rounded-xl border-2 transition-all text-left flex items-start gap-4
                        ${reason === r.value 
                           ? 'border-red-500 bg-red-50 shadow-sm' 
                           : 'border-neutral-100 bg-white hover:border-neutral-200'}`}
                  >
                     <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex flex-shrink-0 items-center justify-center transition-colors
                        ${reason === r.value ? 'border-red-500' : 'border-neutral-300'}`}>
                        {reason === r.value && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                     </div>
                     <span className={`text-sm font-bold mt-0.5 leading-tight ${reason === r.value ? 'text-red-700' : 'text-neutral-700'}`}>
                        {r.label}
                     </span>
                  </button>
               ))}
            </div>
          </div>

          {/* Details text */}
          <div>
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 block border-t border-neutral-100 pt-5">
               Détails complémentaires <span className="text-red-500">*</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Expliquez brièvement pourquoi ce paiement doit être annulé..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-medium
                         focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none
                         transition-all resize-none placeholder:text-neutral-400"
            />
            {details.length > 0 && details.trim().length < 5 && (
              <p className="text-[11px] font-bold text-red-500 mt-2">
                Minimum 5 caractères requis
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={cancelPayment.isPending}
            className="px-6 py-2.5 text-sm font-bold text-neutral-500 hover:text-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-200 rounded-xl"
          >
            Fermer
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || cancelPayment.isPending}
            className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-red-600 
                         hover:bg-red-700 rounded-xl shadow-lg shadow-red-500/20 transition-all
                       disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full sm:w-auto"
          >
            {cancelPayment.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Ban size={16} />
            )}
            {cancelPayment.isPending ? "Annulation en cours..." : "Confirmer l'annulation"}
          </button>
        </div>
      </div>
    </div>
  );
}
