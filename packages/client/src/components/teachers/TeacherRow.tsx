import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye,
    Edit,
    Archive,
    MoreVertical,
} from 'lucide-react';

interface TeacherRowProps {
    teacher: any;
    isSelected: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onAction: (action: 'view' | 'edit' | 'archive', id: string) => void;
}

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
    const idx = (nom || 'A').charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx] || AVATAR_COLORS[0];
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
    ACTIF: {
        label: 'Actif',
        className: 'bg-success-bg text-success',
    },
    EN_CONGE: {
        label: 'En congé',
        className: 'bg-warning-bg text-warning',
    },
    SUSPENDU: {
        label: 'Suspendu',
        className: 'bg-danger-bg text-danger',
    },
    ARCHIVE: {
        label: 'Archivé',
        className: 'bg-neutral-100 text-neutral-500',
    },
};

export function TeacherRow({ teacher, isSelected, onSelect, onAction }: TeacherRowProps) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    const initials = `${(teacher.nom || '').charAt(0)}${(teacher.postNom || '').charAt(0)}`.toUpperCase();
    const statusCfg = STATUS_CONFIG[teacher.statut] ?? STATUS_CONFIG.ACTIF;
    const isArchived = teacher.statut === 'ARCHIVE';
    const subjects = teacher.subjects?.map((s: any) => s.name).join(', ') || 'Aucune matière';
    const classesCount = new Set(teacher.assignments?.map((a: any) => a.classId)).size;

    const handleRowClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-no-navigate]')) return;
        navigate(`/teachers/${teacher.id}`);
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
                            onSelect(teacher.id, e.target.checked);
                        }}
                        className="w-4 h-4 rounded border-neutral-300 text-primary 
                                   focus:ring-primary/20 cursor-pointer transition-colors"
                    />
                </div>
            </td>

            {/* Photo / Avatar */}
            <td className="w-14 px-2 py-3">
                {teacher.photoUrl ? (
                    <img
                        src={teacher.photoUrl}
                        alt={`${teacher.nom} ${teacher.postNom}`}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                ) : (
                    <div
                        className={`
                            w-9 h-9 rounded-full flex items-center justify-center 
                            text-white text-xs font-bold shadow-sm
                            ${getAvatarColor(teacher.nom)}
                        `}
                    >
                        {initials}
                    </div>
                )}
            </td>

            {/* Matricule */}
            <td className="px-3 py-3">
                <span className="font-mono text-xs text-primary/80 bg-primary/5 px-2 py-0.5 rounded">
                    {teacher.matricule}
                </span>
            </td>

            {/* Nom Complet */}
            <td className="px-3 py-3 min-w-[200px]">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-900 leading-tight">
                        <span className="uppercase">{teacher.nom}</span>{' '}
                        <span className="uppercase">{teacher.postNom}</span>
                        {teacher.prenom && (
                            <span className="font-normal text-neutral-700 capitalize"> {teacher.prenom}</span>
                        )}
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5 md:hidden truncate max-w-[150px]">
                        {subjects}
                    </span>
                </div>
            </td>

            {/* Matières */}
            <td className="px-3 py-3 hidden md:table-cell max-w-[200px]">
                <span className="text-xs text-neutral-500 truncate block">
                    {subjects}
                </span>
            </td>

            {/* Classes (count) */}
            <td className="px-3 py-3 text-center hidden sm:table-cell">
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-info-bg text-info text-xs font-semibold">
                    {classesCount} {classesCount > 1 ? 'classes' : 'classe'}
                </span>
            </td>

            {/* Statut */}
            <td className="px-3 py-3 hidden sm:table-cell">
                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}
                >
                    {statusCfg.label}
                </span>
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
                                    onAction('view', teacher.id);
                                    setMenuOpen(false);
                                }}
                            />
                            <MenuItem
                                icon={<Edit size={14} />}
                                label="Modifier"
                                onClick={() => {
                                    onAction('edit', teacher.id);
                                    setMenuOpen(false);
                                }}
                            />
                            <div className="my-1 border-t border-neutral-100" />
                            <MenuItem
                                icon={<Archive size={14} />}
                                label="Archiver"
                                onClick={() => {
                                    onAction('archive', teacher.id);
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

// —— Sub-component: Menu Item ——
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
