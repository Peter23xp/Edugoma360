import { Eye, Printer, Ban, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { formatFC, PAYMENT_METHODS } from '@edugoma360/shared';
import type { PaymentHistoryItem } from '../../hooks/usePaymentHistory';

interface PaymentRowProps {
  payment: PaymentHistoryItem;
  onViewDetails: (payment: PaymentHistoryItem) => void;
  onPrintReceipt: (payment: PaymentHistoryItem) => void;
  index: number;
}

const METHOD_ICONS: Record<string, { bg: string; text: string; dot: string }> = {
  CASH: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  ESPECES: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  MOBILE_MONEY: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  MPESA: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  AIRTEL_MONEY: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  ORANGE_MONEY: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  BANK_TRANSFER: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  VIREMENT: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  CHECK: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
};

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  COMPLETED: { label: 'Complété', classes: 'bg-green-50 text-green-700' },
  PAID: { label: 'Payé', classes: 'bg-green-50 text-green-700' },
  PARTIAL: { label: 'Partiel', classes: 'bg-amber-50 text-amber-700' },
  CANCELLED: { label: 'Annulé', classes: 'bg-red-50 text-red-700 line-through' },
  PENDING: { label: 'En attente', classes: 'bg-blue-50 text-blue-700' },
};

export function PaymentRow({ payment, onViewDetails, onPrintReceipt, index }: PaymentRowProps) {
  const paymentDate = new Date(payment.paidAt || payment.createdAt);
  const dateStr = paymentDate.toLocaleDateString('fr-CD', {
    day: '2-digit',
    month: '2-digit',
  });
  const timeStr = paymentDate.toLocaleTimeString('fr-CD', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const methodKey = payment.paymentMethod || payment.paymentMode || 'CASH';
  const methodColors = METHOD_ICONS[methodKey] || METHOD_ICONS.CASH;
  const methodLabel =
    PAYMENT_METHODS[methodKey as keyof typeof PAYMENT_METHODS] ||
    methodKey.replace(/_/g, ' ');

  const studentName = payment.student
    ? `${payment.student.nom} ${payment.student.postNom}${payment.student.prenom ? ' ' + payment.student.prenom : ''}`
    : '—';

  const studentClass =
    payment.student?.enrollments?.[0]?.class?.name || '';

  const status = payment.status || 'COMPLETED';
  const statusInfo = STATUS_MAP[status] || STATUS_MAP.COMPLETED;
  const isCancelled = status === 'CANCELLED';

  return (
    <tr
      className={`group border-b border-neutral-100 last:border-0 transition-all duration-150
        ${isCancelled ? 'bg-red-50/10 opacity-70' : 'hover:bg-neutral-50'}`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Date & Time */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="text-sm font-semibold text-neutral-900">{dateStr}</div>
        <div className="text-[11px] text-neutral-400 font-mono">{timeStr}</div>
      </td>

      {/* Receipt Number */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className={`font-mono text-sm font-semibold ${isCancelled ? 'line-through text-neutral-400' : 'text-primary'}`}>
          {payment.receiptNumber}
        </span>
      </td>

      {/* Student */}
      <td className="px-4 py-3.5">
        <div className={`text-sm font-medium truncate max-w-[180px] ${isCancelled ? 'text-neutral-400' : 'text-neutral-900'}`}>
          {studentName}
        </div>
        {studentClass && (
          <div className="text-[11px] text-neutral-400 truncate">{studentClass}</div>
        )}
      </td>

      {/* Amount */}
      <td className="px-4 py-3.5 whitespace-nowrap text-right">
        <span className={`text-sm font-bold font-mono ${isCancelled ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
          {formatFC(payment.amountPaid)}
        </span>
      </td>

      {/* Payment Method */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${methodColors.bg} ${methodColors.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${methodColors.dot}`} />
          {methodLabel}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 whitespace-nowrap hidden lg:table-cell">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusInfo.classes}`}>
          {statusInfo.label}
        </span>
      </td>

      {/* Actions */}
      <td className="w-12 px-2 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 
                         hover:bg-neutral-100 transition-colors opacity-0 group-hover:opacity-100
                         focus:opacity-100"
              aria-label="Actions"
            >
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onViewDetails(payment)}>
              <Eye size={14} className="mr-2" />
              Voir détails
            </DropdownMenuItem>
            {!isCancelled && (
              <DropdownMenuItem onClick={() => onPrintReceipt(payment)}>
                <Printer size={14} className="mr-2" />
                Imprimer reçu
              </DropdownMenuItem>
            )}
            {isCancelled && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="text-red-400 focus:bg-transparent">
                  <Ban size={14} className="mr-2" />
                  Paiement annulé
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

// ── Mobile Card Variant ─────────────────────────────────────────────────────
export function PaymentCard({ payment, onViewDetails, onPrintReceipt }: Omit<PaymentRowProps, 'index'>) {
  const paymentDate = new Date(payment.paidAt || payment.createdAt);
  const dateStr = paymentDate.toLocaleDateString('fr-CD', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = paymentDate.toLocaleTimeString('fr-CD', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const methodKey = payment.paymentMethod || payment.paymentMode || 'CASH';
  const methodColors = METHOD_ICONS[methodKey] || METHOD_ICONS.CASH;
  const methodLabel =
    PAYMENT_METHODS[methodKey as keyof typeof PAYMENT_METHODS] ||
    methodKey.replace(/_/g, ' ');

  const studentName = payment.student
    ? `${payment.student.nom} ${payment.student.postNom}`
    : '—';

  const studentClass =
    payment.student?.enrollments?.[0]?.class?.name || '';

  const isCancelled = payment.status === 'CANCELLED';

  return (
    <div
      className={`bg-white rounded-xl border p-4 space-y-3 transition-all duration-200
        ${isCancelled ? 'border-red-200 bg-red-50/30' : 'border-neutral-200 hover:shadow-md hover:border-neutral-300'}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-sm font-bold ${isCancelled ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
            {studentName}
          </div>
          {studentClass && (
            <div className="text-[11px] text-neutral-400">{studentClass}</div>
          )}
        </div>
        <span className={`font-mono text-sm font-bold ${isCancelled ? 'text-neutral-400 line-through' : 'text-primary'}`}>
          {formatFC(payment.amountPaid)}
        </span>
      </div>

      {/* Details row */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="font-mono text-neutral-500">{payment.receiptNumber}</span>
        <span className="text-neutral-300">•</span>
        <span className="text-neutral-500">{dateStr} {timeStr}</span>
        <span className="text-neutral-300">•</span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${methodColors.bg} ${methodColors.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${methodColors.dot}`} />
          {methodLabel}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
        <button
          onClick={() => onViewDetails(payment)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                     text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
        >
          <Eye size={13} /> Détails
        </button>
        {!isCancelled && (
          <button
            onClick={() => onPrintReceipt(payment)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                       text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Printer size={13} /> Reçu
          </button>
        )}
      </div>
    </div>
  );
}
