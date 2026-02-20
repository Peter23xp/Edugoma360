import { Users, BookOpen, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ClassCardProps {
    classData: {
        id: string;
        name: string;
        section: {
            id: string;
            name: string;
        };
        maxStudents: number;
        isActive: boolean;
        _count: {
            enrollments: number;
        };
    };
    onEdit: (id: string) => void;
    onAssignTeachers: (id: string) => void;
    onArchive: (id: string) => void;
}

export default function ClassCard({
    classData,
    onEdit,
    onAssignTeachers,
    onArchive,
}: ClassCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
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

    const studentCount = classData._count.enrollments;
    const fillPercentage = (studentCount / classData.maxStudents) * 100;

    return (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md 
                        transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-neutral-900">{classData.name}</h3>
                    <p className="text-sm text-neutral-600 mt-0.5">{classData.section.name}</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                            classData.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-neutral-100 text-neutral-600'
                        }`}
                    >
                        {classData.isActive ? 'Actif' : 'Archivé'}
                    </span>

                    {/* Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 hover:bg-neutral-100 rounded transition-colors"
                        >
                            <MoreVertical size={16} className="text-neutral-600" />
                        </button>

                        {showMenu && (
                            <div
                                className="absolute right-0 mt-1 w-48 bg-white rounded-lg 
                                           shadow-lg border border-neutral-200 py-1 z-10"
                            >
                                <button
                                    onClick={() => {
                                        onEdit(classData.id);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 
                                               hover:bg-neutral-50 transition-colors"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => {
                                        onAssignTeachers(classData.id);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 
                                               hover:bg-neutral-50 transition-colors"
                                >
                                    Attribuer cours
                                </button>
                                {classData.isActive && (
                                    <button
                                        onClick={() => {
                                            onArchive(classData.id);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 
                                                   hover:bg-red-50 transition-colors"
                                    >
                                        Archiver
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
                {/* Student Count */}
                <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-neutral-500" />
                    <span className="text-neutral-700">
                        {studentCount} / {classData.maxStudents} élèves
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${
                            fillPercentage >= 90
                                ? 'bg-red-500'
                                : fillPercentage >= 75
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-neutral-200">
                <button
                    onClick={() => onAssignTeachers(classData.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                               text-sm font-medium text-primary border border-primary 
                               rounded-lg hover:bg-primary/5 transition-colors"
                >
                    <BookOpen size={14} />
                    Attribuer cours
                </button>
            </div>
        </div>
    );
}
