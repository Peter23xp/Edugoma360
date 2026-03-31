import { useState, useMemo } from "react";
import { Plus, UserCog, AlertCircle, Search } from "lucide-react";
import {
  useUsers,
  UserItem,
  ROLE_LIST,
  ROLE_LABELS,
} from "../../hooks/useUsers";
import UserStatsCards from "../../components/settings/UserStatsCards";
import UserCard from "../../components/settings/UserCard";
import CreateUserModal from "../../components/settings/CreateUserModal";
import EditPermissionsModal from "../../components/settings/EditPermissionsModal";
import ResetPasswordModal from "../../components/settings/ResetPasswordModal";

export default function UsersManagementPage() {
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [permissionsTarget, setPermissionsTarget] = useState<UserItem | null>(
    null,
  );
  const [resetPasswordTarget, setResetPasswordTarget] =
    useState<UserItem | null>(null);

  const {
    data,
    isLoading,
    isError,
    createUser,
    isCreating,
    toggleStatus,
    resetPassword,
    isResetting,
    deleteUser,
    updatePermissions,
    isUpdatingPermissions,
  } = useUsers(
    filterRole || undefined,
    filterStatus || undefined,
    searchTerm || undefined,
  );

  const stats = data?.stats || { total: 0, active: 0, inactive: 0, online: 0 };

  // Group users by role
  const groupedUsers = useMemo(() => {
    if (!data?.users) return {};
    const groups: Record<string, UserItem[]> = {};
    for (const u of data.users) {
      if (!groups[u.role]) groups[u.role] = [];
      groups[u.role].push(u);
    }
    return groups;
  }, [data?.users]);

  // Ordered role groups
  const roleOrder = ROLE_LIST.filter((r) => groupedUsers[r]?.length);

  return (
    <div className="w-full max-w-full overflow-hidden space-y-4 lg:space-y-6 pb-24">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur border-b border-neutral-200 shadow-sm py-4 mb-6 -mx-3 px-3 sm:-mx-4 sm:px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
            <UserCog size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Gestion des Utilisateurs
            </h1>
            <p className="text-sm text-neutral-500">
              Créer, modifier et gérer les accès à la plateforme
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 shadow-md w-full sm:w-auto"
        >
          <Plus size={15} />
          Créer utilisateur
        </button>
      </div>
    </div>

    {/* Stats */}
      <UserStatsCards stats={stats} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-neutral-300/50 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white shadow-sm"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-full sm:w-48 px-3 py-2.5 border border-neutral-300/50 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-sm"
        >
          <option value="">Tous les rôles</option>
          {ROLE_LIST.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-40 px-3 py-2.5 border border-neutral-300/50 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Actifs</option>
          <option value="INACTIVE">Inactifs</option>
          <option value="PENDING">En attente</option>
        </select>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-neutral-600 mt-4">
            Chargement des utilisateurs...
          </p>
        </div>
      )}

      {isError && (
        <div className="text-center py-16">
          <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
          <p className="text-neutral-600 font-medium">
            Erreur lors du chargement
          </p>
        </div>
      )}

      {!isLoading && !isError && roleOrder.length === 0 && (
        <div className="text-center py-16">
          <UserCog size={48} className="mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Aucun utilisateur trouvé
          </h3>
          <p className="text-sm text-neutral-600 mb-6">
            {searchTerm || filterRole || filterStatus
              ? "Essayez de modifier vos filtres"
              : "Commencez par créer votre premier utilisateur"}
          </p>
          {!searchTerm && !filterRole && !filterStatus && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm font-medium transition-colors w-full sm:w-auto"
            >
              <Plus size={14} />
              Créer un utilisateur
            </button>
          )}
        </div>
      )}

      {!isLoading && !isError && roleOrder.length > 0 && (
        <div className="space-y-8">
          {roleOrder.map((role) => (
            <div key={role}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  {ROLE_LABELS[role] || role}S
                </h2>
                <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-semibold">
                  {groupedUsers[role].length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedUsers[role].map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onEditPermissions={(u) => setPermissionsTarget(u)}
                    onResetPassword={(u) => setResetPasswordTarget(u)}
                    onToggleStatus={(id) => toggleStatus(id).catch(() => {})}
                    onDelete={(id) => deleteUser(id).catch(() => {})}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createUser}
        isSubmitting={isCreating}
      />

      {permissionsTarget && (
        <EditPermissionsModal
          isOpen={!!permissionsTarget}
          onClose={() => setPermissionsTarget(null)}
          onSubmit={updatePermissions}
          isSubmitting={isUpdatingPermissions}
          user={permissionsTarget}
        />
      )}

      {resetPasswordTarget && (
        <ResetPasswordModal
          isOpen={!!resetPasswordTarget}
          onClose={() => setResetPasswordTarget(null)}
          onSubmit={resetPassword}
          isSubmitting={isResetting}
          user={resetPasswordTarget}
        />
      )}
    </div>
  );
}
