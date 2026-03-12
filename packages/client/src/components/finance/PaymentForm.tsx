import { useEffect, useRef } from 'react';
import { formatFC, PAYMENT_METHODS } from '@edugoma360/shared';
import type { PaymentMethod } from '@edugoma360/shared';
import { Info, HelpCircle } from 'lucide-react';

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

  // Initialize or update amount if needed
  useEffect(() => {
    if (!amountToPay || Number(amountToPay) === 0 || Number(amountToPay) > totalSelectedDue) {
      setAmountToPay(totalSelectedDue > 0 ? totalSelectedDue.toString() : '');
    }
  }, [totalSelectedDue]);

  const numAmount = Number(amountToPay);
  const isPartial = numAmount > 0 && numAmount < totalSelectedDue;

  return (
    <div className="bg-white rounded-xl border border-neutral-300 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
        <h3 className="text-xl font-bold text-neutral-900">Détails de la transaction</h3>
        {isPartial && (
          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ml-auto">
            <Info size={14} /> Paiement partiel détecté
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* Colonne Gauche */}
        <div className="space-y-6">
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
              Montant reçu (à encaisser) <span className="text-red-500">*</span>
              <div className="group relative cursor-help">
                <HelpCircle size={14} className="text-neutral-400" />
                <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-neutral-900 text-white text-xs p-2 rounded shadow-lg z-10 text-center">
                  Vous pouvez saisir un montant inférieur au total si l'élève paie en tranche.
                </div>
              </div>
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400 group-hover:text-primary transition-colors text-lg">FC</span>
              <input
                type="number"
                required
                min="1"
                max={totalSelectedDue > 0 ? totalSelectedDue : undefined}
                value={amountToPay}
                onChange={(e) => setAmountToPay(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-neutral-50/50 border-2 border-neutral-200 rounded-xl font-bold font-mono text-2xl text-neutral-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                placeholder="0"
              />
            </div>
            
            <div className="flex items-center justify-between mt-3 px-1 text-sm">
              <span className="text-neutral-500 font-medium">Total exigé:</span>
              <span className="font-bold text-neutral-800">{formatFC(totalSelectedDue)}</span>
            </div>
            
            {isPartial && (
              <div className="mt-2 bg-orange-50 border border-orange-100 text-orange-800 text-sm p-3 rounded-lg font-medium flex items-center justify-between shadow-sm">
                <span>Reste à percevoir</span>
                <span className="font-bold font-mono text-base">{formatFC(totalSelectedDue - numAmount)}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Mode d'encaissement <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                <label 
                  key={key} 
                  className={`
                    flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center
                    ${paymentMethod === key 
                      ? 'bg-primary-50 border-primary text-primary shadow-sm shadow-primary/10 font-bold scale-[1.02]' 
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 font-medium'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={key}
                    checked={paymentMethod === key}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="hidden"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne Droite */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Date d'encaissement <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Référence transaction {paymentMethod !== 'CASH' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              required={paymentMethod !== 'CASH'}
              placeholder={paymentMethod === 'MOBILE_MONEY' ? 'ex: MPESA ID / Airtel Money ID' : paymentMethod === 'BANK_TRANSFER' ? 'N° Virement' : 'Optionnel'}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-neutral-400"
            />
            {paymentMethod !== 'CASH' && (
              <p className="text-xs text-neutral-500 mt-1.5 font-medium ml-1">Veuillez inscrire le numéro de la transaction digitale.</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Note interne de la caisse
            </label>
            <textarea
              rows={3}
              placeholder="Ajouter une observation ou note explicative..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none placeholder:text-neutral-400"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
