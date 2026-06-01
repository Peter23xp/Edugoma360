import { useState, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Checkbox } from '../../components/ui/checkbox';
import {
  UserCheck, Plus, Search, FileText, Mail,
  Trash2, CheckCircle, Clock, XCircle, Loader2,
  ClipboardList, Calendar, MapPin, X, Send
} from 'lucide-react';
import { useConvocations, ConvocationStudent } from '../../hooks/useConvocations';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────
const MOTIFS = [
  { value: 'RESULTATS_INSUFFISANTS', label: 'Résultats insuffisants' },
  { value: 'ABSENCES_REPETEES', label: 'Absences répétées' },
  { value: 'PROBLEME_DISCIPLINAIRE', label: 'Problème disciplinaire' },
  { value: 'RETARD_PAIEMENT', label: 'Retard de paiement' },
  { value: 'COMPORTEMENT_PREOCCUPANT', label: 'Comportement préoccupant' },
  { value: 'AUTRE', label: 'Autre motif' },
];

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente', color: 'bg-orange-100 text-orange-700', icon: Clock },
  CONFIRMED: { label: 'Confirmé',   color: 'bg-blue-100 text-blue-700',    icon: CheckCircle },
  ATTENDED:  { label: 'Présent',    color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  MISSED:    { label: 'Absent',     color: 'bg-red-100 text-red-700',      icon: XCircle },
  CANCELLED: { label: 'Annulée',    color: 'bg-neutral-100 text-neutral-600', icon: XCircle },
};

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, subtext }: any) {
  return (
    <Card className="bg-white border border-neutral-200 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-neutral-600">{label}</p>
        <h3 className="text-2xl font-bold text-neutral-900 mt-1">{value}</h3>
        <p className="text-xs text-neutral-500 mt-0.5">{subtext}</p>
      </CardContent>
    </Card>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ConvocationsPage() {
  const [search, setSearch] = useState('');
  const [filterMotif, setFilterMotif] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPresenceModal, setShowPresenceModal] = useState<string | null>(null);
  const [presenceNotes, setPresenceNotes] = useState('');
  const [presenceAttended, setPresenceAttended] = useState(true);

  const { convocations, stats, isLoading, createConvocation, isCreating, updateStatus, isUpdating } =
    useConvocations({ motif: filterMotif || undefined, status: filterStatus || undefined, search: search || undefined });

  const filtered = convocations;

  // ── Marquer présence ────────────────────────────────────────────────────
  const handleMarkPresence = async () => {
    if (!showPresenceModal) return;
    try {
      await updateStatus({
        id: showPresenceModal,
        status: presenceAttended ? 'ATTENDED' : 'MISSED',
        notes: presenceNotes,
      });
      setShowPresenceModal(null);
      setPresenceNotes('');
    } catch {}
  };

  return (
    <div className="space-y-6 pb-24">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <UserCheck className="h-7 w-7 text-primary" />
            Convocations parents
          </h1>
          <p className="text-sm text-neutral-600 mt-1">Gérez les convocations officielles aux parents et tuteurs</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 bg-primary hover:bg-primary-hover text-white shadow-md"
        >
          <Plus className="h-4 w-4" />
          Nouvelle convocation
        </Button>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total convocations" value={stats.total} subtext="Ce trimestre" borderColor="border-l-[#0D47A1]" />
        <StatCard label="En attente" value={stats.pending} subtext="Relancer si > 3 jours" borderColor="border-l-[#F57F17]" />
        <StatCard label="Confirmées" value={stats.confirmed} subtext="Parents présents attendus" borderColor="border-l-[#1B5E20]" />
        <StatCard label="Non venus" value={stats.missed} subtext="Nouvelle convocation requise" borderColor="border-l-[#C62828]" />
      </div>

      {/* ── Filtres ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Rechercher un parent ou élève..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterMotif}
          onChange={(e) => setFilterMotif(e.target.value)}
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">Tous les motifs</option>
          {MOTIFS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* ── Liste ────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <ClipboardList className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 font-medium">Aucune convocation trouvée</p>
          <p className="text-neutral-500 text-sm mt-1">Créez votre première convocation en cliquant sur le bouton ci-dessus</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const statusCfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.PENDING;
            const StatusIcon = statusCfg.icon;
            const motifLabel = MOTIFS.find((m) => m.value === c.motif)?.label ?? c.motif;

            return (
              <Card key={c.id} className="hover:shadow-md transition-all duration-200 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Date + Heure */}
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Calendar className="h-4 w-4 text-[#1B5E20]" />
                        <span className="font-semibold text-neutral-800">
                          {new Date(c.dateRendezVous).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à {c.heureRendezVous}
                        </span>
                      </div>

                      {/* Parent + Élève */}
                      <div>
                        <p className="font-semibold text-neutral-900">{c.parentName} <span className="text-neutral-400 font-normal text-sm">({c.parentQualite})</span></p>
                        <p className="text-sm text-neutral-500">
                          Élève : <span className="font-medium text-neutral-700">{c.student?.nom} {c.student?.postNom}</span>
                          {c.className && c.className !== 'N/A' && (
                            <span className="ml-2 bg-neutral-100 text-neutral-600 text-xs px-2 py-0.5 rounded-full">{c.className}</span>
                          )}
                        </p>
                      </div>

                      {/* Motif */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-600">Motif :</span>
                        <span className="text-sm text-neutral-700">{motifLabel}</span>
                      </div>

                      {/* Lieu + Statut */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                          <MapPin className="h-3 w-3" /> {c.lieu}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>
                        {c.emailSent && <span className="text-xs text-blue-500 flex items-center gap-1"><Mail className="h-3 w-3" /> Email envoyé</span>}
                        {c.smsSent && <span className="text-xs text-green-500 flex items-center gap-1"><Send className="h-3 w-3" /> SMS envoyé</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-col sm:items-end">
                      {c.pdfUrl && (
                        <a
                          href={c.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" /> PDF
                        </a>
                      )}
                      {(c.status === 'PENDING' || c.status === 'CONFIRMED') && (
                        <Button
                          
                          variant="outline"
                          onClick={() => { setShowPresenceModal(c.id); setPresenceAttended(true); setPresenceNotes(''); }}
                          className="text-xs gap-1 border-primary text-primary hover:bg-primary/5"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Marquer présence
                        </Button>
                      )}
                      {c.status === 'PENDING' && (
                        <Button
                          
                          variant="outline"
                          onClick={() => updateStatus({ id: c.id, status: 'CANCELLED' })}
                          className="text-xs gap-1 border-neutral-200 text-neutral-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Modal Formulaire ─────────────────────────────────────────────── */}
      {showForm && (
        <ConvocationFormModal
          onClose={() => setShowForm(false)}
          onSubmit={async (data) => {
            await createConvocation(data);
            setShowForm(false);
          }}
          isLoading={isCreating}
        />
      )}

      {/* ── Modal Marquer Présence ────────────────────────────────────────── */}
      {showPresenceModal && (
        <div className="edugoma-modal-overlay">
          <div className="edugoma-modal-panel max-w-md">
            <div className="edugoma-modal-header">
              <div className="flex items-center gap-3">
                <div className="edugoma-modal-icon">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">Marquer la présence</h2>
                  <p className="text-xs text-neutral-500">Compte-rendu du rendez-vous parent</p>
                </div>
              </div>
              <button onClick={() => setShowPresenceModal(null)} className="edugoma-modal-close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="edugoma-modal-body space-y-4">
              <p className="text-sm text-neutral-700">Le parent s'est-il présenté au rendez-vous ?</p>
              <RadioGroup
                value={presenceAttended ? 'yes' : 'no'}
                onValueChange={(v) => setPresenceAttended(v === 'yes')}
                className="space-y-2"
              >
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${presenceAttended ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300'}`}>
                  <RadioGroupItem value="yes" id="yes" />
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-neutral-700">Oui, présent(e)</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${!presenceAttended ? 'border-red-300 bg-red-50/60' : 'border-neutral-200 hover:border-neutral-300'}`}>
                  <RadioGroupItem value="no" id="no" />
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-neutral-700">Non, absent(e)</span>
                </label>
              </RadioGroup>
              <div>
                <Label className="text-sm font-medium text-neutral-700">Compte-rendu (optionnel)</Label>
                <Textarea
                  value={presenceNotes}
                  onChange={(e) => setPresenceNotes(e.target.value)}
                  placeholder="Notes sur l'entretien, décisions prises..."
                  className="mt-1.5 resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="edugoma-modal-footer">
              <Button variant="outline" onClick={() => setShowPresenceModal(null)} className="flex-1">Annuler</Button>
              <Button
                onClick={handleMarkPresence}
                disabled={isUpdating}
                className="flex-1 bg-primary hover:bg-primary-hover text-white gap-1.5"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal Formulaire Nouvelle Convocation ────────────────────────────────────
function ConvocationFormModal({ onClose, onSubmit, isLoading }: {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}) {
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState<ConvocationStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<ConvocationStudent | null>(null);
  const [searching, setSearching] = useState(false);

  const [parentQualite, setParentQualite] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  const [motif, setMotif] = useState('');
  const [details, setDetails] = useState('');
  const [dateRDV, setDateRDV] = useState('');
  const [heureRDV, setHeureRDV] = useState('10:00');
  const [lieu, setLieu] = useState('Bureau du Préfet');
  const [sendEmailFlag, setSendEmailFlag] = useState(true);
  const [sendSMSFlag, setSendSMSFlag] = useState(true);

  const { searchStudents } = useConvocations();

  const handleSearch = useCallback(async (q: string) => {
    setStudentSearch(q);
    if (q.length < 2) { setStudentResults([]); return; }
    setSearching(true);
    try {
      const results = await searchStudents(q);
      setStudentResults(results);
    } finally {
      setSearching(false);
    }
  }, [searchStudents]);

  const selectStudent = (s: ConvocationStudent) => {
    setSelectedStudent(s);
    setStudentSearch(s.nom);
    setStudentResults([]);
    // Sélectionner le premier parent disponible
    if (s.parents.length > 0) {
      const p = s.parents[0] as any;
      setParentQualite(p.qualite);
      setParentName(p.nom);
      setParentPhone(p.phone ?? '');
    }
    setParentEmail(s.parentEmail ?? '');
  };

  const selectParent = (p: any) => {
    setParentQualite(p.qualite);
    setParentName(p.nom);
    setParentPhone(p.phone ?? '');
  };

  const handleSubmit = async () => {
    if (!selectedStudent) return toast.error('Sélectionnez un élève');
    if (!motif) return toast.error('Choisissez un motif');
    if (!details.trim()) return toast.error('Précisez les détails');
    if (!dateRDV) return toast.error('Choisissez une date');

    await onSubmit({
      studentId: selectedStudent.id,
      parentName,
      parentPhone: parentPhone || undefined,
      parentEmail: parentEmail || undefined,
      parentQualite,
      motif,
      details,
      dateRendezVous: new Date(`${dateRDV}T${heureRDV}:00`).toISOString(),
      heureRendezVous: heureRDV,
      lieu,
      sendEmailFlag,
      sendSMSFlag,
    });
  };

  return (
    <div className="edugoma-modal-overlay">
      <div className="edugoma-modal-panel max-w-2xl">
          {/* Header */}
          <div className="edugoma-modal-header">
            <div className="flex items-center gap-3">
              <div className="edugoma-modal-icon">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">Nouvelle convocation</h2>
                <p className="text-xs text-neutral-500">Créer et envoyer une convocation parent</p>
              </div>
            </div>
            <button onClick={onClose} className="edugoma-modal-close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="edugoma-modal-body space-y-6">
            {/* Élève */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-neutral-700">
                1. Élève concerné *
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher par nom ou matricule..."
                  value={studentSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
                {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-neutral-400" />}
              </div>
              {studentResults.length > 0 && (
                <div className="border border-neutral-200 rounded-lg overflow-hidden shadow-sm bg-white max-h-48 overflow-y-auto">
                  {studentResults.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => selectStudent(s)}
                      className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 border-b border-neutral-100 last:border-0 transition-colors"
                    >
                      <p className="font-medium text-sm text-neutral-800">{s.nom}</p>
                      <p className="text-xs text-neutral-500">{s.classe}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedStudent && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                  <p className="text-sm font-semibold text-[#1B5E20]">{selectedStudent.nom} — {selectedStudent.classe}</p>
                  {selectedStudent.parents.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-1.5">Sélectionner le tuteur convoqué :</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.parents.map((p: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => selectParent(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              parentName === p.nom
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary/40'
                            }`}
                          >
                            {p.qualite} — {p.nom}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {parentPhone && (
                    <p className="text-xs text-neutral-500">Tél : <span className="font-mono text-neutral-700">{parentPhone}</span></p>
                  )}
                </div>
              )}
            </div>

            {/* Motif */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-neutral-700">
                2. Motif de convocation *
              </Label>
              <RadioGroup value={motif} onValueChange={setMotif} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MOTIFS.map((m) => (
                  <label
                    key={m.value}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                      motif === m.value ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <RadioGroupItem value={m.value} id={`motif-${m.value}`} />
                    <span className="text-sm text-neutral-700">{m.label}</span>
                  </label>
                ))}
              </RadioGroup>
              <div>
                <Label className="text-sm text-neutral-600 mb-1">Détails *</Label>
                <Textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Décrivez précisément la situation..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Date / Heure / Lieu */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-neutral-700">
                3. Date et lieu *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-neutral-600 mb-1">Date *</Label>
                  <Input type="date" value={dateRDV} onChange={(e) => setDateRDV(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <Label className="text-sm text-neutral-600 mb-1">Heure *</Label>
                  <Input type="time" value={heureRDV} onChange={(e) => setHeureRDV(e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-sm text-neutral-600 mb-1">Lieu</Label>
                <Input value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Bureau du Préfet" />
              </div>
            </div>

            {/* Options envoi */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-neutral-700">
                4. Envoi de la convocation
              </Label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={sendEmailFlag} onCheckedChange={(c) => setSendEmailFlag(!!c)} />
                  <span className="text-sm text-neutral-700">
                    <Mail className="h-4 w-4 inline mr-1 text-[#0D47A1]" />
                    Email (si adresse disponible)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={sendSMSFlag} onCheckedChange={(c) => setSendSMSFlag(!!c)} />
                  <span className="text-sm text-neutral-700">
                    <Send className="h-4 w-4 inline mr-1 text-[#1B5E20]" />
                    SMS de rappel (si numéro disponible)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="edugoma-modal-footer">
            <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary-hover text-white gap-1.5"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Génération PDF...</>
              ) : (
                <><FileText className="h-4 w-4" /> Générer &amp; Envoyer</>
              )}
            </Button>
          </div>
      </div>
    </div>
  );
}
