import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Download, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import ScreenBadge from '../../components/shared/ScreenBadge';
import { formatFC } from '@edugoma360/shared';
import { formatStudentName } from '../../lib/utils';

export default function DebtsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['debts'],
        queryFn: async () => (await api.get('/finance/debts')).data,
    });

    const columns = [
        { key: 'studentName', label: 'Élève', render: (r: Record<string, unknown>) => <span className="font-medium">{formatStudentName(String(r.nom), String(r.postNom), r.prenom as string)}</span> },
        { key: 'className', label: 'Classe' },
        { key: 'totalDue', label: 'Total dû', render: (r: Record<string, unknown>) => formatFC(Number(r.totalDue)), className: 'text-right' },
        { key: 'totalPaid', label: 'Total payé', render: (r: Record<string, unknown>) => formatFC(Number(r.totalPaid)), className: 'text-right' },
        { key: 'balance', label: 'Solde', render: (r: Record<string, unknown>) => <span className="font-bold text-danger">{formatFC(Number(r.balance))}</span>, className: 'text-right' },
        {
            key: 'status', label: 'Statut', render: (r: Record<string, unknown>) => {
                const b = Number(r.balance);
                return <ScreenBadge label={b > 0 ? 'Impayé' : 'À jour'} variant={b > 0 ? 'danger' : 'success'} />;
            }
        },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><AlertCircle size={22} className="text-danger" /> Impayés</h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100"><MessageSquare size={14} /> SMS de rappel</button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100"><Download size={14} /> Exporter</button>
                </div>
            </div>
            <DataTable columns={columns} data={data?.students ?? []} isLoading={isLoading} emptyMessage="Aucun impayé — Tous les élèves sont en règle 🎉" />
        </div>
    );
}
