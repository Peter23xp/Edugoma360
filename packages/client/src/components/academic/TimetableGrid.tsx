import TimetableCell from './TimetableCell';

interface TimetablePeriod {
    id: string;
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
    periodSlot: number;
    startTime: string;
    endTime: string;
    subject: {
        name: string;
        abbreviation: string;
    };
    class: {
        name: string;
        section: {
            code: string;
        };
    };
    teacher?: {
        nom: string;
        prenom: string | null;
    };
}

interface TimetableGridProps {
    periods: TimetablePeriod[];
    onEditPeriod?: (period: TimetablePeriod) => void;
    showTeacher?: boolean;
    canEdit?: boolean;
}

const DAYS = [
    { key: 'MONDAY', label: 'Lundi' },
    { key: 'TUESDAY', label: 'Mardi' },
    { key: 'WEDNESDAY', label: 'Mercredi' },
    { key: 'THURSDAY', label: 'Jeudi' },
    { key: 'FRIDAY', label: 'Vendredi' },
    { key: 'SATURDAY', label: 'Samedi' },
];

const PERIODS = [
    { slot: 1, start: '07:30', end: '08:30' },
    { slot: 2, start: '08:30', end: '09:30' },
    { slot: 0, start: '09:30', end: '10:00', isBreak: true, label: 'RÉCRÉATION' },
    { slot: 3, start: '10:00', end: '11:00' },
    { slot: 4, start: '11:00', end: '12:00' },
    { slot: 0, start: '12:00', end: '13:00', isBreak: true, label: 'PAUSE DÉJEUNER' },
    { slot: 5, start: '13:00', end: '14:00' },
    { slot: 6, start: '14:00', end: '15:00' },
    { slot: 7, start: '15:00', end: '16:00' },
    { slot: 8, start: '16:00', end: '17:00' },
];

export default function TimetableGrid({
    periods,
    onEditPeriod,
    showTeacher = false,
    canEdit = false,
}: TimetableGridProps) {
    // Organiser les périodes par jour et slot
    const periodsByDayAndSlot: Record<string, Record<number, TimetablePeriod>> = {};

    DAYS.forEach((day) => {
        periodsByDayAndSlot[day.key] = {};
    });

    periods.forEach((period) => {
        if (!periodsByDayAndSlot[period.dayOfWeek]) {
            periodsByDayAndSlot[period.dayOfWeek] = {};
        }
        periodsByDayAndSlot[period.dayOfWeek][period.periodSlot] = period;
    });

    return (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-neutral-100">
                            <th className="border border-neutral-300 p-3 text-left text-sm 
                                           font-semibold text-neutral-700 w-24">
                                Horaire
                            </th>
                            {DAYS.map((day) => (
                                <th
                                    key={day.key}
                                    className="border border-neutral-300 p-3 text-center text-sm 
                                               font-semibold text-neutral-700"
                                >
                                    {day.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PERIODS.map((period, index) => {
                            // Ligne de pause
                            if (period.isBreak) {
                                return (
                                    <tr key={`break-${index}`}>
                                        <td
                                            className="border border-neutral-300 p-2 text-xs 
                                                       text-neutral-600 bg-neutral-50"
                                        >
                                            {period.start}
                                        </td>
                                        <td
                                            colSpan={6}
                                            className="border border-neutral-300 p-3 text-center 
                                                       bg-neutral-100"
                                        >
                                            <span className="text-sm font-semibold text-neutral-700">
                                                {period.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }

                            // Ligne de cours
                            return (
                                <tr key={period.slot}>
                                    <td
                                        className="border border-neutral-300 p-2 text-xs 
                                                   text-neutral-600 bg-neutral-50"
                                    >
                                        <div>{period.start}</div>
                                        <div className="text-neutral-400">{period.end}</div>
                                    </td>
                                    {DAYS.map((day) => (
                                        <td
                                            key={`${day.key}-${period.slot}`}
                                            className="border border-neutral-300 p-0"
                                        >
                                            <TimetableCell
                                                period={
                                                    periodsByDayAndSlot[day.key][period.slot] || null
                                                }
                                                onEdit={onEditPeriod}
                                                showTeacher={showTeacher}
                                                canEdit={canEdit}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
