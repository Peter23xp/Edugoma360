import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import UploadZone from '../../components/students/import/UploadZone';
import PreviewTable from '../../components/students/import/PreviewTable';
import ImportReport from '../../components/students/import/ImportReport';
import { parseStudentsFile, type ParsedStudent } from '../../lib/excel/parseStudents';

type ImportStep = 'upload' | 'preview' | 'importing' | 'report';

interface ImportResult {
    success: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
    students: any[];
}

export default function StudentsImportPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [step, setStep] = useState<ImportStep>('upload');
    const [_file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    // Download template
    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/students/import-template', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Modele_Import_Eleves_EduGoma360.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Modèle téléchargé');
        } catch (error) {
            toast.error('Erreur lors du téléchargement du modèle');
        }
    };

    // Handle file upload
    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        toast.loading('Analyse du fichier...');

        try {
            const parsed = await parseStudentsFile(selectedFile);
            setParsedData(parsed);
            setStep('preview');
            toast.dismiss();
            toast.success(`${parsed.length} lignes détectées`);
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.message || 'Erreur lors de l\'analyse du fichier');
        }
    };

    // Import mutation
    const importMutation = useMutation({
        mutationFn: async (data: ParsedStudent[]) => {
            const validRows = data.filter((row) => row.errors.length === 0);
            const payload = validRows.map((row) => row.data);

            const response = await api.post('/students/import', { students: payload });
            return response.data;
        },
        onSuccess: (data: ImportResult) => {
            setImportResult(data);
            setStep('report');
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast.success(`${data.success} élèves importés avec succès`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'import');
        },
    });

    const handleImport = () => {
        setStep('importing');
        importMutation.mutate(parsedData);
    };

    const handleReset = () => {
        setStep('upload');
        setFile(null);
        setParsedData([]);
        setImportResult(null);
    };

    const validCount = parsedData.filter((row) => row.errors.length === 0).length;
    const errorCount = parsedData.filter((row) => row.errors.length > 0).length;
    const warningCount = parsedData.filter(
        (row) => row.errors.length === 0 && row.warnings.length > 0
    ).length;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate('/students')}
                        className="flex items-center gap-2 text-sm text-neutral-600 
                                   hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        Retour à la liste
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 mb-1">
                                Importer des élèves en masse
                            </h1>
                            <p className="text-sm text-neutral-600">
                                Importez plusieurs élèves à la fois via un fichier Excel
                            </p>
                        </div>

                        {step === 'upload' && (
                            <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-2 px-4 py-2 border border-neutral-300 
                                           rounded-lg hover:bg-neutral-50 transition-colors text-sm 
                                           font-medium text-neutral-700"
                            >
                                <Download size={16} />
                                Télécharger le modèle
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Step 1: Upload */}
                {step === 'upload' && (
                    <div className="space-y-6">
                        <UploadZone onFileSelect={handleFileSelect} />

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-blue-900">
                                        Instructions d'import
                                    </h3>
                                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                        <li>Téléchargez le modèle Excel ci-dessus</li>
                                        <li>Remplissez une ligne par élève (colonnes obligatoires marquées *)</li>
                                        <li>Sauvegardez le fichier</li>
                                        <li>Glissez-déposez ou sélectionnez le fichier dans la zone ci-dessus</li>
                                    </ol>
                                    <p className="text-xs text-blue-700 mt-3">
                                        💡 Le modèle contient des exemples et la liste des classes disponibles
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Preview */}
                {step === 'preview' && (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="bg-white rounded-lg border border-neutral-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-neutral-900">
                                    Prévisualisation — {parsedData.length} lignes détectées
                                </h2>
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-neutral-600 hover:text-neutral-900"
                                >
                                    Changer de fichier
                                </button>
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-neutral-700">
                                        {validCount} lignes valides
                                    </span>
                                </div>
                                {warningCount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                                        <span className="text-neutral-700">
                                            {warningCount} avertissements
                                        </span>
                                    </div>
                                )}
                                {errorCount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <span className="text-neutral-700">
                                            {errorCount} erreurs
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview Table */}
                        <PreviewTable data={parsedData} />

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-sm font-medium text-neutral-700 
                                           hover:text-neutral-900"
                            >
                                Annuler
                            </button>

                            <button
                                onClick={handleImport}
                                disabled={errorCount > 0 || validCount === 0}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary 
                                           text-white rounded-lg hover:bg-primary-dark font-medium 
                                           text-sm transition-colors disabled:opacity-50 
                                           disabled:cursor-not-allowed"
                            >
                                <Upload size={16} />
                                Lancer l'import ({validCount} élèves)
                            </button>
                        </div>

                        {errorCount > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-800">
                                    ❌ Vous ne pouvez pas importer tant qu'il y a des erreurs.
                                    Corrigez le fichier et réimportez-le.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Importing */}
                {step === 'importing' && (
                    <div className="bg-white rounded-lg border border-neutral-200 p-12">
                        <div className="max-w-md mx-auto text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 
                                            rounded-full bg-primary/10">
                                <FileSpreadsheet size={32} className="text-primary animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                                    Import en cours...
                                </h2>
                                <p className="text-sm text-neutral-600">
                                    Veuillez patienter pendant l'import des élèves
                                </p>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full animate-pulse w-2/3" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Report */}
                {step === 'report' && importResult && (
                    <ImportReport result={importResult} onReset={handleReset} />
                )}
            </div>
        </div>
    );
}
