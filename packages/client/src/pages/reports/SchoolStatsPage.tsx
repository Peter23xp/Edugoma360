import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Card, CardContent } from '../../components/ui/card';
import { KPICard } from '../../components/reports/KPICard';
import { SuccessRateChart } from '../../components/reports/SuccessRateChart';
import { useSchoolStats } from '../../hooks/useSchoolStats';
import { CalendarCheck, BookOpen, Wallet, Users, Loader2, TrendingUp, TrendingDown } from 'lucide-react';

const TABS = [
  { key: 'presence',  label: 'Présences',   icon: CalendarCheck },
  { key: 'results',   label: 'Résultats',    icon: BookOpen },
  { key: 'finance',   label: 'Finance',      icon: Wallet },
  { key: 'effectifs', label: 'Effectifs',    icon: Users },
];

const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const PIE_COLORS = ['#1B5E20', '#F57F17', '#C62828'];

function SectionTable({ data, cols }: { data: any[]; cols: { key: string; label: string; fmt?: (v: any) => string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50">
            <th className="text-left p-2 rounded-l-lg">Rang</th>
            <th className="text-left p-2">Section</th>
            {cols.map(c => <th key={c.key} className="text-right p-2">{c.label}</th>)}
            <th className="text-right p-2 rounded-r-lg">Évolution</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr key={row.section} className="hover:bg-gray-50">
              <td className="p-2 text-center font-bold">{RANK_MEDALS[i] ?? `${i + 1}`}</td>
              <td className="p-2 font-medium text-gray-800">{row.section}</td>
              {cols.map(c => (
                <td key={c.key} className="p-2 text-right font-mono text-sm">
                  {c.fmt ? c.fmt(row[c.key]) : row[c.key] ?? '—'}
                </td>
              ))}
              <td className="p-2 text-right">
                {row.evolution !== undefined && (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${row.evolution >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {row.evolution >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {row.evolution >= 0 ? '+' : ''}{typeof row.evolution === 'number' ? row.evolution.toFixed(1) : row.evolution}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SchoolStatsPage() {
  const [tab, setTab] = useState('presence');
  const { data, isLoading } = useSchoolStats(tab);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-[#0D47A1]" />
          Statistiques École
        </h1>
        <p className="text-sm text-gray-500 mt-1">Analyse détaillée par trimestre, section et classe</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                tab === t.key ? 'bg-white text-[#1B5E20] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
        </div>
      ) : (
        <TabContent tab={tab} data={data} />
      )}
    </div>
  );
}

function TabContent({ tab, data }: { tab: string; data: any }) {
  if (!data) return <div className="text-center py-12 text-gray-400">Aucune donnée disponible</div>;

  if (tab === 'presence') {
    const pieData = [
      { name: 'Présents', value: data.globalRate ?? 0 },
      { name: 'Absents', value: 100 - (data.globalRate ?? 0) },
    ];
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard title="Taux global" value={`${data.globalRate ?? 0}%`} icon={CalendarCheck} color="primary" />
          <KPICard title="Meilleure classe" value={data.bestClass?.name ?? '—'} subtitle={`${data.bestClass?.rate ?? 0}%`} icon={TrendingUp} color="primary" />
          <KPICard title="Plus faible" value={data.worstClass?.name ?? '—'} subtitle={`${data.worstClass?.rate ?? 0}%`} icon={TrendingDown} color="error" />
          <KPICard title="Total absences" value={(data.totalAbsences ?? 0).toLocaleString('fr-FR')} subtitle="jours" icon={CalendarCheck} color="accent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Évolution par trimestre</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.byTerm ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="term" tickFormatter={v => `T${v}`} tick={{ fontSize: 11 }} />
                <YAxis domain={[60, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Bar dataKey="rate" fill="#1B5E20" name="Taux présence" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Répartition présences</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </div>

        <Card><CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Par section</h3>
          <SectionTable
            data={[...(data.bySection ?? [])].sort((a, b) => b.t2Rate - a.t2Rate)}
            cols={[
              { key: 't1Rate', label: 'T1', fmt: v => `${v?.toFixed(1) ?? '—'}%` },
              { key: 't2Rate', label: 'T2', fmt: v => `${v?.toFixed(1) ?? '—'}%` },
            ]}
          />
        </CardContent></Card>
      </div>
    );
  }

  if (tab === 'results') {
    const sectionData = (data.bySection ?? []).map((s: any) => ({
      section: s.section?.length > 6 ? s.section.slice(0, 6) + '.' : s.section,
      admis: parseFloat((s.admittedRate ?? 72).toFixed(1)),
      ajournes: parseFloat((s.failedRate ?? 22).toFixed(1)),
      exclus: parseFloat((s.expelledRate ?? 6).toFixed(1)),
    }));
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard title="Moyenne école" value={`${data.schoolAvg ?? 0}/20`} icon={BookOpen} color="primary" />
          <KPICard title="Admis" value={`${data.admittedRate ?? 0}%`} icon={TrendingUp} color="primary" />
          <KPICard title="Ajournés" value={`${data.failedRate ?? 0}%`} icon={TrendingDown} color="accent" />
          <KPICard title="Exclus" value={`${data.expelledRate ?? 0}%`} icon={TrendingDown} color="error" />
        </div>
        <Card><CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Taux de réussite par section</h3>
          <SuccessRateChart data={sectionData} />
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Par section</h3>
          <SectionTable
            data={[...(data.bySection ?? [])].sort((a: any, b: any) => b.admittedRate - a.admittedRate).map((s: any) => ({ ...s, evolution: 2.1 }))}
            cols={[
              { key: 'avg', label: 'Moy./20', fmt: v => v?.toFixed(1) ?? '—' },
              { key: 'admittedRate', label: '% Admis', fmt: v => `${v?.toFixed(1) ?? '—'}%` },
            ]}
          />
        </CardContent></Card>
      </div>
    );
  }

  if (tab === 'finance') {
    const fmtFC = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M FC` : `${(n / 1000).toFixed(0)}K FC`;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard title="Collecte totale" value={fmtFC(data.totalCollected ?? 0)} icon={Wallet} color="info" />
          <KPICard title="Taux collecte" value={`${data.collectionRate ?? 0}%`} icon={TrendingUp} color="primary" />
          <KPICard title="Créances" value={fmtFC(data.totalDebts ?? 0)} icon={TrendingDown} color="error" />
          <KPICard title="Prévision annuelle" value={fmtFC(data.forecast ?? 0)} icon={Wallet} color="neutral" />
        </div>
        {(data.byMonth ?? []).length > 0 && (
          <Card><CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Collecte mensuelle</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [fmtFC(v), 'Collecté']} />
                <Line type="monotone" dataKey="amount" stroke="#1B5E20" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        )}
      </div>
    );
  }

  if (tab === 'effectifs') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard title="Total élèves" value={data.total ?? 0} icon={Users} color="primary" />
          <KPICard title="Nouvelles inscriptions" value={data.newEnrollments ?? 0} icon={TrendingUp} color="info" />
          <KPICard title="Partis" value={data.departed ?? 0} icon={TrendingDown} color="error" />
          <KPICard title="Évolution nette" value={`+${data.evolution ?? 0}`} icon={TrendingUp} color="primary" />
        </div>
        <Card><CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Effectifs par section</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.bySection ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="section" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#1B5E20" name="Cette année" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lastYear" fill="#90CAF9" name="Année préc." radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </div>
    );
  }

  return null;
}
