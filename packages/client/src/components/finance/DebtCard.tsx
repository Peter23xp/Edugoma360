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
      color: 'text-primary',
      bg: 'bg-primary/5',
      border: 'border-primary/20',
      icon: Clock,
      label: 'Retard léger',
    },
    MOYEN: {
      color: 'text-accent',
      bg: 'bg-accent-light',
      border: 'border-accent/25',
      icon: AlertTriangle,
      label: 'Retard moyen',
    },
    ELEVE: {
      color: 'text-error',
      bg: 'bg-error-light',
      border: 'border-error/25',
      icon: ShieldAlert,
      label: 'Priorité élevée',
    },
  };

  const config = levelConfig[debt.level];
  const Icon = config.icon;
  const initials = `${debt.student.nom?.[0] || ''}${debt.student.postNom?.[0] || ''}`.toUpperCase();

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-neutral-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-sm font-semibold text-neutral-700">
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="font-semibold text-neutral-900">
                {debt.student.nom} {debt.student.postNom}
              </h3>
              <span className="font-mono text-xs text-neutral-500">{debt.student.matricule}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
              <span>{debt.student.className}</span>
              <span className="font-semibold text-neutral-900">{formatFC(debt.totalDebt)}</span>
              {debt.lastPaymentDate && (
                <span className="text-xs text-neutral-500">
                  Dernier paiement: {new Date(debt.lastPaymentDate).toLocaleDateString('fr-CD')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.border} ${config.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}, {debt.daysPastDue} j
          </span>

          {debt.blockedServices.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
              <Lock className="h-3.5 w-3.5" />
              {debt.blockedServices.join(', ')} bloqué(s)
            </span>
          )}

          <div className="ml-0 flex items-center gap-1 lg:ml-2">
            <button
              onClick={() => onDetails(debt.student.id)}
              className="rounded-lg border border-neutral-200 p-2 text-neutral-600 transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
              title="Voir le dossier"
              aria-label="Voir le dossier"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => onReminder(debt.student.id)}
              className="rounded-lg border border-neutral-200 p-2 text-neutral-600 transition-colors hover:border-info/25 hover:bg-info-light hover:text-info"
              title="Envoyer un rappel"
              aria-label="Envoyer un rappel"
            >
              <Send className="h-4 w-4" />
            </button>
            <button
              onClick={() => onBlock(debt.student.id)}
              className="rounded-lg border border-neutral-200 p-2 text-neutral-600 transition-colors hover:border-accent/25 hover:bg-accent-light hover:text-accent"
              title="Créer un plan"
              aria-label="Créer un plan"
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
