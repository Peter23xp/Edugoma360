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
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-neutral-300 p-6">
        <h3 className="text-lg font-bold mb-4">Rechercher un élève</h3>
        
        {!selectedStudent ? (
          <div className="space-y-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                autoFocus
                placeholder="Matricule, nom, ou téléphone tuteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {isLoading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin" />}
            </div>

            {searchResults?.data?.length > 0 && (
              <div className="border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-100 shadow-sm mt-4">
                {searchResults.data.map((s: any) => (
                  <button
                    key={s.id}
                    className="w-full text-left p-4 hover:bg-primary-50 transition-colors flex items-center justify-between group"
                    onClick={() => {
                      onSelect(s);
                      setSearch('');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
                        {s.photoUrl ? <img src={s.photoUrl} alt="Photo" className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-neutral-500" />}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                          {s.nom} {s.postNom} {s.prenom}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5">
                          {s.matricule} • {s.enrollments?.[0]?.class?.name || 'Sans classe'}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-primary px-3 py-1 bg-white border border-primary-200 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                      Sélectionner
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
          <div className="bg-primary-50 rounded-lg border border-primary-100 p-5 flex items-start justify-between">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-primary-200 shadow-sm">
                 {selectedStudent.photoUrl ? <img src={selectedStudent.photoUrl} alt="Photo" className="w-full h-full object-cover" /> : <UserIcon size={24} className="text-primary" />}
               </div>
               <div>
                 <h4 className="font-bold text-lg text-neutral-900">{selectedStudent.nom} {selectedStudent.postNom} {selectedStudent.prenom}</h4>
                 <div className="text-sm text-neutral-600 font-mono mt-1 space-x-3">
                   <span>Matricule: <strong className="text-neutral-800">{selectedStudent.matricule}</strong></span>
                   <span>Classe: <strong className="text-neutral-800">{selectedStudent.enrollments?.[0]?.class?.name || 'N/A'}</strong></span>
                   {selectedStudent.telTuteur && <span>Tuteur: <strong className="text-neutral-800">{selectedStudent.telTuteur}</strong></span>}
                 </div>
               </div>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="px-4 py-2 text-sm font-medium text-primary hover:bg-white rounded-lg transition-colors border border-transparent hover:border-primary-100"
            >
              Changer d'élève
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
