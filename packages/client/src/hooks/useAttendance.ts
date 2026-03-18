/**
 * useAttendance — TanStack Query hook for daily roll call
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';
import type { RollCallPeriod, RollCallRecord } from '../lib/offline/attendanceQueue';
import {
    saveRollCallOffline,
    getPendingRollCalls,
    markRollCallSynced,
    markRollCallError,
} from '../lib/offline/attendanceQueue';
import { useSchoolStore } from '../stores/school.store';
import { useAuthStore } from '../stores/auth.store';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'RETARD';

export interface StudentForRoll {
    id: string;
    matricule: string;
    nom: string;
    postNom: string;
    prenom?: string;
    photoUrl?: string;
}

export interface StudentAttendanceEntry {
    studentId: string;
    student: StudentForRoll;
    status?: AttendanceStatus;
    remark?: string;
    arrivalTime?: string;
    isJustified: boolean;
}

export interface DailyAttendanceData {
    classId: string;
    className: string;
    date: string;
    period: string;
    students: StudentAttendanceEntry[];
    stats: { total: number; present: number; absent: number; late: number };
    isLocked: boolean;
}

export interface SaveAttendancePayload {
    classId: string;
    date: string;
    period: RollCallPeriod;
    records: RollCallRecord[];
}

// ── Hook: fetch daily attendance list ─────────────────────────────────────────

export function useDailyAttendance(classId: string, date: string, period: RollCallPeriod) {
    return useQuery<DailyAttendanceData>({
        queryKey: ['attendance-daily', classId, date, period],
        queryFn: async () => {
            const res = await api.get('/attendance/daily', {
                params: { classId, date, period },
            });
            // Normalise both { data: ... } and bare response
            const raw = res.data?.data ?? res.data;
            return raw as DailyAttendanceData;
        },
        enabled: !!classId,
        staleTime: 2 * 60 * 1000,
        retry: (failureCount) => {
            // Don't retry if offline
            if (!navigator.onLine) return false;
            return failureCount < 2;
        },
    });
}

// ── Hook: save roll call (online or offline) ──────────────────────────────────

export function useSaveAttendance() {
    const queryClient = useQueryClient();
    const { activeTermId } = useSchoolStore();
    const user = useAuthStore((s) => s.user);

    return useMutation({
        mutationFn: async (payload: SaveAttendancePayload) => {
            const isOnline = navigator.onLine;

            if (isOnline) {
                // Online — POST directly to API
                const res = await api.post('/attendance/daily', {
                    classId: payload.classId,
                    date: payload.date,
                    period: payload.period,
                    termId: activeTermId,
                    records: payload.records,
                });
                return res.data?.data ?? res.data;
            } else {
                // Offline — save to Dexie queue
                await saveRollCallOffline({
                    date: payload.date,
                    classId: payload.classId,
                    termId: activeTermId ?? '',
                    period: payload.period,
                    records: payload.records,
                    recordedById: user?.id ?? '',
                    createdAt: new Date().toISOString(),
                });
                return { offline: true };
            }
        },
        onSuccess: (data) => {
            if (data?.offline) {
                toast.success('Appel sauvegardé hors ligne · Sync automatique au retour connexion', {
                    icon: '🟠',
                    duration: 4000,
                });
            } else {
                const { present = 0, absent = 0, late = 0 } = data?.stats ?? {};
                toast.success(
                    `✓ Appel enregistré (${present} présents, ${absent} absents, ${late} retards)`,
                    { duration: 5000 }
                );
            }
            queryClient.invalidateQueries({ queryKey: ['attendance-daily'] });
        },
        onError: () => {
            toast.error("Erreur lors de l'enregistrement de l'appel");
        },
    });
}

// ── Utility: sync pending roll calls when back online ─────────────────────────

export async function syncPendingRollCalls(): Promise<number> {
    const pending = await getPendingRollCalls();
    let synced = 0;

    for (const { id, payload } of pending) {
        try {
            await api.post('/attendance/daily', payload);
            await markRollCallSynced(id);
            synced++;
        } catch (err: any) {
            await markRollCallError(id, err?.message ?? 'Sync error');
        }
    }

    return synced;
}
