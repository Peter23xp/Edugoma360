import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye,
    Edit,
    CreditCard,
    ArrowUpRight,
    Archive,
    MoreVertical,
    AlertTriangle,
} from 'lucide-react';
import { formatStudentName, getInitials } from '../../lib/utils';
import type { StudentListItem } from '../../hooks/useStudents';

interface StudentRowProps {
    student: StudentListItem;
    isSelected: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onAction: (action: 'view' | 'edit' | 'card' | 'transfer' | 'archive', id: string) => void;
}

// Couleurs de fond pour les avatars selon l'initiale
const AVATAR_COLORS = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-pink-500',
];

function getAvatarColor(nom: string): string {
    const idx = nom.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
    NOUVEAU: {
        label: 'Actif',
        className: 'bg-success-bg text-success',
    },
    REDOUBLANT: {
        label: 'Redoublant',
        className: 'bg-warning-bg text-warning',
        icon: <span className="text-[10px] font-bold">R</span>,
    },
    TRANSFERE: {
        label: 'Transféré',
        className: 'bg-info-bg text-info',
    },
    DEPLACE: {
        label: 'Déplacé',
        className: 'bg-purple-100 text-purple-700',
    },
    ARCHIVE: {
        label: 'Archivé',
        className: 'bg-neutral-100 text-neutral-500',
    },
    REFUGIE: {
        label: 'Réfugié',
        className: 'bg-blue-50 text-blue-700',
    },
};

export default function StudentRow({ student, isSelected, onSelect, onAction }: StudentRowProps) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    const initials = getInitials(student.nom, student.postNom);
    const fullName = formatStudentName(student.nom, student.postNom, student.prenom);
    const statusCfg = STATUS_CONFIG[student.statut] ?? STATUS_CONFIG.NOUVEAU;
    const isArchived = student.statut === 'ARCHIVE';
    // TODO: check payment status from backend — for now simulate
    const hasPaymentDelay = false;

    const handleRowClick = (e: React.MouseEvent) => {
        // Don't navigate if click is on checkbox, menu, or actions
        const target = e.target as HTMLElement;
        if (target.closest('[data-no-navigate]')) return;
        navigate(`/students/${student.id}`);
    };

    return (
        <tr
            onClick={handleRowClick}
            className={`
                group transition-all duration-150 cursor-pointer
                ${isArchived ? 'opacity-50' : ''}
                ${isSelected ? 'bg-primary/5 hover:bg-primary/8' : 'hover:bg-neutral-50'}
            `}
        >
            {/* Checkbox */}
            <td className="w-12 px-3 py-3" data-no-navigate>
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                            e.stopPropagation();
                            onSelect(student.id, e.target.checked);
                        }}
                        className="w-4 h-4 rounded border-neutral-300 text-primary 
                                   focus:ring-primary/20 cursor-pointer transition-colors"
                    />
                </div>
            </td>

            {/* Photo / Avatar */}
            <td className="w-14 px-2 py-3">
                {student.photoUrl ? (
                    <img
                        src={student.photoUrl}
                        alt={fullName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                ) : (
                    <div
                        className={`
                            w-9 h-9 rounded-full flex items-center justify-center 
                            text-white text-xs font-bold shadow-sm
                            ${getAvatarColor(student.nom)}
                        `}
                    >
                        {initials}
                    </div>
                )}
            </td>

            {/* Matricule */}
            <td className="px-3 py-3">
                <span className="font-mono text-xs text-primary/80 bg-primary/5 px-2 py-0.5 rounded">
                    {student.matricule}
                </span>
            </td>

            {/* Nom Complet */}
            <td className="px-3 py-3 min-w-[200px]">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-900 leading-tight">
                        <span className="uppercase">{student.nom}</span>{' '}
                        <span className="uppercase">{student.postNom}</span>
                        {student.prenom && (
                            <span className="font-normal text-neutral-700"> {student.prenom}</span>
                        )}
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5 md:hidden">
                        {student.className ?? '—'}
                    </span>
                </div>
            </td>

            {/* Classe */}
            <td className="px-3 py-3 hidden md:table-cell">
                {student.className ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-bg text-success">
                        {student.className}
                    </span>
                ) : (
                    <span className="text-xs text-neutral-400">—</span>
                )}
            </td>

            {/* Statut */}
            <td className="px-3 py-3 hidden sm:table-cell">
                <div className="flex items-center gap-1.5">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}
                    >
                        {statusCfg.icon}
                        {statusCfg.label}
                    </span>
                    {hasPaymentDelay && (
                        <span className="text-warning" title="Paiement en retard">
                            <AlertTriangle size={13} />
                        </span>
                    )}
                </div>
            </td>

            {/* Actions menu */}
            <td className="w-12 px-2 py-3" data-no-navigate>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(!menuOpen);
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 
                                   hover:bg-neutral-100 transition-colors opacity-0 group-hover:opacity-100
                                   focus:opacity-100"
                        aria-label="Actions"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {menuOpen && (
                        <div
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl 
                                       shadow-lg border border-neutral-200 py-1.5 z-50 animate-fade-in"
                        >
                            <MenuItem
                                icon={<Eye size={14} />}
                                label="Voir la fiche"
                                onClick={() => {
                                    onAction('view', student.id);
                                    setMenuOpen(false);
                                }}
                            />
                            <MenuItem
                                icon={<Edit size={14} />}
                                label="Modifier"
                                onClick={() => {
                                    onAction('edit', student.id);
                                    setMenuOpen(false);
                                }}
                            />
                            <MenuItem
                                icon={<CreditCard size={14} />}
                                label="Imprimer carte"
                                onClick={() => {
                                    onAction('card', student.id);
                                    setMenuOpen(false);
                                }}
                            />
                            <div className="my-1 border-t border-neutral-100" />
                            <MenuItem
                                icon={<ArrowUpRight size={14} />}
                                label="Transférer"
                                onClick={() => {
                                    onAction('transfer', student.id);
                                    setMenuOpen(false);
                                }}
                            />
                            <MenuItem
                                icon={<Archive size={14} />}
                                label="Archiver"
                                onClick={() => {
                                    onAction('archive', student.id);
                                    setMenuOpen(false);
                                }}
                                variant="danger"
                            />
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}

// ── Sub-component: Menu Item ──
function MenuItem({
    icon,
    label,
    onClick,
    variant = 'default',
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
}) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`
                w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors
                ${variant === 'danger'
                    ? 'text-danger hover:bg-danger-bg'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }
            `}
        >
            {icon}
            {label}
        </button>
    );
}
