import { useState } from 'react';
import { Plus, Building2, CheckCircle, AlertTriangle, XCircle, List, BarChart3, UserCheck } from 'lucide-react';
import { useRooms, type Room } from '../../hooks/useRooms';
import AddRoomModal from '../../components/inventory/AddRoomModal';

const TYPE_LABELS: Record<string, string> = {
  CLASSROOM: 'Salles de classe',
  LABORATORY: 'Laboratoires',
  OFFICE: 'Bureaux',
  TEACHERS_ROOM: 'Salle des professeurs',
  LIBRARY: 'Bibliothèque',
  SPORTS: 'Terrains sportifs',
  CAFETERIA: 'Réfectoire',
  OTHER: 'Autre',
};

const TYPE_ICONS: Record<string, string> = {
  CLASSROOM: '🏫',
  LABORATORY: '🔬',
  OFFICE: '🏢',
  TEACHERS_ROOM: '👨‍🏫',
  LIBRARY: '📚',
  SPORTS: '⚽',
  CAFETERIA: '🍽️',
  OTHER: '📦',
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  GOOD: { label: '✅ Bon état', className: 'text-green-600' },
  DEGRADED: { label: '⚠️ Dégradée', className: 'text-orange-600' },
  CLOSED: { label: '❌ Fermée', className: 'text-red-600' },
};

export default function RoomsPage() {
  const [filters, setFilters] = useState<{ type?: string; status?: string }>({});
  const [view, setView] = useState<'list' | 'occupancy'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);

  const { rooms, stats, occupancy, isLoading, createRoom, updateRoom, deleteRoom } = useRooms(filters);

  const groupedRooms = rooms.reduce<Record<string, Room[]>>((acc, room) => {
    if (!acc[room.type]) acc[room.type] = [];
    acc[room.type].push(room);
    return acc;
  }, {});

  const handleCreate = (data: any) => {
    createRoom.mutate(data, { onSuccess: () => setShowAddModal(false) });
  };

  const handleUpdate = (data: any) => {
    if (!editRoom) return;
    updateRoom.mutate({ id: editRoom.id, ...data }, { onSuccess: () => setEditRoom(null) });
  };

  const handleDelete = (room: Room) => {
    if (confirm(`Supprimer "${room.name}" ?`)) {
      deleteRoom.mutate(room.id);
    }
  };

  const statsCards = [
    { label: 'Total salles', value: stats.total, icon: Building2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Bonnes', value: stats.good, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Dégradées', value: stats.degraded, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
    { label: 'Fermées', value: stats.closed, icon: XCircle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Salles & Infrastructures</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter salle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg ${view === 'list' ? 'bg-[#1B5E20] text-white' : 'border hover:bg-gray-50'}`}
          >
            <List className="w-4 h-4" />
            Liste
          </button>
          <button
            onClick={() => setView('occupancy')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg ${view === 'occupancy' ? 'bg-[#1B5E20] text-white' : 'border hover:bg-gray-50'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Occupation
          </button>
        </div>
        <select
          value={filters.type || ''}
          onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tous types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* List View */}
      {view === 'list' && (
        isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Aucune salle trouvée</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedRooms).map(([type, typeRooms]) => (
              <div key={type}>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  {TYPE_LABELS[type] || type} ({typeRooms.length})
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {typeRooms.map((room) => (
                    <div key={room.id} className="bg-white border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {TYPE_ICONS[room.type]} {room.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Capacité : {room.capacity} élèves
                            {room.assignedClass && ` • ${room.assignedClass.name} (${room.currentOccupancy} él.)`}
                          </p>
                          <p className={`text-sm mt-1 ${STATUS_BADGE[room.status]?.className}`}>
                            {STATUS_BADGE[room.status]?.label}
                            {room.stateDescription && ` (${room.stateDescription})`}
                          </p>
                          {room.responsable && (
                            <p className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <UserCheck className="w-4 h-4 text-[#1B5E20]" />
                              Responsable : {room.responsable.nom} {room.responsable.postNom || ''} {room.responsable.prenom || ''}
                            </p>
                          )}
                          {room.equipments.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {room.equipments.map((eq) => `${eq} ✓`).join(' | ')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditRoom(room)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Modifier
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDelete(room)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Suppr.
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Occupancy View */}
      {view === 'occupancy' && (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium">Salle</th>
                <th className="text-left p-3 font-medium">Capacité</th>
                <th className="text-left p-3 font-medium">Classe</th>
                <th className="text-left p-3 font-medium">Effectif</th>
                <th className="text-left p-3 font-medium">Occupation</th>
              </tr>
            </thead>
            <tbody>
              {occupancy.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="p-3">{row.name}</td>
                  <td className="p-3">{row.capacity}</td>
                  <td className="p-3">{row.className || '—'}</td>
                  <td className="p-3">{row.effectif || '—'}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                        <div
                          className={`h-full rounded-full ${
                            row.occupancyRate > 90 ? 'bg-red-500' : row.occupancyRate > 70 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(row.occupancyRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{row.occupancyRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AddRoomModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
        isLoading={createRoom.isPending}
      />

      <AddRoomModal
        open={!!editRoom}
        onClose={() => setEditRoom(null)}
        onSubmit={handleUpdate}
        isLoading={updateRoom.isPending}
        initialData={editRoom}
      />
    </div>
  );
}
