import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { ROLE_LABELS } from '../hooks/useUsers';

export default function AccessDeniedPage() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center space-y-6">
                {/* Icon */}
                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center border-2 border-red-200 animate-pulse">
                    <ShieldX size={48} className="text-red-500" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-neutral-900">
                        Accès refusé
                    </h1>
                    <p className="text-neutral-500 text-base leading-relaxed">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                </div>

                {/* User info card */}
                {user && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 inline-flex items-center gap-3 mx-auto">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-sm">
                            {user.nom?.[0]}{user.postNom?.[0]}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-neutral-800">
                                {user.nom} {user.postNom}
                            </p>
                            <p className="text-xs text-neutral-500">
                                Rôle : <span className="font-medium text-primary">{ROLE_LABELS[user.role] || user.role}</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Help text */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left space-y-2">
                    <p className="text-sm font-semibold text-amber-800">
                        Pourquoi voyez-vous cette page ?
                    </p>
                    <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                        <li>Votre rôle ne vous autorise pas à accéder à cette fonctionnalité.</li>
                        <li>Contactez votre administrateur pour demander l'accès.</li>
                        <li>Certaines pages sont réservées aux administrateurs et préfets.</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={16} />
                        Retour
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                    >
                        <Home size={16} />
                        Tableau de bord
                    </button>
                </div>
            </div>
        </div>
    );
}
