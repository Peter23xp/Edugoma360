import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChevronLeft, ChevronRight, Smartphone, User, Hash, Wallet } from 'lucide-react';
import { Recipient } from './RecipientSelector';

interface SMSPreviewProps {
  recipients: Recipient[];
  template: string;
}

export function SMSPreview({ recipients, template }: SMSPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const recipient = recipients?.[Math.min(currentIndex, Math.max(0, recipients.length - 1))];

  // Replace variables in template
  const message = useMemo(() => {
    if (!recipient?.variables || !template) return template || '';
    let msg = template;
    Object.entries(recipient.variables).forEach(([key, value]) => {
      msg = msg.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value ?? ''));
    });
    return msg;
  }, [recipient, template]);

  if (!recipients || recipients.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
            <Smartphone className="h-5 w-5 text-gray-400" />
            Prévisualisation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">Aucun destinataire sélectionné pour la prévisualisation.</p>
            <p className="text-xs text-gray-400">Sélectionnez des destinataires à l'étape 1 pour voir un aperçu.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : recipients.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < recipients.length - 1 ? prev + 1 : 0));
  };

  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160) || 1;
  const costUnitaire = smsCount * 25;

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#F57F17]/5 to-transparent border-b border-gray-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <Smartphone className="h-5 w-5 text-[#F57F17]" />
          Prévisualisation
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* ── Recipient selector ───────────────────────────── */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Aperçu pour :
          </Label>
          <select
            className="
              w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-white
              focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]
              transition-all duration-200
            "
            value={currentIndex}
            onChange={(e) => setCurrentIndex(Number(e.target.value))}
          >
            {recipients.map((r, i) => (
              <option key={i} value={i}>
                {r.name || r.variables.nom || r.phone}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            {recipient.variables?.nom && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Élève : <span className="font-medium text-gray-700">{recipient.variables.nom}</span>
                {recipient.variables.classe && recipient.variables.classe !== 'N/A' && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                    {recipient.variables.classe}
                  </Badge>
                )}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {recipient.phone}
            </span>
          </div>
        </div>

        {/* ── Phone mockup ─────────────────────────────────── */}
        <div className="relative rounded-2xl bg-gradient-to-b from-gray-900 to-gray-800 p-1 shadow-lg max-w-sm mx-auto">
          {/* Phone notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-xl" />

          <div className="bg-white rounded-xl p-4 pt-6 min-h-[140px]">
            {/* SMS header */}
            <div className="text-center mb-3">
              <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-0.5 rounded-full">
                Message SMS
              </span>
            </div>

            {/* SMS bubble */}
            <div className="bg-[#E8F5E9] rounded-2xl rounded-tl-sm p-3 shadow-sm">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                {message || <span className="italic text-gray-400">Aucun message</span>}
              </p>
            </div>

            {/* Character count */}
            <div className="mt-2 text-right">
              <span className={`text-[10px] font-medium ${charCount > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                {charCount} caractères
              </span>
            </div>
          </div>
        </div>

        {/* ── SMS info ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <Hash className="h-4 w-4 text-[#0D47A1]" />
            <div className="text-xs">
              <span className="text-gray-500">Nombre de SMS :</span>
              <span className={`font-bold ml-1 ${smsCount > 1 ? 'text-red-600' : 'text-gray-800'}`}>
                {smsCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <Wallet className="h-4 w-4 text-[#F57F17]" />
            <div className="text-xs">
              <span className="text-gray-500">Coût unitaire :</span>
              <span className="font-bold text-gray-800 ml-1">{costUnitaire} FC</span>
            </div>
          </div>
        </div>

        {/* ── Navigation ───────────────────────────────────── */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handlePrev}
            className="text-xs h-8 gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Précédent</span>
          </Button>

          <div className="flex items-center gap-2">
            {recipients.slice(
              Math.max(0, currentIndex - 2),
              Math.min(recipients.length, currentIndex + 3)
            ).map((_, i) => {
              const actualIndex = Math.max(0, currentIndex - 2) + i;
              return (
                <button
                  key={actualIndex}
                  onClick={() => setCurrentIndex(actualIndex)}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-200
                    ${actualIndex === currentIndex
                      ? 'bg-[#1B5E20] w-4'
                      : 'bg-gray-300 hover:bg-gray-400'
                    }
                  `}
                />
              );
            })}
            <span className="text-xs text-gray-400 ml-2">
              {currentIndex + 1}/{recipients.length}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            className="text-xs h-8 gap-1"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper label component for internal use
function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm font-medium text-gray-700 ${className}`}>{children}</p>;
}
