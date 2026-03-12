import { useState } from 'react';
import { X, FileSpreadsheet, Check } from 'lucide-react';
import { FEE_TEMPLATES } from '@edugoma360/shared';

interface FeeTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (templateName: string) => void;
  isSubmitting?: boolean;
}

export default function FeeTemplateModal({ isOpen, onClose, onApply, isSubmitting }: FeeTemplateModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState(false);

  const handleApply = () => {
    if (!selected) return;
    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }
    onApply(selected);
  };

  const handleClose = () => {
    setSelected(null);
    setConfirmStep(false);
    onClose();
  };

  if (!isOpen) return null;

  const selectedTemplate = FEE_TEMPLATES.find((t) => t.name === selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FileSpreadsheet size={20} />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">
              Utiliser un modèle
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-neutral-100">
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!confirmStep ? (
            <>
              <p className="text-sm text-neutral-500">
                Choisissez un modèle prédéfini pour créer automatiquement tous les frais scolaires.
              </p>

              {FEE_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => setSelected(template.name)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selected === template.name
                      ? 'border-primary bg-primary/5'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-900">{template.name}</h3>
                    {selected === template.name && (
                      <Check size={18} className="text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{template.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {template.fees.map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full"
                      >
                        {f.label}: {new Intl.NumberFormat('fr-FR').format(f.amount)} FC
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet size={28} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Confirmer la création</h3>
              <p className="text-sm text-neutral-500 mb-4">
                Cette action créera <strong>{selectedTemplate?.fees.length}</strong> frais scolaires
                depuis le modèle <strong>"{selected}"</strong>.
              </p>
              <div className="text-left bg-neutral-50 rounded-lg p-4 mb-4">
                {selectedTemplate?.fees.map((f, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm">
                    <span className="text-neutral-600">{f.label}</span>
                    <span className="font-medium text-neutral-900">
                      {new Intl.NumberFormat('fr-FR').format(f.amount)} FC
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={confirmStep ? () => setConfirmStep(false) : handleClose}
              className="px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {confirmStep ? 'Retour' : 'Annuler'}
            </button>
            <button
              onClick={handleApply}
              disabled={!selected || isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Création...' : confirmStep ? 'Confirmer et créer' : 'Continuer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
