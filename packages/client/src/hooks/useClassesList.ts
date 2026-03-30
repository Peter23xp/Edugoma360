import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

interface Class {
    id: string;
    name: string;
    sectionId: string;
    yearId: string;
    maxStudents: number;
    currentStudents: number;
}

/**
 * Hook pour récupérer la liste des classes
 * Gère automatiquement la structure de réponse variable de l'API
 */
export function useClassesList(sectionId?: string) {
    return useQuery({
        queryKey: sectionId ? ['classes-list', sectionId] : ['classes-list'],
        queryFn: async () => {
            const params = sectionId ? { sectionId } : undefined;
            const response = await api.get('/settings/classes', { params });
            
            // L'API peut retourner soit un tableau directement, soit { classes: [...] }
            const data = response.data;
            const classes: Class[] = Array.isArray(data) 
                ? data 
                : data?.classes || data?.data || [];
            
            return classes;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false, // Avoid closing dropdowns on refocus
    });
}
