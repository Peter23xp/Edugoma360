import { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Subject } from '../../hooks/useSections';

interface SubjectManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
    sectionName: string;
    initialData?: Subject | null;
}

const INPUT_CLS = "w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white";
const LABEL_CLS = "block text-sm font-semibold text-neutral-700 mb-1.5";

export default function SubjectManagementModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    sectionName,
    initialData
}: SubjectManagementModalProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [code, setCode] = useState(initialData?.abbreviation || '');
    const [coefficient, setCoefficient] = useState(initialData?.coefficient?.toString() || '1');
    const [maxScore, setMaxScore] = useState(initialData?.maxScore?.toString() || '20');
    
    // Derived from schema/ui constraints
    const [type, setType] = useState('PRINCIPALE');
    const [isRequired, setIsRequired] = useState(initialData?.isEliminatory ?? true);
    const [hasThreshold, setHasThreshold] = useState(!!initialData?.elimThreshold);
    const [thresholdScore, setThresholdScore] = useState(initialData?.elimThreshold?.toString() || '10');

    // Reset state when opening differently
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            name,
            code,
            coefficient: Number(coefficient),
            maxScore: Number(maxScore),
            type,
            isRequired,
            hasThreshold,
            thresholdScore: hasThreshold ? Number(thresholdScore) : null
        };
        
        await onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col">
                
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <div>
                        <h2 className="font-bold text-neutral-900 text-base uppercase tracking-tight">
                            {initialData ? "Modifier la matière" : "Ajouter une matière"} <span className="text-primary">— {sectionName}</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <div className="px-6 py-5 space-y-6">
                        
                        {/* Identité */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className={LABEL_CLS}>Nom de la matière *</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Mathématiques"
                                    className={INPUT_CLS}
                                    required
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLS}>Code court *</label>
                                <input
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    placeholder="MATH"
                                    className={INPUT_CLS}
                                    maxLength={6}
                                    required
                                />
                                <p className="text-[10px] text-neutral-400 mt-1 whitespace-nowrap">Bulletins & grilles</p>
                            </div>
                        </div>

                        {/* Coeff & Score */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={LABEL_CLS}>Coefficient *</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={coefficient}
                                    onChange={e => setCoefficient(e.target.value)}
                                    className={INPUT_CLS}
                                    required
                                />
                                <p className="text-xs text-neutral-400 mt-1">Impact sur moyenne générale (1-10)</p>
                            </div>
                            <div>
                                <label className={LABEL_CLS}>Notation sur *</label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    {['10', '20', '100'].map(score => (
                                        <button
                                            key={score}
                                            type="button"
                                            onClick={() => setMaxScore(score)}
                                            className={cn(
                                                "py-2 border-2 rounded-xl text-xs font-semibold transition-all",
                                                maxScore === score
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                                            )}
                                        >
                                            {score}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <hr className="border-neutral-100" />

                        {/* Classification */}
                        <div>
                            <label className={LABEL_CLS}>Type de matière</label>
                            <div className="grid grid-cols-3 gap-2 mt-1">
                                {['PRINCIPALE', 'SECONDAIRE', 'TRAVAUX_PRATIQUES'].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={cn(
                                            "py-2 border-2 rounded-xl text-[11px] font-semibold transition-all uppercase tracking-wider",
                                            type === t
                                                ? "border-neutral-800 bg-neutral-50 text-neutral-800"
                                                : "border-neutral-100 text-neutral-500 hover:border-neutral-200"
                                        )}
                                    >
                                        {t.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Règles éliminatoires */}
                        <div className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isRequired}
                                    onChange={e => setIsRequired(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded text-red-600 accent-red-600 border-red-300"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-red-900 block">Matière obligatoire (éliminatoire)</span>
                                    <span className="text-xs text-red-600/80">Si l'élève obtient 0 ou ne participe pas, il est ajourné.</span>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-red-100/50">
                                <input
                                    type="checkbox"
                                    checked={hasThreshold}
                                    onChange={e => setHasThreshold(e.target.checked)}
                                    className="mt-1.5 h-4 w-4 rounded text-red-600 accent-red-600 border-red-300"
                                />
                                <div className="flex-1 flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-semibold text-red-900 block">Seuil éliminatoire</span>
                                        <span className="text-xs text-red-600/80">Note minimale sous laquelle l'élève est rejeté.</span>
                                    </div>
                                    {hasThreshold && (
                                        <div className="flex flex-col w-20">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={maxScore}
                                                    step={0.5}
                                                    value={thresholdScore}
                                                    onChange={e => setThresholdScore(e.target.value)}
                                                    className="w-full border-2 border-red-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-red-400 bg-white"
                                                    required
                                                />
                                                <span className="absolute right-2 top-1.5 text-xs font-bold text-neutral-400">/{maxScore}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !name || !code}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {initialData ? "Enregistrer" : "Ajouter"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
