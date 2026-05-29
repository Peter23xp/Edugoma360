import { useState, useMemo } from 'react';
import { Plus, FileSpreadsheet, Search } from 'lucide-react';
import { useMaterial, type MaterialItem, type MaterialFilters } from '../../hooks/useMaterial';
import MaterialStatsCards from '../../components/inventory/MaterialStatsCards';
import MaterialCard from '../../components/inventory/MaterialCard';
import AddMaterialModal from '../../components/inventory/AddMaterialModal';
import StockMovementModal from '../../components/inventory/StockMovementModal';
import * as XLSX from 'xlsx';

const CATEGORIES = [
  { value: '', label: 'Toutes catégories' },
  { value: 'MOBILIER', label: 'Mobilier' },
  { value: 'INFORMATIQUE', label: 'Informatique' },
  { value: 'PEDAGOGIQUE', label: 'Pédagogique' },
  { value: 'FOURNITURES', label: 'Fournitures' },
  { value: 'SPORT', label: 'Sport' },
  { value: 'AUTRE', label: 'Autre' },
];

const STATUS_FILTERS = [
  { value: '', label: 'Tous états' },
  { value: 'LOW_STOCK', label: 'Stock bas' },
  { value: 'BROKEN_HIGH', label: '> 10% HS' },
];

const CATEGORY_LABELS: Record<string, string> = {
  MOBILIER: 'Mobilier',
  INFORMATIQUE: 'Équipements informatiques',
  PEDAGOGIQUE: 'Matériel pédagogique',
  FOURNITURES: 'Fournitures',
  SPORT: 'Équipements sportifs',
  AUTRE: 'Autre',
};

export default function MaterialPage() {
  const [filters, setFilters] = useState<MaterialFilters>({});
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<MaterialItem | null>(null);
  const [movementItem, setMovementItem] = useState<MaterialItem | null>(null);

  const { items, stats, isLoading, createItem, updateItem, deleteItem, createMovement } = useMaterial({
    ...filters,
    search: search || undefined,
  });

  const groupedItems = useMemo(() => {
    const groups: Record<string, MaterialItem[]> = {};
    for (const item of items) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [items]);

  const handleExport = () => {
    const rows = items.map((item) => ({
      'Désignation': item.name,
      'Catégorie': CATEGORY_LABELS[item.category] || item.category,
      'Bon état': item.goodQty,
      'Usé': item.usedQty,
      'Hors service': item.brokenQty,
      'Total': item.totalQty,
      'Valeur unitaire (FC)': item.unitValue,
      'Valeur totale (FC)': item.totalValue,
      'Seuil min': item.minStock,
      'Localisation': item.location || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaire Matériel');
    XLSX.writeFile(wb, `inventaire_materiel_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleCreateItem = (data: any) => {
    createItem.mutate(data, { onSuccess: () => setShowAddModal(false) });
  };

  const handleUpdateItem = (data: any) => {
    if (!editItem) return;
    updateItem.mutate({ id: editItem.id, ...data }, { onSuccess: () => setEditItem(null) });
  };

  const handleDeleteItem = (item: MaterialItem) => {
    if (confirm(`Supprimer "${item.name}" ?`)) {
      deleteItem.mutate(item.id);
    }
  };

  const handleMovement = (data: any) => {
    createMovement.mutate(data, { onSuccess: () => setMovementItem(null) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Matériel Scolaire</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Rapport
          </button>
        </div>
      </div>

      {/* Stats */}
      <MaterialStatsCards stats={stats} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Items grouped by category */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun article trouvé. Ajoutez votre premier article.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                {CATEGORY_LABELS[category] || category} ({categoryItems.reduce((s, i) => s + i.totalQty, 0)} articles)
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {categoryItems.map((item) => (
                  <MaterialCard
                    key={item.id}
                    item={item}
                    onMovement={setMovementItem}
                    onEdit={setEditItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddMaterialModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateItem}
        isLoading={createItem.isPending}
      />

      <AddMaterialModal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handleUpdateItem}
        isLoading={updateItem.isPending}
        initialData={editItem}
      />

      <StockMovementModal
        open={!!movementItem}
        item={movementItem}
        onClose={() => setMovementItem(null)}
        onSubmit={handleMovement}
        isLoading={createMovement.isPending}
      />
    </div>
  );
}
