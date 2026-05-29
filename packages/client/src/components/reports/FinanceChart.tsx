import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FinanceChartProps {
  collected: number;
  expected: number;
  debts: number;
}

const fmt = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v);

export function FinanceChart({ collected, expected, debts }: FinanceChartProps) {
  const data = [
    { name: 'Collecté', montant: collected, fill: '#1B5E20' },
    { name: 'Attendu',  montant: expected,  fill: '#E0E0E0' },
    { name: 'Créances', montant: debts,     fill: '#C62828' },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, left: 70, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#757575' }} tickFormatter={fmt} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#212121' }} width={65} />
        <Tooltip formatter={(v: number) => [`${fmt(v)} FC`, '']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="montant" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
