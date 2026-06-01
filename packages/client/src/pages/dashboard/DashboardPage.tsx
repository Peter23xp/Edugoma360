import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';
import { formatFC } from '@edugoma360/shared';
import {
  Users, CalendarCheck, BookOpen, AlertTriangle,
  Wallet, TrendingDown, Building2, GraduationCap,
  UserX, ClipboardList, Receipt,
} from 'lucide-react';

import KpiCard from '../../components/dashboard/KpiCard';
import StatusBar from '../../components/dashboard/StatusBar';
import AttendanceWeekChart from '../../components/dashboard/AttendanceWeekChart';
import PaymentTrendChart from '../../components/dashboard/PaymentTrendChart';
import RecentPayments from '../../components/dashboard/RecentPayments';
import TodayAbsences from '../../components/dashboard/TodayAbsences';
import AnnouncementBanner from '../../components/dashboard/AnnouncementBanner';
import SubscriptionStatus from '../Billing/SubscriptionStatus';

interface DashboardSummary {
  enrollment: { total: number; bySection: Record<string, number> };
  activeClasses: number;
  activeTeachers: number;
  attendanceToday: { rate: number; present: number; total: number; classesDone: number; classesTotal: number };
  attendanceWeek: Array<{ day: string; date: string; rate: number; present: number; total: number }>;
  absencesToday: Array<{ studentId: string; nom: string; postNom: string; className: string; isConsecutive: boolean }>;
  gradesProgress: { done: number; total: number; percent: number };
  finance: { collectedThisMonth: number; expectedThisMonth: number; totalDebts: number; debtorsCount: number; recoveryRate: number };
  paymentTrend: Array<{ label: string; expected: number; collected: number }>;
  recentPayments: Array<{ studentNom: string; amount: number; method: string; minutesAgo: number }>;
  cashSession: { isOpen: boolean; cashierName: string | null; openedAt: string | null };
  pendingAlerts: number;
  pendingConvocations: number;
  nextEvents: Array<{ title: string; date: string; type: string }>;
}

const EMPTY_CASH: DashboardSummary['cashSession'] = { isOpen: false, cashierName: null, openedAt: null };

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'ENSEIGNANT';

  const { data: raw, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => (await api.get('/stats/dashboard-summary')).data,
    refetchInterval: 2 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  const d: DashboardSummary | undefined = raw?.data;

  // ── PRÉFET / SUPER_ADMIN ─────────────────────────────────────────
  if (role === 'SUPER_ADMIN' || role === 'PREFET') {
    return (
      <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
        <AnnouncementBanner />
        <StatusBar
          cashSession={d?.cashSession ?? EMPTY_CASH}
          classesDone={d?.attendanceToday.classesDone ?? 0}
          classesTotal={d?.attendanceToday.classesTotal ?? 0}
        />
        <div className="px-4 pt-4 pb-6 sm:px-6 space-y-4">
          <SubscriptionStatus />
          {/* Row 1 — École */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard title="Élèves inscrits" value={d?.enrollment.total ?? 0}
              subtitle="actifs cette année"
              icon={Users} iconColor="bg-blue-100 text-blue-600"
              href="/students" isLoading={isLoading} />
            <KpiCard title="Présence du jour"
              value={`${d?.attendanceToday.rate ?? 0}%`}
              subtitle={`${d?.attendanceToday.present ?? 0} / ${d?.attendanceToday.total ?? 0} élèves`}
              icon={CalendarCheck} iconColor="bg-green-100 text-green-600"
              href="/attendance/roll-call" isLoading={isLoading}
              alert={(d?.attendanceToday.rate ?? 100) < 70} />
            <KpiCard title="Notes saisies"
              value={`${d?.gradesProgress.percent ?? 0}%`}
              subtitle={`${d?.gradesProgress.done ?? 0} / ${d?.gradesProgress.total ?? 0}`}
              icon={BookOpen} iconColor="bg-purple-100 text-purple-600"
              href="/grades" isLoading={isLoading} />
            <KpiCard title="Alertes actives"
              value={d?.pendingAlerts ?? 0}
              subtitle={`${d?.pendingConvocations ?? 0} convocation(s) en attente`}
              icon={AlertTriangle} iconColor="bg-red-100 text-red-500"
              href="/announcements" isLoading={isLoading}
              alert={(d?.pendingAlerts ?? 0) > 0} />
          </div>

          {/* Row 2 — Finance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard title="Collecté ce mois"
              value={formatFC(d?.finance.collectedThisMonth ?? 0)}
              subtitle={`sur ${formatFC(d?.finance.expectedThisMonth ?? 0)} attendus`}
              icon={Wallet} iconColor="bg-amber-100 text-amber-600"
              href="/finance" isLoading={isLoading} />
            <KpiCard title="Taux recouvrement"
              value={`${d?.finance.recoveryRate ?? 0}%`}
              subtitle="du total attendu"
              icon={TrendingDown} iconColor="bg-orange-100 text-orange-600"
              isLoading={isLoading}
              alert={(d?.finance.recoveryRate ?? 100) < 30} />
            <KpiCard title="Créances totales"
              value={formatFC(d?.finance.totalDebts ?? 0)}
              subtitle={`${d?.finance.debtorsCount ?? 0} élèves débiteurs`}
              icon={Receipt} iconColor="bg-red-100 text-red-500"
              href="/finance/debts" isLoading={isLoading}
              alert={(d?.finance.totalDebts ?? 0) > 0} />
            <KpiCard title="Classes actives"
              value={d?.activeClasses ?? 0}
              subtitle={`${d?.activeTeachers ?? 0} enseignants`}
              icon={Building2} iconColor="bg-teal-100 text-teal-600"
              href="/settings/classes" isLoading={isLoading} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AttendanceWeekChart data={d?.attendanceWeek ?? []} isLoading={isLoading} />
            <PaymentTrendChart data={d?.paymentTrend ?? []} isLoading={isLoading} />
          </div>

          {/* Bottom widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RecentPayments payments={d?.recentPayments ?? []} isLoading={isLoading} />
            <TodayAbsences absences={d?.absencesToday ?? []} isLoading={isLoading} />
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-neutral-800 mb-3">Prochains événements</h3>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-neutral-100 rounded animate-pulse" />)}
                </div>
              ) : (d?.nextEvents ?? []).length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">Aucun événement à venir</p>
              ) : (
                <ul className="space-y-2">
                  {(d?.nextEvents ?? []).map((e, i) => (
                    <li key={i} className="text-sm">
                      <p className="font-medium text-neutral-900 truncate">{e.title}</p>
                      <p className="text-xs text-neutral-500">{new Date(e.date).toLocaleDateString('fr-FR')}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ÉCONOME ──────────────────────────────────────────────────────
  if (role === 'ECONOME') {
    return (
      <div className="space-y-4">
        <AnnouncementBanner />
        <StatusBar
          cashSession={d?.cashSession ?? EMPTY_CASH}
          classesDone={0} classesTotal={0}
        />
        <div className="space-y-4 pt-2">
          <SubscriptionStatus />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard title="Collecté ce mois" value={formatFC(d?.finance.collectedThisMonth ?? 0)}
              subtitle={`sur ${formatFC(d?.finance.expectedThisMonth ?? 0)}`}
              icon={Wallet} iconColor="bg-green-100 text-green-600"
              href="/finance" isLoading={isLoading} />
            <KpiCard title="Créances totales" value={formatFC(d?.finance.totalDebts ?? 0)}
              subtitle="montant dû total"
              icon={TrendingDown} iconColor="bg-red-100 text-red-500"
              href="/finance/debts" isLoading={isLoading} alert={(d?.finance.totalDebts ?? 0) > 0} />
            <KpiCard title="Élèves débiteurs" value={d?.finance.debtorsCount ?? 0}
              subtitle="ont un solde impayé"
              icon={UserX} iconColor="bg-orange-100 text-orange-600"
              isLoading={isLoading} />
            <KpiCard title="Taux recouvrement" value={`${d?.finance.recoveryRate ?? 0}%`}
              subtitle="du total attendu"
              icon={Receipt} iconColor="bg-blue-100 text-blue-600"
              isLoading={isLoading} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PaymentTrendChart data={d?.paymentTrend ?? []} isLoading={isLoading} />
            <RecentPayments payments={d?.recentPayments ?? []} isLoading={isLoading} />
          </div>
        </div>
      </div>
    );
  }

  // ── SECRÉTAIRE ───────────────────────────────────────────────────
  if (role === 'SECRETAIRE') {
    return (
      <div className="space-y-4">
        <AnnouncementBanner />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard title="Élèves inscrits" value={d?.enrollment.total ?? 0}
            icon={Users} iconColor="bg-blue-100 text-blue-600"
            href="/students" isLoading={isLoading} />
          <KpiCard title="Présence du jour" value={`${d?.attendanceToday.rate ?? 0}%`}
            subtitle={`${d?.attendanceToday.present ?? 0} / ${d?.attendanceToday.total ?? 0}`}
            icon={CalendarCheck} iconColor="bg-green-100 text-green-600" isLoading={isLoading} />
          <KpiCard title="Convocations" value={d?.pendingConvocations ?? 0}
            subtitle="en attente"
            icon={ClipboardList} iconColor="bg-orange-100 text-orange-600"
            href="/convocations" isLoading={isLoading} />
          <KpiCard title="Alertes" value={d?.pendingAlerts ?? 0}
            icon={AlertTriangle} iconColor="bg-red-100 text-red-500"
            isLoading={isLoading} alert={(d?.pendingAlerts ?? 0) > 0} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TodayAbsences absences={d?.absencesToday ?? []} isLoading={isLoading} />
          <RecentPayments payments={d?.recentPayments ?? []} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  // ── ENSEIGNANT + fallback ─────────────────────────────────────────
  return (
    <div className="space-y-4">
      <AnnouncementBanner />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Présence aujourd'hui" value={`${d?.attendanceToday.rate ?? 0}%`}
          icon={CalendarCheck} iconColor="bg-green-100 text-green-600"
          href="/attendance/roll-call" isLoading={isLoading} />
        <KpiCard title="Mes classes" value={d?.activeClasses ?? 0}
          icon={Building2} iconColor="bg-blue-100 text-blue-600"
          href="/classes" isLoading={isLoading} />
        <KpiCard title="Notes saisies" value={`${d?.gradesProgress.percent ?? 0}%`}
          icon={GraduationCap} iconColor="bg-purple-100 text-purple-600"
          href="/grades" isLoading={isLoading} />
        <KpiCard title="Alertes" value={d?.pendingAlerts ?? 0}
          icon={AlertTriangle} iconColor="bg-red-100 text-red-500"
          isLoading={isLoading} />
      </div>
      <AttendanceWeekChart data={d?.attendanceWeek ?? []} isLoading={isLoading} />
    </div>
  );
}
