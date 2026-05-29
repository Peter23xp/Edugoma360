import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

interface DayData {
  day: string;
  date: string;
  rate: number;
  present: number;
  total: number;
}

interface Props {
  data: DayData[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DayData;
  return (
    <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium">{d.day} {new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</p>
      <p className="text-gray-600">{d.present}/{d.total} élèves — <span className="font-bold">{d.rate}%</span></p>
    </div>
  );
};

function barColor(rate: number): string {
  if (rate >= 80) return '#1B5E20';
  if (rate >= 60) return '#F57F17';
  return '#C62828';
}

export default function AttendanceWeekChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-52 bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Présence — 7 derniers jours</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4' }} />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, i) => (
              <Cell key={i} fill={barColor(entry.rate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
