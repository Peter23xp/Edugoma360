import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Lock, Wifi, WifiOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/auth.store';
import { useOffline } from '../../hooks/useOffline';
import api from '../../lib/api';
import { EVAL_TYPE_OPTIONS } from '../../../shared/src/constants/evalTypes';
import GradeEntryTable from '../../components/academic/GradeEntryTable';
import LockGradesModal from '../../components/academic/LockGradesModal';
import { addToGradeQueue, getQueueCount } from '../../lib/offline/gradeQueue';

interface GradeData {
    studentId: string;
    score: number | null;
    observation: string;
}

export default function GradeEntryPage() {
    const user = useAuthStore((s) => s.user);
    const { isOnline } = useOffline();
    const queryClient = useQueryClient();

    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTermId, setSelectedTermId] = useState('');
    const [selectedEvalType, setSelectedEvalType] = useState('EXAM_TRIM');
    const [grades, setGrades] = useState<Map<string, GradeData>>(new Map());
    const [isLocked, setIsLocked] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [queueCount, setQueueCount] = useState(0);

    // Update queue count
    useEffect(() => {
        const updateCount = async () => {
            const count = await getQueueCount();
            setQueueCount(count);
        };
        updateCount();
        const interval = setInterval(updateCount, 5000);
        return () => clearInterval(interval);
    }, []);

    // Fetch teacher's classes
    const { data: classesData } = useQuery({
        queryKey: ['teacher-classes', user?.id],
        queryFn: async () => {
            const response = await api.get('/teachers/me/classes');
            return response.data;
        },
        enabled: !!user,
    });

    // Fetch subjects for selected class
    const { data: subjectsData } = useQuery({
        queryKey: ['teacher-subjects', selectedClassId],
        queryFn: async () => {
            const response = await api.get(`/teachers/me/subjects?classId=${selectedClassId}`);
            return response.data;
        },
        enabled: !!selectedClassId,
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
    const { data: studentsData } = useQuery({
        queryKey: ['class-students', selectedClassId],
        queryFn: async () => {
            const response = await api.get(`/students?classId=${selectedClassId}`);
            return response.data;
        },
        enabled: !!selectedClassId,
    });

    // Fetch existing grades
    const { data: existingGradesData, isLoading: gradesLoading } = useQuery({
        queryKey: ['grades', selectedClassId, selectedSubjectId, selectedTermId, selectedEvalType],
        queryFn: async () => {
            const response = await api.get('/grades', {
                params: {
                    classId: selectedClassId,
                    subjectId: selectedSubjectId,
                    termId: selectedTermId,
                    evalType: selectedEvalType,
                },
            });
            return response.data;
        },
        enabled: !!selectedClassId && !!selectedSubjectId && !!selectedTermId,
    });

    // Load existing grades into state
    useEffect(() => {
        if (existingGradesData?.grades) {
            const gradesMap = new Map<string, GradeData>();
            let locked = false;

            existingGradesData.grades.forEach((grade: any) => {
                gradesMap.set(grade.student.id, {
                    studentId: grade.student.id,
                    score: grade.score,
                    observation: grade.observation || '',
                });
                if (grade.isLocked) {
                    locked = true;
                }
            });

            setGrades(gradesMap);
            setIsLocked(locked);
        } else {
            setGrades(new Map());
            setIsLocked(false);
        }
    }, [existingGradesData]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async () => {
            const gradesToSave = Array.from(grades.values()).filter((g) => g.score !== null);

            if (isOnline) {
                const response = await api.post('/grades/batch', {
                    grades: gradesToSave,
                    subjectId: selectedSubjectId,
                    termId: selectedTermId,
                    evalType: selectedEvalType,
                });
                return response.data;
            } else {
                // Save to offline queue
                for (const grade of gradesToSave) {
                    await addToGradeQueue('grade_create', {
                        studentId: grade.studentId,
                        subjectId: selectedSubjectId,
                        termId: selectedTermId,
                        evalType: selectedEvalType,
                        score: grade.score!,
                        observation: grade.observation,
                    });
                }
                return { saved: gradesToSave.length, errors: [] };
            }
        },
        onSuccess: (data) => {
            if (isOnline) {
                toast.success(`${data.saved} notes enregistrées`);
                if (data.errors.length > 0) {
                    toast.error(`${data.errors.length} erreurs`);
                }
                queryClient.invalidateQueries({ queryKey: ['grades'] });
            } else {
                toast.success('Notes enregistrées hors ligne');
                setQueueCount((prev) => prev + data.saved);
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        },
    });

    const handleGradeChange = (studentId: string, score: number | null) => {
        setGrades((prev) => {
            const newGrades = new Map(prev);
            const existing = newGrades.get(studentId) || { studentId, score: null, observation: '' };
            newGrades.set(studentId, { ...existing, score });
            return newGrades;
        });
    };

    const handleObservationChange = (studentId: string, observation: string) => {
        setGrades((prev) => {
            const newGrades = new Map(prev);
            const existing = newGrades.get(studentId) || { studentId, score: null, observation: '' };
            newGrades.set(studentId, { ...existing, observation });
            return newGrades;
        });
    };

    const handleSave = () => {
        saveMutation.mutate();
    };

    const handleLock = () => {
        setShowLockModal(true);
    };

    // Calculate stats
    const students = studentsData?.students || [];
    const totalStudents = students.length;
    const gradedCount = Array.from(grades.values()).filter((g) => g.score !== null).length;
    const average =
        gradedCount > 0
            ? Array.from(grades.values())
                  .filter((g) => g.score !== null)
                  .reduce((sum, g) => sum + g.score!, 0) / gradedCount
            : 0;
    const progressPercent = totalStudents > 0 ? (gradedCount / totalStudents) * 100 : 0;

    const classes = classesData?.classes || [];
    const subjects = subjectsData?.subjects || [];
    const terms = termsData?.terms || [];
    const selectedSubject = subjects.find((s: any) => s.id === selectedSubjectId);
    const maxScore = selectedSubject?.maxScore || 20;
    const selectedClass = classes.find((c: any) => c.id === selectedClassId);
    const selectedTerm = terms.find((t: any) => t.id === selectedTermId);
    const selectedEvalTypeLabel =
        EVAL_TYPE_OPTIONS.find((e) => e.code === selectedEvalType)?.label || '';

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">Saisie des Notes</h1>
                            <p className="text-sm text-neutral-600 mt-1">
                                Enregistrez les notes de vos élèves
                            </p>
                        </div>

                        {/* Connection status */}
                        <div className="flex items-center gap-2">
                            {isOnline ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 
                                                text-green-700 rounded-lg text-sm">
                                    <Wifi size={16} />
                                    <span>Connecté</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 
                                                text-orange-700 rounded-lg text-sm">
                                    <WifiOff size={16} />
                                    <span>Hors ligne: {queueCount} en attente</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Class */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Classe
                            </label>
                            <select
                                value={selectedClassId}
                                onChange={(e) => {
                                    setSelectedClassId(e.target.value);
                                    setSelectedSubjectId('');
                                }}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg 
                                           text-sm focus:ring-2 focus:ring-primary/20 
                                           focus:border-primary bg-white"
                            >
                                <option value="">Sélectionnez une classe</option>
                                {classes.map((classItem: any) => (
                                    <option key={classItem.id} value={classItem.id}>
                                        {classItem.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Matière
                            </label>
                            <select
                                value={selectedSubjectId}
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                disabled={!selectedClassId}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg 
                                           text-sm focus:ring-2 focus:ring-primary/20 
                                           focus:border-primary bg-white
                                           disabled:bg-neutral-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Sélectionnez une matière</option>
                                {subjects.map((subject: any) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Term */}
                        <div>
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
                                        {term.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Eval Type */}
                        <div>
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
                {!selectedClassId || !selectedSubjectId || !selectedTermId ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-600">
                            Sélectionnez une classe, une matière et un trimestre pour commencer
                        </p>
                    </div>
                ) : gradesLoading ? (
                    <div className="text-center py-12">
                        <Loader2 size={32} className="animate-spin mx-auto text-primary mb-4" />
                        <p className="text-sm text-neutral-600">Chargement des notes...</p>
                    </div>
                ) : (
                    <>
                        {/* Progress bar */}
                        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm font-medium text-neutral-700">
                                        Progression: {gradedCount}/{totalStudents} saisis
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Moyenne classe: {average.toFixed(2)}/{maxScore}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">
                                        {progressPercent.toFixed(0)}%
                                    </p>
                                </div>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-3">
                                <div
                                    className="bg-primary h-3 rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <GradeEntryTable
                            students={students}
                            grades={grades}
                            maxScore={maxScore}
                            isLocked={isLocked}
                            onGradeChange={handleGradeChange}
                            onObservationChange={handleObservationChange}
                        />

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={handleSave}
                                disabled={saveMutation.isPending || isLocked}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary 
                                           text-white rounded-lg hover:bg-primary-dark 
                                           font-medium text-sm transition-colors
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saveMutation.isPending ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                Enregistrer
                            </button>

                            <button
                                onClick={handleLock}
                                disabled={isLocked || gradedCount === 0}
                                className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 
                                           text-white rounded-lg hover:bg-orange-700 
                                           font-medium text-sm transition-colors
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Lock size={16} />
                                Verrouiller notes
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Lock Modal */}
            {showLockModal && selectedClass && selectedSubject && selectedTerm && (
                <LockGradesModal
                    classId={selectedClassId}
                    className={selectedClass.name}
                    subjectId={selectedSubjectId}
                    subjectName={selectedSubject.name}
                    termId={selectedTermId}
                    evalType={selectedEvalType}
                    evalTypeLabel={selectedEvalTypeLabel}
                    gradeCount={gradedCount}
                    onClose={() => setShowLockModal(false)}
                    onSuccess={() => {
                        setShowLockModal(false);
                        setIsLocked(true);
                    }}
                />
            )}
        </div>
    );
}
