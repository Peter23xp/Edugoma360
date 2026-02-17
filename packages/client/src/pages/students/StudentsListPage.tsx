import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Upload } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import ScreenBadge from '../../components/shared/ScreenBadge';
import { formatStudentName, formatDate } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

export default function StudentsListPage() {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [classFilter, setClassFilter] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['students', page, search, classFilter],
        queryFn: async () => {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (search) params.set('search', search);
            if (classFilter) params.set('classId', classFilter);
            const res = await api.get(`/students?${params}`);
            return res.data;
        },
    });

    const { data: classes } = useQuery({
        queryKey: ['classes-list'],
        queryFn: async () => {
            const res = await api.get('/settings/classes');
            return res.data;
        },
    });

    const columns = [
        {
            key: 'matricule',
            label: 'Matricule',
            render: (row: Record<string, unknown>) => (
                <span className="font-mono text-xs text-primary font-semibold">{String(row.matricule)}</span>
            ),
        },
        {
            key: 'nom',
            label: 'Nom complet',
            render: (row: Record<string, unknown>) => (
                <span className="font-medium">
                    {formatStudentName(String(row.nom), String(row.postNom), row.prenom as string | null)}
                </span>
            ),
        },
        {
            key: 'sexe',
            label: 'Sexe',
            render: (row: Record<string, unknown>) => (
                <ScreenBadge label={String(row.sexe)} variant={row.sexe === 'M' ? 'info' : 'warning'} />
            ),
            className: 'text-center',
        },
        {
            key: 'className',
            label: 'Classe',
            render: (row: Record<string, unknown>) => String((row as Record<string, unknown>).className ?? '—'),
        },
        {
            key: 'dateNaissance',
            label: 'Date de naissance',
            render: (row: Record<string, unknown>) => formatDate(String(row.dateNaissance)),
        },
        {
            key: 'statut',
            label: 'Statut',
            render: (row: Record<string, unknown>) => {
                const s = String(row.statut);
                const variant = s === 'NOUVEAU' ? 'success' : s === 'REDOUBLANT' ? 'warning' : 'neutral';
                return <ScreenBadge label={s} variant={variant} />;
            },
        },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-neutral-900">Élèves</h1>
                    <p className="text-sm text-neutral-500">
                        {data?.total ?? 0} élève(s) inscrit(s)
                    </p>
                </div>
                {hasRole('SUPER_ADMIN', 'PREFET', 'SECRETAIRE') && (
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100">
                            <Upload size={14} /> Importer Excel
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100">
                            <Download size={14} /> Exporter
                        </button>
                        <button
                            onClick={() => navigate('/students/new')}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                            <Plus size={14} /> Nouveau
                        </button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, matricule..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                    />
                </div>
                <select
                    value={classFilter}
                    onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white"
                >
                    <option value="">Toutes les classes</option>
                    {classes?.map((c: { id: string; name: string }) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={data?.students ?? []}
                page={page}
                totalPages={data?.totalPages ?? 1}
                totalItems={data?.total}
                onPageChange={setPage}
                onRowClick={(row) => navigate(`/students/${row.id}`)}
                isLoading={isLoading}
                emptyMessage="Aucun élève trouvé"
            />
        </div>
    );
}
