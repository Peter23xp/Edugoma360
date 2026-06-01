import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Loader2 } from 'lucide-react';
import type {
    TimetablePeriod,
    TimetableConflict,
    DayOfWeek,
} from '@edugoma360/shared';

// ─── Types locaux ────────────────────────────────────────────────────────────

interface TeacherOption {
    id: string;
    nom: string;
    prenom?: string | null;
}

interface SubjectOption {
    id: string;
    name: string;
    abbreviation: string;
}

interface ClassOption {
    id: string;
    name: string;
    sectionName: string;
}

interface PeriodFormModalProps {
    /** Période existante en édition — null pour création */
    period?: TimetablePeriod | null;
    /** Jour et numéro de période pré-sélectionnés (clic sur cellule vide) */
    dayOfWeek: DayOfWeek;
    periodNumber: number;
    /** Données pour les selects */
    classes: ClassOption[];
    subjects: SubjectOption[];
    teachers: TeacherOption[];
    /** Conflits détectés avant soumission */
    conflicts?: TimetableConflict[];
    /** Callbacks */
    onSave: (payload: {
        classId: string;
        subjectId: string;
        teacherId: string;
        dayOfWeek: DayOfWeek;
        periodNumber: number;
        academicYearId: string;
    }) => void;
    onDelete?: (periodId: string) => void;
    onCheckConflicts?: (payload: {
        teacherId: string;
        classId: string;
        dayOfWeek: DayOfWeek;
        periodNumber: number;
        excludePeriodId?: string;
    }) => Promise<TimetableConflict[]>;
    onClose: () => void;
    isLoading?: boolean;
    academicYearId: string;
}

// ─── Libellés jour / créneau ─────────────────────────────────────────────────

const DAY_LABELS: Record<DayOfWeek, string> = {
    MONDAY: 'Lundi',
    TUESDAY: 'Mardi',
    WEDNESDAY: 'Mercredi',
    THURSDAY: 'Jeudi',
    FRIDAY: 'Vendredi',
};

const PERIOD_TIMES: Record<number, string> = {
    1: '07:30 "" 08:30',
    2: '08:30 "" 09:30',
    3: '10:00 "" 11:00',
    4: '11:00 "" 12:00',
    5: '13:00 "" 14:00',
    6: '14:00 "" 15:00',
    7: '15:00 "" 16:00',
    8: '16:00 "" 17:00',
};

// ─── Composant ────────────────────────────────────────────────────────────────

export default function PeriodFormModal({
    period,
    dayOfWeek,
    periodNumber,
    classes,
    subjects,
    teachers,
    onSave,
    onDelete,
    onCheckConflicts,
    onClose,
    isLoading = false,
    academicYearId,
}: PeriodFormModalProps) {
    const isEditing = !!period;

    // ── Champs du formulaire ──
    const [classId, setClassId] = useState(period?.classId ?? '');
    const [subjectId, setSubjectId] = useState(period?.subjectId ?? '');
    const [teacherId, setTeacherId] = useState(period?.teacherId ?? '');

    // ── Vérification conflits ──
    const [detectedConflicts, setDetectedConflicts] = useState<TimetableConflict[]>([]);
    const [checkingConflicts, setCheckingConflicts] = useState(false);

    const isFormValid = !!classId && !!subjectId && !!teacherId;

    // Vérification automatique des conflits dès que les 3 champs sont remplis
    useEffect(() => {
        if (!isFormValid || !onCheckConflicts) return;

        const timer = setTimeout(async () => {
            setCheckingConflicts(true);
            try {
                const result = await onCheckConflicts({
                    teacherId,
                    classId,
                    dayOfWeek,
                    periodNumber,
                    excludePeriodId: period?.id,
                });
                setDetectedConflicts(result);
            } finally {
                setCheckingConflicts(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [teacherId, classId, subjectId, dayOfWeek, periodNumber, isFormValid, onCheckConflicts, period?.id]);

    const hasBlockingConflicts = detectedConflicts.length > 0;

    const handleSave = () => {
        if (!isFormValid || hasBlockingConflicts) return;
        onSave({ classId, subjectId, teacherId, dayOfWeek, periodNumber, academicYearId });
    };

    const handleDelete = () => {
        if (period?.id && onDelete) {
            onDelete(period.id);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F1E12]/45 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-neutral-200 flex flex-col">

                {/* ── En-tête ── */}
                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-bold text-neutral-900">
                            {isEditing ? 'Modifier le cours' : 'Ajouter un cours'}
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            {DAY_LABELS[dayOfWeek]} · Période {periodNumber}
                            {PERIOD_TIMES[periodNumber] && (
                                <span className="ml-1 text-neutral-400">
                                    ({PERIOD_TIMES[periodNumber]})
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 text-neutral-400 rounded-lg transition-colors"
                        aria-label="Fermer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Corps ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* Classe */}
                    <div className="space-y-1.5">
                        <label htmlFor="pm-class" className="block text-xs font-semibold text-neutral-600 mb-1.5">
                            Classe <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="pm-class"
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900
                                       focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        >
                            <option value="">Sélectionnez une classe</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} — {c.sectionName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Matière */}
                    <div className="space-y-1.5">
                        <label htmlFor="pm-subject" className="block text-xs font-semibold text-neutral-600 mb-1.5">
                            Matière <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="pm-subject"
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900
                                       focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        >
                            <option value="">Sélectionnez une matière</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.abbreviation})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Enseignant */}
                    <div className="space-y-1.5">
                        <label htmlFor="pm-teacher" className="block text-xs font-semibold text-neutral-600 mb-1.5">
                            Enseignant <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="pm-teacher"
                            value={teacherId}
                            onChange={(e) => setTeacherId(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900
                                       focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        >
                            <option value="">Sélectionnez un enseignant</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nom} {t.prenom ?? ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ── Indicateur vérification conflits ── */}
                    {isFormValid && checkingConflicts && (
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <Loader2 size={14} className="animate-spin" />
                            Vérification des conflits…
                        </div>
                    )}

                    {/* ── Conflits détectés ── */}
                    {!checkingConflicts && hasBlockingConflicts && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                                <AlertTriangle size={16} />
                                Conflits détectés — impossible d'enregistrer
                            </div>
                            <ul className="space-y-1">
                                {detectedConflicts.map((c, i) => (
                                    <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                                        <span className="mt-0.5 shrink-0">•</span>
                                        <span>
                                            <strong>
                                                {c.type === 'teacher' ? 'Enseignant' : 'Classe'}
                                            </strong>{' '}
                                            {c.message}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* ── Aucun conflit ── */}
                    {!checkingConflicts && isFormValid && !hasBlockingConflicts && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            Aucun conflit détecté
                        </div>
                    )}
                </div>

                {/* ── Pied de modal ── */}
                <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
                    {/* Supprimer (édition uniquement) */}
                    {isEditing && onDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="px-4 h-10 text-sm font-medium bg-error text-white
                                       rounded-lg hover:bg-error-hover transition-colors
                                       disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Supprimer
                        </button>
                    )}

                    <div className="flex-1" />

                    <button
                        onClick={onClose}
                        className="px-4 h-10 text-sm font-medium border border-neutral-300 text-neutral-700
                                   rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        Annuler
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!isFormValid || hasBlockingConflicts || isLoading || checkingConflicts}
                        className="flex items-center gap-2 px-5 h-10 text-sm font-medium text-white
                                   bg-primary rounded-lg hover:bg-primary-hover transition-colors
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <Save size={15} />
                        )}
                        {isLoading ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
