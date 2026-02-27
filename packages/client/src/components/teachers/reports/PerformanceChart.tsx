import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface PerformanceChartProps {
    data: any[];
    isLoading: boolean;
}

export default function PerformanceChart({ data, isLoading }: PerformanceChartProps) {
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Identify dynamic teacher keys (keys other than 'term' and 'schoolAverage')
    const excludeKeys = ['term', 'schoolAverage'];
    const teacherKeys = data.length > 0
        ? Object.keys(data[0]).filter(k => !excludeKeys.includes(k))
        : [];

    const colors = [
        '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-800 mb-6 flex items-center gap-2">
                ÉVOLUTION DES MOYENNES PAR TRIMESTRE
            </h3>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="term"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 500, fill: '#737373' }}
                            dy={10}
                        />
                        <YAxis
                            domain={[0, 20]}
                            ticks={[0, 5, 10, 15, 20]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 500, fill: '#737373' }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}
                        />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ top: -40, right: 0, fontSize: '12px', fontWeight: 600 }}
                        />

                        {/* School Average Line */}
                        <Line
                            name="Moyenne école"
                            type="monotone"
                            dataKey="schoolAverage"
                            stroke="#737373"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6 }}
                        />

                        {/* Teacher Lines */}
                        {teacherKeys.map((key, index) => (
                            <Line
                                key={key}
                                name={`Ens. ${index + 1}`} // We'd need actual names if available
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index % colors.length]}
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
