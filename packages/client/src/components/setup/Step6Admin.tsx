import { useState } from 'react';
import { Eye, EyeOff, Info, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useSetupWizard } from '../../hooks/useSetupWizard';

export default function Step6Admin() {
    const { formData, updateFormData, validationErrors } = useSetupWizard();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const adminData = formData.admin || {
        nom: '',
        postNom: '',
        prenom: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    };

    const handleChange = (field: string, value: string) => {
        updateFormData('admin', {
            ...adminData,
            [field]: value,
        });
    };

    // Password strength calculator
    const getPasswordStrength = (password: string): {
        score: number;
        label: string;
        color: string;
    } => {
        if (!password) return { score: 0, label: '', color: '' };

        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score <= 2) return { score, label: 'Faible', color: 'text-red-600' };
        if (score <= 4) return { score, label: 'Moyen', color: 'text-orange-600' };
        return { score, label: 'Fort', color: 'text-green-600' };
    };

    const passwordStrength = getPasswordStrength(adminData.password);
    const passwordsMatch =
        adminData.password && adminData.confirmPassword
            ? adminData.password === adminData.confirmPassword
            : null;

    const errors = validationErrors.admin || {};

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Compte Administrateur Principal</p>
                    <p>
                        Ce compte aura le rôle de <strong>Préfet</strong> (directeur académique).
                        Vous pourrez créer d'autres comptes utilisateurs depuis les Paramètres.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-5">
                {/* Nom */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={adminData.nom}
                        onChange={(e) => handleChange('nom', e.target.value.toUpperCase())}
                        placeholder="MUKASA"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.nom ? 'border-red-500' : 'border-neutral-300'}`}
                        aria-required="true"
                        aria-invalid={!!errors.nom}
                    />
                    {errors.nom && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <XCircle size={14} />
                            {errors.nom[0]}
                        </p>
                    )}
                </div>

                {/* Post-nom */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Post-nom <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={adminData.postNom}
                        onChange={(e) => handleChange('postNom', e.target.value.toUpperCase())}
                        placeholder="KABILA"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.postNom ? 'border-red-500' : 'border-neutral-300'}`}
                        aria-required="true"
                        aria-invalid={!!errors.postNom}
                    />
                    {errors.postNom && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <XCircle size={14} />
                            {errors.postNom[0]}
                        </p>
                    )}
                </div>

                {/* Prénom */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Prénom
                    </label>
                    <input
                        type="text"
                        value={adminData.prenom}
                        onChange={(e) => handleChange('prenom', e.target.value)}
                        placeholder="Joseph"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                   focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                   transition-colors"
                    />
                </div>

                {/* Téléphone */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Numéro de téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={adminData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+243 810 000 001"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.phone ? 'border-red-500' : 'border-neutral-300'}`}
                        aria-required="true"
                        aria-invalid={!!errors.phone}
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                        Ce numéro servira pour l'authentification
                    </p>
                    {errors.phone && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <XCircle size={14} />
                            {errors.phone[0]}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Email
                    </label>
                    <input
                        type="email"
                        value={adminData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="prefet@institutgoma.cd"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.email ? 'border-red-500' : 'border-neutral-300'}`}
                        aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <XCircle size={14} />
                            {errors.email[0]}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={adminData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-4 py-2.5 pr-12 border rounded-lg focus:ring-2 
                                       focus:ring-primary/20 focus:border-primary transition-colors
                                       ${errors.password ? 'border-red-500' : 'border-neutral-300'}`}
                            aria-required="true"
                            aria-invalid={!!errors.password}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 
                                       hover:text-neutral-600 transition-colors"
                            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Password strength indicator */}
                    {adminData.password && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-neutral-600">Force du mot de passe</span>
                                <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${
                                        passwordStrength.score <= 2
                                            ? 'bg-red-500'
                                            : passwordStrength.score <= 4
                                            ? 'bg-orange-500'
                                            : 'bg-green-500'
                                    }`}
                                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-neutral-500 mt-1.5">
                        Minimum 8 caractères, au moins 1 majuscule et 1 chiffre
                    </p>
                    {errors.password && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <XCircle size={14} />
                            {errors.password[0]}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Confirmer le mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={adminData.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-4 py-2.5 pr-12 border rounded-lg focus:ring-2 
                                       focus:ring-primary/20 focus:border-primary transition-colors
                                       ${
                                           errors.confirmPassword || passwordsMatch === false
                                               ? 'border-red-500'
                                               : passwordsMatch === true
                                               ? 'border-green-500'
                                               : 'border-neutral-300'
                                       }`}
                            aria-required="true"
                            aria-invalid={!!errors.confirmPassword || passwordsMatch === false}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 
                                       hover:text-neutral-600 transition-colors"
                            aria-label={
                                showConfirmPassword
                                    ? 'Masquer le mot de passe'
                                    : 'Afficher le mot de passe'
                            }
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Match indicator */}
                    {adminData.confirmPassword && (
                        <div className="mt-1.5">
                            {passwordsMatch === true ? (
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle2 size={14} />
                                    Les mots de passe correspondent
                                </p>
                            ) : passwordsMatch === false ? (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    Les mots de passe ne correspondent pas
                                </p>
                            ) : null}
                        </div>
                    )}

                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <XCircle size={14} />
                            {errors.confirmPassword[0]}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
