import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { Eye, EyeOff, Phone, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.svg';

export default function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);
    const isLoading = useAuthStore((s) => s.isLoading);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(phone, password);
            toast.success('Connexion réussie !');
            navigate('/');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Erreur de connexion';
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-light flex items-center justify-center p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                }} />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo Card */}
                <div className="text-center mb-8">
                    <img src={logo} alt="EduGoma 360" className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" />
                    <h1 className="text-3xl font-extrabold text-white">EduGoma 360</h1>
                    <p className="text-white/70 text-sm mt-1">Système de Gestion Scolaire</p>
                    <p className="text-secondary-light text-xs mt-0.5">Goma, Nord-Kivu, RDC</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-bold text-neutral-900 mb-1">Connexion</h2>
                    <p className="text-sm text-neutral-500 mb-6">Entrez vos identifiants pour accéder au système</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="input-label">Numéro de téléphone</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+243990000001"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="input-label">Mot de passe</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-12 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <><Loader2 size={18} className="animate-spin" /> Connexion en cours...</>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>

                    {/* Forgot Pass Link */}
                    <p className="text-center mt-4 text-xs text-neutral-500">
                        Mot de passe oublié ? Contactez votre administrateur
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-white/50 text-xs mt-6">
                    © {new Date().getFullYear()} EduGoma 360 — v1.0.0
                </p>
            </div>
        </div>
    );
}
