import {
    CalendarIcon,
    Filter,
    School,
    Search,
    X,
    CheckSquare,
    Square
} from 'lucide-react';
import { useCallback, useState } from 'react';
import type { ClassWithStats as Class } from '@edugoma360/shared';

export interface AbsenceFiltersState {
    period: string;
    startDate?: string;
    endDate?: string;
    classIds: string[];
    types: ('ABSENT' | 'RETARD')[];
    isJustified?: boolean;
    studentSearch: string;
}

interface AbsenceFiltersProps {
    filters: AbsenceFiltersState;
    onChange: (filters: AbsenceFiltersState) => void;
    classes: Class[];
}

const PERIOD_OPTIONS = [
    { value: 'today', label: "Aujourd'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'last_month', label: 'Mois dernier' },
    { value: 'term', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
    { value: 'custom', label: 'Personnalisé...' },
];

export default function AbsenceFilters({ filters, onChange, classes }: AbsenceFiltersProps) {
    const [isTypesOpen, setIsTypesOpen] = useState(false);
    const [isClassesOpen, setIsClassesOpen] = useState(false);

    // ── Handlers ────────────────────────────────────────────────────────┐
    const update = useCallback((part: Partial<AbsenceFiltersState>) => {
        onChange({ ...filters, ...part });
    }, [filters, onChange]);

    // Derived states
    const isAllTypes = filters.types.length === 2 && filters.isJustified === undefined;

    return (
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Filter size={18} className="text-neutral-500" />
                <h3 className="font-semibold text-neutral-800 text-sm">Filtres avancés</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                
                {/* ── 1. Période ─────────────────────────────────────────── */}
                <div className="space-y-1.5 relative">
                    <label className="text-xs font-semibold text-neutral-600 ml-1">Période</label>
                    <div className="relative">
                        <select
                            value={filters.period}
                            onChange={(e) => update({ period: e.target.value })}
                            className="w-full pl-9 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer"
                        >
                            {PERIOD_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    </div>
                </div>

                {/* ── 2. Recherche ───────────────────────────────────────── */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-600 ml-1">Recherche</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Nom, matricule..."
                            value={filters.studentSearch}
                            onChange={(e) => update({ studentSearch: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                        {filters.studentSearch && (
                            <button
                                onClick={() => update({ studentSearch: '' })}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-md"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── 3. Classes (Dropdown multiple) ────────────────────── */}
                <div className="space-y-1.5 relative">
                    <label className="text-xs font-semibold text-neutral-600 ml-1">Classes</label>
                    <div 
                        className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-neutral-100 transition-colors"
                        onClick={() => { setIsClassesOpen(!isClassesOpen); setIsTypesOpen(false); }}
                    >
                        <School size={16} className="text-neutral-500 flex-shrink-0" />
                        <span className="truncate flex-1">
                            {filters.classIds.length === 0 
                                ? 'Toutes les classes' 
                                : `${filters.classIds.length} classe${filters.classIds.length > 1 ? 's' : ''}`}
                        </span>
                    </div>

                    {isClassesOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto py-2">
                            <label className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100">
                                <input 
                                    type="checkbox" 
                                    checked={filters.classIds.length === 0}
                                    onChange={() => update({ classIds: [] })}
                                    className="accent-primary w-4 h-4 rounded"
                                />
                                <span className="text-sm font-medium">Toutes (Sélectionner tout)</span>
                            </label>
                            {classes.map(c => (
                                <label key={c.id} className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={filters.classIds.includes(c.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) update({ classIds: [...filters.classIds, c.id] });
                                            else update({ classIds: filters.classIds.filter(id => id !== c.id) });
                                        }}
                                        className="accent-primary w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-neutral-700">{c.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── 4. Type (Dropdown multiple) ────────────────────────── */}
                <div className="space-y-1.5 relative">
                    <label className="text-xs font-semibold text-neutral-600 ml-1">Types d'absences</label>
                    <div 
                        className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-neutral-100 transition-colors"
                        onClick={() => { setIsTypesOpen(!isTypesOpen); setIsClassesOpen(false); }}
                    >
                        {isAllTypes ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-neutral-400" />}
                        <span className="truncate flex-1">
                            {isAllTypes ? 'Tous les statuts' : 'Statuts filtrés'}
                        </span>
                    </div>

                    {isTypesOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2">
                            
                            {/* Absences N/J */}
                            <label className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={filters.types.includes('ABSENT') && filters.isJustified !== true}
                                    onChange={(e) => {
                                        if (e.target.checked) update({ types: [...filters.types, 'ABSENT'], isJustified: false });
                                    }}
                                    className="accent-primary w-4 h-4 rounded"
                                />
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-sm text-neutral-700">Absences non justifiées</span>
                            </label>

                            {/* Absences JUSTIFIÉES */}
                            <label className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={filters.types.includes('ABSENT') && filters.isJustified !== false}
                                    onChange={(e) => {
                                        if (e.target.checked) update({ types: [...filters.types, 'ABSENT'], isJustified: true });
                                    }}
                                    className="accent-primary w-4 h-4 rounded"
                                />
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-sm text-neutral-700">Absences justifiées</span>
                            </label>

                            {/* Retards */}
                            <label className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 cursor-pointer border-t border-neutral-100">
                                <input 
                                    type="checkbox" 
                                    checked={filters.types.includes('RETARD')}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            update({ types: Array.from(new Set([...filters.types, 'RETARD'])) });
                                        } else {
                                            update({ types: filters.types.filter(t => t !== 'RETARD') });
                                        }
                                    }}
                                    className="accent-orange-500 w-4 h-4 rounded"
                                />
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                <span className="text-sm text-neutral-700">Retards</span>
                            </label>

                            {/* Reset btn */}
                            <div className="px-4 pt-2 mt-1 border-t border-neutral-100">
                                <button
                                    onClick={() => update({ types: ['ABSENT', 'RETARD'], isJustified: undefined })}
                                    className="text-xs text-primary font-medium hover:underline"
                                >
                                    Tout sélectionner
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
            
            {/* Close backdrops */}
            {(isClassesOpen || isTypesOpen) && (
                <div 
                    className="fixed inset-0 z-40 transparent" 
                    onClick={() => { setIsClassesOpen(false); setIsTypesOpen(false); }}
                />
            )}
        </div>
    );
}
