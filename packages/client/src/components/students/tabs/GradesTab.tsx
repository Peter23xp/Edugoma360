import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import api from '../../../lib/api';
import type { Grade, DelibDecision } from '@edugoma360/shared';

interface GradeWithSubject extends Grade {
    subject: {
        name: string;
        coefficient: number;
    };
}

interface GradesResponse {
    grades: GradeWithSubject[];
    average: number;
    rank: number;
    decision?: DelibDecision;
}

interface GradesTabProps {
    studentId: string;
}

export default function GradesTab({ studentId }: GradesTabProps) {
    // TODO: Get current term from context or API
    const [selectedTermId, setSelectedTermId] = useState<string>('term-1');

    const { data, isLoading } = useQuery({
        queryKey: ['student-grades', studentId, selectedTermId],
        queryFn: async () => {
            const res = await api.get<GradesResponse>('/grades', {
                params: { studentId, termId: selectedTermId },
            });
            return res.data;
        },
    });

    // Group grades by subject
    const gradesBySubject = data?.grades.reduce((acc, grade) => {
        const subjectId = grade.subjectId;
        if (!acc[subjectId]) {
            acc[subjectId] = {
                subject: grade.subject,
                grades: [],
            };
        }
        acc[subjectId].grades.push(grade);
        return acc;
    }, {} as Record<string, { subject: { name: string; coefficient: number }; grades: GradeWithSubject[] }>);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-20 h-8 bg-neutral-200 rounded animate-pulse" />
                    ))}
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-neutral-100 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || !gradesBySubject || Object.keys(gradesBySubject).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                    <BookOpen size={20} className="text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500">
                    Aucune note disponible pour ce trimestre
                </p>
            </div>
        );
    }

    const getAverageColor = (avg: number | null) => {
        if (avg === null) return 'text-neutral-400';
        if (avg >= 14) return 'text-green-700 bg-green-50';
        if (avg >= 10) return 'text-neutral-800';
        if (avg >= 8) return 'text-orange-600';
        return 'text-red-600 font-bold';
    };

    const decisionLabels: Record<DelibDecision, string> = {
        ADMITTED: 'Admis(e)',
        DISTINCTION: 'Admis(e) avec Distinction',
        GREAT_DISTINCTION: 'Admis(e) avec Grande Distinction',
        ADJOURNED: 'Ajourné(e)',
        FAILED: 'Refusé(e)',
        MEDICAL: 'Cas Médical',
    };

    const decisionColors: Record<DelibDecision, string> = {
        ADMITTED: 'bg-green-100 text-green-700',
        DISTINCTION: 'bg-green-100 text-green-700',
        GREAT_DISTINCTION: 'bg-green-100 text-green-700',
        ADJOURNED: 'bg-orange-100 text-orange-700',
        FAILED: 'bg-red-100 text-red-700',
        MEDICAL: 'bg-blue-100 text-blue-700',
    };

    return (
        <div className="space-y-6">
            {/* ── Term Selector ──────────────────────────────────────────── */}
            <div className="flex gap-2">
                {['T1', 'T2', 'T3'].map((term, idx) => (
                    <button
                        key={term}
                        onClick={() => setSelectedTermId(`term-${idx + 1}`)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            selectedTermId === `term-${idx + 1}`
                                ? 'bg-primary text-white'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                    >
                        {term}
                    </button>
                ))}
            </div>

            {/* ── Grades Table ───────────────────────────────────────────── */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                Matière
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">
                                Coeff
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">
                                Inter
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">
                                TP
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">
                                Examen
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">
                                Moyenne
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600">
                                Rang
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {Object.values(gradesBySubject).map((item) => {
                            const inter = item.grades.find((g) => g.evalType === 'INTERROGATION');
                            const tp = item.grades.find((g) => g.evalType === 'TP');
                            const exam = item.grades.find((g) => g.evalType === 'EXAMEN_TRIMESTRIEL');

                            // Calculate average (simplified)
                            const scores = [inter?.score, tp?.score, exam?.score].filter(
                                (s) => s !== undefined
                            ) as number[];
                            const average =
                                scores.length > 0
                                    ? scores.reduce((a, b) => a + b, 0) / scores.length
                                    : null;

                            const isIncomplete = !inter && !tp && !exam;

                            return (
                                <tr
                                    key={item.subject.name}
                                    className={isIncomplete ? 'opacity-50' : ''}
                                >
                                    <td className="px-4 py-3 text-sm text-neutral-900">
                                        {item.subject.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center text-neutral-700">
                                        {item.subject.coefficient}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        {inter ? (
                                            inter.score
                                        ) : (
                                            <span className="text-neutral-400 italic">——</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        {tp ? (
                                            tp.score
                                        ) : (
                                            <span className="text-neutral-400 italic">——</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        {exam ? (
                                            exam.score
                                        ) : (
                                            <span className="text-neutral-400 italic">——</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        {average !== null ? (
                                            <span className={`px-2 py-1 rounded ${getAverageColor(average)}`}>
                                                {average.toFixed(1)}
                                            </span>
                                        ) : (
                                            <span className="text-neutral-400 italic">
                                                Incomplet
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center text-neutral-700">
                                        {average !== null ? '—' : '—'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Summary ────────────────────────────────────────────────── */}
            <div className="border-t border-neutral-200 pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-xs text-neutral-500">Moyenne générale</p>
                            <p className="text-2xl font-bold text-neutral-900">
                                {data.average.toFixed(2)}/20
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500">Rang</p>
                            <p className="text-2xl font-bold text-neutral-900">
                                {data.rank}
                                <sup className="text-sm">ème</sup>
                            </p>
                        </div>
                    </div>

                    {data.decision && (
                        <div>
                            <p className="text-xs text-neutral-500 mb-1">
                                Décision de délibération
                            </p>
                            <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-lg 
                                           text-sm font-semibold ${
                                               decisionColors[data.decision]
                                           }`}
                            >
                                {decisionLabels[data.decision]}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
