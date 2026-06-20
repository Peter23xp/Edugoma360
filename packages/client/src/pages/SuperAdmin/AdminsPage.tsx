import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Loader2, Plus, KeyRound, ToggleLeft, ToggleRight, X, ShieldCheck, ShieldAlert } from 'lucide-react';

interface SAAdmin {
    id: string;
    nom: string;
    postNom: string;
    prenom: string | null;
    email: string | null;
    phone: string | null;
    isActive: boolean;
    permissions: string[];
    createdAt: string;
    lastLoginAt: string | null;
    school: { id: string; name: string };
}

const ALL_PERMISSIONS: { key: string; label: string }[] = [
    { key: 'metrics:read',          label: 'Voir les métriques' },
    { key: 'schools:read',          label: 'Voir les écoles' },
    { key: 'schools:write',         label: 'Gérer les écoles' },
    { key: 'subscriptions:read',    label: 'Voir les abonnements' },
    { key: 'subscriptions:write',   label: 'Gérer les abonnements' },
    { key: 'plans:read',            label: 'Voir les plans' },
    { key: 'plans:write',           label: 'Gérer les plans' },
    { key: 'sms:read',              label: 'Voir SMS' },
    { key: 'billing:read',          label: 'Voir la facturation' },
    { key: 'billing:write',         label: 'Gérer la facturation' },
    { key: 'audit:read',            label: 'Voir les logs d\'audit' },
    { key: 'admins:manage',         label: 'Gérer les admins SA' },
    { key: 'exports:generate',      label: 'Générer des exports' },
    { key: 'notifications:manage',  label: 'Gérer les notifications' },
];

const EMPTY_CREATE = { nom: '', postNom: '', prenom: '', email: '', phone: '', password: '', confirmPassword: '', permissions: [] as string[] };

function PermissionGrid({ selected, onChange }: { selected: string[]; onChange: (p: string[]) => void }) {
    const fullAccess = selected.length === 0;
    return (
        <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={fullAccess} onChange={e => onChange(e.target.checked ? [] : [ALL_PERMISSIONS[0].key])} className="h-4 w-4 rounded accent-primary" />
                <span className="text-sm font-semibold text-primary">Accès complet (toutes permissions)</span>
            </label>
            {!fullAccess && (
                <div className="grid grid-cols-1 gap-1.5 border-t border-neutral-100 pt-3 sm:grid-cols-2">
                    {ALL_PERMISSIONS.map(p => (
                        <label key={p.key} className="flex cursor-pointer items-center gap-2">
                            <input type="checkbox" checked={selected.includes(p.key)}
                                onChange={e => onChange(e.target.checked ? [...selected, p.key] : selected.filter(k => k !== p.key))}
                                className="h-3.5 w-3.5 rounded accent-primary" />
                            <span className="text-xs text-neutral-700">{p.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminsPage() {
    const qc = useQueryClient();
    const [createModal, setCreateModal] = useState(false);
    const [permModal, setPermModal] = useState<{ open: boolean; admin: SAAdmin | null }>({ open: false, admin: null });
    const [form, setForm] = useState(EMPTY_CREATE);
    const [editPerms, setEditPerms] = useState<string[]>([]);

    const { data, isLoading } = useQuery<{ data: SAAdmin[] }>({
        queryKey: ['sa-admins'],
        queryFn: () => api.get('/superadmin/admins').then(r => r.data),
    });

    const createMutation = useMutation({
        mutationFn: (body: any) => api.post('/superadmin/admins', body).then(r => r.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-admins'] }); toast.success('Admin créé.'); setCreateModal(false); setForm(EMPTY_CREATE); },
        onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erreur création.'),
    });

    const permMutation = useMutation({
        mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
            api.patch(`/superadmin/admins/${id}/permissions`, { permissions }).then(r => r.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-admins'] }); toast.success('Permissions mises à jour.'); setPermModal({ open: false, admin: null }); },
        onError: () => toast.error('Erreur mise à jour permissions.'),
    });

    const toggleMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/superadmin/admins/${id}/toggle`).then(r => r.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-admins'] }); toast.success('Statut mis à jour.'); },
        onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erreur.'),
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { toast.error('Les mots de passe ne correspondent pas.'); return; }
        const { confirmPassword, ...body } = form;
        createMutation.mutate({ ...body, prenom: body.prenom || undefined, email: body.email || undefined, phone: body.phone || undefined });
    }

    function openPermModal(admin: SAAdmin) {
        setEditPerms([...admin.permissions]);
        setPermModal({ open: true, admin });
    }

    const admins = data?.data ?? [];

    if (isLoading) return <div className="flex h-72 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Admins plateforme</h1>
                    <p className="mt-1 text-sm text-neutral-700">Gérez les comptes Super Admin et leurs permissions.</p>
                </div>
                <button onClick={() => setCreateModal(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
                    <Plus className="h-4 w-4" /> Nouvel Admin
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {admins.map(a => (
                    <div key={a.id} className={`rounded-lg border bg-white p-5 ${a.isActive ? 'border-neutral-200' : 'border-neutral-200 opacity-60'}`}>
                        <div className="flex items-start justify-between">
                            <div className="min-w-0">
                                <p className="font-semibold text-neutral-900">{a.nom} {a.prenom ?? ''} {a.postNom}</p>
                                <p className="text-xs text-neutral-500">{a.email ?? a.phone ?? '—'}</p>
                                <p className="mt-0.5 text-xs text-neutral-400">École : {a.school.name}</p>
                            </div>
                            <span className={`ml-2 shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${a.isActive ? 'bg-primary-lighter text-primary' : 'bg-neutral-100 text-neutral-500'}`}>
                                {a.isActive ? 'Actif' : 'Inactif'}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center gap-1.5">
                            {a.permissions.length === 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary-lighter px-2.5 py-0.5 text-xs font-medium text-primary">
                                    <ShieldCheck className="h-3 w-3" /> Accès complet
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-accent">
                                    <ShieldAlert className="h-3 w-3" /> {a.permissions.length} permission{a.permissions.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {a.lastLoginAt && (
                            <p className="mt-2 text-xs text-neutral-400">
                                Dernière connexion : {new Date(a.lastLoginAt).toLocaleDateString('fr-FR')}
                            </p>
                        )}

                        <div className="mt-4 flex gap-2">
                            <button onClick={() => openPermModal(a)} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-300 py-1.5 text-xs font-medium hover:bg-neutral-50">
                                <KeyRound className="h-3.5 w-3.5" /> Permissions
                            </button>
                            <button onClick={() => toggleMutation.mutate(a.id)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border py-1.5 text-xs font-medium transition-colors ${a.isActive ? 'border-error/40 text-error hover:bg-error-light' : 'border-primary/40 text-primary hover:bg-primary-lighter'}`}>
                                {a.isActive ? <><ToggleRight className="h-3.5 w-3.5" /> Désactiver</> : <><ToggleLeft className="h-3.5 w-3.5" /> Activer</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {admins.length === 0 && (
                <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center">
                    <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
                    <p className="text-sm text-neutral-500">Aucun admin plateforme.</p>
                </div>
            )}

            {/* Create Modal */}
            {createModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                            <h2 className="text-base font-bold text-neutral-900">Créer un Admin SA</h2>
                            <button onClick={() => setCreateModal(false)} className="rounded p-1 hover:bg-neutral-100"><X className="h-5 w-5 text-neutral-500" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4 p-6">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Nom *</label>
                                    <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} required className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Post-nom *</label>
                                    <input value={form.postNom} onChange={e => setForm(p => ({ ...p, postNom: e.target.value }))} required className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Prénom</label>
                                    <input value={form.prenom} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Téléphone</label>
                                    <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Mot de passe *</label>
                                    <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={8} className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-neutral-700">Confirmer *</label>
                                    <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required className="h-9 w-full rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none" />
                                </div>
                            </div>
                            <div className="rounded-md border border-neutral-200 p-4">
                                <p className="mb-3 text-xs font-semibold text-neutral-700 uppercase tracking-wide">Permissions</p>
                                <PermissionGrid selected={form.permissions} onChange={p => setForm(prev => ({ ...prev, permissions: p }))} />
                            </div>
                            <div className="flex justify-end gap-3 border-t border-neutral-100 pt-3">
                                <button type="button" onClick={() => setCreateModal(false)} className="h-9 rounded-md border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50">Annuler</button>
                                <button type="submit" disabled={createMutation.isPending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
                                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Permissions Modal */}
            {permModal.open && permModal.admin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                            <div>
                                <h2 className="text-base font-bold text-neutral-900">Modifier les permissions</h2>
                                <p className="text-xs text-neutral-500">{permModal.admin.nom} {permModal.admin.postNom}</p>
                            </div>
                            <button onClick={() => setPermModal({ open: false, admin: null })} className="rounded p-1 hover:bg-neutral-100"><X className="h-5 w-5 text-neutral-500" /></button>
                        </div>
                        <div className="p-6">
                            <PermissionGrid selected={editPerms} onChange={setEditPerms} />
                            <div className="mt-4 flex justify-end gap-3 border-t border-neutral-100 pt-4">
                                <button onClick={() => setPermModal({ open: false, admin: null })} className="h-9 rounded-md border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50">Annuler</button>
                                <button onClick={() => permMutation.mutate({ id: permModal.admin!.id, permissions: editPerms })} disabled={permMutation.isPending} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
                                    {permMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sauvegarder'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
