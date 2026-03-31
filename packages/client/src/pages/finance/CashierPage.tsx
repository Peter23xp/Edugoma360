import { useState } from 'react';
import { useCashSessions } from '../../hooks/useCashSessions';
import { useAuthStore } from '../../stores/auth.store';
import { CashSession } from '../../components/finance/CashSession';
import { CashHistory } from '../../components/finance/CashHistory';
import { RefreshCw, Wallet, History } from 'lucide-react';
import toast from 'react-hot-toast';


export default function CashierPage() {
  const { user } = useAuthStore();
  const { getCurrentSession, openSession } = useCashSessions();
  const { data: currentSession, isLoading } = getCurrentSession;

  const [isOpening, setIsOpening] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [observations, setObservations] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <p className="text-sm font-medium text-neutral-500">Chargement de la caisse...</p>
      </div>
    );
  }

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openingBalance) return;
    
    setIsOpening(true);
    try {
      await openSession.mutateAsync({
        openingBalance: Number(openingBalance),
        observations,
      });
      toast.success('Caisse ouverte avec succès !');
    } catch (error: any) {
       console.error(error);
       toast.error(error?.response?.data?.message || 'Erreur lors de l\'ouverture de la caisse');
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
               <Wallet size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Gestion de Caisse</h1>
              <p className="text-sm text-neutral-500">Suivi quotidien et rapprochement</p>
            </div>
        </div>
        {/* Bouton Historique */}
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm text-sm font-semibold w-full sm:w-auto"
        >
          <History size={16} className="text-primary" />
          Historique de Caisse
        </button>
      </div>

      {showHistory && <CashHistory onClose={() => setShowHistory(false)} />}

      {!currentSession ? (
        <div className="bg-white p-6 rounded-xl border border-neutral-300/50 overflow-hidden max-w-md mx-auto mt-10">
          <h2 className="text-lg font-bold text-neutral-900 mb-6 text-center">Ouverture de Caisse</h2>
          
          <form onSubmit={handleOpenSession} className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-neutral-600">Date : <span className="font-bold">{new Date().toLocaleDateString('fr-FR')}</span></p>
              <p className="text-sm text-neutral-600">Caissier : <span className="font-bold">{user?.nom || ''} {user?.prenom || ''}</span></p>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">
                Fond de caisse initial * (FC)
              </label>
              <input 
                type="number"
                required
                min="0"
                value={openingBalance}
                onChange={e => setOpeningBalance(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                placeholder="Ex : 250000"
              />
              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                ℹ️ Ce montant correspond au solde de fin de journée précédente.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">
                Observations (optionnel)
              </label>
              <textarea
                value={observations}
                onChange={e => setObservations(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={isOpening}
              className="w-full flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 shadow-md disabled:opacity-50"
            >
              {isOpening ? <RefreshCw className="animate-spin" size={16} /> : null}
              {isOpening ? 'Ouverture...' : 'Ouvrir la caisse'}
            </button>
          </form>
        </div>
      ) : (
        <CashSession session={currentSession} />
      )}
    </div>
  );
}
