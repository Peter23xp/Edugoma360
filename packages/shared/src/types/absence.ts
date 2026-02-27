/**
 * EduGoma 360 — Shared Absence / Leave Types (SCR-020)
 */

export type TeacherLeaveType =
    | 'MALADIE'
    | 'PERSONNEL'
    | 'FORMATION'
    | 'MATERNITE'
    | 'DECES'
    | 'ANNUEL'
    | 'CIRCONSTANCE';

export type TeacherLeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

/** Types that count against the 20-day annual leave balance */
export const LEAVE_TYPES_THAT_COUNT: TeacherLeaveType[] = ['PERSONNEL', 'ANNUEL', 'CIRCONSTANCE'];

/** Maximum leave days per year */
export const MAX_LEAVE_DAYS_PER_YEAR = 20;

/** Maternity leave total duration (does NOT count in balance) */
export const MATERNITY_LEAVE_DAYS = 90;

/** Bereavement leave total duration (does NOT count in balance) */
export const BEREAVEMENT_LEAVE_DAYS = 3;

export interface TeacherLeaveRequest {
    id: string;
    schoolId: string;
    teacherId: string;
    teacher?: {
        id: string;
        nom: string;
        postNom: string;
        prenom?: string;
        matricule: string;
    };

    type: TeacherLeaveType;
    startDate: string | Date;
    endDate: string | Date;
    daysCount: number;
    reason: string;
    certificatUrl?: string;

    status: TeacherLeaveStatus;
    observations?: string;

    processedById?: string;
    processedBy?: { id: string; name: string };

    remplacantId?: string;

    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface LeaveBalance {
    total: number;     // Always 20
    pris: number;      // Days actually counted against balance
    restants: number;  // Remaining days
}

/**
 * Determines if a leave type should be deducted from the 20-day annual balance.
 * Business rules:
 * - FORMATION: NON (unlimited)
 * - MATERNITE: NON (90 days, separate allowance)
 * - DECES: NON (3 days, compassionate)
 * - MALADIE with certificat: NON
 * - MALADIE without certificat: OUI
 * - PERSONNEL, ANNUEL, CIRCONSTANCE: OUI
 */
export function shouldDeductFromLeaveBalance(
    type: TeacherLeaveType,
    hasCertificat: boolean
): boolean {
    if (type === 'FORMATION') return false;
    if (type === 'MATERNITE') return false;
    if (type === 'DECES') return false;
    if (type === 'MALADIE' && hasCertificat) return false;
    return true;
}
