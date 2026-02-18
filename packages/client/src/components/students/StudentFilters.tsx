import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { useClasses } from '../../hooks/useStudents';
import { SECTIONS as SHARED_SECTIONS } from '@edugoma360/shared';

interface StudentFiltersProps {
    classId: string;
    section: string;
    status: string;
    search: string;
    onClassChange: (classId: string) => void;
    onSectionChange: (section: string) => void;
    onStatusChange: (status: string) => void;
    onSearchChange: (q: string) => void;
}

const SECTIONS = [
    { value: '', label: 'Toutes les sections' },
    ...SHARED_SECTIONS.map((s) => ({ value: s.code, label: s.name })),
];

const STATUTS = [
    { value: '', label: 'Tous les statuts' },
    { value: 'NOUVEAU', label: 'Actif' },
    { value: 'REDOUBLANT', label: 'Redoublant' },
    { value: 'TRANSFERE', label: 'Transféré' },
    { value: 'DEPLACE', label: 'Déplacé' },
    { value: 'REFUGIE', label: 'Réfugié' },
    { value: 'ARCHIVE', label: 'Archivé' },
];

export default function StudentFilters({
    classId,
    section,
    status,
    search,
    onClassChange,
    onSectionChange,
    onStatusChange,
    onSearchChange,
}: StudentFiltersProps) {
    const { data: classes = [] } = useClasses();
    const [localSearch, setLocalSearch] = useState(search);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Debounced search
    const handleSearchInput = useCallback(
        (value: string) => {
            setLocalSearch(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                onSearchChange(value);
            }, 300);
        },
        [onSearchChange],
    );

    const clearSearch = useCallback(() => {
        setLocalSearch('');
        onSearchChange('');
    }, [onSearchChange]);

    // Sync external search prop changes
    useEffect(() => {
        setLocalSearch(search);
    }, [search]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const activeFilterCount = [classId, section, status, search].filter(Boolean).length;

    return (
        <div className="bg-white rounded-xl border border-neutral-300/50 p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-3">
                {/* Search bar */}
                <div className="relative flex-1 min-w-0">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                    />
                    <input
                        id="student-search-input"
                        type="text"
                        placeholder="Rechercher par nom, post-nom ou matricule..."
                        value={localSearch}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-neutral-300 rounded-lg 
                                   focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none 
                                   text-sm transition-all duration-200 bg-neutral-100/30 
                                   hover:border-neutral-400 placeholder:text-neutral-400"
                    />
                    {localSearch && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 
                                       rounded-full hover:bg-neutral-200 text-neutral-400 
                                       hover:text-neutral-600 transition-colors"
                            aria-label="Effacer la recherche"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    {/* Class filter */}
                    <div className="relative min-w-[160px]">
                        <select
                            id="student-class-filter"
                            value={classId}
                            onChange={(e) => onClassChange(e.target.value)}
                            className="w-full appearance-none px-3 py-2.5 pr-8 border border-neutral-300 
                                       rounded-lg text-sm bg-white hover:border-neutral-400 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       outline-none transition-all duration-200 cursor-pointer"
                        >
                            <option value="">Toutes les classes</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                    </div>

                    {/* Section filter */}
                    <div className="relative min-w-[160px]">
                        <select
                            id="student-section-filter"
                            value={section}
                            onChange={(e) => onSectionChange(e.target.value)}
                            className="w-full appearance-none px-3 py-2.5 pr-8 border border-neutral-300 
                                       rounded-lg text-sm bg-white hover:border-neutral-400 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       outline-none transition-all duration-200 cursor-pointer"
                        >
                            {SECTIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="relative min-w-[140px]">
                        <select
                            id="student-status-filter"
                            value={status}
                            onChange={(e) => onStatusChange(e.target.value)}
                            className="w-full appearance-none px-3 py-2.5 pr-8 border border-neutral-300 
                                       rounded-lg text-sm bg-white hover:border-neutral-400 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       outline-none transition-all duration-200 cursor-pointer"
                        >
                            {STATUTS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                    </div>
                </div>
            </div>

            {/* Active filters indicator */}
            {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                    <Filter size={12} className="text-primary" />
                    <span className="text-xs text-primary font-medium">
                        {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => {
                            onClassChange('');
                            onSectionChange('');
                            onStatusChange('');
                            clearSearch();
                        }}
                        className="text-xs text-neutral-500 hover:text-danger transition-colors ml-auto underline"
                    >
                        Réinitialiser
                    </button>
                </div>
            )}
        </div>
    );
}
