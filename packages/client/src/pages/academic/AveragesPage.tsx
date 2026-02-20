import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calculator, Lock, FileSpreadsheet, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import AveragesTable from '../../components/academic/AveragesTable';
import FormulaExplanation from '../../components/academic/FormulaExplanation';

export default function AveragesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedTermId, setSelectedTermId] = useState('');
    const [showValidateModal, setShowValidateModal] = useState(false);

    // Fetch classes
    const { data: classesData } = useQuery({
        queryKey: ['classes'],
        queryFn: async () => {
            const response = await api.get('/classes?status=active');
            return response.data;
        },
    });

    // Fetch terms
    const { data: termsData } = useQuery({
        queryKey: ['terms'],
        queryFn: async () => {
            const response = await api.get('/settings/terms');
            return response.data;
        },
    });

    // Fetch averages
    const { data: averagesData, isLoading: loadingAverages } = useQuery({
        queryKey: ['averages', selectedClassId, selectedTermId],
        queryFn: async () => {
            const response = await api.get('/grades/averages', {
                params: {
                    classId: selectedClassId,
                    termId: selectedTermId,
                },
            });
            return response.data;
        },
        enabled: !!selectedClassId && !!selectedTermId,
    });

    // Calculate mutation
    const calculateMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/grades/calculate-averages', {
                classId: selectedClassId,
                termId: selectedTermId,
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Moyennes calculées avec succès');
            queryClient.invalidateQueries({ queryKey: ['averages'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors du calcul');
        },
    });

    // Validate mutation
    const validateMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/grades/validate-averages', {
                classId: selectedClassId,
                termId: selectedTermId,
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success('Moyennes validées avec succès');
            setShowValidateModal(false);
            // Redirect to deliberation
            navigate(`/grades/deliberation?deliberationId=${data.deliberationId}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de la validation');
        },
    });

    const handleCalculate = () => {
        calculateMutation.mutate();
    };

    const handleValidate = () => {
        setShowValidateModal(true);
    };

    const handleConfirmValidate = () => {
        validateMutation.mutate();
    };

    const handleExportExcel = async () => {
        try {
            toast.loading('Génération du fichier Excel...');
            const response = await api.get('/grades/averages/export', {
                params: {
                    classId: selectedClassId,
                    termId: selectedTermId,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const className = classes.find((c: any) => c.id === selectedClassId)?.name || 'classe';
            const termLabel = terms.find((t: any) => t.id === selectedTermId)?.label || 'trimestre';
            link.setAttribute('download', `moyennes_${className}_${termLabel}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.dismiss();
            toast.success('Fichier Excel téléchargé');
        } catch (error) {
            toast.dismiss();
            toast.error('Erreur lors de l\'export');
        }
    };

    const classes = classesData?.classes || [];
    const terms = termsData?.terms || [];
    const averages = averagesData?.averages || [];
    const subjects = averagesData?.subjects || [];
    const isValidated = averagesData?.isValidated || false;

    const selectedClass = classes.find((c: any) => c.id === selectedClassId);
    const selectedTerm = terms.find((t: any) => t.id === selectedTermId);

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">
                                Calcul des Moyennes
                            </h1>
                            <p className="text-sm text-neutral-600 mt-1">
                                Calcul automatique selon le système EPSP-RDC
                            </p>
                        </div>

                        {/* Actions */}
                        {selectedClassId && selectedTermId && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCalculate}
                                    disabled={calculateMutation.isPending || isValidated}
                                    className="flex items-center gap-2 px-4 py-2 border 
                                               border-neutral-300 text-neutral-700 rounded-lg 
                                               hover:bg-neutral-50 transition-colors text-sm 
                                               font-medium disabled:opacity-50 
                                               disabled:cursor-not-allowed"
                                >
                                    {calculateMutation.isPending ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Calculator size={16} />
                                    )}
                                    Recalculer
                                </button>

                                <button
                                    onClick={handleExportExcel}
                                    disabled={averages.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 border 
                                               border-neutral-300 text-neutral-700 rounded-lg 
                                               hover:bg-neutral-50 transition-colors text-sm 
                                               font-medium disabled:opacity-50 
                                               disabled:cursor-not-allowed"
                                >
                                    <FileSpreadsheet size={16} />
                                    Export Excel
                                </button>

                                <button
                                    onClick={handleValidate}
                                    disabled={averages.length === 0 || isValidated}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 
                                               text-white rounded-lg hover:bg-orange-700 
                                               transition-colors text-sm font-medium
                                               disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Lock size={16} />
                                    {isValidated ? 'Validé' : 'Valider les moyennes'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Classe
                            </label>
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg 
                                           text-sm focus:ring-2 focus:ring-primary/20 
                                           focus:border-primary bg-white"
                            >
                                <option value="">Sélectionnez une classe</option>
                                {classes.map((classItem: any) => (
                                    <option key={classItem.id} value={classItem.id}>
                                        {classItem.name} - {classItem.section.name}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                        {term.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {!selectedClassId || !selectedTermId ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-600">
                            Sélectionnez une classe et un trimestre pour calculer les moyennes
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Formula Explanation */}
                        <div className="mb-6">
                            <FormulaExplanation />
                        </div>

                        {/* Validated Badge */}
                        {isValidated && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Lock size={16} className="text-green-600" />
                                    <span className="text-sm font-semibold text-green-900">
                                        Moyennes validées - Prêt pour la délibération
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Statistics */}
                        {averages.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                    <p className="text-sm text-neutral-600">Élèves</p>
                                    <p className="text-2xl font-bold text-primary mt-1">
                                        {averages.length}
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                    <p className="text-sm text-neutral-600">Moyenne classe</p>
                                    <p className="text-2xl font-bold text-neutral-900 mt-1">
                                        {(
                                            averages.reduce(
                                                (sum: number, s: any) => sum + s.generalAverage,
                                                0
                                            ) / averages.length
                                        ).toFixed(2)}
                                        /20
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                    <p className="text-sm text-neutral-600">Taux de réussite</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        {(
                                            (averages.filter(
                                                (s: any) =>
                                                    s.generalAverage >= 10 &&
                                                    !s.hasEliminatoryFailure
                                            ).length /
                                                averages.length) *
                                            100
                                        ).toFixed(0)}
                                        %
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg border border-neutral-200 p-4">
                                    <p className="text-sm text-neutral-600">Échecs</p>
                                    <p className="text-2xl font-bold text-red-600 mt-1">
                                        {
                                            averages.filter(
                                                (s: any) =>
                                                    s.generalAverage < 10 || s.hasEliminatoryFailure
                                            ).length
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        <AveragesTable
                            students={averages}
                            subjects={subjects}
                            isLoading={loadingAverages}
                        />
                    </>
                )}
            </div>

            {/* Validate Modal */}
            {showValidateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b 
                                        border-neutral-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex 
                                                items-center justify-center">
                                    <AlertTriangle size={20} className="text-orange-600" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900">
                                    Valider les moyennes ?
                                </h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="text-sm text-orange-800 font-medium">
                                    ⚠️ Cette action est irréversible sans l'autorisation du Préfet.
                                </p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <p className="text-neutral-700">
                                    Une fois validées, les moyennes seront figées pour la
                                    délibération.
                                </p>
                                <p className="text-neutral-700">
                                    Seul le Préfet pourra les déverrouiller.
                                </p>
                            </div>

                            <div className="space-y-2 text-sm bg-neutral-50 rounded-lg p-4">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Élèves concernés:</span>
                                    <span className="font-semibold text-neutral-900">
                                        {averages.length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Classe:</span>
                                    <span className="font-semibold text-neutral-900">
                                        {selectedClass?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Trimestre:</span>
                                    <span className="font-semibold text-neutral-900">
                                        {selectedTerm?.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t 
                                        border-neutral-200">
                            <button
                                onClick={() => setShowValidateModal(false)}
                                disabled={validateMutation.isPending}
                                className="px-4 py-2 text-sm font-medium text-neutral-700 
                                           hover:bg-neutral-100 rounded-lg transition-colors
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmValidate}
                                disabled={validateMutation.isPending}
                                className="flex items-center gap-2 px-6 py-2 bg-orange-600 
                                           text-white rounded-lg hover:bg-orange-700 
                                           font-medium text-sm transition-colors
                                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {validateMutation.isPending && (
                                    <Loader2 size={16} className="animate-spin" />
                                )}
                                Valider définitivement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
