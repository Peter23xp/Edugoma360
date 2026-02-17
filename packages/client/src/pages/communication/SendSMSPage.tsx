import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function SendSMSPage() {
    const [mode, setMode] = useState<'single' | 'bulk'>('single');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [template, setTemplate] = useState('');
    const [language, setLanguage] = useState<'fr' | 'sw'>('fr');

    const sendMutation = useMutation({
        mutationFn: async () => {
            if (mode === 'single') {
                return (await api.post('/sms/send', { to: phone, message })).data;
            }
            return (await api.post('/sms/bulk', { template, language })).data;
        },
        onSuccess: (data) => {
            toast.success(mode === 'single' ? 'SMS envoyé' : `${data.sent} SMS envoyé(s)`);
            setPhone(''); setMessage('');
        },
        onError: () => toast.error("Erreur d'envoi"),
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><MessageSquare size={22} /> Envoyer un SMS</h1>

            {/* Mode Toggle */}
            <div className="bg-white rounded-xl border border-neutral-300/50 p-1 flex">
                <button onClick={() => setMode('single')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'single' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>Individuel</button>
                <button onClick={() => setMode('bulk')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'bulk' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>Envoi groupé</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); sendMutation.mutate(); }} className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-4">
                {mode === 'single' ? (
                    <>
                        <div><label className="input-label">Numéro de téléphone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243..." required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Message</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={160} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm resize-none" /><p className="text-xs text-neutral-400 mt-1">{message.length}/160 caractères</p></div>
                    </>
                ) : (
                    <>
                        <div><label className="input-label">Template</label><select value={template} onChange={(e) => setTemplate(e.target.value)} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"><option value="">Sélectionner...</option><option value="payment_reminder">Rappel de paiement</option><option value="absence_notice">Notification d'absence</option><option value="convocation">Convocation</option><option value="results">Résultats disponibles</option></select></div>
                        <div><label className="input-label">Langue</label><select value={language} onChange={(e) => setLanguage(e.target.value as 'fr' | 'sw')} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"><option value="fr">Français</option><option value="sw">Swahili</option></select></div>
                    </>
                )}

                <button type="submit" disabled={sendMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium text-sm disabled:opacity-50">
                    {sendMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Envoyer
                </button>
            </form>
        </div>
    );
}
