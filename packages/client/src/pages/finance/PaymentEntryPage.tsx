import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Save, FileCheck2, User, Landmark, Receipt } from 'lucide-react';
import { StudentSelector } from '../../components/finance/StudentSelector';
import { FeeSelector } from '../../components/finance/FeeSelector';
import { PaymentForm } from '../../components/finance/PaymentForm';
import { PaymentSummary } from '../../components/finance/PaymentSummary';
import { ReceiptPreview } from '../../components/finance/ReceiptPreview';
import { usePayments } from '../../hooks/usePayments';
import type { PaymentMethod } from '@edugoma360/shared';
import { formatFC } from '@edugoma360/shared';

export function PaymentEntryPage() {
  const [step, setStep] = useState(1);
  const [student, setStudent] = useState<any>(null);
  
  const { getFeesDue, createPayment } = usePayments();
  const { data: feesData, isLoading: isLoadingFees } = getFeesDue(student?.id, !!student);
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
  
  const [amountToPay, setAmountToPay] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [observations, setObservations] = useState('');
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const fees = feesData?.fees || [];
  const selectedFees = fees.filter(f => selectedFeeIds.includes(f.feeId));
  const totalSelectedDue = selectedFees.reduce((sum, f) => sum + f.remainingBalance, 0);

  const steps = [
    { id: 1, label: 'Élève', icon: User },
    { id: 2, label: 'Frais', icon: FileCheck2 },
    { id: 3, label: 'Paiement', icon: Landmark },
  ];

  const handleStudentSelect = (selected: any) => {
    setStudent(selected);
    setSelectedFeeIds([]);
    setAmountToPay('');
    if (selected) setStep(2);
    else setStep(1);
  };

  const handleToggleFee = (feeId: string) => {
    setSelectedFeeIds(prev =>
      prev.includes(feeId) ? prev.filter(id => id !== feeId) : [...prev, feeId]
    );
  };

  const handleSelectAllFees = () => {
    if (selectedFeeIds.length === fees.length) setSelectedFeeIds([]);
    else setSelectedFeeIds(fees.map(f => f.feeId));
  };

  const handleNext = () => {
    if (step === 2 && selectedFeeIds.length === 0) return;
    if (step === 3 && (!amountToPay || Number(amountToPay) <= 0)) return;
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    createPayment.mutate({
      studentId: student.id,
      feeIds: selectedFeeIds,
      amountPaid: Number(amountToPay),
      paymentMethod,
      paymentDate: new Date(paymentDate).toISOString(),
      transactionRef: reference,
      observations
    }, {
      onSuccess: (data) => {
        setPaymentResult(data);
        setStep(4);
      }
    });
  };

  const handleNewPayment = () => {
    setStudent(null);
    setSelectedFeeIds([]);
    setAmountToPay('');
    setPaymentMethod('CASH');
    setPaymentResult(null);
    setStep(1);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
            <Receipt size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Nouvel Encaissement
            </h1>
            <p className="text-sm text-neutral-500">
              Assistant de caisse — étape {step}/3
            </p>
          </div>
        </div>

        {/* Stepper */}
        {step < 4 && (
          <div className="flex items-center gap-1 sm:gap-2 bg-white border border-neutral-300/50 rounded-xl px-3 py-2 shadow-sm">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isPast = step > s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                    ${isActive
                      ? 'bg-primary/10 text-primary'
                      : isPast
                        ? 'text-primary/70'
                        : 'text-neutral-400'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px]
                      ${isActive
                        ? 'bg-primary text-white'
                        : isPast
                          ? 'bg-primary/20 text-primary'
                          : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {isPast ? (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <Icon size={11} strokeWidth={2.5} />
                      )}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-4 sm:w-6 h-[2px] mx-0.5 sm:mx-1 rounded-full ${isPast ? 'bg-primary/30' : 'bg-neutral-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Receipt (Step 4) ────────────────────────────────── */}
      {step === 4 && paymentResult ? (
        <ReceiptPreview
          receiptNumber={paymentResult.receiptNumber}
          payment={paymentResult.payment}
          onNewPayment={handleNewPayment}
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-5">
          {/* ── Main content ──────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">
            {step === 1 && (
              <StudentSelector onSelect={handleStudentSelect} selectedStudent={student} />
            )}

            {step === 2 && (
              <FeeSelector
                fees={fees}
                isLoading={isLoadingFees}
                selectedFeeIds={selectedFeeIds}
                onToggleFee={handleToggleFee}
                onSelectAll={handleSelectAllFees}
              />
            )}

            {step === 3 && (
              <PaymentForm
                totalSelectedDue={totalSelectedDue}
                amountToPay={amountToPay} setAmountToPay={setAmountToPay}
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                reference={reference} setReference={setReference}
                paymentDate={paymentDate} setPaymentDate={setPaymentDate}
                observations={observations} setObservations={setObservations}
              />
            )}

            {/* ── Navigation ─────────────────────────────── */}
            <div className={`flex items-center pt-1 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium
                             border border-neutral-300 rounded-xl hover:bg-neutral-50
                             hover:border-neutral-400 transition-all duration-200
                             text-neutral-700 shadow-sm"
                >
                  <ArrowLeft size={15} /> Retour
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={(step === 1 && !student) || (step === 2 && selectedFeeIds.length === 0)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                             bg-gradient-to-r from-primary to-primary-light text-white
                             rounded-xl hover:shadow-lg hover:shadow-primary/25
                             transition-all duration-200 hover:-translate-y-0.5 shadow-md
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                >
                  Étape suivante <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!amountToPay || Number(amountToPay) <= 0 || createPayment.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                             bg-gradient-to-r from-green-600 to-green-500 text-white
                             rounded-xl hover:shadow-lg hover:shadow-green-500/25
                             transition-all duration-200 hover:-translate-y-0.5 shadow-md
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                >
                  {createPayment.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save size={15} />
                      Valider {amountToPay ? formatFC(Number(amountToPay)) : ''}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Sidebar Summary ───────────────────────────── */}
          <div className="w-full lg:w-[360px] shrink-0">
            <div className="sticky top-4">
              {student && step > 1 ? (
                <PaymentSummary
                  student={student}
                  selectedFees={selectedFees}
                  amountToPay={amountToPay}
                  paymentMethod={paymentMethod}
                  paymentDate={paymentDate}
                />
              ) : (
                <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-white rounded-xl border border-neutral-300/50 text-center text-neutral-400">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                    <User className="w-6 h-6 text-neutral-300" />
                  </div>
                  <span className="text-sm">Le résumé s'affichera après sélection de l'élève.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
