import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, Download, Printer, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function PVPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const deliberationId = searchParams.get('deliberationId');

    // Fetch deliberation results
    const { data: deliberationData, isLoading } = useQuery({
        queryKey: ['deliberation-results', deliberationId],
        queryFn: async () => {
            const response = await api.get(`/deliberation/results/${deliberationId}`);
            return response.data;
        },
        enabled: !!deliberationId,
    });

    // Fetch bulletin job status if available
    const bulletinJobId = deliberationData?.bulletinBatchJobId;
    const { data: jobStatus } = useQuery({
        queryKey: ['bulletin-job', bulletinJobId],
        queryFn: async () => {
            const response = await api.get(`/deliberation/bulletin-job/${bulletinJobId}`);
            return response.data;
        },
        enabled: !!bulletinJobId,
        refetchInterval: (data) => {
            // Stop polling when job is completed or failed
            return data?.status === 'processing' || data?.status === 'pending' ? 2000 : false;
        },
    });

    if (!deliberationId) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle size={48} className="text-orange-600 mx-auto mb-4" />
                    <p className="text-neutral-600">ID de délibération manquant</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    const handleDownloadPV = () => {
        if (deliberationData?.pvUrl) {
            window.open(deliberationData.pvUrl, '_blank');
        } else {
            toast.error('PV non disponible');
        }
    };

    const handlePrintPV = () => {
        if (deliberationData?.pvUrl) {
            const printWindow = window.open(deliberationData.pvUrl, '_blank');
            printWindow?.addEventListener('load', () => {
                printWindow.print();
            });
        } else {
            toast.error('PV non disponible');
        }
    };

    const handleViewBulletins = () => {
        navigate(`/students?classId=${deliberationData.class.id}`);
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">
                                Délibération Validée
                            </h1>
                            <p className="text-sm text-neutral-600 mt-1">
                                {deliberationData?.class?.name} — {deliberationData?.term?.label}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadPV}
                                disabled={!deliberationData?.pvUrl}
                                className="flex items-center gap-2 px-4 py-2 border 
                                           border-neutral-300 text-neutral-700 rounded-lg 
                                           hover:bg-neutral-50 transition-colors text-sm 
                                           font-medium disabled:opacity-50 
                                           disabled:cursor-not-allowed"
                            >
                                <Download size={16} />
                                Télécharger PV
                            </button>

                            <button
                                onClick={handlePrintPV}
                                disabled={!deliberationData?.pvUrl}
                                className="flex items-center gap-2 px-4 py-2 border 
                                           border-neutral-300 text-neutral-700 rounded-lg 
                                           hover:bg-neutral-50 transition-colors text-sm 
                                           font-medium disabled:opacity-50 
                                           disabled:cursor-not-allowed"
                            >
                                <Printer size={16} />
                                Imprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-3">
                        <CheckCircle size={24} className="text-green-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-green-900">
                                Délibération validée avec succès
                            </h3>
                            <p className="text-sm text-green-800 mt-1">
                                Le Procès-Verbal a été généré et les bulletins sont en cours de
                                génération.
                            </p>
                        </div>
                    </div>
                </div>

                {/* PV Preview */}
                {deliberationData?.pvUrl && (
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden mb-6">
                        <div className="p-6 border-b border-neutral-200">
                            <h2 className="text-lg font-bold text-neutral-900">
                                Procès-Verbal de Délibération
                            </h2>
                        </div>
                        <div className="p-6">
                            <iframe
                                src={deliberationData.pvUrl}
                                className="w-full h-[600px] border border-neutral-200 rounded"
                                title="Procès-Verbal"
                            />
                        </div>
                    </div>
                )}

                {/* Bulletin Generation Status */}
                {jobStatus && (
                    <div className="bg-white rounded-lg border border-neutral-200 p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">
                            Génération des Bulletins
                        </h2>

                        {jobStatus.status === 'pending' && (
                            <div className="flex items-center gap-3 text-neutral-600">
                                <Clock size={20} />
                                <span>En attente...</span>
                            </div>
                        )}

                        {jobStatus.status === 'processing' && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-neutral-700">
                                        Génération en cours...
                                    </span>
                                    <span className="text-sm font-semibold text-primary">
                                        {jobStatus.processed}/{jobStatus.totalStudents} (
                                        {jobStatus.progress}%)
                                    </span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${jobStatus.progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {jobStatus.status === 'completed' && (
                            <div>
                                <div className="flex items-center gap-3 text-green-600 mb-4">
                                    <CheckCircle size={20} />
                                    <span className="font-semibold">
                                        Tous les bulletins ont été générés
                                    </span>
                                </div>

                                {jobStatus.errors.length > 0 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm font-semibold text-orange-900 mb-2">
                                            {jobStatus.errors.length} erreur(s) détectée(s)
                                        </p>
                                        <ul className="text-sm text-orange-800 space-y-1">
                                            {jobStatus.errors.slice(0, 5).map((error: any, i: number) => (
                                                <li key={i}>• {error.error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={handleViewBulletins}
                                    className="px-4 py-2 bg-primary text-white rounded-lg 
                                               hover:bg-primary/90 font-medium text-sm 
                                               transition-colors"
                                >
                                    Voir les bulletins
                                </button>
                            </div>
                        )}

                        {jobStatus.status === 'failed' && (
                            <div className="flex items-center gap-3 text-red-600">
                                <AlertTriangle size={20} />
                                <span className="font-semibold">
                                    Erreur lors de la génération des bulletins
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-white rounded-lg border border-neutral-200 p-6">
                        <p className="text-sm text-neutral-600">Élèves</p>
                        <p className="text-3xl font-bold text-primary mt-2">
                            {deliberationData?.results?.length || 0}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-neutral-200 p-6">
                        <p className="text-sm text-neutral-600">Admis</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {deliberationData?.results?.filter(
                                (r: any) =>
                                    r.decision === 'ADMITTED' ||
                                    r.decision === 'DISTINCTION' ||
                                    r.decision === 'GREAT_DISTINCTION'
                            ).length || 0}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-neutral-200 p-6">
                        <p className="text-sm text-neutral-600">Taux de réussite</p>
                        <p className="text-3xl font-bold text-neutral-900 mt-2">
                            {deliberationData?.results
                                ? (
                                      (deliberationData.results.filter(
                                          (r: any) =>
                                              r.decision === 'ADMITTED' ||
                                              r.decision === 'DISTINCTION' ||
                                              r.decision === 'GREAT_DISTINCTION'
                                      ).length /
                                          deliberationData.results.length) *
                                      100
                                  ).toFixed(0)
                                : 0}
                            %
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
