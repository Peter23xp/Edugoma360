import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
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

    // Pad the start with empty days to align weekday
    const firstDayOfWeek = monthStart.getDay(); // 0=Sun, 1=Mon
    const paddingDays = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); // Mon-first grid

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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h3>
                <div className="flex gap-2">
                    <button
                        id="calendar-prev"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        id="calendar-next"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 px-6 py-3 bg-gray-50/50 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-green-100 border border-green-400 inline-block" />
                    Approuvé
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-400 inline-block" />
                    En attente
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-100 border border-red-400 inline-block" />
                    Refusé
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300 inline-block" />
                    Weekend
                </span>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 text-center border-b border-gray-100">
                {WEEK_DAYS.map(day => (
                    <div key={day} className="py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
                {/* Empty padding cells */}
                {Array.from({ length: paddingDays }).map((_, i) => (
                    <div key={`pad-${i}`} className="h-16 border-b border-r border-gray-50" />
                ))}

                {/* Day cells */}
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
                            className={`h-16 border-b border-r border-gray-50 p-1 cursor-pointer transition-all ${isWeekendDay ? 'bg-gray-50/60' : 'hover:bg-green-50/30'
                                } ${isSelected ? 'ring-2 ring-inset ring-green-500 bg-green-50' : ''}`}
                        >
                            <div className={`text-xs font-bold mb-1 w-6 h-6 rounded-full flex items-center justify-center ${isToday ? 'bg-green-700 text-white' : isWeekendDay ? 'text-gray-300' : 'text-gray-500'
                                }`}>
                                {format(day, 'd')}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {dayEvents.slice(0, 2).map(ev => (
                                    <div
                                        key={ev.id}
                                        className="text-[8px] font-bold px-1 rounded truncate leading-4"
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
                                    <div className="text-[8px] text-gray-400 font-bold px-1">
                                        +{dayEvents.length - 2}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Day detail popover */}
            {selectedDay && selectedEventsForDay.length > 0 && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest">
                            {format(selectedDay, 'EEEE d MMMM yyyy', { locale: fr })}
                        </h4>
                        <button
                            onClick={() => setSelectedDay(null)}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {selectedEventsForDay.map(ev => (
                            <div
                                key={ev.id}
                                className="flex items-center justify-between p-3 rounded-2xl text-sm border"
                                style={{
                                    borderColor: `${STATUS_COLORS[ev.status]}30`,
                                    backgroundColor: STATUS_BG[ev.status]
                                }}
                            >
                                <div>
                                    <div className="font-black text-gray-900 text-xs uppercase">{ev.teacherName}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{ev.type}</div>
                                </div>
                                <span
                                    className="text-[10px] font-black px-2 py-1 rounded-full uppercase"
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
                <div className="border-t border-gray-100 p-4 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Aucune absence le {format(selectedDay, 'd MMMM', { locale: fr })}
                </div>
            )}
        </div>
    );
};

export default AbsenceCalendar;
