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

  // ── Group debts by level ──
  const eleveDebts = debts.filter(d => d.level === 'ELEVE');
  const moyenDebts = debts.filter(d => d.level === 'MOYEN');
  const legerDebts = debts.filter(d => d.level === 'LEGER');

  const handleSoloReminder = (studentId: string) => {
    setReminderTarget([studentId]);
    setIsReminderModalOpen(true);
  };

  const handleBulkReminders = () => {
    setReminderTarget(debts.map(d => d.student.id));
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
    const debt = debts.find(d => d.student.id === studentId);
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

  // ── Excel Export ──
  const handleExport = () => {
    const rows = debts.map(d => ({
      'Nom': d.student.nom,
      'Post-Nom': d.student.postNom,
      'Matricule': d.student.matricule,
      'Classe': d.student.className,
      'Créance (FC)': d.totalDebt,
      'Jours de retard': d.daysPastDue,
      'Niveau': d.level === 'ELEVE' ? 'Élevé (>90j)' : d.level === 'MOYEN' ? 'Moyen (30-90j)' : 'Léger (<30j)',
      'Dernier paiement': d.lastPaymentDate ? new Date(d.lastPaymentDate).toLocaleDateString('fr-CD') : '—',
      'Services bloqués': d.blockedServices.join(', ') || 'Aucun',
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 16 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Créances');
    XLSX.writeFile(wb, `creances_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ── Section renderer ──
  const renderSection = (
    title: string,
    items: DebtItem[],
    icon: React.ReactNode,
    bgClass: string,
    borderClass: string,
    textClass: string,
  ) => {
    if (items.length === 0) return null;
    const sectionTotal = items.reduce((s, d) => s + d.totalDebt, 0);
    return (
      <div className="space-y-3">
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${bgClass} border ${borderClass}`}>
          <div className="flex items-center gap-2">
            {icon}
            <span className={`text-sm font-bold ${textClass}`}>{title}</span>
            <span className={`text-xs font-mono ${textClass} opacity-70`}>— {items.length} élève(s)</span>
          </div>
          <span className={`text-sm font-bold font-mono ${textClass}`}>{formatFC(sectionTotal)}</span>
        </div>
        {items.map(debt => (
          <DebtCard
            key={debt.student.id}
            debt={debt}
            onReminder={handleSoloReminder}
            onDetails={() => navigate(`/students/${debt.student.id}`)}
            onBlock={handlePaymentPlan}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Gestion des Créances</h1>
          <p className="text-sm text-neutral-500">Suivi des impayés et relances parentales</p>
        </div>
        <button
          onClick={handleExport}
          disabled={debts.length === 0}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-40"
        >
          <Download size={16} /> Export Excel
        </button>
      </div>

      <DebtStatsCards stats={stats} />

      <DebtFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSendBulkReminders={handleBulkReminders}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-sm font-medium text-neutral-500">Chargement des créances...</p>
        </div>
      ) : debts.length > 0 ? (
        <div className="space-y-8">
          {renderSection(
            'PRIORITÉ ÉLEVÉE (> 90 jours)',
            eleveDebts,
            <ShieldAlert size={18} className="text-red-600" />,
            'bg-red-50',
            'border-red-200',
            'text-red-700',
          )}
          {renderSection(
            'RETARD MOYEN (30–90 jours)',
            moyenDebts,
            <AlertTriangle size={18} className="text-orange-600" />,
            'bg-orange-50',
            'border-orange-200',
            'text-orange-700',
          )}
          {renderSection(
            'RETARD LÉGER (< 30 jours)',
            legerDebts,
            <Clock size={18} className="text-green-600" />,
            'bg-green-50',
            'border-green-200',
            'text-green-700',
          )}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500">
            <HeartCrack size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Aucune créance trouvée</h3>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto">
              Tous les élèves sont à jour ou aucun résultat ne correspond à vos filtres.
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
