import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Save, FileCheck2, User, Landmark, DollarSign } from 'lucide-react';
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
  
  // Fees Data via Hook (API /students/:id/fees-due)
  const { getFeesDue, createPayment } = usePayments();
  const { data: feesData, isLoading: isLoadingFees } = getFeesDue(student?.id, !!student);
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
  
  // Payment Details Form State
  const [amountToPay, setAmountToPay] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [observations, setObservations] = useState('');

  // Result state
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Computed Values
  const fees = feesData?.fees || [];
  const selectedFees = fees.filter(f => selectedFeeIds.includes(f.feeId));
  const totalSelectedDue = selectedFees.reduce((sum, f) => sum + f.remainingBalance, 0);

  // Stepper Visual Data
  const steps = [
    { id: 1, label: 'Élève', icon: User },
    { id: 2, label: 'Frais', icon: FileCheck2 },
    { id: 3, label: 'Paiement', icon: Landmark },
  ];

  // Actions
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
    if (selectedFeeIds.length === fees.length) {
      setSelectedFeeIds([]);
    } else {
      setSelectedFeeIds(fees.map(f => f.feeId));
    }
  };

  const handleNext = () => {
    if (step === 2 && selectedFeeIds.length === 0) return;
    if (step === 3 && (!amountToPay || Number(amountToPay) <= 0)) return;
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

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
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header & Stepper */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-neutral-200">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100 ring-4 ring-white shadow-sm">
              <DollarSign strokeWidth={2.5} className="w-6 h-6 text-primary" />
            </div>
            <div>
               <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Nouvel Encaissement</h1>
               <p className="text-neutral-500 font-medium">Assistant de caisse en 3 étapes</p>
            </div>
          </div>
        </div>
        
        {step < 4 && (
          <div className="flex items-center space-x-2 sm:space-x-4 bg-neutral-50 p-2 rounded-xl border border-neutral-200/50">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isPast = step > s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300
                    ${isActive ? 'bg-white shadow-sm text-primary shadow-primary/10 border border-primary/20' : 
                      isPast ? 'text-primary opacity-80' : 'text-neutral-400'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center
                      ${isActive ? 'bg-primary-100 text-primary' : 
                        isPast ? 'bg-primary text-white' : 'bg-neutral-200'
                      }`}
                    >
                      {isPast ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <Icon size={14} strokeWidth={2.5} />}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-4 sm:w-8 h-[2px] mx-1 sm:mx-2 rounded-full ${isPast ? 'bg-primary-200' : 'bg-neutral-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {step === 4 && paymentResult ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <ReceiptPreview
             receiptNumber={paymentResult.receiptNumber}
             payment={paymentResult.payment}
             onNewPayment={handleNewPayment}
           />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content area */}
          <div className="flex-1 w-full space-y-6">
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Step 1: Student Selection */}
              {step === 1 && (
                <StudentSelector onSelect={handleStudentSelect} selectedStudent={student} />
              )}

              {/* Step 2: Fee Selection */}
              {step === 2 && (
                <FeeSelector
                  fees={fees}
                  isLoading={isLoadingFees}
                  selectedFeeIds={selectedFeeIds}
                  onToggleFee={handleToggleFee}
                  onSelectAll={handleSelectAllFees}
                />
              )}

              {/* Step 3: Payment Details */}
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
            </div>

            {/* Navigation Actions */}
            <div className={`flex items-center pt-2 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="px-6 py-3.5 bg-white border border-neutral-300 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all flex items-center gap-2 shadow-sm shadow-neutral-200/50"
                >
                  <ArrowLeft size={18} /> Retour
                </button>
              ) : null}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={(step === 1 && !student) || (step === 2 && selectedFeeIds.length === 0)}
                  className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 disabled:shadow-none hover:-translate-y-0.5"
                >
                  {(step === 1 && !student) ? 'Sélectionnez un élève' : (step === 2 && selectedFeeIds.length === 0) ? 'Sélectionnez des frais' : 'Étape suivante'} <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!amountToPay || Number(amountToPay) <= 0 || createPayment.isPending}
                  className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:-translate-y-0"
                >
                  {createPayment.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                    <>
                      <Save size={18} strokeWidth={2.5} />
                      Valider et Encaisser {amountToPay ? formatFC(Number(amountToPay)) : ''}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Sticky Sidebar Right - Summary */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="sticky top-6">
              {student && step > 1 ? (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <PaymentSummary
                    student={student}
                    selectedFees={selectedFees}
                    amountToPay={amountToPay}
                    paymentMethod={paymentMethod}
                    paymentDate={paymentDate}
                  />
                </div>
              ) : (
                <div className="hidden lg:flex flex-col justify-center items-center p-10 mt-12 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 text-center text-neutral-400">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-neutral-100">
                    <User className="w-8 h-8 text-neutral-300" />
                  </div>
                  <span className="font-medium">Le résumé s'affichera ici une fois l'élève sélectionné.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
