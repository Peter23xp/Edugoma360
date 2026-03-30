import React from 'react';
import { Search, Hash, Layers } from 'lucide-react';

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
        <div className="bg-white p-4 rounded-xl border border-neutral-300/50 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-3">

                {/* RECHERCHE ENSEIGNANT */}
                <div className="flex-1">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un enseignant..."
                            value={currentFilters.searchTeacher || ''}
                            onChange={(e) => onFilterChange({ ...currentFilters, searchTeacher: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl 
                                       focus:bg-white focus:border-primary focus:outline-none focus:ring-2 
                                       focus:ring-primary/10 transition-all text-sm text-neutral-900 
                                       placeholder:text-neutral-400"
                        />
                    </div>
                </div>

                {/* SECTION */}
                <div className="w-full lg:w-52">
                    <div className="relative">
                        <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <select
                            value={currentFilters.sectionId || ''}
                            onChange={(e) => onFilterChange({ ...currentFilters, sectionId: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl 
                                       focus:bg-white focus:border-primary focus:outline-none focus:ring-2 
                                       focus:ring-primary/10 transition-all text-sm text-neutral-900 
                                       appearance-none cursor-pointer"
                        >
                            <option value="">Toutes les sections</option>
                            {Array.isArray(sections) && sections.map(s => (
                                <option key={s.id} value={s.id}>{s.name || s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ANNÉE ACADÉMIQUE */}
                <div className="w-full lg:w-52">
                    <div className="relative">
                        <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <select
                            value={currentFilters.academicYearId || ''}
                            onChange={(e) => onFilterChange({ ...currentFilters, academicYearId: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl 
                                       focus:bg-white focus:border-primary focus:outline-none focus:ring-2 
                                       focus:ring-primary/10 transition-all text-sm text-neutral-900 
                                       appearance-none cursor-pointer"
                        >
                            {Array.isArray(academicYears) && academicYears.map(y => (
                                <option key={y.id} value={y.id}>{y.label} {y.isActive ? '(Actuelle)' : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
