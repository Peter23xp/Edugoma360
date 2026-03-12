import { X, Printer, Ban, Loader2, User, Calendar, CreditCard, Hash, FileText, ClipboardList, Receipt } from 'lucide-react';
import { formatFC, PAYMENT_METHODS } from '@edugoma360/shared';
import { usePaymentHistory } from '../../hooks/usePaymentHistory';
import { useAuthStore } from '../../stores/auth.store';
import type { PaymentHistoryItem } from '../../hooks/usePaymentHistory';

interface PaymentDetailsModalProps {
  payment: PaymentHistoryItem;
  onClose: () => void;
  onCancelPayment: (payment: PaymentHistoryItem) => void;
}

export function PaymentDetailsModal({
  payment,
  onClose,
  onCancelPayment,
}: PaymentDetailsModalProps) {
  const user = useAuthStore((s) => s.user);
  const { getPaymentDetail } = usePaymentHistory();
  const { data: detailData, isLoading } = getPaymentDetail(payment.id);

  const fullPayment = detailData?.payment || payment;

  const paymentDate = new Date(fullPayment.paidAt || fullPayment.createdAt);
  const dateStr = paymentDate.toLocaleDateString('fr-CD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = paymentDate.toLocaleTimeString('fr-CD', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const methodKey = fullPayment.paymentMethod || fullPayment.paymentMode || 'CASH';
  const methodLabel =
    PAYMENT_METHODS[methodKey as keyof typeof PAYMENT_METHODS] ||
    methodKey.replace(/_/g, ' ');

  const studentName = fullPayment.student
    ? `${fullPayment.student.nom} ${fullPayment.student.postNom}${fullPayment.student.prenom ? ' ' + fullPayment.student.prenom : ''}`
    : '—';

  const studentMatricule = fullPayment.student?.matricule || '—';
  const studentClass =
    fullPayment.student?.enrollments?.[0]?.class?.name || '—';

  const cashierName = fullPayment.cashier
    ? `${fullPayment.cashier.nom} ${fullPayment.cashier.postNom}`
    : '—';
  const cashierRole = fullPayment.cashier?.role || '';

  const feePayments = fullPayment.feePayments || [];
  const totalFees = feePayments.reduce((sum: number, fp: any) => sum + (fp.amount || fp.fee?.amount || 0), 0);
  const isCancelled = fullPayment.status === 'CANCELLED';
  const canCancel = user?.role === 'PREFET' || user?.role === 'SUPER_ADMIN';

  const handlePrint = () => {
    if (fullPayment.receiptUrl) {
      window.open(fullPayment.receiptUrl, '_blank');
    } else {
      window.open(`/api/payments/${fullPayment.id}/receipt`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden
                      animate-scale-in flex flex-col">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Receipt size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Détails du Paiement
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Reçu N° {fullPayment.receiptNumber}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Status badge if cancelled */}
              {isCancelled && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <Ban size={16} className="text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">Paiement Annulé</p>
                    <p className="text-xs text-red-500 mt-0.5">Ce paiement a été annulé. Un avoir a été généré.</p>
                  </div>
                </div>
              )}

              {/* ── Student Info ────────────────────────────── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <User size={13} className="text-primary" />
                  </div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Élève</h3>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4 space-y-1.5">
                  <div className="text-sm font-bold text-neutral-900">{studentName}</div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="font-mono">📋 {studentMatricule}</span>
                    <span>🎓 {studentClass}</span>
                  </div>
                </div>
              </section>

              {/* ── Date & Time ─────────────────────────────── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                    <Calendar size={13} className="text-blue-600" />
                  </div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Date & Heure</h3>
                </div>
                <p className="text-sm text-neutral-700 pl-8">
                  {dateStr} à {timeStr}
                </p>
              </section>

              {/* ── Fees Paid ───────────────────────────────── */}
              {feePayments.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
                      <ClipboardList size={13} className="text-amber-600" />
                    </div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Frais Payés</h3>
                  </div>
                  <div className="pl-8 space-y-1.5">
                    {feePayments.map((fp: any, idx: number) => (
                      <div
                        key={fp.id || idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-neutral-700">• {fp.fee?.name || 'Frais'}</span>
                        <span className="font-mono font-semibold text-neutral-900">
                          {formatFC(fp.amount || fp.fee?.amount || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Payment Method ──────────────────────────── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
                    <CreditCard size={13} className="text-purple-600" />
                  </div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Mode de Paiement</h3>
                </div>
                <p className="text-sm text-neutral-700 pl-8">{methodLabel}</p>
                {(fullPayment.transactionRef || fullPayment.reference) && (
                  <p className="text-xs text-neutral-400 pl-8 mt-1 font-mono">
                    Réf: {fullPayment.transactionRef || fullPayment.reference}
                  </p>
                )}
              </section>

              {/* ── Amounts ─────────────────────────────────── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-green-50 flex items-center justify-center">
                    <Hash size={13} className="text-green-600" />
                  </div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Montants</h3>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                  {totalFees > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Total dû</span>
                      <span className="font-mono font-semibold text-neutral-700">
                        {formatFC(totalFees)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Montant payé</span>
                    <span className={`font-mono font-bold ${isCancelled ? 'text-red-500 line-through' : 'text-green-600'}`}>
                      {formatFC(fullPayment.amountPaid)}
                    </span>
                  </div>
                  {totalFees > 0 && (
                    <div className="flex justify-between text-sm pt-2 border-t border-neutral-200">
                      <span className="font-medium text-neutral-700">Reste à payer</span>
                      <span className={`font-mono font-bold ${totalFees - fullPayment.amountPaid <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatFC(Math.max(0, totalFees - fullPayment.amountPaid))}
                        {totalFees - fullPayment.amountPaid <= 0 && ' ✅'}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* ── Cashier ─────────────────────────────────── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
                    <User size={13} className="text-indigo-600" />
                  </div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Caissier</h3>
                </div>
                <p className="text-sm text-neutral-700 pl-8">
                  {cashierName}
                  {cashierRole && (
                    <span className="text-xs text-neutral-400 ml-1">({cashierRole})</span>
                  )}
                </p>
              </section>

              {/* ── Observations ────────────────────────────── */}
              {fullPayment.observations && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-neutral-100 flex items-center justify-center">
                      <FileText size={13} className="text-neutral-500" />
                    </div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Observations</h3>
                  </div>
                  <p className="text-sm text-neutral-600 pl-8 italic">
                    {fullPayment.observations}
                  </p>
                </section>
              )}
            </>
          )}
        </div>

        {/* ── Footer Actions ─────────────────────────────────── */}
        <div className="p-5 border-t border-neutral-100 flex flex-wrap items-center gap-3 shrink-0 bg-neutral-50/50">
          {!isCancelled && (
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-sm font-medium text-white bg-primary 
                         hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-2"
            >
              <Printer size={15} /> Réimprimer reçu
            </button>
          )}

          {!isCancelled && canCancel && (
            <button
              onClick={() => onCancelPayment(fullPayment)}
              className="px-5 py-2 text-sm font-medium text-danger bg-danger-bg 
                         hover:text-danger-dark rounded-lg transition-colors flex items-center gap-2"
            >
              <Ban size={15} /> Annuler paiement
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 text-sm font-medium text-neutral-700 
                       bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-2"
          >
            Fermer
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
