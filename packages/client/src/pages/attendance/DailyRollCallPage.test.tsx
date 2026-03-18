/**
 * DailyRollCallPage — Tests unitaires
 *
 * Run: npx vitest packages/client/src/pages/attendance/DailyRollCallPage.test.tsx
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DailyRollCallPage from './DailyRollCallPage';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock API
vi.mock('../../lib/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

// Mock offline store
vi.mock('../../stores/offline.store', () => ({
    useOfflineStore: vi.fn(() => ({
        isOnline: true,
        pendingCount: 0,
        lastSyncAt: null,
        isSyncing: false,
        setPending: vi.fn(),
    })),
}));

// Mock school store
vi.mock('../../stores/school.store', () => ({
    useSchoolStore: vi.fn(() => ({ activeTermId: 'term-uuid-001' })),
}));

// Mock auth store
vi.mock('../../stores/auth.store', () => ({
    useAuthStore: vi.fn((selector: any) =>
        selector({ user: { id: 'user-001' }, token: 'tok', isAuthenticated: true })
    ),
}));

// Mock offline sync
vi.mock('../../lib/offline/sync', () => ({
    getPendingCount: vi.fn().mockResolvedValue(0),
}));

// Mock attendanceQueue
vi.mock('../../lib/offline/attendanceQueue', () => ({
    saveRollCallOffline: vi.fn().mockResolvedValue(undefined),
    getPendingRollCallCount: vi.fn().mockResolvedValue(0),
    getPendingRollCalls: vi.fn().mockResolvedValue([]),
    markRollCallSynced: vi.fn().mockResolvedValue(undefined),
    markRollCallError: vi.fn().mockResolvedValue(undefined),
}));

import api from '../../lib/api';
import { saveRollCallOffline } from '../../lib/offline/attendanceQueue';
import { useOfflineStore } from '../../stores/offline.store';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockClasses = [
    { id: 'class-001', name: '4ème Scientifique A', currentStudents: 32, maxStudents: 45 },
    { id: 'class-002', name: '5ème Littéraire B', currentStudents: 28, maxStudents: 45 },
];

function makeStudent(i: number) {
    return {
        id: `student-${i}`,
        matricule: `NK-GOM-ISS-${String(i).padStart(4, '0')}`,
        nom: `NOM${i}`,
        postNom: `POSTNOM${i}`,
        prenom: `Prénom${i}`,
        photoUrl: null,
    };
}

const mockStudents = Array.from({ length: 32 }, (_, i) => ({
    studentId: `student-${i + 1}`,
    student: makeStudent(i + 1),
    status: undefined,
    isJustified: false,
}));

const mockRollCallData = {
    classId: 'class-001',
    className: '4ème Scientifique A',
    date: '2026-02-26',
    period: 'MATIN',
    students: mockStudents,
    stats: { total: 32, present: 0, absent: 0, late: 0 },
    isLocked: false,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function createWrapper() {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={qc}>
                <MemoryRouter initialEntries={['/attendance/roll-call']}>
                    <Toaster />
                    {children}
                </MemoryRouter>
            </QueryClientProvider>
        );
    };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DailyRollCallPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (api.get as any).mockImplementation((url: string) => {
            if (url.includes('/settings/classes') || url.includes('/classes')) {
                return Promise.resolve({ data: mockClasses });
            }
            if (url.includes('/attendance/daily')) {
                return Promise.resolve({ data: { data: mockRollCallData } });
            }
            return Promise.reject(new Error(`Unknown URL: ${url}`));
        });
        (api.post as any).mockResolvedValue({
            data: {
                data: {
                    message: 'Appel enregistré avec succès',
                    stats: { present: 28, absent: 3, late: 1 },
                },
            },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // ── Test 1 ────────────────────────────────────────────────────────────────
    it('charge la liste des élèves après sélection de classe', async () => {
        const { getByRole } = render(<DailyRollCallPage />, { wrapper: createWrapper() });

        // Select a class
        const classSelect = getByRole('combobox', { name: /classe/i }) as HTMLSelectElement;
        fireEvent.change(classSelect, { target: { value: 'class-001' } });

        // Check API was called
        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(
                '/attendance/daily',
                expect.objectContaining({
                    params: expect.objectContaining({ classId: 'class-001' }),
                })
            );
        });

        // 32 student rows should appear
        await waitFor(() => {
            const rows = document.querySelectorAll('tr[id^="row-"]');
            expect(rows.length).toBe(32);
        });
    });

    // ── Test 2 ────────────────────────────────────────────────────────────────
    it('marque un élève présent et met à jour les stats', async () => {
        render(<DailyRollCallPage />, { wrapper: createWrapper() });

        // Select class to load students
        const classSelect = document.getElementById('classSelector') as HTMLSelectElement;
        fireEvent.change(classSelect, { target: { value: 'class-001' } });

        await waitFor(() => {
            expect(document.querySelector('[id^="row-"]')).not.toBeNull();
        });

        // Click "P" button for first student
        const firstPresentBtn = document.getElementById('btn-present-student-1');
        expect(firstPresentBtn).not.toBeNull();
        fireEvent.click(firstPresentBtn!);

        // Button should become active (green)
        await waitFor(() => {
            expect(firstPresentBtn!.className).toContain('bg-green-600');
        });

        // Stats card should update
        await waitFor(() => {
            const presentCard = screen.getByText('1', { exact: false });
            expect(presentCard).toBeTruthy();
        });
    });

    // ── Test 3 ────────────────────────────────────────────────────────────────
    it('active le bouton Enregistrer uniquement si des changements existent', async () => {
        render(<DailyRollCallPage />, { wrapper: createWrapper() });

        const classSelect = document.getElementById('classSelector') as HTMLSelectElement;
        fireEvent.change(classSelect, { target: { value: 'class-001' } });

        await waitFor(() => {
            expect(document.querySelector('[id^="row-"]')).not.toBeNull();
        });

        const saveBtn = document.getElementById('btn-save') as HTMLButtonElement;
        // Initially disabled
        expect(saveBtn.disabled).toBe(true);

        // Mark one student
        const firstPresentBtn = document.getElementById('btn-present-student-1');
        fireEvent.click(firstPresentBtn!);

        // Now enabled
        await waitFor(() => {
            expect(saveBtn.disabled).toBe(false);
        });
    });

    // ── Test 4 ────────────────────────────────────────────────────────────────
    it('fonctionne en mode offline et sauvegarde dans la queue', async () => {
        // Override offline store
        (useOfflineStore as any).mockReturnValue({
            isOnline: false,
            pendingCount: 0,
            lastSyncAt: null,
            isSyncing: false,
            setPending: vi.fn(),
        });

        // Also make navigator.onLine = false
        Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

        render(<DailyRollCallPage />, { wrapper: createWrapper() });

        const classSelect = document.getElementById('classSelector') as HTMLSelectElement;
        fireEvent.change(classSelect, { target: { value: 'class-001' } });

        await waitFor(() => {
            expect(document.querySelector('[id^="row-"]')).not.toBeNull();
        });

        // Mark all present
        const markAllBtn = document.getElementById('btn-mark-all-present');
        fireEvent.click(markAllBtn!);

        // Click save
        const saveBtn = document.getElementById('btn-save') as HTMLButtonElement;
        await waitFor(() => { expect(saveBtn.disabled).toBe(false); });

        fireEvent.click(saveBtn);

        // Unset confirmation modal → confirm mark as absent
        await waitFor(() => {
            // Should call saveRollCallOffline since navigator.onLine is false
            expect(saveRollCallOffline).toHaveBeenCalled();
        });

        // Reset
        Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    });

    // ── Test 5 ────────────────────────────────────────────────────────────────
    it('synchronise les appels en attente au retour de connexion', async () => {
        const { getPendingRollCalls, markRollCallSynced } = await import('../../lib/offline/attendanceQueue');

        // Simulate 2 pending items
        (getPendingRollCalls as any).mockResolvedValue([
            {
                id: 1,
                payload: {
                    classId: 'class-001', date: '2026-02-25', period: 'MATIN',
                    termId: 'term-001', records: [], recordedById: 'user-001', createdAt: '',
                },
            },
            {
                id: 2,
                payload: {
                    classId: 'class-001', date: '2026-02-24', period: 'APRES_MIDI',
                    termId: 'term-001', records: [], recordedById: 'user-001', createdAt: '',
                },
            },
        ]);

        // Import sync utility and call directly
        const { syncPendingRollCalls } = await import('../../hooks/useAttendance');
        const synced = await syncPendingRollCalls();

        expect(api.post).toHaveBeenCalledTimes(2);
        expect(markRollCallSynced).toHaveBeenCalledTimes(2);
        expect(synced).toBe(2);
    });
});
