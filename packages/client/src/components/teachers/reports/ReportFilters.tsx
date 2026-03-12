import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Search, Filter, Calendar, BookOpen, Layers } from 'lucide-react';

interface ReportFiltersProps {
    filters: any;
    setFilters: (filters: any) => void;
}

export default function ReportFilters({ filters, setFilters }: ReportFiltersProps) {
    // Fetch academic years and terms
    const { data: terms = [] } = useQuery({
        queryKey: ['terms-all'],
        queryFn: async () => {
            const { data } = await api.get('/settings/terms');
            return data.data || data;
        }
    });

    // Fetch sections
    const { data: sections = [] } = useQuery({
        queryKey: ['sections-all'],
        queryFn: async () => {
            const { data } = await api.get('/settings/sections');
            return data.data || data;
        }
    });

    // Fetch subjects
    const { data: subjects = [] } = useQuery({
        queryKey: ['subjects-all'],
        queryFn: async () => {
            const { data } = await api.get('/settings/subjects');
            return data.data || data;
        }
    });

    return (
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                {/* Trimestre */}
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Trimestre
                    </label>
                    <select
                        className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={filters.termId}
                        onChange={(e) => setFilters({ ...filters, termId: e.target.value })}
                    >
                        <option value="">Sélectionner un trimestre</option>
                        {terms.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>

                {/* Section */}
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-2">
                        <Layers size={14} /> Section
                    </label>
                    <select
                        className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={filters.sectionId}
                        onChange={(e) => setFilters({ ...filters, sectionId: e.target.value })}
                    >
                        <option value="">Toutes les sections</option>
                        {sections.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                {/* Matière */}
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-2">
                        <BookOpen size={14} /> Matière
                    </label>
                    <select
                        className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={filters.subjectId}
                        onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}
                    >
                        <option value="">Toutes les matières</option>
                        {subjects.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                {/* Performance */}
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-2">
                        <Filter size={14} /> Performance
                    </label>
                    <select
                        className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={filters.performance}
                        onChange={(e) => setFilters({ ...filters, performance: e.target.value })}
                    >
                        <option value="">Tous les niveaux</option>
                        <option value="EXCELLENT">Excellent</option>
                        <option value="BON">Bon</option>
                        <option value="MOYEN">Moyen</option>
                        <option value="FAIBLE">Faible</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un enseignant..."
                        className="w-full h-10 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>

                <button
                    onClick={() => setFilters({ termId: filters.termId, sectionId: '', subjectId: '', performance: '', search: '' })}
                    className="h-10 px-4 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                    Réinitialiser
                </button>
            </div>
        </div>
    );
}
