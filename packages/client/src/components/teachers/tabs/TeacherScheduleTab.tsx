import React from 'react';
import { Download, Clock, AlertCircle, Calendar } from 'lucide-react';

export const TeacherScheduleTab: React.FC<{ teacher: any }> = ({ teacher }) => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const periods = [1, 2, 3, 4, 5, 6, 7];

    const hasSchedule = teacher.assignments?.some((a: any) => a.timetablePeriods?.length > 0);

    return (
        <div className="space-y-4 sm:space-y-6 w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-neutral-900">Emploi du Temps</h3>
                    <p className="text-xs text-neutral-500 mt-1">Année Scolaire 2024-2025</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors w-full sm:w-auto justify-center sm:justify-start">
                    <Download size={16} /> Exporter PDF
                </button>
            </div>

            {/* —— Stats Summary —— */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-neutral-200 rounded-lg p-4 bg-white/50 flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 text-neutral-600 rounded-lg">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-neutral-500">Heures/Semaine</p>
                        <p className="text-lg font-bold text-neutral-900">16h</p>
                    </div>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4 bg-white/50 flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 text-neutral-600 rounded-lg">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-neutral-500">Périodes Libres</p>
                        <p className="text-lg font-bold text-neutral-900">24</p>
                    </div>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4 bg-white/50 flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 text-neutral-600 rounded-lg">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-neutral-500">Taux d'occupation</p>
                        <p className="text-lg font-bold text-neutral-900">40%</p>
                    </div>
                </div>
            </div>

            <div className="border border-neutral-200 rounded-lg overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left min-w-[700px]">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-600">
                        <tr>
                            <th className="px-3 py-3 w-16">Heure</th>
                            {days.map(day => (
                                <th key={day} className="px-2 py-3 min-w-[100px]">
                                    <span className="hidden sm:inline">{day}</span>
                                    <span className="sm:hidden">{day.substring(0, 3)}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {periods.map(period => (
                            <tr key={period} className="hover:bg-neutral-50/50">
                                <td className="px-3 py-3 align-top border-r border-neutral-100 bg-neutral-50/30">
                                    <div className="font-medium text-neutral-900 text-xs">P{period}</div>
                                    <div className="text-[10px] text-neutral-500">07:30</div>
                                </td>
                                {days.map(day => {
                                    const isOccupied = Math.random() > 0.6; // Mock occupancy
                                    return (
                                        <td key={day} className="p-1.5 align-top border-r border-neutral-100 last:border-r-0">
                                            {isOccupied ? (
                                                <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg h-full cursor-pointer hover:bg-primary/20 transition-colors">
                                                    <div className="font-semibold text-primary text-[10px] sm:text-xs mb-1 truncate">MATHÉMATIQUES</div>
                                                    <div className="flex items-center gap-1 text-[10px] text-primary/80">
                                                        <span className="bg-white/50 px-1 py-0.5 rounded">4ScA</span>
                                                        <span className="hidden sm:inline">Salle 12</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-16 sm:h-20 border border-transparent rounded-lg flex items-center justify-center group hover:bg-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer">
                                                    <span className="text-[10px] font-medium text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">Libre</span>
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

            {!hasSchedule && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 text-sm">
                    <AlertCircle size={16} />
                    <p>L'emploi du temps généré est une simulation. Aucune donnée réelle trouvée.</p>
                </div>
            )}
        </div>
    );
};
