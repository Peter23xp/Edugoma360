import React from 'react';
import { Plus, MoreVertical, AlertCircle } from 'lucide-react';

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
    // État VIDE
    if (!assignment) {
        return (
            <div
                onClick={() => onAssign(classId, subjectId)}
                className={`w-full h-full min-h-[70px] flex flex-col items-center justify-center 
                           cursor-pointer transition-all hover:bg-primary/5 group 
                           ${isHighlighted ? 'bg-blue-50/20 ring-2 ring-primary/20 ring-inset' : 'bg-neutral-50/30'}`}
            >
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-neutral-300 
                               group-hover:text-primary group-hover:scale-110 transition-all 
                               border border-neutral-100 group-hover:border-primary/30 group-hover:shadow-sm">
                    <Plus size={14} />
                </div>
                <span className="text-[10px] text-neutral-400 mt-1.5 group-hover:text-primary font-medium">
                    Assigner
                </span>
            </div>
        );
    }

    const isOverloaded = (assignment.volumeHoraire || 0) > 20;

    return (
        <div className={`w-full h-full min-h-[70px] p-3 flex flex-col justify-between border transition-all relative group 
                        ${isOverloaded ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'} 
                        ${isHighlighted ? 'ring-2 ring-primary ring-inset z-10' : ''}`}>
            <div className="flex justify-between items-start gap-1">
                <div className="flex-1">
                    <p className={`text-xs font-semibold leading-tight ${isOverloaded ? 'text-amber-900' : 'text-emerald-900'}`}>
                        {assignment.teacherName}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className={`text-[10px] font-medium ${isOverloaded ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {assignment.volumeHoraire}h/sem
                        </span>
                        {isOverloaded && <AlertCircle size={10} className="text-amber-500" />}
                    </div>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(assignment); }}
                    className={`p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 
                               ${isOverloaded ? 'hover:bg-amber-200 text-amber-400' : 'hover:bg-emerald-200 text-emerald-400'}`}
                >
                    <MoreVertical size={14} />
                </button>
                {isHighlighted && <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-bl-lg" />}
            </div>

            {/* Hover actions */}
            <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity 
                           flex items-center justify-center gap-2 p-2 rounded-sm">
                <button
                    onClick={() => onEdit(assignment)}
                    className="flex-1 py-1.5 px-2 bg-neutral-800 text-white rounded-lg text-xs font-medium 
                              hover:bg-neutral-700 transition-colors"
                >
                    Modifier
                </button>
                <button
                    onClick={() => onRemove(assignment.id)}
                    className="p-1.5 px-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                    <Plus size={14} className="rotate-45" />
                </button>
            </div>
        </div>
    );
};
