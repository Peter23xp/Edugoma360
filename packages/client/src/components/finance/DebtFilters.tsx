import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, ChevronDown, Send } from 'lucide-react';
import { useClassesList } from '../../hooks/useClassesList';

interface DebtFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onSendBulkReminders: () => void;
}

export function DebtFilters({ filters, onFiltersChange, onSendBulkReminders }: DebtFiltersProps) {
  const { data: classes = [] } = useClassesList();
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchInput = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFiltersChange({ ...filters, search: value || undefined, page: 1 });
      }, 300);
    },
    [filters, onFiltersChange]
  );

  const clearSearch = useCallback(() => {
    setLocalSearch('');
    onFiltersChange({ ...filters, search: undefined, page: 1 });
  }, [filters, onFiltersChange]);

  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, post-nom ou matricule"
            value={localSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-10 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-500 hover:border-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          {localSearch && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 rounded-lg p-1 -translate-y-1/2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Effacer la recherche"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative sm:min-w-[168px]">
            <select
              value={filters.classId || ''}
              onChange={(e) => onFiltersChange({ ...filters, classId: e.target.value || undefined })}
              className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-8 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="">Toutes les classes</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          </div>

          <div className="relative sm:min-w-[168px]">
            <select
              value={filters.level || ''}
              onChange={(e) => onFiltersChange({ ...filters, level: e.target.value || undefined })}
              className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-8 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="">Tous les niveaux</option>
              <option value="LEGER">Retard léger</option>
              <option value="MOYEN">Retard moyen</option>
              <option value="ELEVE">Priorité élevée</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          </div>

          <button
            onClick={onSendBulkReminders}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <Send className="h-4 w-4" />
            Rappels groupés
          </button>
        </div>
      </div>
    </div>
  );
}
