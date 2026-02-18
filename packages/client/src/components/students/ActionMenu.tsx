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

interface ActionMenuProps {
    studentId: string;
}

export default function ActionMenu({ studentId }: ActionMenuProps) {
    const navigate = useNavigate();
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);

    const handleEdit = () => {
        navigate(`/students/${studentId}/edit`);
    };

    const handlePrintAttestation = () => {
        window.open(`/api/students/${studentId}/attestation`, '_blank');
    };

    const handlePrintCard = () => {
        window.open(`/api/students/${studentId}/card`, '_blank');
    };

    const handleTransfer = () => {
        // TODO: Open transfer modal
        console.log('Transfer student:', studentId);
    };

    const handleSendSMS = () => {
        // TODO: Open SMS modal with pre-filled student info
        navigate(`/sms?studentId=${studentId}`);
    };

    const handleArchive = () => {
        setArchiveModalOpen(true);
    };

    const handleArchiveConfirm = async () => {
        // TODO: Call archive API
        console.log('Archive student:', studentId);
        setArchiveModalOpen(false);
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

                    <DropdownMenuItem onClick={handlePrintAttestation}>
                        <Printer size={14} className="mr-2" />
                        Imprimer attestation
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handlePrintCard}>
                        <CreditCard size={14} className="mr-2" />
                        Générer carte d'élève
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
