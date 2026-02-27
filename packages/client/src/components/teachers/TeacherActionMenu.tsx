import React, { useState } from 'react';
import { MoreVertical, Edit, Calendar, Download, AlertTriangle, Archive, Key, FileText, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

interface TeacherActionMenuProps {
    teacher: any;
    onEdit: () => void;
    onArchive: () => void;
    onSchedule: () => void;
    onPerformance: () => void;
}

export const TeacherActionMenu: React.FC<TeacherActionMenuProps> = ({
    teacher,
    onEdit,
    onArchive,
    onSchedule,
    onPerformance,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isActionPending, setIsActionPending] = useState(false);
    const userRole = useAuthStore(s => s.user?.role);
    const isAdminOrPrefet = ['PREFET', 'SUPER_ADMIN', 'ADMIN'].includes(userRole || '');

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleDownload = async (type: 'contract' | 'timetable') => {
        setIsActionPending(true);
        try {
            const url = type === 'contract'
                ? `/teachers/${teacher.id}/contract`
                : `/teachers/${teacher.id}/timetable/pdf`;
            const response = await api.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${type.toUpperCase()}-${teacher.nom}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Erreur lors du téléchargement');
        } finally {
            setIsActionPending(false);
        }
    };

    const handleResetPassword = async () => {
        if (!window.confirm('Réinitialiser le mot de passe de cet enseignant ?')) return;
        setIsActionPending(true);
        try {
            await api.post(`/teachers/${teacher.id}/reset-password`);
            toast.success('Mot de passe réinitialisé et envoyé par SMS');
        } catch (error) {
            toast.error('Erreur lors de la réinitialisation');
        } finally {
            setIsActionPending(false);
        }
    };

    const menuItems = [
        { label: 'Modifier la fiche', icon: <Edit size={16} />, onClick: onEdit, color: 'text-gray-700' },
        { label: 'Emploi du temps', icon: <Calendar size={16} />, onClick: onSchedule, color: 'text-blue-600' },
        { label: 'Performances', icon: <AlertTriangle size={16} />, onClick: onPerformance, color: 'text-orange-600' },
        { label: 'Fiche Contrat (PDF)', icon: <FileText size={16} />, onClick: () => handleDownload('contract'), color: 'text-indigo-600', show: isAdminOrPrefet },
        { label: 'Exporter Horaire', icon: <Download size={16} />, onClick: () => handleDownload('timetable'), color: 'text-emerald-600', show: isAdminOrPrefet },
        { label: 'Réinitialiser MDP', icon: <Key size={16} />, onClick: handleResetPassword, color: 'text-rose-600', show: isAdminOrPrefet, divider: true },
        { label: 'Archiver', icon: <Archive size={16} />, onClick: onArchive, color: 'text-gray-500', divider: !isAdminOrPrefet },
    ];

    return (
        <div className="relative">
            <button
                disabled={isActionPending}
                onClick={toggleMenu}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors focus:ring-4 focus:ring-gray-100 outline-none disabled:opacity-50"
            >
                {isActionPending ? <Loader2 size={20} className="animate-spin" /> : <MoreVertical size={20} />}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in duration-150 origin-top-right">
                        {menuItems.filter(i => i.show !== false).map((item, index) => (
                            <React.Fragment key={index}>
                                {item.divider && <div className="h-px bg-gray-50 my-1.5" />}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        item.onClick();
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors ${item.color}`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
