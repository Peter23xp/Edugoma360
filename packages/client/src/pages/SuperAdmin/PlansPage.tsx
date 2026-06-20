import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Loader2, Plus, Pencil, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    slug: string;
    priceUSD: number;
    priceCDF: number;
    maxStudents: number;
    maxTeachers: number;
    maxSmsPerMonth: number;
    durationDays: number;
    features: string[];
    isActive: boolean;
    schoolCount: number;
}

const EMPTY_FORM = {
    name: '', slug: '', priceUSD: 0, priceCDF: 0,
    maxStudents: 300, maxTeachers: 20, maxSmsPerMonth: 100,
    durationDays: 30, features: [] as string[], isActive: true,
};

function slugify(str: string) {
    return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function limitLabel(v: number) { return v === -1 ? 'Illimité' : v.toLocaleString(); }

export default function PlansPage() {
    const qc = useQueryClient();
    const [modal, setModal] = useState<{ open: boolean; plan: Plan | null }>({ open: false, plan: null });
    const [form, setForm] = useState(EMPTY_FORM);
    const [unlimitedStudents, setUnlimitedStudents] = useState(false);
    const [unlimitedTeachers, setUnlimitedTeachers] = useState(false);
    const [featureInput, setFeatureInput] = useState('');

    const { data, isLoading, error } = useQuery<{ data: Plan[] }>({
        queryKey: ['sa-plans'],
        queryFn: () => api.get('/superadmin/plans').then(r => r.data),
    });

    const saveMutation = useMutation({
        mutationFn: (payload: any) => modal.plan
            ? api.put(`/superadmin/plans/${modal.plan.id}`, payload).then(r => r.data)
            : api.post('/superadmin/plans', payload).then(r => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['sa-plans'] });
            toast.success(modal.plan ? 'Plan mis à jour.' : 'Plan créé.');
            setModal({ open: false, plan: null });
        },
        onError: () => toast.error('Erreur lors de la sauvegarde.'),
    });

    const toggleMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/superadmin/plans/${id}/toggle`).then(r => r.data),
        onSuccess: (_, id) => {
            qc.invalidateQueries({ queryKey: ['sa-plans'] });
            const plan = data?.data.find(p => p.id === id);
            toast.success(plan?.isActive ? 'Plan désactivé.' : 'Plan activé.');
        },
        onError: () => toast.error('Erreur.'),
    });

    function openCreate() {
        setForm(EMPTY_FORM);
        setUnlimitedStudents(false);
        setUnlimitedTeachers(false);
        setFeatureInput('');
        setModal({ open: true, plan: null });
    }

    function openEdit(p: Plan) {
        setForm({
            name: p.name, slug: p.slug, priceUSD: p.priceUSD, priceCDF: p.priceCDF,
            maxStudents: p.maxStudents === -1 ? 0 : p.maxStudents,
            maxTeachers: p.maxTeachers === -1 ? 0 : p.maxTeachers,
            maxSmsPerMonth: p.maxSmsPerMonth, durationDays: p.durationDays,
            features: [...p.features], isActive: p.isActive,
        });
        setUnlimitedStudents(p.maxStudents === -1);
        setUnlimitedTeachers(p.maxTeachers === -1);
        setFeatureInput('');
        setModal({ open: true, plan: p });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        saveMutation.mutate({
            ...form,
            maxStudents: unlimitedStudents ? -1 : form.maxStudents,
            maxTeachers: unlimitedTeachers ? -1 : form.maxTeachers,
        });
    }

    function addFeature() {
        const f = featureInput.trim();
        if (f && !form.features.includes(f)) {
            setForm(p => ({ ...p, features: [...p.features, f] }));
            setFeatureInput('');
        }
    }

    function handleToggle(plan: Plan) {
        if (plan.isActive && plan.schoolCount > 0) {
            if (!confirm(`${plan.schoolCount} école(s) utilisent ce plan. Désactiver quand même ?`)) return;
        }
        toggleMutation.mutate(plan.id);
    }

    if (isLoading) return <div className="flex h-72 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
    if (error) return <div className="p-6 text-sm text-error">Erreur de chargement.</div>;

    const plans = data?.data ?? [];

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Plans SaaS</h1>
                    <p className="mt-1 text-sm text-neutral-700">Gérez les formules d'abonnement de la plateforme.</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
                    <Plus className="h-4 w-4" /> Nouveau plan
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50">
                        <tr>
                            {['Plan', 'Prix', 'Limites', 'Durée', 'Écoles', 'Statut', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {plans.map(p => (
                            <tr key={p.id} className="hover:bg-neutral-50">
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-neutral-900">{p.name}</p>
                                    <p className="text-xs text-neutral-500">{p.slug}</p>
                                </td>
                                <td className="px-4 py-3 tabular-nums">
                                    <p className="font-medium">${p.priceUSD.toLocaleString()}</p>
                                    <p className="text-xs text-neutral-500">{p.priceCDF.toLocaleString()} CDF</p>
                                </td>
                                <td className="px-4 py-3 text-xs text-neutral-700">
                                    <p>{limitLabel(p.maxStudents)} élèves</p>
                                    <p>{limitLabel(p.maxTeachers)} profs</p>
                                    <p>{limitLabel(p.maxSmsPerMonth)} SMS/mois</p>
                                </td>
                                <td className="px-4 py-3 text-neutral-700">{p.durationDays}j</td>
                                <td className="px-4 py-3 font-semibold tabular-nums text-primary">{p.schoolCount}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? 'bg-primary-lighter text-primary' : 'bg-neutral-100 text-neutral-500'}`}>
                                        {p.isActive ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(p)} className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-primary" title="Modifier">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleToggle(p)} className={`rounded p-1.5 hover:bg-neutral-100 ${p.isActive ? 'text-error hover:text-error' : 'text-primary hover:text-primary'}`} title={p.isActive ? 'Désactiver' : 'Activer'}>
                                            {p.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {plans.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">Aucun plan créé.</p>}
            </div>

            {/* Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                            <h2 className="text-base font-bold text-neutral-900">{modal.plan ? 'Modifier le plan' : 'Nouveau plan'}</h2>
                            <button onClick={() => setModal({ open: false, plan: null })} className="rounded p-1 hover:bg-neutral-100"><X className="h-5 w-5 text-neutral-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Nom *</label>
                                    <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value, slug: modal.plan ? p.slug : slugify(e.target.value) })); }} required className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                                <div className="col-span-2">
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Slug *</label>
                                    <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} readOnly={!!modal.plan} required className={`h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${modal.plan ? 'bg-neutral-50 text-neutral-500' : ''}`} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Prix USD</label>
                                    <input type="number" min={0} value={form.priceUSD} onChange={e => setForm(p => ({ ...p, priceUSD: +e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Prix CDF</label>
                                    <input type="number" min={0} value={form.priceCDF} onChange={e => setForm(p => ({ ...p, priceCDF: +e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Max élèves</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" min={1} value={unlimitedStudents ? '' : form.maxStudents} disabled={unlimitedStudents} onChange={e => setForm(p => ({ ...p, maxStudents: +e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none disabled:bg-neutral-50" />
                                        <label className="flex cursor-pointer items-center gap-1 text-xs whitespace-nowrap">
                                            <input type="checkbox" checked={unlimitedStudents} onChange={e => setUnlimitedStudents(e.target.checked)} className="h-3.5 w-3.5" /> ∞
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Max profs</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" min={1} value={unlimitedTeachers ? '' : form.maxTeachers} disabled={unlimitedTeachers} onChange={e => setForm(p => ({ ...p, maxTeachers: +e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none disabled:bg-neutral-50" />
                                        <label className="flex cursor-pointer items-center gap-1 text-xs whitespace-nowrap">
                                            <input type="checkbox" checked={unlimitedTeachers} onChange={e => setUnlimitedTeachers(e.target.checked)} className="h-3.5 w-3.5" /> ∞
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">SMS/mois</label>
                                    <input type="number" min={0} value={form.maxSmsPerMonth} onChange={e => setForm(p => ({ ...p, maxSmsPerMonth: +e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Durée (jours)</label>
                                    <input type="number" min={1} value={form.durationDays} onChange={e => setForm(p => ({ ...p, durationDays: +e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-neutral-700">Fonctionnalités</label>
                                <div className="flex gap-2">
                                    <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }} placeholder="Ajouter une fonctionnalité..." className="h-9 flex-1 rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                    <button type="button" onClick={addFeature} className="h-9 rounded-md bg-neutral-100 px-3 text-sm hover:bg-neutral-200"><Plus className="h-4 w-4" /></button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {form.features.map(f => (
                                        <span key={f} className="inline-flex items-center gap-1 rounded-full bg-primary-lighter px-2.5 py-0.5 text-xs font-medium text-primary">
                                            <Check className="h-3 w-3" /> {f}
                                            <button type="button" onClick={() => setForm(p => ({ ...p, features: p.features.filter(x => x !== f) }))} className="ml-0.5 hover:text-error"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded" />
                                <label htmlFor="isActive" className="text-sm text-neutral-700">Plan actif (visible pour les nouvelles inscriptions)</label>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
                                <button type="button" onClick={() => setModal({ open: false, plan: null })} className="h-9 rounded-md border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50">Annuler</button>
                                <button type="submit" disabled={saveMutation.isPending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
                                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
