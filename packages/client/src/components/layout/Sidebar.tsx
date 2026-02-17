import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, GraduationCap, Wallet, CalendarCheck,
    MessageSquare, FileBarChart, Settings, X, BookOpen, TrendingUp,
    Receipt, ClipboardList, Send, UserCheck, Cog,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.svg';
import { cn } from '../../lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: '/', roles: ['*'] },
    { label: 'Élèves', icon: Users, path: '/students', roles: ['SUPER_ADMIN', 'PREFET', 'SECRETAIRE', 'ENSEIGNANT'] },
    {
        label: 'Notes',
        icon: GraduationCap,
        roles: ['SUPER_ADMIN', 'PREFET', 'ENSEIGNANT'],
        children: [
            { label: 'Saisie des notes', icon: BookOpen, path: '/grades' },
            { label: 'Moyennes', icon: TrendingUp, path: '/grades/averages' },
            { label: 'Délibération', icon: ClipboardList, path: '/grades/deliberation' },
        ],
    },
    {
        label: 'Finances',
        icon: Wallet,
        roles: ['SUPER_ADMIN', 'ECONOME'],
        children: [
            { label: 'Tableau de bord', icon: Wallet, path: '/finance' },
            { label: 'Nouveau paiement', icon: Receipt, path: '/finance/payment' },
            { label: 'Impayés', icon: FileBarChart, path: '/finance/debts' },
        ],
    },
    { label: 'Présences', icon: CalendarCheck, path: '/attendance', roles: ['SUPER_ADMIN', 'PREFET', 'ENSEIGNANT'] },
    {
        label: 'SMS',
        icon: MessageSquare,
        roles: ['SUPER_ADMIN', 'PREFET', 'SECRETAIRE'],
        children: [
            { label: 'Envoyer SMS', icon: Send, path: '/sms' },
            { label: 'Convocations', icon: UserCheck, path: '/convocations' },
        ],
    },
    { label: 'Rapports', icon: FileBarChart, path: '/reports', roles: ['SUPER_ADMIN', 'PREFET', 'ECONOME'] },
    {
        label: 'Paramètres',
        icon: Settings,
        roles: ['SUPER_ADMIN', 'PREFET'],
        children: [
            { label: 'École', icon: Cog, path: '/settings' },
            { label: 'Année académique', icon: CalendarCheck, path: '/settings/academic-year' },
            { label: 'Matières', icon: BookOpen, path: '/settings/subjects' },
            { label: 'Synchronisation', icon: TrendingUp, path: '/settings/sync' },
        ],
    },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { hasRole } = useAuth();

    const canSee = (roles: string[]) => {
        if (roles.includes('*')) return true;
        return roles.some((r) => hasRole(r as never));
    };

    return (
        <aside
            className={cn(
                'fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-neutral-300/50 shadow-lg',
                'transform transition-transform duration-300 ease-in-out',
                'lg:translate-x-0',
                isOpen ? 'translate-x-0' : '-translate-x-full',
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-neutral-300/50">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="EduGoma 360" className="w-10 h-10 rounded-lg" />
                    <div>
                        <h1 className="font-bold text-primary text-sm leading-tight">EduGoma 360</h1>
                        <p className="text-[10px] text-neutral-500">Gestion Scolaire</p>
                    </div>
                </div>
                <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100">
                    <X size={18} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
                {navItems.filter((item) => canSee(item.roles)).map((item) => {
                    if (item.children) {
                        return (
                            <div key={item.label} className="space-y-0.5">
                                <p className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <item.icon size={14} />
                                    {item.label}
                                </p>
                                {item.children.map((child) => (
                                    <NavLink
                                        key={child.path}
                                        to={child.path}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            cn('sidebar-link pl-9', isActive && 'sidebar-link-active')
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
                            end={item.path === '/'}
                            onClick={onClose}
                            className={({ isActive }) =>
                                cn('sidebar-link', isActive && 'sidebar-link-active')
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
