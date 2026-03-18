/**
 * ClassSelector — Dropdown for selecting a class with student count
 */
import { School } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ClassOption {
    id: string;
    name: string;
    studentCount?: number;
    currentStudents?: number;
    maxStudents?: number;
}

interface ClassSelectorProps {
    classes: ClassOption[];
    value: string;
    onChange: (classId: string) => void;
    disabled?: boolean;
    className?: string;
}

export default function ClassSelector({
    classes,
    value,
    onChange,
    disabled,
    className,
}: ClassSelectorProps) {
    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <label className="input-label flex items-center gap-1">
                <School size={13} className="text-neutral-500" />
                Classe
            </label>
            <div className="relative">
                <select
                    id="classSelector"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className={cn(
                        'w-full appearance-none border border-neutral-300 rounded-lg px-3 py-2.5',
                        'text-sm bg-white text-neutral-800 font-medium',
                        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'pr-8 transition-colors'
                    )}
                >
                    <option value="">Sélectionner une classe…</option>
                    {classes.map((c) => {
                        const count = c.studentCount ?? c.currentStudents ?? 0;
                        return (
                            <option key={c.id} value={c.id}>
                                🏫 {c.name}
                                {count > 0 ? ` (${count} élèves)` : ''}
                            </option>
                        );
                    })}
                </select>
                {/* Custom chevron */}
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                    <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
