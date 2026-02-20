import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Printer, Send, Loader2, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { EVAL_TYPE_OPTIONS } from '@edugoma360/shared/src/constants/evalTypes';

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
    coefficient: number;
}

interface Grade {
    id: string;
    studentId: string;
    subjectId: string;
    score: number;
    observation: string | null;
    isLocked: boolean;
}

export default function ClassGradesPage() {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [selectedTermId, setSelectedTermId] = useState('');
    const [selectedEvalType, setSelectedEvalType] = useState('EXAM_TRIM');

    // Fetch class info
    const { data: classData, isLoading: loadingClass } = useQuery({
        queryKey: ['class', classId],
        queryFn: async () => {
            const response = await api.get(`/classes/${classId}`);
            return response.data;
        },
        enabled: !!classId,
    });

    // Fetch terms
    const { data: termsData } = useQuery({
        queryKey: ['terms'],
        queryFn: async () => {
            const response = await api.get('/settings/terms');
            return response.data;
        },
    });

    // Fetch students in class
    const { data: studentsData, isLoading: loadingStudents } = useQuery({
        queryKey: ['class-students', classId],
        queryFn: async () => {
            const response = await api.get(`/students?classId=${classId}`);
            return response.data;
        },
        enabled: !!classId,
    });

    // Fetch subjects for class section
    const { data: subjectsData, isLoading: loadingSubjects } = useQuery({
        queryKey: ['section-subjects', classData?.class?.sectionId],
        queryFn: async () => {
            const response = await api.get(`/subjects?sectionId=${classData.class.sectionId}`);
            return response.data;
        },
        enabled: !!classData?.class?.sectionId,
    });

    // Fetch grades
    const { data: gradesData, isLoading: loadingGrades } = useQuery({
        queryKey: ['class-grades', classId, selectedTermId, selectedEvalType],
        queryFn: async () => {
            const response = await api.get('/grades', {
                params: {
                    classId,
                    termId: selectedTermId,
                    evalType: selectedEvalType,
                },
            });
            return response.data;
        },
        enabled: !!classId && !!selectedTermId,
    });

    const handleExportExcel = async () => {
        try {
            toast.loading('Génération du fichier Excel...');
            const response = await api.get(`/grades/export/excel`, {
                params: {
                    classId,
                    termId: selectedTermId,
                    evalType: selectedEvalType,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `notes_${classData?.class?.name}_${selectedEvalType}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.dismiss();
            toast.success('Fichier Excel téléchargé');
        } catch (error) {
            toast.dismiss();
            toast.error('Erreur lors de l\'export');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSendBulletins = async () => {
        try {
            toast.loading('Envoi des bulletins par SMS...');
            await api.post('/sms/send-bulletins', {
                classId,
                termId: selectedTermId,
            });
            toast.dismiss();
            toast.success('Bulletins envoyés avec succès');
        } catch (error) {
            toast.dismiss();
            toast.error('Erreur lors de l\'envoi');
        }
    };

    // Build grades matrix
    const students: Student[] = studentsData?.students || [];
    const subjects: Subject[] = subjectsData?.subjects || [];
    const grades: Grade[] = gradesData?.grades || [];
    const terms = termsData?.terms || [];

    // Create grades map: studentId -> subjectId -> grade
    const gradesMap = new Map<string, Map<string, Grade>>();
    grades.forEach((grade) => {
        if (!gradesMap.has(grade.studentId)) {
            gradesMap.set(grade.studentId, new Map());
        }
        gradesMap.get(grade.studentId)!.set(grade.subjectId, grade);
    });

    // Calculate statistics
    const totalGrades = students.length * subjects.length;
    const enteredGrades = grades.length;
    const missingGrades = totalGrades - enteredGrades;
    const completionRate = totalGrades > 0 ? (enteredGrades / totalGrades) * 100 : 0;

    // Find missing grades by subject
    const missingBySubject = subjects.map((subject) => {
        const subjectGrades = grades.filter((g) => g.subjectId === subject.id);
        const missing = students.length - subjectGrades.length;
        return {
            subject: subject.name,
            missing,
        };
    }).filter((item) => item.missing > 0);

    const isLoading = loadingClass || loadingStudents || loadingSubjects || loadingGrades;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/classes')}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-neutral-900">
                                Notes - {classData?.class?.name || 'Chargement...'}
                            </h1>
                            <p className="text-sm text-neutral-600 mt-1">
                                {classData?.class?.section?.name} • {students.length} élèves
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExportExcel}
                                disabled={!selectedTermId || isLoading}
                                className="flex items-center gap-2 px-4 py-2 border border-neutral-300 
                                           text-neutral-700 rounded-lg hover:bg-neutral-50 
                                           transition-colors text-sm font-medium
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileSpreadsheet size={16} />
                                Excel
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={!selectedTermId || isLoading}
                                className="flex items-center gap-2 px-4 py-2 border border-neutral-300 
                                           text-neutral-700 rounded-lg hover:bg-neutral-50 
                                           transition-colors text-sm font-medium
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Printer size={16} />
                                Imprimer
                            </button>
                            <button
                                onClick={handleSendBulletins}
                                disabled={!selectedTermId || isLoading || missingGrades > 0}
                                className="flex items-center gap-2 px-4 py-2 bg-primary 
                                           text-white rounded-lg hover:bg-primary-dark 
                                           transition-colors text-sm font-medium
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                                Envoyer bulletins
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Trimestre
                            </label>
                            <select
                                value={selectedTermId}
                                onChange={(e) => setSelectedTermId(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg 
                                           text-sm focus:ring-2 focus:ring-primary/20 
                                           focus:border-primary bg-white"
                            >
                                <option value="">Sélectionnez un trimestre</option>
                                {terms.map((term: any) => (
                                    <option key={term.id} value={term.id}>
                                        {term.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Type d'évaluation
                            </label>
                            <select
                                value={selectedEvalType}
                                onChange={(e) => setSelectedEvalType(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg 
                                           text-sm focus:ring-2 focus:ring-primary/20 
                                           focus:border-primary bg-white"
                            >
                                {EVAL_TYPE_OPTIONS.map((evalType) => (
                                    <option key={evalType.code} value={evalType.code}>
                                        {evalType.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {!selectedTermId ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-600">
                            Sélectionnez un trimestre pour afficher les notes
                        </p>
                    </div>
                ) : isLoading ? (
                    <div className="text-center py-12">
                        <Loader2 size={32} className="animate-spin mx-auto text-primary mb-4" />
                        <p className="text-sm text-neutral-600">Chargement des notes...</p>
                    </div>
                ) : (
                    <>
                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                <p className="text-sm text-neutral-600">Notes saisies</p>
                                <p className="text-2xl font-bold text-primary mt-1">
                                    {enteredGrades}/{totalGrades}
                                </p>
                                <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${completionRate}%` }}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                <p className="text-sm text-neutral-600">Taux de complétion</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    {completionRate.toFixed(0)}%
                                </p>
                            </div>

                            <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                <p className="text-sm text-neutral-600">Notes manquantes</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">
                                    {missingGrades}
                                </p>
                            </div>

                            <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                <p className="text-sm text-neutral-600">Matières</p>
                                <p className="text-2xl font-bold text-neutral-900 mt-1">
                                    {subjects.length}
                                </p>
                            </div>
                        </div>

                        {/* Missing grades alert */}
                        {missingBySubject.length > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                                <h3 className="text-sm font-semibold text-orange-900 mb-2">
                                    ⚠️ Notes manquantes par matière
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {missingBySubject.map((item) => (
                                        <div key={item.subject} className="text-sm text-orange-700">
                                            {item.subject}: <span className="font-bold">{item.missing}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Grades Matrix */}
                        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50 border-b border-neutral-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold 
                                                           text-neutral-700 uppercase tracking-wider 
                                                           sticky left-0 bg-neutral-50 z-10">
                                                Élève
                                            </th>
                                            {subjects.map((subject) => (
                                                <th
                                                    key={subject.id}
                                                    className="px-4 py-3 text-center text-xs font-semibold 
                                                               text-neutral-700 uppercase tracking-wider"
                                                >
                                                    <div>{subject.abbreviation}</div>
                                                    <div className="text-[10px] text-neutral-500 font-normal">
                                                        /{subject.maxScore}
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="px-4 py-3 text-center text-xs font-semibold 
                                                           text-neutral-700 uppercase tracking-wider">
                                                Moyenne
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200">
                                        {students.map((student) => {
                                            const studentGrades = gradesMap.get(student.id);
                                            let total = 0;
                                            let count = 0;

                                            subjects.forEach((subject) => {
                                                const grade = studentGrades?.get(subject.id);
                                                if (grade) {
                                                    // Normalize to /20
                                                    const normalized = (grade.score / subject.maxScore) * 20;
                                                    total += normalized * subject.coefficient;
                                                    count += subject.coefficient;
                                                }
                                            });

                                            const average = count > 0 ? total / count : null;

                                            return (
                                                <tr key={student.id} className="hover:bg-neutral-50">
                                                    <td className="px-4 py-3 sticky left-0 bg-white">
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
                                                        const grade = studentGrades?.get(subject.id);
                                                        return (
                                                            <td
                                                                key={subject.id}
                                                                className="px-4 py-3 text-center"
                                                            >
                                                                {grade ? (
                                                                    <span
                                                                        className={`text-sm font-medium ${
                                                                            grade.score < subject.maxScore / 2
                                                                                ? 'text-red-600'
                                                                                : 'text-green-600'
                                                                        }`}
                                                                    >
                                                                        {grade.score.toFixed(1)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-neutral-400">
                                                                        —
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-4 py-3 text-center">
                                                        {average !== null ? (
                                                            <span
                                                                className={`text-sm font-bold ${
                                                                    average < 10
                                                                        ? 'text-red-600'
                                                                        : 'text-green-600'
                                                                }`}
                                                            >
                                                                {average.toFixed(2)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-neutral-400">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
