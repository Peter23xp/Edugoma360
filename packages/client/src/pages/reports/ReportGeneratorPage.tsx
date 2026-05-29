import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import {
  FileBarChart, CalendarCheck, Wallet, Users, GraduationCap,
  Star, FileText, Loader2, X, Trash2, Download
} from 'lucide-react';
import { useReportGenerator } from '../../hooks/useReportGenerator';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { value: 'PRESENCE',    label: 'Rapport Présences',            icon: CalendarCheck },
  { value: 'RESULTS',     label: 'Rapport Résultats académiques', icon: GraduationCap },
  { value: 'FINANCE',     label: 'Rapport Financier',             icon: Wallet },
  { value: 'EFFECTIFS',   label: "Rapport Effectifs",             icon: Users },
  { value: 'END_OF_YEAR', label: "Rapport de fin d'année",        icon: Star },
  { value: 'CUSTOM',      label: 'Rapport personnalisé',          icon: FileText },
];

export default function ReportGeneratorPage() {
  const [showSaved, setShowSaved] = useState(false);
  const [type, setType] = useState('RESULTS');
  const [format, setFormat] = useState<'PDF' | 'EXCEL' | 'BOTH'>('PDF');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [reportName, setReportName] = useState('');

  const { savedReports, isLoadingSaved, generateReport, isGenerating, deleteReport } = useReportGenerator();
  // classes available for future filter enhancement
  useQuery({ queryKey: ['classes'], queryFn: async () => { const { data } = await api.get('/classes'); return data; } });

  const handleGenerate = async () => {
    if (!reportName.trim()) return toast.error('Donnez un nom au rapport');
    await generateReport({
      type,
      period: {},
      filters: {},
      options: { includeLogo, includeSignature, includePageNumbers },
      format,
      name: reportName,
      saveTemplate,
    });
  };

  const typeConfig = REPORT_TYPES.find(t => t.value === type);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileBarChart className="h-7 w-7 text-[#1B5E20]" />
            Générateur de Rapports
          </h1>
          <p className="text-sm text-gray-500 mt-1">Générez des rapports PDF ou Excel personnalisables</p>
        </div>
        <Button variant="outline" onClick={() => setShowSaved(!showSaved)} className="gap-2 self-start">
          <FileText className="h-4 w-4" />
          Rapports sauvegardés ({savedReports.length})
        </Button>
      </div>

      {showSaved ? (
        <SavedReportsList reports={savedReports} isLoading={isLoadingSaved} onDelete={deleteReport} onClose={() => setShowSaved(false)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-5">

            {/* Étape 1 — Type */}
            <Card>
              <CardContent className="p-5">
                <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#1B5E20] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  Type de rapport
                </h2>
                <RadioGroup value={type} onValueChange={setType} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REPORT_TYPES.map(rt => {
                    const Icon = rt.icon;
                    return (
                      <label
                        key={rt.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          type === rt.value ? 'border-[#1B5E20] bg-[#E8F5E9]/50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <RadioGroupItem value={rt.value} id={rt.value} />
                        <Icon className={`h-4 w-4 ${type === rt.value ? 'text-[#1B5E20]' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${type === rt.value ? 'text-[#1B5E20]' : 'text-gray-700'}`}>{rt.label}</span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Étape 2 — Options */}
            <Card>
              <CardContent className="p-5">
                <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#0D47A1] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  Format et options
                </h2>

                {/* Format */}
                <div className="space-y-2 mb-5">
                  <Label className="text-sm font-medium text-gray-700">Format d'export</Label>
                  <div className="flex gap-2 flex-wrap">
                    {(['PDF', 'EXCEL', 'BOTH'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                          format === f ? 'border-[#1B5E20] bg-[#E8F5E9]/50 text-[#1B5E20]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {f === 'PDF' ? '📄 PDF' : f === 'EXCEL' ? '📊 Excel' : '📄📊 Les deux'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Options d'affichage</Label>
                  {[
                    { state: includeLogo, set: setIncludeLogo, label: 'Inclure le logo de l\'école' },
                    { state: includeSignature, set: setIncludeSignature, label: 'Inclure la signature du Préfet' },
                    { state: includePageNumbers, set: setIncludePageNumbers, label: 'Numérotation des pages' },
                  ].map(opt => (
                    <label key={opt.label} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox checked={opt.state} onCheckedChange={c => opt.set(!!c)} />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {/* Nom */}
                <div className="mt-5 space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Nom du rapport *</Label>
                  <Input
                    value={reportName}
                    onChange={e => setReportName(e.target.value)}
                    placeholder={`${typeConfig?.label ?? 'Rapport'} — ${new Date().toLocaleDateString('fr-FR')}`}
                  />
                </div>

                {/* Sauvegarder */}
                <label className="flex items-center gap-3 cursor-pointer mt-3">
                  <Checkbox checked={saveTemplate} onCheckedChange={c => setSaveTemplate(!!c)} />
                  <span className="text-sm text-gray-700">Sauvegarder ce rapport pour réutilisation</span>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Résumé + Actions */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Résumé</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type :</span>
                    <span className="font-medium">{typeConfig?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Format :</span>
                    <span className="font-medium">{format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Logo :</span>
                    <span>{includeLogo ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Signature :</span>
                    <span>{includeSignature ? '✓' : '✗'}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !reportName.trim()}
                    className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white gap-2"
                  >
                    {isGenerating
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Génération...</>
                      : <><FileText className="h-4 w-4" /> Générer {format}</>
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function SavedReportsList({ reports, isLoading, onDelete, onClose }: any) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Rapports sauvegardés ({reports.length})</h3>
          <Button variant="ghost" onClick={onClose} className="p-1 h-auto">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : reports.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Aucun rapport sauvegardé</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r: any) => (
              <div key={r.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.type} · Généré le {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                      {r.generatedBy && ` par ${r.generatedBy.nom}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {r.pdfUrl && (
                      <a href={r.pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50">
                        <Download className="h-3 w-3" /> PDF
                      </a>
                    )}
                    {r.excelUrl && (
                      <a href={r.excelUrl} download
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50">
                        <Download className="h-3 w-3" /> Excel
                      </a>
                    )}
                    <button onClick={() => onDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
