import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Plus, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import ScreenBadge from '../../components/shared/ScreenBadge';
import toast from 'react-hot-toast';

export default function AcademicYearPage() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [label, setLabel] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['academic-years'],
        queryFn: async () => (await api.get('/settings/academic-years')).data,
    });

    const createMutation = useMutation({
        mutationFn: async () => api.post('/settings/academic-years', { label, startDate, endDate }),
        onSuccess: () => {
            toast.success('Année académique créée');
            queryClient.invalidateQueries({ queryKey: ['academic-years'] });
            setShowForm(false); setLabel(''); setStartDate(''); setEndDate('');
        },
        onError: () => toast.error('Erreur de création'),
    });

    const columns = [
        { key: 'label', label: 'Année', render: (r: Record<string, unknown>) => <span className="font-semibold">{String(r.label)}</span> },
        { key: 'isCurrent', label: 'Statut', render: (r: Record<string, unknown>) => r.isCurrent ? <ScreenBadge label="En cours" variant="success" /> : <ScreenBadge label="Clôturée" variant="neutral" /> },
        { key: 'terms', label: 'Trimestres', render: (r: Record<string, unknown>) => String((r.terms as unknown[])?.length ?? 0) },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><CalendarCheck size={22} /> Années académiques</h1>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"><Plus size={14} /> Nouvelle année</button>
            </div>

            {showForm && (
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="input-label">Label *</label><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="2025-2026" required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Début *</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Fin *</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                    <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center gap-2">{createMutation.isPending && <Loader2 size={14} className="animate-spin" />} Créer</button>
                </form>
            )}

            <DataTable columns={columns} data={data ?? []} isLoading={isLoading} emptyMessage="Aucune année académique" />
        </div>
    );
}
