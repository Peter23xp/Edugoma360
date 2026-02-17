import { useAuthStore } from '../stores/auth.store';
import { useCallback } from 'react';
import type { User } from '../stores/auth.store';

type UserRole = User['role'];

/**
 * Hook for auth-related functionality.
 * Provides user state, login/logout actions, role checks, and offline support.
 */
export function useAuth() {
    const {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshToken,
        loginAttempts,
        lockedUntil,
        incrementAttempts,
        resetAttempts,
        setLockedUntil,
        loadOfflineUser,
        loginOffline,
    } = useAuthStore();

    const hasRole = useCallback(
        (...roles: UserRole[]) => {
            if (!user) return false;
            return roles.includes(user.role);
        },
        [user],
    );

    const isAdmin = useCallback(
        () => hasRole('SUPER_ADMIN', 'PREFET'),
        [hasRole],
    );

    const isFinance = useCallback(
        () => hasRole('SUPER_ADMIN', 'ECONOME'),
        [hasRole],
    );

    const isTeacher = useCallback(
        () => hasRole('ENSEIGNANT'),
        [hasRole],
    );

    const isParent = useCallback(
        () => hasRole('PARENT'),
        [hasRole],
    );

    const fullName = user
        ? `${user.nom.toUpperCase()} ${user.postNom.toUpperCase()}${user.prenom ? ' ' + user.prenom : ''}`
        : '';

    /**
     * Returns the default redirect path for a given role after login.
     */
    const getDefaultRedirect = useCallback((role: UserRole): string => {
        switch (role) {
            case 'SUPER_ADMIN': return '/dashboard';
            case 'PREFET': return '/dashboard';
            case 'ECONOME': return '/finance';
            case 'SECRETAIRE': return '/students';
            case 'ENSEIGNANT': return '/attendance/daily';
            case 'PARENT': return '/parent/home';
            default: return '/dashboard';
        }
    }, []);

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshToken,
        hasRole,
        isAdmin,
        isFinance,
        isTeacher,
        isParent,
        fullName,
        loginAttempts,
        lockedUntil,
        incrementAttempts,
        resetAttempts,
        setLockedUntil,
        loadOfflineUser,
        loginOffline,
        getDefaultRedirect,
    };
}
