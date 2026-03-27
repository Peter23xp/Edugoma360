import { useAuthStore } from '../../stores/auth.store';
import AccessDeniedPage from '../../pages/AccessDeniedPage';

interface RoleGuardProps {
    /** Liste des rôles autorisés. Si l'utilisateur n'a pas l'un de ces rôles, il voit la page "Accès refusé". */
    allowedRoles: string[];
    children: React.ReactNode;
}

/**
 * Composant de garde qui vérifie si l'utilisateur connecté possède un des rôles autorisés.
 * Si non, affiche la page AccessDeniedPage au lieu du contenu enfant.
 * 
 * Usage:
 * ```tsx
 * <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
 *   <SettingsPage />
 * </RoleGuard>
 * ```
 */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const user = useAuthStore((s) => s.user);

    // Si pas d'utilisateur (ne devrait pas arriver car ProtectedRoute gère ça en amont)
    if (!user) return null;

    // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
    if (!allowedRoles.includes(user.role)) {
        return <AccessDeniedPage />;
    }

    return <>{children}</>;
}
