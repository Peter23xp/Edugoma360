import React, { useState } from 'react';
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
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                        <Calendar size={24} className="text-green-700" />
                        Gestion des Absences
                    </h1>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Suivi des congés et absences du personnel enseignant
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View toggle */}
                    <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                        <button
                            id="view-list"
                            onClick={() => setView('list')}
                            className={`p-2.5 rounded-xl transition-all ${view === 'list' ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List size={20} />
                        </button>
                        <button
                            id="view-calendar"
                            onClick={() => setView('calendar')}
                            className={`p-2.5 rounded-xl transition-all ${view === 'calendar' ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Calendar size={20} />
                        </button>
                    </div>

                    <button
                        id="new-absence-request"
                        onClick={() => setIsRequestModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-700/20 hover:bg-green-800 transition-all active:scale-95"
                    >
                        <Plus size={20} /> Nouvelle Demande
                    </button>
                </div>
            </div>

            {/* STATS */}
            <AbsenceStatsCards stats={isPrefet ? stats : balance} isTeacher={isTeacher} />

            {/* CONTENT */}
            {view === 'calendar' ? (
                <AbsenceCalendar events={calendarEvents} />
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Demandes de Congés</h3>
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
