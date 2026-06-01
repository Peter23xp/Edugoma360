import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import {
  Megaphone, Plus, Edit2, Archive, Loader2, X,
  Info, AlertTriangle, AlertOctagon, Users, Calendar,
  Eye, Pin, Clock, CheckCircle, Package
} from 'lucide-react';
import { useAnnouncements } from '../../hooks/useAnnouncements';

// ── Config priorités ─────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  INFO: {
    label: 'Info',
    icon: Info,
    color: 'text-info',
    bg: 'bg-blue-50',
    border: 'border-info/25',
    badge: 'bg-blue-100 text-info',
    headerBg: 'bg-info',
  },
  URGENT: {
    label: 'Urgent',
    icon: AlertTriangle,
    color: 'text-accent',
    bg: 'bg-orange-50',
    border: 'border-accent/25',
    badge: 'bg-orange-100 text-accent',
    headerBg: 'bg-accent',
  },
  CRITIQUE: {
    label: 'Critique',
    icon: AlertOctagon,
    color: 'text-error',
    bg: 'bg-red-50',
    border: 'border-error/25',
    badge: 'bg-red-100 text-error',
    headerBg: 'bg-error',
  },
};

const STATUS_LABEL: Record<string, { label: string; icon: any; color: string }> = {
  ACTIVE:    { label: 'Active',      icon: CheckCircle, color: 'text-primary' },
  SCHEDULED: { label: 'Programmée', icon: Clock,       color: 'text-accent'  },
  ARCHIVED:  { label: 'Archivée',   icon: Package,     color: 'text-neutral-500' },
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

// ── Page principale ──────────────────────────────────────────────────────────
export default function AnnouncementsPage() {
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<any>(null);

  const { announcements, stats, isLoading, createAnnouncement, isCreating, updateAnnouncement, archiveAnnouncement } =
    useAnnouncements({ priority: filterPriority || undefined, status: filterStatus || undefined });

  return (
    <div className="space-y-6 pb-24">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-accent" />
            Annonces et notifications
          </h1>
          <p className="text-sm text-neutral-600 mt-1">Publiez des annonces visibles sur le tableau de bord de toute l'école</p>
        </div>
        <Button onClick={() => { setEditAnnouncement(null); setShowForm(true); }} className="gap-2 bg-accent hover:bg-accent-hover text-white shadow-sm">
          <Plus className="h-4 w-4" />
          Nouvelle annonce
        </Button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total annonces" value={stats.total} subtext="Cette année scolaire" />
        <StatCard label="Actives" value={stats.active} subtext="Affichées maintenant" />
        <StatCard label="Programmées" value={stats.scheduled} subtext="À venir" />
        <StatCard label="Archivées" value={stats.archived} subtext="Expirées ou supprimées" />
      </div>

      {/* ── Filtres ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">Toutes les priorités</option>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Actives</option>
          <option value="SCHEDULED">Programmées</option>
          <option value="ARCHIVED">Archivées</option>
        </select>
      </div>

      {/* ── Liste ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <Megaphone className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 font-medium">Aucune annonce trouvée</p>
          <p className="text-neutral-500 text-sm mt-1">Créez votre première annonce en cliquant sur le bouton ci-dessus</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const pCfg = PRIORITY_CONFIG[a.priority] ?? PRIORITY_CONFIG.INFO;
            const PIcon = pCfg.icon;
            const sCfg = STATUS_LABEL[a.status] ?? STATUS_LABEL.ACTIVE;
            const SIcon = sCfg.icon;

            return (
              <Card key={a.id} className={`border ${pCfg.border} ${pCfg.bg} hover:shadow-sm transition-all duration-200 overflow-hidden`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Badge priorité + statut */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${pCfg.badge}`}>
                          <PIcon className="h-3 w-3" /> {pCfg.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${sCfg.color}`}>
                          <SIcon className="h-3 w-3" /> {sCfg.label}
                        </span>
                        {a.isPinned && (
                          <span className="inline-flex items-center gap-1 text-xs text-info font-medium">
                            <Pin className="h-3 w-3" /> Épinglé
                          </span>
                        )}
                      </div>

                      {/* Titre + message */}
                      <h3 className="font-semibold text-neutral-900">{a.titre}</h3>
                      <p className="text-sm text-neutral-700 line-clamp-2">{a.message}</p>

                      {/* Métadonnées */}
                      <div className="flex items-center gap-4 flex-wrap text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {a.audience.join(', ') || 'Tous'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Du {new Date(a.startDate).toLocaleDateString('fr-FR')} au {new Date(a.endDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {a.viewCount} vue(s)
                        </span>
                        {a.createdBy && (
                          <span className="text-neutral-400">Par {a.createdBy.nom}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {a.status !== 'ARCHIVED' && (
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <Button
                          variant="outline"
                          onClick={() => { setEditAnnouncement(a); setShowForm(true); }}
                          className="text-xs gap-1"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Éditer
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => archiveAnnouncement(a.id)}
                          className="text-xs gap-1 text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                        >
                          <Archive className="h-3.5 w-3.5" /> Archiver
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Modal Formulaire ─────────────────────────────────────────────── */}
      {showForm && (
        <AnnouncementFormModal
          initial={editAnnouncement}
          onClose={() => { setShowForm(false); setEditAnnouncement(null); }}
          onSubmit={async (data) => {
            if (editAnnouncement) {
              await updateAnnouncement({ id: editAnnouncement.id, ...data });
            } else {
              await createAnnouncement(data);
            }
            setShowForm(false);
            setEditAnnouncement(null);
          }}
          isLoading={isCreating}
        />
      )}
    </div>
  );
}

// ── Modal Formulaire Annonce ──────────────────────────────────────────────────
function AnnouncementFormModal({ initial, onClose, onSubmit, isLoading }: {
  initial?: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}) {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [priority, setPriority] = useState<'INFO' | 'URGENT' | 'CRITIQUE'>(initial?.priority ?? 'INFO');
  const [titre, setTitre] = useState(initial?.titre ?? '');
  const [message, setMessage] = useState(initial?.message ?? '');
  const [audience, setAudience] = useState<string[]>(initial?.audience ?? ['PARENTS', 'TEACHERS']);
  const [startDate, setStartDate] = useState(initial?.startDate?.slice(0, 10) ?? today);
  const [endDate, setEndDate] = useState(initial?.endDate?.slice(0, 10) ?? nextWeek);
  const [isPinned, setIsPinned] = useState(initial?.isPinned ?? false);

  const toggleAudience = (a: string) => {
    setAudience((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const handleSubmit = async () => {
    if (!titre.trim()) return;
    if (!message.trim()) return;
    if (audience.length === 0) return;
    await onSubmit({ priority, titre, message, audience, startDate, endDate, isPinned });
  };

  const pCfg = PRIORITY_CONFIG[priority];

  return (
    <div className="edugoma-modal-overlay">
      <div className="edugoma-modal-panel max-w-lg">
        {/* Header */}
        <div className="edugoma-modal-header">
          <div className="flex items-center gap-3">
            <div className="edugoma-modal-icon">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {initial ? "Modifier l'annonce" : 'Nouvelle annonce'}
              </h2>
              <p className="text-xs text-neutral-500">Publication visible sur le tableau de bord</p>
            </div>
          </div>
          <button onClick={onClose} className="edugoma-modal-close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="edugoma-modal-body space-y-5">
          {/* Priorité */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700">Priorité *</Label>
            <RadioGroup value={priority} onValueChange={(v: any) => setPriority(v)} className="grid grid-cols-3 gap-2">
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => {
                const Icon = v.icon;
                return (
                  <label
                    key={k}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      priority === k ? `${v.border} ${v.bg}` : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <RadioGroupItem value={k} id={`p-${k}`} className="hidden" />
                    <Icon className={`h-5 w-5 ${priority === k ? v.color : 'text-neutral-400'}`} />
                    <span className={`text-xs font-semibold ${priority === k ? v.color : 'text-neutral-500'}`}>{v.label}</span>
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Titre */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-neutral-700">Titre * <span className="text-neutral-400 font-normal">(60 max)</span></Label>
              <span className={`text-xs font-mono ${titre.length > 60 ? 'text-red-500' : 'text-neutral-400'}`}>{titre.length}/60</span>
            </div>
            <Input value={titre} onChange={(e) => setTitre(e.target.value.slice(0, 60))} placeholder="Ex: Fermeture école le 20/04 (jour férié)" />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-neutral-700">Message * <span className="text-neutral-400 font-normal">(300 max)</span></Label>
              <span className={`text-xs font-mono ${message.length > 300 ? 'text-red-500' : 'text-neutral-400'}`}>{message.length}/300</span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 300))}
              placeholder="Détails de l'annonce..."
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Destinataires */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700">Destinataires *</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'PARENTS', label: "Parents d'élèves" },
                { value: 'TEACHERS', label: 'Enseignants' },
                { value: 'STAFF', label: 'Secrétariat' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                    audience.includes(opt.value)
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <Checkbox
                    checked={audience.includes(opt.value)}
                    onCheckedChange={() => toggleAudience(opt.value)}
                    className="hidden"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-neutral-700">Date début *</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={today} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-neutral-700">Date fin *</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
            </div>
          </div>

          {/* Options */}
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox checked={isPinned} onCheckedChange={(c) => setIsPinned(!!c)} />
            <span className="text-sm text-neutral-700 flex items-center gap-1.5">
              <Pin className="h-4 w-4 text-info" />
              Épingler en haut du tableau de bord
            </span>
          </label>
        </div>

        <div className="edugoma-modal-footer">
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !titre.trim() || !message.trim() || audience.length === 0}
            className={`flex-1 gap-1.5 ${pCfg.headerBg} text-white hover:opacity-90`}
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Publication...</>
            ) : (
              <><Megaphone className="h-4 w-4" /> {initial ? 'Enregistrer' : 'Publier'}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
