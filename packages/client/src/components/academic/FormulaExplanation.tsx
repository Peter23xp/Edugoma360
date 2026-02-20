import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

export default function FormulaExplanation() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-blue-100 
                           transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Info size={20} className="text-blue-600" />
                    <span className="font-semibold text-blue-900">
                        Formule de calcul (système EPSP-RDC)
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp size={20} className="text-blue-600" />
                ) : (
                    <ChevronDown size={20} className="text-blue-600" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 pt-0 space-y-4 text-sm">
                    {/* Moyenne Matière */}
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">
                            1. Moyenne par Matière
                        </h4>
                        <div className="space-y-2 text-neutral-700">
                            <p className="font-mono bg-neutral-50 p-2 rounded">
                                Moyenne = (Interro × 20%) + (TP × 30%) + (Examen × 50%)
                            </p>
                            <div className="text-xs space-y-1">
                                <p>• Interrogation : 20% de la note finale</p>
                                <p>• Travail Pratique : 30% de la note finale</p>
                                <p>• Examen trimestriel : 50% de la note finale</p>
                            </div>
                        </div>
                    </div>

                    {/* Moyenne Générale */}
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">
                            2. Moyenne Générale
                        </h4>
                        <div className="space-y-2 text-neutral-700">
                            <p className="font-mono bg-neutral-50 p-2 rounded">
                                Moyenne Générale = Σ(Moyenne_Matière × Coefficient) / Σ(Coefficient)
                            </p>
                            <div className="text-xs">
                                <p>
                                    Chaque matière est pondérée par son coefficient. Les matières
                                    principales ont généralement un coefficient plus élevé.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Total Points */}
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">3. Total Points</h4>
                        <div className="space-y-2 text-neutral-700">
                            <p className="font-mono bg-neutral-50 p-2 rounded">
                                Total Points = Moyenne_Générale × Total_Coefficients
                            </p>
                            <div className="text-xs">
                                <p>
                                    Le total de points permet de classer les élèves. Plus le total
                                    est élevé, meilleur est le classement.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Seuils */}
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">4. Seuils de Passage</h4>
                        <div className="space-y-2 text-neutral-700 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full" />
                                <span>≥ 10/20 : Admis</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                                <span>8-10/20 : Ajourné (peut passer avec autorisation)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full" />
                                <span>&lt; 8/20 : Échec</span>
                            </div>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                                <div className="w-3 h-3 bg-red-600 rounded-full" />
                                <span className="font-semibold">
                                    Matière éliminatoire : Échec automatique si note &lt; seuil
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Exemple */}
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">5. Exemple de Calcul</h4>
                        <div className="space-y-2 text-neutral-700 text-xs">
                            <p className="font-semibold">Mathématiques (Coeff. 4) :</p>
                            <p>• Interro : 12/20</p>
                            <p>• TP : 14/20</p>
                            <p>• Examen : 16/20</p>
                            <p className="font-mono bg-neutral-50 p-2 rounded mt-2">
                                Moyenne = (12×0.2) + (14×0.3) + (16×0.5) = 14.6/20
                            </p>
                            <p className="mt-2">
                                Si total coefficients = 24, contribution aux points totaux = 14.6 × 4
                                = 58.4 points
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

