import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    Edit3,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { AbsenceHistoryItem } from '@edugoma360/shared';

interface AbsenceTableProps {
    data: AbsenceHistoryItem[];
    isLoading: boolean;
    page: number;
    pages: number;
    total: number;
    onPageChange: (page: number) => void;
    onViewClick: (item: AbsenceHistoryItem) => void;
    onEditClick: (item: AbsenceHistoryItem) => void;
    canEdit: boolean;
}

export default function AbsenceTable({
    data,
    isLoading,
    page,
    pages,
    total,
    onPageChange,
    onViewClick,
    onEditClick,
    canEdit,
}: AbsenceTableProps) {
    
    // Format helpers
    const formatPeriod = (period: string) => {
        if (period === 'MORNING' || period === 'MATIN') return 'AM';
        if (period === 'AFTERNOON' || period === 'APRES_MIDI') return 'PM';
        return 'SOIR';
    };

    const formatDate = (iso: string, period: string) => {
        const d = new Date(iso);
        const day = d.getDate().toString().padStart(2, '0');
        const mo = (d.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${mo} ${formatPeriod(period)}`;
    };

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'LATE' || status === 'RETARD') {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wider">
                    Retard
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">
                Absent
            </span>
        );
    };

    const pagesArray = Array.from({ length: pages }, (_, i) => i + 1);

    return (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Table (Desktop) */}
            <div className="hidden md:block overflow-x-auto flex-1">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-neutral-50/80 border-b border-neutral-200">
                        <tr>
                            <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Élève</th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider w-24">Classe</th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center w-28">Type</th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center w-28">Justifié</th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-8 text-center text-neutral-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                        <span>Chargement...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-16 text-center text-neutral-500 bg-neutral-50/50">
                                    <CalendarDays size={48} className="mx-auto text-neutral-300 mb-3" />
                                    <p className="font-semibold text-neutral-700">Aucune absence trouvée</p>
                                    <p className="text-sm">Essayez de modifier les filtres</p>
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                                    
                                    {/* Date */}
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 whitespace-nowrap">
                                            {item.status === 'RETARD' || item.status === 'LATE' ? (
                                                <Clock size={14} className="text-orange-500" />
                                            ) : (
                                                <CalendarDays size={14} className="text-neutral-400" />
                                            )}
                                            {formatDate(item.date, item.period)}
                                        </div>
                                    </td>
                                    
                                    {/* Student */}
                                    <td className="px-5 py-3">
                                        <div>
                                            <p className="text-sm font-bold text-neutral-900 leading-none">
                                                {item.student.nom} {item.student.postNom}
                                            </p>
                                            <p className="text-[10px] text-neutral-500 mt-0.5 tracking-wide">
                                                {item.student.matricule}
                                            </p>
                                        </div>
                                    </td>
                                    
                                    {/* Class */}
                                    <td className="px-5 py-3">
                                        <span className="text-sm font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                                            {item.class.name}
                                        </span>
                                    </td>
                                    
                                    {/* Type */}
                                    <td className="px-5 py-3 text-center">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    
                                    {/* Justified */}
                                    <td className="px-5 py-3 text-center">
                                        <div className="flex justify-center">
                                            {item.isJustified ? (
                                                <div className="group/j relative">
                                                    <CheckCircle2 size={18} className="text-green-500" />
                                                </div>
                                            ) : (
                                                <XCircle size={18} className="text-red-500/50" />
                                            )}
                                        </div>
                                    </td>
                                    
                                    {/* Actions */}
                                    <td className="px-5 py-3">
                                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onViewClick(item)}
                                                className="p-1.5 text-neutral-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors tooltip-trigger"
                                                title="Voir détails"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            
                                            {canEdit && (
                                                <button
                                                    onClick={() => onEditClick(item)}
                                                    className="p-1.5 text-neutral-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                    title="Modifier justification"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Cards (Mobile) */}
            <div className="md:hidden flex-1 bg-neutral-50/50 p-4">
                {isLoading ? (
                    <div className="py-8 text-center text-neutral-500 flex flex-col items-center gap-2">
                        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <span className="text-sm">Chargement...</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 bg-white rounded-xl border border-neutral-200">
                        <CalendarDays size={36} className="mx-auto text-neutral-300 mb-2" />
                        <p className="font-semibold text-neutral-700 text-sm">Aucune absence</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-3">
                                {/* Header: Élève et Actions */}
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-neutral-900 truncate">
                                            {item.student.nom} {item.student.postNom}
                                        </p>
                                        <p className="text-xs text-neutral-500 font-mono mt-0.5">
                                            {item.student.matricule}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        <button onClick={() => onViewClick(item)} className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-lg">
                                            <Eye size={16} />
                                        </button>
                                        {canEdit && (
                                            <button onClick={() => onEditClick(item)} className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-lg">
                                                <Edit3 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-neutral-100 w-full" />

                                {/* Infos: Date, Classe, Statuts */}
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-1 rounded-md">
                                        {item.status === 'RETARD' || item.status === 'LATE' ? (
                                            <Clock size={12} className="text-orange-500" />
                                        ) : (
                                            <CalendarDays size={12} className="text-neutral-400" />
                                        )}
                                        {formatDate(item.date, item.period)}
                                    </div>
                                    <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md">
                                        {item.class.name}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <StatusBadge status={item.status} />
                                    <div className="flex items-center gap-1.5 text-xs font-medium">
                                        {item.isJustified ? (
                                            <>
                                              <CheckCircle2 size={14} className="text-green-500" />
                                              <span className="text-green-700">Justifié</span>
                                            </>
                                        ) : (
                                            <>
                                              <XCircle size={14} className="text-red-400" />
                                              <span className="text-neutral-500">Non justifié</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination footer */}
            {!isLoading && total > 0 && (
                <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs text-neutral-500 font-medium">
                        Page <strong className="text-neutral-800">{page}</strong> sur {pages} · Total : <strong className="text-neutral-800">{total}</strong>
                    </p>
                    
                    <div className="flex items-center gap-1">
                        <button 
                            disabled={page === 1}
                            onClick={() => onPageChange(page - 1)}
                            className="p-1.5 rounded text-neutral-500 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <div className="flex items-center gap-1 mx-1">
                            {pagesArray.map((p) => {
                                // Simple range display logic
                                if (pages > 5) {
                                    if (p !== 1 && p !== pages && Math.abs(p - page) > 1) {
                                        if (p === 2 || p === pages - 1) return <span key={p} className="text-neutral-400 px-1 text-xs">...</span>;
                                        return null;
                                    }
                                }
                                return (
                                    <button
                                        key={p}
                                        onClick={() => onPageChange(p)}
                                        className={cn(
                                            "min-w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition-colors",
                                            p === page 
                                                ? "bg-primary text-white" 
                                                : "text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50"
                                        )}
                                    >
                                        {p}
                                    </button>
                                )
                            })}
                        </div>
                        
                        <button 
                            disabled={page === pages}
                            onClick={() => onPageChange(page + 1)}
                            className="p-1.5 rounded text-neutral-500 border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
