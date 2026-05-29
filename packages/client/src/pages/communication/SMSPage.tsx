import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useSMS } from '../../hooks/useSMS';
import { RecipientSelector, Recipient } from '../../components/communication/RecipientSelector';
import { SMSTemplates } from '../../components/communication/SMSTemplates';
import { SMSPreview } from '../../components/communication/SMSPreview';
import { SMSHistory } from '../../components/communication/SMSHistory';
import {
  CreditCard, Send, Clock, AlertTriangle, History, X,
  MessageSquare, Loader2, CalendarClock, Zap,
  CheckCircle, AlertCircle, TrendingDown, TrendingUp,
  Shield, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Step indicator ───────────────────────────────────────────────────
function StepIndicator({ step, currentStep }: { step: number; currentStep: number }) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
        transition-all duration-300
        ${isCompleted
          ? 'bg-[#1B5E20] text-white shadow-md shadow-green-200'
          : isActive
            ? 'bg-[#1B5E20] text-white ring-4 ring-[#1B5E20]/20 shadow-md'
            : 'bg-gray-200 text-gray-500'
        }
      `}>
        {isCompleted ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function SMSPage() {
  const { balance, isLoadingBalance, stats, sendSMS, isSending } = useSMS();
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [template, setTemplate] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('08:00');

  // Derived data
  const smsCount = Math.ceil(template.length / 160) || 1;
  const validRecipients = useMemo(
    () => selectedRecipients.filter(r => /^\+243[89]\d{8}$/.test(r.phone.replace(/\s+/g, ''))),
    [selectedRecipients]
  );
  const totalSMSToSend = validRecipients.length * smsCount;
  const totalCost = totalSMSToSend * 25;
  const currentBalance = balance?.balance ?? stats?.balance ?? 2450;
  const balanceAfterSend = currentBalance - totalSMSToSend;
  const canSend = validRecipients.length > 0 && template.trim().length > 0;

  // Stats data
  const sentThisMonth = stats?.sentThisMonth ?? 847;
  const sentLastMonth = stats?.sentLastMonth ?? 962;
  const pending = stats?.pending ?? 0;
  const failedThisMonth = stats?.failedThisMonth ?? 12;
  const totalThisMonth = stats?.totalThisMonth ?? 859;
  const failRate = totalThisMonth > 0 ? ((failedThisMonth / totalThisMonth) * 100).toFixed(1) : '0';
  const trend = sentLastMonth > 0 ? Math.round(((sentThisMonth - sentLastMonth) / sentLastMonth) * 100) : 0;

  // ── Check if outside business hours ─────────────────
  const isOutsideBusinessHours = () => {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 7;
  };

  // ── Handle send ─────────────────────────────────────
  const handleSendClick = () => {
    if (!canSend) {
      if (selectedRecipients.length === 0) {
        toast.error('Veuillez sélectionner au moins un destinataire');
      } else {
        toast.error('Veuillez définir un message à envoyer');
      }
      return;
    }

    if (currentBalance < totalSMSToSend) {
      toast.error('Solde SMS insuffisant. Veuillez recharger votre compte.');
      return;
    }

    if (isOutsideBusinessHours()) {
      toast('⚠️ Heure tardive (22h-7h). Nous recommandons de programmer l\'envoi pour 8h.', { icon: '🌙' });
      setShowScheduleModal(true);
      return;
    }

    if (validRecipients.length > 100) {
      setShowConfirmModal(true);
    } else {
      handleConfirmSend();
    }
  };

  const handleConfirmSend = async (scheduledAt?: string) => {
    try {
      const result = await sendSMS({
        recipients: validRecipients.map(r => ({ phone: r.phone, variables: r.variables })),
        template,
        scheduledAt,
      });

      setShowConfirmModal(false);
      setShowScheduleModal(false);

      if (scheduledAt) {
        toast.success(`📅 ${result.validRecipients} SMS programmés pour le ${new Date(scheduledAt).toLocaleString('fr-FR')}`);
      } else {
        toast.success(`✅ Envoi initié : ${result.validRecipients} SMS (coût estimé : ${result.estimatedCost?.toLocaleString('fr-FR')} FC)`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de l'envoi des SMS");
    }
  };

  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Veuillez remplir la date et l\'heure');
      return;
    }
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    handleConfirmSend(scheduledAt);
  };

  // ── Stats cards config ──────────────────────────────
  const statCards = [
    {
      label: 'Solde SMS',
      value: isLoadingBalance ? '...' : currentBalance.toLocaleString('fr-FR'),
      subtext: currentBalance < 500 ? '⚠️ Solde bas — Recharger' : 'Crédit disponible',
      icon: CreditCard,
      color: '#0D47A1',
      bgGradient: 'from-blue-50 to-blue-100/30',
      borderColor: 'border-l-[#0D47A1]',
      subtextColor: currentBalance < 500 ? 'text-red-500' : 'text-gray-500',
    },
    {
      label: 'Envoyés ce mois',
      value: sentThisMonth.toLocaleString('fr-FR'),
      subtext: `${trend >= 0 ? '+' : ''}${trend}% vs mois dernier`,
      icon: Send,
      color: '#1B5E20',
      bgGradient: 'from-green-50 to-green-100/30',
      borderColor: 'border-l-[#1B5E20]',
      subtextColor: trend >= 0 ? 'text-green-600' : 'text-red-500',
      trendIcon: trend >= 0 ? TrendingUp : TrendingDown,
    },
    {
      label: 'En attente',
      value: pending.toString(),
      subtext: pending === 0 ? 'Aucun envoi en cours' : `${pending} SMS dans la file`,
      icon: Clock,
      color: '#F57F17',
      bgGradient: 'from-yellow-50 to-yellow-100/30',
      borderColor: 'border-l-[#F57F17]',
      subtextColor: 'text-gray-500',
    },
    {
      label: 'Échecs ce mois',
      value: failedThisMonth.toString(),
      subtext: `${failRate}% taux échec`,
      icon: AlertTriangle,
      color: '#C62828',
      bgGradient: 'from-red-50 to-red-100/30',
      borderColor: 'border-l-[#C62828]',
      subtextColor: parseFloat(failRate) > 5 ? 'text-red-500' : 'text-gray-500',
    },
  ];

  return (
    <div className="min-h-full">
      {/* ── Page header ──────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-[#1B5E20]" />
              Envoi SMS Groupés
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Envoyez des SMS personnalisés aux parents, élèves et enseignants
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`gap-2 transition-all duration-200 ${
              isHistoryOpen
                ? 'bg-[#1B5E20] text-white border-[#1B5E20] hover:bg-[#2E7D32]'
                : 'hover:border-[#1B5E20] hover:text-[#1B5E20]'
            }`}
          >
            <History className="h-4 w-4" />
            Historique
          </Button>
        </div>
      </div>

      {/* ── Stats cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((stat, i) => (
          <Card
            key={i}
            className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stat.color + '15' }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 truncate">{stat.label}</p>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{stat.value}</h3>
                <p className={`text-[10px] font-medium ${stat.subtextColor} flex items-center gap-0.5 mt-0.5`}>
                  {stat.trendIcon && <stat.trendIcon className="h-3 w-3" />}
                  {stat.subtext}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: SMS form */}
        <div className="flex-1 space-y-6">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {[1, 2, 3].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <StepIndicator
                    step={step}
                    currentStep={
                      selectedRecipients.length === 0 ? 1
                      : !template.trim() ? 2
                      : 3
                    }
                  />
                  <span className="text-xs font-medium text-gray-500 hidden sm:inline">
                    {step === 1 ? 'Destinataires' : step === 2 ? 'Message' : 'Aperçu'}
                  </span>
                </div>
                {i < 2 && (
                  <div className="w-8 sm:w-12 h-px bg-gray-300" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Recipients */}
          <div>
            <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#1B5E20] text-white flex items-center justify-center text-[10px] font-bold">1</span>
              Destinataires
            </h2>
            <RecipientSelector onSelectionChange={setSelectedRecipients} />
          </div>

          {/* Step 2: Message */}
          <div>
            <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#0D47A1] text-white flex items-center justify-center text-[10px] font-bold">2</span>
              Message
            </h2>
            <SMSTemplates onTemplateChange={setTemplate} />
          </div>

          {/* Step 3: Preview */}
          <div>
            <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#F57F17] text-white flex items-center justify-center text-[10px] font-bold">3</span>
              Prévisualisation
            </h2>
            <SMSPreview recipients={selectedRecipients} template={template} />
          </div>

          {/* ── Action bar ───────────────────────────────── */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Summary */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {canSend && (
                  <>
                    <span className="flex items-center gap-1">
                      <Send className="h-3 w-3" />
                      <span className="font-semibold text-gray-700">{validRecipients.length}</span> dest.
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span className="font-semibold text-gray-700">{totalSMSToSend}</span> SMS
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-[#1B5E20]">
                      {totalCost.toLocaleString('fr-FR')} FC
                    </span>
                  </>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleModal(true)}
                  disabled={!canSend || isSending}
                  className="flex-1 sm:flex-initial gap-1.5 text-xs"
                >
                  <CalendarClock className="h-4 w-4" />
                  <span className="hidden sm:inline">Programmer</span>
                </Button>

                <Button
                  onClick={handleSendClick}
                  disabled={!canSend || isSending}
                  className="flex-1 sm:flex-initial gap-1.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white shadow-md shadow-green-200"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Envoyer maintenant
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: History panel */}
        {isHistoryOpen && (
          <div className="w-full lg:w-[400px] lg:min-w-[360px] animate-in slide-in-from-right-5 duration-300">
            <SMSHistory />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CONFIRM MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-[#0F1E12]/55 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-5 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Confirmer l'envoi
                  </h2>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600">Vous allez envoyer :</p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Send className="h-4 w-4 text-[#1B5E20]" /> SMS à envoyer
                    </span>
                    <span className="font-bold text-gray-900">{totalSMSToSend}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#0D47A1]" /> Destinataires
                    </span>
                    <span className="font-bold text-gray-900">{validRecipients.length} parents</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 border border-green-200">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#F57F17]" /> Coût total
                    </span>
                    <span className="font-bold text-[#1B5E20] text-lg">{totalCost.toLocaleString('fr-FR')} FC</span>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Solde actuel :</span>
                    <span className="font-semibold text-gray-800">{currentBalance.toLocaleString('fr-FR')} SMS</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Solde après envoi :</span>
                    <span className={`font-semibold ${balanceAfterSend < 500 ? 'text-red-600' : 'text-green-700'}`}>
                      {balanceAfterSend.toLocaleString('fr-FR')} SMS
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800">Cette action est irréversible. Les SMS ne peuvent pas être rappelés après envoi.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleConfirmSend()}
                    disabled={isSending}
                    className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white gap-1.5"
                  >
                    {isSending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</>
                    ) : (
                      <><Zap className="h-4 w-4" /> Envoyer maintenant</>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          SCHEDULE MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-[#0F1E12]/55 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] p-5 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarClock className="h-5 w-5" />
                    Programmer l'envoi
                  </h2>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date d'envoi *
                    </label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Heure d'envoi *
                    </label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Les <span className="font-semibold">{totalSMSToSend} SMS</span> seront envoyés automatiquement à la date et heure spécifiées.
                    Vous pourrez annuler l'envoi programmé depuis l'historique.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSchedule}
                    disabled={isSending || !scheduleDate || !scheduleTime}
                    className="flex-1 bg-[#0D47A1] hover:bg-[#1565C0] text-white gap-1.5"
                  >
                    {isSending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Programmation...</>
                    ) : (
                      <><CalendarClock className="h-4 w-4" /> Programmer</>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
