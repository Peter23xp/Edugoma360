import {
  MoreVertical,
  Edit2,
  Shield,
  KeyRound,
  Power,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { UserItem, ROLE_LABELS } from "../../hooks/useUsers";

interface UserCardProps {
  user: UserItem;
  onEditPermissions: (user: UserItem) => void;
  onResetPassword: (user: UserItem) => void;
  onToggleStatus: (userId: string) => void;
  onDelete: (userId: string) => void;
}

function formatLastLogin(dateStr?: string | null): string {
  if (!dateStr) return "Jamais connecté";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 30) return "En ligne";
  if (diffMin < 60) return `Il y a ${diffMin} min`;

  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString("fr-CD", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return `Aujourd'hui à ${time}`;
  if (isYesterday) return `Hier à ${time}`;
  return (
    d.toLocaleDateString("fr-CD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ` à ${time}`
  );
}

function isOnline(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 30 * 60 * 1000;
}

export default function UserCard({
  user,
  onEditPermissions,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: UserCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const online = isOnline(user.lastLoginAt);
  const roleLabel = ROLE_LABELS[user.role] || user.role;

  return (
    <div
      className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${!user.isActive ? "opacity-60 border-neutral-200" : "border-neutral-300/50"}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
            {user.nom.charAt(0)}
            {user.postNom?.charAt(0) || ""}
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              {user.nom} {user.postNom} {user.prenom || ""}
            </h3>
            <p className="text-xs text-neutral-500">
              {user.email || user.phone || "—"}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-40 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 w-48">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEditPermissions(user);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <Shield size={14} /> Permissions
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onResetPassword(user);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <KeyRound size={14} /> Réinitialiser MDP
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleStatus(user.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <Power size={14} /> {user.isActive ? "Désactiver" : "Activer"}
                </button>
                <hr className="my-1 border-neutral-100" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (
                      window.confirm(
                        `Supprimer définitivement ${user.nom} ${user.postNom} ?`,
                      )
                    ) {
                      onDelete(user.id);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-5 pb-4 space-y-1.5">
        <p className="text-sm text-neutral-700">
          {user.isActive ? (
            <span className="text-emerald-600 font-medium">🟢 Actif</span>
          ) : (
            <span className="text-amber-600 font-medium">🔴 Inactif</span>
          )}
          <span className="mx-1.5 text-neutral-300">•</span>
          <span className="font-semibold text-neutral-800">{roleLabel}</span>
          <span className="mx-1.5 text-neutral-300">•</span>
          {online ? (
            <span className="text-emerald-600 font-medium">En ligne</span>
          ) : (
            <span className="text-neutral-500">Hors ligne</span>
          )}
        </p>
        <p className="text-xs text-neutral-500">
          Dernière connexion : {formatLastLogin(user.lastLoginAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          onClick={() => onEditPermissions(user)}
          className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
        >
          Permissions
        </button>
        <button
          onClick={() => onResetPassword(user)}
          className="text-xs font-bold text-neutral-700 hover:text-primary transition-colors"
        >
          Réinitialiser MDP
        </button>
        <button
          onClick={() => onToggleStatus(user.id)}
          className={`text-xs font-bold transition-colors ${user.isActive ? "text-amber-600 hover:text-amber-800" : "text-emerald-600 hover:text-emerald-800"}`}
        >
          {user.isActive ? "Désactiver" : "Activer"}
        </button>
      </div>
    </div>
  );
}
