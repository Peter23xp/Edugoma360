import { useMemo } from 'react';
import type { ClassAveragesData } from '@edugoma360/shared/types/academic';

interface AverageChartsProps {
    data: ClassAveragesData;
}

const RANGES = [
    { label: '16-20', min: 16, max: 20, color: 'bg-yellow-400' },
    { label: '14-16', min: 14, max: 16, color: 'bg-green-500' },
    { label: '12-14', min: 12, max: 14, color: 'bg-green-400' },
    { label: '10-12', min: 10, max: 12, color: 'bg-blue-400' },
    { label: '8-10', min: 8, max: 10, color: 'bg-orange-400' },
    { label: '< 8', min: 0, max: 8, color: 'bg-red-400' },
];

export default function AverageCharts({ data }: AverageChartsProps) {
    const averages = useMemo(
        () => data.students
            .map((s) => s.generalAverage)
            .filter((a): a is number => a !== null),
        [data.students]
    );

    // Histogramme distribution
    const distribution = useMemo(() =>
        RANGES.map((range) => ({
            ...range,
            count: averages.filter((a) => a >= range.min && a < range.max).length,
        })),
        [averages]
    );

    const maxCount = Math.max(...distribution.map((d) => d.count), 1);

    // Courbe évolution trimestre
    const termHistory = data.termHistory ?? [];
    const maxAvg = Math.max(...termHistory.map((t) => t.classAverage), 20);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Histogramme distribution */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
                <h3 className="text-sm font-semibold text-neutral-700 mb-4">Distribution des moyennes</h3>
                <div className="space-y-2">
                    {distribution.map((range) => (
                        <div key={range.label} className="flex items-center gap-3">
                            <span className="text-xs text-neutral-500 w-12 text-right font-mono">{range.label}</span>
                            <div className="flex-1 bg-neutral-100 rounded-full h-5 overflow-hidden">
                                <div
                                    className={`h-full ${range.color} rounded-full transition-all duration-700 flex items-center justify-end pr-2`}
                                    style={{ width: range.count > 0 ? `${(range.count / maxCount) * 100}%` : '0%' }}
                                >
                                    {range.count > 0 && (
                                        <span className="text-white text-xs font-bold">{range.count}</span>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-neutral-400 w-6">{range.count}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-neutral-400 mt-3">{averages.length} élève(s) avec moyennes complètes</p>
            </div>

            {/* Courbe évolution trimestrielle */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
                <h3 className="text-sm font-semibold text-neutral-700 mb-4">Évolution trimestrielle</h3>
                {termHistory.length > 0 ? (
                    <div className="flex items-end gap-4 h-36 pt-2">
                        {termHistory.map((term, i) => {
                            const heightPct = maxAvg > 0 ? (term.classAverage / maxAvg) * 100 : 0;
                            const isGood = term.classAverage >= 10;
                            return (
                                <div key={term.termId} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs font-semibold text-neutral-700">
                                        {term.classAverage.toFixed(1)}
                                    </span>
                                    <div className="w-full relative" style={{ height: '96px' }}>
                                        <div
                                            className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-700 ${isGood ? 'bg-blue-500' : 'bg-orange-400'}`}
                                            style={{ height: `${heightPct}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-neutral-500">{term.termName}</span>
                                    {i < termHistory.length - 1 && termHistory[i + 1].classAverage > term.classAverage && (
                                        <span className="text-xs text-green-500">↑</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-36 flex items-center justify-center text-sm text-neutral-400">
                        Données disponibles après le T1
                    </div>
                )}
            </div>
        </div>
    );
}

