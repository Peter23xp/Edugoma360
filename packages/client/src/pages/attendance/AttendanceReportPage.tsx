import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttendanceReportPage() {
    const [classId, setClassId] = useState('');

    const { data: classes } = useQuery({ queryKey: ['classes-list'], queryFn: async () => (await api.get('/settings/classes')).data });

    const { data: report, isLoading } = useQuery({
        queryKey: ['attendance-report', classId],
        queryFn: async () => (await api.get(`/attendance/report?classId=${classId}`)).data,
        enabled: !!classId,
    });

    const columns = [
        { key: 'studentName', label: 'Élève' },
        { key: 'totalPresent', label: 'Présent', className: 'text-center' },
        { key: 'totalAbsent', label: 'Absent', className: 'text-center' },
        { key: 'totalJustified', label: 'Justifié', className: 'text-center' },
        { key: 'rate', label: 'Taux', render: (r: Record<string, unknown>) => <span className={`font-bold ${Number(r.rate) >= 80 ? 'text-success' : 'text-danger'}`}>{String(r.rate)}%</span>, className: 'text-center' },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><BarChart3 size={22} /> Rapport de Présences</h1>
                <button className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100"><Download size={14} /> Exporter</button>
            </div>

            <div className="bg-white rounded-xl border border-neutral-300/50 p-4">
                <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full sm:w-64 border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Sélectionner une classe...</option>
                    {classes?.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {report?.chart && (
                <div className="bg-white rounded-xl border border-neutral-300/50 p-5">
                    <h3 className="text-sm font-semibold mb-3">Taux de présence par semaine</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={report.chart}><CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" /><XAxis dataKey="week" /><YAxis /><Tooltip /><Bar dataKey="rate" fill="#1B5E20" radius={[4, 4, 0, 0]} /></BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            <DataTable columns={columns} data={report?.students ?? []} isLoading={isLoading} emptyMessage="Sélectionnez une classe" />
        </div>
    );
}
