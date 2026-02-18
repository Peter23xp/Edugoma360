import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useStudentForm } from '../../hooks/useStudentForm';
import ProgressBar from '../../components/setup/ProgressBar';
import Step1Identity from '../../components/students/form/Step1Identity';
import Step2Academic from '../../components/students/form/Step2Academic';
import Step3Contacts from '../../components/students/form/Step3Contacts';
import Step4Confirm from '../../components/students/form/Step4Confirm';

const STEPS = [
    { id: 1, title: 'Identité', component: Step1Identity },
    { id: 2, title: 'Scolarité', component: Step2Academic },
    { id: 3, title: 'Contacts', component: Step3Contacts },
    { id: 4, title: 'Confirmation', component: Step4Confirm },
];

export default function StudentFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = !!id;

    const [currentStep, setCurrentStep] = useState(1);
    const { formData, validateStep, resetForm } = useStudentForm();

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const payload = new FormData();
            
            // Add all form fields
            Object.entries(data).forEach(([key, value]) => {
                if (key === 'photoFile' && value instanceof File) {
                    payload.append('photo', value);
                } else if (key !== 'photoPreview' && value !== undefined && value !== null) {
                    payload.append(key, String(value));
                }
            });

            if (isEdit) {
                return api.put(`/students/${id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            return api.post('/students', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast.success(
                isEdit ? 'Élève modifié avec succès' : 'Élève inscrit avec succès',
                { duration: 4000 }
            );
            resetForm();
            navigate('/students');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Erreur lors de l\'enregistrement';
            toast.error(message);
        },
    });

    const handleNext = () => {
        const isValid = validateStep(currentStep);
        if (isValid) {
            if (currentStep < STEPS.length) {
                setCurrentStep(currentStep + 1);
            }
        } else {
            toast.error('Veuillez corriger les erreurs avant de continuer');
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        const isValid = validateStep(currentStep);
        if (isValid) {
            submitMutation.mutate(formData);
        } else {
            toast.error('Veuillez corriger les erreurs avant de soumettre');
        }
    };

    const CurrentStepComponent = STEPS[currentStep - 1].component;

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate('/students')}
                        className="flex items-center gap-2 text-sm text-neutral-600 
                                   hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        Retour à la liste
                    </button>

                    <h1 className="text-2xl font-bold text-neutral-900 mb-6">
                        {isEdit ? 'Modifier l\'élève' : 'Nouvelle inscription'}
                    </h1>

                    {/* Progress Bar */}
                    <ProgressBar
                        currentStep={currentStep}
                        totalSteps={STEPS.length}
                        steps={STEPS.map((s) => s.title)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="bg-white rounded-xl border border-neutral-200 p-8">
                    <CurrentStepComponent />
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 
                            shadow-lg z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                                   text-neutral-700 hover:text-neutral-900 disabled:opacity-40 
                                   disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Précédent
                    </button>

                    <div className="text-sm text-neutral-600">
                        Étape {currentStep} sur {STEPS.length}
                    </div>

                    {currentStep < STEPS.length ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary 
                                       text-white rounded-lg hover:bg-primary-dark font-medium 
                                       text-sm transition-colors"
                        >
                            Suivant
                            <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitMutation.isPending}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 
                                       text-white rounded-lg hover:bg-green-700 font-medium 
                                       text-sm transition-colors disabled:opacity-60 
                                       disabled:cursor-not-allowed"
                        >
                            {submitMutation.isPending ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    {isEdit ? 'Enregistrer' : 'Inscrire l\'élève'}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
