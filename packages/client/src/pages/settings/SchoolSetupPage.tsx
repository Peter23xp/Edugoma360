import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cog, Save, Loader2, School } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function SchoolSetupPage() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        name: '', province: 'Nord-Kivu', ville: 'Goma', address: '', phone: '', email: '',
        code: '', type: 'TECHNIQUE', fraisInscription: 0, currency: 'FC', exchangeRate: 2500,
    });

    useQuery({
        queryKey: ['school-settings'],
        queryFn: async () => {
            const res = await api.get('/settings/school');
            setForm({ ...form, ...res.data });
            return res.data;
        },
    });

    const saveMutation = useMutation({
        mutationFn: async () => api.put('/settings/school', form),
        onSuccess: () => { toast.success('Paramètres sauvegardés'); queryClient.invalidateQueries({ queryKey: ['school-settings'] }); },
        onError: () => toast.error('Erreur de sauvegarde'),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><Cog size={22} /> Paramètres de l'école</h1>

            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-5">
                <div className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><School size={16} /> Identification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="input-label">Nom de l'école *</label><input name="name" value={form.name} onChange={handleChange} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Code MEPST</label><input name="code" value={form.code} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Province</label><input name="province" value={form.province} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Ville</label><input name="ville" value={form.ville} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Adresse</label><input name="address" value={form.address} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Téléphone</label><input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-4">
                    <h3 className="text-sm font-semibold">Finances</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="input-label">Devise principale</label><select name="currency" value={form.currency} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"><option value="FC">Francs Congolais (FC)</option><option value="USD">US Dollar (USD)</option></select></div>
                        <div><label className="input-label">Taux FC/USD</label><input type="number" name="exchangeRate" value={form.exchangeRate} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                </div>

                <button type="submit" disabled={saveMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium text-sm disabled:opacity-50">
                    {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Sauvegarder
                </button>
            </form>
        </div>
    );
}
