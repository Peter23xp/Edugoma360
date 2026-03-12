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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-bg flex items-center justify-center">
              <Ban size={20} className="text-danger" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Annuler le Paiement
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Reçu N° {payment.receiptNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Warning banner */}
          <div className="flex items-start gap-3 p-4 bg-warning-bg rounded-xl border border-warning/10">
            <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-warning-dark">
                Cette action est IRRÉVERSIBLE
              </p>
              <p className="text-xs text-warning-dark/80 mt-1 leading-relaxed">
                Un avoir sera généré automatiquement. Le solde de l'élève sera mis à jour.
                Le tuteur sera notifié par SMS.
              </p>
            </div>
          </div>

          {/* Payment summary */}
          <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Élève</span>
              <span className="font-semibold text-neutral-900">{studentName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Montant</span>
              <span className="font-mono font-bold text-red-600">
                {formatFC(payment.amountPaid)}
              </span>
            </div>
          </div>

          {/* ── Reason selection ──────────────────────────────── */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2.5 block">
              Motif d'annulation <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {CANCEL_REASONS.map((r) => (
                <label
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer
                              transition-all duration-200
                    ${reason === r.value
                      ? 'bg-danger-bg border-danger/30 shadow-sm'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="cancel-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                                transition-colors duration-200
                      ${reason === r.value ? 'border-danger' : 'border-neutral-300'}`}
                  >
                    {reason === r.value && (
                      <div className="w-2 h-2 rounded-full bg-danger" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium
                      ${reason === r.value ? 'text-danger' : 'text-neutral-700'}`}
                  >
                    {r.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Details text ──────────────────────────────────── */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2 block">
              Détails <span className="text-red-500">*</span>
              <span className="text-neutral-400 font-normal normal-case ml-1">(obligatoire)</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Expliquez pourquoi ce paiement doit être annulé..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm
                         focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none
                         transition-all resize-none placeholder:text-neutral-400"
            />
            {details.length > 0 && details.trim().length < 5 && (
              <p className="text-[11px] text-danger mt-1">
                Minimum 5 caractères requis
              </p>
            )}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="p-5 border-t border-neutral-100 flex items-center justify-end gap-3 shrink-0 bg-neutral-50/50">
          <button
            onClick={onClose}
            disabled={cancelPayment.isPending}
            className="px-5 py-2 text-sm font-medium text-neutral-700 
                       bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-2"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || cancelPayment.isPending}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-danger 
                         hover:bg-danger-dark rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelPayment.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Ban size={15} />
            )}
            Confirmer l'annulation
          </button>
        </div>
      </div>

      {/* ── Animations ────────────────────────────────────────── */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
