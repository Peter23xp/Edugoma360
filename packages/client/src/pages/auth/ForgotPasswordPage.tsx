import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import OtpInput from '@/components/shared/OtpInput';
import { Eye, EyeOff, Phone, Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react';

type Step = 'phone' | 'otp' | 'password' | 'success';

interface ForgotPasswordState {
  step: Step;
  phone: string;
  otpValue: string[];
  resetToken: string;
  isLoading: boolean;
  error: string | null;
  resendCountdown: number;
  otpCountdown: number;
  maskedPhone: string;
  newPassword: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

const PHONE_REGEX = /^\+243(81|82|97|98|89)\d{7}$/;
const OTP_DURATION = 600; // 10 minutes
const RESEND_COOLDOWN = 60; // 60 secondes

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ForgotPasswordState>({
    step: 'phone',
    phone: '',
    otpValue: ['', '', '', '', '', ''],
    resetToken: '',
    isLoading: false,
    error: null,
    resendCountdown: 0,
    otpCountdown: 0,
    maskedPhone: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
  });

  // Compte à rebours OTP
  useEffect(() => {
    if (state.otpCountdown > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, otpCountdown: prev.otpCountdown - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.otpCountdown]);

  // Compte à rebours renvoyer
  useEffect(() => {
    if (state.resendCountdown > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, resendCountdown: prev.resendCountdown - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.resendCountdown]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCountdownColor = (seconds: number): string => {
    if (seconds > 180) return 'text-green-600';
    if (seconds > 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculatePasswordStrength = (password: string): { level: number; label: string; color: string } => {
    if (password.length < 8) {
      return { level: 1, label: 'Faible', color: 'bg-red-500' };
    }
    
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length >= 10 && hasUpper && hasNumber && hasSpecial) {
      return { level: 4, label: 'Fort', color: 'bg-green-500' };
    }
    
    if (password.length >= 8 && (hasUpper || hasNumber)) {
      return { level: 3, label: 'Moyen', color: 'bg-orange-500' };
    }
    
    return { level: 2, label: 'Faible', color: 'bg-red-500' };
  };

  const handleSendOtp = async () => {
    setState((prev) => ({ ...prev, error: null, isLoading: true }));

    const fullPhone = `+243${state.phone}`;
    
    if (!PHONE_REGEX.test(fullPhone)) {
      setState((prev) => ({ 
        ...prev, 
        error: 'Numéro de téléphone invalide. Format attendu : 81XXXXXXX, 82XXXXXXX, 97XXXXXXX, 98XXXXXXX ou 89XXXXXXX',
        isLoading: false 
      }));
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erreur lors de l\'envoi du code');
      }

      setState((prev) => ({
        ...prev,
        step: 'otp',
        maskedPhone: data.maskedPhone,
        otpCountdown: OTP_DURATION,
        resendCountdown: RESEND_COOLDOWN,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({ 
        ...prev, 
        error: error.message,
        isLoading: false 
      }));
    }
  };

  const handleResendOtp = async () => {
    if (state.resendCountdown > 0) return;
    
    setState((prev) => ({ ...prev, error: null, isLoading: true }));

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+243${state.phone}` }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erreur lors du renvoi du code');
      }

      setState((prev) => ({
        ...prev,
        otpValue: ['', '', '', '', '', ''],
        otpCountdown: OTP_DURATION,
        resendCountdown: RESEND_COOLDOWN,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({ 
        ...prev, 
        error: error.message,
        isLoading: false 
      }));
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = state.otpValue.join('');
    
    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      setState((prev) => ({ ...prev, error: 'Le code doit contenir 6 chiffres' }));
      return;
    }

    setState((prev) => ({ ...prev, error: null, isLoading: true }));

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: `+243${state.phone}`,
          otp: otpCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Code incorrect');
      }

      setState((prev) => ({
        ...prev,
        step: 'password',
        resetToken: data.resetToken,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({ 
        ...prev, 
        error: error.message,
        isLoading: false 
      }));
    }
  };

  const handleResetPassword = async () => {
    setState((prev) => ({ ...prev, error: null }));

    if (state.newPassword.length < 8) {
      setState((prev) => ({ ...prev, error: 'Le mot de passe doit contenir au moins 8 caractères' }));
      return;
    }

    if (state.newPassword !== state.confirmPassword) {
      setState((prev) => ({ ...prev, error: 'Les mots de passe ne correspondent pas' }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resetToken: state.resetToken,
          newPassword: state.newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erreur lors de la réinitialisation');
      }

      setState((prev) => ({
        ...prev,
        step: 'success',
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({ 
        ...prev, 
        error: error.message,
        isLoading: false 
      }));
    }
  };

  const getProgressValue = (): number => {
    switch (state.step) {
      case 'phone': return 33;
      case 'otp': return 66;
      case 'password': return 100;
      case 'success': return 100;
      default: return 0;
    }
  };

  const getStepLabel = (): string => {
    switch (state.step) {
      case 'phone': return 'Étape 1 de 3';
      case 'otp': return 'Étape 2 de 3';
      case 'password': return 'Étape 3 de 3';
      case 'success': return 'Terminé';
      default: return '';
    }
  };

  const passwordStrength = calculatePasswordStrength(state.newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4">
          {state.step !== 'success' && (
            <>
              <div className="space-y-2">
                <Progress value={getProgressValue()} className="h-2" />
                <p className="text-sm text-gray-600 text-center">{getStepLabel()}</p>
              </div>
              <Separator />
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {state.error && (
            <Alert variant="destructive">
              <p className="text-sm">{state.error}</p>
            </Alert>
          )}

          {/* ÉTAPE 1 : Téléphone */}
          {state.step === 'phone' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Phone className="h-8 w-8 text-[#1B5E20]" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Réinitialisation du mot de passe</h2>
                <p className="text-gray-600">Entrez votre numéro de téléphone enregistré</p>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="font-medium text-gray-700">+243</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="81XXXXXXX"
                    value={state.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setState((prev) => ({ ...prev, phone: value }));
                    }}
                    className="flex-1"
                    maxLength={9}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Opérateurs acceptés : Airtel · Vodacom · Orange
                </p>
              </div>

              <Button 
                onClick={handleSendOtp}
                disabled={state.isLoading || state.phone.length !== 9}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32]"
              >
                {state.isLoading ? 'Envoi en cours...' : 'Envoyer le code SMS'}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-[#1B5E20] hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </Link>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : OTP */}
          {state.step === 'otp' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Mail className="h-8 w-8 text-[#1B5E20]" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Code envoyé au {state.maskedPhone}</h2>
                <p className="text-gray-600">Entrez le code à 6 chiffres reçu par SMS</p>
              </div>

              <OtpInput 
                value={state.otpValue}
                onChange={(value) => setState((prev) => ({ ...prev, otpValue: value }))}
              />

              <div className="text-center space-y-2">
                {state.otpCountdown > 0 ? (
                  <p className="text-sm">
                    Code valable : <span className={`font-bold ${getCountdownColor(state.otpCountdown)}`}>
                      {formatTime(state.otpCountdown)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-medium">Code expiré. Demandez un nouveau code.</p>
                )}

                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-600">Pas reçu ?</span>
                  <Button
                    variant="link"
                    onClick={handleResendOtp}
                    disabled={state.resendCountdown > 0 || state.isLoading}
                    className="text-[#1B5E20] p-0 h-auto"
                  >
                    {state.resendCountdown > 0 
                      ? `Renvoyer (${state.resendCountdown}s)` 
                      : 'Renvoyer le code'}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleVerifyOtp}
                disabled={state.isLoading || state.otpValue.join('').length !== 6 || state.otpCountdown === 0}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32]"
              >
                {state.isLoading ? 'Vérification...' : 'Vérifier le code'}
              </Button>
            </div>
          )}

          {/* ÉTAPE 3 : Nouveau mot de passe */}
          {state.step === 'password' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Lock className="h-8 w-8 text-[#1B5E20]" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Créez votre nouveau mot de passe</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                  <div className="relative">
                    <Input
                      type={state.showPassword ? 'text' : 'password'}
                      value={state.newPassword}
                      onChange={(e) => setState((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {state.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Input
                      type={state.showConfirmPassword ? 'text' : 'password'}
                      value={state.confirmPassword}
                      onChange={(e) => setState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {state.showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {state.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Force du mot de passe :</span>
                      <span className={`font-medium ${
                        passwordStrength.level === 4 ? 'text-green-600' :
                        passwordStrength.level === 3 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded ${
                            level <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleResetPassword}
                disabled={state.isLoading || !state.newPassword || !state.confirmPassword}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32]"
              >
                {state.isLoading ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
              </Button>
            </div>
          )}

          {/* ÉTAPE FINALE : Succès */}
          {state.step === 'success' && (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Mot de passe modifié avec succès !</h2>
                <p className="text-gray-600">
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
              </div>

              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32]"
              >
                Aller à la connexion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
