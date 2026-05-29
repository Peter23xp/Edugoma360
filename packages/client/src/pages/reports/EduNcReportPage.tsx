import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileBarChart, Download, Printer } from 'lucide-react';
import api from '../../lib/api';

export default function EduNcReportPage() {
  const [academicYearId, setAcademicYearId] = useState('');

  const { data: years } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => (await api.get('/academic-years')).data,
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ['edu-nc', academicYearId],
    queryFn: async () => {
      const params: any = {};
      if (academicYearId) params.academicYearId = academicYearId;
      return (await api.get('/reports/statistics', { params })).data;
    },
    enabled: true,
  });

  const handlePrint = () => window.print();

  const handleExport = async () => {
    try {
      const params: any = { format: 'excel' };
      if (academicYearId) params.academicYearId = academicYearId;
      const res = await api.get('/exports', { params: { type: 'FULL', ...params }, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_edu_nc_${new Date().getFullYear()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* handled */ }
  };

  const yearsList: any[] = Array.isArray(years)
    ? years
    : years?.academicYears || years?.data
      ? (Array.isArray(years.academicYears) ? years.academicYears : Array.isArray(years.data) ? years.data : [])
      : years?.current
        ? [years.current, ...(Array.isArray(years.past) ? years.past : [])]
        : [];
  const activeYear = yearsList.find((y: any) => y.isActive) || yearsList[0];
  const selectedYearData = academicYearId ? yearsList.find((y: any) => y.id === academicYearId) : activeYear;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileBarChart className="w-6 h-6 text-[#0D47A1]" />
          Rapport EDU-NC
          <span className="text-sm font-normal text-gray-500">(Fiche statistique officielle RDC)</span>
        </h1>
        <div className="flex gap-2">
          <button onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
            <Printer className="w-4 h-4" /> Imprimer
          </button>
          <button onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D47A1] text-white rounded-lg text-sm hover:bg-blue-800">
            <Download className="w-4 h-4" /> Exporter Excel
          </button>
        </div>
      </div>

      {/* Year selector */}
      <div className="print:hidden">
        <select value={academicYearId} onChange={e => setAcademicYearId(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Année scolaire active</option>
          {yearsList.map((y: any) => (
            <option key={y.id} value={y.id}>{y.label || y.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement des statistiques...</div>
      ) : (
        <div className="space-y-6">
          {/* Report header */}
          <div className="bg-white border-2 border-[#0D47A1] rounded-lg p-6">
            <div className="text-center mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide">République Démocratique du Congo</p>
              <p className="text-xs text-gray-500">Ministère de l'Enseignement Primaire, Secondaire et Professionnel</p>
              <h2 className="text-xl font-bold text-[#0D47A1] mt-2">FICHE DE RELEVÉ STATISTIQUE SCOLAIRE</h2>
              <p className="text-sm text-gray-600 mt-1">
                Année scolaire : <strong>{selectedYearData?.label || selectedYearData?.name || 'En cours'}</strong>
              </p>
            </div>

            {/* Section I — Effectifs */}
            <section className="mb-6">
              <h3 className="font-bold text-[#0D47A1] border-b border-[#0D47A1] pb-1 mb-3">
                I. EFFECTIFS DES ÉLÈVES
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border p-2 text-left">Indicateur</th>
                      <th className="border p-2 text-center">Garçons</th>
                      <th className="border p-2 text-center">Filles</th>
                      <th className="border p-2 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">Effectif total inscrits</td>
                      <td className="border p-2 text-center">{stats?.totalStudents?.male || stats?.stats?.maleCount || '—'}</td>
                      <td className="border p-2 text-center">{stats?.totalStudents?.female || stats?.stats?.femaleCount || '—'}</td>
                      <td className="border p-2 text-center font-bold">{stats?.totalStudents?.total || stats?.stats?.totalStudents || stats?.totalStudents || '—'}</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Nouveaux inscrits</td>
                      <td className="border p-2 text-center">—</td>
                      <td className="border p-2 text-center">—</td>
                      <td className="border p-2 text-center font-bold">{stats?.newStudents || '—'}</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Redoublants</td>
                      <td className="border p-2 text-center">—</td>
                      <td className="border p-2 text-center">—</td>
                      <td className="border p-2 text-center font-bold">{stats?.repeaters || '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section II — Classes */}
            <section className="mb-6">
              <h3 className="font-bold text-[#0D47A1] border-b border-[#0D47A1] pb-1 mb-3">
                II. NOMBRE DE CLASSES ET ENSEIGNANTS
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total classes', value: stats?.totalClasses || stats?.stats?.totalClasses || '—' },
                  { label: 'Total enseignants', value: stats?.totalTeachers || stats?.stats?.totalTeachers || '—' },
                  { label: 'Ratio élèves/classe', value: stats?.avgStudentsPerClass ? Math.round(stats.avgStudentsPerClass) : '—' },
                  { label: 'Sections', value: stats?.totalSections || '—' },
                ].map(item => (
                  <div key={item.label} className="border rounded p-3 text-center">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-xl font-bold text-[#0D47A1]">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section III — Résultats */}
            <section className="mb-6">
              <h3 className="font-bold text-[#0D47A1] border-b border-[#0D47A1] pb-1 mb-3">
                III. RÉSULTATS SCOLAIRES
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border p-2 text-left">Décision</th>
                      <th className="border p-2 text-center">Nombre</th>
                      <th className="border p-2 text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Admis', key: 'admitted' },
                      { label: 'Répété', key: 'repeated' },
                      { label: 'Exclu', key: 'excluded' },
                    ].map(row => (
                      <tr key={row.key}>
                        <td className="border p-2">{row.label}</td>
                        <td className="border p-2 text-center">{stats?.[row.key] || '—'}</td>
                        <td className="border p-2 text-center">
                          {stats?.[row.key] && stats?.totalStudents
                            ? `${Math.round((stats[row.key] / (typeof stats.totalStudents === 'object' ? stats.totalStudents.total : stats.totalStudents)) * 100)}%`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section IV — Finance */}
            <section>
              <h3 className="font-bold text-[#0D47A1] border-b border-[#0D47A1] pb-1 mb-3">
                IV. SITUATION FINANCIÈRE
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-3">
                  <p className="text-xs text-gray-500">Total encaissé (FC)</p>
                  <p className="text-lg font-bold">{stats?.totalRevenue?.toLocaleString('fr-FR') || '—'}</p>
                </div>
                <div className="border rounded p-3">
                  <p className="text-xs text-gray-500">Créances totales (FC)</p>
                  <p className="text-lg font-bold text-orange-600">{stats?.totalDebts?.toLocaleString('fr-FR') || '—'}</p>
                </div>
              </div>
            </section>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm pt-4 border-t">
              <div>
                <p className="text-gray-500 mb-8">Directeur / Préfet</p>
                <p className="border-t pt-2">Signature & Cachet</p>
              </div>
              <div>
                <p className="text-gray-500 mb-8">Date</p>
                <p className="border-t pt-2">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-8">Inspecteur</p>
                <p className="border-t pt-2">Signature & Cachet</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
