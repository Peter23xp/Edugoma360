import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wallet, Download, AlertCircle } from 'lucide-react';
import { useParentChildren, useParentPayments } from '../../hooks/useParentPortal';
import { formatFC } from '@edugoma360/shared';
import api from '../../lib/api';

export default function ParentPaymentsPage() {
  const [searchParams] = useSearchParams();
  const childIdParam = searchParams.get('child');

  const { data: children } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState<string | null>(childIdParam);

  const activeChildId = selectedChild || children?.[0]?.id || null;
  const { data, isLoading } = useParentPayments(activeChildId);

  const handleDownloadReceipt = async (paymentId: string, receiptNumber: string) => {
    try {
      const res = await api.get(`/payments/${paymentId}/receipt`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu_${receiptNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* handled by interceptor */ }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Wallet className="w-5 h-5 text-[#1B5E20]" />
        Paiements
      </h1>

      {children && children.length > 1 && (
        <select
          value={activeChildId || ''}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.nom} {c.postNom} ({c.className})</option>
          ))}
        </select>
      )}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Total dû</p>
            <p className="text-xl font-bold">{formatFC(data.summary.totalDue)}</p>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Total payé</p>
            <p className="text-xl font-bold text-green-600">{formatFC(data.summary.totalPaid)}</p>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Solde restant</p>
            <p className={`text-xl font-bold ${data.summary.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {data.summary.balance > 0 ? formatFC(data.summary.balance) : 'Soldé'}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : !data ? (
        <div className="text-center py-12 text-gray-500">Aucune donnée disponible</div>
      ) : (
        <>
          {data.payments.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Historique des paiements</h2>
              <div className="bg-white border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Type de frais</th>
                      <th className="text-right p-3 font-medium">Montant</th>
                      <th className="text-left p-3 font-medium">Mode</th>
                      <th className="text-center p-3 font-medium">Reçu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="p-3">{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                        <td className="p-3">{p.feeName}</td>
                        <td className="p-3 text-right font-medium">{formatFC(p.amount)}</td>
                        <td className="p-3 text-gray-600">{p.paymentMethod}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDownloadReceipt(p.id, p.receiptNumber)}
                            className="text-[#1B5E20] hover:underline"
                            title="Télécharger reçu"
                          >
                            <Download className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.unpaidFees.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Frais impayés
              </h2>
              <div className="space-y-2">
                {data.unpaidFees.map((fee, i) => (
                  <div key={i} className="bg-white border border-red-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{fee.feeName}</p>
                      <p className="text-xs text-gray-500">Payé : {formatFC(fee.amountPaid)} / {formatFC(fee.amount)}</p>
                    </div>
                    <p className="font-bold text-red-600">{formatFC(fee.remaining)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
