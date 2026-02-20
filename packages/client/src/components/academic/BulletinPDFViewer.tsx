import { useState } from 'react';
import { FileText, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

interface BulletinPDFViewerProps {
    pdfUrl?: string | null;
    isLoading?: boolean;
    error?: string | null;
    onRegenerate?: () => void;
    studentName?: string;
    termName?: string;
}

export default function BulletinPDFViewer({
    pdfUrl,
    isLoading,
    error,
    onRegenerate,
    studentName,
    termName,
}: BulletinPDFViewerProps) {
    const [iframeLoaded, setIframeLoaded] = useState(false);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-neutral-200 h-[700px] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-neutral-800">Génération du PDF en cours…</p>
                    <p className="text-xs text-neutral-500 mt-1">Puppeteer rend le bulletin</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl border border-red-200 h-64 flex flex-col items-center justify-center gap-4 p-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle size={24} className="text-red-500" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-neutral-800">Erreur de génération</p>
                    <p className="text-xs text-neutral-500 mt-1">{error}</p>
                </div>
                {onRegenerate && (
                    <button
                        onClick={onRegenerate}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Réessayer
                    </button>
                )}
            </div>
        );
    }

    if (!pdfUrl) {
        return (
            <div className="bg-white rounded-xl border border-neutral-200 h-64 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                    <FileText size={28} className="text-neutral-400" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-neutral-700">Bulletin non généré</p>
                    {studentName && termName && (
                        <p className="text-xs text-neutral-500 mt-1">
                            {studentName} — {termName}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {/* Barre de titre */}
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                    <FileText size={15} className="text-primary" />
                    <span className="text-sm font-medium text-neutral-700">
                        {studentName ? `Bulletin — ${studentName}` : 'Aperçu PDF'}
                        {termName && <span className="text-neutral-400"> · {termName}</span>}
                    </span>
                </div>
                <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                    <ExternalLink size={12} />
                    Ouvrir dans un onglet
                </a>
            </div>

            {/* iFrame PDF */}
            <div className="relative h-[700px]">
                {!iframeLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 z-10">
                        <RefreshCw size={20} className="animate-spin text-neutral-400" />
                    </div>
                )}
                <iframe
                    src={pdfUrl}
                    title="Bulletin PDF"
                    className="w-full h-full border-0"
                    onLoad={() => setIframeLoaded(true)}
                />
            </div>
        </div>
    );
}

