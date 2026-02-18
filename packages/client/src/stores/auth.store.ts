import { create } from 'zustand';
import api from '../lib/api';


// ── Types ────────────────────────────────────────────────────────────────────
export interface User {
    id: string;
    schoolId: string;
    schoolName: string;
    nom: string;
    postNom: string;
    prenom?: string;
    phone: string;
    email?: string | null;
    role: 'SUPER_ADMIN' | 'PREFET' | 'ECONOME' | 'SECRETAIRE' | 'ENSEIGNANT' | 'PARENT';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    loginAttempts: number;
    lockedUntil: Date | null;

    login: (identifier: string, password: string, rememberMe: boolean) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    incrementAttempts: () => void;
    resetAttempts: () => void;
    setLockedUntil: (date: Date | null) => void;
    loadOfflineUser: () => Promise<User | null>;
    loginOffline: () => Promise<boolean>;
}

// ── Dexie helper: persist last user for offline access ───────────────────────
async function persistUserOffline(user: User): Promise<void> {
    try {
        // Use a simple key-value approach: store in localStorage for offline user
        // (Dexie is for data; localStorage is fine for a single cached user object)
        localStorage.setItem('edugoma_last_user', JSON.stringify(user));
    } catch {
        // Silently fail if storage is not available
    }
}

function getOfflineUser(): User | null {
    try {
        const stored = localStorage.getItem('edugoma_last_user');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

// ── Zustand Store ────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    loginAttempts: 0,
    lockedUntil: null,

    login: async (identifier: string, password: string, rememberMe: boolean) => {
        set({ isLoading: true });
        try {
            const res = await api.post('/auth/login', { identifier, password, rememberMe });
            const { user, token } = res.data.data;
            // Persist user for offline access
            await persistUserOffline(user);
            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                loginAttempts: 0,
                lockedUntil: null,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: () => {
        api.post('/auth/logout').catch(() => { /* Ignore network errors on logout */ });
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            loginAttempts: 0,
            lockedUntil: null,
        });
    },

    refreshToken: async () => {
        try {
            const res = await api.post('/auth/refresh');
            const { token } = res.data.data;
            set({ token });
        } catch {
            get().logout();
        }
    },

    setUser: (user: User) => set({ user }),

    setToken: (token: string) => set({ token, isAuthenticated: true }),

    incrementAttempts: () => {
        const attempts = get().loginAttempts + 1;
        set({ loginAttempts: attempts });

        // Lock after 3 failed attempts for 15 minutes
        if (attempts >= 3) {
            const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
            set({ lockedUntil: lockUntil });
        }
    },

    resetAttempts: () => set({ loginAttempts: 0, lockedUntil: null }),

    setLockedUntil: (date: Date | null) => set({ lockedUntil: date }),

    loadOfflineUser: async () => {
        return getOfflineUser();
    },

    loginOffline: async () => {
        const offlineUser = getOfflineUser();
        if (offlineUser) {
            set({
                user: offlineUser,
                token: null,
                isAuthenticated: true,
            });
            return true;
        }
        return false;
    },
}));
