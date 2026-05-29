import { UserX, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AbsentStudent {
  studentId: string;
  nom: string;
  postNom: string;
  className: string;
  isConsecutive: boolean;
}

interface Props {
  absences: AbsentStudent[];
  isLoading?: boolean;
}

export default function TodayAbsences({ absences, isLoading }: Props) {
  return (
    <div className="bg-white border rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <UserX className="w-4 h-4 text-red-500" />
          Absences du jour
          {absences.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full ml-1">
              {absences.length}
            </span>
          )}
        </h3>
        <Link to="/attendance/history" className="text-xs text-[#1B5E20] hover:underline flex items-center gap-0.5">
          Historique <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : absences.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucune absence enregistrée</p>
      ) : (
        <ul className="space-y-1.5">
          {absences.slice(0, 6).map((a) => (
            <li key={a.studentId} className="flex items-center justify-between text-sm">
              <span className="truncate">
                {a.nom} {a.postNom}
                <span className="text-gray-400 text-xs ml-1">({a.className})</span>
              </span>
              {a.isConsecutive && (
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 ml-1" aria-label="3e absence consécutive" />
              )}
            </li>
          ))}
          {absences.length > 6 && (
            <li className="text-xs text-gray-400 text-center pt-1">+{absences.length - 6} autres</li>
          )}
        </ul>
      )}
    </div>
  );
}
