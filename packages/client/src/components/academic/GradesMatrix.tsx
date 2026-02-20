import { AlertTriangle } from 'lucide-react';

interface Student {
    id: string;
    matricule: string;
    nom: string;
    postNom: string;
    prenom: string | null;
}

interface Subject {
    id: string;
    name: string;
    abbreviation: string;
    maxScore: number;
    isEliminatory: boolean;
    elimThreshold: number | null;
}

interface GradesMatrixProps {
    students: Student[];
    subjects: Subject[];
    grades: Record<string, Record<string, number | null>>;
    averages: Record<string, number | null>;
    ranks: Record<string, number | null>;
}

export default function GradesMatrix({
    students,
    subjects,
    grades,
    averages,
    ranks,
}: GradesMatrixProps) {
    const getGradeColor = (score: number | null, subject: Subject) => {
        if (score === null) return 'text-neutral-400 italic';

        // Check eliminatory threshold
        if (subject.isEliminatory && subject.elimThreshold && score < subject.elimThreshold) {
            return 'text-red-700 font-bold';
        }

        // Regular coloring
        const passingScore = subject.maxScore === 20 ? 10 : 5;
        if (score < passingScore) return 'text-red-600';
        if (score >= 14) return 'text-green-600';
        return 'text-neutral-900';
    };

    const formatGrade = (score: number | null) => {
        if (score === null) return '——';
        return score.toFixed(1);
    };

    return (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-neutral-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider 
                                           border-r border-neutral-200 bg-neutral-100 
                                           sticky left-0 z-20 min-w-[200px]">
                                Élève
                            </th>
                            {subjects.map((subject) => (
                                <th
                                    key={subject.id}
                                    className="px-3 py-3 text-center text-xs font-semibold 
                                               text-neutral-700 uppercase tracking-wider 
                                               border-r border-neutral-200 min-w-[80px]"
                                    title={subject.name}
                                >
                                    {subject.abbreviation}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-center text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider 
                                           border-r border-neutral-200 bg-blue-50 min-w-[80px]">
                                Moyenne
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider 
                                           bg-blue-50 min-w-[80px]">
                                Rang
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-4 py-3 border-r border-neutral-200 
                                               bg-white sticky left-0 z-10">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900">
                                            {student.nom} {student.postNom}
                                        </p>
                                        {student.prenom && (
                                            <p className="text-xs text-neutral-500">
                                                {student.prenom}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                {subjects.map((subject) => {
                                    const score = grades[student.id]?.[subject.id];
                                    const isEliminatory =
                                        subject.isEliminatory &&
                                        subject.elimThreshold &&
                                        score !== null &&
                                        score < subject.elimThreshold;

                                    return (
                                        <td
                                            key={subject.id}
                                            className="px-3 py-3 text-center border-r 
                                                       border-neutral-200"
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                <span
                                                    className={`text-sm ${getGradeColor(
                                                        score,
                                                        subject
                                                    )}`}
                                                >
                                                    {formatGrade(score)}
                                                </span>
                                                {isEliminatory && (
                                                    <AlertTriangle
                                                        size={14}
                                                        className="text-red-600"
                                                        title="Note éliminatoire"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="px-4 py-3 text-center border-r border-neutral-200 
                                               bg-blue-50">
                                    <span
                                        className={`text-sm font-semibold ${
                                            averages[student.id] !== null
                                                ? 'text-blue-700'
                                                : 'text-neutral-400 italic'
                                        }`}
                                    >
                                        {averages[student.id] !== null
                                            ? averages[student.id]!.toFixed(2)
                                            : '——'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center bg-blue-50">
                                    <span
                                        className={`text-sm font-bold ${
                                            ranks[student.id] !== null
                                                ? 'text-primary'
                                                : 'text-neutral-400 italic'
                                        }`}
                                    >
                                        {ranks[student.id] !== null ? ranks[student.id] : '——'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4">
                <h4 className="text-xs font-semibold text-neutral-700 uppercase mb-3">
                    Légende
                </h4>
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-neutral-400 italic">——</span>
                        <span className="text-neutral-600">Note manquante</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-red-600">8.5</span>
                        <span className="text-neutral-600">Note &lt; 10</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-green-600">14.5</span>
                        <span className="text-neutral-600">Note ≥ 14</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-red-700 font-bold flex items-center gap-1">
                            6.0 <AlertTriangle size={12} />
                        </span>
                        <span className="text-neutral-600">Note éliminatoire</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

