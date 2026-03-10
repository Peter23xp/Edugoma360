import { useState } from 'react';
import { Calendar, Plus, List } from 'lucide-react';
import { useAbsences } from '../../hooks/useAbsences';
import AbsenceStatsCards from '../../components/teachers/AbsenceStatsCards';
import AbsencesList from '../../components/teachers/AbsencesList';
import AbsenceCalendar from '../../components/teachers/AbsenceCalendar';
import AbsenceRequestModal from '../../components/teachers/AbsenceRequestModal';
import AbsenceApprovalModal from '../../components/teachers/AbsenceApprovalModal';
import { useAuthStore, User } from '../../stores/auth.store';

/**
 * SCR-020 — Gestion des Absences / Congés Enseignants
 */
export default function AbsencesPage() {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [view, setView] = useState<'calendar' | 'list'>('list');

    const user = useAuthStore(s => s.user) as User | null;
    const isTeacher = user?.role === 'ENSEIGNANT';
    const isPrefet = ['PREFET', 'DIRECTEUR', 'ADMIN'].includes(user?.role || '');

    const { absencesQuery, statsQuery, balanceQuery } = useAbsences();
    const requests = absencesQuery.data || [];
    const stats = statsQuery.data;
    const balance = balanceQuery.data;

    // Transform requests to calendar events
    const calendarEvents = requests.map((r: any) => ({
        id: r.id,
        teacherName: `${r.teacher?.nom || ''} ${r.teacher?.postNom || ''}`.trim(),
        type: r.type,
        status: r.status,
        startDate: r.startDate,
        endDate: r.endDate,
    }));

    return (
        <div className="space-y-4 pb-20">
            {/* —— Header —— */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
                        <Calendar size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                            Gestion des absences
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Suivi des congés et absences du personnel enseignant
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                        <button
                            id="view-list"
                            onClick={() => setView('list')}
                            className={`p-2 rounded-lg transition-all duration-200 ${view === 'list'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-neutral-400 hover:text-neutral-600'
                                }`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            id="view-calendar"
                            onClick={() => setView('calendar')}
                            className={`p-2 rounded-lg transition-all duration-200 ${view === 'calendar'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-neutral-400 hover:text-neutral-600'
                                }`}
                        >
                            <Calendar size={18} />
                        </button>
                    </div>

                    <button
                        id="new-absence-request"
                        onClick={() => setIsRequestModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium 
                                   bg-gradient-to-r from-primary to-primary-light text-white 
                                   rounded-xl hover:shadow-lg hover:shadow-primary/25 
                                   transition-all duration-200 hover:-translate-y-0.5 shadow-md"
                    >
                        <Plus size={15} />
                        <span>Nouvelle demande</span>
                    </button>
                </div>
            </div>

            {/* —— Stats —— */}
            <AbsenceStatsCards stats={isPrefet ? stats : balance} isTeacher={isTeacher} />

            {/* —— Content —— */}
            {view === 'calendar' ? (
                <AbsenceCalendar events={calendarEvents} />
            ) : (
                <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-700">Demandes de congés</h3>
                    </div>
                    <AbsencesList
                        requests={requests}
                        isLoading={absencesQuery.isLoading}
                        onAction={(req: any) => setSelectedRequest(req)}
                    />
                </div>
            )}

            {/* MODALS */}
            <AbsenceRequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
            />

            {selectedRequest && (
                <AbsenceApprovalModal
                    request={selectedRequest}
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                />
            )}
        </div>
    );
}
