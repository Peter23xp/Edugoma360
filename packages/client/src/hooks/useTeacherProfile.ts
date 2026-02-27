import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useTeacherProfile(teacherId: string | undefined) {
    const profileQuery = useQuery({
        queryKey: ['teacher-profile', teacherId],
        queryFn: async () => {
            if (!teacherId) return null;
            const { data } = await axios.get(`/api/teachers/${teacherId}`);
            return data.data;
        },
        enabled: !!teacherId,
    });

    const statsQuery = useQuery({
        queryKey: ['teacher-stats', teacherId],
        queryFn: async () => {
            if (!teacherId) return null;
            const { data } = await axios.get(`/api/teachers/${teacherId}/stats`);
            return data;
        },
        enabled: !!teacherId,
    });

    const timetableQuery = useQuery({
        queryKey: ['teacher-timetable', teacherId],
        queryFn: async () => {
            if (!teacherId) return null;
            const { data } = await axios.get(`/api/timetable`, {
                params: { teacherId }
            });
            return data;
        },
        enabled: !!teacherId,
    });

    return {
        profileQuery,
        statsQuery,
        timetableQuery,
    };
}
