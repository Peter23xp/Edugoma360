import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { X, CreditCard, Shield, Loader2, ArrowRight, ArrowLeft, Phone, DollarSign, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface RenewModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlanSlug?: string;
}

interface Plan {
    id: string;
    name: string;
    slug: string;
    priceUSD: number;
    priceCDF: number;
    maxStudents: number;
    maxTeachers: number;
    maxSmsPerMonth: number;
    durationDays: number;
    features: string[];
}

export default function RenewModal({ isOpen, onClose, currentPlanSlug }: RenewModalProps) {
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [currency, setCurrency] = useState<'USD' | 'CDF'>('USD');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch the list of subscription plans from the public endpoint
    const { data: rawPlans, isLoading: isPlansLoading } = useQuery({
        queryKey: ['public-plans'],
        queryFn: async () => (await api.get('/public/plans')).data,
    });

    const plans: Plan[] = (rawPlans?.data || []).filter((p: Plan) => p.slug !== 'trial'); // Exclude trial from renewal list

    if (!isOpen) return null;

    // Normalizes phone input for DRC format (+243XXXXXXXXX)
    const handlePhoneChange = (val: string) => {
        // Strip everything except numbers and '+' sign
        const cleaned = val.replace(/[^\d+]/g, '');
        setPhone(cleaned);
    };

    // Form submission
    const handlePayment = async () => {
        if (!selectedPlan) return;

        // Clean and validate the phone number
        let formattedPhone = phone.trim();
        
        // Auto convert common user formats:
        if (formattedPhone.startsWith('0')) {
            formattedPhone = `+243${formattedPhone.slice(1)}`;
        } else if (formattedPhone.startsWith('243') && !formattedPhone.startsWith('+')) {
            formattedPhone = `+${formattedPhone}`;
        } else if (!formattedPhone.startsWith('+') && formattedPhone.length === 9) {
            formattedPhone = `+243${formattedPhone}`;
        }

        // Basic validation: must start with +243 and be followed by 9 digits
        const drcRegex = /^\+243[89]\d{8}$/;
        if (!drcRegex.test(formattedPhone)) {
            toast.error("Format invalide. Saisissez un numéro Vodacom, Orange ou Airtel (Ex: 0999123456 ou +243999123456)");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/billing/initiate', {
                planSlug: selectedPlan.slug,
                currency,
                phone: formattedPhone,
            });

            if (res.data?.success) {
                toast.success('Paiement initié ! Redirection vers la passerelle sécurisée...');
                // Redirect user to FlexPay or the callback mock url
                setTimeout(() => {
                    window.location.href = res.data.paymentUrl;
                }, 1000);
            } else {
                toast.error(res.data?.error?.message || 'Une erreur est survenue lors de la création du paiement.');
                setIsSubmitting(false);
            }
        } catch (error: any) {
            console.error('[BILLING ERROR]', error);
            toast.error(error.response?.data?.error?.message || 'Erreur réseau. Veuillez réessayer.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1E12]/50 p-4 backdrop-blur-sm">
            {/* Modal Dialog container */}
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all transform duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-neutral-900 text-lg">
                            Renouveler mon espace EduGoma 360
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Steps Navigator */}
                <div className="px-6 py-3 border-b border-neutral-100 bg-neutral-50/50 flex justify-center gap-4 text-xs font-semibold text-neutral-400">
                    <span className={step === 1 ? 'text-primary font-bold' : selectedPlan ? 'text-neutral-600' : ''}>
                        1. Choisir la formule
                    </span>
                    <span>/</span>
                    <span className={step === 2 ? 'text-primary font-bold' : ''}>
                        2. Paiement Mobile Money
                    </span>
                </div>

                {/* Body Content */}
                <div className="flex-grow p-6 overflow-y-auto min-h-[300px]">
                    {/* STEP 1: Plan Selector */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center max-w-lg mx-auto">
                                <h4 className="text-md font-bold text-neutral-800">Sélectionnez la formule adaptée à vos effectifs</h4>
                                <p className="text-xs text-neutral-500 mt-1">Vous pouvez à tout moment renouveler votre offre actuelle ou passer à un plan supérieur.</p>
                            </div>

                            {isPlansLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {plans.map((p) => {
                                        const isCurrent = p.slug === currentPlanSlug;
                                        const isSelected = selectedPlan?.id === p.id;
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => setSelectedPlan(p)}
                                                className={`border rounded-xl p-5 cursor-pointer flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                                                    isSelected 
                                                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary' 
                                                        : 'border-neutral-200 bg-white'
                                                }`}
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <h5 className="font-bold text-neutral-900 text-md">{p.name}</h5>
                                                        {isCurrent && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">
                                                                Actuel
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1">
                                                        <p className="text-2xl font-black text-neutral-900">
                                                            {p.priceUSD} USD
                                                        </p>
                                                        <p className="text-xs text-neutral-500">
                                                            (~ {p.priceCDF.toLocaleString('fr-FR')} CDF)
                                                        </p>
                                                    </div>

                                                    <ul className="text-xs text-neutral-600 space-y-2 border-t border-neutral-100 pt-3">
                                                        <li className="flex items-center gap-1.5 font-medium text-neutral-800">
                                                            <Zap className="h-3.5 w-3.5 text-primary" />
                                                            {p.maxStudents === -1 ? 'Élèves illimités' : `Jusqu'à ${p.maxStudents} élèves`}
                                                        </li>
                                                        <li className="flex items-center gap-1.5 text-neutral-600">
                                                            ✓ {p.maxTeachers === -1 ? 'Enseignants illimités' : `Jusqu'à ${p.maxTeachers} enseignants`}
                                                        </li>
                                                        <li className="flex items-center gap-1.5 text-neutral-600">
                                                            ✓ {p.maxSmsPerMonth} SMS / mois inclus
                                                        </li>
                                                    </ul>
                                                </div>

                                                <button
                                                    className={`w-full mt-5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                                                        isSelected 
                                                            ? 'bg-primary text-white border-primary' 
                                                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                                                    }`}
                                                >
                                                    {isSelected ? 'Sélectionné' : 'Choisir'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Mobile Money settings */}
                    {step === 2 && selectedPlan && (
                        <div className="max-w-md mx-auto space-y-6">
                            <div className="text-center">
                                <h4 className="text-md font-bold text-neutral-800">Validation de votre paiement</h4>
                                <p className="text-xs text-neutral-500 mt-1">Vous allez initier un paiement sécurisé pour la formule {selectedPlan.name}.</p>
                            </div>

                            {/* Recap block */}
                            <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500">Plan d'abonnement :</span>
                                    <span className="font-bold text-neutral-950">Formule {selectedPlan.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t border-neutral-200/40 pt-2">
                                    <span className="text-neutral-500">Durée :</span>
                                    <span className="font-semibold text-neutral-800">{selectedPlan.durationDays} jours</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-neutral-200/40 pt-2">
                                    <span className="text-neutral-500 text-sm">Montant dû :</span>
                                    <span className="text-lg font-black text-primary">
                                        {currency === 'USD' 
                                            ? `${selectedPlan.priceUSD} USD` 
                                            : `${selectedPlan.priceCDF.toLocaleString('fr-FR')} CDF`
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Input form */}
                            <div className="space-y-4">
                                {/* Currency selector */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-700">Devise de paiement :</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCurrency('USD')}
                                            className={`py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                                                currency === 'USD' 
                                                    ? 'bg-primary text-white border-primary shadow-sm' 
                                                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                                            }`}
                                        >
                                            <DollarSign className="h-3.5 w-3.5" />
                                            Payer en USD (${selectedPlan.priceUSD})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrency('CDF')}
                                            className={`py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                                                currency === 'CDF' 
                                                    ? 'bg-primary text-white border-primary shadow-sm' 
                                                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                                            }`}
                                        >
                                            <CreditCard className="h-3.5 w-3.5" />
                                            Payer en CDF ({selectedPlan.priceCDF.toLocaleString('fr-FR')} FC)
                                        </button>
                                    </div>
                                </div>

                                {/* Phone number */}
                                <div className="space-y-2">
                                    <label htmlFor="mm-phone" className="text-xs font-semibold text-neutral-700">
                                        Numéro Mobile Money (M-Pesa, Orange, Airtel) :
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <input
                                            id="mm-phone"
                                            type="text"
                                            value={phone}
                                            onChange={(e) => handlePhoneChange(e.target.value)}
                                            placeholder="Ex: 0999123456 ou +243812345678"
                                            disabled={isSubmitting}
                                            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-500">
                                        Entrez le numéro du compte qui sera débité. Vous recevrez une notification de validation push (USSD) sur votre téléphone.
                                    </p>
                                </div>

                                {/* Gateway redirection advice */}
                                <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-3 text-xs text-amber-800 space-y-1.5">
                                    <p className="font-semibold flex items-center gap-1.5">
                                        <Shield className="h-4 w-4 text-amber-700" />
                                        Redirection de paiement sécurisée FlexPay
                                    </p>
                                    <p>Vous allez être redirigé vers la page de paiement sécurisée de FlexPay RDC pour finaliser la transaction.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-between">
                    {step === 2 ? (
                        <button
                            onClick={() => setStep(1)}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Retour
                        </button>
                    ) : (
                        <div />
                    )}

                    {step === 1 ? (
                        <button
                            onClick={() => setStep(2)}
                            disabled={!selectedPlan}
                            className={`px-5 py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 ${
                                selectedPlan 
                                    ? 'bg-primary text-white hover:bg-primary-hover shadow-sm' 
                                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                            }`}
                        >
                            Étape suivante
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    ) : (
                        <button
                            onClick={handlePayment}
                            disabled={isSubmitting || !phone}
                            className={`px-5 py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 ${
                                !isSubmitting && phone 
                                    ? 'bg-primary text-white hover:bg-primary-hover shadow-sm' 
                                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Traitement en cours...
                                </>
                            ) : (
                                <>
                                    Payer maintenant
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
