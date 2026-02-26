import React, { useState, useEffect } from 'react';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { TEACHER_STATUS } from '@edugoma360/shared';
import axios from 'axios';

interface TeacherFiltersProps {
    onFilter: (filters: any) => void;
    isLoading?: boolean;
}

export const TeacherFilters: React.FC<TeacherFiltersProps> = ({ onFilter, isLoading }) => {
    const [filters, setFilters] = useState<any>({
        search: '',
        status: '',
        subjectId: '',
        section: '',
    });

    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        // Fetch subjects for dropdown
        const fetchSubjects = async () => {
            try {
                const { data } = await axios.get('/api/subjects');
                setSubjects(data.data || []);
            } catch (error) {
                console.error('Failed to fetch subjects', error);
            }
        };
        fetchSubjects();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const handleReset = () => {
        const resetFilters = { search: '', status: '', subjectId: '', section: '' };
        setFilters(resetFilters);
        onFilter(resetFilters);
    };

    const hasFilters = Object.values(filters).some(v => v !== '');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Recherche</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleChange}
                            placeholder="Rechercher par nom, post-nom, matricule..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-sm outline-none"
                        />
                        {filters.search && (
                            <button
                                onClick={() => handleChange({ target: { name: 'search', value: '' } } as any)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="w-full lg:w-48">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Statut</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 py-2.5 px-4 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm appearance-none cursor-pointer"
                    >
                        <option value="">Tous les statuts</option>
                        {Object.entries(TEACHER_STATUS).map(([key, value]) => (
                            <option key={key} value={key}>{value.label}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full lg:w-48">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Matière</label>
                    <select
                        name="subjectId"
                        value={filters.subjectId}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 py-2.5 px-4 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm appearance-none cursor-pointer"
                    >
                        <option value="">Toutes les matières</option>
                        {subjects.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full lg:w-48">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Section</label>
                    <select
                        name="section"
                        value={filters.section}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 py-2.5 px-4 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm appearance-none cursor-pointer"
                    >
                        <option value="">Toutes les sections</option>
                        <option value="TC">Tronc Commun</option>
                        <option value="SC">Scientifique</option>
                        <option value="CG">Commerciale</option>
                        <option value="PE">Pédagogique</option>
                    </select>
                </div>

                <div className="w-full lg:w-auto flex gap-2">
                    {hasFilters && (
                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-sm border border-gray-100 w-full lg:w-auto"
                        >
                            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                            <span className="lg:hidden">Réinitialiser</span>
                        </button>
                    )}
                    <button
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-xl hover:bg-green-800 transition-all shadow-md active:scale-95 font-semibold text-sm w-full lg:w-auto"
                    >
                        <Filter size={18} /> Filtrer
                    </button>
                </div>
            </div>
        </div>
    );
};
