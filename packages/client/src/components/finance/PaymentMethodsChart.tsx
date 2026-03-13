import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PAYMENT_METHODS } from '@edugoma360/shared';

interface PaymentMethodsChartProps {
  data: Array<{ method: string; count: number; amount: number }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const chartData = data.map(d => ({
    ...d,
    label: PAYMENT_METHODS[d.method as keyof typeof PAYMENT_METHODS] || d.method.replace(/_/g, ' '),
  }));

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-0 pb-4 md:pb-0 min-h-[300px] w-full">
      <div className="w-full h-[250px] md:h-[300px] md:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={4}
              dataKey="count"
              nameKey="label"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full md:w-1/2 space-y-3 px-2 md:px-0 md:pr-4">
        {chartData.map((item, i) => {
          const total = chartData.reduce((s, d) => s + d.count, 0);
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-700 truncate">{item.label}</span>
                  <span className="text-xs font-bold text-neutral-900 ml-2">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
