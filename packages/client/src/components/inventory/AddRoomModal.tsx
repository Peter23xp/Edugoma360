import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../lib/api';

const ROOM_TYPES = [
  { value: 'CLASSROOM', label: 'Salle de classe' },
  { value: 'LABORATORY', label: 'Laboratoire' },
  { value: 'OFFICE', label: 'Bureau' },
  { value: 'TEACHERS_ROOM', label: 'Salle des professeurs' },
  { value: 'LIBRARY', label: 'Bibliothèque' },
  { value: 'SPORTS', label: 'Terrain sportif' },
  { value: 'CAFETERIA', label: 'Réfectoire/Cantine' },
  { value: 'OTHER', label: 'Autre' },
];

const EQUIPMENTS = [
  'Tableau noir/blanc',
  'Ventilateurs',
  'Prises électriques',
  'Projecteur',
  'Climatisation',
  'Connexion internet',
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  initialData?: any;
}

export default function AddRoomModal({ open, onClose, onSubmit, isLoading, initialData }: Props) {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; nom: string; postNom: string; prenom?: string }[]>([]);
  const [form, setForm] = useState({
    name: '',
    type: 'CLASSROOM',
    capacity: 40,
    status: 'GOOD',
    building: '',
    floor: '',
    classId: '',
    responsableId: '',
    equipments: [] as string[],
    stateDescription: '',
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name || '',
          type: initialData.type || 'CLASSROOM',
          capacity: initialData.capacity || 40,
          status: initialData.status || 'GOOD',
          building: initialData.building || '',
          floor: initialData.floor || '',
          classId: initialData.assignedClassId || '',
          responsableId: initialData.responsableId || '',
          equipments: initialData.equipments || [],
          stateDescription: initialData.stateDescription || '',
        });
      } else {
        setForm({
          name: '',
          type: 'CLASSROOM',
          capacity: 40,
          status: 'GOOD',
          building: '',
          floor: '',
          classId: '',
          responsableId: '',
          equipments: [],
          stateDescription: '',
        });
      }
      api.get('/settings/classes').then(({ data }) => {
        const rawClasses = Array.isArray(data)
          ? data
          : data?.data?.classes ?? data?.data ?? data?.classes ?? [];
        setClasses(Array.isArray(rawClasses) ? rawClasses : []);
      }).catch(() => setClasses([]));

      api.get('/teachers?limit=500').then(({ data }) => {
        const list = data?.data || data?.teachers || [];
        setTeachers(list.map((t: any) => ({ id: t.id, nom: t.nom, postNom: t.postNom, prenom: t.prenom })));
      }).catch(() => setTeachers([]));
    }
  }, [open, initialData]);

  if (!open) return null;

  const toggleEquipment = (eq: string) => {
    setForm((prev) => ({
      ...prev,
      equipments: prev.equipments.includes(eq)
        ? prev.equipments.filter((e) => e !== eq)
        : [...prev.equipments, eq],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      capacity: Number(form.capacity),
      classId: form.type === 'CLASSROOM' ? form.classId || null : null,
      responsableId: form.responsableId || null,
      building: form.building || undefined,
      floor: form.floor || undefined,
      stateDescription: form.stateDescription || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{initialData ? 'Modifier la salle' : 'Ajouter une salle'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom/Numéro *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Salle 201"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacité max *</label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">État actuel *</label>
            <div className="flex gap-4">
              {[
                { value: 'GOOD', label: 'Bon état' },
                { value: 'DEGRADED', label: 'Dégradée' },
                { value: 'CLOSED', label: 'Fermée' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={form.status === opt.value}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Bâtiment</label>
              <input
                type="text"
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Bâtiment A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Étage</label>
              <input
                type="text"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="2ème étage"
              />
            </div>
          </div>

          {form.type === 'CLASSROOM' && (
            <div>
              <label className="block text-sm font-medium mb-1">Classe assignée</label>
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                disabled={false}
              >
                <option value="">{false ? 'Chargement des classes...' : '-- Aucune --'}</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {!false && classes.length === 0 && (
                <p className="mt-1 text-xs text-[#C62828]">
                  Aucune classe active trouvée.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              {form.type === 'LABORATORY' ? 'Responsable du local / chef de laboratoire' : 'Responsable du local'}
            </label>
            <select
              value={form.responsableId}
              onChange={(e) => setForm({ ...form, responsableId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">-- Aucun --</option>
              {teachers?.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nom} {teacher.postNom || ''} {teacher.prenom || ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Équipements disponibles</label>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENTS.map((eq) => (
                <label key={eq} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={form.equipments.includes(eq)}
                    onChange={() => toggleEquipment(eq)}
                    className="rounded text-[#1B5E20]"
                  />
                  {eq}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description état</label>
            <textarea
              value={form.stateDescription}
              onChange={(e) => setForm({ ...form, stateDescription: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="Toiture en bon état, peinture récente"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !form.name}
              className="px-4 py-2 text-sm bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
