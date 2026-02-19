import { Phone, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Student, Enrollment } from '@edugoma360/shared';
import api from '../../lib/api';

interface StudentWithDetails extends Student {
    enrollments?: (Enrollment & {
        class: { id: string; name: string; section: string };
    })[];
    currentEnrollment?: Enrollment & {
        class: { id: string; name: string; section: string };
    };
}

interface StudentHeaderProps {
    student: StudentWithDetails;
}

export default function StudentHeader({ student }: StudentHeaderProps) {
    // Get initials for avatar fallback
    const initials = `${student.nom[0]}${student.postNom[0]}`.toUpperCase();

    // Format full name (Congolese order: NOM POSTNOM Prénom)
    const fullName = [student.nom, student.postNom, student.prenom]
        .filter(Boolean)
        .join(' ')
        .toUpperCase();

    // Get current class info
    const currentClass = student.currentEnrollment?.class;
    const className = currentClass
        ? `${currentClass.name} ${currentClass.section}`
        : 'Non assigné';

    // Get primary phone (prefer father, then mother, then tutor)
    const primaryPhone = student.telPere || student.telMere || student.telTuteur;
    const phoneLabel = student.telPere
        ? 'père'
        : student.telMere
            ? 'mère'
            : student.telTuteur
                ? 'tuteur'
                : null;

    // Status badge config
    const statusConfig: Record<
        string,
        { label: string; className: string }
    > = {
        NOUVEAU: { label: 'Actif', className: 'bg-green-100 text-green-700' },
        REDOUBLANT: { label: 'Redoublant', className: 'bg-orange-100 text-orange-700' },
        TRANSFERE: { label: 'Transféré', className: 'bg-blue-100 text-blue-700' },
        DEPLACE: { label: 'Déplacé', className: 'bg-purple-100 text-purple-700' },
        REFUGIE: { label: 'Réfugié', className: 'bg-indigo-100 text-indigo-700' },
        ARCHIVE: { label: 'Archivé', className: 'bg-neutral-200 text-neutral-700' },
    };

    const status = statusConfig[student.statut] || statusConfig.NOUVEAU;


    // Payment status
    const { data: paymentSummary } = useQuery({
        queryKey: ['payment-summary', student.id],
        queryFn: () => api.get<{ expected: number; paid: number; remaining: number }>(`/students/${student.id}/payment-summary`),
        enabled: !!student.id,
    });

    const hasPaymentDue = (paymentSummary?.data?.remaining || 0) > 0;
    const amountDue = paymentSummary?.data?.remaining || 0;

    return (
        <div className="bg-white rounded-xl border border-neutral-300/50 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* ── Photo ──────────────────────────────────────────────── */}
                <div className="relative group">
                    {student.photoUrl ? (
                        <img
                            src={student.photoUrl}
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
                    {/* TODO: Add photo upload on click for SECRETAIRE+ */}
                </div>

                {/* ── Info ───────────────────────────────────────────────── */}
                <div className="flex-1 space-y-2">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                            {fullName}
                        </h1>
                        <p className="text-sm text-neutral-500 font-mono mt-0.5">
                            Matricule : {student.matricule}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Class badge */}
                        <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full 
                                       text-xs font-medium bg-primary/10 text-primary"
                        >
                            {className}
                        </span>

                        {/* Status badge */}
                        <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full 
                                       text-xs font-medium ${status.className}`}
                        >
                            {status.label}
                        </span>

                        {/* Payment due badge */}
                        {hasPaymentDue && (
                            <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full 
                                           text-xs font-medium bg-red-100 text-red-700"
                            >
                                <AlertCircle size={12} />
                                Solde dû : {amountDue.toLocaleString()} FC
                            </span>
                        )}
                    </div>

                    {/* Primary phone */}
                    {primaryPhone && (
                        <a
                            href={`tel:${primaryPhone}`}
                            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 
                                       hover:text-primary transition-colors"
                        >
                            <Phone size={14} />
                            <span>
                                {primaryPhone} {phoneLabel && `(${phoneLabel})`}
                            </span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
