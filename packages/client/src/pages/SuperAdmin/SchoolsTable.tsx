import { useEffect, useState } from 'react';
import api from '../../lib/api';
import SchoolDetailModal from './SchoolDetailModal';
import toast from 'react-hot-toast';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    Power,
    PowerOff,
    Search,
    Trash2,
    X,
} from 'lucide-react';

interface Subscription { status: string; endDate: string; planId: string | null; }
interface Plan { name: string; slug: string; }
interface SchoolRow {
    id: string;
    name: string;
    subdomain: string | null;
    plan: Plan | null;
    subscriptions: Subscription[];
    _count: { students: number };
    isActive: boolean;
    createdAt: string;
}
interface Meta { total: number; page: number; limit: number; totalPages: number; }

// ── Confirmation Modal ────────────────────────────────────────────────────────
interface ConfirmModalProps {
    school: SchoolRow;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function ConfirmToggleModal({ school, onConfirm, onCancel, isLoading }: ConfirmModalProps) {
    const isSuspending = school.isActive;
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

                {/* Header */}
                <div className={`flex items-center justify-between rounded-t-2xl px-6 py-4 ${isSuspending ? 'bg-error-light' : 'bg-primary-lighter'}`}>
                    <div className="flex items-center gap-3">
                        {isSuspending
                            ? <AlertTriangle className="h-6 w-6 text-error" />
                            : <CheckCircle2 className="h-6 w-6 text-primary" />
                        }
                        <h2 className={`text-base font-bold ${isSuspending ? 'text-error' : 'text-primary'}`}>
                            {isSuspending ? 'Suspendre l\'école' : 'Réactiver l\'école'}
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="rounded-full p-1 text-neutral-500 hover:bg-black/10"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4 px-6 py-5">
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">École concernée</p>
                        <p className="mt-0.5 text-sm font-bold text-neutral-900">{school.name}</p>
                        <p className="text-xs text-neutral-500">{school.subdomain}.edugoma360.cd · {school._count.students} élève(s)</p>
                    </div>

                    <p className="text-sm text-neutral-700">
                        {isSuspending
                            ? <>Vous êtes sur le point de <span className="font-semibold text-error">suspendre l'accès</span> à cette école. Tous ses utilisateurs (préfet, enseignants, secrétaires) seront immédiatement déconnectés et ne pourront plus se connecter.</>
                            : <>Vous êtes sur le point de <span className="font-semibold text-primary">réactiver l'accès</span> à cette école. Ses utilisateurs pourront à nouveau se connecter à la plateforme.</>
                        }
                    </p>

                    {isSuspending && (
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-neutral-700">
                                Motif de suspension <span className="text-neutral-400">(optionnel)</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Ex: Non-paiement de l'abonnement, violation des conditions d'utilisation..."
                                rows={3}
                                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    )}

                    {isSuspending && (
                        <div className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-light px-3 py-2.5">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            <p className="text-xs text-accent font-medium">
                                Cette action est réversible. Vous pouvez réactiver l'école à tout moment.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-neutral-200 px-6 py-4">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={isLoading}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-50 ${
                            isSuspending
                                ? 'bg-error hover:bg-red-700'
                                : 'bg-primary hover:bg-primary-hover'
                        }`}
                    >
                        {isLoading
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> En cours...</>
                            : isSuspending
                                ? <><PowerOff className="h-4 w-4" /> Suspendre</>
                                : <><Power className="h-4 w-4" /> Réactiver</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
interface DeleteModalProps {
    school: SchoolRow;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

function DeleteSchoolModal({ school, onConfirm, onCancel, isLoading }: DeleteModalProps) {
    const [typed, setTyped] = useState('');
    const confirmed = typed === school.name;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between rounded-t-2xl bg-red-700 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                            <Trash2 className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-base font-bold text-white">Supprimer définitivement</h2>
                    </div>
                    <button onClick={onCancel} className="rounded-full p-1 text-white/70 hover:bg-white/20">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4 px-6 py-5">
                    {/* Warning banner */}
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                        <div>
                            <p className="text-sm font-bold text-red-700">Action irréversible</p>
                            <p className="mt-0.5 text-xs text-red-600">
                                Cette action ne peut pas être annulée. Toutes les données seront définitivement perdues.
                            </p>
                        </div>
                    </div>

                    {/* School recap */}
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">École à supprimer</p>
                        <p className="mt-0.5 text-sm font-bold text-neutral-900">{school.name}</p>
                        <p className="text-xs text-neutral-500">{school.subdomain}.edugoma360.cd</p>
                    </div>

                    {/* What gets deleted */}
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Ce qui sera supprimé :</p>
                        <ul className="space-y-1 text-xs text-neutral-700">
                            {[
                                `${school._count.students} élève(s) et tous leurs dossiers`,
                                'Enseignants, classes, matières et sections',
                                'Bulletins, notes, délibérations',
                                'Historique des paiements et abonnements',
                                'SMS, emails, convocations, annonces',
                                'Inventaire, bibliothèque, salles',
                                'Tous les utilisateurs du compte',
                            ].map(item => (
                                <li key={item} className="flex items-start gap-1.5">
                                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Type to confirm */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-neutral-700">
                            Tapez <span className="rounded bg-neutral-100 px-1 font-mono text-neutral-900">{school.name}</span> pour confirmer
                        </label>
                        <input
                            value={typed}
                            onChange={e => setTyped(e.target.value)}
                            placeholder={school.name}
                            autoComplete="off"
                            className={`h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 ${
                                typed.length > 0 && !confirmed
                                    ? 'border-red-400 focus:ring-red-200 text-red-700'
                                    : confirmed
                                        ? 'border-green-400 focus:ring-green-200 text-green-700'
                                        : 'border-neutral-300 focus:ring-neutral-200'
                            }`}
                        />
                        {typed.length > 0 && !confirmed && (
                            <p className="mt-1 text-xs text-red-500">Le nom saisi ne correspond pas.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-neutral-200 px-6 py-4">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!confirmed || isLoading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-700 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isLoading
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Suppression...</>
                            : <><Trash2 className="h-4 w-4" /> Supprimer définitivement</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Actif', TRIAL: 'Essai', EXPIRED: 'Expiré',
    SUSPENDED: 'Suspendu', PENDING: 'En attente',
};
const STATUS_STYLES: Record<string, string> = {
    ACTIVE: 'bg-primary-lighter text-primary',
    TRIAL: 'bg-info-light text-info',
    EXPIRED: 'bg-error-light text-error',
    SUSPENDED: 'bg-accent-light text-accent',
    PENDING: 'bg-neutral-100 text-neutral-700',
};
function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.PENDING}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SchoolsTable() {
    const [schools, setSchools]           = useState<SchoolRow[]>([]);
    const [meta, setMeta]                 = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loading, setLoading]           = useState(true);
    const [search, setSearch]             = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage]                 = useState(1);
    const [selectedSchool, setSelectedSchool] = useState<SchoolRow | null>(null);
    const [confirmSchool, setConfirmSchool]   = useState<SchoolRow | null>(null);
    const [deleteSchool, setDeleteSchool]     = useState<SchoolRow | null>(null);
    const [toggling, setToggling]             = useState(false);
    const [deleting, setDeleting]             = useState(false);

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page), limit: '10',
                ...(search && { search }),
                ...(statusFilter !== 'ALL' && { status: statusFilter }),
            });
            const res = await api.get(`/superadmin/schools?${params}`);
            setSchools(res.data.data ?? []);
            setMeta(res.data.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSchools(); }, [page, statusFilter]);
    useEffect(() => {
        const t = setTimeout(() => { setPage(1); fetchSchools(); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    const handleConfirmToggle = async (reason: string) => {
        if (!confirmSchool) return;
        const newStatus = confirmSchool.isActive ? 'SUSPENDED' : 'ACTIVE';
        setToggling(true);
        try {
            await api.patch(`/superadmin/schools/${confirmSchool.id}/status`, {
                status: newStatus,
                reason: reason || undefined,
            });
            toast.success(
                newStatus === 'SUSPENDED'
                    ? `"${confirmSchool.name}" suspendue avec succès.`
                    : `"${confirmSchool.name}" réactivée avec succès.`,
                { style: { background: newStatus === 'SUSPENDED' ? '#C62828' : '#1B5E20', color: '#fff' } }
            );
            setConfirmSchool(null);
            fetchSchools();
        } catch {
            toast.error('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setToggling(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteSchool) return;
        setDeleting(true);
        try {
            await api.delete(`/superadmin/schools/${deleteSchool.id}`);
            toast.success(`"${deleteSchool.name}" supprimée définitivement.`, {
                style: { background: '#B71C1C', color: '#fff' },
                icon: '🗑️',
            });
            setDeleteSchool(null);
            fetchSchools();
        } catch {
            toast.error('Erreur lors de la suppression. Veuillez réessayer.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="space-y-5 p-4 sm:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Écoles</h1>
                        <p className="mt-1 text-sm text-neutral-700">{meta.total} école(s) suivie(s) sur la plateforme.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Rechercher une école, un sous-domaine ou une ville"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="h-10 w-full rounded-md border border-neutral-300 bg-white pl-10 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="ACTIVE">Actif</option>
                            <option value="TRIAL">Essai</option>
                            <option value="EXPIRED">Expiré</option>
                            <option value="SUSPENDED">Suspendu</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    {loading ? (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : schools.length === 0 ? (
                        <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
                            <AlertCircle className="h-8 w-8 text-neutral-500" />
                            <p className="text-sm font-medium text-neutral-900">Aucune école trouvée</p>
                            <p className="text-sm text-neutral-700">Essayez un autre filtre ou une autre recherche.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-neutral-100">
                                    <tr>
                                        {['École', 'Sous-domaine', 'Plan', 'Élèves', 'Abonnement', 'Statut', 'Actions'].map(h => (
                                            <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold text-neutral-700">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {schools.map(school => {
                                        const subscription = school.subscriptions?.[0];
                                        return (
                                            <tr key={school.id} className="hover:bg-primary-lighter/40 transition-colors">
                                                <td className="max-w-[240px] px-5 py-3">
                                                    <p className="truncate font-semibold text-neutral-900">{school.name}</p>
                                                    <p className="text-xs text-neutral-500">Créée le {new Date(school.createdAt).toLocaleDateString('fr-FR')}</p>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-xs text-neutral-700">
                                                    {school.subdomain ?? 'sans-sous-domaine'}.edugoma360.cd
                                                </td>
                                                <td className="px-5 py-3 text-neutral-900">{school.plan?.name ?? 'Aucun'}</td>
                                                <td className="px-5 py-3 tabular-nums text-neutral-900">{school._count.students}</td>
                                                <td className="whitespace-nowrap px-5 py-3 text-neutral-700">
                                                    {subscription?.endDate
                                                        ? new Date(subscription.endDate).toLocaleDateString('fr-FR')
                                                        : 'Aucune date'}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <StatusBadge status={subscription?.status ?? 'PENDING'} />
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => setSelectedSchool(school)}
                                                            title="Voir le dossier"
                                                            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmSchool(school)}
                                                            title={school.isActive ? 'Suspendre l\'accès' : 'Réactiver l\'accès'}
                                                            className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                                                                school.isActive
                                                                    ? 'text-neutral-600 hover:bg-error-light hover:text-error'
                                                                    : 'text-neutral-600 hover:bg-primary-lighter hover:text-primary'
                                                            }`}
                                                        >
                                                            {school.isActive
                                                                ? <PowerOff className="h-4 w-4" />
                                                                : <Power className="h-4 w-4" />
                                                            }
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteSchool(school)}
                                                            title="Supprimer définitivement"
                                                            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-700">Page {meta.page} sur {meta.totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                                className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* School detail modal */}
            {selectedSchool && (
                <SchoolDetailModal
                    schoolId={selectedSchool.id}
                    onClose={() => { setSelectedSchool(null); fetchSchools(); }}
                />
            )}

            {/* Suspend/Reactivate confirmation modal */}
            {confirmSchool && (
                <ConfirmToggleModal
                    school={confirmSchool}
                    onConfirm={handleConfirmToggle}
                    onCancel={() => setConfirmSchool(null)}
                    isLoading={toggling}
                />
            )}

            {/* Delete confirmation modal */}
            {deleteSchool && (
                <DeleteSchoolModal
                    school={deleteSchool}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteSchool(null)}
                    isLoading={deleting}
                />
            )}
        </>
    );
}
