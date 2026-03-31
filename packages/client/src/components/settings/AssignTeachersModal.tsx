import { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertTriangle } from 'lucide-react';
import { useTeachersForDropdown, ClassAssignment } from '../../hooks/useClasses';
import api from '../../lib/api';

interface AssignTeachersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { classId: string; assignments: { subjectId: string; teacherId: string }[]; titulaireId?: string }) => Promise<void>;
    isSubmitting: boolean;
    classId: string;
    className: string;
    sectionCode: string;
}

interface SubjectRow {
    subjectId: string;
    subjectName: string;
    coefficient: number;
    teacherId: string;
}

const SELECT_CLS = 'w-full border border-neutral-300/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white';

export default function AssignTeachersModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    classId,
    className,
    sectionCode,
}: AssignTeachersModalProps) {
    const { data: teachers } = useTeachersForDropdown();
    const [rows, setRows] = useState<SubjectRow[]>([]);
    const [titulaireId, setTitulaireId] = useState('');
    const [loading, setLoading] = useState(true);

    // Load subjects for this section + existing assignments
    useEffect(() => {
        if (!isOpen || !classId) return;
        setLoading(true);

        const loadData = async () => {
            try {
                // Get section subjects
                const sectionsRes = await api.get('/sections');
                const groups: any[] = sectionsRes.data || [];
                const group = groups.find((g: any) => g.code === sectionCode);
                const subjects: any[] = group?.subjects || [];

                // Get existing assignments & titulaire
                const assignRes = await api.get(`/classes/${classId}/assignments`);
                const existing: ClassAssignment[] = assignRes.data?.assignments || [];
                setTitulaireId(assignRes.data?.titulaireId || '');

                // Build rows
                const builtRows: SubjectRow[] = subjects.map((sub: any) => {
                    const match = existing.find(a => a.subjectId === sub.id);
                    return {
                        subjectId: sub.id,
                        subjectName: sub.name,
                        coefficient: sub.coefficient || 1,
                        teacherId: match?.teacherId || '',
                    };
                });

                setRows(builtRows.sort((a, b) => b.coefficient - a.coefficient));
            } catch {
                setRows([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [isOpen, classId, sectionCode]);

    if (!isOpen) return null;

    const unassignedCount = rows.filter(r => !r.teacherId).length;

    const handleTeacherChange = (subjectId: string, teacherId: string) => {
        setRows(prev => prev.map(r => r.subjectId === subjectId ? { ...r, teacherId } : r));
    };

    const handleSubmit = async () => {
        const assignments = rows
            .filter(r => r.teacherId)
            .map(r => ({ subjectId: r.subjectId, teacherId: r.teacherId }));

        if (unassignedCount > 0) {
            const ok = window.confirm(`${unassignedCount} matière(s) non attribuée(s). Continuer quand même ?`);
            if (!ok) return;
        }

        await onSubmit({ classId, assignments, titulaireId: titulaireId || null });
        onClose();
    };

    const handleReset = () => {
        setRows(prev => prev.map(r => ({ ...r, teacherId: '' })));
    };


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col">

                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-300/50">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900">
                            Attribution enseignants — <span className="text-primary">{className}</span>
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">{rows.length} matières · {rows.length - unassignedCount} attribuées</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 size={28} className="animate-spin text-primary" />
                        <p className="text-sm text-neutral-500">Chargement des matières…</p>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4">
                            {/* Titulaire Selection */}
                            <div className="mb-6 bg-primary/5 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between border border-primary/20">
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900">👨‍🏫 Enseignant Titulaire</h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">Responsable principal de la classe</p>
                                </div>
                                <select
                                    value={titulaireId}
                                    onChange={e => setTitulaireId(e.target.value)}
                                    className={`${SELECT_CLS} sm:w-64 border-primary/30`}
                                >
                                    <option value="">— Non défini —</option>
                                    {teachers?.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.nom} {t.prenom || ''} {t.postNom || ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <hr className="mb-6 border-neutral-200" />

                            <h3 className="text-sm font-bold text-neutral-900 mb-3">ENSEIGNANTS PAR MATIÈRE ({rows.length})</h3>

                            {/* Table */}
                            <div className="border border-neutral-300/50 rounded-lg overflow-hidden">
                                {/* Table header */}
                                <div className="grid grid-cols-[2fr_0.7fr_2.5fr_0.5fr] items-center px-4 py-3 bg-neutral-100 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <div>Matière</div>
                                    <div className="text-center">Coeff</div>
                                    <div>Enseignant</div>
                                    <div className="text-center">✓</div>
                                </div>

                                {/* Rows */}
                                <div className="divide-y divide-neutral-100">
                                    {rows.map(row => (
                                        <div
                                            key={row.subjectId}
                                            className="grid grid-cols-[2fr_0.7fr_2.5fr_0.5fr] items-center px-4 py-3 text-sm hover:bg-neutral-50 transition-colors w-full sm:w-auto"
                                        >
                                            <div className="font-medium text-neutral-800">{row.subjectName}</div>
                                            <div className="text-center font-bold text-primary">{row.coefficient}</div>
                                            <div>
                                                <select
                                                    value={row.teacherId}
                                                    onChange={e => handleTeacherChange(row.subjectId, e.target.value)}
                                                    className={SELECT_CLS}
                                                >
                                                    <option value="">— Non attribué —</option>
                                                    {teachers?.map(t => (
                                                        <option key={t.id} value={t.id}>
                                                            {t.nom} {t.prenom || ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="text-center">
                                                {row.teacherId ? (
                                                    <span className="text-primary font-bold">✅</span>
                                                ) : (
                                                    <span className="text-error font-bold">❌</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Warning */}
                            {unassignedCount > 0 && (
                                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-warning bg-warning-light px-4 py-3 rounded-lg border border-warning/20">
                                    <AlertTriangle size={16} />
                                    {unassignedCount} matière{unassignedCount > 1 ? 's' : ''} non attribuée{unassignedCount > 1 ? 's' : ''}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-neutral-300/50 px-6 py-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                            >
                                Réinitialiser
                            </button>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 text-sm font-medium text-neutral-700 bg-white border border-neutral-300/50 rounded-md hover:bg-neutral-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm w-full sm:w-auto"
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
