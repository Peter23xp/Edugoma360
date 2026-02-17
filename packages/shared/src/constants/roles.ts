// ── RBAC Roles & Permissions ──────────────────────────────────────────────────

import type { UserRole } from '../types/user.types';

export type Permission =
    // Students
    | 'students:read'
    | 'students:create'
    | 'students:update'
    | 'students:delete'
    | 'students:export'
    // Grades
    | 'grades:read'
    | 'grades:create'
    | 'grades:update'
    | 'grades:lock'
    | 'grades:export'
    // Finance
    | 'finance:read'
    | 'finance:create'
    | 'finance:update'
    | 'finance:delete'
    | 'finance:reports'
    | 'finance:export'
    // Attendance
    | 'attendance:read'
    | 'attendance:create'
    | 'attendance:update'
    | 'attendance:reports'
    // Teachers
    | 'teachers:read'
    | 'teachers:create'
    | 'teachers:update'
    | 'teachers:delete'
    // SMS
    | 'sms:send'
    | 'sms:read'
    | 'sms:templates'
    // Reports
    | 'reports:bulletins'
    | 'reports:palmares'
    | 'reports:pv'
    | 'reports:statistics'
    // Settings
    | 'settings:read'
    | 'settings:update'
    | 'settings:users'
    | 'settings:school'
    | 'settings:academic_year'
    // Sync
    | 'sync:read'
    | 'sync:manage'
    // Deliberation
    | 'deliberation:read'
    | 'deliberation:create'
    | 'deliberation:validate'
    // Parent Portal
    | 'parent:view_child'
    | 'parent:view_grades'
    | 'parent:view_payments';

/**
 * Matrice de permissions par rôle
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    SUPER_ADMIN: [
        // All permissions
        'students:read', 'students:create', 'students:update', 'students:delete', 'students:export',
        'grades:read', 'grades:create', 'grades:update', 'grades:lock', 'grades:export',
        'finance:read', 'finance:create', 'finance:update', 'finance:delete', 'finance:reports', 'finance:export',
        'attendance:read', 'attendance:create', 'attendance:update', 'attendance:reports',
        'teachers:read', 'teachers:create', 'teachers:update', 'teachers:delete',
        'sms:send', 'sms:read', 'sms:templates',
        'reports:bulletins', 'reports:palmares', 'reports:pv', 'reports:statistics',
        'settings:read', 'settings:update', 'settings:users', 'settings:school', 'settings:academic_year',
        'sync:read', 'sync:manage',
        'deliberation:read', 'deliberation:create', 'deliberation:validate',
        'parent:view_child', 'parent:view_grades', 'parent:view_payments',
    ],

    PREFET: [
        'students:read', 'students:create', 'students:update', 'students:export',
        'grades:read', 'grades:create', 'grades:update', 'grades:lock', 'grades:export',
        'attendance:read', 'attendance:create', 'attendance:update', 'attendance:reports',
        'teachers:read', 'teachers:create', 'teachers:update',
        'sms:send', 'sms:read', 'sms:templates',
        'reports:bulletins', 'reports:palmares', 'reports:pv', 'reports:statistics',
        'settings:read', 'settings:academic_year',
        'deliberation:read', 'deliberation:create', 'deliberation:validate',
    ],

    ECONOME: [
        'students:read',
        'finance:read', 'finance:create', 'finance:update', 'finance:reports', 'finance:export',
        'sms:send', 'sms:read',
        'reports:statistics',
        'settings:read',
    ],

    SECRETAIRE: [
        'students:read', 'students:create', 'students:update', 'students:export',
        'grades:read', 'grades:export',
        'attendance:read', 'attendance:reports',
        'teachers:read',
        'reports:bulletins', 'reports:palmares', 'reports:pv',
        'settings:read',
    ],

    ENSEIGNANT: [
        'students:read',
        'grades:read', 'grades:create', 'grades:update',
        'attendance:read', 'attendance:create', 'attendance:update',
        'deliberation:read',
    ],

    PARENT: [
        'parent:view_child',
        'parent:view_grades',
        'parent:view_payments',
    ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] ?? [];
}
