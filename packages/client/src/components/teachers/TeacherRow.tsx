import React from 'react';
import { Eye, Edit, Trash2, MoreVertical, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { TEACHER_STATUS } from '@edugoma360/shared';

interface TeacherRowProps {
    teacher: any;
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
}

export const TeacherRow: React.FC<TeacherRowProps> = ({
    teacher,
    onView,
    onEdit,
    onDelete,
    isSelected,
    onSelect,
}) => {
    const status = TEACHER_STATUS[teacher.statut as keyof typeof TEACHER_STATUS] || TEACHER_STATUS.ACTIF;
    const subjects = teacher.subjects?.map((s: any) => s.name).join(', ') || 'Aucune matière';
    const classesCount = new Set(teacher.assignments?.map((a: any) => a.classId)).size;

    return (
        <tr
            onClick={() => onView(teacher.id)}
            className={`group hover:bg-green-50/30 border-b border-gray-100 transition-colors cursor-pointer ${isSelected ? 'bg-green-50' : ''}`}
        >
            <td className="py-4 px-4 w-10">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                        e.stopPropagation();
                        onSelect?.(teacher.id);
                    }}
                    className="rounded border-gray-300 text-green-700 focus:ring-green-500 w-4 h-4"
                />
            </td>
            <td className="py-4 px-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center overflow-hidden border border-green-100 shrink-0">
                        {teacher.photoUrl ? (
                            <img src={teacher.photoUrl} alt={teacher.nom} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold text-green-700 uppercase">
                                {teacher.nom.charAt(0)}{teacher.postNom.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 group-hover:text-green-700 transition-colors uppercase">
                            {teacher.nom} {teacher.postNom}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">{teacher.matricule}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 px-4 truncate max-w-[200px]">
                <div className="text-sm text-gray-700">{subjects}</div>
            </td>
            <td className="py-4 px-4 whitespace-nowrap text-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                    {classesCount}
                </span>
            </td>
            <td className="py-4 px-4 whitespace-nowrap">
                <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                    style={{ backgroundColor: `${status.color}15`, color: status.color }}
                >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                    {status.label}
                </span>
            </td>
            <td className="py-4 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(teacher.id); }}
                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(teacher.id); }}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <MoreVertical size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
};
