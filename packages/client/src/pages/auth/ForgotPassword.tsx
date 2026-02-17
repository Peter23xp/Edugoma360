import { Link } from 'react-router-dom';
import { Phone, ArrowLeft } from 'lucide-react';
import logo from '../../assets/logo.svg';

export default function ForgotPassword() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-light flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img src={logo} alt="EduGoma 360" className="w-16 h-16 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-white">Mot de passe oublié</h1>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Phone size={24} className="text-secondary" />
                        </div>
                        <h2 className="text-lg font-semibold text-neutral-900">Contactez l'administration</h2>
                        <p className="text-sm text-neutral-500 mt-2">
                            Pour réinitialiser votre mot de passe, contactez le Préfet des Études ou le
                            Super Administrateur de votre école.
                        </p>
                    </div>

                    <div className="bg-info-bg rounded-lg p-4 text-sm text-info">
                        <p className="font-medium mb-1">Procédure :</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>Appelez le numéro de l'administration de votre école</li>
                            <li>Demandez la réinitialisation de votre mot de passe</li>
                            <li>L'administrateur vous communiquera un nouveau mot de passe temporaire</li>
                            <li>Connectez-vous et changez votre mot de passe immédiatement</li>
                        </ol>
                    </div>

                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 mt-6 text-sm text-primary hover:text-primary-dark font-medium"
                    >
                        <ArrowLeft size={16} />
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}
