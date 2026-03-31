import React from 'react';
import { TrendingUp, Users, CheckCircle, BarChart2, MessageSquare, Edit3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Trim. 1', '4ScA': 12.5, '5ScB': 11.8, '6ScA': 14.2, 'Moyenne École': 12.2 },
    { name: 'Trim. 2', '4ScA': 13.1, '5ScB': 12.2, '6ScA': 14.5, 'Moyenne École': 12.5 },
    { name: 'Trim. 3', '4ScA': 13.8, '5ScB': 12.5, '6ScA': 14.8, 'Moyenne École': 12.8 },
];

export const TeacherPerformanceTab: React.FC<{ teacher: any }> = ({ teacher: _teacher }) => {
    return (
        <div className="space-y-4 sm:space-y-6 w-full overflow-hidden">
            {/* —— KPI Cards —— */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-neutral-200 bg-white/50 rounded-lg p-4 flex items-center gap-4">
                    <div className="p-3 bg-neutral-100 text-neutral-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-neutral-500 mb-1">Moyenne Classes</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-neutral-900">13.2<span className="text-sm font-medium text-neutral-400">/20</span></span>
                            <span className="text-xs font-medium text-success bg-success-bg px-2 py-0.5 rounded-full">+0.5 pts</span>
                        </div>
                    </div>
                </div>

                <div className="border border-neutral-200 bg-white/50 rounded-lg p-4 flex items-center gap-4">
                    <div className="p-3 bg-neutral-100 text-neutral-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-neutral-500 mb-1">Taux Réussite</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-neutral-900">78%</span>
                            <span className="text-xs font-medium text-success bg-success-bg px-2 py-0.5 rounded-full">+5% vs T1</span>
                        </div>
                    </div>
                </div>

                <div className="border border-neutral-200 bg-white/50 rounded-lg p-4 flex items-center gap-4">
                    <div className="p-3 bg-neutral-100 text-neutral-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-neutral-500 mb-1">Assiduité Cours</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-neutral-900">95%</span>
                            <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">Excellent</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* —— Chart —— */}
            <div className="border border-neutral-200 rounded-lg p-3 sm:p-6 w-full overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart2 size={18} className="text-neutral-400" />
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Évolution des Moyennes</h3>
                        <p className="text-xs text-neutral-500">Comparaison trimestrielle par classe</p>
                    </div>
                </div>

                <div className="h-52 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} domain={[0, 20]} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E5E5', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                            <Line type="monotone" dataKey="4ScA" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="5ScB" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="6ScA" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="Moyenne École" stroke="#A3A3A3" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* —— Observations —— */}
            <div className="border border-neutral-200 rounded-lg p-4 sm:p-6 w-full overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-neutral-400" />
                        <h3 className="text-sm font-semibold text-neutral-900">Observations de la Direction</h3>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors text-neutral-600">
                        <Edit3 size={14} /> Modifier
                    </button>
                </div>

                <div className="bg-neutral-50 rounded-lg p-5 relative border border-neutral-100">
                    <p className="text-sm text-neutral-700 italic leading-relaxed text-center py-2">
                        "Excellent travail ce trimestre. Les résultats sont en progression constante dans toutes les classes. L'assiduité est exemplaire. Continue sur cette lancée."
                    </p>
                    <div className="absolute -bottom-3 right-0 sm:-right-2 flex items-center gap-2 bg-white px-2 sm:px-3 py-1.5 rounded-lg shadow-sm border border-neutral-200">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">P</div>
                        <div className="text-left">
                            <div className="text-xs font-semibold text-neutral-900">MUKAMBA JEAN</div>
                            <div className="text-[10px] text-neutral-500">Préfet des Études</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
