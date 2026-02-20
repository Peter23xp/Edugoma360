import { Search, Filter, X } from 'lucide-react';
import { EVAL_TYPE_OPTIONS } from '@edugoma360/shared/constants/evalTypes';
import type { GradeFiltersState } from '@edugoma360/shared/types/academic';

interface SubjectOption { id: string; name: string }
interface ClassOption { id: string; name: string }
interface TermOption { id: string; name: string }

interface GradeFiltersProps {
    filters: GradeFiltersState;
    onChange: (filters: GradeFiltersState) => void;
    classes: ClassOption[];
    subjects: SubjectOption[];
    terms: TermOption[];
    searchValue?: string;
    onSearchChange?: (q: string) => void;
}

export default function GradeFilters({
    filters,
    onChange,
    classes,
    subjects,
    terms,
    searchValue = '',
    onSearchChange,
}: GradeFiltersProps) {
    const selectClass = 'h-9 px-3 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-700 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none';

    const hasFilters = !!filters.classId || !!filters.subjectId || !!filters.termId || !!filters.evalType;

    const reset = () => {
        onChange({ classId: '', subjectId: '', termId: '', evalType: '' });
        onSearchChange?.('');
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Recherche */}
            {onSearchChange && (
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Rechercher élève…"
                        className="h-9 pl-9 pr-4 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none w-48"
                    />
                </div>
            )}

            <div className="flex items-center gap-2">
                <Filter size={15} className="text-neutral-400" />

                {/* Classe */}
                <select
                    value={filters.classId}
                    onChange={(e) => onChange({ ...filters, classId: e.target.value })}
                    className={selectClass}
                    aria-label="Filtrer par classe"
                >
                    <option value="">Toutes classes</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                {/* Matière */}
                <select
                    value={filters.subjectId}
                    onChange={(e) => onChange({ ...filters, subjectId: e.target.value })}
                    className={selectClass}
                    aria-label="Filtrer par matière"
                >
                    <option value="">Toutes matières</option>
                    {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>

                {/* Trimestre */}
                <select
                    value={filters.termId}
                    onChange={(e) => onChange({ ...filters, termId: e.target.value })}
                    className={selectClass}
                    aria-label="Filtrer par trimestre"
                >
                    <option value="">Tous trimestres</option>
                    {terms.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>

                {/* Type d'évaluation */}
                <select
                    value={filters.evalType}
                    onChange={(e) => onChange({ ...filters, evalType: e.target.value as GradeFiltersState['evalType'] })}
                    className={selectClass}
                    aria-label="Filtrer par type d'évaluation"
                >
                    <option value="">Tous types</option>
                    {EVAL_TYPE_OPTIONS.map((et) => (
                        <option key={et.code} value={et.code}>{et.label}</option>
                    ))}
                </select>

                {/* Reset */}
                {hasFilters && (
                    <button
                        onClick={reset}
                        className="h-9 px-3 flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                        aria-label="Réinitialiser les filtres"
                    >
                        <X size={14} />
                        Effacer
                    </button>
                )}
            </div>
        </div>
    );
}

