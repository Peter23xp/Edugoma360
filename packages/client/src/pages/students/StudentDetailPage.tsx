import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import type { Student, Enrollment } from '@edugoma360/shared';
import StudentHeader from '../../components/students/StudentHeader';
import ActionMenu from '../../components/students/ActionMenu';
import InfoTab from '../../components/students/tabs/InfoTab';
import ScolariteTab from '../../components/students/tabs/ScolariteTab';
import GradesTab from '../../components/students/tabs/GradesTab';
import AttendanceTab from '../../components/students/tabs/AttendanceTab';
import PaymentsTab from '../../components/students/tabs/PaymentsTab';

type Tab = 'info' | 'scolarite' | 'notes' | 'presences' | 'paiements';

interface StudentWithDetails extends Student {
    enrollments: (Enrollment & {
        class: { id: string; name: string; section: string };
    })[];
    currentEnrollment?: Enrollment & {
        class: { id: string; name: string; section: string };
    };
}

export default function StudentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [printingCard, setPrintingCard] = useState(false);

    const handlePrintCard = async () => {
        if (!id || printingCard) return;
        setPrintingCard(true);
        try {
            const res = await api.get(`/students/${id}/card`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Carte_eleve_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            import('react-hot-toast').then(({ default: toast }) => toast.error('Erreur lors de la génération de la carte'));
        } finally {
            setPrintingCard(false);
        }
    };

    // Fetch student data
    const { data, isLoading, error } = useQuery({
        queryKey: ['student', id],
        queryFn: async () => {
            const res = await api.get<{ data: StudentWithDetails; student?: StudentWithDetails }>(`/students/${id}`);
            return res.data.data ?? res.data.student;
        },
        enabled: !!id,
    });

    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/students');
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="w-full max-w-full overflow-hidden py-4 sm:py-6 lg:py-8 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-20 h-8 bg-neutral-200 rounded-lg animate-pulse" />
                </div>
                <div className="bg-white rounded-xl border border-neutral-300/50 p-4 lg:p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-200 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-3">
                            <div className="w-64 h-6 bg-neutral-200 rounded animate-pulse" />
                            <div className="w-48 h-4 bg-neutral-200 rounded animate-pulse" />
                            <div className="w-56 h-4 bg-neutral-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state - 404
    if (error || !data) {
        return (
            <div className="w-full max-w-full overflow-hidden py-4 sm:py-6 lg:py-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                        <span className="text-3xl">😕</span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900">Élève introuvable</h2>
                    <p className="text-sm text-neutral-500 text-center max-w-md">
                        L'élève que vous recherchez n'existe pas ou a été supprimé.
                    </p>
                    <button
                        onClick={() => navigate('/students')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                                   bg-primary text-white rounded-lg hover:bg-primary-dark 
                                   transition-colors w-full sm:w-auto"
                    >
                        <ArrowLeft size={14} />
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    const student = data;
    const isArchived = student.statut === 'ARCHIVE';

    const tabs: { id: Tab; label: string }[] = [
        { id: 'info', label: 'Infos' },
        { id: 'scolarite', label: 'Scolarité' },
        { id: 'notes', label: 'Notes' },
        { id: 'presences', label: 'Présences' },
        { id: 'paiements', label: 'Paiements' },
    ];

    return (
        <div className="w-full max-w-full overflow-hidden space-y-4 lg:space-y-6">
            {/* ── Top Bar ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                               text-neutral-700 hover:bg-neutral-100 rounded-lg 
                               transition-colors w-full sm:w-auto"
                >
                    <ArrowLeft size={16} />
                    <span className="hidden sm:inline">Retour à la liste</span>
                    <span className="sm:hidden">Retour</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => navigate(`/students/${id}/edit`)}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium border border-neutral-300 
                                   rounded-lg hover:bg-neutral-50 transition-colors text-center w-full sm:w-auto"
                    >
                        Modifier
                    </button>
                    <button
                        onClick={handlePrintCard}
                        disabled={printingCard}
                        className="px-4 py-2 text-sm font-medium border border-neutral-300 
                                   rounded-lg hover:bg-neutral-50 transition-colors hidden lg:flex
                                   items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {printingCard ? 'Génération...' : 'Imprimer carte'}
                    </button>
                    <ActionMenu studentId={id!} />
                </div>
            </div>

            {/* ── Archived Banner ──────────────────────────────────────────────── */}
            {isArchived && (
                <div className="bg-neutral-100 border border-neutral-300 rounded-lg px-4 py-3">
                    <p className="text-xs sm:text-sm text-neutral-700">
                        <span className="font-semibold">Cet élève est archivé.</span> Les données
                        sont en lecture seule.
                    </p>
                </div>
            )}

            {/* ── Student Header ───────────────────────────────────────────────── */}
            <StudentHeader student={student} />

            {/* ── Tabs Navigation ──────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden w-full">
                <div className="bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm w-full overflow-x-auto scrollbar-hide">
                    <div className="flex w-max min-w-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium whitespace-nowrap 
                                           border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-neutral-600 hover:text-neutral-900'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab Content ──────────────────────────────────────────────── */}
                <div className="p-4 lg:p-6">
                    {activeTab === 'info' && <InfoTab student={student} />}
                    {activeTab === 'scolarite' && <ScolariteTab studentId={id!} />}
                    {activeTab === 'notes' && <GradesTab studentId={id!} />}
                    {activeTab === 'presences' && <AttendanceTab studentId={id!} />}
                    {activeTab === 'paiements' && <PaymentsTab studentId={id!} />}
                </div>
            </div>
        </div>
    );
}
