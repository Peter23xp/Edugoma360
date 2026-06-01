import { FileBarChart, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import type { AbsenceHistoryResponse } from '@edugoma360/shared';

interface AbsenceStatsCardsProps {
    stats: AbsenceHistoryResponse['stats'];
}

export default function AbsenceStatsCards({ stats }: AbsenceStatsCardsProps) {
    const totalAbsentInfos = stats.justified + stats.notJustified;
    const justPct = totalAbsentInfos > 0 ? Math.round((stats.justified / totalAbsentInfos) * 100) : 0;
    const unjPct = totalAbsentInfos > 0 ? Math.round((stats.notJustified / totalAbsentInfos) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="bg-white rounded-lg border border-info/20 p-5 flex items-start justify-between shadow-sm">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-600">Total absences</p>
                    <h4 className="text-3xl font-bold text-info">{stats.totalAbsences}</h4>
                </div>
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info shrink-0">
                    <FileBarChart size={20} />
                </div>
            </div>

            <div className="bg-white rounded-lg border border-primary/20 p-5 flex items-start justify-between shadow-sm">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-600">Justifiées</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-bold text-primary">{stats.justified}</h4>
                        <span className="text-sm font-semibold text-primary/60">({justPct}%)</span>
                    </div>
                    <p className="text-[10px] text-neutral-500">Certificats médicaux, convocations</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <CheckCircle2 size={20} />
                </div>
            </div>

            <div className="bg-white rounded-lg border border-error/20 p-5 flex items-start justify-between shadow-sm">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-600">Non justifiées</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-bold text-error">{stats.notJustified}</h4>
                        <span className="text-sm font-semibold text-error/60">({unjPct}%)</span>
                    </div>
                    <p className="text-[10px] text-neutral-500">Nécessitent un suivi</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error shrink-0">
                    <AlertTriangle size={20} />
                </div>
            </div>

            <div className="bg-white rounded-lg border border-accent/20 p-5 flex items-start justify-between shadow-sm">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-600">Retards</p>
                    <h4 className="text-3xl font-bold text-accent">{stats.lates}</h4>
                    <p className="text-[10px] text-neutral-500">Tolérance &gt; 15 min</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Clock size={20} />
                </div>
            </div>

        </div>
    );
}
