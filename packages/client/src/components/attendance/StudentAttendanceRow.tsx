/**
 * StudentAttendanceRow — Single row in the roll call grid
 * Responsive: compact layout on mobile devices
 */
import { MessageSquarePlus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatStudentName, getInitials } from '../../lib/utils';
import type { AttendanceStatus } from '../../hooks/useAttendance';

export interface StudentAttendanceRowProps {
    index: number;
    student: {
        id: string;
        matricule: string;
        nom: string;
        postNom: string;
        prenom?: string;
        photoUrl?: string;
    };
    currentStatus?: AttendanceStatus;
    hasRemark: boolean;
    isSelected: boolean;    // keyboard-focused row
    isLocked?: boolean;
    onStatusChange: (studentId: string, status: AttendanceStatus) => void;
    onAddRemark: (studentId: string) => void;
}

const STATUS_CONFIG = {
    PRESENT: {
        label: 'P',
        ariaLabel: 'Présent',
        active: 'bg-green-600 text-white shadow-md ring-2 ring-green-300',
        inactive: 'bg-neutral-100 text-neutral-600 hover:bg-green-50 hover:text-green-700',
    },
    ABSENT: {
        label: 'A',
        ariaLabel: 'Absent',
        active: 'bg-red-600 text-white shadow-md ring-2 ring-red-300',
        inactive: 'bg-neutral-100 text-neutral-600 hover:bg-red-50 hover:text-red-700',
    },
    RETARD: {
        label: 'R',
        ariaLabel: 'En retard',
        active: 'bg-orange-500 text-white shadow-md ring-2 ring-orange-300',
        inactive: 'bg-neutral-100 text-neutral-600 hover:bg-orange-50 hover:text-orange-700',
    },
} as const;

export default function StudentAttendanceRow({
    index,
    student,
    currentStatus,
    hasRemark,
    isSelected,
    isLocked,
    onStatusChange,
    onAddRemark,
}: StudentAttendanceRowProps) {
    const fullName = formatStudentName(student.nom, student.postNom, student.prenom);
    const initials = getInitials(student.nom, student.postNom);
    const needsRemark = currentStatus === 'ABSENT' || currentStatus === 'RETARD';

    return (
        <tr
            id={`row-${student.id}`}
            data-student-id={student.id}
            className={cn(
                'group border-b border-neutral-100 transition-colors duration-150',
                isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-neutral-50',
                currentStatus === 'ABSENT' && 'bg-red-50/40',
                currentStatus === 'RETARD' && 'bg-orange-50/40',
            )}
        >
            {/* N° */}
            <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-xs text-neutral-400 font-mono w-8 sm:w-10 text-center">
                {index}
            </td>

            {/* Photo / Avatar — hidden on small screens */}
            <td className="px-1.5 sm:px-2 py-1.5 sm:py-2 w-8 sm:w-10 hidden sm:table-cell">
                {student.photoUrl ? (
                    <img
                        src={student.photoUrl}
                        alt={fullName}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-neutral-200"
                    />
                ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] sm:text-xs select-none">
                        {initials}
                    </div>
                )}
            </td>

            {/* Matricule — hidden on mobile and tablet */}
            <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-xs text-neutral-500 font-mono hidden md:table-cell">
                {student.matricule}
            </td>

            {/* Nom */}
            <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-neutral-800 min-w-0 max-w-[120px] sm:max-w-none">
                <span className="block truncate">{fullName}</span>
            </td>

            {/* Statut */}
            <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                <div className="flex items-center gap-1 sm:gap-1.5">
                    {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map((status) => {
                        const cfg = STATUS_CONFIG[status];
                        const isActive = currentStatus === status;
                        return (
                            <button
                                key={status}
                                type="button"
                                id={`btn-${status.toLowerCase()}-${student.id}`}
                                aria-label={cfg.ariaLabel}
                                aria-pressed={isActive}
                                disabled={isLocked}
                                onClick={() => onStatusChange(student.id, status)}
                                className={cn(
                                    'w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg text-xs sm:text-sm font-bold transition-all duration-200',
                                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    isActive ? cfg.active : cfg.inactive
                                )}
                            >
                                {cfg.label}
                            </button>
                        );
                    })}

                    {/* Remark button — visible when ABSENT or RETARD */}
                    {needsRemark && !isLocked && (
                        <button
                            type="button"
                            id={`btn-remark-${student.id}`}
                            aria-label="Ajouter une remarque"
                            onClick={() => onAddRemark(student.id)}
                            className={cn(
                                'w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg flex items-center justify-center transition-all duration-200',
                                hasRemark
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-neutral-100 text-neutral-500 hover:bg-primary/10 hover:text-primary'
                            )}
                        >
                            <MessageSquarePlus size={12} className="sm:hidden" />
                            <MessageSquarePlus size={14} className="hidden sm:block" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

