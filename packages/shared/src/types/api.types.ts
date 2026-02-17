// ── API Response Types ────────────────────────────────────────────────────────

/**
 * Standard API error format for all endpoints
 */
export interface ApiError {
    error: {
        code: string;
        message: string;
        field?: string;
    };
}

/**
 * Standard API success response with optional pagination
 */
export interface ApiResponse<T> {
    data: T;
    meta?: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    hasMore: boolean;
}

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

/**
 * Sync queue item for offline operations
 */
export interface SyncQueueItem {
    id: string;
    entityType: 'grade' | 'attendance' | 'payment' | 'student';
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: Record<string, unknown>;
    timestamp: number;
    retryCount: number;
    status: 'PENDING' | 'SYNCING' | 'FAILED' | 'SYNCED';
    errorMessage?: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalPayments: number;
    attendanceRate: number;
    revenueThisMonth: number;
    pendingPayments: number;
    recentActivities: Activity[];
}

export interface Activity {
    id: string;
    type: 'payment' | 'enrollment' | 'grade' | 'attendance' | 'sms';
    description: string;
    timestamp: Date | string;
    userId: string;
    userName: string;
}
