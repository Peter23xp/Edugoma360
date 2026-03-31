import { FC } from 'react';
import { AssignmentCell } from './AssignmentCell';
import { Layers, Clock, AlertTriangle, UserCheck, Plus, Edit2, Trash2 } from 'lucide-react';

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

export const AssignmentMatrix: FC<AssignmentMatrixProps> = ({
    data,
    onAssign,
    onEdit,
    onRemove,
    filters
}) => {
    const { classes, subjects, assignments, stats } = data;

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
        <div className="space-y-4">

            {/* STATS HEADER */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total classes', value: classes.length, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Affectations', value: stats.total, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Surcharges', value: stats.overloaded, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Conflits', value: stats.conflicts, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((card) => (
                    <div key={card.label} className="bg-white p-4 rounded-xl border border-neutral-300/50 flex items-center gap-3 shadow-sm">
                        <div className={`p-2.5 ${card.bg} ${card.color} rounded-lg flex-shrink-0`}>
                            <card.icon size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 font-medium">{card.label}</p>
                            <p className="text-lg font-bold text-neutral-900 tabular-nums">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* MATRICE DESKTOP (VUE TABLEAU) */}
            <div className="hidden lg:block overflow-hidden bg-white rounded-xl border border-neutral-300/50 shadow-sm">
                <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                    <table className="min-w-full border-collapse table-fixed">
                        <thead className="sticky top-0 z-20 bg-white">
                            <tr className="table-header">
                                <th className="w-48 sticky left-0 z-30 bg-neutral-50 border-b border-r border-neutral-200 px-4 py-3 text-xs font-semibold text-neutral-500 text-left">
                                    Classe ↔ Matière
                                </th>
                                {subjects.map(subj => (
                                    <th key={subj.id} className="w-40 bg-neutral-50 border-b border-neutral-200 px-3 py-3 text-xs font-semibold text-neutral-700 text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-neutral-800 whitespace-nowrap">{subj.abbreviation}</span>
                                            <span className="text-[10px] text-neutral-400 font-normal whitespace-nowrap">{subj.name.substring(0, 15)}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map(cls => (
                                <tr key={cls.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="sticky left-0 z-10 bg-white border-r border-b border-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-800">
                                        <div className="flex flex-col">
                                            {cls.name}
                                            <span className="text-[10px] text-neutral-400 font-normal mt-0.5">{cls.section.name}</span>
                                        </div>
                                    </td>
                                    {subjects.map(subj => {
                                        const assignment = assignmentMap.get(`${cls.id}-${subj.id}`);
                                        const isHighlighted = isTeacherMatched(assignment);
                                        const isRelevant = subj.sections.includes(cls.sectionId);

                                        return (
                                            <td key={`${cls.id}-${subj.id}`} className={`border-r border-b border-neutral-100 min-w-40 min-h-[70px] p-0 ${!isRelevant ? 'bg-neutral-50/50 opacity-20 cursor-not-allowed' : ''}`}>
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

            {/* VUE CARTE MOBILE */}
            <div className="lg:hidden space-y-4">
                {classes.map(cls => (
                    <div key={cls.id} className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden shadow-sm">
                        <div className="bg-neutral-50 p-4 border-b border-neutral-200 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-neutral-900 text-base">{cls.name}</h3>
                                <span className="text-xs font-medium text-neutral-500">{cls.section.name}</span>
                            </div>
                        </div>
                        <div className="p-0 divide-y divide-neutral-100">
                            {subjects.filter(s => s.sections.includes(cls.sectionId)).map(subj => {
                                const assignment = assignmentMap.get(`${cls.id}-${subj.id}`);
                                const isHighlighted = isTeacherMatched(assignment);
                                const isOverloaded = assignment && (assignment.volumeHoraire || 0) > 20;

                                return (
                                    <div key={subj.id} className={`p-4 flex justify-between items-center transition-colors ${isHighlighted ? 'bg-blue-50/30' : 'hover:bg-neutral-50/50'}`}>
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-neutral-800">{subj.abbreviation}</span>
                                                <span className="text-xs text-neutral-500 truncate">{subj.name}</span>
                                            </div>
                                            {assignment ? (
                                                <div className="mt-1.5 flex flex-col gap-0.5">
                                                    <p className={`text-sm font-semibold ${isOverloaded ? 'text-amber-700' : 'text-emerald-700'}`}>
                                                        {assignment.teacherName}
                                                        {isOverloaded && <AlertTriangle size={12} className="inline ml-1 mb-0.5 text-amber-500" />}
                                                    </p>
                                                    <span className="text-xs font-medium text-neutral-500">{assignment.volumeHoraire} h/semaine</span>
                                                </div>
                                            ) : (
                                                <p className="mt-1.5 text-xs text-neutral-400 italic">Non assigné</p>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0 flex items-center">
                                            {assignment ? (
                                                <div className="flex items-center gap-1.5">
                                                    <button 
                                                        onClick={() => onEdit(assignment)}
                                                        className="p-2 text-neutral-500 hover:text-primary bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => onRemove(assignment.id)}
                                                        className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => onAssign(cls.id, subj.id)}
                                                    className="flex items-center gap-1.5 bg-neutral-100 hover:bg-primary hover:text-white text-neutral-700 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                                                >
                                                    <Plus size={16} />
                                                    Assigner
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* LÉGENDE */}
            <div className="flex flex-wrap items-center gap-6 px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                {[
                    { color: 'bg-emerald-50 border-emerald-200', label: 'Assigné' },
                    { color: 'bg-amber-50 border-amber-200', label: 'Surcharge (>20h)' },
                    { color: 'bg-red-50 border-red-200', label: 'Conflit' },
                    { color: 'bg-neutral-100 border-neutral-200', label: 'Vide' },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded border ${item.color}`}></div>
                        <span className="text-xs text-neutral-600">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
