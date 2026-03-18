import { useState } from 'react';
import { cn } from '../../lib/utils';
import { CalendarDays } from 'lucide-react';

interface ReportFiltersProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (v: string) => void;
    onEndDateChange: (v: string) => void;
}

type PeriodPreset = { label: string; key: string };

const PERIODS: PeriodPreset[] = [
    { key: 'today', label: "Aujourd'hui" },
    { key: 'week', label: 'Cette semaine' },
    { key: 'month', label: 'Ce mois' },
    { key: 'lastMonth', label: 'Mois dernier' },
    { key: 'term', label: 'Ce trimestre' },
    { key: 'year', label: 'Année scolaire' },
    { key: 'custom', label: 'Personnalisé' },
];

function getPresetDates(key: string): { start: string; end: string } {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    switch (key) {
        case 'today': return { start: today, end: today };
        case 'week': {
            const day = now.getDay();
            const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
            return { start: fmt(mon), end: today };
        }
        case 'month': return { start: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), end: today };
        case 'lastMonth': {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return { start: fmt(start), end: fmt(end) };
        }
        case 'term': return { start: fmt(new Date(now.getFullYear(), 0, 1)), end: today };
        case 'year': return { start: `${now.getFullYear() - 1}-09-01`, end: today };
        default: return { start: today, end: today };
    }
}

export default function ReportFilters({ startDate, endDate, onStartDateChange, onEndDateChange }: ReportFiltersProps) {
    const [activePreset, setActivePreset] = useState('month');

    const handlePreset = (key: string) => {
        if (key === 'custom') {
            setActivePreset('custom');
            return;
        }
        const { start, end } = getPresetDates(key);
        setActivePreset(key);
        onStartDateChange(start);
        onEndDateChange(end);
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
                {PERIODS.map((p) => (
                    <button
                        key={p.key}
                        onClick={() => handlePreset(p.key)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all",
                            activePreset === p.key
                                ? "bg-primary text-white shadow-sm"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {activePreset === 'custom' && (
                <div className="flex items-center gap-2 text-sm">
                    <CalendarDays size={16} className="text-neutral-400" />
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => onStartDateChange(e.target.value)}
                        className="border border-neutral-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <span className="text-neutral-400">→</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => onEndDateChange(e.target.value)}
                        className="border border-neutral-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            )}
        </div>
    );
}
