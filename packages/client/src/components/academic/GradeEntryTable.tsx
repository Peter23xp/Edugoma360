import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import GradeInput from './GradeInput';

interface Student {
    id: string;
    matricule: string;
    nom: string;
    postNom: string;
    prenom: string | null;
}

interface GradeData {
    studentId: string;
    score: number | null;
    observation: string;
}

interface GradeEntryTableProps {
    students: Student[];
    grades: Map<string, GradeData>;
    maxScore: number;
    isLocked: boolean;
    onGradeChange: (studentId: string, score: number | null) => void;
    onObservationChange: (studentId: string, observation: string) => void;
}

export default function GradeEntryTable({
    students,
    grades,
    maxScore,
    isLocked,
    onGradeChange,
    onObservationChange,
}: GradeEntryTableProps) {
    const passingThreshold = maxScore === 20 ? 10 : 5;

    const getStatusBadge = (score: number | null) => {
        if (score === null) {
            return (
                <div className="flex items-center gap-1.5 text-neutral-500">
                    <Clock size={14} />
                    <span className="text-xs">Attente</span>
                </div>
            );
        }

        if (score < passingThreshold) {
            return (
                <div className="flex items-center gap-1.5 text-orange-600">
                    <AlertTriangle size={14} />
                    <span className="text-xs">Note basse</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle size={14} />
                <span className="text-xs">Saisi</span>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider">
                                Élève
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider">
                                Note /{maxScore}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider">
                                Observation
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold 
                                           text-neutral-700 uppercase tracking-wider">
                                Statut
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {students.map((student) => {
                            const gradeData = grades.get(student.id) || {
                                score: null,
                                observation: '',
                            };

                            return (
                                <tr
                                    key={student.id}
                                    className="hover:bg-neutral-50 transition-colors"
                                >
                                    <td className="px-4 py-3">
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
                                    <td className="px-4 py-3">
                                        <GradeInput
                                            studentId={student.id}
                                            currentValue={gradeData.score}
                                            maxScore={maxScore}
                                            onChange={(value) => onGradeChange(student.id, value)}
                                            isLocked={isLocked}
                                            passingThreshold={passingThreshold}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            value={gradeData.observation}
                                            onChange={(e) =>
                                                onObservationChange(student.id, e.target.value)
                                            }
                                            disabled={isLocked}
                                            placeholder="Optionnel"
                                            className="w-full px-2 py-1.5 text-sm border 
                                                       border-neutral-300 rounded 
                                                       focus:ring-2 focus:ring-primary/20 
                                                       focus:border-primary focus:outline-none
                                                       disabled:bg-neutral-100 
                                                       disabled:cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-4 py-3">{getStatusBadge(gradeData.score)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {students.length === 0 && (
                <div className="text-center py-12">
                    <XCircle size={48} className="mx-auto text-neutral-400 mb-4" />
                    <p className="text-sm text-neutral-600">Aucun élève dans cette classe</p>
                </div>
            )}
        </div>
    );
}

