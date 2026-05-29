import { Plus, MoreVertical, AlertTriangle, Clock } from 'lucide-react';
import type { MaterialItem } from '../../hooks/useMaterial';

interface Props {
  item: MaterialItem;
  onMovement: (item: MaterialItem) => void;
  onEdit: (item: MaterialItem) => void;
  onDelete: (item: MaterialItem) => void;
}

const categoryIcons: Record<string, string> = {
  MOBILIER: '🪑',
  INFORMATIQUE: '🖥️',
  PEDAGOGIQUE: '📐',
  FOURNITURES: '✏️',
  SPORT: '⚽',
  AUTRE: '📦',
};

export default function MaterialCard({ item, onMovement, onEdit, onDelete }: Props) {
  const totalQty = item.goodQty + item.usedQty + item.brokenQty;
  const brokenPercent = totalQty > 0 ? (item.brokenQty / totalQty) * 100 : 0;
  const daysSinceUpdate = Math.floor((Date.now() - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl">{categoryIcons[item.category] || '📦'}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
            <p className="text-sm text-gray-500">Quantité : {totalQty} unités</p>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
              <span className="text-green-600">✅ {item.goodQty} bonnes</span>
              {item.usedQty > 0 && <span className="text-orange-600">⚠️ {item.usedQty} usées</span>}
              {item.brokenQty > 0 && <span className="text-red-600">❌ {item.brokenQty} HS</span>}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Valeur estimée : {((item.goodQty + item.usedQty) * item.unitValue).toLocaleString('fr-FR')} FC
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMovement(item)}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
            title="Mouvement stock"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="relative group">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 hidden group-hover:block z-10 w-32">
              <button onClick={() => onEdit(item)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">
                Modifier
              </button>
              <button onClick={() => onDelete(item)} className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-2 flex flex-wrap gap-2">
        {item.isLowStock && (
          <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Stock bas ({totalQty}/{item.minStock})
          </span>
        )}
        {brokenPercent > 10 && (
          <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            ❌ {Math.round(brokenPercent)}% HS
          </span>
        )}
        {daysSinceUpdate > 90 && (
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Non vérifié depuis {daysSinceUpdate}j
          </span>
        )}
      </div>
    </div>
  );
}
