import { useState, useEffect, useCallback } from 'react';
import {
  Search, Calendar, User, CreditCard, Filter,
  ChevronDown, X, Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useClassesList } from '../../hooks/useClassesList';
import { PAYMENT_METHODS } from '@edugoma360/shared';
import type { PaymentHistoryFilters as Filters } from '../../hooks/usePaymentHistory';

interface PaymentFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

type PeriodPreset = 'today' | 'week' | 'month' | 'lastMonth' | 'custom' | 'all';

function getPresetDates(preset: PeriodPreset): { startDate?: string; endDate?: string } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today };
    case 'week': {
      const dayOfWeek = now.getDay() || 7; // Monday = 1
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek + 1);
      return { startDate: monday.toISOString().split('T')[0], endDate: today };
    }
    case 'month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: firstDay.toISOString().split('T')[0], endDate: today };
    }
    case 'lastMonth': {
      const firstDayLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLast = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: firstDayLast.toISOString().split('T')[0],
        endDate: lastDayLast.toISOString().split('T')[0],
      };
    }
    case 'all':
      return {};
    default:
      return {};
  }
}

export function PaymentFilters({ filters, onFiltersChange }: PaymentFiltersProps) {
  const [period, setPeriod] = useState<PeriodPreset>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [receiptSearch, setReceiptSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentLabel, setSelectedStudentLabel] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch classes for filter
  const { data: classes = [] } = useClassesList();

  // Fetch cashiers (users with COMPTABLE/TRESORIER roles)
  const { data: cashiersData } = useQuery({
    queryKey: ['cashiers-list'],
    queryFn: async () => {
      try {
        const res = await api.get('/users?roles=ECONOME,PREFET,SUPER_ADMIN');
        return res.data?.data || res.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60_000,
  });
  const cashiers = Array.isArray(cashiersData) ? cashiersData : [];

  // Student search with debounce
  const { data: studentResults, isLoading: studentLoading } = useQuery({
    queryKey: ['student-search-filter', studentSearch],
    queryFn: async () => {
      if (studentSearch.length < 2) return null;
      const res = await api.get(`/students?search=${studentSearch}&limit=6`);
      return res.data;
    },
    enabled: studentSearch.length >= 2,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, receiptNumber: receiptSearch || undefined, page: 1 });
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptSearch]);

  // Student name search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only apply text search if a specific student hasn't been selected from dropdown
      if (!selectedStudentLabel && (studentSearch.length >= 2 || studentSearch.length === 0)) {
        onFiltersChange({ ...filters, search: studentSearch || undefined, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentSearch, selectedStudentLabel]);

  // Period preset change
  const handlePeriodChange = useCallback(
    (preset: PeriodPreset) => {
      setPeriod(preset);
      if (preset !== 'custom') {
        const { startDate, endDate } = getPresetDates(preset);
        onFiltersChange({ ...filters, startDate, endDate, page: 1 });
      }
    },
    [filters, onFiltersChange],
  );

  // Custom date change
  const handleCustomDates = () => {
    if (customStart) {
      onFiltersChange({
        ...filters,
        startDate: customStart,
        endDate: customEnd || undefined,
        page: 1,
      });
    }
  };

  const handleStudentSelect = (student: any) => {
    setSelectedStudentLabel(`${student.nom} ${student.postNom}`);
    setStudentSearch('');
    setShowStudentDropdown(false);
    onFiltersChange({ ...filters, studentId: student.id, search: undefined, page: 1 });
  };

  const clearStudentFilter = () => {
    setSelectedStudentLabel('');
    setStudentSearch('');
    onFiltersChange({ ...filters, studentId: undefined, search: undefined, page: 1 });
  };

  const clearAllFilters = () => {
    setPeriod('all');
    setCustomStart('');
    setCustomEnd('');
    setReceiptSearch('');
    setStudentSearch('');
    setSelectedStudentLabel('');
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.studentId ||
    filters.classId ||
    filters.paymentMethod ||
    filters.cashierId ||
    filters.receiptNumber ||
    filters.search;

  const periodPresets: { id: PeriodPreset; label: string }[] = [
    { id: 'all', label: 'Tout' },
    { id: 'today', label: "Aujourd'hui" },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'lastMonth', label: 'Mois dernier' },
    { id: 'custom', label: 'Personnalisé' },
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-300/50 p-4 shadow-sm">
      {/* ── Quick period presets ──────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-neutral-100 flex flex-wrap items-center gap-2">
        <Calendar size={14} className="text-neutral-400 shrink-0" />
        <div className="flex flex-wrap gap-1.5">
          {periodPresets.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePeriodChange(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                ${period === p.id
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Toggle advanced filters */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                      transition-all duration-200 border
            ${showFilters
              ? 'bg-primary/10 border-primary/20 text-primary'
              : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }`}
        >
          <Filter size={13} />
          <span className="hidden sm:inline">Filtres avancés</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium
                       text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <X size={12} /> Effacer
          </button>
        )}
      </div>

      {/* ── Custom date range ────────────────────────────────────── */}
      {period === 'custom' && (
        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1 block">
              Date début
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm
                         focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all
                         hover:border-neutral-400"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1 block">
              Date fin
            </label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm
                         focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all
                         hover:border-neutral-400"
            />
          </div>
          <button
            onClick={handleCustomDates}
            disabled={!customStart}
            className="h-10 px-4 text-sm font-semibold bg-primary text-white rounded-lg
                       hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Appliquer
          </button>
        </div>
      )}

      {/* ── Advanced filters ─────────────────────────────────────── */}
      <div
        className={`grid transition-all duration-300 ease-in-out
          ${showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 py-4 border-b border-neutral-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* ── Student search ──────────────────────────── */}
              <div className="relative">
                <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1 block">
                  Élève
                </label>
                {selectedStudentLabel ? (
                  <div className="flex items-center h-10 px-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                    <User size={14} className="text-primary mr-2 shrink-0" />
                    <span className="truncate text-sm font-medium text-neutral-900">
                      {selectedStudentLabel}
                    </span>
                    <button
                      onClick={clearStudentFilter}
                      className="ml-auto text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Nom ou matricule..."
                        value={studentSearch}
                        onChange={(e) => {
                          setStudentSearch(e.target.value);
                          setShowStudentDropdown(true);
                        }}
                        onFocus={() => setShowStudentDropdown(true)}
                        className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg text-sm
                                   focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all
                                   hover:border-neutral-400"
                      />
                      {studentLoading && (
                        <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin" />
                      )}
                    </div>
                    {/* Student dropdown */}
                    {showStudentDropdown && studentResults?.data?.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg
                                      shadow-xl shadow-neutral-200/50 max-h-44 overflow-y-auto">
                        {studentResults.data.map((s: any) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleStudentSelect(s)}
                            className="w-full text-left px-3 py-2.5 hover:bg-neutral-50 transition-colors
                                       flex items-center gap-2 text-sm border-b border-neutral-50 last:border-0"
                          >
                            <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                              <User size={12} className="text-neutral-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-neutral-900 truncate">
                                {s.nom} {s.postNom} {s.prenom || ''}
                              </div>
                              <div className="text-[11px] text-neutral-400 font-mono">
                                {s.matricule}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Class ───────────────────────────────────── */}
              <div>
                <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1 block">
                  Classe
                </label>
                <select
                  value={filters.classId || ''}
                  onChange={(e) => onFiltersChange({ ...filters, classId: e.target.value, page: 1 })}
                  className="w-full appearance-none px-3 py-2.5 pr-8 border border-neutral-300
                             rounded-lg text-sm bg-white hover:border-neutral-400
                             focus:ring-2 focus:ring-primary/20 focus:border-primary
                             outline-none transition-all duration-200 cursor-pointer"
                >
                  <option value="">Toutes les classes</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ── Payment method ──────────────────────────── */}
              <div>
                <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1 block">
                  Mode de paiement
                </label>
                <select
                  value={filters.paymentMethod || ''}
                  onChange={(e) => onFiltersChange({ ...filters, paymentMethod: e.target.value, page: 1 })}
                  className="w-full appearance-none px-3 py-2.5 pr-8 border border-neutral-300
                             rounded-lg text-sm bg-white hover:border-neutral-400
                             focus:ring-2 focus:ring-primary/20 focus:border-primary
                             outline-none transition-all duration-200 cursor-pointer"
                >
                  <option value="">Tous les modes</option>
                  {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* ── Cashier ─────────────────────────────────── */}
              <div>
                <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1 block">
                  Caissier
                </label>
                  <select
                    value={filters.cashierId || ''}
                    onChange={(e) => onFiltersChange({ ...filters, cashierId: e.target.value, page: 1 })}
                    className="w-full appearance-none px-3 py-2.5 pr-8 border border-neutral-300
                               rounded-lg text-sm bg-white hover:border-neutral-400
                               focus:ring-2 focus:ring-primary/20 focus:border-primary
                               outline-none transition-all duration-200 cursor-pointer"
                  >
                  <option value="">Tous les caissiers</option>
                  {cashiers.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.nom} {u.postNom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Receipt search bar ───────────────────────────────────── */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par n° de reçu..."
            value={receiptSearch}
            onChange={(e) => setReceiptSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg
                       focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none
                       text-sm transition-all duration-200 bg-neutral-100/30
                       hover:border-neutral-400 placeholder:text-neutral-400"
          />
        </div>

        {/* Active filters badges */}
        <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
          {filters.startDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium">
              <Calendar size={11} />
              {filters.startDate}
              {filters.endDate && ` → ${filters.endDate}`}
            </span>
          )}
          {filters.paymentMethod && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-medium">
              <CreditCard size={11} />
              {PAYMENT_METHODS[filters.paymentMethod as keyof typeof PAYMENT_METHODS] || filters.paymentMethod}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
