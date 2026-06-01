import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import {
    LayoutDashboard,
    School,
    CreditCard,
    MessageSquare,
    Package,
    LogOut,
    Shield,
    ChevronRight,
} from 'lucide-react';

// ── Super Admin Layout ────────────────────────────────────────────────────────
// Distinct dark-green sidebar layout SEPARATE from the school AppLayout.
// Primary: #1B5E20 | Accent: #F57F17
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { to: '/superadmin/metrics',       icon: LayoutDashboard, label: 'Métriques'    },
    { to: '/superadmin/schools',       icon: School,          label: 'Écoles'       },
    { to: '/superadmin/subscriptions', icon: CreditCard,      label: 'Abonnements'  },
    { to: '/superadmin/sms',           icon: MessageSquare,   label: 'Usage SMS'    },
    { to: '/superadmin/plans',         icon: Package,         label: 'Plans'        },
];

export default function SuperAdminLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
            {/* ── Sidebar ── */}
            <aside className="w-64 flex flex-col flex-shrink-0 bg-[#1B5E20] shadow-2xl">
                {/* Logo / Brand */}
                <div className="px-6 py-5 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-6 h-6 text-[#F57F17]" />
                        <span className="text-lg font-bold tracking-wide">EduGoma 360</span>
                    </div>
                    <p className="text-xs text-green-200 font-medium uppercase tracking-widest">
                        Super Admin
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                                    isActive
                                        ? 'bg-white/15 text-white shadow'
                                        : 'text-green-100 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-[#F57F17]' : 'text-green-300 group-hover:text-white'}`} />
                                    <span className="flex-1">{label}</span>
                                    {isActive && <ChevronRight className="w-3 h-3 text-[#F57F17]" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User info + Logout */}
                <div className="px-4 py-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#F57F17] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {user?.nom?.charAt(0) ?? 'S'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{user?.nom} {user?.prenom}</p>
                            <p className="text-xs text-green-300 truncate">{user?.email ?? user?.phone}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-green-200 hover:bg-red-600/20 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 overflow-y-auto bg-gray-950">
                <Outlet />
            </main>
        </div>
    );
}
