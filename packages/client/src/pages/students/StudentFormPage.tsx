import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function StudentFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = !!id;

    const [form, setForm] = useState({
        nom: '', postNom: '', prenom: '', sexe: 'M', dateNaissance: '', lieuNaissance: 'Goma',
        nationalite: 'Congolaise', statut: 'NOUVEAU', nomPere: '', telPere: '', nomMere: '', telMere: '',
        nomTuteur: '', telTuteur: '', classId: '',
    });

    // Load existing student for edit
    useQuery({
        queryKey: ['student', id],
        queryFn: async () => {
            const res = await api.get(`/students/${id}`);
            setForm({ ...form, ...res.data });
            return res.data;
        },
        enabled: isEdit,
    });

    const { data: classes } = useQuery({
        queryKey: ['classes-list'],
        queryFn: async () => (await api.get('/settings/classes')).data,
    });

    const mutation = useMutation({
        mutationFn: async (data: typeof form) => {
            if (isEdit) return api.put(`/students/${id}`, data);
            return api.post('/students', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            toast.success(isEdit ? 'Élève modifié' : 'Élève inscrit');
            navigate('/students');
        },
        onError: () => toast.error('Erreur lors de l\'enregistrement'),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(form);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary">
                <ArrowLeft size={16} /> Retour
            </button>

            <h1 className="text-xl font-bold text-neutral-900">{isEdit ? 'Modifier l\'élève' : 'Nouvelle inscription'}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identity */}
                <div className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-neutral-900">Identité</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="input-label">Nom *</label><input name="nom" value={form.nom} onChange={handleChange} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Post-nom *</label><input name="postNom" value={form.postNom} onChange={handleChange} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Prénom</label><input name="prenom" value={form.prenom} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="input-label">Sexe *</label><select name="sexe" value={form.sexe} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
                        <div><label className="input-label">Date de naissance *</label><input type="date" name="dateNaissance" value={form.dateNaissance?.slice(0, 10)} onChange={handleChange} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Lieu de naissance *</label><input name="lieuNaissance" value={form.lieuNaissance} onChange={handleChange} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="input-label">Classe *</label><select name="classId" value={form.classId} onChange={handleChange} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"><option value="">Sélectionner...</option>{classes?.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div><label className="input-label">Statut</label><select name="statut" value={form.statut} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"><option value="NOUVEAU">Nouveau</option><option value="REDOUBLANT">Redoublant</option><option value="TRANSFERE">Transféré</option><option value="DEPLACE">Déplacé</option><option value="REFUGIE">Réfugié</option></select></div>
                    </div>
                </div>

                {/* Family */}
                <div className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-neutral-900">Famille</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="input-label">Nom du père</label><input name="nomPere" value={form.nomPere} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Tél. père</label><input name="telPere" value={form.telPere} onChange={handleChange} placeholder="+243..." className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Nom de la mère</label><input name="nomMere" value={form.nomMere} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Tél. mère</label><input name="telMere" value={form.telMere} onChange={handleChange} placeholder="+243..." className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Nom du tuteur</label><input name="nomTuteur" value={form.nomTuteur} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="input-label">Tél. tuteur (SMS)</label><input name="telTuteur" value={form.telTuteur} onChange={handleChange} placeholder="+243..." className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                </div>

                <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium text-sm disabled:opacity-60">
                    {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isEdit ? 'Enregistrer les modifications' : 'Inscrire l\'élève'}
                </button>
            </form>
        </div>
    );
}
