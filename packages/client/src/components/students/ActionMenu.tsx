import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MoreVertical,
    Edit,
    Printer,
    CreditCard,
    ArrowRightLeft,
    MessageSquare,
    Archive,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import ConfirmModal from '../shared/ConfirmModal';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface ActionMenuProps {
    studentId: string;
}

async function downloadPdf(url: string, filename: string) {
    const res = await api.get(url, { responseType: 'blob' });
    const objectUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = objectUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
}

export default function ActionMenu({ studentId }: ActionMenuProps) {
    const navigate = useNavigate();
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const [loadingAttestation, setLoadingAttestation] = useState(false);
    const [loadingCard, setLoadingCard] = useState(false);

    const handleEdit = () => {
        navigate(`/students/${studentId}/edit`);
    };

    const handlePrintAttestation = async () => {
        if (loadingAttestation) return;
        setLoadingAttestation(true);
        try {
            await downloadPdf(`/students/${studentId}/certificate`, `Attestation_${studentId}.pdf`);
        } catch {
            toast.error('Erreur lors de la génération de l\'attestation');
        } finally {
            setLoadingAttestation(false);
        }
    };

    const handlePrintCard = async () => {
        if (loadingCard) return;
        setLoadingCard(true);
        try {
            await downloadPdf(`/students/${studentId}/card`, `Carte_${studentId}.pdf`);
        } catch {
            toast.error('Erreur lors de la génération de la carte');
        } finally {
            setLoadingCard(false);
        }
    };

    const handleTransfer = () => {
        // TODO: Open transfer modal
        console.log('Transfer student:', studentId);
    };

    const handleSendSMS = () => {
        navigate(`/sms?studentId=${studentId}`);
    };

    const handleArchive = () => {
        setArchiveModalOpen(true);
    };

    const handleArchiveConfirm = async () => {
        try {
            await api.delete(`/students/${studentId}`);
            toast.success('Élève archivé avec succès');
            navigate('/students');
        } catch {
            toast.error('Erreur lors de l\'archivage');
        } finally {
            setArchiveModalOpen(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        aria-label="Plus d'actions"
                    >
                        <MoreVertical size={18} className="text-neutral-600" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleEdit}>
                        <Edit size={14} className="mr-2" />
                        Modifier la fiche
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={handlePrintAttestation}
                        className={loadingAttestation ? 'opacity-50 pointer-events-none' : ''}
                    >
                        <Printer size={14} className="mr-2" />
                        {loadingAttestation ? 'Génération...' : 'Imprimer attestation'}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={handlePrintCard}
                        className={loadingCard ? 'opacity-50 pointer-events-none' : ''}
                    >
                        <CreditCard size={14} className="mr-2" />
                        {loadingCard ? 'Génération...' : "Générer carte d'élève"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleTransfer}>
                        <ArrowRightLeft size={14} className="mr-2" />
                        Transférer
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleSendSMS}>
                        <MessageSquare size={14} className="mr-2" />
                        Envoyer un SMS
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleArchive} className="text-red-600">
                        <Archive size={14} className="mr-2" />
                        Archiver
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmModal
                isOpen={archiveModalOpen}
                title="Archiver cet élève ?"
                message="L'élève sera déplacé dans les archives. Cette action peut être annulée par un administrateur."
                confirmLabel="Archiver"
                variant="warning"
                onConfirm={handleArchiveConfirm}
                onCancel={() => setArchiveModalOpen(false)}
            />
        </>
    );
}
