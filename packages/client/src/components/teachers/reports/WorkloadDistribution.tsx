
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

interface WorkloadDistributionProps {
    data: any[];
    isLoading: boolean;
}

export default function WorkloadDistribution({ data, isLoading }: WorkloadDistributionProps) {
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const sortedData = [...data].sort((a, b) => b.hours - a.hours).slice(0, 10);

    return (
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-800 mb-6 flex items-center gap-2">
                RÉPARTITION DE LA CHARGE DE TRAVAIL (Heures/sem)
            </h3>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={sortedData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 600, fill: '#404040' }}
                            width={120}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}
                        />
                        <ReferenceLine x={20} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Seuil 20h', fill: '#ef4444', fontSize: 10, fontWeight: 700 }} />

                        <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={24}>
                            {sortedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.hours > 20 ? '#ef4444' : entry.hours >= 12 ? '#10b981' : '#f59e0b'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 text-rose-600">
                    <span className="w-3 h-3 bg-rose-500 rounded-sm" /> Surcharge (&gt;20h)
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                    <span className="w-3 h-3 bg-emerald-500 rounded-sm" /> Optimal (12-20h)
                </div>
                <div className="flex items-center gap-2 text-amber-600">
                    <span className="w-3 h-3 bg-amber-500 rounded-sm" /> Sous-utilisé (&lt;12h)
                </div>
            </div>
        </div>
    );
}
