import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ClipboardList, CheckCircle, Clock, Filter, ExternalLink,
    TrendingUp, Users, XCircle, BookOpen, ChevronRight, Search
} from 'lucide-react';
import api from '../../lib/api';
import { openPdfFromApi } from '../../lib/downloadPdf';
import { useClassesList } from '../../hooks/useClassesList';
import { normalize } from '../../lib/apiNormalize';
import { useNavigate } from 'react-router-dom';

// ── Badges ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    VALIDATED: { label: 'Validée',    className: 'bg-green-100 text-green-800 border-green-200' },
    DRAFT:     { label: 'Brouillon',  className: 'bg-amber-100 text-amber-800 border-amber-200' },
    CANCELLED: { label: 'Annulée',    className: 'bg-red-100 text-red-700 border-red-200' },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
            {status === 'VALIDATED' && <CheckCircle size={10} className="mr-1" />}
            {status === 'DRAFT'     && <Clock        size={10} className="mr-1" />}
            {cfg.label}
        </span>
    );
}

// ── Stat mini-card ─────────────────────────────────────────────────────────────
function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
        <div className="text-center">
            <p className={`text-base font-bold ${color}`}>{value}</p>
            <p className="text-xs text-neutral-500 leading-tight">{label}</p>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DeliberationHistoryPage() {
    const navigate = useNavigate();
    const [filterClass,  setFilterClass]  = useState('');
    const [filterTerm,   setFilterTerm]   = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');

    const { data: classes = [] } = useClassesList();

    const { data: termsRaw } = useQuery({
        queryKey: ['terms'],
        queryFn: async () => {
            const { data } = await api.get('/settings/terms');
            return { terms: normalize.terms(data) };
        },
    });
    const terms: any[] = (termsRaw as any)?.terms ?? [];

    const { data, isLoading } = useQuery({
        queryKey: ['deliberation-history', filterClass, filterTerm, filterStatus],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filterClass)  params.set('classId', filterClass);
            if (filterTerm)   params.set('termId',  filterTerm);
            if (filterStatus) params.set('status',  filterStatus);
            const { data } = await api.get(`/deliberation?${params.toString()}`);
            return data;
        },
    });

    const deliberations: any[] = data?.deliberations ?? [];

    const filtered = deliberations.filter(d => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            d.class.name.toLowerCase().includes(q) ||
            d.term.label.toLowerCase().includes(q) ||
            d.term.academicYear?.toLowerCase().includes(q) ||
            d.class.section?.toLowerCase().includes(q)
        );
    });

    // KPIs globaux
    const totalValidated  = deliberations.filter(d => d.status === 'VALIDATED').length;
    const totalStudents   = deliberations.reduce((s, d) => s + d.stats.total, 0);
    const avgSuccessRate  = deliberations.length > 0
        ? Math.round(deliberations.reduce((s, d) => s + d.stats.successRate, 0) / deliberations.length)
        : 0;

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200 px-6 py-5">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                            <ClipboardList className="text-[#1B5E20]" size={26} />
                            Historique des délibérations
                        </h1>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            Toutes les délibérations — PV et résultats
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/grades/deliberation')}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1B5E20] rounded-xl hover:bg-[#2E7D32] transition-colors"
                    >
                        <ClipboardList size={15} /> Nouvelle délibération
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* KPIs */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Délibérations validées', value: totalValidated, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
                        { label: 'Élèves délibérés',        value: totalStudents,  icon: Users,        color: 'text-[#0D47A1]', bg: 'bg-blue-50 border-blue-200' },
                        { label: 'Taux de réussite moyen',  value: `${avgSuccessRate}%`, icon: TrendingUp, color: 'text-[#F57F17]', bg: 'bg-amber-50 border-amber-200' },
                    ].map(kpi => (
                        <div key={kpi.label} className={`${kpi.bg} border rounded-2xl p-5 flex items-center gap-4`}>
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                                <kpi.icon size={22} className={kpi.color} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                                <p className="text-xs text-neutral-600 mt-0.5">{kpi.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtres */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Filter size={16} className="text-neutral-400 flex-shrink-0" />

                        {/* Recherche */}
                        <div className="relative flex-1 min-w-[180px]">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Rechercher classe, trimestre…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
                            />
                        </div>

                        <select
                            value={filterClass}
                            onChange={e => setFilterClass(e.target.value)}
                            className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
                        >
                            <option value="">Toutes les classes</option>
                            {(classes as any[]).map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <select
                            value={filterTerm}
                            onChange={e => setFilterTerm(e.target.value)}
                            className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
                        >
                            <option value="">Tous les trimestres</option>
                            {terms.map((t: any) => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>

                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="VALIDATED">Validées</option>
                            <option value="DRAFT">Brouillons</option>
                        </select>

                        {(filterClass || filterTerm || filterStatus || search) && (
                            <button
                                onClick={() => { setFilterClass(''); setFilterTerm(''); setFilterStatus(''); setSearch(''); }}
                                className="text-xs text-neutral-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                            >
                                <XCircle size={13} /> Réinitialiser
                            </button>
                        )}
                    </div>
                </div>

                {/* Liste */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-48 text-neutral-400 text-sm gap-2">
                        <div className="w-5 h-5 border-2 border-neutral-300 border-t-[#1B5E20] rounded-full animate-spin" />
                        Chargement…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-16 text-center">
                        <ClipboardList size={40} className="text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500 font-medium">Aucune délibération trouvée</p>
                        <p className="text-sm text-neutral-400 mt-1">
                            {deliberations.length === 0
                                ? 'Aucune délibération n\'a encore été effectuée.'
                                : 'Modifiez les filtres pour voir plus de résultats.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(d => (
                            <DelibCard key={d.id} delib={d} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Delib card ─────────────────────────────────────────────────────────────────
function DelibCard({ delib }: { delib: any }) {
    const [expanded, setExpanded] = useState(false);

    const validatedDate = delib.validatedAt
        ? new Date(delib.validatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden transition-shadow hover:shadow-md">
            {/* Row principal */}
            <div
                className="flex items-center gap-4 px-6 py-4 cursor-pointer"
                onClick={() => setExpanded(e => !e)}
            >
                {/* Icône classe */}
                <div className="w-11 h-11 bg-[#1B5E20]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={20} className="text-[#1B5E20]" />
                </div>

                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-neutral-900">{delib.class.name}</p>
                        <span className="text-neutral-300">·</span>
                        <p className="text-sm text-neutral-600">{delib.term.label}</p>
                        <span className="text-neutral-300">·</span>
                        <p className="text-xs text-neutral-400">{delib.term.academicYear}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                        <StatusBadge status={delib.status} />
                        {delib.class.section && (
                            <span className="text-xs text-neutral-400">Section {delib.class.section}</span>
                        )}
                        {validatedDate && (
                            <span className="text-xs text-neutral-400">Validée le {validatedDate}</span>
                        )}
                    </div>
                </div>

                {/* Stats rapides */}
                <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                    <MiniStat label="Élèves"   value={delib.stats.total}       color="text-neutral-800" />
                    <MiniStat label="Admis"    value={delib.stats.admitted}    color="text-green-600" />
                    <MiniStat label="Échoués"  value={delib.stats.failed}      color="text-red-600" />
                    <MiniStat label="Réussite" value={`${delib.stats.successRate}%`} color="text-[#F57F17]" />
                    {delib.stats.avgGeneral !== null && (
                        <MiniStat label="Moy. gén." value={delib.stats.avgGeneral?.toFixed(2)} color="text-[#0D47A1]" />
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {delib.pvUrl && (
                        <button
                            onClick={e => { e.stopPropagation(); openPdfFromApi(`/deliberation/pv/${delib.id}`, `PV_${delib.class.name}.pdf`); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0D47A1] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <ExternalLink size={12} /> PV
                        </button>
                    )}
                    <ChevronRight
                        size={16}
                        className={`text-neutral-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
                    />
                </div>
            </div>

            {/* Détail expandable */}
            {expanded && (
                <div className="border-t border-neutral-100 px-6 py-5 bg-neutral-50">
                    {/* Stats mobile */}
                    <div className="flex sm:hidden items-center justify-around mb-4 pb-4 border-b border-neutral-200">
                        <MiniStat label="Élèves"   value={delib.stats.total}       color="text-neutral-800" />
                        <MiniStat label="Admis"    value={delib.stats.admitted}    color="text-green-600" />
                        <MiniStat label="Ajournés" value={delib.stats.adjourned}   color="text-amber-600" />
                        <MiniStat label="Échoués"  value={delib.stats.failed}      color="text-red-600" />
                        <MiniStat label="Réussite" value={`${delib.stats.successRate}%`} color="text-[#F57F17]" />
                    </div>

                    {/* Barre de réussite */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                            <span>Taux de réussite</span>
                            <span className="font-semibold text-[#1B5E20]">{delib.stats.successRate}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div
                                className="h-2 rounded-full bg-[#1B5E20] transition-all"
                                style={{ width: `${delib.stats.successRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Détail décisions */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {[
                            { label: 'Admis',         value: delib.stats.admitted,  color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
                            { label: 'Ajournés',      value: delib.stats.adjourned, color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
                            { label: 'Échoués',       value: delib.stats.failed,    color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
                            { label: 'Total élèves',  value: delib.stats.total,     color: 'text-neutral-700',bg: 'bg-neutral-50 border-neutral-200' },
                        ].map(item => (
                            <div key={item.label} className={`${item.bg} border rounded-xl p-3 text-center`}>
                                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                                <p className="text-xs text-neutral-500 mt-0.5">{item.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        {delib.pvUrl && (
                            <button
                                onClick={() => openPdfFromApi(`/deliberation/pv/${delib.id}`, `PV_${delib.class.name}.pdf`)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0D47A1] rounded-lg hover:bg-[#0D47A1]/90 transition-colors"
                            >
                                <ExternalLink size={14} /> Ouvrir le PV
                            </button>
                        )}
                        {!delib.pvUrl && delib.status === 'VALIDATED' && (
                            <span className="text-xs text-neutral-400 flex items-center gap-1">
                                <XCircle size={12} /> PV non disponible
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
