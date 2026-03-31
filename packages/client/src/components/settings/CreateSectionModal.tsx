import { useState } from 'react';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface CreateSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
}

const INPUT_CLS = "w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white";
const LABEL_CLS = "block text-sm font-semibold text-neutral-700 mb-1.5";

const SECTIONS_PRESETS = [
    { name: "Tronc Commun", code: "TC", years: [1, 2] },
    { name: "Scientifique", code: "Sc", years: [3, 4, 5, 6] },
    { name: "Commerciale & Gestion", code: "HCG", years: [3, 4, 5, 6] },
    { name: "Pédagogie Générale", code: "Péd", years: [3, 4, 5, 6] },
    { name: "Littéraire", code: "Lit", years: [3, 4, 5, 6] },
    { name: "Technique", code: "Tech", years: [3, 4, 5, 6] },
];

export default function CreateSectionModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting
}: CreateSectionModalProps) {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [selectedYears, setSelectedYears] = useState<number[]>([]);

    if (!isOpen) return null;

    const toggleYear = (y: number) => {
        setSelectedYears(prev => prev.includes(y) ? prev.filter(v => v !== y) : [...prev, y].sort());
    };

    const applyPreset = (preset: typeof SECTIONS_PRESETS[0]) => {
        setName(preset.name);
        setCode(preset.code);
        setSelectedYears(preset.years);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !code.trim() || selectedYears.length === 0) {
            return toast.error("Veuillez remplir tous les champs obligatoires");
        }

        await onSubmit({
            name: name.trim(),
            code: code.trim(),
            years: selectedYears
        });
        
        // Reset and close
        setName('');
        setCode('');
        setSelectedYears([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto flex flex-col">
                
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <div>
                        <h2 className="font-bold text-neutral-900 text-lg">Nouvelle Section</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Ajoutez une filière (ex: Tronc Commun, Scientifique)</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <div className="px-6 py-5 space-y-6">
                        
                        {/* Presets */}
                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Modèles rapides RDC</label>
                            <div className="flex flex-wrap gap-2">
                                {SECTIONS_PRESETS.map(p => (
                                    <button
                                        key={p.code}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        className="px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded-full text-neutral-600 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                    >
                                        {p.name} ({p.code})
                                    </button>
                                ))}
                            </div>
                        </div>

                        <hr className="border-neutral-100" />
                        
                        {/* Name & Code */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3">
                                <label className={LABEL_CLS}>Nom de la section *</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="ex: Tronc Commun"
                                    className={INPUT_CLS}
                                    required
                                />
                            </div>
                            <div>
                                <label className={LABEL_CLS}>Code *</label>
                                <input
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    placeholder="ex: TC"
                                    maxLength={4}
                                    className={cn(INPUT_CLS, "uppercase text-center font-bold font-mono")}
                                    required
                                />
                            </div>
                        </div>

                        {/* Years Selection */}
                        <div>
                            <label className={LABEL_CLS}>
                                Années d'études concernées *
                            </label>
                            <p className="text-xs text-neutral-500 mb-3">Sélectionnez les niveaux qui composent cette filière.</p>
                            
                            <div className="flex gap-3">
                                {[1, 2, 3, 4, 5, 6].map(year => (
                                    <button
                                        key={year}
                                        type="button"
                                        onClick={() => toggleYear(year)}
                                        className={cn(
                                            "flex-1 py-3 border-2 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-1",
                                            selectedYears.includes(year)
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600"
                                        )}
                                    >
                                        <span className="text-lg">{year}</span>
                                        <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">
                                            {year === 1 ? 'ère' : 'ème'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {selectedYears.length === 0 && (
                                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                    <AlertCircle size={12} /> Veuillez sélectionner au moins une année.
                                </p>
                            )}
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                            <div className="mt-0.5">
                                <AlertCircle size={16} className="text-blue-600" />
                            </div>
                            <div className="text-sm text-blue-800">
                                <strong>Note sur la création des classes :</strong>
                                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                    Créer cette section vous permettra par la suite d'y attacher des matières et de générer vos classes (ex: 3ème Sc A, 3ème Sc B).
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !name || !code || selectedYears.length === 0}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm w-full sm:w-auto"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Sauvegarder la section
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
