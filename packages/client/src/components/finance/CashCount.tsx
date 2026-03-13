import { useState } from 'react';
import { formatFC } from '@edugoma360/shared';
import { ChevronRight, RefreshCw, Layers } from 'lucide-react';

interface CashCountProps {
  theoreticalBalance: number;
  onValidate: (data: { actualBalance: number, denominations: any }) => void;
}

const DENOMINATIONS = [
  { value: 20000, type: 'billet' },
  { value: 10000, type: 'billet' },
  { value: 5000, type: 'billet' },
  { value: 1000, type: 'billet' },
  { value: 500, type: 'billet' },
  { value: 200, type: 'piece' },
  { value: 100, type: 'piece' },
  { value: 50, type: 'piece' },
];

export function CashCount({ onValidate }: CashCountProps) {
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [isCounting, setIsCounting] = useState(false);

  const handleStart = () => setIsCounting(true);

  const handleCountChange = (value: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value) || 0;
    setCounts(prev => ({ ...prev, [value]: qty }));
  };

  const actualBalance = Object.entries(counts).reduce((sum, [value, qty]) => sum + (Number(value) * qty), 0);

  if (!isCounting) {
    return (
      <button 
        onClick={handleStart}
        className="w-full bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-4 flex items-center justify-between hover:bg-blue-100 transition-colors group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-200/50 flex items-center justify-center">
             <Layers size={20} className="text-blue-700 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm tracking-wide text-blue-900 uppercase">Comptage physique *</p>
            <p className="text-xs text-blue-700/80 font-medium">Saisissez les quantités de billets et pièces</p>
          </div>
        </div>
        <div className="flex items-center text-sm font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
           Lancer <ChevronRight size={18} />
        </div>
      </button>
    );
  }

  const billets = DENOMINATIONS.filter(d => d.type === 'billet');
  const pieces = DENOMINATIONS.filter(d => d.type === 'piece');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" /> BILLETS
          </h3>
          <div className="space-y-2">
            {billets.map(({ value }) => (
              <div key={value} className="flex items-center gap-3 w-full bg-white p-2 rounded-lg border border-slate-200 hover:border-primary/50 transition-colors">
                <span className="w-28 text-sm font-bold text-slate-700 font-mono text-right">{value} FC ×</span>
                <input 
                  type="number" min="0" placeholder="0"
                  value={counts[value] || ''}
                  onChange={e => handleCountChange(value, e)}
                  className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-center font-bold text-slate-900"
                />
                <span className="w-28 text-sm font-bold text-primary font-mono text-right">= {formatFC(value * (counts[value] || 0))}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-slate-400" /> PIÈCES
          </h3>
           <div className="space-y-2">
            {pieces.map(({ value }) => (
              <div key={value} className="flex items-center gap-3 w-full bg-white p-2 rounded-lg border border-slate-200 hover:border-slate-400/50 transition-colors">
                <span className="w-28 text-sm font-bold text-slate-700 font-mono text-right">{value} FC ×</span>
                <input 
                  type="number" min="0" placeholder="0"
                  value={counts[value] || ''}
                  onChange={e => handleCountChange(value, e)}
                  className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white text-center font-bold text-slate-900"
                />
                <span className="w-28 text-sm font-bold text-slate-600 font-mono text-right">= {formatFC(value * (counts[value] || 0))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-neutral-100/80 border border-neutral-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
        <p className="text-sm font-bold text-neutral-600 uppercase tracking-wider">Total Compté</p>
        <p className="text-2xl font-black text-green-600 tracking-tight">{formatFC(actualBalance)}</p>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => { setCounts({}); setIsCounting(false); }}
          className="px-4 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-xl flex-[0.5] hover:bg-neutral-200 border border-neutral-200 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} /> Refaire
        </button>
        <button 
          onClick={() => onValidate({ actualBalance, denominations: counts })}
          className="px-4 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-medium rounded-xl flex-1 hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2"
        >
          Valider le comptage <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
