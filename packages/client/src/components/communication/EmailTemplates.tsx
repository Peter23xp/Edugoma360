import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { LayoutTemplate, ChevronRight, GraduationCap, Users2, Receipt, Calendar, MessageSquare } from 'lucide-react';

export const emailTemplates = [
  {
    id: 'resultats',
    label: 'Résultats Trimestriels',
    icon: GraduationCap,
    color: '#1B5E20',
    subject: 'Résultats du {periode} - {ecole}',
    html: `
      <h2>Chers Parents,</h2>
      <p>Les résultats de l'élève <strong>{nom}</strong> pour le <strong>{periode}</strong> sont désormais disponibles.</p>
      <p>Vous pouvez consulter et télécharger le bulletin détaillé depuis votre portail parent EduGoma 360.</p>
      <br/>
      <p>Cordialement,<br/>La Direction, {ecole}</p>
    `
  },
  {
    id: 'convocation_reunion',
    label: 'Convocation Réunion',
    icon: Users2,
    color: '#0D47A1',
    subject: 'Convocation : Réunion des parents - {ecole}',
    html: `
      <h2>Chers Parents,</h2>
      <p>Vous êtes conviés à une réunion parentale qui se tiendra le <strong>{date}</strong> à <strong>{heure}</strong>.</p>
      <p><strong>Sujet :</strong> {sujet}</p>
      <p>Votre présence est vivement souhaitée pour le suivi de votre enfant.</p>
      <br/>
      <p>Cordialement,<br/>La Direction, {ecole}</p>
    `
  },
  {
    id: 'rappel_paiement',
    label: 'Rappel de paiement',
    icon: Receipt,
    color: '#C62828',
    subject: 'Rappel de frais scolaires - {ecole}',
    html: `
      <h2>Bonjour,</h2>
      <p>Sauf erreur ou omission de notre part, votre solde de frais scolaires concernant <strong>{nom}</strong> s'élève à <strong>{montant} FC</strong>.</p>
      <p>Nous vous prions de bien vouloir régulariser cette situation avant le <strong>{date}</strong>.</p>
      <br/>
      <p>Merci de votre compréhension.<br/>La Comptabilité, {ecole}</p>
    `
  },
  {
    id: 'annonce_event',
    label: 'Annonce Événement',
    icon: Calendar,
    color: '#F57F17',
    subject: 'Événement à venir : {sujet}',
    html: `
      <h2>Annonce,</h2>
      <p>Nous avons le plaisir de vous informer d'un prochain événement : <strong>{sujet}</strong>.</p>
      <p>Il se tiendra le <strong>{date}</strong>. Vous trouverez de plus amples informations en pièce jointe de cet email.</p>
      <br/>
      <p>Bien à vous,<br/>L'équipe {ecole}</p>
    `
  },
  {
    id: 'personnalise',
    label: 'Email Vidé',
    icon: MessageSquare,
    color: '#455A64',
    subject: '',
    html: `<p>Bonjour,</p><br/><br/><p>Cordialement,</p>`
  }
];

interface EmailTemplatesProps {
  onSelectTemplate: (template: typeof emailTemplates[0]) => void;
  selectedId?: string;
}

export function EmailTemplates({ onSelectTemplate, selectedId }: EmailTemplatesProps) {
  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden h-full">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <LayoutTemplate className="h-5 w-5 text-gray-500" />
          Modèles rapides
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {emailTemplates.map(t => {
            const isSelected = selectedId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTemplate(t)}
                className={`
                  w-full flex items-center justify-between p-4 text-left transition-colors
                  hover:bg-neutral-50
                  ${isSelected ? 'bg-primary/5' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: t.color + '15' }}
                  >
                    <t.icon className="h-4 w-4" style={{ color: t.color }} />
                  </div>
                  <div>
                    <h5 className={`text-sm font-medium ${isSelected ? 'text-[#1B5E20]' : 'text-gray-800'}`}>
                      {t.label}
                    </h5>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-[#1B5E20]' : 'text-gray-300'}`} />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
