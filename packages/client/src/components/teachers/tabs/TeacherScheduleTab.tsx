import React from 'react';
import { Download, Table, Info, Clock, AlertCircle } from 'lucide-react';

export const TeacherScheduleTab: React.FC<{ teacher: any }> = ({ teacher }) => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const periods = [1, 2, 3, 4, 5, 6, 7];

    // mock data if no real periods found
    const hasSchedule = teacher.assignments?.some((a: any) => a.timetablePeriods?.length > 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-50 text-green-700 rounded-xl border border-green-100"><Table size={24} /></div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase leading-none tracking-tight">Emploi du Temps</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Année Scolaire 2024-2025</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-green-700 text-white rounded-xl font-bold text-sm shadow-xl hover:shadow-green-700/20 hover:bg-green-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Download size={18} /> Exporter PDF
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-1">
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-2">
                        <thead>
                            <tr>
                                <th className="w-20 p-4 font-black text-gray-400 text-[10px] uppercase tracking-widest text-left">Heure</th>
                                {days.map(day => (
                                    <th key={day} className="p-4 bg-gray-50 rounded-2xl font-black text-gray-900 text-xs uppercase tracking-widest min-w-[140px]">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map(period => (
                                <tr key={period}>
                                    <td className="p-4 flex flex-col items-start gap-1">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">P{period}</span>
                                        <span className="text-[10px] font-bold text-gray-300">07:30</span>
                                    </td>
                                    {days.map(day => {
                                        const isOccupied = Math.random() > 0.6; // Mock occupancy
                                        return (
                                            <td key={day} className="p-1 min-h-[100px]">
                                                {isOccupied ? (
                                                    <div className="h-full min-h-[80px] p-4 bg-green-700 rounded-2xl flex flex-col justify-between group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-white uppercase tracking-wider mb-1">MATHÉMATIQUES</span>
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-green-200 uppercase tracking-widest">
                                                                <span className="px-1.5 py-0.5 bg-white/10 rounded-md">4ScA</span>
                                                                <span>Salle 12</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/50 uppercase tracking-widest mt-4">
                                                            <Clock size={10} /> 55 MIN
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full min-h-[80px] p-4 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center group hover:bg-gray-50 hover:border-gray-200 transition-all">
                                                        <span className="text-[10px] font-bold text-gray-300 group-hover:text-gray-400 uppercase tracking-widest">Libre</span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-sm"><Clock size={24} /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900 leading-none">16H</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Heures/Semaine</div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black shadow-sm"><AlertCircle size={24} /></div>
                    <div>
                        <div className="text-2xl font-black text-gray-900 leading-none">24</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Périodes Libres</div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-black shadow-sm flex-col">
                        <span className="text-xs leading-none">40%</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-gray-900 leading-none">Moyen</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Taux d'occupation</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
