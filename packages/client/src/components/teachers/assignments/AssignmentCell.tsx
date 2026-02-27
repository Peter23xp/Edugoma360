import React from 'react';
import { Plus, MoreVertical, AlertTriangle, AlertCircle } from 'lucide-react';

interface AssignmentCellProps {
    classId: string;
    subjectId: string;
    assignment?: any;
    onAssign: (classId: string, subjectId: string) => void;
    onEdit: (assignment: any) => void;
    onRemove: (id: string) => void;
    isHighlighted?: boolean;
}

export const AssignmentCell: React.FC<AssignmentCellProps> = ({
    classId,
    subjectId,
    assignment,
    onAssign,
    onEdit,
    onRemove,
    isHighlighted
}) => {
    // État 1: VIDE
    if (!assignment) {
        return (
            <div
                onClick={() => onAssign(classId, subjectId)}
                className={`w-full h-full min-h-[80px] flex flex-col items-center justify-center border border-slate-50 cursor-pointer transition-all hover:bg-blue-50/50 group ${isHighlighted ? 'bg-blue-50/20 ring-2 ring-blue-500/20 ring-inset' : 'bg-slate-50/30'}`}
            >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:scale-110 transition-all border border-slate-50 group-hover:border-blue-100 group-hover:shadow-sm">
                    <Plus size={16} />
                </div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2 group-hover:text-blue-600">Assigner</span>
            </div>
        );
    }

    // Handle potential multiple assignments (conflicts handled by logic usually, but show here)
    const isOverloaded = (assignment.volumeHoraire || 0) > 20;

    return (
        <div className={`w-full h-full min-h-[80px] p-3 flex flex-col justify-between border-2 transition-all relative group ${isOverloaded ? 'bg-orange-50 border-orange-100 hover:border-orange-200' : 'bg-green-50/50 border-green-100 hover:border-green-200'} ${isHighlighted ? 'ring-2 ring-blue-600 ring-inset z-10' : ''}`}>
            <div className="flex justify-between items-start gap-1">
                <div className="flex-1">
                    <p className={`text-[10px] font-black uppercase leading-tight ${isOverloaded ? 'text-orange-900' : 'text-green-900'}`}>
                        {assignment.teacherName}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className={`text-[9px] font-bold ${isOverloaded ? 'text-orange-600' : 'text-green-600'}`}>
                            {assignment.volumeHoraire}h/sem
                        </span>
                        {isOverloaded && <AlertCircle size={10} className="text-orange-500" />}
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(assignment); }}
                        className={`p-1 rounded-md transition-colors ${isOverloaded ? 'hover:bg-orange-200 text-orange-400' : 'hover:bg-green-200 text-green-400'}`}
                    >
                        <MoreVertical size={14} />
                    </button>
                    {isHighlighted && <div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-bl-lg" />}
                </div>
            </div>

            {/* Menu Contextuel Simple / Hover Actions */}
            <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                    onClick={() => onEdit(assignment)}
                    className="flex-1 py-1 px-2 bg-slate-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-colors"
                >
                    Modifier
                </button>
                <button
                    onClick={() => onRemove(assignment.id)}
                    className="p-1 px-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                    <Plus size={14} className="rotate-45" />
                </button>
            </div>
        </div>
    );
};
