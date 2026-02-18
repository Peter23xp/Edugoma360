import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { useSchoolStore } from '../../stores/school.store';
import DataTable from '../../components/shared/DataTable';
import ScreenBadge from '../../components/shared/ScreenBadge';
import ConfirmModal from '../../components/shared/ConfirmModal';
import toast from 'react-hot-toast';

export default function DeliberationPage() {
    const queryClient = useQueryClient();
    const { activeTermId } = useSchoolStore();
    const [classId, setClassId] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const { data: classes } = useQuery({ queryKey: ['classes-list'], queryFn: async () => (await api.get('/settings/classes')).data });

    const { data: delib, isLoading } = useQuery({
        queryKey: ['deliberation', classId, activeTermId],
        queryFn: async () => (await api.get(`/grades/averages?classId=${classId}&termId=${activeTermId}`)).data,
        enabled: !!classId && !!activeTermId,
    });

    const validateMutation = useMutation({
        mutationFn: async () => api.post(`/grades/lock`, { classId, termId: activeTermId }),
        onSuccess: () => { toast.success('Délibération validée et notes verrouillées'); queryClient.invalidateQueries({ queryKey: ['deliberation'] }); },
        onError: () => toast.error('Erreur lors de la validation'),
    });

    const columns = [
        { key: 'rank', label: 'Rang', className: 'text-center w-16', render: (r: Record<string, unknown>) => <span className="font-bold">{String(r.rank)}</span> },
        { key: 'studentName', label: 'Élève' },
        { key: 'generalAverage', label: 'Moyenne', className: 'text-center', render: (r: Record<string, unknown>) => <span className="font-bold">{String(r.generalAverage)}/20</span> },
        { key: 'hasEliminatoryFailure', label: 'Éliminatoire', className: 'text-center', render: (r: Record<string, unknown>) => r.hasEliminatoryFailure ? <ScreenBadge label="OUI" variant="danger" /> : <ScreenBadge label="NON" variant="success" /> },
        {
            key: 'decision', label: 'Décision', render: (r: Record<string, unknown>) => {
                const d = String(r.decision);
                const v = d.includes('DISTINCTION') ? 'success' : d === 'ADMITTED' ? 'info' : 'danger';
                return <ScreenBadge label={d} variant={v as 'success'} />;
            }
        },
    ];

    return (
        <div className="space-y-5">
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><ClipboardList size={22} /> Délibération</h1>

            <div className="bg-white rounded-xl border border-neutral-300/50 p-4 flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1">
                    <label className="input-label">Classe</label>
                    <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white">
                        <option value="">Sélectionner...</option>
                        {classes?.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                {delib?.students?.length > 0 && (
                    <button onClick={() => setShowConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm font-medium">
                        <CheckCircle size={14} /> Valider la délibération
                    </button>
                )}
            </div>

            <DataTable columns={columns} data={delib?.students ?? []} isLoading={isLoading} emptyMessage="Sélectionnez une classe" />

            <ConfirmModal
                isOpen={showConfirm}
                title="Valider la délibération"
                message="Cette action verrouillera toutes les notes et les décisions seront définitives. Êtes-vous sûr ?"
                confirmLabel="Valider"
                variant="warning"
                onConfirm={() => { setShowConfirm(false); validateMutation.mutate(); }}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
}
