import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import { ClassItem } from '../../hooks/useClasses';
import { useState } from 'react';

interface ClassCardProps {
    classItem: ClassItem;
    onEdit: (id: string) => void;
    onViewDetails: (id: string) => void;
    onAssignTeachers: (id: string) => void;
    onViewTimetable: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function ClassCard({ classItem, onEdit, onViewDetails, onAssignTeachers, onViewTimetable, onDelete }: ClassCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const c = classItem;
    const pct = c.maxStudents > 0 ? Math.round((c.currentStudents / c.maxStudents) * 100) : 0;
    
    // Determine the indicator for capacity
    let capacityIndicator = '🔴';
    if (pct >= 80) capacityIndicator = '🟢';
    else if (pct >= 50) capacityIndicator = '🟡';

    return (
        <div className="bg-white border border-neutral-300/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
            
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex items-start justify-between px-5 pt-4 pb-2">
                <div>
                    <h3 className="text-xl font-bold text-neutral-900 leading-tight">{c.name}</h3>
                </div>
                
                <div className="flex items-center gap-2 relative">
                    <button 
                        onClick={() => onViewDetails(c.id)}
                        className="px-3 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
                    >
                        Gérer
                    </button>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-1 px-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                    >
                        <MoreVertical size={18} />
                    </button>
                    {menuOpen && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                            <div className="absolute right-0 top-8 z-40 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 w-36">
                                <button
                                    onClick={() => { setMenuOpen(false); onEdit(c.id); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                >
                                    <Edit2 size={14} /> Modifier
                                </button>
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        if (window.confirm(`Archiver la classe ${c.name} ?`)) onDelete(c.id);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-light transition-colors"
                                    disabled={c.currentStudents > 0}
                                >
                                    <Trash2 size={14} /> Archiver
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Info Block ────────────────────────────────────────── */}
            <div className="px-5 pb-4 space-y-3">
                
                {/* Section & Room */}
                <p className="text-sm font-medium text-neutral-600">
                    {c.section.year === 1 ? '1ère' : `${c.section.year}ème`} année {c.section.name} 
                    {c.room && <> • Salle {c.room}</>}
                </p>

                {/* Effectif */}
                <p className="text-sm font-medium text-neutral-700">
                    Effectif: {c.currentStudents}/{c.maxStudents} élèves • {capacityIndicator} {pct}%
                </p>

                <div className="pt-2 space-y-2">
                    {/* Titulaire */}
                    <p className="text-sm text-neutral-700">
                        👨‍🏫 Titulaire: <span className="font-medium text-neutral-900">
                            {c.titulaire ? `${c.titulaire.nom} ${c.titulaire.prenom || ''}` : 'Non défini'}
                        </span>
                    </p>

                    {/* Matières */}
                    <p className="text-sm text-neutral-700">
                        📚 Matières: <span className="font-medium text-neutral-900">{c.subjectsAssigned}/{c.totalSubjects} attribuées</span>
                    </p>

                    {/* Emploi du temps */}
                    <p className="text-sm text-neutral-700">
                        📅 Emploi du temps: {c.hasTimetable 
                            ? <span className="font-medium text-primary">✅ Généré le —</span>
                            : <span className="font-medium text-warning">❌ Non généré</span>
                        }
                    </p>
                </div>
            </div>

            {/* ── Actions Bottom ─────────────────────────────────────── */}
            <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button 
                    onClick={() => onViewDetails(c.id)}
                    className="text-xs font-bold text-neutral-700 hover:text-primary transition-colors"
                >
                    Voir détails
                </button>
                <button 
                    onClick={() => onAssignTeachers(c.id)}
                    className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                >
                    Attribution enseignants
                </button>
                <button 
                    onClick={() => onViewTimetable(c.id)}
                    className="text-xs font-bold text-neutral-700 hover:text-primary transition-colors"
                >
                    Emploi du temps
                </button>
            </div>

        </div>
    );
}
