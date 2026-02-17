import { Menu, Bell, RefreshCw, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOffline } from '../../hooks/useOffline';
import { useSync } from '../../hooks/useSync';
import { useSchoolStore } from '../../stores/school.store';
import { getInitials } from '../../lib/utils';

interface HeaderProps {
    onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
    const { user, logout, fullName } = useAuth();
    const { isOnline, pendingCount } = useOffline();
    const { syncNow, isSyncing } = useSync();
    const { schoolName, academicYearLabel, termLabel } = useSchoolStore();

    return (
        <header className="bg-white border-b border-neutral-300/50 px-4 py-3 flex items-center justify-between no-print">
            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="p-2 rounded-lg hover:bg-neutral-100 lg:hidden"
                    aria-label="Menu"
                >
                    <Menu size={20} />
                </button>

                <div className="hidden md:block">
                    <h2 className="text-sm font-semibold text-neutral-900">{schoolName || 'EduGoma 360'}</h2>
                    <p className="text-xs text-neutral-500">
                        {academicYearLabel && `${academicYearLabel}`}
                        {termLabel && ` — ${termLabel}`}
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
                {/* Connection indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-xs">
                    <span className={isOnline ? 'online-dot' : 'offline-dot'} />
                    <span className="hidden sm:inline text-neutral-600">
                        {isOnline ? 'En ligne' : 'Hors-ligne'}
                    </span>
                </div>

                {/* Sync button */}
                {pendingCount > 0 && (
                    <button
                        onClick={syncNow}
                        disabled={isSyncing}
                        className="relative p-2 rounded-lg hover:bg-neutral-100 text-secondary"
                        title={`${pendingCount} élément(s) en attente de sync`}
                    >
                        <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                        <span className="absolute -top-0.5 -right-0.5 bg-secondary text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center">
                            {pendingCount}
                        </span>
                    </button>
                )}

                {/* Notifications */}
                <button className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600">
                    <Bell size={18} />
                </button>

                {/* User menu */}
                <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                        {user ? getInitials(user.nom, user.postNom) : <User size={14} />}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-xs font-medium text-neutral-900 leading-tight">{fullName}</p>
                        <p className="text-[10px] text-neutral-500 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-1.5 rounded-lg hover:bg-danger-bg text-neutral-500 hover:text-danger transition-colors"
                        title="Déconnexion"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}
