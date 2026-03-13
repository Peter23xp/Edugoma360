
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatFC } from '@edugoma360/shared';

interface RevenueChartProps {
  data: Array<{ month: string, amount: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#666' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#666' }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip 
            formatter={(value: number) => [formatFC(value), 'Revenus']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#ffffff', stroke: '#10b981', strokeWidth: 2 }}
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
