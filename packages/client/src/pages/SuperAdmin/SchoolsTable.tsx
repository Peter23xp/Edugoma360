import { useEffect, useState } from 'react';
import api from '../../lib/api';
import SchoolDetailModal from './SchoolDetailModal';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    Edit2,
    PowerOff,
    Power,
    Loader2,
    AlertCircle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Subscription { status: string; endDate: string; planId: string | null; }
interface Plan         { name: string; slug: string; }
interface SchoolRow {
    id:           string;
    name:         string;
    subdomain:    string | null;
    plan:         Plan | null;
    subscriptions: Subscription[];
    _count:       { students: number };
    isActive:     boolean;
    createdAt:    string;
}
interface Meta { total: number; page: number; limit: number; totalPages: number; }

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
    ACTIVE:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    TRIAL:     'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    EXPIRED:   'bg-red-500/15 text-red-300 border border-red-500/30',
    SUSPENDED: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    PENDING:   'bg-purple-500/15 text-purple-300 border border-purple-500/30',
};
const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Actif', TRIAL: 'Essai', EXPIRED: 'Expiré', SUSPENDED: 'Suspendu', PENDING: 'En attente',
};
function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-700 text-gray-300'}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// ── SchoolsTable ──────────────────────────────────────────────────────────────
export default function SchoolsTable() {
    const [schools,         setSchools]         = useState<SchoolRow[]>([]);
    const [meta,            setMeta]            = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loading,         setLoading]         = useState(true);
    const [search,          setSearch]          = useState('');
    const [statusFilter,    setStatusFilter]    = useState('ALL');
    const [page,            setPage]            = useState(1);
    const [selectedSchool,  setSelectedSchool]  = useState<SchoolRow | null>(null);
    const [togglingId,      setTogglingId]      = useState<string | null>(null);

    const fetch = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '10',
                ...(search         && { search }),
                ...(statusFilter !== 'ALL' && { status: statusFilter }),
            });
            const res = await api.get(`/superadmin/schools?${params}`);
            setSchools(res.data.data ?? []);
            setMeta(res.data.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, [page, statusFilter]);

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => { setPage(1); fetch(); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const toggleStatus = async (school: SchoolRow) => {
        const newStatus = school.isActive ? 'SUSPENDED' : 'ACTIVE';
        setTogglingId(school.id);
        try {
            await api.patch(`/superadmin/schools/${school.id}/status`, { status: newStatus });
            fetch();
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <>
            <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">Gestion des Écoles</h1>
                    <span className="text-sm text-gray-500">{meta.total} école(s)</span>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, sous-domaine, ville…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1B5E20] transition-colors"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#1B5E20] transition-colors"
                    >
                        <option value="ALL">Tous les statuts</option>
                        <option value="ACTIVE">Actif</option>
                        <option value="TRIAL">Essai</option>
                        <option value="EXPIRED">Expiré</option>
                        <option value="SUSPENDED">Suspendu</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-6 h-6 text-[#F57F17] animate-spin" />
                        </div>
                    ) : schools.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2">
                            <AlertCircle className="w-8 h-8 text-gray-600" />
                            <p className="text-gray-500 text-sm">Aucune école trouvée</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        {['École', 'Sous-domaine', 'Plan', 'Élèves', 'Abonnement jusqu\'au', 'Statut', 'Actions'].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {schools.map((school) => {
                                        const sub = school.subscriptions?.[0];
                                        return (
                                            <tr key={school.id} className="border-b border-gray-800/50 hover:bg-gray-800/25 transition-colors">
                                                <td className="px-5 py-3.5 font-semibold text-white max-w-[180px] truncate">{school.name}</td>
                                                <td className="px-5 py-3.5 text-gray-400 font-mono text-xs whitespace-nowrap">
                                                    {school.subdomain ?? '—'}.edugoma360.cd
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="px-2 py-0.5 bg-[#1B5E20]/30 text-green-300 rounded text-xs border border-[#1B5E20]/50">
                                                        {school.plan?.name ?? '—'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-300 tabular-nums">{school._count.students}</td>
                                                <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                                                    {sub?.endDate ? new Date(sub.endDate).toLocaleDateString('fr-FR') : '—'}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusBadge status={sub?.status ?? 'PENDING'} />
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => setSelectedSchool(school)}
                                                            title="Voir détail"
                                                            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedSchool(school)}
                                                            title="Modifier abonnement"
                                                            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-[#F57F17] transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleStatus(school)}
                                                            title={school.isActive ? 'Suspendre' : 'Réactiver'}
                                                            disabled={togglingId === school.id}
                                                            className={`p-1.5 rounded-lg hover:bg-gray-700 transition-colors ${school.isActive ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-emerald-400'}`}
                                                        >
                                                            {togglingId === school.id
                                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                                : school.isActive
                                                                    ? <PowerOff className="w-4 h-4" />
                                                                    : <Power className="w-4 h-4" />
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
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Page {meta.page} sur {meta.totalPages} ({meta.total} écoles)
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-400 tabular-nums">{page}</span>
                            <button
                                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                                className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* School Detail Modal */}
            {selectedSchool && (
                <SchoolDetailModal
                    schoolId={selectedSchool.id}
                    onClose={() => { setSelectedSchool(null); fetch(); }}
                />
            )}
        </>
    );
}
