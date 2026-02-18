import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth.store';
import StatCard from '../../components/dashboard/StatCard';
import AlertsPanel from '../../components/dashboard/AlertsPanel';
import CalendarPanel from '../../components/dashboard/CalendarPanel';
import ChartAverages from '../../components/dashboard/ChartAverages';
import ChartFinance from '../../components/dashboard/ChartFinance';
import QuickActions, { QuickAction } from '../../components/dashboard/QuickActions';
import api from '../../lib/api';
import {
  Users,
  CalendarCheck,
  Wallet,
  UserPlus,
  BookOpen,
  FileText,
  Send,
  Receipt,
  CreditCard,
  FileBarChart,
  ClipboardList,
} from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'ENSEIGNANT';

  // Queries avec polling automatique
  const { data: enrollmentData, isLoading: loadingEnrollment } = useQuery({
    queryKey: ['stats', 'enrollment'],
    queryFn: () => api.get('/stats/enrollment'),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000,
  });

  const { data: attendanceData, isLoading: loadingAttendance } = useQuery({
    queryKey: ['stats', 'attendance-today'],
    queryFn: () => api.get('/attendance/today-rate'),
    refetchInterval: 60 * 1000, // 1 minute
  });

  const { data: financeData, isLoading: loadingFinance } = useQuery({
    queryKey: ['finance', 'monthly-summary'],
    queryFn: () => api.get('/finance/monthly-summary'),
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: alertsData, isLoading: loadingAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get('/alerts?status=open'),
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });

  const { data: calendarData, isLoading: loadingCalendar } = useQuery({
    queryKey: ['calendar', 'upcoming'],
    queryFn: () => api.get('/calendar/upcoming'),
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });

  const { data: averagesData, isLoading: loadingAverages } = useQuery({
    queryKey: ['stats', 'class-averages'],
    queryFn: () => api.get('/stats/class-averages'),
    refetchInterval: 30 * 60 * 1000,
    enabled: ['SUPER_ADMIN', 'PREFET', 'SECRETAIRE'].includes(role),
  });

  const { data: recoveryData, isLoading: loadingRecovery } = useQuery({
    queryKey: ['finance', 'recovery-chart'],
    queryFn: () => api.get('/finance/recovery-chart'),
    refetchInterval: 60 * 60 * 1000, // 60 minutes
    enabled: ['SUPER_ADMIN', 'PREFET', 'ECONOME'].includes(role),
  });

  // Actions rapides selon le rôle
  const getQuickActions = (): QuickAction[] => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'PREFET':
      case 'SECRETAIRE':
        return [
          {
            label: 'Inscrire un élève',
            icon: UserPlus,
            href: '/students/new',
            color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
          },
          {
            label: 'Saisir des notes',
            icon: BookOpen,
            href: '/grades',
            color: 'bg-green-50 text-green-700 hover:bg-green-100',
          },
          {
            label: 'Générer bulletins',
            icon: FileText,
            href: '/grades/deliberation',
            color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
          },
          {
            label: 'Envoyer SMS',
            icon: Send,
            href: '/sms',
            color: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
          },
        ];

      case 'ECONOME':
        return [
          {
            label: 'Nouveau paiement',
            icon: Receipt,
            href: '/finance/payment',
            color: 'bg-green-50 text-green-700 hover:bg-green-100',
          },
          {
            label: 'Voir créances',
            icon: CreditCard,
            href: '/finance/debts',
            color: 'bg-red-50 text-red-700 hover:bg-red-100',
          },
          {
            label: 'Exporter rapport',
            icon: FileBarChart,
            href: '/finance',
            color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
          },
        ];

      case 'ENSEIGNANT':
        return [
          {
            label: "Faire l'appel",
            icon: ClipboardList,
            href: '/attendance/daily',
            color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
          },
          {
            label: 'Saisir mes notes',
            icon: BookOpen,
            href: '/grades',
            color: 'bg-green-50 text-green-700 hover:bg-green-100',
          },
        ];

      default:
        return [];
    }
  };

  // Formatage des montants
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FC`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K FC`;
    }
    return `${amount} FC`;
  };

  // Rendu selon le rôle
  const renderDashboard = () => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'PREFET':
        return (
          <>
            {/* StatCards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Élèves inscrits"
                value={enrollmentData?.data?.total || 0}
                subtitle="actifs cette année"
                icon={Users}
                iconColor="bg-blue-100 text-blue-600"
                isLoading={loadingEnrollment}
                href="/students"
              />
              <StatCard
                title="Présence du jour"
                value={`${attendanceData?.data?.rate || 0}%`}
                subtitle={`${attendanceData?.data?.present || 0}/${attendanceData?.data?.total || 0} élèves`}
                icon={CalendarCheck}
                iconColor="bg-green-100 text-green-600"
                isLoading={loadingAttendance}
                href="/attendance"
              />
              <StatCard
                title="Frais collectés"
                value={formatAmount(financeData?.data?.collected || 0)}
                subtitle={`sur ${formatAmount(financeData?.data?.expected || 0)} attendus`}
                icon={Wallet}
                iconColor="bg-amber-100 text-amber-600"
                isLoading={loadingFinance}
                href="/finance"
              />
            </div>

            {/* Alertes + Calendrier */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AlertsPanel alerts={alertsData?.data?.alerts || []} isLoading={loadingAlerts} />
              <CalendarPanel events={calendarData?.data?.events || []} isLoading={loadingCalendar} />
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ChartAverages data={averagesData?.data?.averages || []} isLoading={loadingAverages} />
              <ChartFinance data={recoveryData?.data?.months || []} isLoading={loadingRecovery} />
            </div>

            {/* Actions rapides */}
            <QuickActions actions={getQuickActions()} />
          </>
        );

      case 'ECONOME':
        return (
          <>
            {/* StatCards Finance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Collecté ce mois"
                value={formatAmount(financeData?.data?.collected || 0)}
                subtitle={`sur ${formatAmount(financeData?.data?.expected || 0)}`}
                icon={Wallet}
                iconColor="bg-green-100 text-green-600"
                isLoading={loadingFinance}
                href="/finance"
              />
              <StatCard
                title="Taux de recouvrement"
                value={`${
                  financeData?.data?.expected
                    ? Math.round((financeData.data.collected / financeData.data.expected) * 100)
                    : 0
                }%`}
                subtitle="du mois en cours"
                icon={CreditCard}
                iconColor="bg-blue-100 text-blue-600"
                isLoading={loadingFinance}
              />
              <StatCard
                title="Créances"
                value={formatAmount((financeData?.data?.expected || 0) - (financeData?.data?.collected || 0))}
                subtitle="à recouvrer"
                icon={Receipt}
                iconColor="bg-red-100 text-red-600"
                isLoading={loadingFinance}
                href="/finance/debts"
              />
            </div>

            {/* Graphique Finance */}
            <div className="mb-6">
              <ChartFinance data={recoveryData?.data?.months || []} isLoading={loadingRecovery} />
            </div>

            {/* Actions rapides */}
            <QuickActions actions={getQuickActions()} />
          </>
        );

      case 'SECRETAIRE':
        return (
          <>
            {/* StatCards Académique */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Élèves inscrits"
                value={enrollmentData?.data?.total || 0}
                subtitle="actifs cette année"
                icon={Users}
                iconColor="bg-blue-100 text-blue-600"
                isLoading={loadingEnrollment}
                href="/students"
              />
              <StatCard
                title="Présence du jour"
                value={`${attendanceData?.data?.rate || 0}%`}
                subtitle={`${attendanceData?.data?.present || 0}/${attendanceData?.data?.total || 0} élèves`}
                icon={CalendarCheck}
                iconColor="bg-green-100 text-green-600"
                isLoading={loadingAttendance}
                href="/attendance"
              />
              <StatCard
                title="Classes actives"
                value={Object.keys(enrollmentData?.data?.bySection || {}).length}
                subtitle="sections ouvertes"
                icon={BookOpen}
                iconColor="bg-purple-100 text-purple-600"
                isLoading={loadingEnrollment}
              />
            </div>

            {/* Alertes */}
            <div className="mb-6">
              <AlertsPanel alerts={alertsData?.data?.alerts || []} isLoading={loadingAlerts} />
            </div>

            {/* Actions rapides */}
            <QuickActions actions={getQuickActions()} />
          </>
        );

      case 'ENSEIGNANT':
        return (
          <>
            {/* StatCards Enseignant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <StatCard
                title="Mes classes"
                value={2}
                subtitle="classes assignées"
                icon={BookOpen}
                iconColor="bg-blue-100 text-blue-600"
              />
              <StatCard
                title="Présence du jour"
                value={`${attendanceData?.data?.rate || 0}%`}
                subtitle="dans mes classes"
                icon={CalendarCheck}
                iconColor="bg-green-100 text-green-600"
                isLoading={loadingAttendance}
                href="/attendance/daily"
              />
            </div>

            {/* Calendrier */}
            <div className="mb-6">
              <CalendarPanel events={calendarData?.data?.events || []} isLoading={loadingCalendar} />
            </div>

            {/* Actions rapides */}
            <QuickActions actions={getQuickActions()} />
          </>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-neutral-600">Tableau de bord non disponible pour ce rôle</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Tableau de bord</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Bienvenue, {user?.prenom || user?.nom} {user?.postNom}
          </p>
        </div>
      </div>

      {/* Contenu selon le rôle */}
      {renderDashboard()}
    </div>
  );
}
