import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ImportReportProps {
    result: {
        success: number;
        failed: number;
        errors: Array<{ row: number; message: string }>;
        students: any[];
    };
    onReset: () => void;
}

export default function ImportReport({ result, onReset }: ImportReportProps) {
    const navigate = useNavigate();

    const successRate = Math.round(
        (result.success / (result.success + result.failed)) * 100
    );

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg border border-neutral-200 p-8">
                <div className="text-center space-y-6">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 
                                    rounded-full bg-green-100">
                        <CheckCircle2 size={40} className="text-green-600" />
                    </div>

                    {/* Title */}
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                            Import terminé
                        </h2>
                        <p className="text-neutral-600">
                            {result.success} élève{result.success > 1 ? 's' : ''} importé
                            {result.success > 1 ? 's' : ''} avec succès
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {result.success}
                            </div>
                            <div className="text-sm text-neutral-600 mt-1">Réussis</div>
                        </div>

                        {result.failed > 0 && (
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-600">
                                    {result.failed}
                                </div>
                                <div className="text-sm text-neutral-600 mt-1">Échecs</div>
                            </div>
                        )}

                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">
                                {successRate}%
                            </div>
                            <div className="text-sm text-neutral-600 mt-1">Taux de réussite</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md mx-auto">
                        <div className="w-full bg-neutral-200 rounded-full h-3">
                            <div
                                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${successRate}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Errors (if any) */}
            {result.errors.length > 0 && (
                <div className="bg-white rounded-lg border border-red-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <XCircle size={20} className="text-red-600" />
                        <h3 className="font-bold text-neutral-900">
                            Erreurs d'import ({result.errors.length})
                        </h3>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {result.errors.map((error, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-red-50 rounded-lg"
                            >
                                <span className="text-xs font-mono text-red-700 font-semibold">
                                    Ligne {error.row}
                                </span>
                                <span className="text-sm text-red-800 flex-1">
                                    {error.message}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-red-700 mt-4">
                        💡 Corrigez ces erreurs dans votre fichier Excel et réimportez les lignes
                        concernées
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                               text-neutral-700 hover:text-neutral-900 transition-colors"
                >
                    <RotateCcw size={16} />
                    Importer un autre fichier
                </button>

                <button
                    onClick={() => navigate('/students')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white 
                               rounded-lg hover:bg-primary-dark font-medium text-sm 
                               transition-colors"
                >
                    Voir la liste des élèves
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}
