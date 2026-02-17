import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';

export default function SubjectsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['subjects-all'],
        queryFn: async () => (await api.get('/settings/subjects')).data,
    });

    const columns = [
        { key: 'name', label: 'Matière', render: (r: Record<string, unknown>) => <span className="font-medium">{String(r.name)}</span> },
        { key: 'coefficient', label: 'Coeff.', className: 'text-center' },
        { key: 'maxScore', label: 'Note max', className: 'text-center' },
        { key: 'section', label: 'Section' },
        { key: 'isOptional', label: 'Type', render: (r: Record<string, unknown>) => r.isOptional ? 'Optionnel' : 'Obligatoire' },
    ];

    return (
        <div className="space-y-5">
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><BookOpen size={22} /> Matières</h1>
            <DataTable columns={columns} data={data ?? []} isLoading={isLoading} emptyMessage="Aucune matière configurée" />
        </div>
    );
}
