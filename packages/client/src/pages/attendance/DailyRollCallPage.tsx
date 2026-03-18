/**
 * DailyRollCallPage — Route: /attendance/roll-call
 * Écran d'appel quotidien — EduGoma 360
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarCheck,
    Save,
    Loader2,
    Wifi,
    WifiOff,
    Lock,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useClassesList } from '../../hooks/useClassesList';
import { useOffline } from '../../hooks/useOffline';
import {
    useDailyAttendance,
    useSaveAttendance,
    type AttendanceStatus,
    type StudentAttendanceEntry,
} from '../../hooks/useAttendance';
import { getPendingRollCallCount } from '../../lib/offline/attendanceQueue';
import { cn } from '../../lib/utils';

import ClassSelector from '../../components/attendance/ClassSelector';
import QuickStats from '../../components/attendance/QuickStats';
import AttendanceGrid from '../../components/attendance/AttendanceGrid';
import type { RollCallPeriod } from '../../lib/offline/attendanceQueue';

// ── Helper: derive default period from current time ───────────────────────────
function defaultPeriod(): RollCallPeriod {
    const h = new Date().getHours();
    if (h < 13) return 'MATIN';
    if (h < 17) return 'APRES_MIDI';
    return 'SOIR';
}

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

// ── Remark Modal ─────────────────────────────────────────────────────────────

interface RemarkState {
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
    remark: string;
    arrivalTime: string;
    isJustified: boolean;
}

interface RemarkModalProps {
    state: RemarkState;
    onSave: (data: Omit<RemarkState, 'studentId' | 'studentName'>) => void;
    onClose: () => void;
}

function RemarkModal({ state, onSave, onClose }: RemarkModalProps) {
    const [remark, setRemark] = useState(state.remark);
    const [arrivalTime, setArrivalTime] = useState(state.arrivalTime);
    const [isJustified, setIsJustified] = useState(state.isJustified);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50">
                    <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Remarque</p>
                        <h3 className="text-base font-bold text-neutral-900 truncate">{state.studentName}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-neutral-200 transition-colors text-neutral-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Justification toggle */}
                    <fieldset>
                        <legend className="input-label mb-2">Type d'absence / retard</legend>
                        <div className="space-y-2">
                            {[
                                { label: state.status === 'ABSENT' ? 'Absence justifiée' : 'Retard justifié', value: true },
                                { label: state.status === 'ABSENT' ? 'Absence non justifiée' : 'Retard non justifié', value: false },
                            ].map(({ label, value }) => (
                                <label
                                    key={String(value)}
                                    className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                                >
                                    <input
                                        type="radio"
                                        name="justified"
                                        checked={isJustified === value}
                                        onChange={() => setIsJustified(value)}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm text-neutral-800">{label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {/* Motif */}
                    <div>
                        <label className="input-label">Motif (optionnel)</label>
                        <textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            rows={2}
                            placeholder="Ex: Certificat médical, convocation familiale…"
                            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                        />
                    </div>

                    {/* Arrival time (if RETARD) */}
                    {state.status === 'RETARD' && (
                        <div>
                            <label className="input-label">Heure d'arrivée</label>
                            <input
                                type="time"
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-36"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={() => onSave({ remark, arrivalTime, isJustified, status: state.status })}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Confirmation Modal for unset students ─────────────────────────────────────

interface ConfirmModalProps {
    count: number;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmUnsetModal({ count, onConfirm, onCancel }: ConfirmModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-base font-bold text-neutral-900">Élèves sans statut</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                        <strong>{count}</strong> élève{count > 1 ? 's' : ''} n'ont pas de statut assigné.
                        <br />Les marquer comme <strong>absents</strong> ?
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                        Non, revenir
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
                    >
                        Oui, marquer absents
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Row local state ───────────────────────────────────────────────────────────

interface LocalRow {
    studentId: string;
    student: StudentAttendanceEntry['student'];
    status?: AttendanceStatus;
    remark: string;
    arrivalTime: string;
    isJustified: boolean;
    changed: boolean;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DailyRollCallPage() {
    const navigate = useNavigate();
    const { isOnline, pendingCount } = useOffline();

    // ── Filters state
    const [classId, setClassId] = useState('');
    const [date, setDate] = useState(todayISO());
    const [period, setPeriod] = useState<RollCallPeriod>(defaultPeriod());

    // ── Local rows
    const [rows, setRows] = useState<LocalRow[]>([]);
    const [selectedIdx, setSelectedIdx] = useState(0);

    // ── Modal state
    const [remarkModal, setRemarkModal] = useState<RemarkState | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingRollCallCount, setPendingRollCallCount] = useState(0);

    // ── Data
    const { data: classes = [] } = useClassesList();
    const { data: attendanceData, isLoading, isFetching } = useDailyAttendance(classId, date, period);
    const saveMutation = useSaveAttendance();

    // Track pending offline count
    useEffect(() => {
        getPendingRollCallCount().then(setPendingRollCallCount);
    }, [pendingCount]);

    // Populate rows when API data arrives
    useEffect(() => {
        if (!attendanceData?.students) return;
        setRows(
            attendanceData.students.map((entry) => ({
                studentId: entry.studentId,
                student: entry.student,
                status: entry.status,
                remark: entry.remark ?? '',
                arrivalTime: entry.arrivalTime ?? '',
                isJustified: entry.isJustified,
                changed: false,
            }))
        );
        setSelectedIdx(0);
    }, [attendanceData]);

    // ── Computed stats
    const stats = {
        total: rows.length,
        present: rows.filter((r) => r.status === 'PRESENT').length,
        absent: rows.filter((r) => r.status === 'ABSENT').length,
        late: rows.filter((r) => r.status === 'RETARD').length,
    };
    const hasChanges = rows.some((r) => r.changed);
    const isLocked = attendanceData?.isLocked ?? false;

    // ── Status change handler
    const handleStatusChange = useCallback((studentId: string, status: AttendanceStatus) => {
        setRows((prev) =>
            prev.map((r) =>
                r.studentId === studentId ? { ...r, status, changed: true } : r
            )
        );
    }, []);

    // ── Mark all
    const handleMarkAll = useCallback((status: AttendanceStatus) => {
        setRows((prev) => prev.map((r) => ({ ...r, status, changed: true })));
    }, []);

    // ── Remark modal
    const handleOpenRemark = useCallback((studentId: string) => {
        const row = rows.find((r) => r.studentId === studentId);
        if (!row || !row.status) return;
        setRemarkModal({
            studentId,
            studentName: `${row.student.nom} ${row.student.postNom}`,
            status: row.status,
            remark: row.remark,
            arrivalTime: row.arrivalTime,
            isJustified: row.isJustified,
        });
    }, [rows]);

    const handleSaveRemark = useCallback((data: Omit<RemarkState, 'studentId' | 'studentName'>) => {
        if (!remarkModal) return;
        setRows((prev) =>
            prev.map((r) =>
                r.studentId === remarkModal.studentId
                    ? { ...r, remark: data.remark, arrivalTime: data.arrivalTime, isJustified: data.isJustified, changed: true }
                    : r
            )
        );
        setRemarkModal(null);
    }, [remarkModal]);

    // ── Save logic (must be before keyboard effect)
    const doSave = useCallback(async (andClose: boolean) => {
        const finalRows = rows.map((r) => ({
            ...r,
            status: r.status ?? 'ABSENT',
        }));

        await saveMutation.mutateAsync({
            classId,
            date,
            period,
            records: finalRows.map((r) => ({
                studentId: r.studentId,
                status: r.status as any,
                remark: r.remark || undefined,
                arrivalTime: r.arrivalTime || undefined,
                isJustified: r.isJustified,
            })),
        });

        // Alert if high absence rate
        const absPct = finalRows.filter((r) => r.status === 'ABSENT').length / (finalRows.length || 1);
        if (absPct >= 0.2) {
            toast(
                `⚠ Taux d'absence élevé (${Math.round(absPct * 100)}%). Le Préfet sera notifié.`,
                { icon: '⚠️', style: { background: '#fff3cd', color: '#856404' }, duration: 6000 }
            );
        }

        if (andClose) navigate('/attendance');
    }, [rows, classId, date, period, saveMutation, navigate]);

    const handleSave = useCallback(async (andClose: boolean) => {
        const unset = rows.filter((r) => !r.status).length;
        if (unset > 0) {
            setShowConfirmModal(true);
            return;
        }
        await doSave(andClose);
    }, [rows, doSave]);

    const handleConfirmUnset = useCallback(async () => {
        setShowConfirmModal(false);
        // Mark all without status as absent
        setRows((prev) => prev.map((r) => (r.status ? r : { ...r, status: 'ABSENT' as const, changed: true })));
        // Small delay for state to apply
        setTimeout(() => doSave(false), 50);
    }, [doSave]);

    // ── Keyboard shortcuts
    const tableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            // Ignore when typing in inputs
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

            const selectedRow = rows[selectedIdx];
            if (!selectedRow) return;

            switch (e.key) {
                case 'p':
                case 'P':
                    e.preventDefault();
                    handleStatusChange(selectedRow.studentId, 'PRESENT');
                    break;
                case 'a':
                case 'A':
                    e.preventDefault();
                    handleStatusChange(selectedRow.studentId, 'ABSENT');
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    handleStatusChange(selectedRow.studentId, 'RETARD');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIdx((prev) => Math.min(prev + 1, rows.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIdx((prev) => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    handleStatusChange(selectedRow.studentId, 'PRESENT');
                    setSelectedIdx((prev) => Math.min(prev + 1, rows.length - 1));
                    break;
            }

            // Ctrl+S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasChanges) handleSave(false);
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [rows, selectedIdx, hasChanges, handleStatusChange, handleSave]);

    // ── Scroll selected row into view
    useEffect(() => {
        const el = document.getElementById(`row-${rows[selectedIdx]?.studentId}`);
        el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [selectedIdx]);

    // ── Resolved class info

    const selectedClass = classes.find((c: any) => c.id === classId);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5 pb-10" ref={tableRef}>
            {/* ── Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CalendarCheck size={20} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-neutral-900 leading-tight">
                            Appel Quotidien
                        </h1>
                        <p className="text-xs text-neutral-500">
                            {selectedClass ? `📚 ${(selectedClass as any).name}` : 'Sélectionnez une classe'}
                        </p>
                    </div>
                </div>

                {/* Connection badge */}
                <div className="flex items-center gap-2">
                    {isOnline ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <Wifi size={12} />
                            Connecté
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                            <WifiOff size={12} />
                            Hors ligne
                            {pendingRollCallCount > 0 && ` · ${pendingRollCallCount} en attente`}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Locked banner */}
            {isLocked && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                    <Lock size={16} />
                    <span className="font-semibold">Appel verrouillé par le Préfet.</span>
                    <span className="text-amber-700 text-xs">Lecture seule activée.</span>
                </div>
            )}

            {/* ── Filters bar */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm">
                {/* Class selector */}
                <ClassSelector
                    classes={classes as any}
                    value={classId}
                    onChange={setClassId}
                    disabled={saveMutation.isPending}
                />

                {/* Date picker */}
                <div className="flex flex-col gap-1">
                    <label className="input-label" htmlFor="datePicker">Date</label>
                    <input
                        id="datePicker"
                        type="date"
                        value={date}
                        max={todayISO()}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={saveMutation.isPending}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
                    />
                </div>

                {/* Period radio */}
                <div className="flex flex-col gap-1">
                    <span className="input-label">Période</span>
                    <div className="flex gap-2 flex-wrap">
                        {(['MATIN', 'APRES_MIDI', 'SOIR'] as RollCallPeriod[]).map((p) => (
                            <label
                                key={p}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all',
                                    period === p
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary/50'
                                )}
                            >
                                <input
                                    type="radio"
                                    name="period"
                                    value={p}
                                    checked={period === p}
                                    onChange={() => setPeriod(p)}
                                    className="sr-only"
                                />
                                {p === 'MATIN' ? '🌅 Matin' : p === 'APRES_MIDI' ? '☀️ Après-midi' : '🌙 Soir'}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Stats */}
            {rows.length > 0 && (
                <QuickStats
                    total={stats.total}
                    present={stats.present}
                    absent={stats.absent}
                    late={stats.late}
                />
            )}

            {/* ── Keyboard hint */}
            {rows.length > 0 && (
                <div className="hidden md:flex items-center gap-4 text-xs text-neutral-400 px-1">
                    <span>⌨️ Raccourcis :</span>
                    <span className="bg-neutral-100 px-2 py-0.5 rounded font-mono">P</span> Présent
                    <span className="bg-neutral-100 px-2 py-0.5 rounded font-mono">A</span> Absent
                    <span className="bg-neutral-100 px-2 py-0.5 rounded font-mono">R</span> Retard
                    <span className="bg-neutral-100 px-2 py-0.5 rounded font-mono">↑↓</span> Naviguer
                    <span className="bg-neutral-100 px-2 py-0.5 rounded font-mono">Ctrl+S</span> Enregistrer
                </div>
            )}

            {/* ── Student grid */}
            {isLoading || isFetching ? (
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                    <div className="animate-pulse p-4 space-y-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-12 bg-neutral-100 rounded-lg" />
                        ))}
                    </div>
                </div>
            ) : rows.length > 0 ? (
                <AttendanceGrid
                    rows={rows as any}
                    selectedIndex={selectedIdx}
                    isLocked={isLocked}
                    onStatusChange={handleStatusChange}
                    onAddRemark={handleOpenRemark}
                    onMarkAll={handleMarkAll}
                />
            ) : classId ? (
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm py-16 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-neutral-500 font-medium">Aucun élève trouvé pour cette classe</p>
                    <p className="text-xs text-neutral-400 mt-1">Vérifiez les inscriptions de l'année scolaire active</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm py-16 text-center">
                    <div className="text-4xl mb-3">🏫</div>
                    <p className="text-neutral-500 font-medium">Sélectionnez une classe pour commencer l'appel</p>
                </div>
            )}

            {/* ── Bottom action bar */}
            {rows.length > 0 && !isLocked && (
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-lg px-4 py-3 flex flex-wrap items-center gap-3 sm:static sm:rounded-xl sm:border sm:shadow-sm sm:z-auto">
                    {/* Nav arrows */}
                    <button
                        type="button"
                        onClick={() => setSelectedIdx((p) => Math.max(p - 1, 0))}
                        disabled={selectedIdx === 0}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                    >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Précédent</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedIdx((p) => Math.min(p + 1, rows.length - 1))}
                        disabled={selectedIdx >= rows.length - 1}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                    >
                        <span className="hidden sm:inline">Suivant</span>
                        <ChevronRight size={16} />
                    </button>

                    <div className="flex-1" />

                    {/* Save */}
                    <button
                        type="button"
                        id="btn-save"
                        onClick={() => handleSave(false)}
                        disabled={!hasChanges || saveMutation.isPending}
                        className={cn(
                            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all',
                            hasChanges && !saveMutation.isPending
                                ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        )}
                    >
                        {saveMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        Enregistrer
                    </button>

                    {/* Save & Close */}
                    <button
                        type="button"
                        id="btn-save-close"
                        onClick={() => handleSave(true)}
                        disabled={!hasChanges || saveMutation.isPending}
                        className={cn(
                            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border',
                            hasChanges && !saveMutation.isPending
                                ? 'bg-white border-primary text-primary hover:bg-primary/5'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed'
                        )}
                    >
                        Enregistrer & Fermer
                    </button>
                </div>
            )}

            {/* ── Remark Modal */}
            {remarkModal && (
                <RemarkModal
                    state={remarkModal}
                    onSave={handleSaveRemark}
                    onClose={() => setRemarkModal(null)}
                />
            )}

            {/* ── Confirm unset modal */}
            {showConfirmModal && (
                <ConfirmUnsetModal
                    count={rows.filter((r) => !r.status).length}
                    onConfirm={handleConfirmUnset}
                    onCancel={() => setShowConfirmModal(false)}
                />
            )}
        </div>
    );
}
