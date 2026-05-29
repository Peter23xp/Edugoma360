import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Download, Printer, Search } from 'lucide-react';
import api from '../../lib/api';
import * as XLSX from 'xlsx';

interface ExamStudent {
  id: string;
  nom: string;
  postNom: string;
  prenom: string | null;
  matricule: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string;
  className: string;
  generalAverage: number | null;
  rank: number | null;
  decision: string | null;
}

export default function ExamNationalPage() {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const { data: students, isLoading } = useQuery({
    queryKey: ['exam-national-list', classFilter, search],
    queryFn: async () => {
      // Fetch 6ème année students who are admitted
      const params: any = { year: 6, decision: 'ADMIS' };
      if (classFilter) params.classId = classFilter;
      if (search) params.search = search;
      const { data } = await api.get('/reports/exam-national', { params }).catch(() =>
        // Fallback: fetch students in 6th year classes
        api.get('/students', { params: { year: 6, limit: 200 } })
      );
      return (data.students || data.data || data) as ExamStudent[];
    },
  });

  const { data: classes } = useQuery({
    queryKey: ['classes-6th'],
    queryFn: async () => {
      const { data } = await api.get('/classes');
      const classList = data.data?.classes || data.classes || [];
      // Filter to 6th year classes
      return classList.filter((c: any) => c.section?.year === 6 || c.name?.includes('6'));
    },
  });

  const filteredStudents = (students || []).filter((s: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.nom?.toLowerCase().includes(q) || s.postNom?.toLowerCase().includes(q) || s.matricule?.toLowerCase().includes(q);
  });

  const handleExportExcel = () => {
    const rows = filteredStudents.map((s: any, i: number) => ({
      'N°': i + 1,
      'Matricule': s.matricule,
      'Nom': s.nom,
      'Post-Nom': s.postNom,
      'Prénom': s.prenom || '',
      'Sexe': s.sexe,
      'Date Naissance': s.dateNaissance ? new Date(s.dateNaissance).toLocaleDateString('fr-FR') : '',
      'Lieu Naissance': s.lieuNaissance || '',
      'Classe': s.className || s.enrollments?.[0]?.class?.name || '',
      'Moyenne': s.generalAverage || '',
      'Rang': s.rank || '',
      'Décision': s.decision || 'ADMIS',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidats Examen État');
    XLSX.writeFile(wb, `liste_candidats_examen_etat_${new Date().getFullYear()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-[#F57F17]" />
          Listes Examen d'État
          <span className="text-sm font-normal text-gray-500">(Candidats 6ème année)</span>
        </h1>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
            <Printer className="w-4 h-4" /> Imprimer
          </button>
          <button onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F57F17] text-white rounded-lg text-sm hover:bg-orange-700">
            <Download className="w-4 h-4" /> Exporter Excel
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-[#F57F17]/10 border border-[#F57F17]/30 rounded-lg p-4 text-sm print:hidden">
        <p className="font-medium text-[#F57F17]">📋 Liste officielle des candidats à l'Examen d'État</p>
        <p className="text-gray-600 mt-1">Cette liste contient les élèves de 6ème année admis en délibération, éligibles à se présenter à l'Examen d'État (TENAFEP/EXETAT).</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 print:hidden">
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Toutes les classes 6ème</option>
          {(classes || []).map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher un candidat..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-4">
        <h2 className="text-xl font-bold">LISTE DES CANDIDATS À L'EXAMEN D'ÉTAT</h2>
        <p className="text-sm">Année scolaire {new Date().getFullYear() - 1}/{new Date().getFullYear()}</p>
        <p className="text-sm">Généré le {new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="font-medium text-gray-900">{filteredStudents.length} candidat(s)</span>
        {filteredStudents.filter((s: any) => s.sexe === 'M').length > 0 && (
          <span>Garçons : {filteredStudents.filter((s: any) => s.sexe === 'M').length}</span>
        )}
        {filteredStudents.filter((s: any) => s.sexe === 'F').length > 0 && (
          <span>Filles : {filteredStudents.filter((s: any) => s.sexe === 'F').length}</span>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement de la liste...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun candidat trouvé.</p>
          <p className="text-xs mt-2">Les candidats apparaissent après délibération de la 6ème année.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3 font-medium">N°</th>
                <th className="text-left p-3 font-medium">Matricule</th>
                <th className="text-left p-3 font-medium">Nom complet</th>
                <th className="text-left p-3 font-medium">Sexe</th>
                <th className="text-left p-3 font-medium">Date naissance</th>
                <th className="text-left p-3 font-medium">Lieu naissance</th>
                <th className="text-left p-3 font-medium">Classe</th>
                <th className="text-center p-3 font-medium">Moyenne</th>
                <th className="text-center p-3 font-medium">Rang</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s: any, i: number) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-500">{i + 1}</td>
                  <td className="p-3 font-mono text-xs">{s.matricule}</td>
                  <td className="p-3 font-medium">{s.nom} {s.postNom} {s.prenom || ''}</td>
                  <td className="p-3">{s.sexe}</td>
                  <td className="p-3">{s.dateNaissance ? new Date(s.dateNaissance).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="p-3">{s.lieuNaissance || '—'}</td>
                  <td className="p-3">{s.className || s.enrollments?.[0]?.class?.name || '—'}</td>
                  <td className="p-3 text-center font-bold">{s.generalAverage || '—'}</td>
                  <td className="p-3 text-center">{s.rank || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Signature block for print */}
      <div className="hidden print:grid grid-cols-2 gap-8 mt-12 text-sm">
        <div className="text-center">
          <p className="mb-16">Le Préfet des Études</p>
          <p className="border-t pt-2">Nom, Signature & Cachet</p>
        </div>
        <div className="text-center">
          <p className="mb-16">L'Inspecteur</p>
          <p className="border-t pt-2">Nom, Signature & Cachet</p>
        </div>
      </div>
    </div>
  );
}
