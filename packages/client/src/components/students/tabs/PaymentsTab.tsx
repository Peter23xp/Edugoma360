import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Receipt } from 'lucide-react';
import api from '../../../lib/api';
import type { Payment } from '@edugoma360/shared';

interface PaymentSummary {
    due: number;
    paid: number;
    remaining: number;
}

interface PaymentsResponse {
    payments: (Payment & {
        feeType: { name: string };
        student: { nom: string; postNom: string };
    })[];
    summary: PaymentSummary;
}

interface PaymentsTabProps {
    studentId: string;
}

export default function PaymentsTab({ studentId }: PaymentsTabProps) {
    const navigate = useNavigate();

    // TODO: Get current academic year from context
    const academicYearId = 'current-year';

    const { data, isLoading } = useQuery({
        queryKey: ['student-payments', studentId, academicYearId],
        queryFn: async () => {
            const res = await api.get<PaymentsResponse>('/payments', {
                params: { studentId, academicYearId },
            });
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-neutral-100 rounded-lg animate-pulse" />
                    ))}
                </div>
                <div className="h-64 bg-neutral-100 rounded-lg animate-pulse" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                    <DollarSign size={20} className="text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500">
                    Aucune donnée de paiement disponible
                </p>
            </div>
        );
    }

    const { payments, summary } = data;
    const paymentPercentage = summary.due > 0 ? (summary.paid / summary.due) * 100 : 0;

    const paymentModeLabels: Record<string, string> = {
        ESPECES: 'Espèces',
        AIRTEL_MONEY: 'Airtel Money',
        MPESA: 'M-Pesa',
        ORANGE_MONEY: 'Orange Money',
        VIREMENT: 'Virement',
    };

    const handleRecordPayment = () => {
        navigate(`/finance/payment?studentId=${studentId}`);
    };

    return (
        <div className="space-y-6">
            {/* ── Summary Cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard
                    label="Total dû"
                    value={`${summary.due.toLocaleString()} FC`}
                    color="text-neutral-700"
                />
                <SummaryCard
                    label="Payé"
                    value={`${summary.paid.toLocaleString()} FC`}
                    color="text-green-700"
                />
                <SummaryCard
                    label="Solde"
                    value={`${summary.remaining.toLocaleString()} FC`}
                    color={summary.remaining > 0 ? 'text-red-700' : 'text-green-700'}
                />
            </div>

            {/* ── Progress Bar ───────────────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-neutral-600">
                        Progression des paiements
                    </p>
                    <p className="text-xs font-semibold text-neutral-900">
                        {paymentPercentage.toFixed(0)}%
                    </p>
                </div>
                <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 
                                   transition-all duration-500"
                        style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* ── Payments Table ─────────────────────────────────────────── */}
            {payments.length > 0 ? (
                <div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                        Historique des paiements
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                        Reçu N°
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                        Type de frais
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600">
                                        Montant
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">
                                        Mode
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-neutral-50">
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() =>
                                                    window.open(
                                                        `/api/payments/${payment.id}/receipt`,
                                                        '_blank'
                                                    )
                                                }
                                                className="text-sm font-mono text-primary 
                                                           hover:underline"
                                            >
                                                {payment.receiptNumber}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-900">
                                            {payment.feeType.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-neutral-900">
                                            {payment.amountPaid.toLocaleString()} FC
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-700">
                                            {new Date(payment.paidAt).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-700">
                                            {paymentModeLabels[payment.paymentMode] ||
                                                payment.paymentMode}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Receipt size={32} className="text-neutral-300 mb-2" />
                    <p className="text-sm text-neutral-500">Aucun paiement enregistré</p>
                </div>
            )}

            {/* ── Outstanding Fees ───────────────────────────────────────── */}
            {summary.remaining > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-red-900 mb-1">
                                Solde dû
                            </p>
                            <p className="text-xs text-red-700">
                                Il reste {summary.remaining.toLocaleString()} FC à payer pour
                                cette année scolaire.
                            </p>
                        </div>
                        <button
                            onClick={handleRecordPayment}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                                       bg-red-600 text-white rounded-lg hover:bg-red-700 
                                       transition-colors whitespace-nowrap"
                        >
                            Enregistrer paiement →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({
    label,
    value,
    color,
}: {
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    );
}
