import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useOfflineStore } from '../../stores/offline.store';
import { checkServerHealth } from '../../lib/api';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Loader2,
    WifiOff,
    Wifi,
    AlertTriangle,
    Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.svg';

// ── Zod validation schema ────────────────────────────────────────────────────
const loginSchema = z.object({
    identifier: z.string().min(4, 'Minimum 4 caractères'),
    password: z.string().min(6, 'Minimum 6 caractères'),
    rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ── Regex patterns for identifier detection ──────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MATRICULE_REGEX = /^[A-Z]{2}-[A-Z]{3}-[A-Z0-9]+-\d+$/i;

/**
 * Detect identifier type for visual hint
 */
function getIdentifierType(value: string): 'email' | 'matricule' | 'phone' {
    if (EMAIL_REGEX.test(value)) return 'email';
    if (MATRICULE_REGEX.test(value)) return 'matricule';
    return 'phone';
}

// ── Constants ────────────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE COMPONENT (SCR-001)
// ══════════════════════════════════════════════════════════════════════════════
export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const identifierInputRef = useRef<HTMLInputElement>(null);

    // ── Auth ─────────────────────────────────────────────────────────────
    const {
        login,
        isLoading,
        isAuthenticated,
        user,
        loginAttempts,
        lockedUntil,
        incrementAttempts,
        resetAttempts,
        loginOffline,
        getDefaultRedirect,
        setLockedUntil,
    } = useAuth();

    // ── Offline state ────────────────────────────────────────────────────
    const isOnline = useOfflineStore((s) => s.isOnline);

    // ── Local UI state ───────────────────────────────────────────────────
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [lockCountdown, setLockCountdown] = useState('');
    const [serverReachable, setServerReachable] = useState(true);
    const [checkingServer, setCheckingServer] = useState(true);

    // ── Form setup with react-hook-form + zod ────────────────────────────
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
        defaultValues: {
            identifier: '',
            password: '',
            rememberMe: false,
        },
    });

    const identifierValue = watch('identifier');
    const passwordValue = watch('password');
    const identifierType = getIdentifierType(identifierValue || '');

    // ── Redirect if already authenticated ────────────────────────────────
    useEffect(() => {
        if (isAuthenticated && user) {
            const redirect = searchParams.get('redirect');
            navigate(redirect || getDefaultRedirect(user.role), { replace: true });
        }
    }, [isAuthenticated, user, navigate, searchParams, getDefaultRedirect]);

    // ── Server health check on mount ─────────────────────────────────────
    useEffect(() => {
        let mounted = true;
        async function check() {
            setCheckingServer(true);
            const reachable = await checkServerHealth();
            if (mounted) {
                setServerReachable(reachable);
                setCheckingServer(false);
            }
        }
        check();
        // Re-check every 30 seconds
        const interval = setInterval(check, 30000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    // ── Lockout countdown timer ──────────────────────────────────────────
    useEffect(() => {
        if (!lockedUntil) {
            setLockCountdown('');
            return;
        }

        const updateCountdown = () => {
            const remaining = lockedUntil.getTime() - Date.now();
            if (remaining <= 0) {
                resetAttempts();
                setErrorMessage(null);
                setLockCountdown('');
                return;
            }
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            setLockCountdown(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [lockedUntil, resetAttempts]);

    // ── Check if account is locked ───────────────────────────────────────
    const isLocked = lockedUntil !== null && lockedUntil.getTime() > Date.now();

    // ── Submit handler ───────────────────────────────────────────────────
    const onSubmit = useCallback(
        async (data: LoginFormData) => {
            if (isLocked) return;
            setErrorMessage(null);

            try {
                await login(data.identifier, data.password, data.rememberMe);
                resetAttempts();
                toast.success('Connexion réussie !');
                // Redirect will happen via the useEffect above
            } catch (err: any) {
                const status = err?.response?.status;
                const errorData = err?.response?.data?.error;

                if (status === 401) {
                    // Invalid credentials
                    incrementAttempts();
                    const newAttempts = loginAttempts + 1;

                    if (newAttempts >= MAX_ATTEMPTS) {
                        setErrorMessage('Compte temporairement bloqué. Réessayez dans 15 minutes.');
                    } else {
                        setErrorMessage(
                            `Email/matricule ou mot de passe incorrect. Tentative ${newAttempts}/${MAX_ATTEMPTS}`
                        );
                    }
                    // Auto-focus identifier field
                    identifierInputRef.current?.focus();
                } else if (status === 423) {
                    // Account locked by server
                    const unlockAt = errorData?.unlockAt ? new Date(errorData.unlockAt) : new Date(Date.now() + LOCKOUT_DURATION_MS);
                    setErrorMessage('Compte temporairement bloqué. Réessayez dans 15 minutes.');
                    // The lockout timer will be handled by the countdown effect
                    resetAttempts();
                    // Manually set lock from server response
                    setLockedUntil(unlockAt);
                    useOfflineStore.getState().setOnline(true); // ensure online status
                } else if (!err?.response) {
                    // Network error — server unreachable
                    setServerReachable(false);
                    toast.error('Serveur inaccessible. Vérifiez votre connexion.', {
                        icon: '🔌',
                        style: { background: '#F57C00', color: '#fff' },
                    });
                } else {
                    setErrorMessage(errorData?.message || 'Erreur inattendue. Veuillez réessayer.');
                }
            }
        },
        [isLocked, login, resetAttempts, incrementAttempts, loginAttempts],
    );

    // ── Continue offline handler ─────────────────────────────────────────
    const handleContinueOffline = useCallback(async () => {
        const success = await loginOffline();
        if (success) {
            toast.success('Mode hors-ligne activé', {
                icon: '📴',
                style: { background: '#F57C00', color: '#fff' },
            });
            navigate('/dashboard', { replace: true });
        } else {
            toast.error('Aucune session précédente trouvée. Connectez-vous en ligne d\'abord.');
        }
    }, [loginOffline, navigate]);

    // ── Render ───────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* ── Offline banner ─────────────────────────────────────── */}
                {!isOnline && (
                    <div
                        id="offline-banner"
                        className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm"
                    >
                        <AlertTriangle size={16} className="shrink-0" />
                        <span className="font-medium">⚠ Mode hors-ligne — Données locales utilisées</span>
                    </div>
                )}

                {/* ── Card ──────────────────────────────────────────────── */}
                <div className="bg-white shadow-lg rounded-2xl p-8">
                    {/* Logo & Header */}
                    <div className="text-center mb-6">
                        <img
                            src={logo}
                            alt="EduGoma 360"
                            className="h-16 mx-auto mb-4"
                            id="login-logo"
                        />
                        <h1 className="text-2xl font-extrabold text-neutral-900">
                            EduGoma 360
                        </h1>
                        <p className="text-neutral-500 text-sm mt-1">
                            Système de Gestion Scolaire — Goma, RDC
                        </p>
                    </div>

                    {/* ── Server status badge ───────────────────────────── */}
                    <div className="flex justify-center mb-6">
                        <div
                            id="server-status-badge"
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${checkingServer
                                ? 'bg-neutral-100 text-neutral-500'
                                : serverReachable && isOnline
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                        >
                            {checkingServer ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : serverReachable && isOnline ? (
                                <Wifi size={12} />
                            ) : (
                                <WifiOff size={12} />
                            )}
                            {checkingServer
                                ? 'Vérification...'
                                : serverReachable && isOnline
                                    ? 'Serveur connecté'
                                    : 'Serveur hors-ligne'}
                        </div>
                    </div>

                    {/* ── Error message ──────────────────────────────────── */}
                    {errorMessage && (
                        <div
                            id="login-error"
                            className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm flex items-start gap-2"
                        >
                            <Shield size={16} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">{errorMessage}</p>
                                {isLocked && lockCountdown && (
                                    <p className="text-red-500 mt-1 font-mono text-lg">
                                        ⏱ {lockCountdown}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Form ───────────────────────────────────────────── */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="login-form">
                        {/* Identifier field */}
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Email ou Matricule
                            </label>
                            <div className="relative">
                                <Mail
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                                />
                                <input
                                    id="identifier"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="admin@edugoma360.cd ou NK-GOM-XXX-0001"
                                    disabled={isLoading || isLocked}
                                    {...register('identifier')}
                                    ref={(e) => {
                                        register('identifier').ref(e);
                                        (identifierInputRef as any).current = e;
                                    }}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-all outline-none ${errors.identifier
                                        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                                        : 'border-neutral-300 focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                />
                                {/* Identifier type badge */}
                                {identifierValue && identifierValue.length >= 4 && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                                        {identifierType}
                                    </span>
                                )}
                            </div>
                            {errors.identifier && (
                                <p className="text-red-600 text-xs mt-1">{errors.identifier.message}</p>
                            )}
                        </div>

                        {/* Password field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                                />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    disabled={isLoading || isLocked}
                                    {...register('password')}
                                    className={`w-full pl-10 pr-12 py-2.5 border rounded-lg text-sm transition-all outline-none ${errors.password
                                        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                                        : 'border-neutral-300 focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember me + Forgot password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    {...register('rememberMe')}
                                    className="h-4 w-4 rounded border-neutral-300 text-[#1B5E20] focus:ring-[#1B5E20]/20"
                                />
                                <span className="text-sm text-neutral-600">Se souvenir de moi</span>
                            </label>
                            <a
                                href="/forgot-password"
                                className="text-sm text-[#0D47A1] hover:underline"
                                id="forgot-password-link"
                            >
                                Mot de passe ?
                            </a>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            id="login-button"
                            disabled={isLoading || isLocked || !identifierValue || !passwordValue}
                            className={`w-full h-11 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${isLoading || isLocked || !identifierValue || !passwordValue
                                ? 'bg-[#1B5E20]/70 cursor-not-allowed'
                                : 'bg-[#1B5E20] hover:bg-[#2E7D32] active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Connexion en cours...
                                </>
                            ) : (
                                'SE CONNECTER'
                            )}
                        </button>
                    </form>

                    {/* ── Offline link ───────────────────────────────────── */}
                    {(!isOnline || !serverReachable) && (
                        <div className="mt-5 text-center">
                            <p className="text-neutral-500 text-sm mb-1">Hors-ligne ?</p>
                            <button
                                type="button"
                                id="offline-continue-link"
                                onClick={handleContinueOffline}
                                className="text-amber-600 hover:text-amber-700 text-sm font-medium hover:underline transition-colors"
                            >
                                Continuer sans connexion →
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Footer ────────────────────────────────────────────── */}
                <p className="text-center text-neutral-400 text-xs mt-6" id="login-footer">
                    v1.0 — EduGoma360 © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
