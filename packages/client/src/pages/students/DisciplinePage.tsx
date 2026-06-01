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
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          Gestion Discipline
        </h1>
        <button onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover text-sm transition-colors">
          <Plus className="w-4 h-4" /> Nouveau dossier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total dossiers', value: data?.stats.total || 0, valueColor: 'text-blue-600', bg: 'bg-blue-50/60' },
          { label: 'En cours', value: data?.stats.open || 0, valueColor: 'text-red-600', bg: 'bg-red-50/60' },
          { label: 'Résolus', value: data?.stats.resolved || 0, valueColor: 'text-green-700', bg: 'bg-green-50/60' },
        ].map(c => (
          <div key={c.label} className={`bg-white border border-neutral-200 rounded-lg p-4 text-center ${c.bg}`}>
            <p className="text-sm text-neutral-600">{c.label}</p>
            <p className={`text-2xl font-bold ${c.valueColor}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="">Tous statuts</option>
          <option value="OPEN">En cours</option>
          <option value="RESOLVED">Résolus</option>
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input type="text" placeholder="Rechercher un élève..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
      </div>

      {/* Records */}
      {isLoading ? (
        <div className="text-center py-12 text-neutral-500">Chargement...</div>
      ) : !data?.records.length ? (
        <div className="text-center py-12 text-neutral-500">Aucun dossier disciplinaire</div>
      ) : (
        <div className="space-y-3">
          {data.records.map(record => (
            <div key={record.id} className={`bg-white border border-neutral-200 rounded-lg p-4 ${record.status === 'OPEN' ? 'bg-red-50/30 border-red-200' : 'bg-green-50/20 border-green-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${record.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {record.status === 'OPEN' ? 'En cours' : 'Résolu'}
                    </span>
                    <span className="text-xs text-neutral-500">{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <h3 className="font-medium text-neutral-900">
                    {record.student.nom} {record.student.postNom}
                    {record.student.enrollments?.[0] && (
                      <span className="text-neutral-500 font-normal ml-2 text-sm">({record.student.enrollments[0].class.name})</span>
                    )}
                  </h3>
                  <p className="text-sm text-neutral-700 mt-1">{record.description}</p>
                  <p className="text-sm text-orange-700 mt-1"><strong>Sanction :</strong> {record.sanction}</p>
                  {record.witnesses && <p className="text-xs text-neutral-500 mt-1">Témoins : {record.witnesses}</p>}
                  {record.resolution && <p className="text-sm text-green-700 mt-1"><strong>Résolution :</strong> {record.resolution}</p>}
                </div>
                {record.status === 'OPEN' && (
                  <button onClick={() => { setResolveRecord(record); setResolution(''); }}
                    className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0F1E12]/55" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ShieldAlert size={18} />
                </div>
                <h2 className="text-base font-bold text-neutral-900">Nouveau dossier disciplinaire</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createRecord.mutate({ studentId: form.studentId, description: form.description, witnesses: form.witnesses || undefined, sanction: form.sanction, date: form.date }); }} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Élève *</label>
                {form.studentId ? (
                  <div className="flex items-center justify-between border border-neutral-300 rounded-lg px-3 py-2">
                    <span className="text-sm text-neutral-900">{studentResults.find(s => s.id === form.studentId)?.nom || 'Élève sélectionné'}</span>
                    <button type="button" onClick={() => setForm({ ...form, studentId: '', studentSearch: '' })} className="text-xs text-red-500 hover:text-red-600">Changer</button>
                  </div>
                ) : (
                  <div className="relative">
                    <input type="text" placeholder="Rechercher élève..." value={form.studentSearch}
                      onChange={e => { setForm({ ...form, studentSearch: e.target.value }); searchStudents(e.target.value); }}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    {studentResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-lg shadow-md z-10 max-h-40 overflow-y-auto">
                        {studentResults.map(s => (
                          <button key={s.id} type="button"
                            onClick={() => { setForm({ ...form, studentId: s.id, studentSearch: `${s.nom} ${s.postNom}` }); setStudentResults([]); }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 text-neutral-800">
                            {s.nom} {s.postNom} <span className="text-neutral-500 text-xs">({s.enrollments?.[0]?.class?.name || ''})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Date *</label>
                <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description de la faute *</label>
                <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Sanction *</label>
                <input type="text" required value={form.sanction} onChange={e => setForm({ ...form, sanction: e.target.value })} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Ex: Exclusion 3 jours, Convocation parents..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Témoins</label>
                <input type="text" value={form.witnesses} onChange={e => setForm({ ...form, witnesses: e.target.value })} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors">Annuler</button>
                <button type="submit" disabled={!form.studentId || createRecord.isPending}
                  className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-primary-hover transition-colors">
                  {createRecord.isPending ? 'Enregistrement...' : 'Créer le dossier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0F1E12]/55" onClick={() => setResolveRecord(null)} />
          <div className="relative bg-white rounded-lg w-full max-w-md shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-neutral-900">Résoudre le dossier</h2>
              <button onClick={() => setResolveRecord(null)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200">
              {resolveRecord.student.nom} {resolveRecord.student.postNom} : {resolveRecord.description}
            </p>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Résolution *</label>
              <textarea required value={resolution} onChange={e => setResolution(e.target.value)} rows={3}
                placeholder="Décrivez comment le dossier a été résolu..." className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setResolveRecord(null)} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors">Annuler</button>
              <button onClick={() => resolveRecordMutation.mutate({ id: resolveRecord.id, resolution })}
                disabled={!resolution || resolveRecordMutation.isPending}
                className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-primary-hover transition-colors">
                {resolveRecordMutation.isPending ? '...' : 'Marquer résolu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
