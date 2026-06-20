import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  CalendarCheck,
  MessageSquare,
  FileBarChart,
  Settings,
  X,
  BookOpen,
  TrendingUp,
  Receipt,
  ClipboardList,
  Send,
  UserCheck,
  Cog,
  Briefcase,
  Target,
  UserCog,
  Mail,
  Megaphone,
  BarChart2,
  Download,
  History,
  Package,
  Building2,
  Wrench,
  Library,
  ShieldAlert,
  User,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/logo.svg";
import { cn } from "../../lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, path: "/dashboard", roles: ["*"] },
  {
    label: "Élèves",
    icon: Users,
    path: "/students",
    roles: ["SUPER_ADMIN", "PREFET", "SECRETAIRE", "ENSEIGNANT"],
  },
  {
    label: "Enseignants",
    icon: Briefcase,
    roles: ["SUPER_ADMIN", "PREFET"],
    children: [
      { label: "Liste & Gestion", icon: Users, path: "/teachers" },
      {
        label: "Affectations",
        icon: ClipboardList,
        path: "/teachers/assignments",
      },
      { label: "Absences", icon: CalendarCheck, path: "/teachers/absences" },
      { label: "Rapports", icon: FileBarChart, path: "/teachers/reports" },
    ],
  },
  {
    label: "Notes",
    icon: GraduationCap,
    roles: ["SUPER_ADMIN", "PREFET", "ENSEIGNANT"],
    children: [
      { label: "Saisie des notes", icon: BookOpen, path: "/grades" },
      { label: "Moyennes", icon: TrendingUp, path: "/grades/averages" },
      {
        label: "Délibération",
        icon: ClipboardList,
        path: "/grades/deliberation",
      },
      {
        label: "Historique délibérations",
        icon: History,
        path: "/grades/deliberation/historique",
        roles: ["SUPER_ADMIN", "PREFET"],
      },
    ],
  },
  {
    label: "Finances",
    icon: Wallet,
    roles: ["SUPER_ADMIN", "ECONOME", "PREFET"],
    children: [
      { label: "Tableau de bord", icon: Wallet, path: "/finance" },
      { label: "Gestion de Caisse", icon: Wallet, path: "/finance/cashier" },
      { label: "Historique", icon: ClipboardList, path: "/finance/payments" },
      {
        label: "Nouveau paiement",
        icon: Receipt,
        path: "/finance/payments/new",
      },
      { label: "Impayés", icon: FileBarChart, path: "/finance/debts" },
      { label: "Rapports Avancés", icon: TrendingUp, path: "/finance/reports" },
      { label: "Config. frais", icon: Cog, path: "/finance/fees" },
      { label: "Budgets & Prévisions", icon: Target, path: "/finance/budgets" },
    ],
  },
  {
    label: "Présences",
    icon: CalendarCheck,
    roles: ["SUPER_ADMIN", "PREFET", "ENSEIGNANT"],
    children: [
      {
        label: "Appel Quotidien",
        icon: UserCheck,
        path: "/attendance/roll-call",
      },
      { label: "Historique", icon: ClipboardList, path: "/attendance/history" },
      {
        label: "Justificatifs",
        icon: FileBarChart,
        path: "/attendance/justifications",
      },
      { label: "Rapports", icon: FileBarChart, path: "/attendance/report" },
    ],
  },
  {
    label: "Communication",
    icon: MessageSquare,
    roles: ["SUPER_ADMIN", "PREFET", "SECRETAIRE"],
    children: [
      { label: "Envoyer SMS", icon: Send, path: "/sms" },
      { label: "Emails", icon: Mail, path: "/emails" },
      { label: "Convocations", icon: UserCheck, path: "/convocations" },
      { label: "Annonces", icon: Megaphone, path: "/announcements" },
    ],
  },
  {
    label: "Inventaire",
    icon: Package,
    roles: ["SUPER_ADMIN", "PREFET", "SECRETAIRE"],
    children: [
      { label: "Matériel", icon: Package, path: "/inventory/material" },
      { label: "Bibliothèque", icon: Library, path: "/inventory/library" },
      { label: "Salles", icon: Building2, path: "/inventory/rooms" },
      { label: "Maintenance", icon: Wrench, path: "/inventory/maintenance" },
    ],
  },
  {
    label: "Rapports",
    icon: FileBarChart,
    roles: ["SUPER_ADMIN", "PREFET", "ECONOME"],
    children: [
      { label: "Tableau de bord Direction", icon: TrendingUp, path: "/reports/dashboard" },
      { label: "Statistiques école", icon: BarChart2, path: "/reports/statistics" },
      { label: "Générateur de rapports", icon: FileBarChart, path: "/reports/generator" },
      { label: "Exports avancés", icon: Download, path: "/reports/exports" },
      { label: "Fiche EDU-NC", icon: FileBarChart, path: "/reports/edu-nc" },
      { label: "Listes Examen d'État", icon: GraduationCap, path: "/reports/exam-national" },
    ],
  },
  {
    label: "Discipline",
    icon: ShieldAlert,
    roles: ["SUPER_ADMIN", "PREFET"],
    path: "/discipline",
  },
  {
    label: "Abonnement",
    icon: Wallet,
    path: "/billing",
    roles: ["SUPER_ADMIN", "PREFET", "ECONOME"],
  },
  {
    label: "Paramètres",
    icon: Settings,
    roles: ["SUPER_ADMIN", "PREFET"],
    children: [
      { label: "Infos École", icon: Cog, path: "/settings/school" },
      {
        label: "Année académique",
        icon: CalendarCheck,
        path: "/settings/academic-year",
      },
      {
        label: "Sections & Matières",
        icon: BookOpen,
        path: "/settings/sections",
      },
      {
        label: "Gestion des Classes",
        icon: ClipboardList,
        path: "/settings/classes",
      },
      { label: "Utilisateurs", icon: UserCog, path: "/settings/users" },
      { label: "Synchronisation", icon: TrendingUp, path: "/settings/sync" },
      { label: "Mon Profil", icon: User, path: "/settings/profile", roles: ["*"] },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { hasRole } = useAuth();

  const canSee = (roles: string[]) => {
    if (roles.includes("*")) return true;
    return roles.some((r) => hasRole(r as never));
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-neutral-300/50 shadow-lg",
        "transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-neutral-300/50">
        <div className="flex items-center gap-3">
          <img src={logo} alt="EduGoma 360" className="w-10 h-10 rounded-lg" />
          <div>
            <h1 className="font-bold text-primary text-sm leading-tight">
              EduGoma 360
            </h1>
            <p className="text-[10px] text-neutral-500">Gestion Scolaire</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
        {navItems
          .filter((item) => canSee(item.roles))
          .map((item) => {
            if (item.children) {
              return (
                <div key={item.label} className="space-y-0.5">
                  <p className="flex items-center gap-2 px-3 pt-4 pb-1.5 text-xs font-semibold text-neutral-700">
                    <item.icon size={14} className="text-neutral-500" />
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "sidebar-link pl-9",
                          isActive && "sidebar-link-active",
                        )
                      }
                    >
                      <child.icon size={16} />
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path!}
                end={item.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  cn("sidebar-link", isActive && "sidebar-link-active")
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
}
