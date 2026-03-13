
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface ExpensesChartProps {
  data: Array<{ type: string, amount: number }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

export function ExpensesChart({ data }: ExpensesChartProps) {
  return (
    <div className="h-[400px] md:h-[350px] lg:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="amount"
            nameKey="type"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
