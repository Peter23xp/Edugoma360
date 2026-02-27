import React from 'react';
import { Phone, Briefcase } from 'lucide-react';


interface TeacherHeaderProps {
    teacher: any;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({ teacher }) => {
    // Get initials for avatar fallback
    const initials = `${teacher.nom[0]}${teacher.postNom[0]}`.toUpperCase();

    // Format full name
    const fullName = [teacher.nom, teacher.postNom, teacher.prenom]
        .filter(Boolean)
        .join(' ')
        .toUpperCase();

    // Status badge config
    const statusConfig: Record<
        string,
        { label: string; className: string }
    > = {
        ACTIF: { label: 'Actif', className: 'bg-green-100 text-green-700' },
        EN_CONGE: { label: 'En congé', className: 'bg-orange-100 text-orange-700' },
        INACTIF: { label: 'Inactif', className: 'bg-red-100 text-red-700' },
    };

    const status = statusConfig[teacher.statut] || statusConfig.ACTIF;

    return (
        <div className="bg-white rounded-xl border border-neutral-300/50 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* —— Photo —— */}
                <div className="relative group">
                    {teacher.photoUrl ? (
                        <img
                            src={teacher.photoUrl}
                            alt={fullName}
                            className="w-20 h-20 rounded-full border-2 border-primary object-cover"
                        />
                    ) : (
                        <div
                            className="w-20 h-20 rounded-full border-2 border-primary 
                                       bg-gradient-to-br from-primary to-primary-light 
                                       flex items-center justify-center"
                        >
                            <span className="text-2xl font-bold text-white">{initials}</span>
                        </div>
                    )}
                </div>

                {/* —— Info —— */}
                <div className="flex-1 space-y-2">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                            {fullName}
                        </h1>
                        <p className="text-sm text-neutral-500 font-mono mt-0.5">
                            Matricule : {teacher.matricule}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Function badge */}
                        <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full 
                                       text-xs font-medium bg-primary/10 text-primary"
                        >
                            <Briefcase size={12} />
                            {teacher.fonction || 'Enseignant'}
                        </span>

                        {/* Status badge */}
                        <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full 
                                       text-xs font-medium ${status.className}`}
                        >
                            {status.label}
                        </span>
                    </div>

                    {/* Primary phone */}
                    {teacher.telephone && (
                        <a
                            href={`tel:${teacher.telephone}`}
                            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 
                                       hover:text-primary transition-colors"
                        >
                            <Phone size={14} />
                            <span>{teacher.telephone}</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};
