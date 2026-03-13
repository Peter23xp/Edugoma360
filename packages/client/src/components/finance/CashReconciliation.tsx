import { useState } from 'react';
import { useCashSessions, CashSession as ICashSession } from '../../hooks/useCashSessions';
import { useQueryClient } from '@tanstack/react-query';
import { formatFC } from '@edugoma360/shared';
import { X, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface CashReconciliationProps {
  session: ICashSession;
  countedData: {
    actualBalance: number;
    denominations: Record<number, number>;
  };
  onClose: () => void;
  onRetry: () => void;
}

export function CashReconciliation({ session, countedData, onClose, onRetry }: CashReconciliationProps) {
  const { closeSession } = useCashSessions();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    reason: 'ERREUR_CAISSE',
    details: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const discrepancy = countedData.actualBalance - session.theoreticalBalance;
  const isLoss = discrepancy < 0;
  const requiresExplanation = Math.abs(discrepancy) > 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requiresExplanation && (!formData.reason || !formData.details)) {
      toast.error("Veuillez justifier l'écart.");
      return;
    }

    setIsSubmitting(true);
    try {
      await closeSession.mutateAsync({
        sessionId: session.id,
        actualBalance: countedData.actualBalance,
        denominations: countedData.denominations,
        discrepancyReason: formData.reason,
        discrepancyDetails: formData.details,
      });
      // Attendre que le cache soit bien invalidé avant de fermer
      await queryClient.invalidateQueries({ queryKey: ['cash-sessions', 'current'] });
      toast.success('Caisse fermée avec succès !');
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Erreur lors de la fermeture de la caisse');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-neutral-200">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100 bg-neutral-50/50 text-neutral-900">
          <h2 className="text-lg font-bold tracking-tight">Rapprochement de Caisse</h2>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3 bg-neutral-50 border border-neutral-200 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-neutral-600 font-medium">
              <span>Solde théorique :</span>
              <span className="font-bold text-neutral-800 text-lg">{formatFC(session.theoreticalBalance)}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600 font-medium pb-4 border-b border-neutral-200">
              <span>Solde réel compté :</span>
              <span className="font-bold text-green-600 text-lg">{formatFC(countedData.actualBalance)}</span>
            </div>

            {discrepancy === 0 ? (
              <div className="flex items-center justify-center gap-2 text-green-600 font-semibold bg-green-50/50 p-4 border border-green-200/60 rounded-xl pt-4 shadow-sm">
                <ShieldCheck size={20} /> Caisse équilibrée
              </div>
            ) : (
              <div className={`p-4 rounded-xl border flex items-start gap-3 mt-4 flex-col shadow-sm ${isLoss ? 'bg-red-50/50 border-red-200/60' : 'bg-yellow-50/50 border-yellow-200/60'}`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className={isLoss ? "text-red-500" : "text-yellow-600"} />
                  <div>
                    <p className={`font-bold text-base ${isLoss ? "text-red-700" : "text-yellow-800"}`}>
                      Écart : {formatFC(discrepancy)} ({isLoss ? 'manquant' : 'excédentaire'})
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {requiresExplanation && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-widest border-b border-neutral-100 pb-2">Justification obligataire de l'écart</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'ERREUR_CAISSE', label: 'Erreur de caisse' },
                  { id: 'ERREUR_SAISIE', label: 'Erreur de saisie' },
                  { id: 'VOL_PERTE', label: 'Vol / Perte' },
                  { id: 'AUTRE', label: 'Autre' },
                ].map(r => (
                   <label key={r.id} className={`flex items-center p-3 rounded-xl border cursor-pointer hover:bg-neutral-50 transition-colors ${formData.reason === r.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-neutral-200'}`}>
                    <input
                      type="radio"
                      name="reason"
                      value={r.id}
                      checked={formData.reason === r.id}
                      onChange={e => setFormData({ ...formData, reason: e.target.value })}
                      className="mr-3 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className={`text-sm font-medium ${formData.reason === r.id ? 'text-primary' : 'text-neutral-600'}`}>{r.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Détails de l'écart *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.details}
                  onChange={e => setFormData({ ...formData, details: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors text-sm font-medium resize-none shadow-sm"
                  placeholder="Ex : Billet de 5000 FC abîmé, retiré de la circulation et remplacé"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200/50 shadow-sm">
                <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-yellow-800 leading-tight">
                  Cet écart sera généré en rapport et soumis à la validation du <span className="underline decoration-yellow-400 underline-offset-2 font-bold">Trésorier</span>.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-neutral-100">
            <button 
              type="button" 
              onClick={onRetry}
              disabled={isSubmitting}
              className="px-5 py-2.5 font-medium text-neutral-600 bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm"
            >
              ← Recompter
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-5 py-2.5 text-white font-medium rounded-xl transition-all shadow-sm shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-0.5
                ${requiresExplanation ? (isLoss ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/20') : 'bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25'}`}
            >
              {isSubmitting ? 'Validation...' : (requiresExplanation ? `Valider avec écart ${isLoss ? 'manquant' : 'excédentaire'} ` : 'Valider la fermeture de caisse')}
              {!isSubmitting && <ChevronRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
