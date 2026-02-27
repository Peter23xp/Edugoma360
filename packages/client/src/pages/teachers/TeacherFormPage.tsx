import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTeacherSchema } from '../../../../server/src/modules/teachers/teachers.validation';
import { useTeacherForm } from '../../hooks/useTeacherForm';
import { useTeachers } from '../../hooks/useTeachers';
import { Step1Identity } from '../../components/teachers/form/Step1Identity';
import { Step2Qualifications } from '../../components/teachers/form/Step2Qualifications';
import { Step3Assignments } from '../../components/teachers/form/Step3Assignments';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProgressBar from '../../components/setup/ProgressBar';

const STEPS = [
    { id: 1, title: 'Identité', component: Step1Identity },
    { id: 2, title: 'Qualifications', component: Step2Qualifications },
    { id: 3, title: 'Affectations', component: Step3Assignments },
];

// Only validate fields belonging to the current step, not all form fields.
// This way Step 2/3 required fields don't block Step 1 navigation.
const STEP_FIELDS: Record<number, string[]> = {
    1: ['nom', 'postNom', 'prenom', 'sexe', 'dateNaissance', 'lieuNaissance', 'nationalite', 'telephone', 'email', 'adresse'],
    2: ['niveauEtudes', 'domaineFormation', 'universite', 'anneeObtention', 'specialisations', 'matieres'],
    3: ['statut', 'dateEmbauche', 'typeContrat', 'fonction', 'affectations'],
};

export const TeacherFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [currentStep, setCurrentStep] = useState(1);
    const { useTeacherById } = useTeachers();
    const { data: existingTeacher, isLoading: isFetching } = useTeacherById(id);

    const form = useForm({
        resolver: zodResolver(createTeacherSchema),
        defaultValues: {
            nom: '',
            postNom: '',
            prenom: '',
            sexe: 'M',
            dateNaissance: '',
            lieuNaissance: '',
            nationalite: 'Congolaise',
            telephone: '',
            email: '',
            adresse: '',
            niveauEtudes: '',
            domaineFormation: '',
            universite: '',
            anneeObtention: new Date().getFullYear(),
            specialisations: '',
            matieres: [],
            certificats: [],
            statut: 'ACTIF',
            dateEmbauche: new Date().toISOString().split('T')[0],
            typeContrat: '',
            fonction: 'AUCUNE',
            affectations: []
        },
        mode: 'onChange'
    });

    const { createMutation, updateMutation, isLoading: isSubmitting } = useTeacherForm();

    useEffect(() => {
        if (existingTeacher) {
            // Map existing teacher to form structure
            form.reset({
                ...existingTeacher,
                dateNaissance: existingTeacher.dateNaissance?.split('T')[0],
                dateEmbauche: existingTeacher.dateEmbauche?.split('T')[0],
                matieres: existingTeacher.subjects?.map((s: any) => s.id) || [],
                affectations: existingTeacher.assignments?.map((a: any) => ({
                    matiereId: a.subjectId,
                    classeId: a.classId,
                    volumeHoraire: a.volumeHoraire
                })) || []
            });
        }
    }, [existingTeacher, form]);

    const onSubmit = async (data: any) => {
        if (isEdit) {
            updateMutation.mutate({ id: id!, data }, {
                onSuccess: () => {
                    toast.success('Enseignant modifié avec succès');
                    navigate(`/teachers/${id}`);
                },
                onError: (error: any) => toast.error(error.response?.data?.message || 'Erreur lors de la modification'),
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: (res) => {
                    toast.success('Enseignant ajouté avec succès');
                    setTimeout(() => navigate(`/teachers/${res.teacher.id}`), 2000);
                },
                onError: (error: any) => toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout'),
            });
        }
    };

    const handleNext = async () => {
        // Only validate the fields on the current step
        const fieldsToValidate = STEP_FIELDS[currentStep] as any[];
        const isValid = await form.trigger(fieldsToValidate);
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

    const handleSubmit = async () => {
        const isValid = await form.trigger();
        if (isValid) {
            form.handleSubmit(onSubmit)();
        } else {
            toast.error('Veuillez corriger les erreurs avant de soumettre');
        }
    };

    const CurrentStepComponent = STEPS[currentStep - 1].component;

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 size={32} className="text-primary animate-spin" />
                <span className="text-sm text-neutral-500 animate-pulse">Chargement des données...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate('/teachers')}
                        className="flex items-center gap-2 text-sm text-neutral-600 
                                   hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        Retour à la liste
                    </button>

                    <h1 className="text-2xl font-bold text-neutral-900 mb-6">
                        {isEdit ? 'Modifier l\'enseignant' : 'Ajouter un enseignant'}
                    </h1>

                    <ProgressBar
                        currentStep={currentStep}
                        steps={STEPS.map((s) => ({ id: s.id, label: s.title }))}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                <form className="bg-white rounded-xl border border-neutral-200 p-8">
                    <CurrentStepComponent form={form} />
                </form>
            </div>

            {/* Footer Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 
                            shadow-lg z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        type="button"
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
                            type="button"
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
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 
                                       text-white rounded-lg hover:bg-green-700 font-medium 
                                       text-sm transition-colors disabled:opacity-60 
                                       disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Check size={16} />
                                    {isEdit ? 'Enregistrer' : 'Finaliser & Enregistrer'}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

