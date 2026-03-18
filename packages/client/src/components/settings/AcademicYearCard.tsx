import { Calendar, Lock, Navigation, Users, BookOpen, BarChart2 } from 'lucide-react';
import { AcademicYear, Term } from '../../hooks/useAcademicYears';
import { differenceInWeeks, differenceInDays, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface AcademicYearCardProps {
    year: AcademicYear;
    isPast?: boolean;
    onEditClick?: () => void;
    onCloseClick?: () => void;
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try { return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: fr }); }
    catch { return dateStr; }
};

const getWeeks = (start?: string, end?: string) => {
    if (!start || !end) return 0;
    try { return Math.max(0, differenceInWeeks(parseISO(end), parseISO(start))); }
    catch { return 0; }
};

const termStatusConfig = {
    COMPLETED: { label: 'Terminé', badge: 'bg-green-100 text-green-700 border-green-200', bar: 'bg-green-500', icon: '✅', left: 'border-green-400' },
    CURRENT: { label: 'En cours', badge: 'bg-blue-100 text-blue-700 border-blue-200', bar: 'bg-blue-500', icon: '🟢', left: 'border-blue-500' },
    UPCOMING: { label: 'À venir', badge: 'bg-neutral-100 text-neutral-500 border-neutral-200', bar: 'bg-neutral-200', icon: '⏳', left: 'border-neutral-300' },
};

function TermProgress({ term }: { term: Term }) {
    const now = new Date();
    const start = parseISO(term.startDate);
    const end = parseISO(term.endDate);
    const totalDays = Math.max(1, differenceInDays(end, start));
    const elapsedDays = term.status === 'COMPLETED' ? totalDays : term.status === 'CURRENT' ? Math.min(totalDays, differenceInDays(now, start)) : 0;
    const progress = Math.round((elapsedDays / totalDays) * 100);
    const cfg = termStatusConfig[term.status];
    const totalWeeks = getWeeks(term.startDate, term.endDate);
    const currentWeek = term.status === 'CURRENT' ? Math.min(totalWeeks, differenceInWeeks(now, start) + 1) : 0;

    return (
        <div className={cn("pl-4 border-l-2 py-2", cfg.left)}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <Navigation size={12} className="text-neutral-400 shrink-0" />
                    <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
                        {term.number === 1 ? (totalWeeks > 18 ? 'Semestre' : 'Trimestre') : (totalWeeks > 18 ? 'Semestre' : 'Trimestre')} {term.number}
                    </span>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", cfg.badge)}>
                    {cfg.icon} {cfg.label}
                    {term.status === 'CURRENT' && totalWeeks > 0 && ` (S${currentWeek}/${totalWeeks})`}
                </span>
            </div>
            <p className="text-xs text-neutral-500 mb-2">
                {formatDate(term.startDate)} → {formatDate(term.endDate)} ({totalWeeks} semaines)
            </p>
            <div className="w-full bg-neutral-100 rounded-full h-1.5">
                <div
                    className={cn("h-1.5 rounded-full transition-all", cfg.bar)}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

// ── Past Year Card ────────────────────────────────────────────────────────────
function PastYearCard({ year }: { year: AcademicYear }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-100 bg-neutral-50/60">
                <div>
                    <h3 className="font-bold text-base text-neutral-800">{year.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {formatDate(year.startDate)} → {formatDate(year.endDate)}
                    </p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                    <Lock size={11} /> Clôturée
                </span>
            </div>
            <div className="px-5 py-4 space-y-2">
                {year.closedAt && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Calendar size={13} className="text-neutral-400" />
                        Clôturée le {formatDate(year.closedAt)}
                    </div>
                )}
                <div className="flex items-center gap-3 text-xs text-neutral-600">
                    <span className="flex items-center gap-1.5">
                        <Users size={13} className="text-neutral-400" />
                        {year.studentCount ?? 0} élèves
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="flex items-center gap-1.5">
                        <BookOpen size={13} className="text-neutral-400" />
                        {year.termCount ?? 0} périodes
                    </span>
                    {year.type && (
                        <>
                            <span className="text-neutral-300">•</span>
                            <span className="capitalize text-neutral-400">{year.type.toLowerCase()}</span>
                        </>
                    )}
                </div>
            </div>
            <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex gap-4">
                <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 transition-colors">
                    📄 Voir détails
                </button>
                <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 transition-colors">
                    <BarChart2 size={12} /> Rapports
                </button>
            </div>
        </div>
    );
}

// ── Active Year Card ──────────────────────────────────────────────────────────
function ActiveYearCard({ year, onEditClick, onCloseClick }: { year: AcademicYear; onEditClick?: () => void; onCloseClick?: () => void }) {
    const totalWeeks = getWeeks(year.startDate, year.endDate);
    const now = new Date();
    const start = year.startDate ? parseISO(year.startDate) : null;
    const elapsedWeeks = start ? Math.min(totalWeeks, Math.max(0, differenceInWeeks(now, start))) : 0;
    const yearProgress = totalWeeks > 0 ? Math.round((elapsedWeeks / totalWeeks) * 100) : 0;

    const currentTerm = year.terms?.find(t => t.status === 'CURRENT');

    return (
        <div className="bg-white border-2 border-primary/25 rounded-xl overflow-hidden shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary/8 to-primary/3 border-b border-primary/15">
                <div>
                    <h3 className="font-bold text-xl text-primary">{year.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        Du {formatDate(year.startDate)} au {formatDate(year.endDate)} · {totalWeeks} semaines
                    </p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Active
                </span>
            </div>

            <div className="px-6 py-5 space-y-5">
                {/* Global progress */}
                <div>
                    <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
                        <span className="font-medium">Progression de l'année</span>
                        <span className="font-semibold text-primary">{elapsedWeeks}/{totalWeeks} semaines ({yearProgress}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                            style={{ width: `${yearProgress}%` }}
                        />
                    </div>
                    {currentTerm && (
                        <p className="text-xs text-primary/80 mt-1.5 font-medium">
                            📍 {year.type === 'SEMESTRES' ? 'Semestre' : 'Trimestre'} {currentTerm.number} en cours
                        </p>
                    )}
                </div>

                {/* Terms */}
                {year.terms && year.terms.length > 0 && (
                    <div className="space-y-3">
                        {year.terms.map(term => (
                            <TermProgress key={term.id} term={term} />
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-neutral-50/60 border-t border-neutral-100 flex items-center justify-between gap-3">
                <button 
                    onClick={onEditClick}
                    className="px-4 py-2 text-sm font-medium bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
                >
                    Modifier les dates
                </button>
                <button
                    onClick={onCloseClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                    <Lock size={14} />
                    Clôturer l'année
                </button>
            </div>
        </div>
    );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function AcademicYearCard({ year, isPast = false, onEditClick, onCloseClick }: AcademicYearCardProps) {
    if (isPast) return <PastYearCard year={year} />;
    return <ActiveYearCard year={year} onEditClick={onEditClick} onCloseClick={onCloseClick} />;
}
