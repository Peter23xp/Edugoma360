import { formatFC } from '@edugoma360/shared';
import { CheckCircle, Printer, PlusCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReceiptPreviewProps {
  receiptNumber: string;
  payment: any;
  onNewPayment: () => void;
}

export function ReceiptPreview({ receiptNumber, payment, onNewPayment }: ReceiptPreviewProps) {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.open(`/api/payments/${payment.id}/receipt`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 text-center">
        <h3 className="text-sm font-semibold text-neutral-900">Confirmation de paiement</h3>
      </div>

      <div className="p-8 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
          <CheckCircle className="w-7 h-7 text-green-500" />
        </div>

        <h2 className="text-xl font-bold text-neutral-900 mb-1">Paiement enregistré !</h2>
        <p className="text-sm text-neutral-500 mb-8">
          L'encaissement de <strong className="text-neutral-900">{formatFC(payment.amountPaid)}</strong> a été validé.
        </p>

        {/* Receipt card */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 max-w-md mx-auto text-left mb-8">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-neutral-200">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">N° Reçu</span>
              <span className="font-mono font-bold text-sm text-primary bg-white px-2.5 py-1 border border-neutral-200 rounded-lg">
                {receiptNumber}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-neutral-500">Élève</span>
              <span className="text-sm font-semibold text-neutral-900">
                {payment.student.nom} {payment.student.postNom}
              </span>
            </div>

            <div className="flex justify-between items-start py-1">
              <span className="text-xs text-neutral-500 mt-1">Frais payés</span>
              <span className="text-xs font-medium text-neutral-700 text-right max-w-[200px] bg-neutral-100 px-2 py-1 rounded">
                {payment.feePayments?.map((fp: any) => fp.fee.name).join(', ')}
              </span>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
              <span className="text-sm font-bold text-neutral-900">Montant encaissé</span>
              <span className="text-lg font-extrabold font-mono text-green-600">{formatFC(payment.amountPaid)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
                       bg-gradient-to-r from-primary to-primary-light text-white
                       rounded-xl hover:shadow-lg hover:shadow-primary/25
                       transition-all duration-200 shadow-md w-full"
          >
            <Printer size={15} /> Imprimer le reçu
          </button>

          <button
            onClick={onNewPayment}
            className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
                       border border-neutral-300 rounded-xl hover:bg-neutral-50
                       hover:border-neutral-400 transition-all duration-200
                       text-neutral-700 shadow-sm w-full"
          >
            <PlusCircle size={15} /> Nouveau paiement
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100">
          <button
            onClick={() => navigate('/finance')}
            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            Retourner au tableau de bord <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
