import { useEffect } from 'react';
import { formatFC, PAYMENT_METHODS } from '@edugoma360/shared';
import type { PaymentMethod } from '@edugoma360/shared';
import { Info } from 'lucide-react';

interface PaymentFormProps {
  totalSelectedDue: number;
  amountToPay: string;
  setAmountToPay: (val: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (val: PaymentMethod) => void;
  reference: string;
  setReference: (val: string) => void;
  paymentDate: string;
  setPaymentDate: (val: string) => void;
  observations: string;
  setObservations: (val: string) => void;
}

export function PaymentForm({
  totalSelectedDue,
  amountToPay, setAmountToPay,
  paymentMethod, setPaymentMethod,
  reference, setReference,
  paymentDate, setPaymentDate,
  observations, setObservations,
}: PaymentFormProps) {

  useEffect(() => {
    if (!amountToPay || Number(amountToPay) === 0 || Number(amountToPay) > totalSelectedDue) {
      setAmountToPay(totalSelectedDue > 0 ? totalSelectedDue.toString() : '');
    }
  }, [totalSelectedDue]);

  const numAmount = Number(amountToPay);
  const isPartial = numAmount > 0 && numAmount < totalSelectedDue;

  return (
    <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">Détails de la transaction</h3>
        {isPartial && (
          <span className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
            <Info size={12} /> Paiement partiel
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
          {/* ── Colonne Gauche ── */}
          <div className="space-y-5">
            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Montant à encaisser <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-400">FC</span>
                <input
                  type="number"
                  required
                  min="1"
                  max={totalSelectedDue > 0 ? totalSelectedDue : undefined}
                  value={amountToPay}
                  onChange={(e) => setAmountToPay(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 bg-white border border-neutral-200 rounded-lg text-sm font-bold font-mono
                             focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs text-neutral-500">
                <span>Total exigé:</span>
                <span className="font-semibold text-neutral-700">{formatFC(totalSelectedDue)}</span>
              </div>
              {isPartial && (
                <div className="mt-2 bg-orange-50 border border-orange-100 text-orange-800 text-xs p-2.5 rounded-lg flex items-center justify-between">
                  <span>Reste à percevoir</span>
                  <span className="font-bold font-mono">{formatFC(totalSelectedDue - numAmount)}</span>
                </div>
              )}
            </div>

            {/* Mode de paiement */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Mode d'encaissement <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer transition-all text-xs font-medium
                    ${paymentMethod === key
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={key}
                      checked={paymentMethod === key}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="hidden"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Colonne Droite ── */}
          <div className="space-y-5">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Date d'encaissement <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-neutral-200 rounded-lg text-sm
                           focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            {/* Référence */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Référence transaction {paymentMethod !== 'CASH' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                required={paymentMethod !== 'CASH'}
                placeholder={
                  paymentMethod === 'MOBILE_MONEY' ? 'ex: MPESA ID / Airtel Money ID'
                    : paymentMethod === 'BANK_TRANSFER' ? 'N° Virement'
                      : 'Optionnel'
                }
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-neutral-200 rounded-lg text-sm
                           focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none
                           placeholder:text-neutral-400"
              />
            </div>

            {/* Observations */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Observations
              </label>
              <textarea
                rows={2}
                placeholder="Notes ou remarques..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm
                           focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none
                           placeholder:text-neutral-400"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
