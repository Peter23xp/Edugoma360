import { X, Printer, Ban, Loader2, User, Hash, ClipboardList, Receipt } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-primary text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-white/20">
                <Receipt size={20} className="text-white" />
             </div>
             <div>
                <h2 className="text-lg font-bold">Détails du Paiement</h2>
                <p className="text-xs text-primary-100 font-medium font-mono">
                  Reçu N° {fullPayment.receiptNumber}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Status badge if cancelled */}
              {isCancelled && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                   <div className="mt-0.5 w-6 h-6 flex-shrink-0 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                      <Ban size={14} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-red-800 mb-1">Paiement Annulé</p>
                      <p className="text-xs text-red-600 leading-relaxed font-medium">Ce paiement a été annulé. Un avoir a été généré.</p>
                   </div>
                </div>
              )}

              {/* Student Info */}
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                   <User size={14} className="text-primary" /> Informations Élève
                </label>
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2">
                  <div className="text-sm font-bold text-neutral-900">{studentName}</div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-neutral-500">
                    <span className="font-mono bg-white px-2 py-1 rounded border border-neutral-200">
                       📋 {studentMatricule}
                    </span>
                    <span className="bg-white px-2 py-1 rounded border border-neutral-200">
                       🎓 {studentClass}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amounts and Fees */}
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                   <Hash size={14} className="text-emerald-500" /> Détails Financiers
                </label>
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-3">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-white rounded-lg border border-neutral-100">
                        <p className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Date & Heure</p>
                        <p className="text-sm font-bold text-neutral-800">{dateStr}</p>
                        <p className="text-xs text-neutral-500 font-mono mt-0.5">{timeStr}</p>
                     </div>
                     <div className="p-3 bg-white rounded-lg border border-neutral-100">
                        <p className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Méthode</p>
                        <p className="text-sm font-bold text-neutral-800">{methodLabel}</p>
                        {(fullPayment.transactionRef || fullPayment.reference) && (
                           <p className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate" title={fullPayment.transactionRef || fullPayment.reference || undefined}>
                              Réf: {fullPayment.transactionRef || fullPayment.reference}
                           </p>
                        )}
                     </div>
                   </div>

                   <div className="h-px bg-neutral-200 w-full" />

                   <div className="space-y-2">
                     {totalFees > 0 && (
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-neutral-500 font-medium">Total des frais exigés</span>
                         <span className="font-mono font-bold text-neutral-800">{formatFC(totalFees)}</span>
                       </div>
                     )}
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-neutral-500 font-medium">Montant réglé</span>
                       <span className={`font-mono font-bold text-lg ${isCancelled ? 'text-red-500 line-through decoration-2' : 'text-emerald-600'}`}>
                         {formatFC(fullPayment.amountPaid)}
                       </span>
                     </div>
                     {totalFees > 0 && (
                       <div className="flex justify-between items-center text-sm pt-2 border-t border-neutral-200 border-dashed">
                         <span className="text-neutral-700 font-bold">Reste à l'issue</span>
                         <span className={`font-mono font-bold ${totalFees - fullPayment.amountPaid <= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                           {formatFC(Math.max(0, totalFees - fullPayment.amountPaid))}
                           {totalFees - fullPayment.amountPaid <= 0 && ' ✅'}
                         </span>
                       </div>
                     )}
                   </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              {feePayments.length > 0 && (
                <div>
                   <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ClipboardList size={14} className="text-amber-500" /> Ventilation des Frais
                   </label>
                   <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                      {feePayments.map((fp: any, idx: number) => (
                        <div key={fp.id || idx} className={`flex items-center justify-between p-3 text-sm ${idx !== feePayments.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                          <span className="font-medium text-neutral-700">{fp.fee?.name || 'Frais académique'}</span>
                          <span className="font-mono font-bold text-neutral-900">{formatFC(fp.amount || fp.fee?.amount || 0)}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block border-t border-neutral-100 pt-4">
                       Agent percepteur
                    </label>
                    <p className="text-sm font-semibold text-neutral-800">{cashierName}</p>
                    {cashierRole && <p className="text-xs font-medium text-neutral-500 mt-0.5">{cashierRole}</p>}
                 </div>
                 {fullPayment.observations && (
                    <div>
                        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block border-t border-neutral-100 pt-4">
                           Observations
                        </label>
                        <p className="text-xs text-neutral-600 italic bg-neutral-50 p-2 rounded-lg border border-neutral-100 line-clamp-2" title={fullPayment.observations}>
                           {fullPayment.observations}
                        </p>
                    </div>
                 )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50">
          <div>
            {!isCancelled && canCancel && (
               <button
                 onClick={() => onCancelPayment(fullPayment)}
                 className="px-4 py-2 text-sm font-bold text-red-600 bg-red-100 hover:bg-red-200 
                            rounded-xl transition-colors flex items-center gap-2"
               >
                 <Ban size={16} /> Annuler le paiement
               </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              Fermer
            </button>
            {!isCancelled && (
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
              >
                <Printer size={16} /> Imprimer Reçu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
