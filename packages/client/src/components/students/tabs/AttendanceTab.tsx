import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import api from '../../../lib/api';
import type { Attendance, AttendanceStatus } from '@edugoma360/shared';

interface AttendanceStats {
    rate: number;
    total: number;
    present: number;
    absent: number;
    justified: number;
}

interface AttendanceResponse {
    records: Attendance[];
    stats: AttendanceStats;
}

interface AttendanceTabProps {
    studentId: string;
}

export default function AttendanceTab({ studentId }: AttendanceTabProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // TODO: Get current academic year from context
    const academicYearId = 'current-year';

    const { data, isLoading } = useQuery({
        queryKey: ['student-attendance', studentId, academicYearId],
        queryFn: async () => {
            const res = await api.get<AttendanceResponse>('/attendance', {
                params: { studentId, academicYearId },
            });
            return res.data;
        },
    });

    const goToPreviousMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    };

    const goToNextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-neutral-100 rounded-lg animate-pulse" />
                    ))}
                </div>
                <div className="h-64 bg-neutral-100 rounded-lg animate-pulse" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                    <Calendar size={20} className="text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500">
                    Aucune donnée de présence disponible
                </p>
            </div>
        );
    }

    const statusColors: Record<AttendanceStatus, string> = {
        PRESENT: 'bg-green-500',
        ABSENT: 'bg-red-500',
        JUSTIFIED: 'bg-orange-500',
        SICK: 'bg-blue-500',
    };

    const statusLabels: Record<AttendanceStatus, string> = {
        PRESENT: 'Présent',
        ABSENT: 'Absent non justifié',
        JUSTIFIED: 'Absent justifié',
        SICK: 'Absent malade',
    };

    // Get days in current month
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Build calendar grid
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const calendarDays: (number | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const monthName = currentMonth.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="space-y-6">
            {/* ── Stats Cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    label="Taux de présence"
                    value={`${data.stats.rate.toFixed(0)}%`}
                    color="text-green-700"
                />
                <StatCard
                    label="Absences"
                    value={data.stats.absent.toString()}
                    color="text-red-700"
                />
                <StatCard
                    label="Justifiées"
                    value={data.stats.justified.toString()}
                    color="text-orange-700"
                />
                <StatCard
                    label="Non justifiées"
                    value={(data.stats.absent - data.stats.justified).toString()}
                    color="text-red-700"
                />
            </div>

            {/* ── Calendar ───────────────────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-neutral-900 capitalize">
                        {monthName}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={goToNextMonth}
                            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                        <div
                            key={day}
                            className="text-center text-xs font-semibold text-neutral-500 py-2"
                        >
                            {day}
                        </div>
                    ))}

                    {/* Calendar days */}
                    {calendarDays.map((day, idx) => {
                        if (day === null) {
                            return <div key={`empty-${idx}`} />;
                        }

                        const date = new Date(year, month, day);
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                        // Find attendance record for this day
                        const record = data.records.find((r) => {
                            const recordDate = new Date(r.date);
                            return (
                                recordDate.getDate() === day &&
                                recordDate.getMonth() === month &&
                                recordDate.getFullYear() === year
                            );
                        });

                        const bgColor = record
                            ? statusColors[record.status]
                            : isWeekend
                            ? 'bg-neutral-200'
                            : 'bg-white border border-neutral-200';

                        return (
                            <div
                                key={day}
                                className={`aspect-square flex items-center justify-center 
                                           text-sm rounded-lg ${bgColor} ${
                                               record ? 'text-white font-medium' : 'text-neutral-700'
                                           }`}
                                title={record ? statusLabels[record.status] : undefined}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-neutral-200">
                    <LegendItem color="bg-green-500" label="Présent" />
                    <LegendItem color="bg-red-500" label="Absent non justifié" />
                    <LegendItem color="bg-orange-500" label="Absent justifié" />
                    <LegendItem color="bg-blue-500" label="Absent malade" />
                    <LegendItem color="bg-neutral-200" label="Week-end" />
                </div>
            </div>

            {/* ── Absences Table ─────────────────────────────────────────── */}
            {data.records.filter((r) => r.status !== 'PRESENT').length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                        Historique des absences
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                        Période
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                        Statut
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                        Justification
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {data.records
                                    .filter((r) => r.status !== 'PRESENT')
                                    .slice(0, 10)
                                    .map((record) => (
                                        <tr key={record.id}>
                                            <td className="px-4 py-3 text-sm text-neutral-900">
                                                {new Date(record.date).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-neutral-700">
                                                {record.period === 'MATIN' ? 'Matin' : 'Après-midi'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 
                                                               text-xs font-medium`}
                                                >
                                                    <span
                                                        className={`w-2 h-2 rounded-full ${
                                                            statusColors[record.status]
                                                        }`}
                                                    />
                                                    {statusLabels[record.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-neutral-700">
                                                {record.justification || '—'}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
    color,
}: {
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded ${color}`} />
            <span className="text-xs text-neutral-600">{label}</span>
        </div>
    );
}
