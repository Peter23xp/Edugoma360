import { CheckCircle, XCircle, ClipboardList, RefreshCw } from 'lucide-react';

interface StatusBarProps {
  cashSession: { isOpen: boolean; cashierName: string | null; openedAt: string | null };
  classesDone: number;
  classesTotal: number;
  lastSync?: string;
}

function timeAgo(isoString: string): string {
  const mins = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.floor(mins / 60);
  return `il y a ${h}h`;
}

export default function StatusBar({ cashSession, classesDone, classesTotal, lastSync }: StatusBarProps) {
  const allClassesDone = classesTotal > 0 && classesDone >= classesTotal;

  return (
    <div className="bg-[#1B5E20]/5 border-b border-[#1B5E20]/20 px-4 py-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
        <span className="flex items-center gap-1.5">
          {cashSession.isOpen ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          )}
          {cashSession.isOpen
            ? `Caisse ouverte${cashSession.cashierName ? ` (${cashSession.cashierName})` : ''}${cashSession.openedAt ? ` · ${timeAgo(cashSession.openedAt)}` : ''}`
            : 'Caisse fermée'}
        </span>

        {classesTotal > 0 && (
          <>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <ClipboardList className={`w-3.5 h-3.5 ${allClassesDone ? 'text-green-600' : 'text-orange-500'}`} />
              Appel : {classesDone}/{classesTotal} classe{classesTotal > 1 ? 's' : ''}
            </span>
          </>
        )}

        {lastSync && (
          <>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-gray-400" />
              Sync : {timeAgo(lastSync)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
