import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface SendSmsPayload {
    to: string;
    message: string;
    template?: string;
    language?: 'fr' | 'sw';
    variables?: Record<string, string>;
}

/**
 * Hook for SMS operations
 */
export function useSMS() {
    const sendSms = useMutation({
        mutationFn: async (payload: SendSmsPayload) => {
            const res = await api.post('/sms/send', payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success('SMS envoyé avec succès');
        },
        onError: () => {
            toast.error('Erreur lors de l\'envoi du SMS');
        },
    });

    const sendBulk = useMutation({
        mutationFn: async (payload: { template: string; classId?: string; language?: 'fr' | 'sw' }) => {
            const res = await api.post('/sms/bulk', payload);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(`${data.sent} SMS envoyé(s)`);
        },
        onError: () => {
            toast.error('Erreur lors de l\'envoi groupé');
        },
    });

    return { sendSms, sendBulk };
}
