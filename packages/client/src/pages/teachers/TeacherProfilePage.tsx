import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherProfile } from '../../hooks/useTeacherProfile';
import { TeacherHeader } from '../../components/teachers/TeacherHeader';
import { TeacherInfoTab } from '../../components/teachers/tabs/TeacherInfoTab';
import { TeacherClassesTab } from '../../components/teachers/tabs/TeacherClassesTab';
import { TeacherScheduleTab } from '../../components/teachers/tabs/TeacherScheduleTab';
import { TeacherPerformanceTab } from '../../components/teachers/tabs/TeacherPerformanceTab';
import { ArrowLeft } from 'lucide-react';

type Tab = 'infos' | 'classes' | 'schedule' | 'performance';

/**
 * SCR-019 — Teacher Profile Page
 * Full teacher profile with 4 tabs: Info | Classes | Timetable | Stats
 */
export const TeacherProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profileQuery } = useTeacherProfile(id);
    const { data: teacher, isLoading, error } = profileQuery;

    const [activeTab, setActiveTab] = useState<Tab>('infos');

    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/teachers');
        }
    };

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

    if (error || !teacher) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <span className="text-3xl">😕</span>
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Enseignant introuvable</h2>
                <p className="text-sm text-neutral-500 text-center max-w-md">
                    L'enseignant que vous recherchez n'existe pas ou a été supprimé.
                </p>
                <button
                    id="back-to-list"
                    onClick={() => navigate('/teachers')}
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

    const isArchived = teacher.statut === 'INACTIF' || teacher.statut === 'ARCHIVE';

    const tabs: { id: Tab; label: string }[] = [
        { id: 'infos', label: 'Infos Personnelles' },
        { id: 'classes', label: 'Classes & Matières' },
        { id: 'schedule', label: 'Emploi du temps' },
        { id: 'performance', label: 'Performances' },
    ];

    return (
        <div className="space-y-4 pb-8">
            {/* —— Top Bar —— */}
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
                        onClick={() => navigate(`/teachers/${id}/edit`)}
                        className="px-4 py-2 text-sm font-medium border border-neutral-300 
                                   rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        Modifier
                    </button>
                </div>
            </div>

            {/* —— Archived Banner —— */}
            {isArchived && (
                <div className="bg-neutral-100 border border-neutral-300 rounded-lg px-4 py-3">
                    <p className="text-sm text-neutral-700">
                        <span className="font-semibold">Cet enseignant est inactif/archivé.</span> Les données
                        sont en lecture seule.
                    </p>
                </div>
            )}

            {/* —— Teacher Header —— */}
            <TeacherHeader teacher={teacher} />

            {/* —— Tabs Navigation —— */}
            <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden" id="teacher-profile-tabs">
                <div className="border-b border-neutral-200">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                id={`tab-${tab.id}`}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 text-sm font-medium whitespace-nowrap 
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

                {/* —— Tab Content —— */}
                <div className="p-6">
                    {activeTab === 'infos' && <TeacherInfoTab teacher={teacher} />}
                    {activeTab === 'classes' && <TeacherClassesTab teacher={teacher} />}
                    {activeTab === 'schedule' && <TeacherScheduleTab teacher={teacher} />}
                    {activeTab === 'performance' && <TeacherPerformanceTab teacher={teacher} />}
                </div>
            </div>
        </div>
    );
};

export default TeacherProfilePage;

