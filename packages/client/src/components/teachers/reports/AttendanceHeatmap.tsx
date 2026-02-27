import { cn } from '../../../lib/utils';
import { format, eachDayOfInterval, subDays, isWeekend } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AttendanceHeatmapProps {
    data: any[];
    isLoading: boolean;
}

export default function AttendanceHeatmap({ data, isLoading }: AttendanceHeatmapProps) {
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Last 30 days excluding weekends
    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })
        .filter(day => !isWeekend(day));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'bg-emerald-500';
            case 'RETARD': return 'bg-amber-500';
            case 'ABSENT': return 'bg-rose-500';
            case 'CONGE': return 'bg-neutral-300';
            default: return 'bg-neutral-100';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold text-neutral-800 mb-6 uppercase tracking-wider">
                ASSIDUITÉ DES ENSEIGNANTS (DERNIERS JOURS)
            </h3>

            <div className="overflow-x-auto">
                <div className="min-w-max pb-4">
                    {/* Header Days */}
                    <div className="flex mb-3 ml-[150px]">
                        {allDays.map((day, idx) => (
                            <div key={idx} className="w-8 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-neutral-400">
                                    {format(day, 'EEEEEE', { locale: fr })}
                                </span>
                                <span className="text-[10px] font-bold text-neutral-600">
                                    {format(day, 'd')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    <div className="space-y-2">
                        {data.slice(0, 8).map((teacher) => (
                            <div key={teacher.id} className="flex items-center">
                                <div className="w-[150px] shrink-0">
                                    <p className="text-xs font-bold text-neutral-700 truncate pr-4">
                                        {teacher.name}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {allDays.map((day, idx) => {
                                        const dateStr = format(day, 'yyyy-MM-dd');
                                        const dayData = teacher.days?.find((d: any) => d.date === dateStr);
                                        const status = dayData?.status || 'NONE';

                                        return (
                                            <div
                                                key={idx}
                                                title={`${teacher.name} - ${format(day, 'PPP', { locale: fr })} - ${status === 'NONE' ? 'Non enregistré' : status}`}
                                                className={cn(
                                                    "w-7 h-7 rounded-md transition-all hover:scale-110 cursor-pointer",
                                                    getStatusColor(status)
                                                )}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-sm" /> Présent</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded-sm" /> Retard</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-rose-500 rounded-sm" /> Absent</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-neutral-300 rounded-sm" /> Congé</div>
            </div>
        </div>
    );
}
