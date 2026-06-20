import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import {
    BarChart3,
    Building2,
    CreditCard,
    LogOut,
    MessageSquare,
    Package,
    ShieldCheck,
    Users2,
} from 'lucide-react';
import logo from '../../assets/logo.svg';

const NAV_ITEMS = [
    { to: '/superadmin/metrics',       icon: BarChart3,     label: 'Vue plateforme' },
    { to: '/superadmin/schools',       icon: Building2,     label: 'Écoles' },
    { to: '/superadmin/subscriptions', icon: CreditCard,    label: 'Abonnements' },
    { to: '/superadmin/sms',           icon: MessageSquare, label: 'Usage SMS' },
    { to: '/superadmin/plans',         icon: Package,       label: 'Plans SaaS' },
    { to: '/superadmin/admins',        icon: Users2,        label: 'Admins SA' },
];

export default function SuperAdminLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <div className="flex min-h-screen bg-background text-neutral-900">
            <aside className="hidden w-72 flex-col border-r border-neutral-200 bg-white lg:flex">
                <div className="border-b border-neutral-200 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="EduGoma 360" className="h-10 w-10" />
                        <div>
                            <p className="text-sm font-bold text-primary">EduGoma 360</p>
                            <p className="text-xs font-medium text-neutral-700">Console plateforme</p>
                        </div>
                    </div>
                </div>

                <div className="border-b border-neutral-200 bg-primary-lighter px-5 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <ShieldCheck className="h-4 w-4" />
                        Super administrateur
                    </div>
                    <p className="mt-1 text-xs text-neutral-700">Pilotage multi-écoles, abonnements et quotas.</p>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-primary text-white'
                                        : 'text-neutral-700 hover:bg-primary-lighter hover:text-primary'
                                }`
                            }
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-neutral-200 p-4">
                    <div className="mb-3 min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-900">{user?.nom} {user?.prenom}</p>
                        <p className="truncate text-xs text-neutral-700">{user?.email ?? user?.phone}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
                    >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                    </button>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
                    <div className="flex h-14 items-center justify-between px-4 sm:px-6">
                        <div className="flex items-center gap-3 lg:hidden">
                            <img src={logo} alt="EduGoma 360" className="h-8 w-8" />
                            <span className="text-sm font-bold text-primary">Console plateforme</span>
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-sm font-semibold text-neutral-900">Administration SaaS</p>
                            <p className="text-xs text-neutral-700">Toutes les données plateforme, séparées des espaces école.</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 lg:hidden"
                        >
                            <LogOut className="h-4 w-4" />
                            Sortir
                        </button>
                    </div>
                    <nav className="flex gap-1 overflow-x-auto border-t border-neutral-200 px-3 py-2 lg:hidden">
                        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                                        isActive ? 'bg-primary text-white' : 'text-neutral-700 hover:bg-neutral-100'
                                    }`
                                }
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </NavLink>
                        ))}
                    </nav>
                </header>

                <main className="min-w-0 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
