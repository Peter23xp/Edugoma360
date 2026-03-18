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
            
            {/* 1. Total absences */}
            <div className="bg-white rounded-xl border border-[#0D47A1]/20 p-5 flex items-start justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#0D47A1]/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
                <div className="space-y-1 z-10">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Total Absences</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-black text-[#0D47A1]">{stats.totalAbsences}</h4>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#0D47A1]/10 flex items-center justify-center text-[#0D47A1] z-10 shrink-0">
                    <FileBarChart size={24} strokeWidth={2.5} />
                </div>
            </div>

            {/* 2. Justifiées */}
            <div className="bg-white rounded-xl border border-[#1B5E20]/20 p-5 flex items-start justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#1B5E20]/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
                <div className="space-y-1 z-10">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Justifiées</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-black text-[#1B5E20]">{stats.justified}</h4>
                        <span className="text-sm font-bold text-[#1B5E20]/70">({justPct}%)</span>
                    </div>
                    <p className="text-[10px] text-neutral-500">Certificats médicaux, convocations</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#1B5E20]/10 flex items-center justify-center text-[#1B5E20] z-10 shrink-0">
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                </div>
            </div>

            {/* 3. Non justifiées */}
            <div className="bg-white rounded-xl border border-[#C62828]/20 p-5 flex items-start justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#C62828]/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
                <div className="space-y-1 z-10">
                    <p className="text-xs font-semibold text-[#C62828]/70 uppercase tracking-widest">Non justifiées</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-black text-[#C62828]">{stats.notJustified}</h4>
                        <span className="text-sm font-bold text-[#C62828]/70">({unjPct}%)</span>
                    </div>
                    <p className="text-[10px] text-[#C62828]/60 font-medium">Nécessitent un suivi</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#C62828]/10 flex items-center justify-center text-[#C62828] z-10 shrink-0">
                    <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
            </div>

            {/* 4. Retards */}
            <div className="bg-white rounded-xl border border-[#F57F17]/20 p-5 flex items-start justify-between shadow-sm relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#F57F17]/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
                <div className="space-y-1 z-10">
                    <p className="text-xs font-semibold text-[#F57F17]/80 uppercase tracking-widest">Retards</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-black text-[#F57F17]">{stats.lates}</h4>
                    </div>
                    <p className="text-[10px] text-[#F57F17]/60 font-medium">Tolérance &gt; 15 min</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#F57F17]/10 flex items-center justify-center text-[#F57F17] z-10 shrink-0">
                    <Clock size={24} strokeWidth={2.5} />
                </div>
            </div>

        </div>
    );
}
