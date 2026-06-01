import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, RefreshCw, LogOut, User, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useOffline } from '../../hooks/useOffline';
import { useSync } from '../../hooks/useSync';
import { useSchoolStore } from '../../stores/school.store';
import { getInitials } from '../../lib/utils';
import api from '../../lib/api';

interface HeaderProps {
    onMenuToggle: () => void;
}

// Shares cache with DashboardPage — no extra network request when dashboard is mounted
function useNotificationStats() {
    const { user } = useAuth();
    const { data } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: async () => (await api.get('/stats/dashboard-summary')).data,
        staleTime: 60 * 1000,
        refetchInterval: 2 * 60 * 1000,
        enabled: !!user,
    });
    const d = data?.data ?? data ?? {};
    return {
        pendingAlerts: (d.pendingAlerts as number) ?? 0,
        pendingConvocations: (d.pendingConvocations as number) ?? 0,
    };
}

export default function Header({ onMenuToggle }: HeaderProps) {
    const { user, logout, fullName } = useAuth();
    const { isOnline, pendingCount } = useOffline();
    const { syncNow, isSyncing } = useSync();
    const { schoolName, academicYearLabel, termLabel } = useSchoolStore();
    const { pendingAlerts, pendingConvocations } = useNotificationStats();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const totalNotifications = pendingAlerts + pendingConvocations;

    useEffect(() => {
        if (!notifOpen) return;
        function onMouseDown(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, [notifOpen]);

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 h-14 flex items-center justify-between no-print">

            {/* ── Left ─────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors lg:hidden"
                    aria-label="Ouvrir le menu"
                >
                    <Menu size={20} className="text-neutral-700" />
                </button>

                <div className="hidden md:block leading-tight">
                    <p className="text-sm font-semibold text-neutral-900 truncate max-w-[220px]">
                        {schoolName || 'EduGoma 360'}
                    </p>
                    {(academicYearLabel || termLabel) && (
                        <p className="text-xs text-neutral-500">
                            {academicYearLabel}
                            {termLabel && ` · ${termLabel}`}
                        </p>
                    )}
                </div>
            </div>

            {/* ── Right ────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-1">

                {/* Connection status */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-xs mr-1">
                    <span className={isOnline ? 'online-dot' : 'offline-dot'} />
                    <span className="hidden sm:inline text-neutral-600">
                        {isOnline ? 'En ligne' : 'Hors-ligne'}
                    </span>
                </div>

                {/* Sync button — only shows when there are pending items */}
                {pendingCount > 0 && (
                    <button
                        onClick={syncNow}
                        disabled={isSyncing}
                        className="relative p-2 rounded-lg hover:bg-neutral-100 text-accent transition-colors"
                        title={`${pendingCount} élément(s) en attente de synchronisation`}
                    >
                        <RefreshCw size={17} className={isSyncing ? 'animate-spin' : ''} />
                        <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[9px] font-bold min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-0.5">
                            {pendingCount > 9 ? '9+' : pendingCount}
                        </span>
                    </button>
                )}

                {/* ── Notification bell ──────────────────────────────────────── */}
                <div ref={notifRef} className="relative">
                    <button
                        onClick={() => setNotifOpen(v => !v)}
                        className="relative p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
                        aria-label={`Notifications${totalNotifications > 0 ? ` (${totalNotifications})` : ''}`}
                        aria-expanded={notifOpen}
                    >
                        <Bell size={17} />
                        {totalNotifications > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[9px] font-bold min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-0.5 leading-none">
                                {totalNotifications > 9 ? '9+' : totalNotifications}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 overflow-hidden"
                        >
                            {/* Dropdown header */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100">
                                <span className="text-sm font-semibold text-neutral-900">Notifications</span>
                                {totalNotifications > 0 && (
                                    <span className="text-[10px] font-bold text-white bg-error px-1.5 py-0.5 rounded-full">
                                        {totalNotifications}
                                    </span>
                                )}
                            </div>

                            {/* Notification items */}
                            <div className="py-1">
                                {totalNotifications === 0 ? (
                                    <div className="px-4 py-5 text-center">
                                        <CheckCircle2 size={22} className="mx-auto text-primary mb-2 opacity-60" />
                                        <p className="text-sm font-medium text-neutral-700">Aucune alerte</p>
                                        <p className="text-xs text-neutral-400 mt-0.5">Tout est à jour</p>
                                    </div>
                                ) : (
                                    <>
                                        {pendingAlerts > 0 && (
                                            <Link
                                                to="/announcements"
                                                onClick={() => setNotifOpen(false)}
                                                role="menuitem"
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
                                                    <AlertTriangle size={14} className="text-error" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900">
                                                        {pendingAlerts} alerte{pendingAlerts > 1 ? 's' : ''}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">Annonces actives</p>
                                                </div>
                                                <ChevronRight size={13} className="text-neutral-400 shrink-0" />
                                            </Link>
                                        )}
                                        {pendingConvocations > 0 && (
                                            <Link
                                                to="/convocations"
                                                onClick={() => setNotifOpen(false)}
                                                role="menuitem"
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                                    <Bell size={14} className="text-accent" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900">
                                                        {pendingConvocations} convocation{pendingConvocations > 1 ? 's' : ''}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">En attente de réponse</p>
                                                </div>
                                                <ChevronRight size={13} className="text-neutral-400 shrink-0" />
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-neutral-100 px-4 py-2">
                                <Link
                                    to="/announcements"
                                    onClick={() => setNotifOpen(false)}
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    Toutes les annonces →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── User area ─────────────────────────────────────────────── */}
                <div className="flex items-center gap-1 pl-1.5 ml-0.5 border-l border-neutral-200">
                    {/* Avatar + name → profile page */}
                    <Link
                        to="/settings/profile"
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-100 transition-colors"
                        title="Mon profil"
                    >
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[11px] font-bold shrink-0 select-none">
                            {user ? getInitials(user.nom, user.postNom) : <User size={13} />}
                        </div>
                        <div className="hidden md:block leading-tight">
                            <p className="text-xs font-semibold text-neutral-900 max-w-[120px] truncate leading-snug">
                                {fullName || 'Utilisateur'}
                            </p>
                            <p className="text-[10px] text-neutral-500 capitalize leading-snug">
                                {user?.role?.toLowerCase().replace('_', ' ')}
                            </p>
                        </div>
                    </Link>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-error transition-colors"
                        title="Se déconnecter"
                        aria-label="Se déconnecter"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </header>
    );
}
