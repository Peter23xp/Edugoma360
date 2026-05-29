import { useState } from 'react';
import { Plus, ClipboardList, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useMaintenance, type MaintenanceRequest } from '../../hooks/useMaintenance';
import CreateRequestModal from '../../components/inventory/CreateRequestModal';
import UpdateStatusModal from '../../components/inventory/UpdateStatusModal';

const URGENCY_BADGE: Record<string, { label: string; className: string }> = {
  URGENT: { label: '🔴 URGENT', className: 'bg-red-100 text-red-700' },
  NORMAL: { label: '🟠 NORMAL', className: 'bg-orange-100 text-orange-700' },
  LOW: { label: '🟡 FAIBLE', className: 'bg-yellow-100 text-yellow-700' },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
  CANCELLED: 'Annulé',
};

const CATEGORY_LABELS: Record<string, string> = {
  PLOMBERIE: 'Plomberie',
  ELECTRICITE: 'Électricité',
  MENUISERIE: 'Menuiserie',
  PEINTURE: 'Peinture',
  INFORMATIQUE: 'Informatique',
  AUTRE: 'Autre',
};

export default function MaintenancePage() {
  const [filters, setFilters] = useState<{ status?: string; urgency?: string }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updateRequest, setUpdateRequest] = useState<MaintenanceRequest | null>(null);

  const { requests, stats, costs, isLoading, createRequest, updateStatus } = useMaintenance(filters);

  const handleCreate = (data: any) => {
    createRequest.mutate(data, { onSuccess: () => setShowCreateModal(false) });
  };

  const handleUpdate = (data: any) => {
    updateStatus.mutate(data, { onSuccess: () => setUpdateRequest(null) });
  };

  const getDaysWaiting = (createdAt: string) => {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  };

  const grouped = requests.reduce<Record<string, MaintenanceRequest[]>>((acc, req) => {
    if (!acc[req.status]) acc[req.status] = [];
    acc[req.status].push(req);
    return acc;
  }, {});

  const statsCards = [
    { label: 'Total demandes', value: stats.total, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
    { label: 'Urgents', value: stats.urgent, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
    { label: 'En cours', value: stats.inProgress, icon: Clock, color: 'text-orange-600 bg-orange-50' },
    { label: 'Résolus ce mois', value: stats.resolvedThisMonth, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance & Réparations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] text-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle demande
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

      {/* Cost Summary */}
      {costs.totalActual > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800">
            Coût total maintenance cette année : {costs.totalActual.toLocaleString('fr-FR')} FC
            ({costs.count} interventions)
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tous statuts</option>
          <option value="PENDING">En attente</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="RESOLVED">Résolu</option>
          <option value="CANCELLED">Annulé</option>
        </select>
        <select
          value={filters.urgency || ''}
          onChange={(e) => setFilters({ ...filters, urgency: e.target.value || undefined })}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Toutes urgences</option>
          <option value="URGENT">Urgent</option>
          <option value="NORMAL">Normal</option>
          <option value="LOW">Faible</option>
        </select>
      </div>

      {/* Requests */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Aucune demande trouvée</div>
      ) : (
        <div className="space-y-6">
          {['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'].map((status) => {
            const items = grouped[status];
            if (!items || items.length === 0) return null;
            return (
              <div key={status}>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  {STATUS_LABELS[status]} ({items.length} demandes)
                </h2>
                <div className="grid gap-3">
                  {items.map((req) => (
                    <div key={req.id} className="bg-white border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${URGENCY_BADGE[req.urgency]?.className}`}>
                              {URGENCY_BADGE[req.urgency]?.label}
                            </span>
                            {req.status === 'IN_PROGRESS' && (
                              <span className="text-xs text-blue-600 font-medium">🟡 EN COURS</span>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900">{req.titre}</h3>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {req.room?.name && `${req.room.name} — `}
                            {req.location || CATEGORY_LABELS[req.category]}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Signalé par : {req.reportedBy.nom} {req.reportedBy.postNom} • {new Date(req.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          {req.status === 'PENDING' && (
                            <p className="text-xs text-gray-500 mt-1">
                              ⏰ En attente depuis : {getDaysWaiting(req.createdAt)} jours
                            </p>
                          )}
                          {req.status === 'IN_PROGRESS' && (
                            <div className="mt-2">
                              {req.technicien && <p className="text-xs text-gray-600">Technicien : {req.technicien}</p>}
                              {req.estimatedCost && <p className="text-xs text-gray-600">Coût estimé : {req.estimatedCost.toLocaleString('fr-FR')} FC</p>}
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[150px]">
                                  <div
                                    className="h-full bg-[#1B5E20] rounded-full"
                                    style={{ width: `${req.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">{req.progress}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {req.status !== 'RESOLVED' && req.status !== 'CANCELLED' && (
                            <button
                              onClick={() => setUpdateRequest(req)}
                              className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                            >
                              {req.status === 'PENDING' ? 'Prendre en ch.' : 'Marquer résolu'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateRequestModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={createRequest.isPending}
      />

      <UpdateStatusModal
        open={!!updateRequest}
        request={updateRequest}
        onClose={() => setUpdateRequest(null)}
        onSubmit={handleUpdate}
        isLoading={updateStatus.isPending}
      />
    </div>
  );
}
