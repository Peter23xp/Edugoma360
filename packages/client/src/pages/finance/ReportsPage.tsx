import { useState } from 'react';
import { useFinanceReports } from '../../hooks/useFinanceReports';
import { FinancialDashboard } from '../../components/finance/FinancialDashboard';
import { RevenueChart } from '../../components/finance/RevenueChart';
import { ExpensesChart } from '../../components/finance/ExpensesChart';
import { PaymentMethodsChart } from '../../components/finance/PaymentMethodsChart';
import { GenerateReportModal } from '../../components/finance/GenerateReportModal';
import { Calendar, Download, RefreshCw, ChevronRight, Activity, CreditCard, BarChart3 } from 'lucide-react';
import { formatFC } from '@edugoma360/shared';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { getDashboard, generateReport } = useFinanceReports();
  const { data, isLoading } = getDashboard(dateRange.start, dateRange.end);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <p className="text-sm font-medium text-neutral-500">Chargement du tableau de bord...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalRevenue: 0, totalDebts: 0, recoveryRate: 0,
    avgRevenuePerStudent: 0, paymentsCount: 0, avgPaymentAmount: 0,
  };
  const revenueEvolution = data?.revenueEvolution || [];
  const revenueByFeeType = data?.revenueByFeeType || [];
  const revenueByClass = data?.revenueByClass || [];
  const paymentMethods = data?.paymentMethods || [];

  // Quick period presets
  const setPreset = (preset: string) => {
    const now = new Date();
    let start: Date;
    switch (preset) {
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'trimester':
        start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Rapports Financiers</h1>
          <p className="text-sm text-neutral-500">Tableau de bord et indicateurs de performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Period presets */}
          <div className="bg-white border border-neutral-200 rounded-lg p-0.5 flex items-center">
            {[
              { id: 'month', label: 'Ce mois' },
              { id: 'trimester', label: 'Trimestre' },
              { id: 'year', label: 'Année' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors hover:bg-neutral-100 text-neutral-600"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date range picker */}
          <div className="bg-white border border-neutral-200 rounded-lg p-1 flex items-center gap-1">
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="text-xs font-semibold px-2 py-1 outline-none w-[120px]"
            />
            <ChevronRight size={14} className="text-neutral-300" />
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="text-xs font-semibold px-2 py-1 outline-none w-[120px]"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2"
          >
            <Download size={16} /> Rapport PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <FinancialDashboard kpis={kpis} />

      {/* Charts Row 1: Revenue evolution + Fee types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Calendar size={16} className="text-primary" /> Évolution des Revenus
          </h3>
          <RevenueChart data={revenueEvolution} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" /> Répartition par Type de Frais
          </h3>
          <ExpensesChart data={revenueByFeeType} />
        </div>
      </div>

      {/* Charts Row 2: Revenue by class (bar) + Payment methods (donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-500" /> Revenus par Classe
          </h3>
          <div className="h-[350px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByClass.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }} 
                  tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                />
                <YAxis
                  type="category"
                  dataKey="className"
                  width={100}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#555' }}
                />
                <Tooltip
                  formatter={(value: number) => [formatFC(value), 'Revenus']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <CreditCard size={16} className="text-violet-500" /> Modes de Paiement
          </h3>
          <PaymentMethodsChart data={paymentMethods} />
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">Performance par Classe — Détails</h3>
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
            Top Revenus
          </span>
        </div>
        <div className="divide-y divide-neutral-50">
          {revenueByClass.slice(0, 8).map((item, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600">
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-neutral-700">{item.className}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-900">{formatFC(item.amount)}</p>
                  <div className="w-32 h-1.5 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${revenueByClass[0]?.amount ? (item.amount / revenueByClass[0].amount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <ChevronRight size={16} className="text-neutral-300" />
              </div>
            </div>
          ))}
          {revenueByClass.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-neutral-400">
              Aucune donnée pour cette période
            </div>
          )}
        </div>
      </div>

      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={reportData =>
          generateReport.mutate({
            ...reportData,
            startDate: dateRange.start,
            endDate: dateRange.end,
            format: 'PDF',
          })
        }
      />
    </div>
  );
}
