import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BudgetMonth } from '../../hooks/useBudgets';
import { formatFC } from '@edugoma360/shared';

interface BudgetChartProps {
  data: BudgetMonth[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-neutral-100 shadow-lg rounded-xl px-3 py-2.5 text-xs max-w-[180px]">
      <p className="font-bold text-neutral-700 mb-1.5 truncate">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex justify-between gap-3" style={{ color: p.color }}>
          <span className="truncate">{p.name}</span>
          <span className="font-bold shrink-0">{formatFC(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export function BudgetChart({ data }: BudgetChartProps) {
  return (
    // Adaptive height: shorter on mobile
    <div className="h-[200px] sm:h-[260px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#999' }}
            // On small screens show abbreviated month — data already has "Jan 2025" etc.
            tickFormatter={(v: string) => v.split(' ')[0]} // "Jan 2025" → "Jan"
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#999' }}
            width={42}
            tickFormatter={v =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(1)}M`
                : v >= 1000
                ? `${(v / 1000).toFixed(0)}k`
                : String(v)
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
          />
          <Bar dataKey="budgeted" name="Prévu" fill="#e0e7ff" radius={[3, 3, 0, 0]} barSize={16} />
          <Bar dataKey="realized" name="Réalisé" fill="#6366f1" radius={[3, 3, 0, 0]} barSize={16} />
          <Line
            type="monotone"
            dataKey="budgeted"
            stroke="#a5b4fc"
            strokeWidth={1.5}
            dot={false}
            name="Tendance"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
