import { useState, useEffect, useMemo } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { useSectionsForFilter, useTeachersForDropdown } from '../../hooks/useClasses';

interface CreateClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
}

function generateClassName(sectionCode: string, year: number, letter: string): string {
    switch (sectionCode) {
        case 'TC':
            return `TC-${year}${letter}`;
        case 'HCG':
            return `${year}HCG-${letter}`;
        default:
            return `${year}${sectionCode}${letter}`;
    }
}

const INPUT_CLS = 'w-full border border-neutral-300/50 rounded-md px-4 py-3 text-sm font-normal text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white';
const LABEL_CLS = 'block text-sm font-medium text-neutral-700 mb-2';

export default function CreateClassModal({ isOpen, onClose, onSubmit, isSubmitting }: CreateClassModalProps) {
    const { data: sections } = useSectionsForFilter();

    const [selectedSectionCode, setSelectedSectionCode] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [letter, setLetter] = useState('A');
    const [maxStudents, setMaxStudents] = useState('40');
    const [room, setRoom] = useState('');
    const [titulaireId, setTitulaireId] = useState('');

    const { data: teachers } = useTeachersForDropdown();

    // Derive unique section codes
    const sectionCodes = useMemo(() => {
        if (!sections) return [];
        const map = new Map<string, string>();
        sections.forEach(s => map.set(s.code, s.name));
        return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
    }, [sections]);

    // Derive years from selected section
    const availableYears = useMemo(() => {
        if (!sections || !selectedSectionCode) return [];
        return sections.filter(s => s.code === selectedSectionCode).map(s => s.year).sort();
    }, [sections, selectedSectionCode]);

    // Auto-select first year when section changes
    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(Number(selectedYear))) {
            setSelectedYear(String(availableYears[0]));
        }
    }, [availableYears]);

    const generatedName = selectedSectionCode && selectedYear && letter
        ? generateClassName(selectedSectionCode, Number(selectedYear), letter)
        : '—';

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSectionCode || !selectedYear || !letter) return;
        // Find the actual sectionId from sections list
        const sectionMatch = sections?.find(s => s.code === selectedSectionCode && s.year === Number(selectedYear));
        if (!sectionMatch) return;

        await onSubmit({
            name: generatedName,
            sectionId: sectionMatch.id,
            maxStudents: Number(maxStudents),
            room: room || undefined,
            titulaireId: titulaireId || undefined,
        });
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setSelectedSectionCode('');
        setSelectedYear('');
        setLetter('A');
        setMaxStudents('40');
        setRoom('');
        setTitulaireId('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col">

                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-300/50">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900">Créer une classe</h2>
                        <p className="text-sm text-neutral-500 mt-0.5">Le nom sera généré automatiquement</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <div className="px-6 py-5 space-y-6">

                        {/* Section */}
                        <div>
                            <label className={LABEL_CLS}>Section *</label>
                            <select
                                value={selectedSectionCode}
                                onChange={e => setSelectedSectionCode(e.target.value)}
                                className={INPUT_CLS}
                                required
                            >
                                <option value="">— Sélectionner une section —</option>
                                {sectionCodes.map(s => (
                                    <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>

                        {/* Year */}
                        <div>
                            <label className={LABEL_CLS}>Année *</label>
                            <select
                                value={selectedYear}
                                onChange={e => setSelectedYear(e.target.value)}
                                className={INPUT_CLS}
                                required
                                disabled={availableYears.length === 0}
                            >
                                <option value="">— Sélectionner l'année —</option>
                                {availableYears.map(y => (
                                    <option key={y} value={y}>{y === 1 ? '1ère' : `${y}ème`} année</option>
                                ))}
                            </select>
                        </div>

                        {/* Letter */}
                        <div>
                            <label className={LABEL_CLS}>Lettre / Groupe *</label>
                            <div className="flex gap-2">
                                {['A', 'B', 'C', 'D', 'E'].map(l => (
                                    <button
                                        key={l}
                                        type="button"
                                        onClick={() => setLetter(l)}
                                        className={`flex-1 py-2.5 border rounded-md text-sm font-semibold transition-all ${
                                            letter === l
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-neutral-300/50 text-neutral-500 hover:border-neutral-300'
                                        }`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generated name */}
                        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 text-center">
                            <p className="text-xs text-neutral-500 mb-1">Nom généré automatiquement</p>
                            <p className="text-xl font-bold text-primary">{generatedName}</p>
                        </div>

                        <hr className="border-neutral-100" />

                        {/* Max students */}
                        <div>
                            <label className={LABEL_CLS}>Effectif maximum *</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min={10}
                                    max={80}
                                    value={maxStudents}
                                    onChange={e => setMaxStudents(e.target.value)}
                                    className={`${INPUT_CLS} w-24`}
                                    required
                                />
                                <span className="text-sm text-neutral-500">élèves</span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> Recommandé : 35-40 pour cette section
                            </p>
                        </div>

                        {/* Room */}
                        <div>
                            <label className={LABEL_CLS}>Salle de classe</label>
                            <input
                                value={room}
                                onChange={e => setRoom(e.target.value)}
                                placeholder="ex: 201"
                                className={INPUT_CLS}
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                                Salle principale (matières théoriques)
                            </p>
                        </div>

                        <hr className="border-neutral-100" />

                        {/* Titulaire */}
                        <div>
                            <label className={LABEL_CLS}>Enseignant titulaire</label>
                            <select
                                value={titulaireId}
                                onChange={e => setTitulaireId(e.target.value)}
                                className={INPUT_CLS}
                            >
                                <option value="">— Non défini —</option>
                                {teachers?.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.nom} {t.prenom || ''} {t.postNom || ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> Peut être attribué plus tard
                            </p>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-neutral-300/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-medium text-neutral-700 bg-white border border-neutral-300/50 rounded-md hover:bg-neutral-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedSectionCode || !selectedYear || !letter}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm w-full sm:w-auto"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Créer la classe
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
