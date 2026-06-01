import { useState } from 'react';
import { useDebts, useDebtsQuery } from '../../hooks/useDebts';
import type { DebtItem } from '../../hooks/useDebts';
import { DebtStatsCards } from '../../components/finance/DebtStatsCards';
import { DebtFilters } from '../../components/finance/DebtFilters';
import { DebtCard } from '../../components/finance/DebtCard';
import { SendReminderModal } from '../../components/finance/SendReminderModal';
import { PaymentPlanModal } from '../../components/finance/PaymentPlanModal';
import { Loader2, HeartCrack, ShieldAlert, AlertTriangle, Clock, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatFC } from '@edugoma360/shared';
import { useNavigate } from 'react-router-dom';

export default function DebtsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>({ page: 1, limit: 200 });
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<string[]>([]);
  const [planTarget, setPlanTarget] = useState<DebtItem | null>(null);

  const { sendReminders, createPaymentPlan } = useDebts();
  const { data, isLoading } = useDebtsQuery(filters);

  const debts: DebtItem[] = data?.data || [];
  const stats = data?.stats || { totalDebt: 0, over90Days: 0, studentsCount: 0 };

  const eleveDebts = debts.filter((debt) => debt.level === 'ELEVE');
  const moyenDebts = debts.filter((debt) => debt.level === 'MOYEN');
  const legerDebts = debts.filter((debt) => debt.level === 'LEGER');

  const handleSoloReminder = (studentId: string) => {
    setReminderTarget([studentId]);
    setIsReminderModalOpen(true);
  };

  const handleBulkReminders = () => {
    setReminderTarget(debts.map((debt) => debt.student.id));
    setIsReminderModalOpen(true);
  };

  const onSendReminder = (remData: any) => {
    sendReminders.mutate({
      studentIds: reminderTarget,
      channel: remData.channel,
      template: remData.template,
    });
  };

  const handlePaymentPlan = (studentId: string) => {
    const debt = debts.find((item) => item.student.id === studentId);
    if (debt) setPlanTarget(debt);
  };

  const onCreatePlan = (planData: any) => {
    if (!planTarget) return;
    createPaymentPlan.mutate({
      studentId: planTarget.student.id,
      data: planData,
    });
    setPlanTarget(null);
  };

  const handleExport = () => {
    const rows = debts.map((debt) => ({
      Nom: debt.student.nom,
      'Post-Nom': debt.student.postNom,
      Matricule: debt.student.matricule,
      Classe: debt.student.className,
      'Créance (FC)': debt.totalDebt,
      'Jours de retard': debt.daysPastDue,
      Niveau: debt.level === 'ELEVE' ? 'Élevé (>90j)' : debt.level === 'MOYEN' ? 'Moyen (30-90j)' : 'Léger (<30j)',
      'Dernier paiement': debt.lastPaymentDate ? new Date(debt.lastPaymentDate).toLocaleDateString('fr-CD') : '—',
      'Services bloqués': debt.blockedServices.join(', ') || 'Aucun',
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 16 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Créances');
    XLSX.writeFile(wb, `creances_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const renderSection = (
    title: string,
    items: DebtItem[],
    icon: React.ReactNode,
    bgClass: string,
    borderClass: string,
    textClass: string
  ) => {
    if (items.length === 0) return null;
    const sectionTotal = items.reduce((sum, debt) => sum + debt.totalDebt, 0);

    return (
      <section className="space-y-3">
        <div className={`flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${bgClass} ${borderClass}`}>
          <div className="flex items-center gap-2">
            <span className={textClass}>{icon}</span>
            <span className="text-sm font-semibold text-neutral-900">{title}</span>
            <span className="text-xs text-neutral-500">{items.length} élève{items.length > 1 ? 's' : ''}</span>
          </div>
          <span className="font-mono text-sm font-semibold text-neutral-900">{formatFC(sectionTotal)}</span>
        </div>

        <div className="space-y-3">
          {items.map((debt) => (
            <DebtCard
              key={debt.student.id}
              debt={debt}
              onReminder={handleSoloReminder}
              onDetails={() => navigate(`/students/${debt.student.id}`)}
              onBlock={handlePaymentPlan}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Créances</h1>
          <p className="mt-1 text-sm text-neutral-600">Suivi des impayés, relances et plans de paiement</p>
        </div>

        <button
          onClick={handleExport}
          disabled={debts.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Exporter Excel
        </button>
      </div>

      <DebtStatsCards stats={stats} />

      <DebtFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSendBulkReminders={handleBulkReminders}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-neutral-600">Chargement des créances...</p>
        </div>
      ) : debts.length > 0 ? (
        <div className="space-y-8">
          {renderSection(
            'Priorité élevée, plus de 90 jours',
            eleveDebts,
            <ShieldAlert className="h-4 w-4" />,
            'bg-error-light',
            'border-error/25',
            'text-error'
          )}
          {renderSection(
            'Retard moyen, 30 à 90 jours',
            moyenDebts,
            <AlertTriangle className="h-4 w-4" />,
            'bg-accent-light',
            'border-accent/25',
            'text-accent'
          )}
          {renderSection(
            'Retard léger, moins de 30 jours',
            legerDebts,
            <Clock className="h-4 w-4" />,
            'bg-primary/5',
            'border-primary/20',
            'text-primary'
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/5 text-primary">
            <HeartCrack className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Aucune créance trouvée</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
              Tous les élèves sont à jour ou aucun résultat ne correspond aux filtres.
            </p>
          </div>
        </div>
      )}

      <SendReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSend={onSendReminder}
        selectedCount={reminderTarget.length}
      />

      {planTarget && (
        <PaymentPlanModal
          isOpen={!!planTarget}
          onClose={() => setPlanTarget(null)}
          onSubmit={onCreatePlan}
          studentName={`${planTarget.student.nom} ${planTarget.student.postNom}`}
          totalDebt={planTarget.totalDebt}
        />
      )}
    </div>
  );
}
