import { Users, UserCheck, UserX, Wifi } from "lucide-react";
import { UserStats } from "../../hooks/useUsers";

interface UserStatsCardsProps {
  stats: UserStats;
}

const cards = [
  {
    key: "total",
    label: "Total utilisateurs",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "active",
    label: "Actifs",
    icon: UserCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "inactive",
    label: "Inactifs",
    icon: UserX,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "online",
    label: "En ligne maintenant",
    icon: Wifi,
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
] as const;

export default function UserStatsCards({ stats }: UserStatsCardsProps) {
  const values: Record<string, number | string> = {
    total: stats.total,
    active: stats.active,
    inactive: stats.inactive,
    online: stats.online,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const value = values[c.key];
        const pct =
          c.key === "active" && stats.total > 0
            ? `(${Math.round((stats.active / stats.total) * 100)}%)`
            : c.key === "inactive" && stats.total > 0
              ? `(${Math.round((stats.inactive / stats.total) * 100)}%)`
              : "";
        return (
          <div
            key={c.key}
            className="bg-white border border-neutral-300/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${c.bg}`}>
                <Icon size={18} className={c.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">
                  {value}{" "}
                  {pct && (
                    <span className="text-xs font-medium text-neutral-500">
                      {pct}
                    </span>
                  )}
                </p>
                <p className="text-xs text-neutral-500 font-medium">
                  {c.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
