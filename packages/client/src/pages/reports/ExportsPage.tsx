import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Users, Wallet, CalendarCheck, BookOpen, GraduationCap,
  Package, Loader2, X, Clock, Download, Trash2, Plus,
  FileSpreadsheet, FileText
} from 'lucide-react';
import { useExports } from '../../hooks/useExports';

const QUICK_EXPORTS = [
  { type: 'STUDENTS',  label: 'Élèves',      desc: 'Liste complète Excel',   icon: Users,       format: 'EXCEL', color: 'text-blue-600 bg-blue-50' },
  { type: 'FINANCE',   label: 'Finance',     desc: 'Bilan financier Excel',  icon: Wallet,      format: 'EXCEL', color: 'text-green-700 bg-green-50' },
  { type: 'PRESENCE',  label: 'Présences',   desc: 'Rapport PDF',            icon: CalendarCheck,format: 'PDF',  color: 'text-[#0D47A1] bg-[#E8F5E9]' },
  { type: 'RESULTS',   label: 'Résultats',   desc: 'Notes Excel',            icon: BookOpen,    format: 'EXCEL', color: 'text-orange-600 bg-orange-50' },
  { type: 'TEACHERS',  label: 'Enseignants', desc: 'Liste Excel',            icon: GraduationCap,format: 'EXCEL',color: 'text-cyan-600 bg-cyan-50' },
  { type: 'FULL',      label: 'Complet',     desc: 'Export ZIP',             icon: Package,     format: 'ZIP',   color: 'text-gray-700 bg-gray-100' },
];

const FREQ_LABELS: Record<string, string> = { MONTHLY: 'Mensuel', WEEKLY: 'Hebdomadaire', QUARTERLY: 'Trimestriel' };

function fmtSize(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export default function ExportsPage() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeExport, setActiveExport] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<(typeof QUICK_EXPORTS)[0] | null>(null);
  const [filename, setFilename] = useState('');

  const { history, isLoadingHistory, schedules, isLoadingSchedules, quickExport, isExporting, createSchedule, isCreatingSchedule, deleteSchedule } = useExports();

  const handleQuickExport = async () => {
    if (!showExportModal) return;
    setActiveExport(showExportModal.type);
    try {
      await quickExport({
        type: showExportModal.type,
        format: showExportModal.format,
        filename: filename || `${showExportModal.type.toLowerCase()}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '')}`
      });
      setShowExportModal(null);
      setFilename('');
    } finally {
      setActiveExport(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileSpreadsheet className="h-7 w-7 text-[#1B5E20]" />
          Exports Avancés
        </h1>
        <p className="text-sm text-gray-500 mt-1">Exportez vos données en Excel, PDF ou ZIP</p>
      </div>

      {/* Exports rapides */}
      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Exports rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_EXPORTS.map(exp => {
              const Icon = exp.icon;
              const isActive = activeExport === exp.type && isExporting;
              return (
                <button
                  key={exp.type}
                  onClick={() => { setShowExportModal(exp); setFilename(''); }}
                  disabled={isExporting}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-[#1B5E20] hover:bg-[#E8F5E9]/20 transition-all group disabled:opacity-50"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${exp.color}`}>
                    {isActive ? <Loader2 className="h-6 w-6 animate-spin" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-800">{exp.label}</p>
                    <p className="text-xs text-gray-400">{exp.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Exports planifiés */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Exports planifiés</h2>
            <Button onClick={() => setShowScheduleModal(true)} className="gap-1.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white">
              <Plus className="h-4 w-4" /> Planifier
            </Button>
          </div>
          {isLoadingSchedules ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun export planifié</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s: any) => (
                <div key={s.id} className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{s.type} — {s.format}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {FREQ_LABELS[s.frequency] ?? s.frequency} · {s.time}
                      {s.nextRunAt && ` · Prochain : ${new Date(s.nextRunAt).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    <button onClick={() => deleteSchedule(s.id)} className="text-gray-400 hover:text-red-500 p-1 rounded">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique */}
      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Historique des exports</h2>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Aucun export réalisé</p>
          ) : (
            <div className="space-y-2">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {h.format === 'PDF' ? <FileText className="h-4 w-4 text-red-500" /> : <FileSpreadsheet className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{h.filename}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(h.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {h.fileSize > 0 && ` · ${fmtSize(h.fileSize)}`}
                        {h.generatedBy && ` · Par ${h.generatedBy.nom}`}
                      </p>
                    </div>
                  </div>
                  <a href={h.fileUrl} download className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                    <Download className="h-3 w-3" /> Télécharger
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal export rapide */}
      {showExportModal && (
        <div className="fixed inset-0 bg-[#0F1E12]/55 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] p-5 rounded-t-lg flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Exporter — {showExportModal.label}</h2>
                <button onClick={() => setShowExportModal(null)} className="text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Nom du fichier</Label>
                  <Input
                    className="mt-1.5"
                    value={filename}
                    onChange={e => setFilename(e.target.value)}
                    placeholder={`${showExportModal.label.toLowerCase()}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '')}`}
                  />
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <p><span className="font-medium">Format :</span> {showExportModal.format}</p>
                  <p><span className="font-medium">Type :</span> {showExportModal.desc}</p>
                </div>
                <div className="flex gap-3 pt-1">
                  <Button variant="outline" onClick={() => setShowExportModal(null)} className="flex-1">Annuler</Button>
                  <Button onClick={handleQuickExport} disabled={isExporting} className="flex-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white gap-1.5">
                    {isExporting ? <><Loader2 className="h-4 w-4 animate-spin" /> Export...</> : <><Download className="h-4 w-4" /> Exporter</>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal planifier */}
      {showScheduleModal && (
        <ScheduleModal
          onClose={() => setShowScheduleModal(false)}
          onSubmit={async (data) => { await createSchedule(data); setShowScheduleModal(false); }}
          isLoading={isCreatingSchedule}
        />
      )}
    </div>
  );
}

function ScheduleModal({ onClose, onSubmit, isLoading }: { onClose: () => void; onSubmit: (d: any) => Promise<void>; isLoading: boolean }) {
  const [type, setType] = useState('FINANCE');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [time, setTime] = useState('08:00');
  const [format, setFormat] = useState('EXCEL');
  const [email, setEmail] = useState('');

  return (
    <div className="fixed inset-0 bg-[#0F1E12]/55 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] p-5 rounded-t-lg flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Clock className="h-5 w-5" /> Planifier un export</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">Type</Label>
                <select value={type} onChange={e => setType(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {QUICK_EXPORTS.map(e => <option key={e.type} value={e.type}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Format</Label>
                <select value={format} onChange={e => setFormat(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="EXCEL">Excel</option>
                  <option value="PDF">PDF</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">Fréquence</Label>
                <select value={frequency} onChange={e => setFrequency(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="MONTHLY">Mensuel</option>
                  <option value="WEEKLY">Hebdomadaire</option>
                  <option value="QUARTERLY">Trimestriel</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Heure</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Email destinataire (optionnel)</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="direction@ecole.cd" className="mt-1" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
              <Button
                onClick={() => onSubmit({ type, frequency, time, format, dayOfMonth: frequency === 'MONTHLY' ? 1 : undefined, recipients: email ? [email] : [] })}
                disabled={isLoading}
                className="flex-1 bg-[#0D47A1] hover:bg-[#1565C0] text-white gap-1.5"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Clock className="h-4 w-4" /> Planifier</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
