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
    // Dans une implémentation réelle, ouvrirait le PDF dans un nouvel onglet
    window.open(`/api/payments/${payment.id}/receipt`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-2xl mx-auto text-center shadow-sm relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-green-50/50 to-transparent z-0"></div>
      
      <div className="relative z-10">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-green-600/10 border-4 border-green-50 ring-4 ring-white">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-neutral-900 mb-2 tracking-tight">Paiement enregistré !</h2>
        <p className="text-neutral-500 mb-10 text-lg">
          L'encaissement de <strong className="text-neutral-900">{formatFC(payment.amountPaid)}</strong> a été validé.
        </p>

        <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-8 mb-10 max-w-md mx-auto text-left shadow-inner shadow-neutral-200/50 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-t-xl"></div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end pb-4 border-b border-neutral-200 border-dashed">
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider">N° Reçu</span>
              <span className="font-mono font-bold text-base bg-white px-3 py-1 border border-neutral-200 rounded-lg text-primary-700 shadow-sm">{receiptNumber}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-500 font-medium">Élève payeur</span>
              <span className="font-bold text-neutral-900 text-right">
                {payment.student.nom} {payment.student.postNom}
              </span>
            </div>
            
            <div className="flex justify-between items-start py-1">
              <span className="text-neutral-500 font-medium mt-1">Frais payés</span>
              <span className="font-semibold text-sm text-right bg-neutral-100 px-3 py-1.5 rounded-lg text-neutral-700 max-w-[200px]">
                {payment.feePayments?.map((fp: any) => fp.fee.name).join(', ')}
              </span>
            </div>
            
            <div className="pt-5 mt-2 border-t border-neutral-200 flex justify-between items-center">
              <span className="font-bold text-neutral-900 text-lg">Montant encaissé</span>
              <span className="text-green-600 font-extrabold font-mono text-2xl tracking-tighter">{formatFC(payment.amountPaid)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={handlePrint}
            className="group flex flex-1 items-center gap-2 px-6 py-3.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all duration-200 font-bold w-full justify-center shadow-lg shadow-neutral-900/20 hover:-translate-y-0.5"
          >
            <Printer size={18} className="group-hover:rotate-12 transition-transform" />
            Imprimer le reçu
          </button>
          
          <button
            onClick={onNewPayment}
            className="flex flex-1 items-center gap-2 px-6 py-3.5 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200 font-bold w-full justify-center"
          >
            <PlusCircle size={18} className="text-neutral-400" />
            Nouveau
          </button>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neutral-100">
           <button 
              onClick={() => navigate('/finance/payments')}
              className="text-primary hover:text-primary-700 font-semibold text-sm flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              Retourner à la liste des paiements <ArrowRight size={14} />
           </button>
        </div>
      </div>
    </div>
  );
}
