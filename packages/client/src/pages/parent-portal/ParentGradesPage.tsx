import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GraduationCap, Download, AlertTriangle } from 'lucide-react';
import { useParentChildren, useParentGrades } from '../../hooks/useParentPortal';
import api from '../../lib/api';

export default function ParentGradesPage() {
  const [searchParams] = useSearchParams();
  const childIdParam = searchParams.get('child');

  const { data: children } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState<string | null>(childIdParam);
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>();

  const activeChildId = selectedChild || children?.[0]?.id || null;
  const { data, isLoading } = useParentGrades(activeChildId, selectedTerm);

  const handleDownloadBulletin = async () => {
    if (!activeChildId || !data?.term) return;
    try {
      const res = await api.get(`/bulletin/${activeChildId}/${data.term.id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin_${data.student.nom}_${data.term.label}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* handled by interceptor */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#1B5E20]" />
          Notes
        </h1>
        {data?.term && (
          <button
            onClick={handleDownloadBulletin}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] text-sm"
          >
            <Download className="w-4 h-4" />
            Télécharger bulletin
          </button>
        )}
      </div>

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
            value={selectedTerm || data.term?.id || ''}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {data.availableTerms.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        )}
      </div>

      {data?.summary.generalAverage !== null && data?.summary.generalAverage !== undefined && (
        <div className="bg-white border rounded-lg p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Moyenne générale</p>
              <p className="text-2xl font-bold text-[#1B5E20]">{data.summary.generalAverage}/20</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rang</p>
              <p className="text-2xl font-bold">{data.summary.rank ? `${data.summary.rank}ème` : '—'}/{data.summary.totalStudents}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Matières</p>
              <p className="text-2xl font-bold">{data.grades.length}</p>
            </div>
            {data.summary.decision && (
              <div>
                <p className="text-sm text-gray-500">Décision</p>
                <p className="text-lg font-bold text-[#1B5E20]">{data.summary.decision}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement des notes...</div>
      ) : !data || data.grades.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Aucune note disponible pour ce trimestre</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3 font-medium">Matière</th>
                <th className="text-center p-3 font-medium">Moyenne</th>
                <th className="text-center p-3 font-medium">Max</th>
              </tr>
            </thead>
            <tbody>
              {data.grades.map((grade) => {
                const isLow = grade.average !== null && grade.maxScore > 0 && (grade.average / grade.maxScore) < 0.5;
                return (
                  <tr key={grade.subjectAbbr} className={`border-b ${isLow ? 'bg-red-50' : ''}`}>
                    <td className="p-3 font-medium">
                      {grade.subjectName}
                      {isLow && <AlertTriangle className="inline w-3 h-3 text-red-500 ml-1" />}
                    </td>
                    <td className="text-center p-3 font-bold">{grade.average !== null ? grade.average : '—'}</td>
                    <td className="text-center p-3 text-gray-500">{grade.maxScore}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
