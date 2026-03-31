import { useState, useCallback } from 'react';
import {
  History, TrendingUp, CalendarDays, CalendarCheck,
  Download, BarChart3, Loader2, Receipt,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  AlertCircle,
} from 'lucide-react';
import { formatFC } from '@edugoma360/shared';
import { usePaymentHistory } from '../../hooks/usePaymentHistory';
import type { PaymentHistoryFilters, PaymentHistoryItem } from '../../hooks/usePaymentHistory';
import { PaymentFilters } from '../../components/finance/PaymentFilters';
import { PaymentRow, PaymentCard } from '../../components/finance/PaymentRow';
import { PaymentDetailsModal } from '../../components/finance/PaymentDetailsModal';
import { CancelPaymentModal } from '../../components/finance/CancelPaymentModal';
import toast from 'react-hot-toast';

export default function PaymentsHistoryPage() {
  // ── Filters state ──────────────────────────────────────────────────
  const [filters, setFilters] = useState<PaymentHistoryFilters>({
    page: 1,
    limit: 50,
  });

  // ── Modal state ────────────────────────────────────────────────────
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ── Export state ───────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────
  const { getPayments, exportPayments, generateReport } = usePaymentHistory();
  const { data, isLoading, isError, refetch } = getPayments(filters);

  const payments = data?.data || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.pages || 1;
  const stats = data?.stats || { todayTotal: 0, weekTotal: 0, monthTotal: 0 };

  // ── Handlers ───────────────────────────────────────────────────────
  const handleFiltersChange = useCallback((newFilters: PaymentHistoryFilters) => {
    setFilters(newFilters);
  }, []);

  const handleViewDetails = (payment: PaymentHistoryItem) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handlePrintReceipt = (payment: PaymentHistoryItem) => {
    if (payment.receiptUrl) {
      window.open(payment.receiptUrl, '_blank');
    } else {
      window.open(`/api/payments/${payment.id}/receipt`, '_blank');
    }
  };

  const handleCancelPayment = (payment: PaymentHistoryItem) => {
    setSelectedPayment(payment);
    setShowDetailsModal(false);
    setShowCancelModal(true);
  };

  const handleCancelSuccess = () => {
    setShowCancelModal(false);
    setSelectedPayment(null);
    refetch();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportPayments(filters);
      toast.success('Export Excel téléchargé !');
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  const handleReport = async () => {
    setIsGeneratingReport(true);
    try {
      await generateReport(filters);
      toast.success('Rapport généré !');
    } catch {
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // ── Stat cards data ────────────────────────────────────────────────
  const statCards = [
    {
      label: "Aujourd'hui",
      value: stats.todayTotal,
      icon: CalendarDays,
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/20',
      bgLight: 'bg-emerald-50',
    },
    {
      label: 'Cette semaine',
      value: stats.weekTotal,
      icon: CalendarCheck,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20',
      bgLight: 'bg-blue-50',
    },
    {
      label: 'Ce mois',
      value: stats.monthTotal,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/20',
      bgLight: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
            <History size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Historique des Paiements
            </h1>
            <p className="text-sm text-neutral-500">
              Consultation, recherche et export des encaissements
            </p>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                       bg-gradient-to-r from-emerald-600 to-emerald-500 text-white
                       rounded-xl hover:shadow-lg hover:shadow-emerald-500/25
                       transition-all duration-200 shadow-md
                       disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isExporting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>
          <button
            onClick={handleReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                       bg-gradient-to-r from-primary to-primary-light text-white
                       rounded-xl hover:shadow-lg hover:shadow-primary/25
                       transition-all duration-200 shadow-md
                       disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isGeneratingReport ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <BarChart3 size={15} />
            )}
            <span className="hidden sm:inline">Rapport</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-neutral-300/50 p-5 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] sm:text-xs text-neutral-500 uppercase font-semibold tracking-wider">
                  {card.label}
                </p>
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.gradient} ${card.shadow}
                              flex items-center justify-center shadow-lg
                              group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={16} className="text-white" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-mono tracking-tight">
                {formatFC(card.value)}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <PaymentFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* ── Payments Table ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden shadow-sm transition-opacity duration-200">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-neutral-500">Chargement des paiements…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-sm text-neutral-700 font-medium">Erreur de chargement</p>
            <p className="text-xs text-neutral-500 mt-1">Impossible de récupérer les paiements.</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-2 text-xs font-medium text-primary bg-primary/10 rounded-lg
                         hover:bg-primary/20 transition-colors w-full sm:w-auto"
            >
              Réessayer
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
              <Receipt className="w-7 h-7 text-neutral-300" />
            </div>
            <p className="text-sm text-neutral-700 font-medium">Aucun paiement trouvé</p>
            <p className="text-xs text-neutral-500 mt-1 text-center max-w-xs">
              Essayez de modifier vos filtres ou vérifiez que des paiements ont été enregistrés.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Reçu</th>
                    <th className="px-4 py-3 text-left">Élève</th>
                    <th className="px-4 py-3 text-right">Montant</th>
                    <th className="px-4 py-3 text-left">Mode</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Statut</th>
                    <th className="px-4 py-3 text-left w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                      onViewDetails={handleViewDetails}
                      onPrintReceipt={handlePrintReceipt}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              {payments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onViewDetails={handleViewDetails}
                  onPrintReceipt={handlePrintReceipt}
                />
              ))}
            </div>

            {/* ── Pagination ──────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-500">
                Total : <span className="font-semibold text-neutral-700">{total}</span> paiement{total > 1 ? 's' : ''}
                <span className="text-neutral-300 mx-1.5">|</span>
                Affichage : {filters.limit || 50}/page
              </p>

              {/* Desktop pagination */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 
                             disabled:cursor-not-allowed transition-colors"
                  title="Première page"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 
                             disabled:cursor-not-allowed transition-colors"
                  title="Page précédente"
                >
                  <ChevronLeft size={14} />
                </button>

                {generatePageNumbers(currentPage, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="px-1 text-neutral-400 text-xs">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p as number)}
                      className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-all duration-150 ${
                        currentPage === p
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 
                             disabled:cursor-not-allowed transition-colors"
                  title="Page suivante"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-30 
                             disabled:cursor-not-allowed transition-colors"
                  title="Dernière page"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>

              {/* Mobile pagination */}
              <div className="flex sm:hidden items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg bg-neutral-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs text-neutral-600 font-medium">
                  Page {currentPage}/{totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg bg-neutral-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {showDetailsModal && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPayment(null);
          }}
          onCancelPayment={handleCancelPayment}
        />
      )}

      {showCancelModal && selectedPayment && (
        <CancelPaymentModal
          payment={selectedPayment}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedPayment(null);
          }}
          onCancelled={handleCancelSuccess}
        />
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}
