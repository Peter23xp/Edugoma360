import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, CalendarCheck, Wallet, BookOpen,
  TrendingUp, DollarSign, AlertTriangle, RefreshCw,
  Medal, AlertCircle, Info, Clock,
  MessageSquare, ClipboardList, UserPlus, CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { KPICard } from '../../components/reports/KPICard';
import { PresenceChart } from '../../components/reports/PresenceChart';
import { FinanceChart } from '../../components/reports/FinanceChart';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const ACTIVITY_ICONS: Record<string, any> = {
  PAYMENT: DollarSign,
  GRADE_ENTRY: BookOpen,
  ATTENDANCE: ClipboardList,
  SMS_SENT: MessageSquare,
  ENROLLMENT: UserPlus,
  JUSTIFICATION: CheckCircle,
};

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'à l\'instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

const fmtFC = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M FC` : n >= 1000 ? `${(n / 1000).toFixed(0)}K FC` : `${n} FC`;

export default function DirectionDashboardPage() {
  const { data, isLoading, refresh } = useDashboardStats();
  const navigate = useNavigate();

  const kpis = data?.kpis;
  const t = kpis?.trends;

  return (
    <div className="space-y-6 pb-20">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-[#1B5E20]" />
            Tableau de Bord — Direction
          </h1>
          <p className="text-sm text-gray-500 mt-1">Vue 360° de l'école en temps réel</p>
        </div>
        <Button variant="outline" onClick={refresh} className="gap-2 self-start">
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* ── Alertes ─────────────────────────────────────────────────────── */}
      {(data?.alerts ?? []).length > 0 && (
        <div className="space-y-2">
          {data!.alerts.map(alert => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';
            return (
              <div
                key={alert.id}
                className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all hover:opacity-90 ${
                  isCritical ? 'bg-red-50 border-red-200 text-red-700' :
                  isWarning  ? 'bg-orange-50 border-orange-200 text-orange-700' :
                               'bg-blue-50 border-blue-200 text-blue-700'
                }`}
                onClick={() => alert.link && navigate(alert.link)}
              >
                {isCritical ? <AlertTriangle className="h-4 w-4 flex-shrink-0" /> :
                 isWarning  ? <AlertCircle className="h-4 w-4 flex-shrink-0" /> :
                              <Info className="h-4 w-4 flex-shrink-0" />}
                <span className="flex-1">{alert.message}</span>
                {alert.link && <span className="text-xs underline opacity-75">Voir →</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* ── KPIs ────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard title="Élèves inscrits" value={kpis?.totalStudents ?? 0} subtitle="actifs cette année"
            icon={Users} color="primary"
            trend={t?.studentsTrend ? { value: t.studentsTrend, direction: t.studentsTrend >= 0 ? 'up' : 'down', label: 'vs mois dernier' } : undefined}
            onClick={() => navigate('/students')} />
          <KPICard title="Classes actives" value={kpis?.totalClasses ?? 0} subtitle="toutes sections"
            icon={Building2} color="info" onClick={() => navigate('/settings/classes')} />
          <KPICard title="Présence globale" value={`${kpis?.presenceRate ?? 0}%`} subtitle="aujourd'hui"
            icon={CalendarCheck} color="primary"
            trend={t?.presenceTrend ? { value: t.presenceTrend, direction: t.presenceTrend >= 0 ? 'up' : 'down', label: 'vs hier' } : undefined}
            onClick={() => navigate('/attendance/report')} />
          <KPICard title="Taux collecte" value={`${kpis?.paymentRate ?? 0}%`} subtitle="frais scolaires"
            icon={Wallet} color="info"
            trend={t?.paymentTrend ? { value: t.paymentTrend, direction: t.paymentTrend >= 0 ? 'up' : 'down', label: 'vs mois dernier' } : undefined}
            onClick={() => navigate('/finance')} />
          <KPICard title="Enseignants" value={kpis?.totalTeachers ?? 0} subtitle="actifs"
            icon={Users} color="neutral" onClick={() => navigate('/teachers')} />
          <KPICard title="Moyenne générale" value={`${kpis?.avgGrade ?? 0}/20`} subtitle="tous trimestres"
            icon={BookOpen} color="primary"
            trend={t?.gradeTrend ? { value: t.gradeTrend, direction: t.gradeTrend >= 0 ? 'up' : 'down', label: 'vs T. précédent' } : undefined} />
          <KPICard title="Collecte ce mois" value={fmtFC(kpis?.revenueThisMonth ?? 0)} subtitle="frais reçus"
            icon={DollarSign} color="info" onClick={() => navigate('/finance/payments')} />
          <KPICard title="Créances impayées" value={kpis?.unpaidDebts ?? 0} subtitle="élèves concernés"
            icon={AlertTriangle} color={kpis?.unpaidDebts && kpis.unpaidDebts > 50 ? 'error' : 'accent'}
            onClick={() => navigate('/finance/debts')} />
        </div>
      )}

      {/* ── Graphiques ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-[#1B5E20]" />
              Évolution présence — 7 derniers jours
            </h3>
            <PresenceChart data={data?.presenceChart ?? []} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#0D47A1]" />
              Finances — situation actuelle
            </h3>
            <FinanceChart
              collected={data?.financeChart?.collected ?? 0}
              expected={data?.financeChart?.expected ?? 0}
              debts={data?.financeChart?.debts ?? 0}
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Classement classes ──────────────────────────────────────────── */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Medal className="h-4 w-4 text-[#F57F17]" />
            Classement des classes (présence ce mois)
          </h3>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50">
                  <th className="text-left p-2 rounded-l-lg">Rang</th>
                  <th className="text-left p-2">Classe</th>
                  <th className="text-left p-2">Section</th>
                  <th className="text-right p-2">Présence</th>
                  <th className="text-right p-2 rounded-r-lg">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.topClasses ?? []).map((c, i) => (
                  <tr key={c.name} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2 font-bold text-center">{RANK_MEDALS[i] ?? `${i + 1}`}</td>
                    <td className="p-2 font-semibold text-gray-800">{c.name}</td>
                    <td className="p-2 text-gray-500 text-xs">{c.section}</td>
                    <td className="p-2 text-right font-mono font-semibold">{c.presenceRate}%</td>
                    <td className="p-2 text-right">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        c.status === 'WARNING'  ? 'bg-orange-100 text-orange-700' :
                                                  'bg-green-100 text-green-700'
                      }`}>
                        {c.status === 'CRITICAL' ? '⚠️ Critique' : c.status === 'WARNING' ? '⚠️ Attention' : '✓ Bon'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {(data?.topClasses ?? []).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{RANK_MEDALS[i] ?? `${i + 1}.`}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.section}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm">{c.presenceRate}%</p>
                  {c.status !== 'GOOD' && <p className="text-xs text-orange-500">⚠️</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Activité récente ────────────────────────────────────────────── */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#0D47A1]" />
            Activité récente
          </h3>
          <div className="space-y-3">
            {(data?.recentActivity ?? []).slice(0, 10).map(activity => {
              const Icon = ACTIVITY_ICONS[activity.type] ?? Clock;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Par {activity.user} · {timeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            {(data?.recentActivity ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Aucune activité récente</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
