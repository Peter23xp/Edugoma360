import { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import api from '../../lib/api';

const CATEGORIES = [
  { value: 'PLOMBERIE', label: 'Plomberie' },
  { value: 'ELECTRICITE', label: 'Électricité' },
  { value: 'MENUISERIE', label: 'Menuiserie' },
  { value: 'PEINTURE', label: 'Peinture' },
  { value: 'INFORMATIQUE', label: 'Informatique' },
  { value: 'AUTRE', label: 'Autre' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData | any) => void;
  isLoading?: boolean;
}

export default function CreateRequestModal({ open, onClose, onSubmit, isLoading }: Props) {
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [form, setForm] = useState({
    titre: '',
    category: 'PLOMBERIE',
    roomId: '',
    location: '',
    urgency: 'NORMAL',
    description: '',
    estimatedCost: '',
  });

  useEffect(() => {
    if (open) {
      setForm({ titre: '', category: 'PLOMBERIE', roomId: '', location: '', urgency: 'NORMAL', description: '', estimatedCost: '' });
      setPhoto(null);
      api.get('/inventory/rooms').then(({ data }) => {
        setRooms((data.rooms || []).map((r: any) => ({ id: r.id, name: r.name })));
      }).catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (photo) {
      const formData = new FormData();
      formData.append('titre', form.titre);
      formData.append('category', form.category);
      if (form.roomId) formData.append('roomId', form.roomId);
      if (form.location) formData.append('location', form.location);
      formData.append('urgency', form.urgency);
      formData.append('description', form.description);
      if (form.estimatedCost) formData.append('estimatedCost', form.estimatedCost);
      formData.append('photo', photo);
      onSubmit(formData);
    } else {
      onSubmit({
        ...form,
        roomId: form.roomId || undefined,
        location: form.location || undefined,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Nouvelle demande de maintenance</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <input
              type="text"
              required
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Fuite d'eau toiture Salle 102"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Catégorie *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <label
                  key={c.value}
                  className={`px-3 py-2 text-sm border rounded-lg cursor-pointer text-center transition-colors ${
                    form.category === c.value ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name="category"
                    value={c.value}
                    checked={form.category === c.value}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lieu concerné</label>
            <select
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">— Sélectionner une salle —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-2"
              placeholder="Précision (ex: Toiture côté est)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Niveau d'urgence *</label>
            <div className="flex gap-3">
              {[
                { value: 'URGENT', label: '🔴 Urgent', desc: '24-48h' },
                { value: 'NORMAL', label: '🟠 Normal', desc: '1 semaine' },
                { value: 'LOW', label: '🟡 Faible', desc: '1 mois' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex-1 px-3 py-2 border rounded-lg cursor-pointer text-center transition-colors ${
                    form.urgency === opt.value ? 'border-[#1B5E20] bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name="urgency"
                    value={opt.value}
                    checked={form.urgency === opt.value}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                  />
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span className="block text-xs text-gray-500">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description détaillée *</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              placeholder="Décrivez le problème en détail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Photo (optionnel)</label>
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <Camera className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {photo ? photo.name : 'Ajouter photo'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Coût estimé (FC)</label>
            <input
              type="number"
              min={0}
              value={form.estimatedCost}
              onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !form.titre || !form.description}
              className="px-4 py-2 text-sm bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] disabled:opacity-50"
            >
              {isLoading ? 'Envoi...' : 'Soumettre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
