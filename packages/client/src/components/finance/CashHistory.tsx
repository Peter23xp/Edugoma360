import { useCashSessions, CashSession } from '../../hooks/useCashSessions';
import { X, History, CheckCircle2, AlertTriangle, Clock, RefreshCw, ChevronRight, Wallet } from 'lucide-react';
import { formatFC } from '@edugoma360/shared';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';

interface CashHistoryProps {
  onClose: () => void;
}

type SessionWithCashier = CashSession & { cashier?: { nom: string; prenom?: string | null } };

const statusConfig = {
  OPEN: {
    label: 'En cours',
    icon: <Clock size={14} />,
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  CLOSED: {
    label: 'En attente validation',
    icon: <AlertTriangle size={14} />,
    className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  },
  VALIDATED: {
    label: 'Validée',
    icon: <CheckCircle2 size={14} />,
    className: 'bg-green-100 text-green-700 border border-green-200',
  },
};

export function CashHistory({ onClose }: CashHistoryProps) {
  const { useSessionHistory } = useCashSessions();
  const { data: sessions, isLoading, refetch } = useSessionHistory();
  const [selected, setSelected] = useState<SessionWithCashier | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col border border-neutral-200 max-h-[92vh]">

        {/* Header */}
        <div className="flex-none flex justify-between items-center p-5 border-b border-neutral-100 bg-neutral-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md shadow-primary/20">
              <History size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">Historique de Caisse</h2>
              <p className="text-xs text-neutral-500">{sessions?.length ?? 0} session(s) trouvée(s)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="p-1.5 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              title="Actualiser"
            >
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* List */}
          <div className={`flex flex-col overflow-y-auto border-r border-neutral-100 transition-all ${selected ? 'hidden sm:flex sm:w-2/5' : 'w-full'}`}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16">
                <RefreshCw className="animate-spin text-primary" size={28} />
                <p className="text-sm text-neutral-500">Chargement...</p>
              </div>
            ) : sessions && sessions.length > 0 ? (
              sessions.map((session) => {
                const s = session as SessionWithCashier;
                const cfg = statusConfig[s.status] ?? statusConfig.CLOSED;
                const isSelected = selected?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelected(s)}
                    className={`text-left p-4 border-b border-neutral-50 hover:bg-primary/5 transition-colors flex items-start gap-3 ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Wallet size={14} className="text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-neutral-900 truncate">
                          {format(new Date(s.date), 'dd MMM yyyy', { locale: fr })}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${cfg.className}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {s.cashier ? `${s.cashier.nom} ${s.cashier.prenom ?? ''}`.trim() : 'Caissier inconnu'}
                      </p>
                      <p className="text-xs font-semibold text-neutral-700 mt-1">
                        Solde théorique : {formatFC(s.theoreticalBalance)}
                        {s.discrepancy && s.discrepancy !== 0 && (
                          <span className={`ml-2 ${s.discrepancy < 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                            ({s.discrepancy > 0 ? '+' : ''}{formatFC(s.discrepancy)})
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-neutral-300 flex-shrink-0 mt-2" />
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                  <History size={22} className="text-neutral-400" />
                </div>
                <p className="text-sm font-semibold text-neutral-600">Aucune session clôturée</p>
                <p className="text-xs text-neutral-400">L'historique apparaîtra ici après chaque fermeture de caisse.</p>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4 animate-in slide-in-from-right-4 duration-300">
              {/* Back button (mobile) */}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="sm:hidden flex items-center gap-1 text-xs font-medium text-primary mb-1"
              >
                ← Retour à la liste
              </button>

              {/* Session header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-neutral-900">
                    {format(new Date(selected.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Ouvert à {format(new Date(selected.openedAt), 'HH:mm')}
                    {selected.closedAt && ` · Fermé à ${format(new Date(selected.closedAt), 'HH:mm')}`}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig[selected.status]?.className}`}>
                  {statusConfig[selected.status]?.icon}
                  {statusConfig[selected.status]?.label}
                </span>
              </div>

              {/* Balance summary */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2 text-sm shadow-sm">
                <p className="font-bold text-neutral-700 border-b border-neutral-200 pb-2 mb-2 text-xs uppercase tracking-widest">Résumé financier</p>
                <div className="flex justify-between text-neutral-600"><span>Solde ouverture :</span><span className="font-bold">{formatFC(selected.openingBalance)}</span></div>
                <div className="flex justify-between text-green-600"><span>Total encaissements :</span><span className="font-bold">+{formatFC(selected.totalReceived)}</span></div>
                <div className="flex justify-between text-red-600"><span>Total décaissements :</span><span className="font-bold">-{formatFC(selected.totalSpent)}</span></div>
                <div className="flex justify-between font-bold text-blue-700 border-t border-neutral-200 pt-2 mt-1"><span>Solde théorique :</span><span>{formatFC(selected.theoreticalBalance)}</span></div>
                {selected.actualBalance != null && (
                  <div className="flex justify-between font-bold text-neutral-900"><span>Solde compté :</span><span>{formatFC(selected.actualBalance)}</span></div>
                )}
                {selected.discrepancy != null && selected.discrepancy !== 0 && (
                  <div className={`flex justify-between font-bold border-t border-neutral-200 pt-2 mt-1 ${selected.discrepancy < 0 ? 'text-red-600' : 'text-yellow-700'}`}>
                    <span>Écart :</span>
                    <span>{selected.discrepancy > 0 ? '+' : ''}{formatFC(selected.discrepancy)} ({selected.discrepancy < 0 ? 'manquant' : 'excédent'})</span>
                  </div>
                )}
              </div>

              {/* Movements */}
              {selected.movements && selected.movements.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                  <p className="font-bold text-xs text-neutral-500 uppercase tracking-widest px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                    Mouvements ({selected.movements.length})
                  </p>
                  <div className="divide-y divide-neutral-50 max-h-52 overflow-y-auto">
                    {selected.movements.map((mv) => (
                      <div key={mv.id} className="flex items-start justify-between px-4 py-3 hover:bg-neutral-50 transition-colors">
                        <div>
                          <p className="text-xs font-semibold text-neutral-700">{mv.description || mv.category}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">{format(new Date(mv.createdAt), 'HH:mm')}</p>
                        </div>
                        <span className={`text-sm font-bold ml-4 flex-shrink-0 ${mv.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                          {mv.type === 'IN' ? '+' : '-'}{formatFC(mv.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.discrepancy === 0 && selected.status !== 'OPEN' && (
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold bg-green-50 p-3 border border-green-200 rounded-xl text-sm">
                  <CheckCircle2 size={18} /> Caisse équilibrée — aucun écart constaté
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
