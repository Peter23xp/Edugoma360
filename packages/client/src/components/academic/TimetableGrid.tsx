import type { TimetablePeriod } from '@edugoma360/shared';
import TimetableCell from './TimetableCell';

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
] as const;

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

    // â”€â”€ Indexer les périodes par jour + slot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const byDaySlot: Record<string, Record<number, TimetablePeriod>> = {};
    DAYS.forEach((d) => { byDaySlot[d.key] = {}; });
    periods.forEach((p) => {
        if (!byDaySlot[p.dayOfWeek]) byDaySlot[p.dayOfWeek] = {};
        byDaySlot[p.dayOfWeek][p.periodNumber] = p;
    });

    // â”€â”€ Signal "cellule vide cliquée" â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // On recycle onEditPeriod avec un objet synthétique { id:'__new__', dayOfWeek, periodNumber }
    // TimetablePage détecte id === '__new__' pour ouvrir le modal en mode création.
    const handleAddCell = (dayKey: TimetablePeriod['dayOfWeek'], slot: number) => {
        if (!canEdit || !onEditPeriod) return;
        onEditPeriod({
            id: '__new__',
            dayOfWeek: dayKey,
            periodNumber: slot,
        } as TimetablePeriod);
    };

    return (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">

                    {/* â”€â”€ En-tête â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <thead>
                        <tr className="bg-neutral-100">
                            <th className="border border-neutral-300 p-3 text-left text-sm
                                           font-semibold text-neutral-700 w-24">
                                Horaire
                            </th>
                            {DAYS.map((day) => (
                                <th key={day.key}
                                    className="border border-neutral-300 p-3 text-center text-sm
                                               font-semibold text-neutral-700">
                                    {day.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* â”€â”€ Corps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <tbody>
                        {PERIODS.map((row, idx) => {

                            // â”€â”€ Lignes de pause â”€â”€
                            if (row.isBreak) {
                                return (
                                    <tr key={`break-${idx}`}>
                                        <td className="border border-neutral-300 p-2 text-xs
                                                       text-neutral-600 bg-neutral-50">
                                            {row.start}
                                        </td>
                                        <td colSpan={6}
                                            className="border border-neutral-300 p-3 text-center
                                                       bg-neutral-100">
                                            <span className="text-sm font-semibold text-neutral-700">
                                                {row.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }

                            // â”€â”€ Lignes de cours â”€â”€
                            return (
                                <tr key={row.slot}>
                                    <td className="border border-neutral-300 p-2 text-xs
                                                   text-neutral-600 bg-neutral-50">
                                        <div>{row.start}</div>
                                        <div className="text-neutral-400">{row.end}</div>
                                    </td>

                                    {DAYS.map((day) => {
                                        const existing =
                                            byDaySlot[day.key]?.[row.slot] ?? null;

                                        return (
                                            <td key={`${day.key}-${row.slot}`}
                                                className="border border-neutral-300 p-0">
                                                <TimetableCell
                                                    period={existing}
                                                    onEdit={onEditPeriod}
                                                    onAdd={
                                                        canEdit && !existing
                                                            ? () => handleAddCell(
                                                                day.key as TimetablePeriod['dayOfWeek'],
                                                                row.slot
                                                            )
                                                            : undefined
                                                    }
                                                    showTeacher={showTeacher}
                                                    canEdit={canEdit}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
