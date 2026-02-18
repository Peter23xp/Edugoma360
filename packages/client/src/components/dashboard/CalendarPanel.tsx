import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export interface CalendarEvent {
  id: string;
  date: string;
  label: string;
  type: 'exam' | 'vacation' | 'deliberation' | 'meeting';
  isToday?: boolean;
}

interface CalendarPanelProps {
  events: CalendarEvent[];
  isLoading?: boolean;
}

export default function CalendarPanel({ events, isLoading }: CalendarPanelProps) {
  const getEventBadge = (type: CalendarEvent['type']) => {
    const variants = {
      exam: { label: 'Examen', className: 'bg-red-100 text-red-700' },
      vacation: { label: 'Vacances', className: 'bg-blue-100 text-blue-700' },
      deliberation: { label: 'Délibération', className: 'bg-purple-100 text-purple-700' },
      meeting: { label: 'Réunion', className: 'bg-amber-100 text-amber-700' },
    };
    return variants[type];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Calendrier</h3>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={32} className="mx-auto text-neutral-300 mb-2" />
            <p className="text-sm text-neutral-600">Aucun événement à venir</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => {
              const badge = getEventBadge(event.type);
              return (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg transition-all ${
                    event.isToday
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div className="text-center min-w-[48px]">
                    <div className="text-xs text-neutral-500 uppercase">
                      {formatDate(event.date)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        event.isToday ? 'font-bold text-neutral-900' : 'text-neutral-700'
                      }`}
                    >
                      {event.label}
                    </p>
                    <Badge className={`mt-1 text-xs ${badge.className}`}>
                      {badge.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
