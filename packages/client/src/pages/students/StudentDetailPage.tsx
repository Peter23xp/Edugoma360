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

    // Fetch student data
    const { data, isLoading, error } = useQuery({
        queryKey: ['student', id],
        queryFn: async () => {
            const res = await api.get<{ student: StudentWithDetails }>(`/students/${id}`);
            return res.data.student;
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
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-20 h-8 bg-neutral-200 rounded-lg animate-pulse" />
                </div>
                <div className="bg-white rounded-xl border border-neutral-300/50 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-neutral-200 rounded-full animate-pulse" />
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
                               transition-colors"
                >
                    <ArrowLeft size={14} />
                    Retour à la liste
                </button>
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
        <div className="space-y-4 pb-8">
            {/* ── Top Bar ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                               text-neutral-700 hover:bg-neutral-100 rounded-lg 
                               transition-colors"
                >
                    <ArrowLeft size={16} />
                    Retour à la liste
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/students/${id}/edit`)}
                        className="px-4 py-2 text-sm font-medium border border-neutral-300 
                                   rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        Modifier
                    </button>
                    <button
                        onClick={() => window.open(`/api/students/${id}/card`, '_blank')}
                        className="px-4 py-2 text-sm font-medium border border-neutral-300 
                                   rounded-lg hover:bg-neutral-50 transition-colors hidden sm:flex"
                    >
                        Imprimer carte
                    </button>
                    <ActionMenu studentId={id!} />
                </div>
            </div>

            {/* ── Archived Banner ──────────────────────────────────────────── */}
            {isArchived && (
                <div className="bg-neutral-100 border border-neutral-300 rounded-lg px-4 py-3">
                    <p className="text-sm text-neutral-700">
                        <span className="font-semibold">Cet élève est archivé.</span> Les données
                        sont en lecture seule.
                    </p>
                </div>
            )}

            {/* ── Student Header ───────────────────────────────────────────── */}
            <StudentHeader student={student} />

            {/* ── Tabs Navigation ──────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
                <div className="border-b border-neutral-200">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 text-sm font-medium whitespace-nowrap 
                                           border-b-2 transition-colors ${
                                               activeTab === tab.id
                                                   ? 'border-primary text-primary'
                                                   : 'border-transparent text-neutral-600 hover:text-neutral-900'
                                           }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab Content ──────────────────────────────────────────── */}
                <div className="p-6">
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
