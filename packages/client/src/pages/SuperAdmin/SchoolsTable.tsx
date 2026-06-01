import { useEffect, useState } from 'react';
import api from '../../lib/api';
import SchoolDetailModal from './SchoolDetailModal';
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    Power,
    PowerOff,
    Search,
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

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Actif',
    TRIAL: 'Essai',
    EXPIRED: 'Expiré',
    SUSPENDED: 'Suspendu',
    PENDING: 'En attente',
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

export default function SchoolsTable() {
    const [schools, setSchools] = useState<SchoolRow[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [selectedSchool, setSelectedSchool] = useState<SchoolRow | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '10',
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
        const timeout = setTimeout(() => {
            setPage(1);
            fetchSchools();
        }, 350);
        return () => clearTimeout(timeout);
    }, [search]);

    const toggleStatus = async (school: SchoolRow) => {
        const newStatus = school.isActive ? 'SUSPENDED' : 'ACTIVE';
        setTogglingId(school.id);
        try {
            await api.patch(`/superadmin/schools/${school.id}/status`, { status: newStatus });
            fetchSchools();
        } finally {
            setTogglingId(null);
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

                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Rechercher une école, un sous-domaine ou une ville"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-10 w-full rounded-md border border-neutral-300 bg-white pl-10 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
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
                                        {['École', 'Sous-domaine', 'Plan', 'Élèves', 'Abonnement', 'Statut', 'Actions'].map((heading) => (
                                            <th key={heading} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold text-neutral-700">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {schools.map((school) => {
                                        const subscription = school.subscriptions?.[0];
                                        return (
                                            <tr key={school.id} className="hover:bg-primary-lighter/40">
                                                <td className="max-w-[240px] px-5 py-3">
                                                    <p className="truncate font-semibold text-neutral-900">{school.name}</p>
                                                    <p className="text-xs text-neutral-700">Créée le {new Date(school.createdAt).toLocaleDateString('fr-FR')}</p>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-xs text-neutral-700">
                                                    {school.subdomain ?? 'sans-sous-domaine'}.edugoma360.cd
                                                </td>
                                                <td className="px-5 py-3 text-neutral-900">{school.plan?.name ?? 'Aucun'}</td>
                                                <td className="px-5 py-3 tabular-nums text-neutral-900">{school._count.students}</td>
                                                <td className="whitespace-nowrap px-5 py-3 text-neutral-700">
                                                    {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('fr-FR') : 'Aucune date'}
                                                </td>
                                                <td className="px-5 py-3"><StatusBadge status={subscription?.status ?? 'PENDING'} /></td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => setSelectedSchool(school)}
                                                            title="Voir le dossier"
                                                            aria-label="Voir le dossier"
                                                            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleStatus(school)}
                                                            title={school.isActive ? 'Suspendre' : 'Réactiver'}
                                                            aria-label={school.isActive ? 'Suspendre' : 'Réactiver'}
                                                            disabled={togglingId === school.id}
                                                            className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary disabled:opacity-50"
                                                        >
                                                            {togglingId === school.id
                                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                                : school.isActive
                                                                    ? <PowerOff className="h-4 w-4" />
                                                                    : <Power className="h-4 w-4" />
                                                            }
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

                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-700">Page {meta.page} sur {meta.totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                disabled={page === 1}
                                className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
                                disabled={page === meta.totalPages}
                                className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedSchool && (
                <SchoolDetailModal
                    schoolId={selectedSchool.id}
                    onClose={() => {
                        setSelectedSchool(null);
                        fetchSchools();
                    }}
                />
            )}
        </>
    );
}
