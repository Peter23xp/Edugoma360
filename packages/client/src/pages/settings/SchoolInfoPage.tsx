import { useState } from 'react';
import SchoolInfoForm from '../../components/settings/SchoolInfoForm';
import SchoolInfoDisplay from '../../components/settings/SchoolInfoDisplay';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SchoolInfoPage() {
    const { school, isLoading, error: _error, updateSchool, isUpdating } = useSchoolSettings();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        try {
            await updateSchool(formData);
            setIsEditMode(false); // Retour en mode lecture après sauvegarde
            // Redirection auto vers academic-year seulement si c'est la première configuration
            if (!school) {
                setTimeout(() => {
                    navigate('/settings/academic-year');
                }, 1500);
            }
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

    // Si l'école existe (même partiellement) et qu'on n'est pas en mode édition
    const schoolConfigured = school && (school.nomOfficiel || (school as any).name);
    const shouldShowDisplay = schoolConfigured && !isEditMode;

    return (
        <div className="min-h-screen bg-background pb-12 w-full overflow-hidden">
            {/* Contenu principal */}
            <main className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
                {/* Titre page */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-3xl font-bold text-primary mb-2">
                        Informations de l'école
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-500">
                        {shouldShowDisplay 
                            ? "Consultez l'identité et les paramètres de votre établissement."
                            : "Gérez l'identité et les paramètres principaux de votre établissement."
                        }
                    </p>
                </div>

                {shouldShowDisplay ? (
                    <SchoolInfoDisplay 
                        school={school} 
                        onEdit={() => setIsEditMode(true)}
                    />
                ) : (
                    <SchoolInfoForm 
                        defaultValues={school ? {
                            ...school,
                            // Migrate old fields to new ones
                            nomOfficiel: school.nomOfficiel || (school as any).name || '',
                            nomCourt: school.nomCourt || (school as any).name || '',
                            telephonePrincipal: school.telephonePrincipal || (school as any).telephone || '',
                            commune: school.commune || (school as any).commune || '',
                            avenue: school.avenue || (school as any).adresse || '',
                            type: ((school.type as string) === 'PRIVE' ? 'PRIVEE' : school.type) as any,
                        } : {}} 
                        onSubmit={handleSubmit}
                        isSubmitting={isUpdating}
                        onCancel={schoolConfigured ? () => setIsEditMode(false) : undefined}
                    />
                )}
            </main>
        </div>
    );
}
