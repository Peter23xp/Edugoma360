import { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RecipientSelector, Recipient } from '../../components/communication/RecipientSelector';
import { EmailEditor } from '../../components/communication/EmailEditor';
import { EmailTemplates } from '../../components/communication/EmailTemplates';
import { AttachmentManager } from '../../components/communication/AttachmentManager';
import {
  Mail, Send, CalendarClock,
  UploadCloud, Loader2, Zap, Shield, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function EmailPage() {
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [ccList, setCcList] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('08:00');

  // Derived state
  const validRecipients = useMemo(
    () => selectedRecipients.filter(r => r.variables.email || r.phone), // assume recipients have email in real data, fallback to phone logic for mock consistency
    [selectedRecipients]
  );
  
  const canSend = validRecipients.length > 0 && subject.trim().length > 0 && htmlContent.trim().length > 0;

  const handleTemplateSelect = (template: any) => {
    setSubject(template.subject);
    setHtmlContent(template.html);
  };

  const handleSendClick = () => {
    if (!canSend) {
      if (selectedRecipients.length === 0) toast.error('Veuillez sélectionner au moins un destinataire.');
      else if (!subject.trim()) toast.error('Veuillez définir un objet.');
      else toast.error('Le message ne peut pas être vide.');
      return;
    }
    setShowConfirmModal(true);
  };

  const executeSend = async (scheduledAt?: string) => {
    setIsSending(true);
    try {
      // Collecter les emails (via parentUserId → User.email ou Teacher.email)
      // Pour l'instant on passe les noms comme emails de test (à enrichir avec vrai champ email)
      const recipientEmails = validRecipients
        .map((r) => r.variables?.email as string | undefined)
        .filter((e): e is string => !!e && e.includes('@'));

      const formData = new FormData();
      formData.append('recipientEmails', JSON.stringify(recipientEmails.length > 0 ? recipientEmails : ['test@edugoma.cd']));
      formData.append('recipientType', 'ALL');
      formData.append('subject', subject);
      formData.append('htmlContent', htmlContent);
      if (ccList) formData.append('cc', ccList);
      if (scheduledAt) formData.append('scheduledAt', scheduledAt);
      attachments.forEach((file) => formData.append('attachments', file));

      await api.post('/emails/send', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      setShowConfirmModal(false);
      setShowScheduleModal(false);
      if (scheduledAt) {
        toast.success(`📅 Emails programmés pour le ${new Date(scheduledAt).toLocaleString('fr-FR')}`);
      } else {
        toast.success(`✅ ${validRecipients.length} email(s) envoyé(s) avec succès !`);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Erreur lors de l\'envoi des emails');
    } finally {
      setIsSending(false);
    }
  };

  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error('Veuillez remplir la date et l\'heure');
      return;
    }
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    executeSend(scheduledAt);
  };

  return (
    <div className="min-h-full pb-20">
      {/* ── Page header ──────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="h-7 w-7 text-[#0D47A1]" />
          Envoi Emails Groupés
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez l'envoi d'emails professionnels avec pièces jointes et tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Main Form */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Step 1: Recipients */}
          <section>
            <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#1B5E20] text-white flex items-center justify-center text-[10px] font-bold">1</span>
              Destinataires
            </h2>
            <RecipientSelector onSelectionChange={setSelectedRecipients} />
            <div className="mt-3">
              <Label className="text-sm font-medium text-gray-700">Cc / Cci (Optionnel) :</Label>
              <Input 
                placeholder="email1@exemple.com, email2@exemple.com" 
                value={ccList}
                onChange={(e) => setCcList(e.target.value)}
                className="mt-1"
              />
            </div>
          </section>

          {/* Step 2: Editor */}
          <section>
            <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#0D47A1] text-white flex items-center justify-center text-[10px] font-bold">2</span>
              Message
            </h2>
            <EmailEditor 
              subject={subject}
              setSubject={setSubject}
              htmlContent={htmlContent}
              setHtmlContent={setHtmlContent}
            />
          </section>

          {/* Step 3: Attachments */}
          <section>
            <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#F57F17] text-white flex items-center justify-center text-[10px] font-bold">3</span>
              Pièces Jointes
            </h2>
            <AttachmentManager 
              attachments={attachments}
              setAttachments={setAttachments}
              maxFiles={3}
              maxTotalSizeMB={10}
            />
          </section>

        </div>

        {/* RIGHT COLUMN: Sidebar (Templates) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-6">
            <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-gray-600 text-white flex items-center justify-center text-[10px] font-bold">💡</span>
              Templates & Outils
            </h2>
            <EmailTemplates onSelectTemplate={handleTemplateSelect} />
          </div>
        </div>

      </div>

      {/* ── Action bar ───────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 sm:left-64 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4">
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {validRecipients.length > 0 && (
               <span className="flex items-center gap-1.5 font-medium">
                 <Mail className="h-4 w-4 text-[#0D47A1]" />
                 {validRecipients.length} Email{validRecipients.length > 1 ? 's' : ''} prêt{validRecipients.length > 1 ? 's' : ''}
               </span>
            )}
            {attachments.length > 0 && (
              <span className="flex items-center gap-1.5 font-medium border-l border-gray-300 pl-4">
                <UploadCloud className="h-4 w-4 text-gray-500" />
                {attachments.length} Pièce{attachments.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowScheduleModal(true)}
              disabled={!canSend || isSending}
              className="flex-1 sm:flex-initial gap-2 border-gray-300"
            >
              <CalendarClock className="h-4 w-4 text-gray-600" />
              Programmer
            </Button>

            <Button
              onClick={handleSendClick}
              disabled={!canSend || isSending}
              className="flex-1 sm:flex-initial gap-2 bg-[#0D47A1] hover:bg-[#1565C0] text-white shadow-md shadow-blue-200"
            >
              {isSending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours...</>
              ) : (
                <><Send className="h-4 w-4" /> Envoyer maintenant</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ════════ CONFIRMATION MODAL ════════ */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-[#0F1E12]/55 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] p-5 rounded-t-lg flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Confirmer l'envoi
                </h2>
                <button onClick={() => setShowConfirmModal(false)} className="text-white/70 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600">Résumé de votre envoi :</p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Destinataires :</span>
                    <span className="font-bold text-gray-800">{validRecipients.length} contact(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Objet :</span>
                    <span className="font-bold text-gray-800 truncate pl-4 max-w-[200px]">{subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pièces jointes :</span>
                    <span className="font-bold text-gray-800">{attachments.length} fichier(s)</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button onClick={() => executeSend()} disabled={isSending} className="flex-1 bg-[#0D47A1] hover:bg-[#1565C0] text-white">
                    {isSending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Envoi...</> : <><Zap className="h-4 w-4 mr-2" /> Confirmer</>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════ SCHEDULE MODAL ════════ */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-[#0F1E12]/55 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] p-5 rounded-t-lg flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" /> Programmer les emails
                </h2>
                <button onClick={() => setShowScheduleModal(false)} className="text-white/70 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date d'envoi *</label>
                    <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Heure d'envoi *</label>
                    <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowScheduleModal(false)} className="flex-1">Annuler</Button>
                  <Button onClick={handleSchedule} disabled={isSending || !scheduleDate || !scheduleTime} className="flex-1 bg-[#0D47A1] hover:bg-[#1565C0] text-white">
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CalendarClock className="h-4 w-4 mr-2" /> Programmer</>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
