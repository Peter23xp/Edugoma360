import { useAuthStore } from '../stores/auth.store';
import { useCallback } from 'react';
import type { UserRole } from '@edugoma360/shared';

/**
 * Hook for auth-related functionality
 */
export function useAuth() {
    const { user, isAuthenticated, isLoading, login, logout, fetchProfile } = useAuthStore();

    const hasRole = useCallback(
        (...roles: UserRole[]) => {
            if (!user) return false;
            return roles.includes(user.role as UserRole);
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

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        fetchProfile,
        hasRole,
        isAdmin,
        isFinance,
        isTeacher,
        isParent,
        fullName,
    };
}
