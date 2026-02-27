import React from 'react';
import { Search, Filter, Hash, Layers } from 'lucide-react';

interface MatrixFiltersProps {
    onFilterChange: (filters: any) => void;
    sections: any[];
    academicYears: any[];
    currentFilters: any;
}

export const MatrixFilters: React.FC<MatrixFiltersProps> = ({
    onFilterChange,
    sections,
    academicYears,
    currentFilters
}) => {
    return (
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col lg:flex-row gap-6">

                {/* RECHERCHE ENSEIGNANT */}
                <div className="flex-1 group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-blue-600 transition-colors">Rechercher un enseignant</label>
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="MUKASA, BAHATI..."
                            value={currentFilters.searchTeacher || ''}
                            onChange={(e) => onFilterChange({ ...currentFilters, searchTeacher: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900 placeholder:text-slate-200"
                        />
                    </div>
                </div>

                {/* SECTION */}
                <div className="w-full lg:w-64 group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-blue-600 transition-colors">Section</label>
                    <div className="relative">
                        <Layers size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                        <select
                            value={currentFilters.sectionId || ''}
                            onChange={(e) => onFilterChange({ ...currentFilters, sectionId: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                        >
                            <option value="">Toutes les sections</option>
                            {sections.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ANNÉE ACADÉMIQUE */}
                <div className="w-full lg:w-64 group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-blue-600 transition-colors">Année Scolaire</label>
                    <div className="relative">
                        <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                        <select
                            value={currentFilters.academicYearId || ''}
                            onChange={(e) => onFilterChange({ ...currentFilters, academicYearId: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900 appearance-none cursor-pointer border-blue-100"
                        >
                            {academicYears.map(y => (
                                <option key={y.id} value={y.id}>{y.label} {y.isActive ? '(Actuelle)' : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* BOUTON FILTRES AVANCÉS */}
                <div className="flex items-end">
                    <button className="h-[52px] px-6 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all border-2 border-slate-50">
                        <Filter size={16} /> Filtres
                    </button>
                </div>
            </div>
        </div>
    );
};
