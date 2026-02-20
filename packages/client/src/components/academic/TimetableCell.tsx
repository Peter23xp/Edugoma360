import { MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TimetablePeriod {
    id: string;
    subject: {
        name: string;
        abbreviation: string;
    };
    class: {
        name: string;
        section: {
            code: string;
        };
    };
    teacher?: {
        nom: string;
        prenom: string | null;
    };
}

interface TimetableCellProps {
    period: TimetablePeriod | null;
    onEdit?: (period: TimetablePeriod) => void;
    showTeacher?: boolean;
    canEdit?: boolean;
}

// Couleurs selon section
const SECTION_COLORS: Record<string, string> = {
    TC: 'bg-blue-100 text-blue-700 border-blue-300',
    Sc: 'bg-green-100 text-green-700 border-green-300',
    HCG: 'bg-orange-100 text-orange-700 border-orange-300',
    Péd: 'bg-purple-100 text-purple-700 border-purple-300',
    Peda: 'bg-purple-100 text-purple-700 border-purple-300',
    HT: 'bg-red-100 text-red-700 border-red-300',
    Lit: 'bg-indigo-100 text-indigo-700 border-indigo-300',
};

export default function TimetableCell({
    period,
    onEdit,
    showTeacher = false,
    canEdit = false,
}: TimetableCellProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    // Cellule vide
    if (!period) {
        return (
            <div className="h-24 border border-neutral-200 bg-neutral-50 flex items-center 
                            justify-center">
                <span className="text-sm text-neutral-400 font-medium">LIBRE</span>
            </div>
        );
    }

    // Déterminer la couleur selon la section
    const sectionCode = period.class.section.code.substring(0, 3);
    const colorClass = SECTION_COLORS[sectionCode] || 'bg-neutral-100 text-neutral-700 border-neutral-300';

    return (
        <div className={`h-24 border-2 ${colorClass} p-3 relative hover:shadow-md transition-shadow`}>
            {/* Menu */}
            {canEdit && onEdit && (
                <div className="absolute top-2 right-2" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 hover:bg-white/50 rounded transition-colors"
                    >
                        <MoreVertical size={14} />
                    </button>

                    {showMenu && (
                        <div
                            className="absolute right-0 mt-1 w-32 bg-white rounded-lg 
                                       shadow-lg border border-neutral-200 py-1 z-10"
                        >
                            <button
                                onClick={() => {
                                    onEdit(period);
                                    setShowMenu(false);
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs text-neutral-700 
                                           hover:bg-neutral-50 transition-colors"
                            >
                                Modifier
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="space-y-1">
                <p className="text-sm font-bold leading-tight">{period.subject.abbreviation}</p>
                <p className="text-xs font-medium">{period.class.name}</p>
                {showTeacher && period.teacher && (
                    <p className="text-xs opacity-75">
                        {period.teacher.nom} {period.teacher.prenom || ''}
                    </p>
                )}
            </div>
        </div>
    );
}
