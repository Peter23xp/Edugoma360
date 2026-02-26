import React from 'react';
import { Eye, Edit, Trash2, MoreVertical, Phone, BookOpen, School } from 'lucide-react';
import { TEACHER_STATUS } from '@edugoma360/shared';

interface TeacherCardProps {
    teacher: any;
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
    teacher,
    onView,
    onEdit,
    onDelete,
}) => {
    const status = TEACHER_STATUS[teacher.statut as keyof typeof TEACHER_STATUS] || TEACHER_STATUS.ACTIF;

    const subjects = teacher.subjects?.map((s: any) => s.name).join(', ') || 'Aucune matière';
    const classes = [...new Set(teacher.assignments?.map((a: any) => a.class.name))].join(', ') || 'Aucune classe';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow p-5 relative">
            <div className="absolute top-4 right-4">
                <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                    <MoreVertical size={20} />
                </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center overflow-hidden border-2 border-green-100">
                    {teacher.photoUrl ? (
                        <img src={teacher.photoUrl} alt={teacher.nom} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-green-700">
                            {teacher.nom.charAt(0)}{teacher.postNom.charAt(0)}
                        </span>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors uppercase">
                        {teacher.nom} {teacher.postNom}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">{teacher.fonction || 'Enseignant'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                        <span className="text-xs font-semibold" style={{ color: status.color }}>{status.label}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-5 border-t border-gray-50 pt-3">
                <div className="flex items-center gap-3 text-gray-600">
                    <BookOpen size={16} className="text-green-600" />
                    <span className="text-sm truncate">{subjects}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                    <School size={16} className="text-green-600" />
                    <span className="text-sm">
                        <span className="font-bold">{teacher.assignments?.length || 0}</span> classes : {classes}
                    </span>
                </div>
                {teacher.telephone && (
                    <div className="flex items-center gap-3 text-gray-600">
                        <Phone size={16} className="text-green-600" />
                        <span className="text-sm">{teacher.telephone}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onView(teacher.id)}
                    className="flex-1 py-2 px-3 bg-green-50 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                >
                    <Eye size={16} /> Voir la fiche
                </button>
                <button
                    onClick={() => onEdit(teacher.id)}
                    className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Modifier"
                >
                    <Edit size={16} />
                </button>
                <button
                    onClick={() => onDelete(teacher.id)}
                    className="p-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Archiver"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
