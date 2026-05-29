import { useState } from 'react';
import { X } from 'lucide-react';
import type { MaintenanceRequest } from '../../hooks/useMaintenance';

interface Props {
  open: boolean;
  request: MaintenanceRequest | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function UpdateStatusModal({ open, request, onClose, onSubmit, isLoading }: Props) {
  const [form, setForm] = useState({
    status: 'IN_PROGRESS',
    technicien: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    actualCost: '',
    notes: '',
    progress: 0,
  });

  if (!open || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: request.id,
      status: form.status,
      technicien: form.technicien || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      actualCost: form.actualCost ? parseFloat(form.actualCost) : undefined,
      notes: form.notes || undefined,
      progress: form.progress,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Mise à jour — {request.titre}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nouveau statut *</label>
            <div className="space-y-2">
              {[
                { value: 'PENDING', label: 'En attente' },
                { value: 'IN_PROGRESS', label: 'En cours' },
                { value: 'RESOLVED', label: 'Résolu' },
                { value: 'CANCELLED', label: 'Annulé (non pertinent)' },
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

          <div>
            <label className="block text-sm font-medium mb-1">Technicien/Prestataire</label>
            <input
              type="text"
              value={form.technicien}
              onChange={(e) => setForm({ ...form, technicien: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="BAHATI Paul — Plombier"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date début</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date fin prévue</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Avancement (%)</label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 text-right">{form.progress}%</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Coût réel (FC)</label>
            <input
              type="number"
              min={0}
              value={form.actualCost}
              onChange={(e) => setForm({ ...form, actualCost: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes intervention</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              placeholder="Détails de l'intervention..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] disabled:opacity-50"
            >
              {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
