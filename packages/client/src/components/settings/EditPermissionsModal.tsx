import { useState, useEffect } from "react";
import { X, Save, Loader2, RotateCcw } from "lucide-react";
import { UserItem, ROLE_LABELS } from "../../hooks/useUsers";

interface EditPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    userId: string;
    permissions: Record<string, string[]>;
  }) => Promise<void>;
  isSubmitting: boolean;
  user: UserItem;
}

const MODULES = [
  {
    key: "students",
    label: "MODULE ÉLÈVES",
    actions: ["read", "create", "update", "archive"],
  },
  {
    key: "grades",
    label: "MODULE ACADÉMIQUE",
    actions: ["read", "create", "validate"],
  },
  {
    key: "teachers",
    label: "MODULE ENSEIGNANTS",
    actions: ["read", "create", "update", "delete"],
  },
  {
    key: "finance",
    label: "MODULE FINANCE",
    actions: ["read", "create", "reports"],
  },
  { key: "attendance", label: "MODULE PRÉSENCES", actions: ["read", "create"] },
  { key: "settings", label: "MODULE PARAMÈTRES", actions: ["read", "update"] },
  {
    key: "communication",
    label: "MODULE COMMUNICATION",
    actions: ["read", "create"],
  },
];

const ACTION_LABELS: Record<string, string> = {
  read: "Consulter",
  create: "Créer/Modifier",
  update: "Gérer",
  archive: "Archiver",
  validate: "Valider",
  delete: "Supprimer",
  reports: "Rapports",
};

const DEFAULT_PERMISSIONS: Record<string, Record<string, string[]>> = {
  SUPER_ADMIN: {
    students: ["read", "create", "update", "archive"],
    grades: ["read", "create", "validate"],
    finance: ["read", "create", "reports"],
    teachers: ["read", "create", "update", "delete"],
    settings: ["read", "update"],
    attendance: ["read", "create"],
    communication: ["read", "create"],
  },
  PREFET: {
    students: ["read", "create", "update", "archive"],
    grades: ["read", "validate"],
    finance: ["read", "reports"],
    teachers: ["read", "create", "update"],
    settings: ["read"],
    attendance: ["read", "create"],
    communication: ["read", "create"],
  },
  ECONOME: {
    students: ["read"],
    grades: [],
    finance: ["read", "create", "reports"],
    teachers: ["read"],
    settings: [],
    attendance: ["read"],
    communication: ["read"],
  },
  SECRETAIRE: {
    students: ["read", "create", "update"],
    grades: ["read"],
    finance: ["read", "create"],
    teachers: ["read"],
    settings: [],
    attendance: ["read", "create"],
    communication: ["read", "create"],
  },
  ENSEIGNANT: {
    students: ["read"],
    grades: ["read", "create"],
    finance: [],
    teachers: [],
    settings: [],
    attendance: ["read", "create"],
    communication: ["read"],
  },
  PARENT: {
    students: ["read"],
    grades: ["read"],
    finance: ["read"],
    teachers: [],
    settings: [],
    attendance: ["read"],
    communication: ["read"],
  },
};

export default function EditPermissionsModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  user,
}: EditPermissionsModalProps) {
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Initialize with defaults for role
    setPermissions(DEFAULT_PERMISSIONS[user.role] || {});
  }, [user]);

  if (!isOpen) return null;

  const toggleAction = (module: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[module] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [module]: updated };
    });
  };

  const resetToDefaults = () => {
    setPermissions(DEFAULT_PERMISSIONS[user.role] || {});
  };

  const handleSubmit = async () => {
    try {
      await onSubmit({ userId: user.id, permissions });
      onClose();
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-300/50">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Permissions</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              {user.nom} {user.postNom} —{" "}
              <span className="font-semibold text-primary">
                {ROLE_LABELS[user.role]}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {MODULES.map((mod) => (
            <div key={mod.key}>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                {mod.label}
              </h3>
              <div className="space-y-1.5 ml-1">
                {mod.actions.map((action) => (
                  <label
                    key={action}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(permissions[mod.key] || []).includes(action)}
                      onChange={() => toggleAction(mod.key, action)}
                      className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    />
                    <span className="text-sm text-neutral-700">
                      {ACTION_LABELS[action] || action}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-300/50 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={resetToDefaults}
            className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <RotateCcw size={14} /> Rétablir défaut
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-neutral-700 bg-white border border-neutral-300/50 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
