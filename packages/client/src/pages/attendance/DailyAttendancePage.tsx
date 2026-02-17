import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Save, Loader2, Cloud, CloudOff } from 'lucide-react';
import api from '../../lib/api';
import db from '../../lib/offline/db';
import { enqueueSync } from '../../lib/offline/sync';
import { useOffline } from '../../hooks/useOffline';
import { useAuth } from '../../hooks/useAuth';
import { useSchoolStore } from '../../stores/school.store';
import { formatStudentName } from '../../lib/utils';
import toast from 'react-hot-toast';

type Status = 'PRESENT' | 'ABSENT' | 'JUSTIFIED' | 'SICK';

interface AttendanceRow {
    studentId: string;
    studentName: string;
    status: Status;
    changed: boolean;
}

export default function DailyAttendancePage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { isOnline } = useOffline();
    const { activeTermId } = useSchoolStore();

    const [classId, setClassId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [period, setPeriod] = useState<'MATIN' | 'APRES_MIDI'>('MATIN');
    const [rows, setRows] = useState<AttendanceRow[]>([]);

    const { data: classes } = useQuery({ queryKey: ['classes-list'], queryFn: async () => (await api.get('/settings/classes')).data });

    const { isLoading } = useQuery({
        queryKey: ['attendance', classId, date, period],
        queryFn: async () => {
            const res = await api.get(`/attendance?classId=${classId}&date=${date}&period=${period}`);
            setRows(res.data.students.map((s: { id: string; nom: string; postNom: string; prenom?: string; status?: Status }) => ({
                studentId: s.id,
                studentName: formatStudentName(s.nom, s.postNom, s.prenom),
                status: s.status ?? 'PRESENT',
                changed: false,
            })));
            return res.data;
        },
        enabled: !!classId,
    });

    const toggleStatus = (idx: number, status: Status) => {
        setRows((prev) => prev.map((r, i) => i === idx ? { ...r, status, changed: true } : r));
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            const items = rows.filter((r) => r.changed).map((r) => ({
                studentId: r.studentId, status: r.status, date, period, classId, termId: activeTermId!,
            }));
            if (isOnline) {
                await api.post('/attendance/batch', { items });
            } else {
                for (const item of items) {
                    await db.attendances.put({ ...item, recordedById: user!.id, syncStatus: 'PENDING', localUpdatedAt: Date.now() });
                    await enqueueSync('attendance', `${item.studentId}-${date}-${period}`, 'create', item);
                }
            }
        },
        onSuccess: () => {
            toast.success('Présences enregistrées');
            setRows((prev) => prev.map((r) => ({ ...r, changed: false })));
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
        },
        onError: () => toast.error('Erreur d\'enregistrement'),
    });

    const statusBtn = (idx: number, status: Status, label: string, color: string) => (
        <button
            type="button"
            onClick={() => toggleStatus(idx, status)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${rows[idx].status === status ? color : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
        >
            {label}
        </button>
    );

    const presentCount = rows.filter((r) => r.status === 'PRESENT').length;
    const absentCount = rows.filter((r) => r.status === 'ABSENT').length;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><CalendarCheck size={22} /> Présences</h1>
                <span className="text-xs flex items-center gap-1">{isOnline ? <Cloud size={12} className="text-success" /> : <CloudOff size={12} className="text-warning" />}{isOnline ? 'En ligne' : 'Hors-ligne'}</span>
            </div>

            <div className="bg-white rounded-xl border border-neutral-300/50 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="input-label">Classe</label><select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"><option value="">Sélectionner...</option>{classes?.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="input-label">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="input-label">Période</label><select value={period} onChange={(e) => setPeriod(e.target.value as 'MATIN' | 'APRES_MIDI')} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"><option value="MATIN">Matin</option><option value="APRES_MIDI">Après-midi</option></select></div>
            </div>

            {rows.length > 0 && (
                <div className="bg-white rounded-xl border border-neutral-300/50 p-4 flex items-center gap-4 text-sm">
                    <span className="text-success font-semibold">✓ {presentCount} Présent(s)</span>
                    <span className="text-danger font-semibold">✗ {absentCount} Absent(s)</span>
                    <span className="text-neutral-400">{rows.length} total</span>
                </div>
            )}

            {isLoading ? (
                <div className="animate-pulse space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-neutral-200 rounded" />)}</div>
            ) : rows.length > 0 ? (
                <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="table-header"><th className="px-4 py-3 text-left w-12">#</th><th className="px-4 py-3 text-left">Élève</th><th className="px-4 py-3 text-center">Statut</th></tr></thead>
                        <tbody className="divide-y divide-neutral-100">
                            {rows.map((row, idx) => (
                                <tr key={row.studentId} className={row.changed ? 'bg-warning-bg/30' : ''}>
                                    <td className="px-4 py-2 text-xs text-neutral-400">{idx + 1}</td>
                                    <td className="px-4 py-2 text-sm font-medium">{row.studentName}</td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {statusBtn(idx, 'PRESENT', 'P', 'bg-success text-white')}
                                            {statusBtn(idx, 'ABSENT', 'A', 'bg-danger text-white')}
                                            {statusBtn(idx, 'JUSTIFIED', 'J', 'bg-warning text-white')}
                                            {statusBtn(idx, 'SICK', 'M', 'bg-info text-white')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : classId ? <p className="text-center text-neutral-500 py-8">Aucun élève</p> : null}

            {rows.length > 0 && (
                <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !rows.some((r) => r.changed)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium text-sm disabled:opacity-50">
                    {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Enregistrer les présences
                </button>
            )}
        </div>
    );
}
