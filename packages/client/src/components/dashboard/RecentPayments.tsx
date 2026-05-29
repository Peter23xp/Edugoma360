import { Banknote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Payment {
  studentNom: string;
  amount: number;
  method: string;
  minutesAgo: number;
}

interface Props {
  payments: Payment[];
  isLoading?: boolean;
}

function timeLabel(minutes: number): string {
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

export default function RecentPayments({ payments, isLoading }: Props) {
  return (
    <div className="bg-white border rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-green-600" />
          Derniers paiements
        </h3>
        <Link to="/finance/payments" className="text-xs text-[#1B5E20] hover:underline flex items-center gap-0.5">
          Voir tous <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : payments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucun paiement récent</p>
      ) : (
        <ul className="space-y-2">
          {payments.map((p, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <div className="min-w-0">
                <p className="font-medium truncate">{p.studentNom}</p>
                <p className="text-xs text-gray-400">{p.method} · {timeLabel(p.minutesAgo)}</p>
              </div>
              <span className="font-bold text-green-700 shrink-0 ml-2">
                +{p.amount.toLocaleString('fr-FR')} FC
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
