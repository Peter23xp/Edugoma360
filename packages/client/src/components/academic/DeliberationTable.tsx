import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Edit2 } from 'lucide-react';
import type { DeliberationStudent, DeliberationStatus } from '@edugoma360/shared/src/types/academic';
import { DELIB_DECISIONS, type DelibDecision } from '@edugoma360/shared/src/constants/decisions';
import DecisionBadge from './DecisionBadge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeliberationTableProps {
    students: DeliberationStudent[];
    status: DeliberationStatus;
    /** Appelé quand le Préfet ouvre le modal de décision pour un élève */
    onEditDecision?: (student: DeliberationStudent) => void;
    /** Appelé quand l'enseignant change directement la décision via le select inline */
    onDecisionChange?: (studentId: string, decision: DelibDecision) => void;
    isLoading?: boolean;
}

type SortKey = 'rank' | 't1' | 't2' | 't3' | 'annual';
type SortDir = 'asc' | 'desc';

// ─── Couleurs de ligne selon décision ─────────────────────────────────────────

const ROW_COLORS: Record<DelibDecision, string> = {
    ADMITTED: 'hover:bg-green-50',
    DISTINCTION: 'hover:bg-green-100',
    GREAT_DISTINCTION: 'bg-yellow-50 hover:bg-yellow-100',
    ADJOURNED: 'hover:bg-orange-50',
    FAILED: 'bg-red-50 hover:bg-red-100',
    MEDICAL: 'hover:bg-blue-50',
};

// ─── Composant ────────────────────────────────────────────────────────────────

export default function DeliberationTable({
    students,
    status,
    onEditDecision,
    onDecisionChange,
    isLoading = false,
}: DeliberationTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('rank');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const isPrefet = !!onEditDecision;
    const canEdit = status !== 'APPROVED';

    // ── Tri ──────────────────────────────────────────────────────────────────
    const sorted = useMemo(() => {
        const list = [...students];
        list.sort((a, b) => {
            let av: number, bv: number;
            switch (sortKey) {
                case 'rank': av = a.rank; bv = b.rank; break;
                case 't1': av = a.t1Average ?? -1; bv = b.t1Average ?? -1; break;
                case 't2': av = a.t2Average ?? -1; bv = b.t2Average ?? -1; break;
                case 't3': av = a.t3Average ?? -1; bv = b.t3Average ?? -1; break;
                case 'annual': av = a.annualAverage ?? -1; bv = b.annualAverage ?? -1; break;
                default: av = a.rank; bv = b.rank;
            }
            return sortDir === 'asc' ? av - bv : bv - av;
        });
        return list;
    }, [students, sortKey, sortDir]);

    function toggleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    }

    function SortIcon({ col }: { col: SortKey }) {
        if (sortKey !== col) return null;
        return sortDir === 'asc'
            ? <ChevronUp size={13} className="inline ml-0.5 text-primary" />
            : <ChevronDown size={13} className="inline ml-0.5 text-primary" />;
    }

    function fmtAvg(v: number | null): string {
        if (v === null) return '—';
        return v.toFixed(1);
    }

    function avgColor(v: number | null): string {
        if (v === null) return 'text-neutral-400';
        if (v >= 16) return 'text-yellow-700 font-bold';
        if (v >= 14) return 'text-green-700 font-semibold';
        if (v >= 10) return 'text-green-600';
        if (v >= 8) return 'text-orange-600';
        return 'text-red-600 font-semibold';
    }

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">

                    {/* ── Entête ── */}
                    <thead className="bg-neutral-100 border-b border-neutral-200">
                        <tr>
                            <th
                                onClick={() => toggleSort('rank')}
                                className="px-4 py-3 text-left text-xs font-semibold text-neutral-600
                                           uppercase tracking-wider cursor-pointer hover:bg-neutral-200 w-16"
                            >
                                Rang <SortIcon col="rank" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600
                                           uppercase tracking-wider min-w-[180px]">
                                Élève
                            </th>
                            <th
                                onClick={() => toggleSort('t1')}
                                className="px-3 py-3 text-center text-xs font-semibold text-neutral-600
                                           uppercase tracking-wider cursor-pointer hover:bg-neutral-200 w-20"
                            >
                                Moy T1 <SortIcon col="t1" />
                            </th>
                            <th
                                onClick={() => toggleSort('t2')}
                                className="px-3 py-3 text-center text-xs font-semibold text-neutral-600
                                           uppercase tracking-wider cursor-pointer hover:bg-neutral-200 w-20"
                            >
                                Moy T2 <SortIcon col="t2" />
                            </th>
                            <th
                                onClick={() => toggleSort('t3')}
                                className="px-3 py-3 text-center text-xs font-semibold text-neutral-600
                                           uppercase tracking-wider cursor-pointer hover:bg-neutral-200 w-20"
                            >
                                Moy T3 <SortIcon col="t3" />
                            </th>
                            <th
                                onClick={() => toggleSort('annual')}
                                className="px-3 py-3 text-center text-xs font-semibold text-blue-700
                                           uppercase tracking-wider cursor-pointer hover:bg-blue-100
                                           bg-blue-50 w-24"
                            >
                                Moy An. <SortIcon col="annual" />
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600
                                           uppercase tracking-wider min-w-[180px]">
                                Décision
                            </th>
                            {canEdit && isPrefet && (
                                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600
                                               uppercase tracking-wider w-16">
                                    Action
                                </th>
                            )}
                        </tr>
                    </thead>

                    {/* ── Corps ── */}
                    <tbody className="divide-y divide-neutral-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-neutral-500 text-sm">
                                    Chargement…
                                </td>
                            </tr>
                        ) : sorted.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-neutral-400 text-sm">
                                    Aucun élève dans la délibération
                                </td>
                            </tr>
                        ) : (
                            sorted.map((student) => {
                                const decision = student.finalDecision ?? student.suggestedDecision;
                                const rowColor = ROW_COLORS[decision] ?? 'hover:bg-neutral-50';

                                return (
                                    <tr
                                        key={student.studentId}
                                        className={`transition-colors ${rowColor}`}
                                    >
                                        {/* Rang */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center justify-center
                                                w-8 h-8 rounded-full text-sm font-bold
                                                ${student.rank === 1
                                                    ? 'bg-yellow-400 text-white'
                                                    : student.rank === 2
                                                        ? 'bg-neutral-300 text-white'
                                                        : student.rank === 3
                                                            ? 'bg-orange-400 text-white'
                                                            : 'bg-neutral-100 text-neutral-700'
                                                }`}
                                            >
                                                {student.rank}
                                            </span>
                                        </td>

                                        {/* Élève */}
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-neutral-900">
                                                    {student.studentName}
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                    {student.studentMatricule}
                                                    {student.isEliminatory && (
                                                        <span className="ml-2 text-red-500 font-semibold">
                                                            ⚠ Éliminatoire
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Moy T1 */}
                                        <td className={`px-3 py-3 text-center font-medium ${avgColor(student.t1Average)}`}>
                                            {fmtAvg(student.t1Average)}
                                        </td>

                                        {/* Moy T2 */}
                                        <td className={`px-3 py-3 text-center font-medium ${avgColor(student.t2Average)}`}>
                                            {fmtAvg(student.t2Average)}
                                        </td>

                                        {/* Moy T3 */}
                                        <td className={`px-3 py-3 text-center font-medium ${avgColor(student.t3Average)}`}>
                                            {fmtAvg(student.t3Average)}
                                        </td>

                                        {/* Moy Annuelle */}
                                        <td className={`px-3 py-3 text-center bg-blue-50 font-bold text-base
                                                        ${avgColor(student.annualAverage)}`}>
                                            {fmtAvg(student.annualAverage)}
                                        </td>

                                        {/* Décision */}
                                        <td className="px-4 py-3 text-center">
                                            {canEdit && onDecisionChange ? (
                                                <select
                                                    value={student.finalDecision ?? student.suggestedDecision}
                                                    onChange={(e) =>
                                                        onDecisionChange(student.studentId, e.target.value as DelibDecision)
                                                    }
                                                    className="text-xs border border-neutral-300 rounded-lg px-2 py-1.5
                                                               focus:ring-2 focus:ring-primary/20 focus:border-primary
                                                               focus:outline-none bg-white w-full max-w-[200px]"
                                                >
                                                    {(Object.keys(DELIB_DECISIONS) as DelibDecision[]).map((key) => (
                                                        <option key={key} value={key}>
                                                            {DELIB_DECISIONS[key].label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <DecisionBadge decision={decision} size="sm" />
                                            )}

                                            {/* Suggestion vs décision finale */}
                                            {student.finalDecision &&
                                                student.finalDecision !== student.suggestedDecision && (
                                                    <p className="text-[10px] text-neutral-400 mt-1">
                                                        Suggéré : {DELIB_DECISIONS[student.suggestedDecision]?.label}
                                                    </p>
                                                )}
                                        </td>

                                        {/* Bouton modal Préfet */}
                                        {canEdit && isPrefet && (
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => onEditDecision(student)}
                                                    className="p-1.5 rounded-lg hover:bg-neutral-200 transition-colors"
                                                    title="Modifier la décision"
                                                >
                                                    <Edit2 size={14} className="text-neutral-600" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pied : légende ── */}
            <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3">
                <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                    {(Object.keys(DELIB_DECISIONS) as DelibDecision[]).map((key) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <DecisionBadge decision={key} size="sm" showIcon={false} />
                            <span>{DELIB_DECISIONS[key].condition}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
