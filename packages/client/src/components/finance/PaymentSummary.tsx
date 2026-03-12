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
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-2xl p-7 shadow-2xl relative overflow-hidden border border-neutral-700/50">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl z-0"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl z-0"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 border-b border-white/10 pb-5 mb-6">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
            <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">Résumé Caisse</h3>
            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mt-0.5">Transaction en cours</p>
          </div>
        </div>
        
        <div className="space-y-5 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0 mt-0.5"><User size={14} className="text-white/70" /></div>
            <div className="flex-1">
              <span className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Élève Payeur</span>
              <span className="block font-medium text-base text-white/90">
                {student.nom} {student.postNom}
              </span>
              <span className="block text-white/40 text-xs font-mono mt-1">{student.matricule} • {student.enrollments?.[0]?.class?.name || 'N/A'}</span>
            </div>
          </div>
          
          <div className="bg-white/5 h-px w-full my-4"></div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0 mt-0.5"><Tag size={14} className="text-white/70" /></div>
            <div className="flex-1">
              <span className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Détail des frais</span>
              <span className="block font-medium text-sm text-white/80 leading-relaxed">
                {selectedFees.length > 0 
                  ? selectedFees.map(f => f.name).join(', ')
                  : <span className="italic text-white/30">Aucun frais sélectionné</span>}
              </span>
              <span className="block text-white/40 text-xs font-medium mt-1.5 flex items-center justify-between">
                Total des frais: <strong className="text-white/80">{formatFC(totalDue)}</strong>
              </span>
            </div>
          </div>

          <div className="bg-white/5 h-px w-full my-4"></div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0 mt-0.5"><CreditCard size={12} className="text-white/70" /></div>
              <div>
                <span className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Moyen</span>
                <span className="block font-medium text-xs text-white/80">{PAYMENT_METHODS[paymentMethod] || paymentMethod}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0 mt-0.5"><Calendar size={12} className="text-white/70" /></div>
              <div>
                <span className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Date</span>
                <span className="block font-medium text-xs text-white/80">{new Date(paymentDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-5 backdrop-blur-md border border-white/10 relative shadow-inner">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white/60 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                Montant à encaisser
              </div>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60 font-mono">CDF</span>
            </div>
            
            <div className="text-3xl font-extrabold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500 py-1">
              {formatFC(toPay)}
            </div>
            
            {toPay < totalDue && toPay > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-orange-300/80 font-medium">Reste à payer</span>
                <span className="font-bold text-orange-300 font-mono">{formatFC(totalDue - toPay)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
