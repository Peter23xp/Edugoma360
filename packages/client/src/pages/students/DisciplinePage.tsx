import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ShieldAlert, CheckCircle, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface DisciplineRecord {
  id: string;
  date: string;
  description: string;
  witnesses: string | null;
  sanction: string;
  status: string;
  resolution: string | null;
  student: {
    nom: string;
    postNom: string;
    prenom: string | null;
    matricule: string;
    enrollments?: { class: { name: string } }[];
  };
}

export default function DisciplinePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resolveRecord, setResolveRecord] = useState<DisciplineRecord | null>(null);
  const [form, setForm] = useState({ studentSearch: '', studentId: '', description: '', witnesses: '', sanction: '', date: new Date().toISOString().split('T')[0] });
  const [studentResults, setStudentResults] = useState<any[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['discipline', statusFilter, search],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      return (await api.get('/discipline', { params })).data as { records: DisciplineRecord[]; stats: { total: number; open: number; resolved: number } };
    },
  });

  const createRecord = useMutation({
    mutationFn: async (payload: any) => (await api.post('/discipline', payload)).data,
    onSuccess: () => { toast.success('Dossier créé'); queryClient.invalidateQueries({ queryKey: ['discipline'] }); setShowCreateModal(false); },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const resolveRecordMutation = useMutation({
    mutationFn: async ({ id, resolution }: { id: string; resolution: string }) =>
      (await api.put(`/discipline/${id}/resolve`, { resolution })).data,
    onSuccess: () => { toast.success('Dossier résolu'); queryClient.invalidateQueries({ queryKey: ['discipline'] }); setResolveRecord(null); },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const searchStudents = async (q: string) => {
    if (q.length < 2) { setStudentResults([]); return; }
    const { data } = await api.get('/students', { params: { search: q, limit: 8 } });
    setStudentResults(data.data || data.students || []);
  };

  const [resolution, setResolution] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          Gestion Discipline
        </h1>
        <button onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] text-sm">
          <Plus className="w-4 h-4" /> Nouveau dossier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total dossiers', value: data?.stats.total || 0, color: 'text-blue-600 bg-blue-50' },
          { label: 'En cours', value: data?.stats.open || 0, color: 'text-red-600 bg-red-50' },
          { label: 'Résolus', value: data?.stats.resolved || 0, color: 'text-green-600 bg-green-50' },
        ].map(c => (
          <div key={c.label} className="bg-white border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color.split(' ')[0]}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Tous statuts</option>
          <option value="OPEN">En cours</option>
          <option value="RESOLVED">Résolus</option>
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher un élève..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
      </div>

      {/* Records */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : !data?.records.length ? (
        <div className="text-center py-12 text-gray-500">Aucun dossier disciplinaire</div>
      ) : (
        <div className="space-y-3">
          {data.records.map(record => (
            <div key={record.id} className={`bg-white border rounded-lg p-4 ${record.status === 'OPEN' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${record.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {record.status === 'OPEN' ? '🔴 En cours' : '✅ Résolu'}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <h3 className="font-medium">
                    {record.student.nom} {record.student.postNom}
                    {record.student.enrollments?.[0] && (
                      <span className="text-gray-400 font-normal ml-2 text-sm">({record.student.enrollments[0].class.name})</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-700 mt-1">{record.description}</p>
                  <p className="text-sm text-orange-700 mt-1"><strong>Sanction :</strong> {record.sanction}</p>
                  {record.witnesses && <p className="text-xs text-gray-500 mt-1">Témoins : {record.witnesses}</p>}
                  {record.resolution && <p className="text-sm text-green-700 mt-1"><strong>Résolution :</strong> {record.resolution}</p>}
                </div>
                {record.status === 'OPEN' && (
                  <button onClick={() => { setResolveRecord(record); setResolution(''); }}
                    className="text-sm text-green-600 hover:underline flex items-center gap-1 shrink-0">
                    <CheckCircle className="w-4 h-4" /> Résoudre
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Nouveau dossier disciplinaire</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createRecord.mutate({ studentId: form.studentId, description: form.description, witnesses: form.witnesses || undefined, sanction: form.sanction, date: form.date }); }} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Élève *</label>
                {form.studentId ? (
                  <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <span className="text-sm">{studentResults.find(s => s.id === form.studentId)?.nom || 'Élève sélectionné'}</span>
                    <button type="button" onClick={() => setForm({ ...form, studentId: '', studentSearch: '' })} className="text-xs text-red-500">Changer</button>
                  </div>
                ) : (
                  <div className="relative">
                    <input type="text" placeholder="Rechercher élève..." value={form.studentSearch}
                      onChange={e => { setForm({ ...form, studentSearch: e.target.value }); searchStudents(e.target.value); }}
                      className="w-full border rounded-lg px-3 py-2 text-sm" />
                    {studentResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow z-10 max-h-40 overflow-y-auto">
                        {studentResults.map(s => (
                          <button key={s.id} type="button"
                            onClick={() => { setForm({ ...form, studentId: s.id, studentSearch: `${s.nom} ${s.postNom}` }); setStudentResults([]); }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                            {s.nom} {s.postNom} <span className="text-gray-400 text-xs">({s.enrollments?.[0]?.class?.name || ''})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description du faute *</label>
                <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sanction *</label>
                <input type="text" required value={form.sanction} onChange={e => setForm({ ...form, sanction: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: Exclusion 3 jours, Convocation parents..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Témoins</label>
                <input type="text" value={form.witnesses} onChange={e => setForm({ ...form, witnesses: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={!form.studentId || createRecord.isPending}
                  className="px-4 py-2 text-sm bg-[#1B5E20] text-white rounded-lg disabled:opacity-50">
                  {createRecord.isPending ? 'Enregistrement...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Résoudre le dossier</h2>
            <p className="text-sm text-gray-600">{resolveRecord.student.nom} {resolveRecord.student.postNom} — {resolveRecord.description}</p>
            <div>
              <label className="block text-sm font-medium mb-1">Résolution *</label>
              <textarea required value={resolution} onChange={e => setResolution(e.target.value)} rows={3}
                placeholder="Décrivez comment le dossier a été résolu..." className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setResolveRecord(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Annuler</button>
              <button onClick={() => resolveRecordMutation.mutate({ id: resolveRecord.id, resolution })}
                disabled={!resolution || resolveRecordMutation.isPending}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg disabled:opacity-50">
                {resolveRecordMutation.isPending ? '...' : 'Marquer résolu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
