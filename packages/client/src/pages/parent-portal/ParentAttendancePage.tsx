import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useParentChildren, useParentAttendance } from '../../hooks/useParentPortal';

export default function ParentAttendancePage() {
  const [searchParams] = useSearchParams();
  const childIdParam = searchParams.get('child');

  const { data: children } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState<string | null>(childIdParam);
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>();

  const activeChildId = selectedChild || children?.[0]?.id || null;
  const { data, isLoading } = useParentAttendance(activeChildId, selectedTerm);

  const statsCards = data ? [
    { label: 'Présent', value: `${data.stats.presentDays} j`, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Justifié', value: `${data.stats.absentJustified} j`, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
    { label: 'Non justifié', value: `${data.stats.absentUnjustified} j`, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Taux', value: `${data.stats.attendanceRate}%`, icon: CalendarCheck, color: 'text-blue-600 bg-blue-50' },
  ] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <CalendarCheck className="w-5 h-5 text-[#1B5E20]" />
        Absences
      </h1>

      <div className="flex flex-col sm:flex-row gap-3">
        {children && children.length > 1 && (
          <select
            value={activeChildId || ''}
            onChange={(e) => { setSelectedChild(e.target.value); setSelectedTerm(undefined); }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.nom} {c.postNom} ({c.className})</option>
            ))}
          </select>
        )}
        {data?.availableTerms && data.availableTerms.length > 0 && (
          <select
            value={selectedTerm || data.availableTerms[0]?.id || ''}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {data.availableTerms.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        )}
      </div>

      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsCards.map((card) => (
            <div key={card.label} className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : !data || data.absences.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Aucune absence enregistrée</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Période</th>
                <th className="text-left p-3 font-medium">Statut</th>
                <th className="text-left p-3 font-medium">Motif</th>
              </tr>
            </thead>
            <tbody>
              {data.absences.map((absence, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3">{new Date(absence.date).toLocaleDateString('fr-FR')}</td>
                  <td className="p-3 capitalize">{absence.period}</td>
                  <td className="p-3">
                    {absence.isJustified ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" /> Justifié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                        <XCircle className="w-3 h-3" /> Non justifié
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-gray-600">{absence.justification || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
