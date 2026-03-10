import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AbsenceEvent {
    id: string;
    teacherName: string;
    type: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    startDate: Date | string;
    endDate: Date | string;
}

interface AbsenceCalendarProps {
    events?: AbsenceEvent[];
}

const STATUS_COLORS: Record<string, string> = {
    APPROVED: '#14532d',
    PENDING: '#92400e',
    REJECTED: '#7f1d1d',
};

const STATUS_BG: Record<string, string> = {
    APPROVED: '#dcfce7',
    PENDING: '#fef3c7',
    REJECTED: '#fee2e2',
};

const AbsenceCalendar: React.FC<AbsenceCalendarProps> = ({ events = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const firstDayOfWeek = monthStart.getDay();
    const paddingDays = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1);

    function getEventsForDay(day: Date): AbsenceEvent[] {
        return events.filter(ev => {
            const start = new Date(ev.startDate);
            const end = new Date(ev.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return day >= start && day <= end;
        });
    }

    const selectedEventsForDay = selectedDay ? getEventsForDay(selectedDay) : [];

    const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return (
        <div className="bg-white rounded-xl border border-neutral-300/50 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-800 capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h3>
                <div className="flex gap-1">
                    <button
                        id="calendar-prev"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        id="calendar-next"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 px-4 py-2 bg-neutral-50 border-b border-neutral-100 text-xs text-neutral-600">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-100 border border-emerald-400 inline-block" />
                    Approuvé
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-400 inline-block" />
                    En attente
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-400 inline-block" />
                    Refusé
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-100 border border-neutral-300 inline-block" />
                    Weekend
                </span>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 text-center border-b border-neutral-100">
                {WEEK_DAYS.map(day => (
                    <div key={day} className="py-2 text-xs font-medium text-neutral-500">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
                {Array.from({ length: paddingDays }).map((_, i) => (
                    <div key={`pad-${i}`} className="h-16 border-b border-r border-neutral-50" />
                ))}

                {days.map(day => {
                    const dayEvents = getEventsForDay(day);
                    const isWeekendDay = isWeekend(day);
                    const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toISOString()}
                            id={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                            onClick={() => setSelectedDay(isSelected ? null : day)}
                            className={`h-16 border-b border-r border-neutral-100 p-1 cursor-pointer transition-all 
                                ${isWeekendDay ? 'bg-neutral-50/60' : 'hover:bg-primary/5'}
                                ${isSelected ? 'ring-2 ring-inset ring-primary bg-primary/5' : ''}`}
                        >
                            <div className={`text-xs font-medium mb-1 w-6 h-6 rounded-full flex items-center justify-center 
                                ${isToday ? 'bg-primary text-white' : isWeekendDay ? 'text-neutral-300' : 'text-neutral-600'}`}>
                                {format(day, 'd')}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {dayEvents.slice(0, 2).map(ev => (
                                    <div
                                        key={ev.id}
                                        className="text-[8px] font-medium px-1 rounded truncate leading-4"
                                        style={{
                                            backgroundColor: STATUS_BG[ev.status],
                                            color: STATUS_COLORS[ev.status]
                                        }}
                                        title={ev.teacherName}
                                    >
                                        {ev.teacherName.split(' ')[0]}
                                    </div>
                                ))}
                                {dayEvents.length > 2 && (
                                    <div className="text-[8px] text-neutral-400 font-medium px-1">
                                        +{dayEvents.length - 2}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Day detail */}
            {selectedDay && selectedEventsForDay.length > 0 && (
                <div className="border-t border-neutral-100 p-4 bg-neutral-50/50">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-neutral-700 capitalize">
                            {format(selectedDay, 'EEEE d MMMM yyyy', { locale: fr })}
                        </h4>
                        <button
                            onClick={() => setSelectedDay(null)}
                            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {selectedEventsForDay.map(ev => (
                            <div
                                key={ev.id}
                                className="flex items-center justify-between p-3 rounded-lg text-sm border"
                                style={{
                                    borderColor: `${STATUS_COLORS[ev.status]}30`,
                                    backgroundColor: STATUS_BG[ev.status]
                                }}
                            >
                                <div>
                                    <div className="font-semibold text-neutral-900 text-xs">{ev.teacherName}</div>
                                    <div className="text-[10px] text-neutral-500 mt-0.5">{ev.type}</div>
                                </div>
                                <span
                                    className="text-[10px] font-semibold px-2 py-1 rounded-full"
                                    style={{ color: STATUS_COLORS[ev.status] }}
                                >
                                    {ev.status === 'APPROVED' ? 'Approuvé' : ev.status === 'PENDING' ? 'En attente' : 'Refusé'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedDay && selectedEventsForDay.length === 0 && (
                <div className="border-t border-neutral-100 p-4 text-center text-xs text-neutral-500">
                    Aucune absence le {format(selectedDay, 'd MMMM', { locale: fr })}
                </div>
            )}
        </div>
    );
};

export default AbsenceCalendar;
