import React from 'react';
import SchoolInfoForm from '../../components/settings/SchoolInfoForm';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SchoolInfoPage() {
    const { school, isLoading, error, updateSchool, isUpdating } = useSchoolSettings();
    const navigate = useNavigate();

    const handleSubmit = async (formData: FormData) => {
        try {
            await updateSchool(formData);
            // Redirection auto vers academic-year
            setTimeout(() => {
                navigate('/settings/academic-year');
            }, 1500);
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    // Le backend renverra une erreur avec SCHOOL_NOT_FOUND si vide (404 ou 200 avec message empty)
    // C'est géré par useSchoolSettings. S'il n'y a pas d'école, le form sera vide.

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Contenu principal */}
            <main className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Titre page */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">
                        Informations de l'école
                    </h1>
                    <p className="text-neutral-500">
                        Gérez l'identité et les paramètres principaux de votre établissement.
                    </p>
                </div>

                <SchoolInfoForm 
                    defaultValues={school || {}} 
                    onSubmit={handleSubmit}
                    isSubmitting={isUpdating}
                />
            </main>
        </div>
    );
}
