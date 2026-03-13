
import { Clock, AlertTriangle, ShieldAlert, Send, FileText, Lock } from 'lucide-react';
import { formatFC } from '@edugoma360/shared';
import { DebtItem } from '../../hooks/useDebts';

interface DebtCardProps {
  debt: DebtItem;
  onReminder: (studentId: string) => void;
  onDetails: (studentId: string) => void;
  onBlock: (studentId: string) => void;
}

export function DebtCard({ debt, onReminder, onDetails, onBlock }: DebtCardProps) {
  const levelConfig = {
    LEGER: { 
        color: 'text-green-600', 
        bg: 'bg-green-50', 
        border: 'border-green-200', 
        icon: Clock,
        label: 'Retard Léger'
    },
    MOYEN: { 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        border: 'border-orange-200', 
        icon: AlertTriangle,
        label: 'Retard Moyen'
    },
    ELEVE: { 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        border: 'border-red-200', 
        icon: ShieldAlert,
        label: 'Priorité Élevée'
    }
  };

  const config = levelConfig[debt.level];
  const Icon = config.icon;

  return (
    <div className={`bg-white border ${config.border} rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
      {/* Level Badge / Side Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.bg.replace('bg-', 'bg-').replace('-50', '-500')}`} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center`}>
            {debt.student.nom[0]}
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 flex items-center gap-2">
              {debt.student.nom} {debt.student.postNom}
              <span className="text-xs font-mono text-neutral-400">· {debt.student.matricule}</span>
            </h3>
            <p className="text-sm text-neutral-500">
              {debt.student.className} · <span className="font-semibold text-neutral-700">Solde : {formatFC(debt.totalDebt)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full ${config.bg} ${config.color} text-xs font-bold flex items-center gap-1.5`}>
            <Icon size={14} />
            {config.label} ({debt.daysPastDue} jours)
          </div>
          
          {debt.blockedServices.length > 0 && (
            <div className="px-3 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center gap-1.5">
              <Lock size={14} />
              {debt.blockedServices.join(' & ')} BLOQUÉS
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onDetails(debt.student.id)}
            className="p-2 text-neutral-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/10"
            title="Détails"
          >
            <FileText size={18} />
          </button>
          <button 
            onClick={() => onReminder(debt.student.id)}
            className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
            title="Rappel"
          >
            <Send size={18} />
          </button>
          <button 
            onClick={() => onBlock(debt.student.id)}
            className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            title="Bloquer"
          >
            <Lock size={18} />
          </button>
        </div>
      </div>
      
      {debt.lastPaymentDate && (
        <div className="mt-3 text-[11px] text-neutral-400 italic">
          Dernier paiement enregistré le {new Date(debt.lastPaymentDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
