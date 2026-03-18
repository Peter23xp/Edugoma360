import { useState } from 'react';
import {
    Filter,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Search
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useJustifications } from '../../hooks/useJustifications';
import JustificationCard from '../../components/attendance/JustificationCard';
import ApprovalModal from '../../components/attendance/ApprovalModal';
import RejectionModal from '../../components/attendance/RejectionModal';
import type { JustificationData } from '@edugoma360/shared';

const STATS_CONFIG = [
    { id: 'PENDING', label: 'En attente', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', valueKey: 'pending' },
    { id: 'APPROVED', label: 'Approuvés', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', valueKey: 'approved', suffix: 'ce mois' },
    { id: 'REJECTED', label: 'Rejetés', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', valueKey: 'rejected', suffix: 'ce mois' },
    { id: 'EXPIRED', label: 'Expirés', icon: AlertTriangle, color: 'text-neutral-500', bg: 'bg-neutral-100', border: 'border-neutral-200', valueKey: 'expired', subtext: 'Délai 7 jours dépassé' }
];

const TABS = [
    { id: 'ALL', label: 'Tous' },
    { id: 'PENDING', label: 'En attente' },
    { id: 'APPROVED', label: 'Approuvés' },
    { id: 'REJECTED', label: 'Rejetés' },
];

export default function JustificationsPage() {
    const [activeTab, setActiveTab] = useState('PENDING');
    const [page, setPage] = useState(1);
    const limit = 12;

    const { data, isLoading, isError, approveJustification, rejectJustification, isApproving, isRejecting } = useJustifications({
        status: activeTab === 'ALL' ? undefined : activeTab,
        page,
        limit
    });

    const stats = data?.stats || { pending: 0, approved: 0, rejected: 0, expired: 0 };
    const justifications = data?.data || [];

    // Modal states
    const [selectedToApprove, setSelectedToApprove] = useState<JustificationData | null>(null);
    const [selectedToReject, setSelectedToReject] = useState<JustificationData | null>(null);
    const [viewingDocUrl, setViewingDocUrl] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Justificatifs d'absence</h1>
                    <p className="text-neutral-500 text-sm mt-1">Gérez les demandes de justifications soumises par les parents.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS_CONFIG.map((stat) => {
                    const Icon = stat.icon;
                    const value = stats[stat.valueKey as keyof typeof stats];
                    
                    return (
                        <div
                            key={stat.id}
                            onClick={() => setActiveTab(stat.id)}
                            className={cn(
                                "rounded-xl border p-5 flex items-start gap-4 transition-all cursor-pointer hover:shadow-md",
                                activeTab === stat.id ? "ring-2 ring-primary/20 shadow-sm" : "shadow-sm bg-white border-neutral-200"
                            )}
                        >
                            <div className={cn("p-2.5 rounded-lg text-white", stat.bg, stat.color)}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-neutral-500 whitespace-nowrap">{stat.label}</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold tracking-tight text-neutral-900 leading-none mt-1">
                                        {value}
                                    </p>
                                    {stat.suffix && <span className="text-xs text-neutral-500 font-medium">({stat.suffix})</span>}
                                </div>
                                {stat.subtext && <p className="text-xs text-neutral-500 mt-1">{stat.subtext}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                {/* Tabs & Filters */}
                <div className="border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 bg-neutral-50/50">
                    <div className="flex bg-neutral-100/80 p-1 rounded-lg">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    activeTab === tab.id
                                        ? "bg-white text-primary shadow-sm ring-1 ring-neutral-200"
                                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50"
                                )}
                            >
                                {tab.label}
                                {tab.id === 'PENDING' && stats.pending > 0 && (
                                    <span className={cn(
                                        "ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-700",
                                        activeTab === tab.id ? "" : "opacity-80"
                                    )}>
                                        {stats.pending}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher un élève..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                <div className="p-4 sm:p-6 bg-neutral-50/20">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-20 text-neutral-500 flex flex-col items-center">
                            <AlertTriangle size={36} className="text-red-300 mb-3" />
                            <p className="text-sm font-medium">Une erreur s'est produite lors du chargement des justificatifs.</p>
                            <button onClick={() => window.location.reload()} className="text-primary text-sm hover:underline mt-2">Réessayer</button>
                        </div>
                    ) : justifications.length === 0 ? (
                        <div className="text-center py-20 text-neutral-500 flex flex-col items-center">
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                                <Clock size={28} className="text-neutral-300" />
                            </div>
                            <p className="text-sm font-medium">Aucun justificatif trouvé.</p>
                            <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                                {activeTab === 'PENDING' ? "Toutes les demandes ont été traitées ou aucune nouvelle demande n'a été soumise." : "Aucun justificatif ne correspond à vos critères actuels."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {justifications.map((item) => (
                                <JustificationCard
                                    key={item.id}
                                    data={item}
                                    onApprove={setSelectedToApprove}
                                    onReject={setSelectedToReject}
                                    onViewDocument={setViewingDocUrl}
                                />
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Pagination Placeholder */}
                {(data?.pages || 0) > 1 && (
                    <div className="border-t border-neutral-200 p-4 flex justify-between items-center text-sm">
                        <span className="text-neutral-500">Page {page} sur {data?.pages}</span>
                        <div className="flex gap-2">
                             <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border rounded-lg hover:bg-neutral-50 disabled:opacity-50">Précédent</button>
                             <button disabled={page === data?.pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border rounded-lg hover:bg-neutral-50 disabled:opacity-50">Suivant</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ApprovalModal
                isOpen={!!selectedToApprove}
                onClose={() => setSelectedToApprove(null)}
                justification={selectedToApprove}
                onApprove={async (id, comment) => { await approveJustification({ id, comment }); }}
                isApproving={isApproving}
            />

            <RejectionModal
                isOpen={!!selectedToReject}
                onClose={() => setSelectedToReject(null)}
                justification={selectedToReject}
                onReject={async (id, rejectionReason, comment) => { await rejectJustification({ id, rejectionReason, comment }); }}
                isRejecting={isRejecting}
            />

            {/* Document Viewer Modal */}
            {viewingDocUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingDocUrl(null)} />
                    <div className="relative w-full max-w-5xl h-[85vh] bg-neutral-900 rounded-xl flex flex-col overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/40">
                            <h2 className="text-white text-sm font-medium flex items-center gap-2">
                                <Filter size={14} className="text-neutral-400" />
                                Visualisation du document
                            </h2>
                            <button onClick={() => setViewingDocUrl(null)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors">
                                <XCircle size={18} />
                            </button>
                        </div>
                        <div className="flex-1 w-full bg-neutral-900 relative">
                             {/* In a real app, this might use an iframe or a pdf viewer library */}
                             <iframe 
                                src={viewingDocUrl} 
                                title="Document Viewer" 
                                className="w-full h-full border-none"
                             />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
