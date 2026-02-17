import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Receipt, Search, Loader2, Printer } from 'lucide-react';
import api from '../../lib/api';
import { formatFC, fcToUsd, formatUSD } from '@edugoma360/shared';
import { formatStudentName } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function PaymentFormPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Record<string, unknown> | null>(null);
    const [feeTypeId, setFeeTypeId] = useState('');
    const [amountPaid, setAmountPaid] = useState(0);
    const [currency, setCurrency] = useState<'FC' | 'USD'>('FC');
    const [paymentMode, setPaymentMode] = useState('ESPECES');
    const [exchangeRate, setExchangeRate] = useState(2500);
    const [receiptData, setReceiptData] = useState<Record<string, unknown> | null>(null);

    const { data: students } = useQuery({
        queryKey: ['student-search', search],
        queryFn: async () => (await api.get(`/students?search=${search}&limit=5`)).data,
        enabled: search.length >= 2,
    });

    const { data: feeTypes } = useQuery({
        queryKey: ['fee-types'],
        queryFn: async () => (await api.get('/finance/fee-types')).data,
    });

    const selectedFee = feeTypes?.find((f: { id: string }) => f.id === feeTypeId);
    const amountDue = selectedFee?.amount ?? 0;
    const amountInFC = currency === 'USD' ? amountPaid * exchangeRate : amountPaid;
    const remaining = amountDue - amountInFC;

    const payMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/finance/payments', {
                studentId: selectedStudent?.id,
                feeTypeId,
                amountPaid: amountInFC,
                currency,
                exchangeRate: currency === 'USD' ? exchangeRate : null,
                paymentMode,
            });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success('Paiement enregistré !');
            setReceiptData(data);
            queryClient.invalidateQueries({ queryKey: ['finance'] });
        },
        onError: () => toast.error('Erreur lors du paiement'),
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><Receipt size={22} /> Nouveau Paiement</h1>

            {!receiptData ? (
                <form onSubmit={(e) => { e.preventDefault(); payMutation.mutate(); }} className="space-y-5">
                    {/* Student Search */}
                    <div className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-3">
                        <label className="input-label">Rechercher l'élève</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, matricule..." className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm" />
                        </div>
                        {students?.students?.length > 0 && !selectedStudent && (
                            <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                                {students.students.map((s: Record<string, unknown>) => (
                                    <button key={String(s.id)} type="button" onClick={() => { setSelectedStudent(s); setSearch(''); }} className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-sm">
                                        <span className="font-medium">{formatStudentName(String(s.nom), String(s.postNom), s.prenom as string)}</span>
                                        <span className="text-neutral-400 ml-2 font-mono text-xs">{String(s.matricule)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {selectedStudent && (
                            <div className="bg-success-bg rounded-lg p-3 flex items-center justify-between">
                                <span className="text-sm font-medium">{formatStudentName(String(selectedStudent.nom), String(selectedStudent.postNom), selectedStudent.prenom as string)} — <span className="font-mono text-xs">{String(selectedStudent.matricule)}</span></span>
                                <button type="button" onClick={() => setSelectedStudent(null)} className="text-xs text-danger hover:underline">Changer</button>
                            </div>
                        )}
                    </div>

                    {/* Payment Details */}
                    <div className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Type de frais</label>
                                <select value={feeTypeId} onChange={(e) => setFeeTypeId(e.target.value)} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white">
                                    <option value="">Sélectionner...</option>
                                    {feeTypes?.map((f: { id: string; name: string; amount: number }) => <option key={f.id} value={f.id}>{f.name} — {formatFC(f.amount)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Mode de paiement</label>
                                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white">
                                    <option value="ESPECES">Espèces</option>
                                    <option value="MPESA">M-Pesa</option>
                                    <option value="AIRTEL_MONEY">Airtel Money</option>
                                    <option value="ORANGE_MONEY">Orange Money</option>
                                    <option value="VIREMENT">Virement</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="input-label">Devise</label>
                                <select value={currency} onChange={(e) => setCurrency(e.target.value as 'FC' | 'USD')} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white">
                                    <option value="FC">Francs Congolais (FC)</option>
                                    <option value="USD">Dollars (USD)</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Montant payé ({currency})</label>
                                <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} min={0} required className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            {currency === 'USD' && (
                                <div>
                                    <label className="input-label">Taux FC/USD</label>
                                    <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                            )}
                        </div>

                        {/* Live Summary */}
                        {selectedFee && (
                            <div className="bg-neutral-100 rounded-lg p-4 text-sm space-y-1">
                                <div className="flex justify-between"><span>Montant dû :</span><span className="font-semibold">{formatFC(amountDue)}</span></div>
                                <div className="flex justify-between"><span>Montant payé :</span><span className="font-semibold text-primary">{formatFC(amountInFC)}{currency === 'USD' && ` (${formatUSD(amountPaid)})`}</span></div>
                                <div className="flex justify-between border-t pt-1"><span>Solde restant :</span><span className={`font-bold ${remaining > 0 ? 'text-danger' : 'text-success'}`}>{formatFC(Math.max(0, remaining))}</span></div>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={payMutation.isPending || !selectedStudent || !feeTypeId} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium text-sm disabled:opacity-50">
                        {payMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
                        Enregistrer le paiement
                    </button>
                </form>
            ) : (
                /* Receipt Preview */
                <div className="bg-white rounded-xl border border-neutral-300/50 p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-success-bg rounded-full flex items-center justify-center mx-auto"><Receipt size={28} className="text-success" /></div>
                    <h2 className="text-lg font-bold">Paiement enregistré !</h2>
                    <p className="text-sm text-neutral-500">N° Reçu : <span className="font-mono font-bold">{String(receiptData.receiptNumber)}</span></p>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100"><Printer size={14} /> Imprimer le reçu</button>
                        <button onClick={() => { setReceiptData(null); setSelectedStudent(null); setFeeTypeId(''); setAmountPaid(0); }} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark">Nouveau paiement</button>
                    </div>
                </div>
            )}
        </div>
    );
}
