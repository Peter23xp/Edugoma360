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
    <div className="bg-white rounded-xl border border-neutral-300/50 p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search bar */}
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
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

        {/* Filters and Actions row */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Class filter */}
          <div className="relative sm:min-w-[160px]">
            <select
              value={filters.classId || ''}
              onChange={(e) => onFiltersChange({ ...filters, classId: e.target.value || undefined })}
              className="w-full appearance-none px-3 py-2.5 pr-8 border border-neutral-300 
                         rounded-lg text-sm bg-white hover:border-neutral-400 
                         focus:ring-2 focus:ring-primary/20 focus:border-primary 
                         outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">Toutes les classes</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>

          {/* Level filter */}
          <div className="relative sm:min-w-[160px]">
            <select
              value={filters.level || ''}
              onChange={(e) => onFiltersChange({ ...filters, level: e.target.value || undefined })}
              className="w-full appearance-none px-3 py-2.5 pr-8 border border-neutral-300 
                         rounded-lg text-sm bg-white hover:border-neutral-400 
                         focus:ring-2 focus:ring-primary/20 focus:border-primary 
                         outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">Tous les niveaux</option>
              <option value="LEGER">🟢 Retard Léger</option>
              <option value="MOYEN">🟡 Retard Moyen</option>
              <option value="ELEVE">🔴 Priorité Élevée</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>

          {/* Bulk Action */}
          <button
            onClick={onSendBulkReminders}
            className="ml-auto sm:ml-2 px-5 py-2.5 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Send size={16} /> Rappels groupés
          </button>
        </div>
      </div>
    </div>
  );
}
