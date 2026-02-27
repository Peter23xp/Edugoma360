import React from 'react';
import { TrendingUp, Users, CheckCircle, BarChart2, MessageSquare, Edit3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Trim. 1', '4ScA': 12.5, '5ScB': 11.8, '6ScA': 14.2, 'Moyenne École': 12.2 },
    { name: 'Trim. 2', '4ScA': 13.1, '5ScB': 12.2, '6ScA': 14.5, 'Moyenne École': 12.5 },
    { name: 'Trim. 3', '4ScA': 13.8, '5ScB': 12.5, '6ScA': 14.8, 'Moyenne École': 12.8 },
];

export const TeacherPerformanceTab: React.FC<{ teacher: any }> = ({ teacher }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><TrendingUp size={32} /></div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Moyenne Classes</div>
                        <div className="text-3xl font-black text-gray-900 tracking-tight">13.2 <span className="text-xs text-gray-300">/20</span></div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 mt-1 uppercase tracking-widest">
                            <span className="p-0.5 bg-green-50 rounded-full">🟢</span> +0.5 pts
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all">
                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform"><Users size={32} /></div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Taux Réussite</div>
                        <div className="text-3xl font-black text-gray-900 tracking-tight">78%</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 mt-1 uppercase tracking-widest">
                            <span className="p-0.5 bg-green-50 rounded-full">🟢</span> +5% vs T1
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all">
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform"><CheckCircle size={32} /></div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Assiduité Cours</div>
                        <div className="text-3xl font-black text-gray-900 tracking-tight">95%</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 mt-1 uppercase tracking-widest">
                            <span className="px-2 py-0.5 bg-green-50 rounded-lg">Excellent</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-50 text-blue-700 rounded-lg"><BarChart2 size={24} /></div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Évolution des Moyennes</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Comparaison trimestrielle par classe</p>
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }} domain={[0, 20]} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                            <Line type="monotone" dataKey="4ScA" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="5ScB" stroke="#10B981" strokeWidth={4} dot={{ r: 6, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="6ScA" stroke="#EF4444" strokeWidth={4} dot={{ r: 6, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Moyenne École" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-700 rounded-lg"><MessageSquare size={24} /></div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Observations du Préfet</h3>
                    </div>
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-green-700 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-sm">
                        <Edit3 size={18} /> Modifier
                    </button>
                </div>
                <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-100 rounded-2xl relative">
                    <p className="text-gray-600 font-medium italic leading-relaxed text-lg text-center p-4">
                        " Excellent travail ce trimestre. Les résultats sont en progression constante dans toutes les classes. L'assiduité est exemplaire. Continue sur cette lancée. "
                    </p>
                    <div className="absolute -bottom-3 -right-3 flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center font-bold text-white text-xs">P</div>
                        <div>
                            <div className="text-[10px] font-black text-gray-900 uppercase leading-none">MUKAMBA JEAN</div>
                            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Préfet des Études</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
