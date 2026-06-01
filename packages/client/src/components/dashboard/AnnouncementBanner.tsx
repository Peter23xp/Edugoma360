import { useState, useEffect, useRef } from 'react';
import { Info, AlertTriangle, AlertOctagon, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useActiveAnnouncements, Announcement } from '../../hooks/useAnnouncements';

const PRIORITY_STYLES = {
  INFO: {
    wrapper: 'bg-blue-50 border border-[#0D47A1]/25',
    icon: Info,
    iconColor: 'text-[#0D47A1]',
    labelColor: 'text-[#0D47A1]',
    label: 'Info',
  },
  URGENT: {
    wrapper: 'bg-orange-50 border border-[#F57F17]/30',
    icon: AlertTriangle,
    iconColor: 'text-[#F57F17]',
    labelColor: 'text-[#E65100]',
    label: 'Urgent',
  },
  CRITIQUE: {
    wrapper: 'bg-red-50 border border-[#C62828]/30 animate-pulse',
    icon: AlertOctagon,
    iconColor: 'text-[#C62828]',
    labelColor: 'text-[#C62828]',
    label: 'Alerte',
  },
};

function SingleBanner({ ann, onDismiss }: { ann: Announcement; onDismiss: (id: string) => void }) {
  const cfg = PRIORITY_STYLES[ann.priority] ?? PRIORITY_STYLES.INFO;
  const Icon = cfg.icon;
  const [expanded, setExpanded] = useState(false);
  const [canClose, setCanClose] = useState(ann.priority !== 'CRITIQUE');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (ann.priority === 'CRITIQUE') {
      timerRef.current = setTimeout(() => setCanClose(true), 5000);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [ann.priority]);

  return (
    <div className={`rounded-xl px-4 py-3 flex items-start gap-3 ${cfg.wrapper}`}>
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${cfg.labelColor} bg-current/10`}>{cfg.label}</span>
          <span className="text-sm font-semibold text-neutral-900">{ann.titre}</span>
        </div>
        <p className={`text-sm text-neutral-700 mt-0.5 ${!expanded ? 'line-clamp-1' : ''}`}>{ann.message}</p>
        {ann.message.length > 80 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs text-neutral-500 hover:text-neutral-700 flex items-center gap-0.5 mt-1"
          >
            {expanded ? <><ChevronUp className="h-3 w-3" /> Réduire</> : <><ChevronDown className="h-3 w-3" /> Voir plus</>}
          </button>
        )}
      </div>
      {canClose && (
        <button
          onClick={() => onDismiss(ann.id)}
          className="text-neutral-500 hover:text-neutral-700 flex-shrink-0 p-0.5 rounded hover:bg-black/5"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {!canClose && (
        <div className="flex-shrink-0 text-xs text-gray-400 font-mono w-5 text-center" aria-hidden>
          5
        </div>
      )}
    </div>
  );
}

export default function AnnouncementBanner() {
  const { data: announcements = [] } = useActiveAnnouncements();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visible.map((a) => (
        <SingleBanner
          key={a.id}
          ann={a}
          onDismiss={(id) => setDismissed((prev) => new Set([...prev, id]))}
        />
      ))}
    </div>
  );
}
