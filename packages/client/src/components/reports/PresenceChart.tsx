import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

interface PresenceChartProps {
  data: Array<{ date: string; taux: number; objectif: number }>;
}

export function PresenceChart({ data }: PresenceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#757575' }} />
        <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#757575' }} tickFormatter={v => `${v}%`} />
        <ReferenceLine y={90} stroke="#F57F17" strokeDasharray="5 5"
          label={{ value: 'Objectif 90%', fill: '#F57F17', fontSize: 10, position: 'insideTopRight' }} />
        <Tooltip
          formatter={(v: number) => [`${v.toFixed(1)}%`, 'Taux présence']}
          labelStyle={{ color: '#212121', fontWeight: 600 }}
          contentStyle={{ border: '1px solid #E0E0E0', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}
        />
        <Line type="monotone" dataKey="taux" stroke="#1B5E20" strokeWidth={2.5}
          dot={{ r: 4, fill: '#1B5E20' }} activeDot={{ r: 6 }} name="Présence" />
      </LineChart>
    </ResponsiveContainer>
  );
}
