import { useState } from 'react';
import { FileText, X, Check, Download } from 'lucide-react';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
}

export function GenerateReportModal({ isOpen, onClose, onGenerate }: GenerateReportModalProps) {
  const [reportType, setReportType] = useState('MONTHLY');
  const [sections, setSections] = useState(['SUMMARY', 'REVENUE', 'DEBTS', 'CHARTS']);
  const [format, setFormat] = useState('PDF');
  
  if (!isOpen) return null;

  const toggleSection = (s: string) => {
    setSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-primary text-white flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText size={20} /> Générer un rapport
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Report Type */}
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
              Type de rapport
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'MONTHLY', label: 'Mensuel' },
                { id: 'TRIMESTRAL', label: 'Trimestriel' },
                { id: 'ANNUAL', label: 'Annuel' },
                { id: 'CUSTOM', label: 'Personnalisé' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setReportType(t.id)}
                  className={`py-3 px-4 rounded-xl border-2 transition-all text-sm font-bold
                    ${reportType === t.id 
                      ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                      : 'border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
               Format du fichier
            </label>
            <div className="grid grid-cols-2 gap-3">
               {[
                  { id: 'PDF', label: 'PDF (.pdf)' },
                  { id: 'EXCEL', label: 'Excel (.xlsx)' }
               ].map(f => (
                  <button
                     key={f.id}
                     onClick={() => setFormat(f.id)}
                     className={`py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm font-bold
                        ${format === f.id 
                           ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                           : 'border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200'}`}
                  >
                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                        ${format === f.id ? 'border-primary' : 'border-neutral-300'}`}>
                        {format === f.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                     </div>
                     {f.label}
                  </button>
               ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
              Sections incluses
            </label>
            <div className="space-y-2">
              {[
                { id: 'SUMMARY', label: 'Résumé exécutif' },
                { id: 'REVENUE', label: 'Revenus détaillés' },
                { id: 'DEBTS', label: 'Créances et recouvrements' },
                { id: 'CLASSES', label: 'Statistiques par classe' },
                { id: 'METHODS', label: 'Modes de paiement' },
                { id: 'CHARTS', label: 'Graphiques visuels' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSection(s.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-transparent hover:bg-neutral-50 transition-colors text-left group"
                >
                  <div className={`w-5 h-5 rounded border-2 flex flex-shrink-0 items-center justify-center transition-colors
                    ${sections.includes(s.id) ? 'bg-primary border-primary text-white' : 'border-neutral-300 bg-white group-hover:border-neutral-400'}`}>
                    {sections.includes(s.id) && <Check size={14} strokeWidth={3} />}
                  </div>
                  <span className={`text-sm font-bold ${sections.includes(s.id) ? 'text-neutral-900' : 'text-neutral-600'}`}>
                     {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button 
             onClick={onClose} 
             className="px-6 py-2.5 text-sm font-bold text-neutral-500 hover:text-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-200 rounded-lg"
          >
             Annuler
          </button>
          <button 
            onClick={() => onGenerate({ type: reportType, sections, format })}
            className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Download size={16} /> Générer
          </button>
        </div>
      </div>
    </div>
  );
}
