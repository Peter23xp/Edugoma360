import { useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Loader2,
    Download,
    Printer,
    FileText,
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    RefreshCw,
    Users,
    BookOpen,
    Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useSchoolStore } from '../../stores/school.store';

// ── Types ──────────────────────────────────────────────────────────────────────

interface BatchJob {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    total: number;
    processed: number;
    progress: number;
    results: Array<{ studentId: string; url?: string; error?: string }>;
    createdAt: string;
}

// ── Batch Progress Panel ───────────────────────────────────────────────────────

function BatchProgressPanel({
    job,
    onRefresh,
}: {
    job: BatchJob;
    onRefresh: () => void;
}) {
    const pct = job.progress ?? 0;
    const isDone = job.status === 'completed' || job.status === 'failed';

    return (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {isDone ? (
                        <CheckCircle size={20} className="text-green-600" />
                    ) : (
                        <Loader2 size={20} className="animate-spin text-green-700" />
                    )}
                    <h3 className="font-semibold text-neutral-900">
                        {isDone ? 'Génération terminée' : 'Génération en cours…'}
                    </h3>
                </div>
                {!isDone && (
                    <button
                        onClick={onRefresh}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600
                                   hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors"
                    >
                        <RefreshCw size={12} />
                        Actualiser
                    </button>
                )}
            </div>

            {/* Progress bar */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
                    <span>{job.processed} / {job.total} bulletins traités</span>
                    <span className="font-medium">{pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-700 to-emerald-500 
                                   rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {/* Status badge */}
            <div className="mt-3">
                {job.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 
                                     border border-amber-200 px-2 py-1 rounded-full">
                        <Clock size={11} /> En attente…
                    </span>
                )}
                {job.status === 'processing' && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 
                                     border border-blue-200 px-2 py-1 rounded-full">
                        <Loader2 size={11} className="animate-spin" /> Génération en cours
                    </span>
                )}
                {job.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 
                                     border border-green-200 px-2 py-1 rounded-full">
                        <CheckCircle size={11} /> Complété avec succès
                    </span>
                )}
                {job.status === 'failed' && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 
                                     border border-red-200 px-2 py-1 rounded-full">
                        <AlertTriangle size={11} /> Échec du traitement
                    </span>
                )}
                {job.results?.some((r) => r.error) && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle size={11} />
                        {job.results.filter((r) => r.error).length} erreur(s)
                    </span>
                )}
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BulletinPage() {
    const { studentId, termId: termIdParam } = useParams<{ studentId?: string; termId?: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const { activeTermId, termLabel, academicYearLabel } = useSchoolStore();

    // Resolve termId: from URL param > URL query > store
    const termId = termIdParam || searchParams.get('termId') || activeTermId || '';

    // Batch mode: when classId query param present (no studentId)
    const classId = searchParams.get('classId');
    const isBatchMode = !!classId && !studentId;

    const [batchJobId, setBatchJobId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

    // ── Single bulletin PDF (fetched as blob for iframe preview) ───────────────
    const {
        isLoading: bulletinLoading,
        error: bulletinError,
        refetch: refetchBulletin,
    } = useQuery({
        queryKey: ['bulletin-pdf', studentId, termId],
        queryFn: async () => {
            if (!studentId || !termId) throw new Error('Paramètres manquants');

            const res = await api.get(`/bulletin/${studentId}/${termId}`, {
                responseType: 'blob',
            });

            // Revoke old blob URL to avoid memory leaks
            if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);

            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfBlobUrl(url);
            return url;
        },
        enabled: !!studentId && !!termId,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 min cache
    });

    // ── Batch job polling ───────────────────────────────────────────────────────
    const { data: batchJob, refetch: refetchBatchJob } = useQuery<BatchJob>({
        queryKey: ['bulletin-batch-job', batchJobId],
        queryFn: async () => {
            const res = await api.get(`/bulletin/batch/${batchJobId}`);
            return res.data;
        },
        enabled: !!batchJobId,
        refetchInterval: (query) => {
            const job = query.state.data as BatchJob | undefined;
            if (!job) return 3000;
            return job.status === 'completed' || job.status === 'failed' ? false : 3000;
        },
    });

    // ── Download single PDF ────────────────────────────────────────────────────
    const handleDownload = useCallback(async () => {
        if (!studentId || !termId) return;
        setIsGenerating(true);
        try {
            const res = await api.get(`/bulletin/${studentId}/${termId}`, {
                responseType: 'blob',
            });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Bulletin_${studentId}_${termId}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Bulletin téléchargé avec succès');
        } catch {
            toast.error('Erreur lors du téléchargement du bulletin');
        } finally {
            setIsGenerating(false);
        }
    }, [studentId, termId]);

    // ── Print ──────────────────────────────────────────────────────────────────
    const handlePrint = useCallback(() => {
        if (pdfBlobUrl) {
            // Open PDF in new tab — browser print dialog
            const printWindow = window.open(pdfBlobUrl, '_blank');
            if (printWindow) {
                printWindow.onload = () => printWindow.print();
            }
        }
    }, [pdfBlobUrl]);

    // ── Batch generation trigger ───────────────────────────────────────────────
    const handleBatchGenerate = useCallback(async () => {
        if (!classId || !termId) return;
        setIsGenerating(true);
        try {
            const res = await api.post('/bulletin/batch', { classId, termId });
            setBatchJobId(res.data.jobId);
            toast.success('Génération des bulletins lancée en arrière-plan');
        } catch {
            toast.error('Erreur lors du lancement de la génération');
        } finally {
            setIsGenerating(false);
        }
    }, [classId, termId]);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-neutral-50">

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="bg-white border-b border-neutral-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors 
                                       text-neutral-500 hover:text-neutral-700"
                            title="Retour"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-800 to-emerald-500
                                            rounded-xl flex items-center justify-center shadow-sm">
                                <FileText size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900">
                                    {isBatchMode
                                        ? 'Bulletins Scolaires — Classe entière'
                                        : 'Bulletin Scolaire'}
                                </h1>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    {academicYearLabel} {termLabel ? `— ${termLabel}` : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        {/* Single mode actions */}
                        {!isBatchMode && pdfBlobUrl && (
                            <>
                                <button
                                    id="btn-preview-bulletin"
                                    onClick={() => window.open(pdfBlobUrl, '_blank')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                                               text-neutral-700 border border-neutral-300 rounded-lg
                                               hover:bg-neutral-100 transition-colors"
                                >
                                    <Eye size={15} />
                                    Aperçu plein écran
                                </button>
                                <button
                                    id="btn-print-bulletin"
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                                               text-neutral-700 border border-neutral-300 rounded-lg
                                               hover:bg-neutral-100 transition-colors"
                                >
                                    <Printer size={15} />
                                    Imprimer
                                </button>
                                <button
                                    id="btn-download-bulletin"
                                    onClick={handleDownload}
                                    disabled={isGenerating}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold
                                               bg-green-700 text-white rounded-lg hover:bg-green-800
                                               transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {isGenerating
                                        ? <Loader2 size={15} className="animate-spin" />
                                        : <Download size={15} />
                                    }
                                    Télécharger PDF
                                </button>
                            </>
                        )}

                        {/* Batch mode: re-generate button */}
                        {isBatchMode && !batchJobId && (
                            <button
                                id="btn-generate-batch"
                                onClick={handleBatchGenerate}
                                disabled={isGenerating}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold
                                           bg-green-700 text-white rounded-lg hover:bg-green-800
                                           transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {isGenerating
                                    ? <Loader2 size={15} className="animate-spin" />
                                    : <Users size={15} />
                                }
                                Générer tous les bulletins
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Page Body ────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

                {/* ══════════════════════════════════════════════════════
                    BATCH MODE
                ══════════════════════════════════════════════════════ */}
                {isBatchMode && (
                    <div className="space-y-6">

                        {/* Info card */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center
                                                justify-center border border-green-200 flex-shrink-0">
                                    <BookOpen size={22} className="text-green-700" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-semibold text-neutral-900 text-lg">
                                        Génération en masse — Classe entière
                                    </h2>
                                    <p className="text-sm text-neutral-600 mt-1">
                                        Génère les bulletins officiels pour <strong>tous les élèves</strong> de
                                        la classe. La génération s'effectue en arrière-plan et les fichiers
                                        seront disponibles au téléchargement à la fin.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50
                                                          border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
                                            <AlertTriangle size={12} />
                                            Prérequis : Délibération validée (SCR-015)
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50
                                                          border border-blue-200 rounded-lg text-xs text-blue-700 font-medium">
                                            <Clock size={12} />
                                            Environ 2–5 min selon l'effectif
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50
                                                          border border-green-200 rounded-lg text-xs text-green-700 font-medium">
                                            <FileText size={12} />
                                            Format A4 portrait — 100 FC/bulletin
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {!batchJobId && (
                                <div className="mt-5 pt-5 border-t border-neutral-100">
                                    <button
                                        id="btn-generate-batch-main"
                                        onClick={handleBatchGenerate}
                                        disabled={isGenerating}
                                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold
                                                   bg-green-700 text-white rounded-lg hover:bg-green-800
                                                   transition-colors disabled:opacity-50 shadow-sm"
                                    >
                                        {isGenerating
                                            ? <Loader2 size={16} className="animate-spin" />
                                            : <Users size={16} />
                                        }
                                        Lancer la génération des bulletins
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Progress panel */}
                        {batchJobId && batchJob && (
                            <BatchProgressPanel
                                job={batchJob}
                                onRefresh={() => refetchBatchJob()}
                            />
                        )}

                        {/* Results list when completed */}
                        {batchJob?.status === 'completed' && (
                            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={18} className="text-green-600" />
                                        <h3 className="font-semibold text-neutral-900">
                                            Résultats — {batchJob.results.filter((r) => r.url).length} bulletin(s) générés
                                        </h3>
                                    </div>
                                    <span className="text-xs text-neutral-500">
                                        {batchJob.results.filter((r) => r.error).length} erreur(s)
                                    </span>
                                </div>
                                <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                                    {batchJob.results.map((result) => (
                                        <div
                                            key={result.studentId}
                                            className="flex items-center justify-between px-6 py-3 hover:bg-neutral-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {result.url ? (
                                                    <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                                                ) : (
                                                    <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
                                                )}
                                                <div>
                                                    <span className="text-sm text-neutral-700 font-medium font-mono">
                                                        {result.studentId}
                                                    </span>
                                                    {result.error && (
                                                        <p className="text-xs text-red-500 mt-0.5">{result.error}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {result.url && (
                                                <a
                                                    href={result.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                                               text-green-700 border border-green-200 bg-green-50
                                                               rounded-lg hover:bg-green-100 transition-colors"
                                                >
                                                    <Download size={12} />
                                                    Télécharger
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════
                    SINGLE BULLETIN MODE
                ══════════════════════════════════════════════════════ */}
                {!isBatchMode && (
                    <div className="space-y-6">

                        {/* Missing params */}
                        {(!studentId || !termId) && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                                <Clock size={40} className="text-amber-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-amber-900 mb-1">Paramètres manquants</h3>
                                <p className="text-sm text-amber-700">
                                    L'identifiant de l'élève ou du trimestre est introuvable.
                                    Accédez à cette page depuis la fiche élève ou après délibération.
                                </p>
                            </div>
                        )}

                        {/* Loading state */}
                        {studentId && termId && bulletinLoading && (
                            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
                                <div className="flex flex-col items-center justify-center py-28 gap-4">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl bg-green-50 border border-green-100
                                                        flex items-center justify-center">
                                            <FileText size={32} className="text-green-700" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full 
                                                        flex items-center justify-center shadow-sm border border-neutral-100">
                                            <Loader2 size={14} className="animate-spin text-green-700" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-neutral-800">Génération du bulletin…</p>
                                        <p className="text-sm text-neutral-400 mt-1">
                                            Cela peut prendre quelques secondes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error state */}
                        {studentId && termId && bulletinError && !bulletinLoading && (
                            <div className="bg-white rounded-xl border border-red-200 shadow-sm">
                                <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
                                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center
                                                    border border-red-100">
                                        <AlertTriangle size={28} className="text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 mb-2">
                                            Impossible de générer le bulletin
                                        </h3>
                                        <p className="text-sm text-neutral-600 max-w-md">
                                            Vérifiez que la <strong>délibération a été validée</strong> pour cet
                                            élève et ce trimestre (SCR-015 complété).
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(-1)}
                                            className="px-4 py-2 text-sm font-medium text-neutral-700
                                                       border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
                                        >
                                            ← Retour
                                        </button>
                                        <button
                                            onClick={() => refetchBulletin()}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                                                       text-green-700 border border-green-300 rounded-lg
                                                       hover:bg-green-50 transition-colors"
                                        >
                                            <RefreshCw size={14} />
                                            Réessayer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PDF Preview */}
                        {pdfBlobUrl && !bulletinLoading && (
                            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                                {/* Toolbar */}
                                <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-100
                                                bg-neutral-50">
                                    <div className="flex items-center gap-2">
                                        <FileText size={15} className="text-green-700" />
                                        <span className="text-sm text-neutral-600 font-medium">
                                            Aperçu du bulletin PDF — Format A4
                                        </span>
                                        <span className="text-xs font-medium px-2 py-0.5 bg-green-100 
                                                         text-green-800 rounded-full border border-green-200">
                                            EPSP-RDC
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => window.open(pdfBlobUrl, '_blank')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                                       text-neutral-600 border border-neutral-200 rounded-lg
                                                       hover:bg-white transition-colors"
                                        >
                                            <Eye size={12} />
                                            Plein écran
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                                       text-neutral-600 border border-neutral-200 rounded-lg
                                                       hover:bg-white transition-colors"
                                        >
                                            <Printer size={12} />
                                            Imprimer
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            disabled={isGenerating}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                                                       text-white bg-green-700 rounded-lg hover:bg-green-800
                                                       transition-colors disabled:opacity-50"
                                        >
                                            {isGenerating
                                                ? <Loader2 size={12} className="animate-spin" />
                                                : <Download size={12} />
                                            }
                                            Télécharger
                                        </button>
                                    </div>
                                </div>

                                {/* PDF iframe */}
                                <iframe
                                    ref={iframeRef}
                                    src={pdfBlobUrl}
                                    className="w-full border-0"
                                    style={{ height: '82vh', minHeight: '720px' }}
                                    title="Aperçu du Bulletin Scolaire"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
