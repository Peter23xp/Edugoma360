import { Phone, MessageSquare } from 'lucide-react';
import type { Student } from '@edugoma360/shared';

interface InfoTabProps {
    student: Student;
}

export default function InfoTab({ student }: InfoTabProps) {
    // Calculate age
    const birthDate = new Date(student.dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const statusLabels: Record<string, string> = {
        NOUVEAU: 'Nouveau',
        REDOUBLANT: 'Redoublant',
        TRANSFERE: 'Transféré',
        DEPLACE: 'Déplacé',
        REFUGIE: 'Réfugié',
        ARCHIVE: 'Archivé',
    };

    return (
        <div className="space-y-6">
            {/* ── Identité ──────────────────────────────────────────────── */}
            <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Identité</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                        label="Date de naissance"
                        value={`${formatDate(student.dateNaissance)} (${age} ans)`}
                    />
                    <InfoField label="Lieu de naissance" value={student.lieuNaissance} />
                    <InfoField
                        label="Sexe"
                        value={student.sexe === 'M' ? 'Masculin' : 'Féminin'}
                    />
                    <InfoField label="Nationalité" value={student.nationalite} />
                    <InfoField label="Statut" value={statusLabels[student.statut]} />
                </div>
            </div>

            {/* ── Contacts Famille ──────────────────────────────────────── */}
            <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Contacts Famille</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Père */}
                    <ParentCard
                        title="PÈRE"
                        name={student.nomPere}
                        phone={student.telPere}
                    />

                    {/* Mère */}
                    <ParentCard
                        title="MÈRE"
                        name={student.nomMere}
                        phone={student.telMere}
                    />
                </div>

                {/* Tuteur (if different) */}
                {student.nomTuteur && (
                    <div className="mt-4">
                        <p className="text-xs font-medium text-neutral-500 mb-2">
                            Tuteur légal
                        </p>
                        <ParentCard
                            title="TUTEUR"
                            name={student.nomTuteur}
                            phone={student.telTuteur}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">{label}</p>
            <p className="text-sm text-neutral-900">{value || '—'}</p>
        </div>
    );
}

function ParentCard({
    title,
    name,
    phone,
}: {
    title: string;
    name?: string | null;
    phone?: string | null;
}) {
    if (!name && !phone) {
        return (
            <div className="border border-neutral-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-neutral-400 mb-2">{title}</p>
                <p className="text-sm text-neutral-400 italic">Non renseigné</p>
            </div>
        );
    }

    return (
        <div className="border border-neutral-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-neutral-500 mb-2">{title}</p>
            <p className="text-sm font-medium text-neutral-900 mb-2">{name || '—'}</p>
            {phone && (
                <div className="flex items-center gap-2">
                    <a
                        href={`tel:${phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                                   bg-primary/10 text-primary rounded-lg hover:bg-primary/20 
                                   transition-colors"
                    >
                        <Phone size={12} />
                        Appeler
                    </a>
                    <a
                        href={`sms:${phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                                   bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 
                                   transition-colors"
                    >
                        <MessageSquare size={12} />
                        SMS
                    </a>
                </div>
            )}
        </div>
    );
}
