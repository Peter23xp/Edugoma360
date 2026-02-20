import { AlertTriangle, CheckCircle } from 'lucide-react';

interface SubjectAverage {
    subjectId: string;
    subjectName: string;
    average: number;
    hasFailed: boolean;
}

interface StudentAverage {
    studentId: string;
    studentName: string;
    subjectAverages: SubjectAverage[];
    generalAverage: number;
    totalPoints: number;
    rank: number;
    hasEliminatoryFailure: boolean;
}

interface AveragesTableProps {
    students: StudentAverage[];
    subjects: { id: string; name: string; abbreviation: string }[];
    isLoading?: boolean;
}

export default function AveragesTable({ students, subjects, isLoading }: AveragesTableProps) {
    const getAverageBadge = (average: number, hasEliminatoryFailure: boolean) => {
        if (hasEliminatoryFailure) {
            return (
                <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-semibold">Élim.</span>
                </div>
            );
        }

        if (average >= 10) {
            return (
                <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={14} />
                    <span className="text-xs font-semibold">Admis</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle size={14} />
                <span className="text-xs font-semibold">Échec</span>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-neutral-200 p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-neutral-200 rounded w-full" />
                    <div className="h-8 bg-neutral-200 rounded w-full" />
                    <div className="h-8 bg-neutral-200 rounded w-full" />
                </div>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                <p className="text-neutral-600">Aucune moyenne calculée</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider 
                                           sticky left-0 bg-neutral-50 z-10">
                                Rang
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider 
                                           sticky left-12 bg-neutral-50 z-10">
                                Élève
                            </th>
                            {subjects.map((subject) => (
                                <th
                                    key={subject.id}
                                    className="px-4 py-3 text-center text-xs font-semibold 
                                               text-neutral-700 uppercase tracking-wider"
                                >
                                    {subject.abbreviation}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-center text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider bg-blue-50">
                                Total
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider bg-blue-50">
                                Moyenne
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider bg-blue-50">
                                Statut
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {students.map((student) => (
                            <tr key={student.studentId} className="hover:bg-neutral-50">
                                <td className="px-4 py-3 sticky left-0 bg-white">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center 
                                                   justify-center font-bold text-sm ${
                                                       student.rank === 1
                                                           ? 'bg-yellow-100 text-yellow-700'
                                                           : student.rank === 2
                                                           ? 'bg-gray-100 text-gray-700'
                                                           : student.rank === 3
                                                           ? 'bg-orange-100 text-orange-700'
                                                           : 'bg-neutral-100 text-neutral-700'
                                                   }`}
                                    >
                                        {student.rank}
                                    </div>
                                </td>
                                <td className="px-4 py-3 sticky left-12 bg-white">
                                    <p className="text-sm font-medium text-neutral-900">
                                        {student.studentName}
                                    </p>
                                </td>
                                {subjects.map((subject) => {
                                    const subjectAvg = student.subjectAverages.find(
                                        (sa) => sa.subjectId === subject.id
                                    );
                                    return (
                                        <td key={subject.id} className="px-4 py-3 text-center">
                                            {subjectAvg ? (
                                                <span
                                                    className={`text-sm font-medium ${
                                                        subjectAvg.hasFailed
                                                            ? 'text-red-600'
                                                            : subjectAvg.average >= 10
                                                            ? 'text-green-600'
                                                            : 'text-orange-600'
                                                    }`}
                                                >
                                                    {subjectAvg.average.toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-neutral-400">—</span>
                                            )}
                                        </td>
                                    );
                                })}
                                <td className="px-4 py-3 text-center bg-blue-50">
                                    <span className="text-sm font-bold text-blue-900">
                                        {student.totalPoints.toFixed(1)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center bg-blue-50">
                                    <span
                                        className={`text-sm font-bold ${
                                            student.generalAverage >= 10
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}
                                    >
                                        {student.generalAverage.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center bg-blue-50">
                                    {getAverageBadge(
                                        student.generalAverage,
                                        student.hasEliminatoryFailure
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

