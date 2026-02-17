import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
    id: string;
    schoolId: string;
    nom: string;
    postNom: string;
    prenom?: string;
    phone: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (phone: string, password: string) => Promise<void>;
    logout: () => void;
    fetchProfile: () => Promise<void>;
    setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (phone: string, password: string) => {
                set({ isLoading: true });
                try {
                    const res = await api.post('/auth/login', { phone, password });
                    const { user, token } = res.data;
                    set({ user, token, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                api.post('/auth/logout').catch(() => { });
                set({ user: null, token: null, isAuthenticated: false });
            },

            fetchProfile: async () => {
                try {
                    const res = await api.get('/auth/profile');
                    set({ user: res.data.user });
                } catch {
                    get().logout();
                }
            },

            setToken: (token: string) => {
                set({ token, isAuthenticated: true });
            },
        }),
        {
            name: 'edugoma-auth',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);
