import { Edit3, Copy, Archive, Trash2, MoreVertical, Tag, Clock, Users } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { FEE_TYPES, FEE_FREQUENCY_LABELS, FEE_SCOPE_LABELS } from '@edugoma360/shared';
import type { Fee } from '../../hooks/useFees';

interface FeeCardProps {
  fee: Fee;
  onEdit: (fee: Fee) => void;
  onDuplicate: (fee: Fee) => void;
  onArchive: (fee: Fee) => void;
  onDelete: (fee: Fee) => void;
}

export default function FeeCard({ fee, onEdit, onDuplicate, onArchive, onDelete }: FeeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const feeTypeDef = FEE_TYPES[fee.type as keyof typeof FEE_TYPES];
  const frequencyLabel = FEE_FREQUENCY_LABELS[fee.frequency as keyof typeof FEE_FREQUENCY_LABELS] || fee.frequency;
  const scopeLabel = FEE_SCOPE_LABELS[fee.scope as keyof typeof FEE_SCOPE_LABELS] || fee.scope;

  const getAmountDisplay = () => {
    const formatted = new Intl.NumberFormat('fr-FR').format(fee.amount);
    switch (fee.frequency) {
      case 'MONTHLY':
        return `${formatted} FC/mois`;
      case 'TRIMESTRAL':
        return `${formatted} FC/trim.`;
      default:
        return `${formatted} FC`;
    }
  };

  const getAnnualTotal = () => {
    switch (fee.frequency) {
      case 'MONTHLY':
        return fee.amount * 9;
      case 'TRIMESTRAL':
        return fee.amount * 3;
      default:
        return fee.amount;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-neutral-900 truncate">{fee.name}</h3>
            {fee.isRequired && (
              <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 uppercase">
                Obligatoire
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 mt-2">
            <span className="flex items-center gap-1">
              <Tag size={12} />
              {feeTypeDef?.label || fee.type}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {frequencyLabel}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {scopeLabel}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-lg font-bold text-neutral-900">{getAmountDisplay()}</span>
            {fee.frequency !== 'ANNUAL' && fee.frequency !== 'UNIQUE' && (
              <span className="text-xs text-neutral-400">
                ({new Intl.NumberFormat('fr-FR').format(getAnnualTotal())} FC/an)
              </span>
            )}
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={16} className="text-neutral-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl border border-neutral-200 shadow-lg py-1">
              <button
                onClick={() => { onEdit(fee); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <Edit3 size={14} /> Modifier
              </button>
              <button
                onClick={() => { onDuplicate(fee); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <Copy size={14} /> Dupliquer
              </button>
              <hr className="my-1 border-neutral-100" />
              <button
                onClick={() => { onArchive(fee); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-600 hover:bg-amber-50"
              >
                <Archive size={14} /> Archiver
              </button>
              <button
                onClick={() => { onDelete(fee); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
