import { useMemo } from 'react';
import { Medal, Star } from 'lucide-react';
import type { StudentAverage } from '@edugoma360/shared/types/academic';

interface ClassRankingTableProps {
    students: StudentAverage[];
    onSelectStudent?: (student: StudentAverage) => void;
    highlightStudentId?: string;
    showAll?: boolean;
}

const RANK_MEDAL: Record<number, { icon: typeof Medal; color: string }> = {
    1: { icon: Medal, color: 'text-yellow-500' },
    2: { icon: Medal, color: 'text-slate-400' },
    3: { icon: Medal, color: 'text-amber-600' },
};

function getRowColor(average: number | null): string {
    if (average === null) return '';
    if (average >= 16) return 'bg-yellow-50/40';
    if (average >= 14) return 'bg-green-50/40';
    if (average >= 10) return '';
    if (average >= 8) return 'bg-orange-50/40';
    return 'bg-red-50/30';
}

function getAvgColor(average: number | null): string {
    if (average === null) return 'text-neutral-400';
    if (average >= 16) return 'text-yellow-700 font-bold';
    if (average >= 14) return 'text-green-700 font-bold';
    if (average >= 10) return 'text-blue-700 font-semibold';
    if (average >= 8) return 'text-orange-600 font-semibold';
    return 'text-red-600 font-semibold';
}

export default function ClassRankingTable({
    students,
    onSelectStudent,
    highlightStudentId,
    showAll = true,
}: ClassRankingTableProps) {
    const sorted = useMemo(
        () => [...students].sort((a, b) => a.rank - b.rank),
        [students]
    );

    const displayed = showAll ? sorted : sorted.slice(0, 10);

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider w-16">Rang</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Élève</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Total pts</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Moyenne</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Statut</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {displayed.map((student) => {
                        const medal = RANK_MEDAL[student.rank];
                        const isHighlighted = student.studentId === highlightStudentId;

                        return (
                            <tr
                                key={student.studentId}
                                onClick={() => onSelectStudent?.(student)}
                                className={`
                                    ${getRowColor(student.generalAverage)}
                                    ${onSelectStudent ? 'cursor-pointer hover:bg-neutral-50' : ''}
                                    ${isHighlighted ? 'ring-2 ring-inset ring-primary/30' : ''}
                                    transition-colors
                                `}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        {medal ? (
                                            <medal.icon size={16} className={medal.color} />
                                        ) : null}
                                        <span className={`text-sm font-semibold ${medal ? medal.color : 'text-neutral-600'}`}>
                                            {student.rank}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        {student.photoUrl ? (
                                            <img src={student.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center">
                                                <span className="text-xs font-medium text-neutral-600">
                                                    {student.studentName.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900 flex items-center gap-1">
                                                {student.studentName}
                                                {(student.generalAverage ?? 0) >= 14 && (
                                                    <Star size={11} className="text-yellow-500 fill-yellow-500" />
                                                )}
                                            </p>
                                            <p className="text-xs text-neutral-500">{student.studentMatricule}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-sm text-neutral-600">
                                        {student.totalPoints.toFixed(0)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`text-sm ${getAvgColor(student.generalAverage)}`}>
                                        {student.generalAverage !== null
                                            ? `${student.generalAverage.toFixed(1)}/20`
                                            : '—'
                                        }
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <StatusBadge status={student.status} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {students.length === 0 && (
                <div className="text-center py-12 text-sm text-neutral-500">
                    Aucun résultat disponible
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        ADMITTED: { label: 'Admis', cls: 'bg-green-100 text-green-700' },
        ADJOURNED: { label: 'Ajourné', cls: 'bg-orange-100 text-orange-700' },
        FAILED: { label: 'Refusé', cls: 'bg-red-100 text-red-700' },
    };
    const s = map[status] ?? { label: status, cls: 'bg-neutral-100 text-neutral-600' };
    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>
            {s.label}
        </span>
    );
}

