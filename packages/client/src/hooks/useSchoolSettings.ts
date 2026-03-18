import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface SchoolData {
    id: string;
    nomOfficiel: string;
    nomCourt: string;
    code: string;
    logoUrl?: string;
    logoThumbnailUrl?: string;
    logoIconUrl?: string;
    province: string;
    ville: string;
    commune: string;
    avenue: string;
    numero?: string;
    reference?: string;
    telephonePrincipal: string;
    telephoneSecondaire?: string;
    email: string;
    siteWeb?: string;
    type: 'OFFICIELLE' | 'PRIVEE' | 'CONVENTIONNEE';
    numeroAgrement: string;
    dateAgrement: string;
    devise?: string;
    langueEnseignement: 'FRANCAIS' | 'ANGLAIS' | 'BILINGUE';
    systemeEvaluation: 'NOTE_20' | 'NOTE_10' | 'MIXTE';
    nombrePeriodes: 'TRIMESTRES' | 'SEMESTRES';
    createdAt: string;
    updatedAt: string;
}

export function useSchoolSettings() {
    const queryClient = useQueryClient();

    const query = useQuery<{ school: SchoolData }, { message: string, error: string }>({
        queryKey: ['school-settings'],
        queryFn: async () => {
            const res = await api.get('/settings/school');
            return res.data;
        },
        retry: false, // Ne pas retry si 404 (première config)
    });

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await api.put('/settings/school', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['school-settings'], { school: data.school });
            if (data.logoUrls) {
                toast.success('Logo optimisé et enregistré (3 formats générés)', {
                    style: { background: '#0D47A1', color: '#fff' }
                });
            }
            toast.success('Informations de l\'école enregistrées avec succès', {
                style: { background: '#1B5E20', color: '#fff' },
                icon: '✓'
            });
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || "Erreur lors de l'enregistrement";
            toast.error(`Erreur : ${msg}`, { style: { background: '#C62828', color: '#fff' } });
            
            if (err.response?.data?.error === 'VALIDATION_ERROR') {
                const details = err.response.data.details;
                details.forEach((d: any) => {
                    toast.error(`${d.field}: ${d.message}`);
                });
            }
        }
    });

    return {
        school: query.data?.school,
        isLoading: query.isLoading,
        error: query.error,
        updateSchool: mutation.mutateAsync,
        isUpdating: mutation.isPending
    };
}

