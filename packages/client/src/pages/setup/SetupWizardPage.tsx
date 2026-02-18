import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { useSetupWizard } from '../../hooks/useSetupWizard';
import ProgressBar from '../../components/setup/ProgressBar';
import Step1Identity from '../../components/setup/Step1Identity';
import Step2Location from '../../components/setup/Step2Location';
import Step3Contact from '../../components/setup/Step3Contact';
import Step4AcademicYear from '../../components/setup/Step4AcademicYear';
import Step5Classes from '../../components/setup/Step5Classes';
import Step6Admin from '../../components/setup/Step6Admin';
import SetupSummary from '../../components/setup/SetupSummary';
import {
    Step1Schema,
    Step2Schema,
    Step3Schema,
    Step4Schema,
    Step5Schema,
    Step6Schema,
} from '@edugoma360/shared';

const STEPS = [
    { id: 1, label: 'Identité' },
    { id: 2, label: 'Localisation' },
    { id: 3, label: 'Contact' },
    { id: 4, label: 'Année' },
    { id: 5, label: 'Classes' },
    { id: 6, label: 'Admin' },
];

export default function SetupWizardPage() {
    const navigate = useNavigate();
    const { user, updateSchool } = useAuthStore();
    const {
        currentStep,
        formData,
        validationErrors,
        nextStep,
        prevStep,
        goToStep,
        setValidationErrors,
        clearValidationErrors,
        reset,
        loadDraft,
        clearDraft,
    } = useSetupWizard();

    const [showSummary, setShowSummary] = useState(false);
    const [showDraftPrompt, setShowDraftPrompt] = useState(false);

    // Load draft on mount
    useEffect(() => {
        const hasDraft = loadDraft();
        if (hasDraft) {
            setShowDraftPrompt(true);
        }
    }, [loadDraft]);

    // Setup submission mutation
    const setupMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                school: {
                    ...formData.identity,
                    ...formData.location,
                    ...formData.contact,
                },
                academicYear: formData.academicYear,
                classes: formData.classes,
                admin: formData.admin,
            };

            // Handle logo file upload separately if present
            if (formData.identity?.logoFile) {
                const formDataUpload = new FormData();
                formDataUpload.append('logo', formData.identity.logoFile);
                formDataUpload.append('data', JSON.stringify(payload));

                const res = await api.post('/schools/setup', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                return res.data;
            }

            const res = await api.post('/schools/setup', payload);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success('✓ École configurée avec succès !');
            clearDraft();
            reset();

            // Update auth store
            if (data.school) {
                updateSchool(data.school);
            }

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        },
        onError: (error: any) => {
            const message =
                error.response?.data?.error?.message ||
                'Erreur lors de la configuration. Veuillez réessayer.';
            toast.error(message);
        },
    });

    // Validate current step
    const validateCurrentStep = (): boolean => {
        clearValidationErrors();

        try {
            switch (currentStep) {
                case 1:
                    Step1Schema.parse(formData.identity);
                    break;
                case 2:
                    Step2Schema.parse(formData.location);
                    break;
                case 3:
                    Step3Schema.parse(formData.contact);
                    break;
                case 4:
                    Step4Schema.parse(formData.academicYear);
                    break;
                case 5:
                    Step5Schema.parse({ sections: [], classes: formData.classes || [] });
                    break;
                case 6:
                    Step6Schema.parse(formData.admin);
                    break;
            }
            return true;
        } catch (error: any) {
            if (error.errors) {
                const errors: Record<string, string[]> = {};
                error.errors.forEach((err: any) => {
                    const field = err.path.join('.');
                    if (!errors[field]) errors[field] = [];
                    errors[field].push(err.message);
                });
                setValidationErrors(errors);
            }
            return false;
        }
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            if (currentStep === 6) {
                setShowSummary(true);
            } else {
                nextStep();
            }
        } else {
            toast.error('Veuillez corriger les erreurs avant de continuer');
        }
    };

    const handleBack = () => {
        if (showSummary) {
            setShowSummary(false);
        } else {
            prevStep();
        }
    };

    const handleSubmit = () => {
        setupMutation.mutate();
    };

    const handleRestoreDraft = () => {
        setShowDraftPrompt(false);
        toast.success('Brouillon restauré');
    };

    const handleDiscardDraft = () => {
        clearDraft();
        reset();
        setShowDraftPrompt(false);
    };

    // Render current step component
    const renderStep = () => {
        if (showSummary) {
            return <SetupSummary />;
        }

        switch (currentStep) {
            case 1:
                return <Step1Identity />;
            case 2:
                return <Step2Location />;
            case 3:
                return <Step3Contact />;
            case 4:
                return <Step4AcademicYear />;
            case 5:
                return <Step5Classes />;
            case 6:
                return <Step6Admin />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
            {/* Draft Restore Prompt */}
            {showDraftPrompt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">
                            Brouillon trouvé
                        </h3>
                        <p className="text-sm text-neutral-600 mb-6">
                            Vous avez un brouillon de configuration en cours. Voulez-vous le
                            restaurer ?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDiscardDraft}
                                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg 
                                           hover:bg-neutral-50 transition-colors text-sm font-medium"
                            >
                                Recommencer
                            </button>
                            <button
                                onClick={handleRestoreDraft}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg 
                                           hover:bg-primary-dark transition-colors text-sm font-medium"
                            >
                                Restaurer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-neutral-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-neutral-900">
                                Configuration de votre école
                            </h1>
                            <p className="text-xs text-neutral-500">
                                {showSummary ? 'Récapitulatif' : `Étape ${currentStep}/6`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {!showSummary && (
                <div className="bg-white border-b border-neutral-200 px-6 py-6">
                    <div className="max-w-5xl mx-auto">
                        <ProgressBar currentStep={currentStep} steps={STEPS} />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="px-6 py-8">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8">
                        {renderStep()}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1 && !showSummary}
                        className="flex items-center gap-2 px-5 py-2.5 border border-neutral-300 
                                   rounded-lg hover:bg-neutral-50 transition-colors text-sm 
                                   font-medium disabled:opacity-0 disabled:pointer-events-none"
                        accessKey="p"
                    >
                        <ArrowLeft size={16} />
                        Précédent
                    </button>

                    {showSummary ? (
                        <button
                            onClick={handleSubmit}
                            disabled={setupMutation.isPending}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 
                                       text-white rounded-lg hover:bg-green-700 transition-colors 
                                       text-sm font-medium disabled:opacity-50 shadow-lg 
                                       shadow-green-600/20"
                        >
                            {setupMutation.isPending ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Configuration en cours...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    Terminer la configuration
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white 
                                       rounded-lg hover:bg-primary-dark transition-colors text-sm 
                                       font-medium shadow-lg shadow-primary/20"
                            accessKey="n"
                        >
                            Suivant
                            <ArrowRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
