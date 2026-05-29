import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, ArrowLeft, Printer } from 'lucide-react';
import api from '../../lib/api';
import { formatFC } from '@edugoma360/shared';

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/payments/${id}`);
      return data.payment || data;
    },
    enabled: !!id,
  });

  const handleDownloadPdf = async () => {
    try {
      const res = await api.get(`/payments/${id}/receipt`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu_${payment?.receiptNumber || id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* handled by interceptor */ }
  };

  if (isLoading) return <div className="text-center py-12 text-gray-500">Chargement du reçu...</div>;

  if (!payment) return (
    <div className="text-center py-12">
      <p className="text-gray-500">Reçu introuvable</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-sm text-[#1B5E20] hover:underline">Retour</button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
            <Printer className="w-4 h-4" /> Imprimer
          </button>
          <button onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] text-sm">
            <Download className="w-4 h-4" /> Télécharger PDF
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-8 print:border-none">
        <div className="text-center border-b pb-4 mb-6">
          <h1 className="text-xl font-bold text-[#1B5E20]">REÇU DE PAIEMENT</h1>
          <p className="text-sm text-gray-500 mt-1">N° {payment.receiptNumber}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-gray-500">Élève</p>
            <p className="font-medium">{payment.student?.nom} {payment.student?.postNom} {payment.student?.prenom || ''}</p>
            {payment.student?.matricule && <p className="text-xs text-gray-400">{payment.student.matricule}</p>}
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium">{new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <p className="text-gray-500">Mode de paiement</p>
            <p className="font-medium">{payment.paymentMethod}</p>
          </div>
          {payment.transactionRef && (
            <div>
              <p className="text-gray-500">Référence</p>
              <p className="font-medium">{payment.transactionRef}</p>
            </div>
          )}
        </div>

        {payment.feePayments && payment.feePayments.length > 0 && (
          <div className="border rounded-lg overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium">Type de frais</th>
                  <th className="text-right p-3 font-medium">Montant dû</th>
                  <th className="text-right p-3 font-medium">Montant payé</th>
                </tr>
              </thead>
              <tbody>
                {payment.feePayments.map((fp: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{fp.fee?.name || 'Frais'}</td>
                    <td className="p-3 text-right">{formatFC(fp.amountDue)}</td>
                    <td className="p-3 text-right font-medium">{formatFC(fp.amountPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-lg font-bold">TOTAL PAYÉ</span>
          <span className="text-2xl font-bold text-[#1B5E20]">{formatFC(payment.amountPaid)}</span>
        </div>
        {payment.remainingBalance > 0 && (
          <p className="text-sm text-orange-600 mt-2">Solde restant : {formatFC(payment.remainingBalance)}</p>
        )}

        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">
          <p>Ce reçu a été généré automatiquement par EduGoma 360</p>
        </div>
      </div>
    </div>
  );
}
