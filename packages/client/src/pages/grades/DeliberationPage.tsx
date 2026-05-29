import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ClipboardList, CheckCircle, AlertTriangle, Loader2,
    FileText, ChevronRight, Lock, Calculator, Award, ChevronLeft,
    Download, BookOpen, Trophy, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { openPdfFromApi } from '../../lib/downloadPdf';
import { normalize } from '../../lib/apiNormalize';
import { useClassesList } from '../../hooks/useClassesList';
import { DelibDecision, suggestDelibDecision, DELIB_DECISIONS } from '@edugoma360/shared';
import DecisionSelector from '../../components/academic/DecisionSelector';
import DeliberationSummary from '../../components/academic/DeliberationSummary';

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = [
    { number: 1, label: 'Sélection',    icon: ClipboardList },
    { number: 2, label: 'Vérification', icon: CheckCircle },
    { number: 3, label: 'Moyennes',     icon: Calculator },
    { number: 4, label: 'Décisions',    icon: Award },
    { number: 5, label: 'Validation',   icon: FileText },
    { number: 6, label: 'Résultats',    icon: Trophy },
];

function StepBar({ current }: { current: number }) {
    return (
        <div className="bg-white border-b border-neutral-200 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                {STEPS.map((step, i) => {
                    const done    = step.number < current;
                    const active  = step.number === current;
                    const Icon    = step.icon;
                    return (
                        <div key={step.number} className="flex items-center flex-1">
                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all
                                    ${done   ? 'bg-[#1B5E20] text-white'
                                    : active ? 'bg-[#1B5E20] text-white ring-4 ring-[#1B5E20]/20'
                                             : 'bg-neutral-100 text-neutral-400'}`}>
                                    {done ? <CheckCircle size={16} /> : <Icon size={16} />}
                                </div>
                                <span className={`text-xs font-medium hidden sm:block ${active ? 'text-[#1B5E20]' : done ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 transition-colors ${done ? 'bg-[#1B5E20]' : 'bg-neutral-200'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Bulletin job status poller ────────────────────────────────────────────────
function BulletinJobStatus({ jobId, deliberationId }: { jobId: string; deliberationId: string }) {
    const { data: job } = useQuery({
        queryKey: ['bulletin-job', jobId],
        queryFn: async () => {
            const { data } = await api.get(`/deliberation/bulletin-job/${jobId}`);
            return data;
        },
        refetchInterval: (query) => {
            const d = query.state.data as any;
            if (!d || d.status === 'PENDING' || d.status === 'PROCESSING') return 2000;
            return false;
        },
    });

    if (!job) return <div className="flex items-center gap-2 text-xs text-neutral-400 py-2"><Loader2 size={12} className="animate-spin" /> Chargement…</div>;

    const progress = job.totalStudents > 0 ? Math.round((job.processed / job.totalStudents) * 100) : 0;
    const done = job.status === 'COMPLETED';
    const failed = job.status === 'FAILED';

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-600">
                <span>{done ? 'Bulletins prêts' : failed ? 'Échec génération' : `Génération… ${progress}%`}</span>
                <span className="text-neutral-400">{job.processed}/{job.totalStudents}</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-1.5">
                <div
                    className={`h-1.5 rounded-full transition-all ${done ? 'bg-green-500' : failed ? 'bg-red-500' : 'bg-[#1B5E20]'}`}
                    style={{ width: `${done ? 100 : progress}%` }}
                />
            </div>
            {done && (
                <a
                    href={`/api/deliberation/${deliberationId}/bulletins`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1B5E20] rounded-lg hover:bg-[#2E7D32] transition-colors"
                >
                    <Download size={14} /> Télécharger les bulletins
                </a>
            )}
        </div>
    );
}

// ── Check item ────────────────────────────────────────────────────────────────
function CheckItem({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? 'bg-green-600' : 'bg-red-500'}`}>
                {ok ? <CheckCircle size={14} className="text-white" /> : <AlertTriangle size={14} className="text-white" />}
            </div>
            <div>
                <p className="text-sm font-semibold text-neutral-900">{label}</p>
                {detail && <p className="text-xs text-neutral-500 mt-0.5">{detail}</p>}
            </div>
        </div>
    );
}

// ── Decision badge ────────────────────────────────────────────────────────────
const DECISION_STYLES: Record<string, string> = {
    GREAT_DISTINCTION: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    DISTINCTION:       'bg-green-100 text-[#1B5E20] border-green-300',
    ADMITTED:          'bg-blue-50 text-[#0D47A1] border-blue-200',
    ADJOURNED:         'bg-orange-100 text-orange-800 border-orange-300',
    FAILED:            'bg-red-100 text-red-800 border-red-300',
    MEDICAL:           'bg-sky-100 text-sky-800 border-sky-300',
    EXCLUDED_DEBT:     'bg-gray-100 text-gray-700 border-gray-300',
};

function DecisionBadge({ decision }: { decision: string }) {
    const label = (DELIB_DECISIONS as any)[decision]?.label ?? decision;
    const style = DECISION_STYLES[decision] ?? 'bg-gray-100 text-gray-700 border-gray-300';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
            {label}
        </span>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DeliberationPage() {
    const queryClient = useQueryClient();
    const [step, setStep]               = useState(1);
    const [classId, setClassId]         = useState('');
    const [termId, setTermId]           = useState('');
    const [decisions, setDecisions]     = useState<Record<string, { decision: DelibDecision; justification: string }>>({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [validationResult, setValidationResult] = useState<{ deliberationId: string; pvUrl: string | null; bulletinBatchJobId: string | null } | null>(null);

    // ── Data ──────────────────────────────────────────────────────────────────
    const { data: classes = [] } = useClassesList();

    const { data: termsRaw } = useQuery({
        queryKey: ['terms'],
        queryFn: async () => {
            const { data } = await api.get('/settings/terms');
            return { terms: normalize.terms(data) };
        },
    });
    const terms: any[] = Array.isArray(termsRaw) ? termsRaw : (termsRaw as any)?.terms ?? [];

    const { data: delib, isLoading: loadingDelib } = useQuery({
        queryKey: ['deliberation-data', classId, termId],
        queryFn: async () => {
            const { data } = await api.get(`/deliberation/${classId}/${termId}`);
            return data;
        },
        enabled: !!classId && !!termId,
    });

    // Initialiser les décisions depuis les suggestions
    useEffect(() => {
        if (delib?.students && Object.keys(decisions).length === 0) {
            const init: Record<string, { decision: DelibDecision; justification: string }> = {};
            delib.students.forEach((s: any) => {
                init[s.studentId] = {
                    decision: suggestDelibDecision(s.generalAverage, s.hasEliminatoryFailure) as DelibDecision,
                    justification: '',
                };
            });
            setDecisions(init);
        }
    }, [delib]);

    // ── Validate mutation ─────────────────────────────────────────────────────
    const validateMutation = useMutation({
        mutationFn: async () => {
            const decisionsArray = Object.entries(decisions).map(([studentId, d]) => ({
                studentId, decision: d.decision, justification: d.justification || undefined,
            }));
            const { data } = await api.post(`/deliberation/${classId}/${termId}/validate`, { decisions: decisionsArray });
            return data;
        },
        onSuccess: (data) => {
            toast.success('Délibération validée avec succès');
            setShowConfirm(false);
            setValidationResult(data);
            setStep(6);
        },
        onError: (e: any) => {
            const code = e?.response?.data?.error?.code;
            if (code === 'DELIBERATION_ALREADY_VALIDATED') {
                toast('Cette délibération a déjà été validée.', { icon: 'ℹ️' });
                setShowConfirm(false);
                queryClient.invalidateQueries({ queryKey: ['deliberation', classId, termId] });
            } else {
                toast.error(e?.response?.data?.error?.message || e?.response?.data?.message || 'Erreur lors de la validation');
            }
        },
    });

    // ── Derived ───────────────────────────────────────────────────────────────
    const students     = delib?.students ?? [];
    const classData    = delib?.class;
    const termData     = delib?.term;
    const prefetName   = delib?.prefetName ?? 'Préfet';
    const verification = delib?.verification ?? {};

    const selectedClass = (classes as any[]).find((c: any) => c.id === classId);
    const selectedTerm  = (terms as any[]).find((t: any) => t.id === termId);

    const canGoToStep2 = !!classId && !!termId;
    const canGoToStep3 = verification.allGradesEntered;
    const canGoToStep5 = Object.entries(decisions).every(([sid, d]) => {
        const s = students.find((st: any) => st.studentId === sid);
        if (!s) return true;
        const sug = suggestDelibDecision(s.generalAverage, s.hasEliminatoryFailure) as DelibDecision;
        return d.decision === sug || d.justification.trim().length > 0;
    });

    const suggestions: Record<string, DelibDecision> = {};
    students.forEach((s: any) => {
        suggestions[s.studentId] = suggestDelibDecision(s.generalAverage, s.hasEliminatoryFailure) as DelibDecision;
    });

    // ── Handlers ──────────────────────────────────────────────────────────────
    const goNext = () => {
        if (step === 1 && !canGoToStep2) { toast.error('Sélectionnez une classe et un trimestre'); return; }
        if (step === 1) { setDecisions({}); }
        if (step === 2 && !canGoToStep3 && !loadingDelib) {
            toast.error(`Notes d'examen incomplètes : ${verification.studentsWithExam ?? 0}/${verification.totalStudents ?? 0} élèves prêts`);
            return;
        }
        if (step === 4 && !canGoToStep5) { toast.error('Justifiez toutes les décisions modifiées'); return; }
        setStep(s => Math.min(s + 1, 6));
    };

    const goPrev = () => setStep(s => Math.max(s - 1, 1));

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Page header */}
            <div className="bg-white border-b border-neutral-200 px-6 py-5">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <ClipboardList className="text-[#1B5E20]" size={26} />
                        Délibération
                    </h1>
                    {classData && termData && (
                        <p className="text-sm text-neutral-500 mt-1">
                            {classData.name} &mdash; {termData.label} &mdash; {delib?.academicYear?.label}
                        </p>
                    )}
                </div>
            </div>

            {/* Step bar */}
            <StepBar current={step} />

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* ── ÉTAPE 1 : Sélection ──────────────────────────────────── */}
                {step === 1 && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5">
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 mb-1">Sélection de la classe</h2>
                            <p className="text-sm text-neutral-500">Choisissez la classe et le trimestre à délibérer</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Classe *</label>
                                <select
                                    value={classId}
                                    onChange={e => { setClassId(e.target.value); setDecisions({}); }}
                                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                                >
                                    <option value="">Sélectionner une classe...</option>
                                    {(classes as any[]).map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Trimestre *</label>
                                <select
                                    value={termId}
                                    onChange={e => { setTermId(e.target.value); setDecisions({}); }}
                                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                                >
                                    <option value="">Sélectionner un trimestre...</option>
                                    {(terms as any[]).map((t: any) => (
                                        <option key={t.id} value={t.id}>
                                            {t.label || t.name || `Trimestre ${t.number}`}
                                            {t.isActive ? ' (actif)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {classId && termId && (
                            <div className="bg-[#E8F5E9] border border-[#1B5E20]/20 rounded-xl p-4 flex items-center gap-3">
                                <CheckCircle size={18} className="text-[#1B5E20] flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-[#1B5E20]">
                                        {selectedClass?.name} &mdash; {selectedTerm?.label || selectedTerm?.name}
                                    </p>
                                    <p className="text-xs text-[#1B5E20]/70">Prêt à charger les données</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ÉTAPE 2 : Vérification ───────────────────────────────── */}
                {step === 2 && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5">
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 mb-1">Vérification des prérequis</h2>
                            <p className="text-sm text-neutral-500">Tous les prérequis doivent être validés avant de continuer</p>
                        </div>

                        {loadingDelib ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 size={32} className="animate-spin text-[#1B5E20]" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <CheckItem
                                    ok={!!verification.allGradesEntered}
                                    label="Notes d'examen complètes"
                                    detail={`${verification.studentsWithExam ?? 0} / ${verification.totalStudents ?? 0} élèves ont toutes leurs notes d'examen`}
                                />
                                <CheckItem
                                    ok={!!verification.allGradesLocked}
                                    label="Notes verrouillées"
                                    detail={`${verification.lockedCount ?? 0} / ${verification.totalGrades ?? 0} notes verrouillées${!verification.allGradesLocked ? ' (recommandé mais non bloquant)' : ''}`}
                                />

                                {verification.alreadyValidated && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl border bg-blue-50 border-blue-200">
                                        <CheckCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900">
                                                Délibération déjà validée pour cette classe et ce trimestre
                                            </p>
                                            <p className="text-xs text-blue-700 mt-0.5">
                                                Consultez l'historique pour voir les résultats.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {verification.eliminatoryCount > 0 && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl border bg-orange-50 border-orange-200">
                                        <AlertTriangle size={18} className="text-orange-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-orange-900">
                                                {verification.eliminatoryCount} élève(s) avec matière éliminatoire échouée
                                            </p>
                                            <p className="text-xs text-orange-700 mt-0.5">
                                                Ces élèves recevront automatiquement la décision «&nbsp;Refusé(e)&nbsp;»
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {!canGoToStep3 && !verification.alreadyValidated && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl border bg-amber-50 border-amber-200">
                                        <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-amber-800">
                                            Les notes d'examen ne sont pas complètes pour au moins 80% des élèves.
                                            Allez dans <strong>Saisie des notes</strong> pour compléter les examens.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ÉTAPE 3 : Moyennes ───────────────────────────────────── */}
                {step === 3 && (
                    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                        <div className="p-5 border-b border-neutral-100">
                            <h2 className="text-lg font-bold text-neutral-900">Moyennes calculées</h2>
                            <p className="text-sm text-neutral-500 mt-0.5">
                                Vérifiez le classement et les suggestions automatiques avant de passer aux décisions
                            </p>
                        </div>

                        {/* Légende */}
                        <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100 flex flex-wrap gap-2">
                            {Object.entries(DECISION_STYLES).slice(0, 5).map(([key]) => (
                                <DecisionBadge key={key} decision={key} />
                            ))}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase w-14">Rang</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Élève</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Points</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Moyenne</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Élim.</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Suggestion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {students.map((s: any, i: number) => {
                                        const sug = suggestDelibDecision(s.generalAverage, s.hasEliminatoryFailure);
                                        const avg = s.generalAverage ?? 0;
                                        return (
                                            <tr key={s.studentId} className="hover:bg-neutral-50 transition-colors">
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full text-xs font-bold ${
                                                        i === 0 ? 'bg-yellow-100 text-yellow-700'
                                                        : i === 1 ? 'bg-gray-100 text-gray-600'
                                                        : i === 2 ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-neutral-100 text-neutral-500'
                                                    }`}>
                                                        {s.rank ?? i + 1}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-neutral-900">{s.studentName}</td>
                                                <td className="px-4 py-3 text-center font-mono text-neutral-700">{(s.totalPoints ?? 0).toFixed(0)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-bold font-mono text-base ${avg >= 14 ? 'text-[#1B5E20]' : avg >= 10 ? 'text-[#0D47A1]' : avg >= 8 ? 'text-orange-600' : 'text-red-600'}`}>
                                                        {avg.toFixed(2)}
                                                    </span>
                                                    <span className="text-neutral-400 text-xs">/20</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {s.hasEliminatoryFailure
                                                        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">OUI</span>
                                                        : <span className="text-neutral-400 text-xs">&mdash;</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3"><DecisionBadge decision={sug} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Stats rapides */}
                        <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100">
                            <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                                <span><strong className="text-neutral-900">{students.length}</strong> élèves</span>
                                <span><strong className="text-[#1B5E20]">{students.filter((s: any) => (s.generalAverage ?? 0) >= 10).length}</strong> admis</span>
                                <span><strong className="text-orange-600">{students.filter((s: any) => { const a = s.generalAverage ?? 0; return a >= 8 && a < 10; }).length}</strong> ajournés</span>
                                <span><strong className="text-red-600">{students.filter((s: any) => (s.generalAverage ?? 0) < 8 || s.hasEliminatoryFailure).length}</strong> refusés</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── ÉTAPE 4 : Décisions ──────────────────────────────────── */}
                {step === 4 && (
                    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                        <div className="p-5 border-b border-neutral-100">
                            <h2 className="text-lg font-bold text-neutral-900">Décisions finales du jury</h2>
                            <p className="text-sm text-neutral-500 mt-0.5">
                                Les suggestions sont calculées automatiquement. Modifiez si nécessaire — une justification est obligatoire en cas de modification.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Élève</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Moy.</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Suggestion</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Décision finale</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Justification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s: any) => {
                                        const sug = suggestDelibDecision(s.generalAverage, s.hasEliminatoryFailure) as DelibDecision;
                                        return (
                                            <DecisionSelector
                                                key={s.studentId}
                                                studentId={s.studentId}
                                                studentName={s.studentName}
                                                average={s.generalAverage ?? 0}
                                                suggestion={sug}
                                                currentDecision={decisions[s.studentId]?.decision ?? sug}
                                                justification={decisions[s.studentId]?.justification ?? ''}
                                                onDecisionChange={(sid, d) => setDecisions(prev => ({ ...prev, [sid]: { ...prev[sid], decision: d } }))}
                                                onJustificationChange={(sid, j) => setDecisions(prev => ({ ...prev, [sid]: { ...prev[sid], justification: j } }))}
                                            />
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── ÉTAPE 5 : Validation ─────────────────────────────────── */}
                {step === 5 && (
                    <div className="space-y-5">
                        <DeliberationSummary
                            className={classData?.name ?? ''}
                            termLabel={termData?.label ?? ''}
                            prefetName={prefetName}
                            decisions={decisions}
                            suggestions={suggestions}
                            totalStudents={students.length}
                        />

                        {/* Récapitulatif décisions modifiées */}
                        {Object.entries(decisions).some(([sid, d]) => d.decision !== suggestions[sid]) && (
                            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                                <div className="p-4 border-b border-neutral-100">
                                    <h3 className="text-sm font-bold text-neutral-900">Décisions modifiées par le jury</h3>
                                </div>
                                <div className="divide-y divide-neutral-100">
                                    {Object.entries(decisions)
                                        .filter(([sid, d]) => d.decision !== suggestions[sid])
                                        .map(([sid, d]) => {
                                            const s = students.find((st: any) => st.studentId === sid);
                                            if (!s) return null;
                                            return (
                                                <div key={sid} className="px-4 py-3 flex items-center gap-3 flex-wrap">
                                                    <span className="text-sm font-medium text-neutral-900 flex-1">{s.studentName}</span>
                                                    <div className="flex items-center gap-2">
                                                        <DecisionBadge decision={suggestions[sid]} />
                                                        <ChevronRight size={14} className="text-neutral-400" />
                                                        <DecisionBadge decision={d.decision} />
                                                    </div>
                                                    {d.justification && (
                                                        <span className="text-xs text-neutral-500 italic w-full ml-0">
                                                            &ldquo;{d.justification}&rdquo;
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-900">Action irréversible</p>
                                <p className="text-sm text-amber-800 mt-1">
                                    La validation va générer automatiquement le <strong>Procès-Verbal</strong> officiel
                                    et tous les <strong>bulletins scolaires</strong>. Les parents seront notifiés.
                                    Cette action ne peut pas être annulée.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── ÉTAPE 6 : Résultats ──────────────────────────────────── */}
                {step === 6 && validationResult && (
                    <div className="space-y-6">
                        {/* Succès */}
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Trophy size={28} className="text-white" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-green-900">Délibération validée</p>
                                <p className="text-sm text-green-700 mt-0.5">
                                    {classData?.name} — {termData?.label} — {delib?.academicYear?.label}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    {students.length} élève{students.length > 1 ? 's' : ''} délibérés
                                </p>
                            </div>
                        </div>

                        {/* Documents générés */}
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-3">Documents générés</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* PV */}
                                <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#0D47A1]/10 rounded-xl flex items-center justify-center">
                                            <FileText size={20} className="text-[#0D47A1]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-900">Procès-Verbal</p>
                                            <p className="text-xs text-neutral-500">Document officiel de délibération</p>
                                        </div>
                                    </div>
                                    {validationResult.deliberationId ? (
                                        <button
                                            onClick={() => openPdfFromApi(`/deliberation/pv/${validationResult.deliberationId}`, `PV_${classData?.name}.pdf`)}
                                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0D47A1] rounded-lg hover:bg-[#0D47A1]/90 transition-colors"
                                        >
                                            <ExternalLink size={14} /> Ouvrir le PV
                                        </button>
                                    ) : (
                                        <p className="text-xs text-neutral-400 text-center py-2">PV non disponible</p>
                                    )}
                                </div>

                                {/* Bulletins */}
                                <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#1B5E20]/10 rounded-xl flex items-center justify-center">
                                            <BookOpen size={20} className="text-[#1B5E20]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-900">Bulletins scolaires</p>
                                            <p className="text-xs text-neutral-500">{students.length} bulletins en génération</p>
                                        </div>
                                    </div>
                                    {validationResult.bulletinBatchJobId ? (
                                        <BulletinJobStatus
                                            jobId={validationResult.bulletinBatchJobId}
                                            deliberationId={validationResult.deliberationId}
                                        />
                                    ) : (
                                        <p className="text-xs text-neutral-400 text-center py-2">Bulletins non disponibles</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Récapitulatif décisions */}
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-3">Récapitulatif</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {(['GREAT_DISTINCTION','DISTINCTION','ADMITTED','ADJOURNED','FAILED','EXCLUDED_DEBT'] as const).map(dec => {
                                    const count = Object.values(decisions).filter(d => d.decision === dec).length;
                                    const labels: Record<string, string> = {
                                        GREAT_DISTINCTION: 'Gde Dist.', DISTINCTION: 'Dist.',
                                        ADMITTED: 'Admis', ADJOURNED: 'Ajourné',
                                        FAILED: 'Échoué', EXCLUDED_DEBT: 'Exclu'
                                    };
                                    return (
                                        <div key={dec} className="bg-white border border-neutral-200 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-bold text-neutral-900">{count}</p>
                                            <p className="text-xs text-neutral-500 mt-0.5">{labels[dec]}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Nouvelle délibération */}
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={() => { setStep(1); setClassId(''); setTermId(''); setDecisions({}); setValidationResult(null); }}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
                            >
                                <ClipboardList size={16} /> Nouvelle délibération
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Navigation ───────────────────────────────────────────── */}
                {step < 6 && (
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={goPrev}
                        disabled={step === 1}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} /> Précédent
                    </button>

                    {step < 5 ? (
                        <button
                            onClick={goNext}
                            disabled={(step === 1 && !canGoToStep2) || (step === 2 && !canGoToStep3 && !loadingDelib)}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1B5E20] rounded-xl hover:bg-[#2E7D32] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Suivant <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={validateMutation.isPending}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 shadow-md shadow-orange-200"
                        >
                            {validateMutation.isPending
                                ? <><Loader2 size={16} className="animate-spin" /> Validation en cours...</>
                                : <><Lock size={16} /> Valider la délibération</>
                            }
                        </button>
                    )}
                </div>
                )}
            </div>

            {/* ── Modal confirmation ────────────────────────────────────────── */}
            {showConfirm && (
                <div className="fixed inset-0 bg-[#0F1E12]/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-neutral-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={20} className="text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-neutral-900">Confirmer la validation</h2>
                                <p className="text-sm text-neutral-500">Cette action est définitive et irréversible</p>
                            </div>
                        </div>

                        <div className="p-5 space-y-3">
                            <p className="text-sm text-neutral-700">Cette action va immédiatement :</p>
                            <ul className="space-y-2 text-sm text-neutral-600">
                                {[
                                    'Enregistrer toutes les décisions du jury',
                                    `Générer le Procès-Verbal PDF (${classData?.name} &mdash; ${termData?.label})`,
                                    `Générer les ${students.length} bulletins scolaires`,
                                    'Envoyer une notification SMS aux parents',
                                    'Verrouiller définitivement la délibération',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1B5E20] flex-shrink-0" />
                                        <span dangerouslySetInnerHTML={{ __html: item }} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex gap-3 p-5 border-t border-neutral-100">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={validateMutation.isPending}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => validateMutation.mutate()}
                                disabled={validateMutation.isPending}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
                            >
                                {validateMutation.isPending
                                    ? <><Loader2 size={14} className="animate-spin" /> En cours...</>
                                    : <><Lock size={14} /> Valider définitivement</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
