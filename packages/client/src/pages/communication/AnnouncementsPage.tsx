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
    color: 'text-[#0D47A1]',
    bg: 'bg-blue-50',
    border: 'border-[#0D47A1]',
    badge: 'bg-blue-100 text-[#0D47A1]',
    headerBg: 'bg-gradient-to-r from-[#0D47A1] to-[#1565C0]',
  },
  URGENT: {
    label: 'Urgent',
    icon: AlertTriangle,
    color: 'text-[#F57F17]',
    bg: 'bg-orange-50',
    border: 'border-[#F57F17]',
    badge: 'bg-orange-100 text-[#F57F17]',
    headerBg: 'bg-gradient-to-r from-[#F57F17] to-[#FB8C00]',
  },
  CRITIQUE: {
    label: 'Critique',
    icon: AlertOctagon,
    color: 'text-[#C62828]',
    bg: 'bg-red-50',
    border: 'border-[#C62828]',
    badge: 'bg-red-100 text-[#C62828]',
    headerBg: 'bg-gradient-to-r from-[#C62828] to-[#D32F2F]',
  },
};

const STATUS_LABEL: Record<string, { label: string; icon: any; color: string }> = {
  ACTIVE:    { label: 'Active',      icon: CheckCircle, color: 'text-[#1B5E20]' },
  SCHEDULED: { label: 'Programmée', icon: Clock,       color: 'text-[#F57F17]' },
  ARCHIVED:  { label: 'Archivée',   icon: Package,     color: 'text-gray-400'  },
};

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, subtext }: any) {
  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-[#F57F17]" />
            Annonces &amp; Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">Publiez des annonces visibles sur le dashboard de toute l'école</p>
        </div>
        <Button onClick={() => { setEditAnnouncement(null); setShowForm(true); }} className="gap-2 bg-[#F57F17] hover:bg-[#E65100] text-white shadow-md">
          <Plus className="h-4 w-4" />
          Nouvelle annonce
        </Button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total annonces" value={stats.total} subtext="Cette année scolaire" borderColor="border-l-[#0D47A1]" />
        <StatCard label="Actives" value={stats.active} subtext="Affichées maintenant" borderColor="border-l-[#1B5E20]" />
        <StatCard label="Programmées" value={stats.scheduled} subtext="À venir" borderColor="border-l-[#F57F17]" />
        <StatCard label="Archivées" value={stats.archived} subtext="Expirées ou supprimées" borderColor="border-l-gray-400" />
      </div>

      {/* ── Filtres ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#F57F17]/20 focus:border-[#F57F17]"
        >
          <option value="">Toutes les priorités</option>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#F57F17]/20 focus:border-[#F57F17]"
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
          <Loader2 className="h-8 w-8 animate-spin text-[#F57F17]" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucune annonce trouvée</p>
          <p className="text-gray-400 text-sm mt-1">Créez votre première annonce en cliquant sur le bouton ci-dessus</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const pCfg = PRIORITY_CONFIG[a.priority] ?? PRIORITY_CONFIG.INFO;
            const PIcon = pCfg.icon;
            const sCfg = STATUS_LABEL[a.status] ?? STATUS_LABEL.ACTIVE;
            const SIcon = sCfg.icon;

            return (
              <Card key={a.id} className={`border-l-4 ${pCfg.border} hover:shadow-md transition-all duration-200 overflow-hidden`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Badge priorité + statut */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${pCfg.badge}`}>
                          <PIcon className="h-3 w-3" /> {pCfg.label.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${sCfg.color}`}>
                          <SIcon className="h-3 w-3" /> {sCfg.label}
                        </span>
                        {a.isPinned && (
                          <span className="inline-flex items-center gap-1 text-xs text-[#0D47A1] font-medium">
                            <Pin className="h-3 w-3" /> Épinglé
                          </span>
                        )}
                      </div>

                      {/* Titre + message */}
                      <h3 className="font-semibold text-gray-900">{a.titre}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{a.message}</p>

                      {/* Métadonnées */}
                      <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400">
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
                          <span className="text-gray-300">Par {a.createdBy.nom}</span>
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
                          className="text-xs gap-1 text-gray-500 border-gray-200 hover:bg-gray-50"
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
    <div className="fixed inset-0 bg-[#0F1E12]/55 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      <Card className="w-full max-w-lg my-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <CardContent className="p-0">
          <div className={`${pCfg.headerBg} p-5 rounded-t-lg flex items-center justify-between`}>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              {initial ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
            </h2>
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Priorité */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Priorité *</Label>
              <RadioGroup value={priority} onValueChange={(v: any) => setPriority(v)} className="grid grid-cols-3 gap-2">
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => {
                  const Icon = v.icon;
                  return (
                    <label
                      key={k}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        priority === k ? `${v.border} ${v.bg}` : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <RadioGroupItem value={k} id={`p-${k}`} className="hidden" />
                      <Icon className={`h-5 w-5 ${priority === k ? v.color : 'text-gray-400'}`} />
                      <span className={`text-xs font-semibold ${priority === k ? v.color : 'text-gray-500'}`}>{v.label}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Titre */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Titre * <span className="text-gray-400 font-normal">(60 max)</span></Label>
                <span className={`text-xs font-mono ${titre.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>{titre.length}/60</span>
              </div>
              <Input value={titre} onChange={(e) => setTitre(e.target.value.slice(0, 60))} placeholder="Ex: Fermeture école le 20/04 (jour férié)" />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Message * <span className="text-gray-400 font-normal">(300 max)</span></Label>
                <span className={`text-xs font-mono ${message.length > 300 ? 'text-red-500' : 'text-gray-400'}`}>{message.length}/300</span>
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
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Destinataires *</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'PARENTS', label: 'Parents d\'élèves' },
                  { value: 'TEACHERS', label: 'Enseignants' },
                  { value: 'STAFF', label: 'Secrétariat' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                      audience.includes(opt.value)
                        ? 'bg-[#F57F17] text-white border-[#F57F17]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
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
                <Label className="text-sm font-medium text-gray-700">Date début *</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={today} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Date fin *</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
              </div>
            </div>

            {/* Options */}
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox checked={isPinned} onCheckedChange={(c) => setIsPinned(!!c)} />
              <span className="text-sm text-gray-700 flex items-center gap-1.5">
                <Pin className="h-4 w-4 text-[#0D47A1]" />
                Épingler en haut du dashboard
              </span>
            </label>
          </div>

          <div className="border-t border-gray-100 p-5 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !titre.trim() || !message.trim() || audience.length === 0}
              className="flex-1 gap-1.5"
              style={{ backgroundColor: PRIORITY_CONFIG[priority].border.replace('border-', '') === pCfg.border ? '#F57F17' : '#F57F17', color: 'white' }}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Publication...</>
              ) : (
                <><Megaphone className="h-4 w-4" /> {initial ? 'Enregistrer' : 'Publier'}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
