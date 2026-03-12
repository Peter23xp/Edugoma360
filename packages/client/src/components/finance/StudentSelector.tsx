import { useState } from 'react';
import { Search, Loader2, User as UserIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

interface StudentSelectorProps {
  onSelect: (student: any) => void;
  selectedStudent: any | null;
}

export function StudentSelector({ onSelect, selectedStudent }: StudentSelectorProps) {
  const [search, setSearch] = useState('');

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['student-search', search],
    queryFn: async () => {
      if (search.length < 2) return null;
      const res = await api.get(`/students?search=${search}&limit=5`);
      return res.data;
    },
    enabled: search.length >= 2,
  });

  return (
    <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h3 className="text-sm font-semibold text-neutral-900">Rechercher un élève</h3>
      </div>

      <div className="p-5">
        {!selectedStudent ? (
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                autoFocus
                placeholder="Matricule, nom, ou téléphone tuteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-white border border-neutral-200 rounded-lg text-sm
                           focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              {isLoading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin" />}
            </div>

            {searchResults?.data?.length > 0 && (
              <div className="border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-100">
                {searchResults.data.map((s: any) => (
                  <button
                    key={s.id}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors flex items-center gap-3 group"
                    onClick={() => {
                      onSelect(s);
                      setSearch('');
                    }}
                  >
                    <div className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={16} className="text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-neutral-900 truncate">
                        {s.nom} {s.postNom} {s.prenom}
                      </div>
                      <div className="text-xs text-neutral-500 font-mono">
                        {s.matricule} • {s.enrollments?.[0]?.class?.name || 'Sans classe'}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      Sélectionner →
                    </span>
                  </button>
                ))}
              </div>
            )}

            {search.length >= 2 && searchResults?.data?.length === 0 && (
              <div className="text-center py-6 text-sm text-neutral-500 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                Aucun élève trouvé pour "{search}"
              </div>
            )}
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-neutral-200 overflow-hidden shrink-0">
              {selectedStudent.photoUrl ? (
                <img src={selectedStudent.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={18} className="text-neutral-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-neutral-900">
                {selectedStudent.nom} {selectedStudent.postNom} {selectedStudent.prenom}
              </div>
              <div className="text-xs text-neutral-500 font-mono mt-0.5">
                {selectedStudent.matricule} • {selectedStudent.enrollments?.[0]?.class?.name || 'N/A'}
                {selectedStudent.telTuteur && ` • Tuteur: ${selectedStudent.telTuteur}`}
              </div>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors shrink-0"
            >
              Changer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
