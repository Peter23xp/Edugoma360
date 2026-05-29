import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { MaterialItem } from '../../hooks/useMaterial';

interface Props {
  open: boolean;
  item: MaterialItem | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function StockMovementModal({ open, item, onClose, onSubmit, isLoading }: Props) {
  const [form, setForm] = useState({
    type: 'ENTRY',
    quantity: 1,
    fromStatus: 'GOOD',
    toStatus: 'GOOD',
    reason: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (open) {
      setForm({
        type: 'ENTRY',
        quantity: 1,
        fromStatus: 'GOOD',
        toStatus: 'GOOD',
        reason: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [open]);

  if (!open || !item) return null;

  const getPreviewStock = () => {
    let good = item.goodQty;
    let used = item.usedQty;
    let broken = item.brokenQty;

    if (form.type === 'ENTRY') {
      if (form.toStatus === 'GOOD') good += form.quantity;
      else if (form.toStatus === 'USED') used += form.quantity;
      else broken += form.quantity;
    } else if (form.type === 'EXIT') {
      if (form.fromStatus === 'GOOD') good -= form.quantity;
      else if (form.fromStatus === 'USED') used -= form.quantity;
      else broken -= form.quantity;
    } else if (form.type === 'STATUS_CHANGE') {
      if (form.fromStatus === 'GOOD') good -= form.quantity;
      else if (form.fromStatus === 'USED') used -= form.quantity;
      else broken -= form.quantity;
      if (form.toStatus === 'GOOD') good += form.quantity;
      else if (form.toStatus === 'USED') used += form.quantity;
      else broken += form.quantity;
    }

    return { good, used, broken, total: good + used + broken };
  };

  const preview = getPreviewStock();
  const sameStatus = form.type === 'STATUS_CHANGE' && form.fromStatus === form.toStatus;
  const isValid = form.quantity > 0 && form.reason.trim() && !sameStatus && preview.good >= 0 && preview.used >= 0 && preview.broken >= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      itemId: item.id,
      type: form.type,
      quantity: form.quantity,
      fromStatus: form.type !== 'ENTRY' ? form.fromStatus : undefined,
      toStatus: form.type !== 'EXIT' ? form.toStatus : undefined,
      reason: form.reason,
      date: form.date,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Mouvement stock — {item.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Stock actuel :</p>
            <p>Bon état : {item.goodQty} | Usé : {item.usedQty} | HS : {item.brokenQty}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type de mouvement *</label>
            <div className="space-y-2">
              {[
                { value: 'ENTRY', label: 'Entrée (achat, don)' },
                { value: 'EXIT', label: 'Sortie (perte, vol, destruction)' },
                { value: 'STATUS_CHANGE', label: 'Changement état (bon → usé → HS)' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={opt.value}
                    checked={form.type === opt.value}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="text-[#1B5E20]"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Quantité *</label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {form.type === 'ENTRY' ? 'État cible' : 'État concerné'} *
              </label>
              <select
                value={form.type === 'ENTRY' ? form.toStatus : form.fromStatus}
                onChange={(e) => {
                  if (form.type === 'ENTRY') setForm({ ...form, toStatus: e.target.value });
                  else setForm({ ...form, fromStatus: e.target.value });
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="GOOD">Bon état</option>
                <option value="USED">Usé</option>
                <option value="BROKEN">Hors service</option>
              </select>
            </div>
          </div>

          {form.type === 'STATUS_CHANGE' && (
            <div>
              <label className="block text-sm font-medium mb-1">Nouvel état *</label>
              <select
                value={form.toStatus}
                onChange={(e) => setForm({ ...form, toStatus: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="GOOD">Bon état</option>
                <option value="USED">Usé</option>
                <option value="BROKEN">Hors service</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Motif *</label>
            <input
              type="text"
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Ex: Dégradation — tables cassées classe 4ScA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Nouveau stock :</p>
            <p>
              Bon état : {preview.good} | Usé : {preview.used} | HS : {preview.broken}
            </p>
            <p>Total : {item.goodQty + item.usedQty + item.brokenQty} → {preview.total} unités</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !isValid}
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
