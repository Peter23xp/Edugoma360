import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  FileText, AlertCircle, Info, Tag, MessageSquare,
  Receipt, Users2, GraduationCap, Clock, Calendar
} from 'lucide-react';

// ── Predefined templates ─────────────────────────────────────────────
export const predefinedTemplates = [
  {
    id: 'rappel_creances',
    label: 'Rappel créances',
    icon: Receipt,
    color: '#C62828',
    content: "EduGoma360: Cher parent, votre solde est de {montant} FC pour {nom}. Merci de régulariser avant le {date}. {ecole}"
  },
  {
    id: 'convocation_parent',
    label: 'Convocation',
    icon: Users2,
    color: '#F57F17',
    content: "EduGoma360: Vous êtes convoqué le {date} à {heure} pour {motif}. Merci de confirmer. {ecole}"
  },
  {
    id: 'resultats',
    label: 'Résultats',
    icon: GraduationCap,
    color: '#1B5E20',
    content: "EduGoma360: Les résultats du {periode} de {nom} sont disponibles. Consultez sur {url}. {ecole}"
  },
  {
    id: 'absence',
    label: 'Absence',
    icon: Clock,
    color: '#0D47A1',
    content: "EduGoma360: {nom} absent(e) aujourd'hui {periode}. Veuillez justifier. {ecole}"
  },
  {
    id: 'reunion',
    label: 'Réunion',
    icon: Calendar,
    color: '#6A1B9A',
    content: "EduGoma360: Réunion parents le {date} à {heure}. Thème: {sujet}. Présence obligatoire. {ecole}"
  },
  {
    id: 'personnalise',
    label: 'Personnalisé',
    icon: MessageSquare,
    color: '#455A64',
    content: ''
  }
];

// ── Available variables ──────────────────────────────────────────────
const availableVariables = [
  { key: '{nom}', label: 'Nom élève' },
  { key: '{prenom}', label: 'Prénom' },
  { key: '{classe}', label: 'Classe' },
  { key: '{montant}', label: 'Montant créance' },
  { key: '{date}', label: 'Date' },
  { key: '{heure}', label: 'Heure' },
  { key: '{periode}', label: 'Période' },
  { key: '{motif}', label: 'Motif' },
  { key: '{sujet}', label: 'Sujet' },
  { key: '{url}', label: 'URL' },
  { key: '{ecole}', label: 'Nom école' },
];

interface SMSTemplatesProps {
  onTemplateChange: (template: string) => void;
}

// ── Component ────────────────────────────────────────────────────────
export function SMSTemplates({ onTemplateChange }: SMSTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(predefinedTemplates[0].id);
  const [customMessage, setCustomMessage] = useState(predefinedTemplates[0].content);

  const handleTemplateSelection = useCallback((id: string) => {
    setSelectedTemplate(id);
    const template = predefinedTemplates.find(t => t.id === id);
    if (template) {
      setCustomMessage(template.content);
      onTemplateChange(template.content);
    }
  }, [onTemplateChange]);

  const handleCustomMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCustomMessage(val);
    onTemplateChange(val);
    if (selectedTemplate !== 'personnalise') {
      setSelectedTemplate('personnalise');
    }
  }, [selectedTemplate, onTemplateChange]);

  const insertVariable = useCallback((variable: string) => {
    setCustomMessage(prev => {
      const newMsg = prev + variable;
      onTemplateChange(newMsg);
      return newMsg;
    });
    if (selectedTemplate !== 'personnalise') {
      setSelectedTemplate('personnalise');
    }
  }, [selectedTemplate, onTemplateChange]);

  const charCount = customMessage.length;
  const isOverLimit = charCount > 160;
  const smsCount = Math.ceil(charCount / 160) || 1;

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#0D47A1]/5 to-transparent border-b border-gray-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <FileText className="h-5 w-5 text-[#0D47A1]" />
          Templates :
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* ── Template selection chips ──────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {predefinedTemplates.map(t => {
            const isSelected = selectedTemplate === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTemplateSelection(t.id)}
                className={`
                  relative flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left
                  transition-all duration-200 text-xs font-medium
                  ${isSelected
                    ? 'border-transparent shadow-md ring-2 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                  }
                `}
                style={isSelected ? { backgroundColor: t.color } : {}}
              >
                <t.icon className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-white/80' : 'text-gray-400'}`} />
                <span className="truncate">{t.label}</span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Message textarea ──────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Message (160 caractères max) :</Label>
            {isOverLimit && (
              <Badge variant="destructive" className="text-[10px] px-2 py-0.5 animate-pulse">
                {smsCount} SMS
              </Badge>
            )}
          </div>

          <div className="relative group">
            <Textarea
              value={customMessage}
              onChange={handleCustomMessageChange}
              placeholder="Rédigez votre message ici ou sélectionnez un template ci-dessus..."
              className={`
                min-h-[130px] resize-none text-sm leading-relaxed pr-20
                transition-all duration-200
                ${isOverLimit
                  ? 'border-red-400 focus-visible:ring-red-400/20'
                  : 'border-gray-200 focus-visible:ring-[#1B5E20]/20'
                }
              `}
            />

            {/* Character counter */}
            <div className={`
              absolute bottom-3 right-3 flex items-center gap-1 text-xs font-semibold
              px-2 py-0.5 rounded-full
              ${isOverLimit
                ? 'bg-red-50 text-red-600'
                : charCount > 140
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-green-50 text-green-600'
              }
            `}>
              {charCount}/160
              {!isOverLimit && <span className="text-green-500">✓</span>}
            </div>
          </div>

          {/* Over-limit warning */}
          {isOverLimit && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                <span className="font-semibold">Attention :</span> Ce message sera envoyé en{' '}
                <span className="font-bold">{smsCount} SMS</span> (coût ×{smsCount}).
                Le coût total par destinataire sera de <span className="font-bold">{smsCount * 25} FC</span>.
              </p>
            </div>
          )}
        </div>

        {/* ── Variables chips ──────────────────────────────── */}
        <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-[#F57F17]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Variables disponibles
            </span>
            <Info className="h-3 w-3 text-gray-400 ml-auto" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {availableVariables.map(v => (
              <button
                key={v.key}
                onClick={() => insertVariable(v.key)}
                className="
                  inline-flex items-center gap-1 px-2.5 py-1 rounded-md
                  bg-white border border-gray-200 text-[11px] font-mono text-gray-600
                  hover:bg-[#1B5E20] hover:text-white hover:border-[#1B5E20]
                  transition-all duration-150 cursor-pointer
                  active:scale-95
                "
                title={`Insérer ${v.key} — ${v.label}`}
              >
                <span className="font-semibold">{v.key}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 italic">
            💡 Cliquez sur une variable pour l'insérer dans le message
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
