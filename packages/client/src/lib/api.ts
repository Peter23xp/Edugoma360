import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';

// ── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // Required for httpOnly cookies
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response interceptor: handle 401 + auto-refresh ─────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retrying, attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't retry the refresh endpoint itself or the login endpoint
            if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshResponse = await api.post('/auth/refresh');
                const { token } = refreshResponse.data.data;
                useAuthStore.getState().setToken(token);
                originalRequest.headers.Authorization = `Bearer ${token}`;
                processQueue(null, token);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as AxiosError, null);
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

// ── Online Check Utility ─────────────────────────────────────────────────────
export async function checkServerHealth(): Promise<boolean> {
    try {
        await api.get('/health', { timeout: 5000 });
        return true;
    } catch {
        return false;
    }
}

export default api;
