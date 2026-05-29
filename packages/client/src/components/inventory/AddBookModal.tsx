import { useState } from 'react';
import { X } from 'lucide-react';

const MATIERES = [
  'Mathématiques', 'Français', 'Anglais', 'Physique', 'Chimie',
  'Biologie', 'Histoire', 'Géographie', 'Philosophie', 'Informatique',
  'Éducation civique', 'Dessin', 'Musique', 'Sport', 'Autre',
];

const NIVEAUX = [
  { value: 1, label: 'TC-1' },
  { value: 2, label: 'TC-2' },
  { value: 3, label: '3ème' },
  { value: 4, label: '4ème' },
  { value: 5, label: '5ème' },
  { value: 6, label: '6ème' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function AddBookModal({ open, onClose, onSubmit, isLoading }: Props) {
  const [form, setForm] = useState({
    titre: '',
    auteur: '',
    isbn: '',
    matiere: 'Mathématiques',
    niveaux: [] as number[],
    totalQty: 1,
    etat: 'BON',
    unitValue: 0,
    acquiredAt: '',
  });

  if (!open) return null;

  const toggleNiveau = (val: number) => {
    setForm((prev) => ({
      ...prev,
      niveaux: prev.niveaux.includes(val)
        ? prev.niveaux.filter((n) => n !== val)
        : [...prev.niveaux, val],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      totalQty: Number(form.totalQty),
      unitValue: form.unitValue ? Number(form.unitValue) : undefined,
      auteur: form.auteur || undefined,
      isbn: form.isbn || undefined,
      acquiredAt: form.acquiredAt || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Ajouter un livre</h2>
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
              placeholder="Mathématiques 4ème"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Auteur / Éditeur</label>
            <input
              type="text"
              value={form.auteur}
              onChange={(e) => setForm({ ...form, auteur: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Programme EPSP RDC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ISBN (optionnel)</label>
            <input
              type="text"
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Matière *</label>
            <select
              value={form.matiere}
              onChange={(e) => setForm({ ...form, matiere: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {MATIERES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Niveau(x) scolaire(s) *</label>
            <div className="flex flex-wrap gap-2">
              {NIVEAUX.map((n) => (
                <label
                  key={n.value}
                  className={`px-3 py-1.5 text-sm border rounded-lg cursor-pointer transition-colors ${
                    form.niveaux.includes(n.value) ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.niveaux.includes(n.value)}
                    onChange={() => toggleNiveau(n.value)}
                  />
                  {n.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantité totale *</label>
            <input
              type="number"
              min={1}
              value={form.totalQty}
              onChange={(e) => setForm({ ...form, totalQty: parseInt(e.target.value) || 1 })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">État général *</label>
            <div className="flex gap-4">
              {[
                { value: 'BON', label: 'Bon' },
                { value: 'PASSABLE', label: 'Passable' },
                { value: 'MAUVAIS', label: 'Mauvais' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="etat"
                    value={opt.value}
                    checked={form.etat === opt.value}
                    onChange={(e) => setForm({ ...form, etat: e.target.value })}
                    className="text-[#1B5E20]"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Valeur unitaire (FC)</label>
              <input
                type="number"
                min={0}
                value={form.unitValue}
                onChange={(e) => setForm({ ...form, unitValue: parseInt(e.target.value) || 0 })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date d'acquisition</label>
              <input
                type="date"
                value={form.acquiredAt}
                onChange={(e) => setForm({ ...form, acquiredAt: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !form.titre || form.niveaux.length === 0}
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
