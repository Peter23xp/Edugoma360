import React from 'react';
import { AssignmentCell } from './AssignmentCell';
import { Layers, BookOpen, Clock, AlertTriangle, UserCheck } from 'lucide-react';

interface AssignmentMatrixProps {
    data: {
        classes: any[];
        subjects: any[];
        assignments: any[];
        stats: any;
    };
    onAssign: (classId: string, subjectId: string) => void;
    onEdit: (assignment: any) => void;
    onRemove: (id: string) => void;
    filters: any;
}

export const AssignmentMatrix: React.FC<AssignmentMatrixProps> = ({
    data,
    onAssign,
    onEdit,
    onRemove,
    filters
}) => {
    const { classes, subjects, assignments, stats } = data;

    // Mapping for fast lookup
    const assignmentMap = new Map();
    assignments.forEach(a => {
        const key = `${a.classId}-${a.subjectId}`;
        assignmentMap.set(key, a);
    });

    const isTeacherMatched = (assignment: any) => {
        if (!filters.searchTeacher || !assignment) return false;
        return assignment.teacherName.toLowerCase().includes(filters.searchTeacher.toLowerCase());
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* STATS HEADER */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border-2 border-blue-100 p-4 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-blue-600/10 text-blue-600 rounded-2xl"><Layers size={21} /></div>
                    <div>
                        <p className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest leading-none mb-1">Total Classes</p>
                        <p className="text-xl font-black text-blue-900 leading-none">{classes.length}</p>
                    </div>
                </div>
                <div className="bg-green-50 border-2 border-green-100 p-4 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-green-600/10 text-green-600 rounded-2xl"><UserCheck size={21} /></div>
                    <div>
                        <p className="text-[10px] font-black text-green-900/40 uppercase tracking-widest leading-none mb-1">Affectations</p>
                        <p className="text-xl font-black text-green-900 leading-none">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-orange-50 border-2 border-orange-100 p-4 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-orange-600/10 text-orange-600 rounded-2xl"><Clock size={21} /></div>
                    <div>
                        <p className="text-[10px] font-black text-orange-900/40 uppercase tracking-widest leading-none mb-1">Surcharges</p>
                        <p className="text-xl font-black text-orange-900 leading-none">{stats.overloaded}</p>
                    </div>
                </div>
                <div className="bg-red-50 border-2 border-red-100 p-4 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-red-600/10 text-red-600 rounded-2xl"><AlertTriangle size={21} /></div>
                    <div>
                        <p className="text-[10px] font-black text-red-900/40 uppercase tracking-widest leading-none mb-1">Conflits</p>
                        <p className="text-xl font-black text-red-900 leading-none">{stats.conflicts}</p>
                    </div>
                </div>
            </div>

            {/* MATRICE SCROLLABLE */}
            <div className="overflow-hidden bg-white rounded-3xl border-2 border-slate-50 shadow-sm relative">
                <div className="overflow-x-auto overflow-y-auto max-h-[80vh] custom-scrollbar">
                    <table className="min-w-full border-collapse table-fixed">
                        <thead className="sticky top-0 z-20 bg-white">
                            <tr>
                                {/* Coin haut gauche (Classe) */}
                                <th className="w-48 sticky left-0 z-30 bg-white border-b-2 border-r-2 border-slate-50 p-4 font-black text-[11px] text-slate-400 uppercase tracking-widest text-left shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                    Classe ↔ Matière
                                </th>
                                {/* Matières Header */}
                                {subjects.map(subj => (
                                    <th key={subj.id} className="w-40 bg-white border-b-2 border-slate-50 p-4 font-black text-[11px] text-slate-700 uppercase tracking-tight text-center leading-tight">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-slate-900 whitespace-nowrap">{subj.abbreviation}</span>
                                            <span className="text-[9px] text-slate-400 opacity-60 font-bold whitespace-nowrap">{subj.name.substring(0, 15)}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map(cls => (
                                <tr key={cls.id}>
                                    {/* Colonne de gauche (Nom Classe) */}
                                    <td className="sticky left-0 z-10 bg-white border-r-2 border-b-2 border-slate-50 p-6 font-black text-sm text-slate-800 uppercase tracking-tight shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                        <div className="flex flex-col">
                                            {cls.name}
                                            <span className="text-[9px] text-slate-400 font-bold opacity-70 tracking-widest mt-1 uppercase">{cls.section.name}</span>
                                        </div>
                                    </td>
                                    {/* Cellules Affectation */}
                                    {subjects.map(subj => {
                                        const assignment = assignmentMap.get(`${cls.id}-${subj.id}`);
                                        const isHighlighted = isTeacherMatched(assignment);
                                        // Check if subject applies to this class's section
                                        const isRelevant = subj.sections.includes(cls.sectionId);

                                        return (
                                            <td key={`${cls.id}-${subj.id}`} className={`border-r-2 border-b-2 border-slate-50 min-w-40 min-h-[80px] p-0 ${!isRelevant ? 'bg-slate-50/50 opacity-20 cursor-not-allowed' : ''}`}>
                                                {isRelevant ? (
                                                    <AssignmentCell
                                                        classId={cls.id}
                                                        subjectId={subj.id}
                                                        assignment={assignment}
                                                        onAssign={onAssign}
                                                        onEdit={onEdit}
                                                        onRemove={onRemove}
                                                        isHighlighted={isHighlighted}
                                                    />
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* LÉGENDE */}
            <div className="flex flex-wrap items-center gap-8 px-6 py-4 bg-slate-50/50 rounded-2xl border-2 border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-green-50 border border-green-200"></div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Assigné</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-orange-50 border border-orange-200"></div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Surcharge (&gt;20h)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-red-50 border border-red-200"></div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Conflit</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-slate-100/50 border border-slate-100"></div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Vide</span>
                </div>
            </div>
        </div>
    );
};
