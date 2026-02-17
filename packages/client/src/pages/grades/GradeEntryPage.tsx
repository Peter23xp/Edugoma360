import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Lock, Cloud, CloudOff, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import db from '../../lib/offline/db';
import { enqueueSync } from '../../lib/offline/sync';
import { useOffline } from '../../hooks/useOffline';
import { useAuth } from '../../hooks/useAuth';
import { useSchoolStore } from '../../stores/school.store';
import { formatStudentName } from '../../lib/utils';
import toast from 'react-hot-toast';

interface GradeRow {
    studentId: string;
    studentName: string;
    score: number | null;
    saved: boolean;
    hasError: boolean;
}

export default function GradeEntryPage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { isOnline } = useOffline();
    const { activeTermId } = useSchoolStore();

    const [classId, setClassId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [evalType, setEvalType] = useState('INTERROGATION');
    const [grades, setGrades] = useState<GradeRow[]>([]);
    const [maxScore, setMaxScore] = useState(20);

    // Load classes
    const { data: classes } = useQuery({
        queryKey: ['classes-list'],
        queryFn: async () => (await api.get('/settings/classes')).data,
    });

    // Load subjects for class
    const { data: subjects } = useQuery({
        queryKey: ['subjects-for-class', classId],
        queryFn: async () => (await api.get(`/settings/subjects?classId=${classId}`)).data,
        enabled: !!classId,
    });

    // Load students + existing grades
    const { data: studentData, isLoading: loadingStudents } = useQuery({
        queryKey: ['grade-entry-students', classId, subjectId, activeTermId, evalType],
        queryFn: async () => {
            const res = await api.get(`/grades?classId=${classId}&subjectId=${subjectId}&termId=${activeTermId}&evalType=${evalType}`);
            return res.data;
        },
        enabled: !!classId && !!subjectId && !!activeTermId,
    });

    // Populate grade rows when data loads
    useEffect(() => {
        if (!studentData?.students) return;
        const rows: GradeRow[] = studentData.students.map((s: { id: string; nom: string; postNom: string; prenom?: string; score?: number }) => ({
            studentId: s.id,
            studentName: formatStudentName(s.nom, s.postNom, s.prenom),
            score: s.score ?? null,
            saved: s.score != null,
            hasError: false,
        }));
        setGrades(rows);
        if (studentData.maxScore) setMaxScore(studentData.maxScore);
    }, [studentData]);

    // Handle score change
    const handleScoreChange = useCallback((index: number, value: string) => {
        setGrades((prev) => {
            const updated = [...prev];
            const num = parseFloat(value);
            updated[index] = {
                ...updated[index],
                score: value === '' ? null : num,
                saved: false,
                hasError: !isNaN(num) && (num < 0 || num > maxScore),
            };
            return updated;
        });
    }, [maxScore]);

    // Save batch mutation
    const saveMutation = useMutation({
        mutationFn: async (items: Array<{ studentId: string; score: number }>) => {
            if (isOnline) {
                await api.post('/grades/batch', {
                    subjectId,
                    termId: activeTermId,
                    evalType,
                    grades: items,
                });
            } else {
                // Save offline
                for (const item of items) {
                    const gradeData = { studentId: item.studentId, subjectId, termId: activeTermId!, evalType, score: item.score, maxScore, createdById: user!.id };
                    await db.grades.put({ ...gradeData, syncStatus: 'PENDING', localUpdatedAt: Date.now() });
                    await enqueueSync('grade', `${item.studentId}-${subjectId}-${evalType}`, 'create', gradeData);
                }
            }
        },
        onSuccess: () => {
            toast.success(isOnline ? 'Notes enregistrées' : 'Notes sauvegardées localement');
            setGrades((prev) => prev.map((g) => ({ ...g, saved: g.score != null })));
            queryClient.invalidateQueries({ queryKey: ['grade-entry-students'] });
        },
        onError: () => toast.error('Erreur d\'enregistrement'),
    });

    const handleSave = () => {
        const toSave = grades.filter((g) => g.score != null && !g.hasError && !g.saved);
        if (toSave.length === 0) { toast('Aucune note à enregistrer'); return; }
        saveMutation.mutate(toSave.map((g) => ({ studentId: g.studentId, score: g.score! })));
    };

    // Stats
    const filledCount = grades.filter((g) => g.score != null).length;
    const avgScore = filledCount > 0 ? (grades.reduce((s, g) => s + (g.score ?? 0), 0) / filledCount).toFixed(1) : '—';
    const progress = grades.length > 0 ? Math.round((filledCount / grades.length) * 100) : 0;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-neutral-900">Saisie des notes</h1>
                <div className="flex items-center gap-1.5 text-xs">
                    {isOnline ? <Cloud size={14} className="text-success" /> : <CloudOff size={14} className="text-warning" />}
                    <span className="text-neutral-500">{isOnline ? 'Mode en ligne' : 'Mode hors-ligne'}</span>
                </div>
            </div>

            {/* Selectors */}
            <div className="bg-white rounded-xl border border-neutral-300/50 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                        <label className="input-label">Classe</label>
                        <select value={classId} onChange={(e) => { setClassId(e.target.value); setSubjectId(''); }} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white">
                            <option value="">Sélectionner...</option>
                            {classes?.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Matière</label>
                        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!classId} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white disabled:opacity-50">
                            <option value="">Sélectionner...</option>
                            {subjects?.map((s: { id: string; name: string }) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Type d'évaluation</label>
                        <select value={evalType} onChange={(e) => setEvalType(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white">
                            <option value="INTERROGATION">Interrogation</option>
                            <option value="TP">Travail Pratique</option>
                            <option value="EXAMEN_TRIMESTRIEL">Examen Trimestriel</option>
                            <option value="EXAMEN_SYNTHESE">Examen de Synthèse</option>
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Note max</label>
                        <input type="number" value={maxScore} onChange={(e) => setMaxScore(Number(e.target.value))} min={1} max={100} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {grades.length > 0 && (
                <div className="bg-white rounded-xl border border-neutral-300/50 p-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-neutral-600">{filledCount}/{grades.length} élèves saisis</span>
                        <span className="font-semibold text-primary">Moyenne provisoire : {avgScore}/{maxScore}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2.5">
                        <div className="bg-primary rounded-full h-2.5 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            {/* Grade Table */}
            {loadingStudents ? (
                <div className="animate-pulse space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-neutral-200 rounded" />)}</div>
            ) : grades.length > 0 ? (
                <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="table-header">
                                <th className="px-4 py-3 text-left w-12">#</th>
                                <th className="px-4 py-3 text-left">Élève</th>
                                <th className="px-4 py-3 text-center w-32">Note / {maxScore}</th>
                                <th className="px-4 py-3 text-center w-24">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {grades.map((grade, idx) => (
                                <tr key={grade.studentId} className={`${grade.hasError ? 'bg-danger-bg' : grade.saved ? 'bg-success-bg/30' : ''}`}>
                                    <td className="px-4 py-2 text-xs text-neutral-400">{idx + 1}</td>
                                    <td className="px-4 py-2 text-sm font-medium">{grade.studentName}</td>
                                    <td className="px-4 py-2 text-center">
                                        <input
                                            type="number"
                                            value={grade.score ?? ''}
                                            onChange={(e) => handleScoreChange(idx, e.target.value)}
                                            min={0}
                                            max={maxScore}
                                            step={0.5}
                                            className={`w-20 text-center border rounded-lg px-2 py-1.5 text-sm font-mono ${grade.hasError ? 'border-danger text-danger' : 'border-neutral-300 focus:border-primary'
                                                } outline-none`}
                                            placeholder="—"
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {grade.hasError && <AlertTriangle size={14} className="text-danger inline" />}
                                        {grade.saved && !grade.hasError && <span className="text-success text-xs">✓</span>}
                                        {!grade.saved && grade.score != null && !grade.hasError && <span className="text-warning text-xs">●</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : classId && subjectId ? (
                <p className="text-center text-neutral-500 py-8">Aucun élève trouvé dans cette classe</p>
            ) : null}

            {/* Action Buttons */}
            {grades.length > 0 && (
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium text-sm disabled:opacity-60"
                    >
                        {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Enregistrer ({grades.filter((g) => g.score != null && !g.saved && !g.hasError).length})
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100">
                        <Lock size={14} /> Verrouiller les notes
                    </button>
                </div>
            )}
        </div>
    );
}
