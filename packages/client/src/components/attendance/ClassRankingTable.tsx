import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReportStats } from '../../hooks/useAttendanceReports';

interface ClassRankingTableProps {
    data: ReportStats['byClass'];
}

const rankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return String(rank);
};

const rateColorClass = (rate: number) => {
    if (rate >= 95) return 'text-green-700 bg-green-50';
    if (rate >= 90) return 'text-lime-700 bg-lime-50';
    if (rate >= 80) return 'text-orange-700 bg-orange-50';
    return 'text-red-700 bg-red-50';
};

export default function ClassRankingTable({ data }: ClassRankingTableProps) {
    const sorted = [...data].sort((a, b) => b.attendanceRate - a.attendanceRate);

    if (sorted.length === 0) {
        return (
            <div className="text-center py-10 text-neutral-400 text-sm">
                Aucune donnée disponible pour la période sélectionnée.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left bg-neutral-50 border-b border-neutral-200">
                        <th className="px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide w-12">Rang</th>
                        <th className="px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Classe</th>
                        <th className="px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide text-center">Effectif</th>
                        <th className="px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide text-center">Taux présence</th>
                        <th className="px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide text-center">Absences</th>
                        <th className="px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide text-center">Retards</th>
                        <th className="px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide text-center">Évolution</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {sorted.map((cls, index) => {
                        const rank = index + 1;
                        const trend = cls.trend;
                        return (
                            <tr key={cls.classId} className="hover:bg-neutral-50/70 transition-colors">
                                <td className="px-4 py-3 text-base text-center font-semibold">
                                    {rankMedal(rank)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="font-semibold text-neutral-900">{cls.className}</span>
                                </td>
                                <td className="px-4 py-3 text-center text-neutral-600">{cls.studentCount}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-bold", rateColorClass(cls.attendanceRate))}>
                                        {cls.attendanceRate.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-red-600 font-medium">{cls.absences}</td>
                                <td className="px-4 py-3 text-center text-orange-600 font-medium">{cls.lates}</td>
                                <td className="px-4 py-3 text-center">
                                    {trend === 0 ? (
                                        <span className="inline-flex items-center gap-0.5 text-neutral-500 text-xs">
                                            <Minus size={12} /> 0%
                                        </span>
                                    ) : trend > 0 ? (
                                        <span className="inline-flex items-center gap-0.5 text-green-600 text-xs font-medium">
                                            <TrendingUp size={13} /> +{trend.toFixed(1)}%
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-0.5 text-red-500 text-xs font-medium">
                                            <TrendingDown size={13} /> {trend.toFixed(1)}%
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
