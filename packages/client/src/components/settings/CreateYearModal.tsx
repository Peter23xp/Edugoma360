import { useState, useEffect } from 'react';
import { X, Calendar as CalIcon, Loader2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { differenceInWeeks, addDays, parseISO, format } from 'date-fns';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface TermDraft {
    number: number;
    startDate: string;
    endDate: string;
}

interface CreateYearModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
    hasActiveYear?: boolean;
    activeYearName?: string;
}

function weeksBetween(start: string, end: string): number {
    if (!start || !end) return 0;
    try { return Math.max(0, differenceInWeeks(parseISO(end), parseISO(start))); }
    catch { return 0; }
}

const INPUT_CLS = "w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white";
const LABEL_CLS = "block text-sm font-semibold text-neutral-700 mb-1.5";

function generateDefaultName(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return m >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function getDefaultDates(name: string): { start: string; end: string } {
    const match = name.match(/^(\d{4})-(\d{4})$/);
    if (match) {
        return {
            start: `${match[1]}-09-04`,
            end: `${match[2]}-06-30`,
        };
    }
    const y = new Date().getFullYear();
    return { start: `${y}-09-04`, end: `${y + 1}-06-30` };
}

function buildTerms(startDate: string, endDate: string, type: 'TRIMESTRES' | 'SEMESTRES'): TermDraft[] {
    const count = type === 'TRIMESTRES' ? 3 : 2;
    const totalDays = differenceInWeeks(parseISO(endDate), parseISO(startDate)) * 7;
    const daysPerTerm = Math.floor(totalDays / count);
    let current = parseISO(startDate);
    const terms: TermDraft[] = [];
    for (let i = 1; i <= count; i++) {
        const end = i === count ? parseISO(endDate) : addDays(current, daysPerTerm - 1);
        terms.push({
            number: i,
            startDate: format(current, 'yyyy-MM-dd'),
            endDate: format(end, 'yyyy-MM-dd'),
        });
        current = addDays(end, 1);
    }
    return terms;
}

export default function CreateYearModal({ isOpen, onClose, onSubmit, isSubmitting, hasActiveYear, activeYearName }: CreateYearModalProps) {
    const [name, setName] = useState(generateDefaultName);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState<'TRIMESTRES' | 'SEMESTRES'>('TRIMESTRES');
    const [activateImmediately, setActivateImmediately] = useState(true);
    const [terms, setTerms] = useState<TermDraft[]>([]);
    const [expandedTerm, setExpandedTerm] = useState<number | null>(null);

    // Auto-fill dates from name
    useEffect(() => {
        if (/^\d{4}-\d{4}$/.test(name)) {
            const { start, end } = getDefaultDates(name);
            setStartDate(start);
            setEndDate(end);
        }
    }, [name]);

    // Rebuild terms on date/type change
    useEffect(() => {
        if (!startDate || !endDate) return;
        if (parseISO(startDate) >= parseISO(endDate)) return;
        setTerms(buildTerms(startDate, endDate, type));
    }, [startDate, endDate, type]);

    const totalWeeks = weeksBetween(startDate, endDate);
    const termsWeeksTotal = terms.reduce((acc, t) => acc + weeksBetween(t.startDate, t.endDate), 0);

    const handleTermChange = (idx: number, field: 'startDate' | 'endDate', val: string) => {
        const t = [...terms];
        t[idx] = { ...t[idx], [field]: val };
        setTerms(t);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate || !name.trim()) return toast.error("Veuillez remplir les champs obligatoires");
        if (!/^\d{4}-\d{4}$/.test(name)) return toast.error("Format du nom invalide. Ex: 2025-2026");
        if (parseISO(startDate) >= parseISO(endDate)) return toast.error("La date de fin doit être après le début");

        for (const t of terms) {
            if (!t.startDate || !t.endDate) return toast.error(`Dates incomplètes pour la période ${t.number}`);
            if (t.startDate > t.endDate) return toast.error(`Période ${t.number} : date de fin avant le début`);
            const w = weeksBetween(t.startDate, t.endDate);
            if (w < 6) return toast.error(`Période ${t.number} trop courte (${w} semaines, min 6 requis)`);
            if (w > 20) return toast.error(`Période ${t.number} trop longue (${w} semaines, max 20)`);
        }

        try {
            await onSubmit({
                name: name.trim(),
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                type,
                activateImmediately,
                terms: terms.map(t => ({
                    number: t.number,
                    startDate: new Date(t.startDate).toISOString(),
                    endDate: new Date(t.endDate).toISOString(),
                })),
            });
            onClose();
        } catch { /* handled by hook */ }
    };

    if (!isOpen) return null;

    const termLabel = (n: number) => type === 'TRIMESTRES' ? `Trimestre ${n}` : `Semestre ${n}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <div>
                        <h2 className="font-bold text-neutral-900 text-base">Nouvelle année scolaire</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Définissez les dates et les périodes</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <div className="px-6 py-5 space-y-5">

                        {/* Name */}
                        <div>
                            <label className={LABEL_CLS}>Nom de l'année *</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="2025-2026"
                                pattern="\d{4}-\d{4}"
                                className={INPUT_CLS}
                                required
                            />
                            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                                <Info size={11} /> Format AAAA-AAAA — les dates se remplissent automatiquement
                            </p>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={LABEL_CLS}>
                                    <CalIcon size={13} className="inline mr-1 text-neutral-400" />Date de début *
                                </label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={INPUT_CLS} required />
                            </div>
                            <div>
                                <label className={LABEL_CLS}>
                                    <CalIcon size={13} className="inline mr-1 text-neutral-400" />Date de fin *
                                </label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={INPUT_CLS} required />
                            </div>
                        </div>

                        {totalWeeks > 0 && (
                            <div className="flex items-center gap-2 text-sm bg-primary/5 border border-primary/15 rounded-lg px-4 py-2.5">
                                <span className="text-primary font-semibold">Durée calculée :</span>
                                <span className="font-bold text-primary">{totalWeeks} semaines</span>
                            </div>
                        )}

                        <hr className="border-neutral-100" />

                        {/* Type */}
                        <div>
                            <label className={LABEL_CLS}>Découpage en trimestres / semestres</label>
                            <div className="grid grid-cols-2 gap-3">
                                {(['TRIMESTRES', 'SEMESTRES'] as const).map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={cn(
                                            "py-3 border-2 rounded-xl text-sm font-semibold transition-all",
                                            type === t
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                                        )}
                                    >
                                        {t === 'TRIMESTRES' ? '3 Trimestres' : '2 Semestres'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Terms */}
                        {terms.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className={LABEL_CLS + " mb-0"}>Périodes académiques</label>
                                    {totalWeeks > 0 && (
                                        <span className="text-xs text-neutral-400">
                                            Total : {termsWeeksTotal} sem.
                                            {totalWeeks - termsWeeksTotal > 0 && ` · ${totalWeeks - termsWeeksTotal} sem. de vacances`}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {terms.map((t, idx) => {
                                        const w = weeksBetween(t.startDate, t.endDate);
                                        const isExpanded = expandedTerm === idx;
                                        return (
                                            <div key={idx} className="border border-neutral-200 rounded-xl overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedTerm(isExpanded ? null : idx)}
                                                    className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-neutral-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                                            {t.number}
                                                        </span>
                                                        <span className="font-semibold text-neutral-800">{termLabel(t.number)}</span>
                                                        <span className="text-xs text-neutral-400">
                                                            {t.startDate ? format(parseISO(t.startDate), 'dd/MM') : '—'} → {t.endDate ? format(parseISO(t.endDate), 'dd/MM') : '—'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", w >= 8 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700")}>
                                                            {w} sem.
                                                        </span>
                                                        {isExpanded ? <ChevronUp size={14} className="text-neutral-400" /> : <ChevronDown size={14} className="text-neutral-400" />}
                                                    </div>
                                                </button>
                                                {isExpanded && (
                                                    <div className="px-4 pb-4 pt-1 bg-neutral-50/60 border-t border-neutral-100 grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-neutral-600 mb-1">Début</label>
                                                            <input
                                                                type="date"
                                                                value={t.startDate}
                                                                onChange={e => handleTermChange(idx, 'startDate', e.target.value)}
                                                                className="w-full border border-neutral-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-neutral-600 mb-1">Fin</label>
                                                            <input
                                                                type="date"
                                                                value={t.endDate}
                                                                onChange={e => handleTermChange(idx, 'endDate', e.target.value)}
                                                                className="w-full border border-neutral-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <hr className="border-neutral-100" />

                        {/* Activate immediately */}
                        <label className={cn(
                            "flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all",
                            activateImmediately ? "border-primary bg-primary/5" : "border-neutral-200 hover:border-neutral-300"
                        )}>
                            <input
                                type="checkbox"
                                checked={activateImmediately}
                                onChange={e => setActivateImmediately(e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded text-primary accent-primary"
                            />
                            <div className="text-sm">
                                <p className="font-semibold text-neutral-900">Activer immédiatement cette année</p>
                                {hasActiveYear && activeYearName ? (
                                    <p className="text-xs text-orange-600 mt-0.5">⚠️ L'année {activeYearName} sera clôturée automatiquement</p>
                                ) : (
                                    <p className="text-neutral-500 text-xs mt-0.5">L'année sera immédiatement disponible pour les présences et notes</p>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !startDate || !endDate || terms.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
                        >
                            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                            Créer l'année
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
