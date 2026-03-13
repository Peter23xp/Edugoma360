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
      label: 'Rappel amical (1er rappel)',
      content: "EduGoma360: Cher parent, nous vous rappelons que le solde impayé pour {NOM} ({MATRICULE}) s'élève à {MONTANT} FC. Merci de régulariser. Contact: {TEL_ECOLE}"
    },
    FERME: {
      label: 'Rappel ferme (2ème rappel)',
      content: "EduGoma360: URGENT - Le solde impayé de {MONTANT} FC pour {NOM} doit être régularisé sous 7 jours. Passé ce délai, le bulletin sera bloqué."
    },
    SOMMATION: {
      label: 'Dernière sommation (3ème rappel)',
      content: "EduGoma360: DERNIÈRE SOMMATION - Le solde de {MONTANT} FC pour {NOM} doit être payé sous 3 jours. Au-delà, exclusion de la délibération."
    }
  };

  const handleSend = () => {
    onSend({ channel, template });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-primary text-white flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare size={20} /> Envoyer un rappel
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
              <span className="font-bold text-sm">{selectedCount}</span>
            </div>
            <p className="text-sm font-bold text-blue-800">
              {selectedCount === 1 ? "1 élève sélectionné" : `${selectedCount} élèves sélectionnés`}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
              Canal d'envoi
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['SMS', 'EMAIL', 'BOTH'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  className={`py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5
                    ${channel === c 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200'}`}
                >
                  {c === 'SMS' && <MessageSquare size={18} />}
                  {c === 'EMAIL' && <Mail size={18} />}
                  {c === 'BOTH' && <Send size={18} />}
                  <span className="text-[10px] font-bold">{c}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
              Modèle de message
            </label>
            <div className="space-y-3">
              {(['AMICAL', 'FERME', 'SOMMATION'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4
                    ${template === t 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-neutral-100 bg-white hover:border-neutral-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex flex-shrink-0 items-center justify-center transition-colors
                    ${template === t ? 'border-primary' : 'border-neutral-300'}`}>
                    {template === t && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`text-sm font-bold mb-1 ${template === t ? 'text-primary' : 'text-neutral-900'}`}>
                      {templates[t].label}
                    </p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-mono line-clamp-2 break-words">
                       {templates[t].content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {channel !== 'EMAIL' && (
            <div className="flex items-center gap-2 text-[11px] font-medium text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
               <AlertTriangle size={14} className="text-orange-500" />
               Coût estimé : {selectedCount * 50} FC
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleSend}
            className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2"
          >
            <Send size={16} /> Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
