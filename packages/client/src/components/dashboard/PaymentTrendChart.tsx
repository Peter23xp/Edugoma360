import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

interface MonthData {
  label: string;
  expected: number;
  collected: number;
}

interface Props {
  data: MonthData[];
  isLoading?: boolean;
}

function formatFCShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-neutral-900 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString('fr-FR')} FC
        </p>
      ))}
    </div>
  );
};

export default function PaymentTrendChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-52 bg-neutral-100 rounded-lg animate-pulse" />;
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-neutral-800 mb-3">Paiements — 6 derniers mois</h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => formatFCShort(v)} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: 11 }} />
          <Area
            type="monotone" dataKey="expected" name="Attendu"
            stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 3"
            fill="none" dot={false}
          />
          <Area
            type="monotone" dataKey="collected" name="Collecté"
            stroke="#1B5E20" strokeWidth={2}
            fill="url(#colorCollected)" dot={{ r: 3, fill: '#1B5E20' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
