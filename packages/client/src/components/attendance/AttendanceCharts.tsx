import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import type { ReportStats } from '../../hooks/useAttendanceReports';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AttendanceChartsProps {
    data: ReportStats;
}

const rateColor = (rate: number) => {
    if (rate >= 95) return '#1B5E20';
    if (rate >= 90) return '#558B2F';
    if (rate >= 80) return '#F57F17';
    return '#C62828';
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-lg p-3 text-xs">
            <p className="font-semibold text-neutral-700 mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: <strong>{p.value}%</strong>
                </p>
            ))}
        </div>
    );
};

export default function AttendanceCharts({ data }: AttendanceChartsProps) {
    const evolutionData = data.evolution.map(e => ({
        date: format(new Date(e.date), 'dd/MM', { locale: fr }),
        taux: Math.round(e.attendanceRate * 10) / 10,
        present: e.present,
        absent: e.absent,
    }));

    const classData = [...data.byClass]
        .sort((a, b) => b.attendanceRate - a.attendanceRate)
        .map(c => ({
            name: c.className.length > 8 ? c.className.substring(0, 8) + '…' : c.className,
            taux: Math.round(c.attendanceRate * 10) / 10,
        }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart — Evolution */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                    <span className="text-base">📈</span>
                    Évolution du taux de présence
                </h3>
                {evolutionData.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-neutral-400 text-sm">Aucune donnée</div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={evolutionData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9e9e9e' }} />
                            <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#9e9e9e' }} tickFormatter={(v) => `${v}%`} />
                            <Tooltip content={<CustomLineTooltip />} />
                            <ReferenceLine y={90} stroke="#F57F17" strokeDasharray="5 5" label={{ value: 'Objectif 90%', position: 'insideTopRight', fontSize: 10, fill: '#F57F17' }} />
                            <Line
                                type="monotone"
                                dataKey="taux"
                                name="Taux"
                                stroke="#1B5E20"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#1B5E20' }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Bar Chart — By Class */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                    <span className="text-base">📊</span>
                    Taux de présence par classe
                </h3>
                {classData.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-neutral-400 text-sm">Aucune donnée</div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={classData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                            <YAxis dataKey="name" type="category" width={55} tick={{ fontSize: 11, fill: '#616161' }} />
                            <Tooltip formatter={(val: number) => [`${val}%`, 'Taux']} />
                            <Bar dataKey="taux" radius={[0, 4, 4, 0]}>
                                {classData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={rateColor(entry.taux)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
