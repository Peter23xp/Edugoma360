import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

interface SuccessRateChartProps {
  data: Array<{ section: string; admis: number; ajournes: number; exclus: number }>;
}

export function SuccessRateChart({ data }: SuccessRateChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
        <XAxis dataKey="section" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={v => `${v}%`} domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
        <Legend />
        <Bar dataKey="admis" fill="#1B5E20" name="Admis" stackId="a">
          <LabelList dataKey="admis" position="inside" fill="white" fontSize={11}
            formatter={(v: number) => v > 8 ? `${v.toFixed(0)}%` : ''} />
        </Bar>
        <Bar dataKey="ajournes" fill="#F57F17" name="Ajournés" stackId="a" />
        <Bar dataKey="exclus" fill="#C62828" name="Exclus" stackId="a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
