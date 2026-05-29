import { useState } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = [
  { value: 'MOBILIER', label: 'Mobilier' },
  { value: 'INFORMATIQUE', label: 'Équipements informatiques' },
  { value: 'PEDAGOGIQUE', label: 'Matériel pédagogique' },
  { value: 'FOURNITURES', label: 'Fournitures' },
  { value: 'SPORT', label: 'Équipements sportifs' },
  { value: 'AUTRE', label: 'Autre' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  initialData?: any;
}

export default function AddMaterialModal({ open, onClose, onSubmit, isLoading, initialData }: Props) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'MOBILIER',
    goodQty: initialData?.goodQty || 0,
    usedQty: initialData?.usedQty || 0,
    brokenQty: initialData?.brokenQty || 0,
    unitValue: initialData?.unitValue || 0,
    minStock: initialData?.minStock || 0,
    location: initialData?.location || '',
    acquiredAt: initialData?.acquiredAt?.split('T')[0] || '',
    notes: initialData?.notes || '',
  });

  if (!open) return null;

  const totalQty = form.goodQty + form.usedQty + form.brokenQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      goodQty: Number(form.goodQty),
      usedQty: Number(form.usedQty),
      brokenQty: Number(form.brokenQty),
      unitValue: Number(form.unitValue),
      minStock: Number(form.minStock),
      acquiredAt: form.acquiredAt || undefined,
      location: form.location || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{initialData ? 'Modifier l\'article' : 'Ajouter un article'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Désignation *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Tables élèves double"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catégorie *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Répartition état</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">Bon état</label>
                <input
                  type="number"
                  min={0}
                  value={form.goodQty}
                  onChange={(e) => setForm({ ...form, goodQty: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Usé</label>
                <input
                  type="number"
                  min={0}
                  value={form.usedQty}
                  onChange={(e) => setForm({ ...form, usedQty: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Hors service</label>
                <input
                  type="number"
                  min={0}
                  value={form.brokenQty}
                  onChange={(e) => setForm({ ...form, brokenQty: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total : {totalQty} unités</p>
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
              <label className="block text-sm font-medium mb-1">Seuil minimum *</label>
              <input
                type="number"
                min={0}
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {form.unitValue > 0 && (
            <p className="text-sm text-gray-600">
              Valeur totale : {((form.goodQty + form.usedQty) * form.unitValue).toLocaleString('fr-FR')} FC
            </p>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Date d'acquisition</label>
            <input
              type="date"
              value={form.acquiredAt}
              onChange={(e) => setForm({ ...form, acquiredAt: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Localisation</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Toutes les salles de classe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
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
