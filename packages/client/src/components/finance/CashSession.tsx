import { useState } from 'react';
import { CashSession as ICashSession } from '../../hooks/useCashSessions';
import { useAuthStore } from '../../stores/auth.store';
import { formatFC } from '@edugoma360/shared';
import { format } from 'date-fns';
import { ExpenseEntry } from './ExpenseEntry';
import { CashCount } from './CashCount';
import { CashReconciliation } from './CashReconciliation';
import { Plus, X, Lock } from 'lucide-react';

interface CashSessionProps {
  session: ICashSession;
}

export function CashSession({ session }: CashSessionProps) {
  const { user } = useAuthStore();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [countedData, setCountedData] = useState<{ actualBalance: number, denominations: any } | null>(null);

  const handleStartClosing = () => {
    setShowClosingModal(true);
  };

  const handleCashCountDone = (data: { actualBalance: number, denominations: any }) => {
    setCountedData(data);
    setShowClosingModal(false);
    setShowReconciliation(true);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden shadow-sm">
      <div className="bg-neutral-50/80 px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-200">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Session du {format(new Date(session.date), 'dd/MM/yyyy')}</h2>
          <p className="text-neutral-500 text-sm mt-0.5">
            Caissier : {user?.nom} {user?.prenom} • Ouverture : {format(new Date(session.openedAt), 'HH:mm')} • Statut : <span className="text-green-600 font-bold">🟢 {session.status === 'OPEN' ? 'Ouverte' : 'Fermée'}</span>
          </p>
        </div>
        {session.status === 'OPEN' && (
          <button 
            onClick={handleStartClosing}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition duration-200 shadow-sm"
          >
            <Lock size={15} /> 
            <span>Fermer caisse</span>
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">Solde début</p>
            <p className="text-xl font-bold text-neutral-900">{formatFC(session.openingBalance)}</p>
          </div>
          <div className="p-4 bg-green-50/50 border border-green-200/60 rounded-xl shadow-sm">
            <p className="text-green-700 text-xs font-semibold uppercase tracking-wider mb-1">Encaissements</p>
            <p className="text-xl font-bold text-green-800">{formatFC(session.totalReceived)}</p>
          </div>
          <div className="p-4 bg-red-50/50 border border-red-200/60 rounded-xl shadow-sm">
            <p className="text-red-700 text-xs font-semibold uppercase tracking-wider mb-1">Décaissements</p>
            <p className="text-xl font-bold text-red-800">{formatFC(session.totalSpent)}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-neutral-700 font-semibold uppercase tracking-wide">
            SOLDE THÉORIQUE : <span className="text-2xl font-black text-blue-700 ml-2 tracking-tight">{formatFC(session.theoreticalBalance)}</span>
          </p>
          {session.status === 'OPEN' && (
             <button
              onClick={() => setShowExpenseModal(true)}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-neutral-300 text-neutral-700 bg-white rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200 shadow-sm"
            >
              <Plus size={15} /> 
              <span>Enregistrer dépense</span>
            </button>
          )}
        </div>

        <h3 className="text-sm font-bold text-neutral-900 mb-4 tracking-tight">Mouvements du jour</h3>
        
        {/* MODE TABLEAU (DESKTOP) */}
        <div className="hidden md:block overflow-x-auto border border-neutral-200/60 rounded-xl shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50/80">
              <tr className="table-header border-b border-neutral-200">
                <th className="px-4 py-3 font-semibold text-neutral-600">Heure</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Type</th>
                <th className="px-4 py-3 font-semibold text-neutral-600">Reçu/Réf</th>
                <th className="px-4 py-3 font-semibold text-right text-neutral-600">Montant</th>
                <th className="px-4 py-3 font-semibold text-right text-neutral-600">Solde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {session.movements?.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3 text-neutral-500 font-medium">{format(new Date(m.createdAt), 'HH:mm')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                      m.category === 'OPENING' ? 'bg-neutral-100 text-neutral-700' :
                      m.category === 'PAYMENT' ? 'bg-green-100 text-green-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {m.category === 'OPENING' ? 'Ouverture' : m.category === 'PAYMENT' ? 'Paiement' : 'Dépense'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 text-xs font-mono">{m.reference || '—'}</td>
                  <td className={`px-4 py-3 text-right font-bold ${m.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                    {m.type === 'IN' ? '+' : '-'}{formatFC(m.amount)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-neutral-900">{formatFC(m.balance)}</td>
                </tr>
              ))}
              {(!session.movements || session.movements.length === 0) && (
                <tr>
                   <td colSpan={5} className="px-4 py-10 text-center text-neutral-400 bg-neutral-50/30">
                     <p className="font-medium text-sm">Aucun mouvement pour le moment.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODE CARTE (MOBILE) */}
        <div className="md:hidden space-y-3">
          {session.movements?.map((m) => (
            <div key={m.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-3 relative overflow-hidden">
               {/* Ligne gauche indicateur */}
               <div className={`absolute left-0 top-0 bottom-0 w-1 ${m.type === 'IN' ? 'bg-green-500' : 'bg-red-500'}`} />
               
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        m.category === 'OPENING' ? 'bg-neutral-100 text-neutral-600' :
                        m.category === 'PAYMENT' ? 'bg-green-100 text-green-700' : 
                        'bg-red-100 text-red-700'
                     }`}>
                        {m.category === 'OPENING' ? 'Ouverture' : m.category === 'PAYMENT' ? 'Paiement' : 'Dépense'}
                     </span>
                     <span className="text-xs text-neutral-400 font-medium">{format(new Date(m.createdAt), 'HH:mm')}</span>
                  </div>
                  <span className={`font-bold text-base ${m.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                     {m.type === 'IN' ? '+' : '-'}{formatFC(m.amount)}
                  </span>
               </div>
               
               <div className="flex justify-between items-end mt-1">
                  <div>
                    <p className="text-xs text-neutral-500">Réf : <span className="font-mono font-medium text-neutral-700">{m.reference || 'N/A'}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-0.5">Solde</p>
                    <p className="text-sm font-bold text-neutral-900">{formatFC(m.balance)}</p>
                  </div>
               </div>
            </div>
          ))}
          {(!session.movements || session.movements.length === 0) && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
               <p className="text-sm text-neutral-500 font-medium">Aucun mouvement aujourd'hui.</p>
            </div>
          )}
        </div>
      </div>

      {showExpenseModal && (
        <ExpenseEntry 
          sessionId={session.id} 
          onClose={() => setShowExpenseModal(false)} 
        />
      )}

      {showClosingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col border border-neutral-200 max-h-[95vh]">
              <div className="flex-none flex justify-between items-center p-5 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="text-lg font-bold text-neutral-900">Fermeture de caisse</h3>
                <button onClick={() => setShowClosingModal(false)} className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 min-h-0 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white overflow-y-auto">
                 <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-sm shadow-sm">
                    <p className="font-semibold text-neutral-800 border-b border-neutral-200 pb-2 mb-2">Solde Théorique</p>
                    <div className="flex justify-between text-neutral-600"><span>Ouverture :</span> <span>{formatFC(session.openingBalance)}</span></div>
                    <div className="flex justify-between text-green-600"><span>Encaissements :</span> <span>+{formatFC(session.totalReceived)}</span></div>
                    <div className="flex justify-between text-red-600"><span>Décaissements :</span> <span>-{formatFC(session.totalSpent)}</span></div>
                    <div className="flex justify-between text-blue-700 font-bold border-t border-neutral-200 pt-2 mt-2"><span>= Total attendu :</span> <span>{formatFC(session.theoreticalBalance)}</span></div>
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-neutral-900 mb-3 uppercase tracking-wider">Comptage physique</h4>
                    <CashCount onValidate={handleCashCountDone} theoreticalBalance={session.theoreticalBalance} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {showReconciliation && countedData && (
        <CashReconciliation 
          session={session} 
          countedData={countedData} 
          onClose={() => setShowReconciliation(false)} 
          onRetry={() => {
            setShowReconciliation(false);
            setShowClosingModal(true);
          }}
        />
      )}
    </div>
  );
}
