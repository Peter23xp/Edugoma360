import { useQuery } from '@tanstack/react-query';
import { GraduationCap } from 'lucide-react';
import api from '../../../lib/api';

interface AcademicRecord {
    year: string;
    class: string;
    decision: string;
    average: number | null;
    isTenasosp?: boolean;
}

interface ScolariteTabProps {
    studentId: string;
}

export default function ScolariteTab({ studentId }: ScolariteTabProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['student-academic-history', studentId],
        queryFn: async () => {
            const res = await api.get<{ history: AcademicRecord[] }>(
                `/students/${studentId}/academic-history`
            );
            return res.data.history;
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse" />
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-neutral-100 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                    <GraduationCap size={20} className="text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500">
                    Aucun historique scolaire disponible
                </p>
            </div>
        );
    }

    const decisionColors: Record<string, string> = {
        'En cours': 'text-blue-700 bg-blue-50',
        Admis: 'text-green-700 bg-green-50',
        'Admis avec distinction': 'text-green-700 bg-green-50',
        Ajourné: 'text-orange-700 bg-orange-50',
        Refusé: 'text-red-700 bg-red-50',
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                    Historique Scolaire
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                    Année
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                    Classe
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                    Résultat
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600">
                                    Moyenne générale
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {data.map((record, idx) => (
                                <tr
                                    key={idx}
                                    className={`hover:bg-neutral-50 transition-colors ${
                                        record.decision === 'En cours' ? 'cursor-pointer' : ''
                                    }`}
                                >
                                    <td className="px-4 py-3 text-sm text-neutral-900">
                                        {record.year}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-neutral-900">
                                        {record.class}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full 
                                                       text-xs font-medium ${
                                                           decisionColors[record.decision] ||
                                                           'text-neutral-700 bg-neutral-100'
                                                       }`}
                                        >
                                            {record.decision}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-neutral-900">
                                        {record.average !== null ? (
                                            <>
                                                {record.average.toFixed(1)}/20
                                                {record.isTenasosp && (
                                                    <span className="ml-2 text-xs text-neutral-500">
                                                        (TENASOSP)
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-neutral-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* École d'origine (if applicable) */}
            {data.some((r) => r.isTenasosp) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                        École d'origine
                    </p>
                    <p className="text-sm text-blue-800">
                        Résultat TENASOSP disponible dans l'historique
                    </p>
                </div>
            )}
        </div>
    );
}
