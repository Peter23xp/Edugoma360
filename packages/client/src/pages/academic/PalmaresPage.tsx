import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Loader2,
    Download,
    Printer,
    FileSpreadsheet,
    Trophy,
    ArrowLeft,
    TrendingUp,
    Users,
    Award,
    AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import PalmaresTable from '../../components/academic/PalmaresTable';

export default function PalmaresPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const classId = searchParams.get('classId');
    const termId = searchParams.get('termId');

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);

    // Fetch palmares data
    const { data: palmaresData, isLoading } = useQuery({
        queryKey: ['palmares', classId, termId],
        queryFn: async () => {
            const response = await api.get(`/reports/palmares/${classId}/${termId}`);
            return response.data;
        },
        enabled: !!classId && !!termId,
    });

    const handleDownloadPdf = async () => {
        if (!classId || !termId) return;
        setIsGeneratingPdf(true);
        try {
            const response = await api.get(`/reports/palmares/${classId}/${termId}/pdf`, {
                responseType: 'blob',
            });
            const url = URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Palmares_${palmaresData?.class?.name}_${palmaresData?.term?.label}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('PDF téléchargé');
        } catch (error) {
            toast.error('Erreur lors du téléchargement');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleDownloadExcel = async () => {
        if (!classId || !termId) return;
        setIsGeneratingExcel(true);
        try {
            const response = await api.get(`/reports/palmares/${classId}/${termId}/excel`, {
                responseType: 'blob',
            });
            const url = URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Palmares_${palmaresData?.class?.name}_${palmaresData?.term?.label}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Excel téléchargé');
        } catch (error) {
            toast.error('Erreur lors du téléchargement');
        } finally {
            setIsGeneratingExcel(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!classId || !termId) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle size={48} className="text-orange-600 mx-auto mb-4" />
                    <p className="text-neutral-600">Paramètres manquants</p>
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

    const rankings = palmaresData?.rankings || [];
    const summary = palmaresData?.summary || {};
    const classData = palmaresData?.class;
    const term = palmaresData?.term;
    const academicYear = palmaresData?.academicYear;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200 shadow-sm print:shadow-none">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors 
                                           text-neutral-500 print:hidden"
                            >
                                <ArrowLeft size={18} />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 
                                                rounded-xl flex items-center justify-center shadow-sm">
                                    <Trophy size={24} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-900">
                                        Palmarès
                                    </h1>
                                    <p className="text-sm text-neutral-600 mt-0.5">
                                        {classData?.name} — {classData?.section?.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 print:hidden">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                                           text-neutral-700 border border-neutral-300 rounded-lg 
                                           hover:bg-neutral-100 transition-colors"
                            >
                                <Printer size={16} />
                                Imprimer
                            </button>

                            <button
                                onClick={handleDownloadExcel}
                                disabled={isGeneratingExcel}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                                           text-neutral-700 border border-neutral-300 rounded-lg 
                                           hover:bg-neutral-100 transition-colors
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGeneratingExcel ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <FileSpreadsheet size={16} />
                                )}
                                Export Excel
                            </button>

                            <button
                                onClick={handleDownloadPdf}
                                disabled={isGeneratingPdf}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold 
                                           bg-primary text-white rounded-lg hover:bg-primary/90 
                                           transition-colors shadow-sm
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGeneratingPdf ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Download size={16} />
                                )}
                                Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-6 text-sm text-neutral-600">
                        <span>{term?.label}</span>
                        <span>•</span>
                        <span>Année Scolaire {academicYear?.label}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-neutral-600 mb-1">
                            <Users size={16} />
                            <span className="text-xs font-medium">Total Élèves</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">{summary.total || 0}</p>
                    </div>

                    <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                            <Award size={16} />
                            <span className="text-xs font-medium">Admis</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{summary.passed || 0}</p>
                    </div>

                    <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                            <TrendingUp size={16} />
                            <span className="text-xs font-medium">Taux Réussite</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {summary.passRate?.toFixed(1) || 0}%
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-neutral-600 mb-1">
                            <span className="text-xs font-medium">Moyenne Classe</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">
                            {summary.classAverage?.toFixed(2) || 0}
                            <span className="text-sm text-neutral-500">/20</span>
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-yellow-600 mb-1">
                            <Trophy size={16} />
                            <span className="text-xs font-medium">Meilleure</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">
                            {summary.highest?.toFixed(2) || 0}
                            <span className="text-sm text-yellow-500">/20</span>
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-red-600 mb-1">
                            <span className="text-xs font-medium">Plus Faible</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                            {summary.lowest?.toFixed(2) || 0}
                            <span className="text-sm text-red-500">/20</span>
                        </p>
                    </div>
                </div>

                {/* Rankings Table */}
                <PalmaresTable rankings={rankings} />

                {/* Footer Note */}
                <div className="mt-6 text-center text-sm text-neutral-500 print:hidden">
                    <p>
                        Document officiel généré le {new Date().toLocaleDateString('fr-FR')} — EduGoma 360
                    </p>
                </div>
            </div>
        </div>
    );
}
