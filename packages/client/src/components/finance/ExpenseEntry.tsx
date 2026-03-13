import { useState } from 'react';
import { useCashSessions } from '../../hooks/useCashSessions';
import { Plus, X, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExpenseEntryProps {
  sessionId: string;
  onClose: () => void;
}

export function ExpenseEntry({ sessionId, onClose }: ExpenseEntryProps) {
  const { recordExpense } = useCashSessions();
  const [formData, setFormData] = useState({
    type: 'FOURNITURES',
    amount: '',
    beneficiary: '',
    motif: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.beneficiary || !formData.motif) return;

    setIsSubmitting(true);
    try {
      await recordExpense.mutateAsync({
        sessionId,
        type: formData.type,
        amount: Number(formData.amount),
        beneficiary: formData.beneficiary,
        motif: formData.motif,
      });
      toast.success('Dépense enregistrée avec succès');
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-neutral-200">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100 bg-neutral-50/50">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Enregistrer une dépense</h2>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-neutral-700">Type de dépense *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'FOURNITURES', label: 'Fournitures scolaires' },
                { id: 'ENTRETIEN', label: 'Entretien et maintenance' },
                { id: 'SALAIRE', label: 'Salaires enseignants' },
                { id: 'FACTURE', label: 'Factures (eau, électricité)' },
                { id: 'AUTRE', label: 'Autre' },
              ].map(t => (
                <label key={t.id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all hover:bg-slate-50 ${formData.type === t.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-slate-200'}`}>
                  <input
                    type="radio"
                    name="type"
                    value={t.id}
                    checked={formData.type === t.id}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="mr-3 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className={`text-sm font-medium ${formData.type === t.id ? 'text-primary' : 'text-slate-600'}`}>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1">Montant * (FC)</label>
            <input 
              type="number" 
              required min="1"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-lg"
              placeholder="Ex : 50000"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1">Bénéficiaire *</label>
            <input 
              type="text" 
              required
              value={formData.beneficiary}
              onChange={e => setFormData({ ...formData, beneficiary: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
              placeholder="Ex : BAHATI Marie - Enseignante"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1">Motif *</label>
            <textarea
              required rows={2}
              value={formData.motif}
              onChange={e => setFormData({ ...formData, motif: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm font-medium"
              placeholder="Ex : Salaire mois de janvier 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Justificatif</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                 <UploadCloud size={24} />
              </div>
              <p className="text-sm font-bold text-slate-700 mb-1">Glissez-déposez le reçu ou la facture</p>
              <p className="text-xs text-slate-500">ou cliquez pour parcourir (PNG, JPG, PDF)</p>
            </div>
          </div>
        </form>

        <div className="p-5 border-t border-neutral-100 bg-neutral-50/80 flex items-center justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 bg-neutral-100 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Enregistrement...' : <>Enregistrer <Plus size={16}/></>}
          </button>
        </div>
      </div>
    </div>
  );
}
