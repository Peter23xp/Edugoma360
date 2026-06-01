import { useState } from 'react';
import { Send, X, MessageSquare, Mail, AlertTriangle } from 'lucide-react';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: any) => void;
  selectedCount: number;
}

export function SendReminderModal({ isOpen, onClose, onSend, selectedCount }: SendReminderModalProps) {
  const [channel, setChannel] = useState<'SMS' | 'EMAIL' | 'BOTH'>('SMS');
  const [template, setTemplate] = useState<'AMICAL' | 'FERME' | 'SOMMATION'>('AMICAL');

  if (!isOpen) return null;

  const templates = {
    AMICAL: {
      label: 'Rappel amical',
      content: 'Cher parent, le solde impayé de {MONTANT} FC pour {NOM} reste à régulariser.',
    },
    FERME: {
      label: 'Rappel ferme',
      content: 'Le solde impayé de {MONTANT} FC pour {NOM} doit être régularisé sous 7 jours.',
    },
    SOMMATION: {
      label: 'Dernière sommation',
      content: 'Dernier rappel: le solde de {MONTANT} FC pour {NOM} doit être payé sous 3 jours.',
    },
  };

  const handleSend = () => {
    onSend({ channel, template });
    onClose();
  };

  return (
    <div className="edugoma-modal-overlay">
      <div className="edugoma-modal-panel max-w-lg">
        <div className="edugoma-modal-header">
          <div className="flex items-center gap-3">
            <div className="edugoma-modal-icon">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Envoyer un rappel</h2>
              <p className="text-xs text-neutral-500">
                {selectedCount === 1 ? '1 élève sélectionné' : `${selectedCount} élèves sélectionnés`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="edugoma-modal-close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="edugoma-modal-body space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Canal d'envoi</label>
            <div className="grid grid-cols-3 gap-2">
              {(['SMS', 'EMAIL', 'BOTH'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setChannel(item)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    channel === item
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {item === 'SMS' && <MessageSquare className="h-4 w-4" />}
                  {item === 'EMAIL' && <Mail className="h-4 w-4" />}
                  {item === 'BOTH' && <Send className="h-4 w-4" />}
                  {item === 'BOTH' ? 'Les deux' : item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Modèle de message</label>
            <div className="space-y-2">
              {(['AMICAL', 'FERME', 'SOMMATION'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setTemplate(item)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    template === item
                      ? 'border-primary bg-primary/5'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-3 w-3 rounded-full border ${template === item ? 'border-primary bg-primary' : 'border-neutral-300'}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${template === item ? 'text-primary' : 'text-neutral-900'}`}>
                        {templates[item].label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-600">{templates[item].content}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {channel !== 'EMAIL' && (
            <div className="flex items-center gap-2 rounded-lg border border-accent/25 bg-accent-light p-3 text-sm text-accent">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Coût estimé: {selectedCount * 50} FC
            </div>
          )}
        </div>

        <div className="edugoma-modal-footer">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Envoyer le rappel
          </button>
        </div>
      </div>
    </div>
  );
}
