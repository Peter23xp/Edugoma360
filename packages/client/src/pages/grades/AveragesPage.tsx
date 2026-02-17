import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download } from 'lucide-react';
import api from '../../lib/api';
import { useSchoolStore } from '../../stores/school.store';
import DataTable from '../../components/shared/DataTable';

export default function AveragesPage() {
    const { activeTermId } = useSchoolStore();
    const [classId, setClassId] = useState('');

    const { data: classes } = useQuery({ queryKey: ['classes-list'], queryFn: async () => (await api.get('/settings/classes')).data });

    const { data: averages, isLoading } = useQuery({
        queryKey: ['averages', classId, activeTermId],
        queryFn: async () => (await api.get(`/grades/averages?classId=${classId}&termId=${activeTermId}`)).data,
        enabled: !!classId && !!activeTermId,
    });

    const columns = [
        { key: 'rank', label: 'Rang', render: (r: Record<string, unknown>) => <span className="font-bold text-primary">{String(r.rank)}</span>, className: 'text-center w-16' },
        { key: 'studentName', label: 'Élève', render: (r: Record<string, unknown>) => <span className="font-medium">{String(r.studentName)}</span> },
        { key: 'totalPoints', label: 'Total Pts', className: 'text-center' },
        { key: 'generalAverage', label: 'Moy. Gén.', render: (r: Record<string, unknown>) => <span className="font-bold">{String(r.generalAverage)}/20</span>, className: 'text-center' },
        {
            key: 'decision', label: 'Décision', render: (r: Record<string, unknown>) => {
                const d = String(r.decision);
                const c = d === 'ADMITTED' ? 'text-success' : d === 'DISTINCTION' ? 'text-info' : d === 'GREAT_DISTINCTION' ? 'text-primary font-bold' : 'text-danger';
                return <span className={c}>{d}</span>;
            }
        },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><BarChart3 size={22} /> Moyennes et Classement</h1>
                <button className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100"><Download size={14} /> Exporter PDF</button>
            </div>

            <div className="bg-white rounded-xl border border-neutral-300/50 p-4">
                <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full sm:w-64 border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Sélectionner une classe...</option>
                    {classes?.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <DataTable columns={columns} data={averages?.students ?? []} isLoading={isLoading} emptyMessage="Sélectionnez une classe pour voir les moyennes" />
        </div>
    );
}
