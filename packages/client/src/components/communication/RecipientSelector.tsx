import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import {
  Users, UserCheck, Phone, AlertCircle, ChevronDown, ChevronUp,
  Filter, BarChart3, Wallet, Eye, Loader2
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────
export interface Recipient {
  phone: string;
  name?: string;
  variables: {
    nom: string;
    prenom?: string;
    classe?: string;
    montant?: number;
    date?: string;
    [key: string]: any;
  };
}

interface RecipientSelectorProps {
  onSelectionChange: (recipients: Recipient[]) => void;
}

// ── Component ────────────────────────────────────────────────────────
export function RecipientSelector({ onSelectionChange }: RecipientSelectorProps) {
  const [targetType, setTargetType] = useState<'PARENTS' | 'TEACHERS' | 'ALL'>('PARENTS');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string[]>([]);
  const [selectedAttendance, setSelectedAttendance] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [showDetailedList, setShowDetailedList] = useState(false);

  // Fetch real classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await api.get('/classes');
      return Array.isArray(data) ? data : data?.data || [];
    }
  });

  // Vrais destinataires depuis l'API
  const { data: recipientsData, isLoading: isLoadingRecipients } = useQuery<{
    recipients: Recipient[];
    validCount: number;
    invalidCount: number;
    estimatedCost: number;
  }>({
    queryKey: ['sms', 'recipients', targetType, selectedClasses, selectedPaymentStatus, selectedAttendance],
    queryFn: async () => {
      const params: Record<string, string> = { type: targetType };
      if (selectedClasses.length > 0) params.classes = selectedClasses.join(',');
      if (selectedPaymentStatus.length > 0) params.paymentStatus = selectedPaymentStatus.join(',');
      if (selectedAttendance.length > 0) params.attendance = selectedAttendance.join(',');
      const { data } = await api.get('/sms/preview-recipients', { params });
      return data;
    },
    staleTime: 30_000,
  });

  const mockRecipients = recipientsData?.recipients ?? [];

  // Derive stats
  const stats = useMemo(() => {
    const validPhones = mockRecipients.filter(r => /^\+243[89]\d{8}$/.test(r.phone.replace(/\s+/g, '')));
    const invalidPhones = mockRecipients.length - validPhones.length;
    const smsCost = validPhones.length * 25;
    return {
      total: mockRecipients.length,
      valid: validPhones.length,
      invalid: invalidPhones,
      cost: smsCost,
    };
  }, [mockRecipients]);

  // Push to parent
  useEffect(() => {
    onSelectionChange(mockRecipients);
  }, [mockRecipients]);

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId) ? prev.filter(c => c !== classId) : [...prev, classId]
    );
  };

  const togglePayment = (status: string) => {
    setSelectedPaymentStatus(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleAttendance = (level: string) => {
    setSelectedAttendance(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const targetOptions = [
    { value: 'PARENTS', label: "Parents d'élèves", icon: Users, description: 'Envoyer aux parents/tuteurs' },
    { value: 'TEACHERS', label: 'Enseignants', icon: UserCheck, description: 'Envoyer au personnel enseignant' },
    { value: 'ALL', label: 'Tous', icon: Users, description: 'Parents + Enseignants' },
  ] as const;

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#1B5E20]/5 to-transparent border-b border-gray-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <Users className="h-5 w-5 text-[#1B5E20]" />
          Envoyer à :
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* ── Target type radio ─────────────────────────────── */}
        <RadioGroup
          value={targetType}
          onValueChange={(val: any) => setTargetType(val)}
          className="space-y-2"
        >
          {targetOptions.map(opt => (
            <label
              key={opt.value}
              htmlFor={`target-${opt.value}`}
              className={`
                flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                transition-all duration-200
                ${targetType === opt.value
                  ? 'border-[#1B5E20] bg-[#E8F5E9]/60 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <RadioGroupItem value={opt.value} id={`target-${opt.value}`} />
              <opt.icon className={`h-4 w-4 ${targetType === opt.value ? 'text-[#1B5E20]' : 'text-gray-400'}`} />
              <div className="flex-1">
                <span className={`text-sm font-medium ${targetType === opt.value ? 'text-[#1B5E20]' : 'text-gray-700'}`}>
                  {opt.label}
                </span>
                <span className="text-xs text-gray-500 ml-2 hidden sm:inline">{opt.description}</span>
              </div>
            </label>
          ))}
        </RadioGroup>

        {/* ── Advanced filters ──────────────────────────────── */}
        {targetType !== 'TEACHERS' && (
          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#1B5E20] transition-colors w-full"
            >
              <Filter className="h-4 w-4" />
              <span className="uppercase tracking-wide text-xs">Filtres avancés</span>
              {showFilters ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
            </button>

            {showFilters && (
              <div className="mt-4 space-y-5 animate-in slide-in-from-top-2 duration-200">
                {/* Classes filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Classes :</Label>
                  <div className="flex flex-wrap gap-2">
                    <label
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer
                        transition-all duration-150
                        ${selectedClasses.length === 0
                          ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B5E20]/40'
                        }
                      `}
                    >
                      <Checkbox
                        id="class-all"
                        checked={selectedClasses.length === 0}
                        onCheckedChange={() => setSelectedClasses([])}
                        className="hidden"
                      />
                      Toutes
                    </label>
                    {Array.isArray(classes) && classes.map((c: any) => (
                      <label
                        key={c.id}
                        className={`
                          flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer
                          transition-all duration-150
                          ${selectedClasses.includes(c.id)
                            ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B5E20]/40'
                          }
                        `}
                      >
                        <Checkbox
                          id={`class-${c.id}`}
                          checked={selectedClasses.includes(c.id)}
                          onCheckedChange={() => toggleClass(c.id)}
                          className="hidden"
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment status filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Statut paiement :</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Tous',               value: '',        color: 'gray'   },
                      { label: 'Impayés',            value: 'IMPAYE',  color: 'red'    },
                      { label: 'Partiellement payé', value: 'PARTIEL', color: 'orange' },
                      { label: 'À jour',             value: 'A_JOUR',  color: 'green'  },
                    ].map(opt => (
                      <label
                        key={opt.value || 'tous'}
                        className={`
                          flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer
                          transition-all duration-150
                          ${selectedPaymentStatus.includes(opt.value)
                            ? opt.color === 'red' ? 'bg-red-600 text-white border-red-600'
                            : opt.color === 'orange' ? 'bg-[#F57F17] text-white border-[#F57F17]'
                            : opt.color === 'green' ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                            : 'bg-gray-600 text-white border-gray-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <Checkbox
                          checked={opt.value === '' ? selectedPaymentStatus.length === 0 : selectedPaymentStatus.includes(opt.value)}
                          onCheckedChange={() => opt.value === '' ? setSelectedPaymentStatus([]) : togglePayment(opt.value)}
                          className="hidden"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Attendance filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Présence (30 derniers jours) :</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Tous', value: 'all' },
                      { label: '< 80%', value: 'below80' },
                      { label: '< 60%', value: 'below60' },
                    ].map(opt => (
                      <label
                        key={opt.value}
                        className={`
                          flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer
                          transition-all duration-150
                          ${selectedAttendance.includes(opt.value)
                            ? 'bg-[#0D47A1] text-white border-[#0D47A1]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <Checkbox
                          checked={selectedAttendance.includes(opt.value)}
                          onCheckedChange={() => toggleAttendance(opt.value)}
                          className="hidden"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Summary section ──────────────────────────────── */}
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/80 border border-gray-200 p-4 space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <BarChart3 className="h-4 w-4 text-[#0D47A1]" />
            Résumé sélection
            {isLoadingRecipients && <Loader2 className="h-3 w-3 animate-spin text-gray-400 ml-1" />}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#1B5E20]/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-[#1B5E20]" />
              </div>
              <div>
                <span className="font-bold text-gray-900">{stats.total}</span>
                <span className="text-gray-500 text-xs ml-1">sélectionnés</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#0D47A1]/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-[#0D47A1]" />
              </div>
              <div>
                <span className="font-bold text-gray-900">{stats.valid}</span>
                <span className="text-gray-500 text-xs ml-1">n° valides</span>
              </div>
            </div>

            {stats.invalid > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <span className="font-bold text-red-600">{stats.invalid}</span>
                  <span className="text-gray-500 text-xs ml-1">manquants</span>
                </div>
              </div>
            )}
          </div>

          {/* Cost estimate */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200/80">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#F57F17]" />
              <span className="text-sm font-medium text-gray-600">Coût estimé :</span>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">{stats.valid} SMS × 25 FC = </span>
              <span className="text-base font-bold text-[#1B5E20]">{stats.cost.toLocaleString('fr-FR')} FC</span>
            </div>
          </div>

          <Button
            variant="link"
            className="p-0 h-auto text-[#0D47A1] text-xs font-medium"
            onClick={() => setShowDetailedList(!showDetailedList)}
          >
            <Eye className="h-3 w-3 mr-1" />
            {showDetailedList ? 'Masquer' : 'Voir'} la liste détaillée
          </Button>

          {/* Detailed list */}
          {showDetailedList && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
              {mockRecipients.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50 transition-colors">
                  <div>
                    <span className="font-medium text-gray-800">{r.name || r.variables.nom}</span>
                    {r.variables.classe && r.variables.classe !== 'N/A' && (
                      <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{r.variables.classe}</Badge>
                    )}
                  </div>
                  <span className="text-gray-500 font-mono">{r.phone}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
