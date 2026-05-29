# 📨 EDUGOMA 360 — MODULE COMMUNICATION COMPLET
## Prompts SCR-037 à SCR-040 | SMS, Emails, Convocations, Annonces

> **MODE D'EMPLOI :**
> Ce fichier contient **4 prompts indépendants**, un par écran.
> Exécute-les **dans l'ordre**, un à la fois dans ton IDE IA.
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> Attends la confirmation de l'IDE avant de passer au suivant.

---

## CONTEXTE GLOBAL (rappel rapide pour chaque prompt)

```
Projet     : EduGoma 360 — Gestion école secondaire, Goma, RDC
Stack      : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
State      : Zustand (auth) + TanStack Query (serveur)
Backend    : Express + Prisma + PostgreSQL
Palette    : Vert #1B5E20 (primary) | Or #F57F17 (accent) | Bleu #0D47A1 (info)
Monorepo   : packages/client + packages/server + packages/shared

Module     : Communication
Écrans     : SCR-037 à SCR-040 (4 écrans)
Prérequis  : Module Élèves, Enseignants, Finance, Présences
Rôles      : PRÉFET (tous), SECRÉTAIRE (SMS/Emails), ECONOME (rappels créances)
Complexité : ⭐⭐⭐⭐
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 4 — SCR-037 : ENVOI SMS GROUPÉS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/communication/SMSPage.tsx
Route : /communication/sms
Accès : Protégé (authentification requise)
Rôle minimum requis : SECRÉTAIRE


OBJECTIF
--------
Créer l'écran d'envoi de SMS groupés aux parents, élèves, ou enseignants
avec templates prédéfinis, sélection avancée des destinataires, et historique.
Intégration Africa's Talking API pour envoi SMS en RDC.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/communication/SMSPage.tsx                ← CRÉER (page principale)
2. packages/client/src/components/communication/RecipientSelector.tsx ← CRÉER (sélection destinataires)
3. packages/client/src/components/communication/SMSTemplates.tsx      ← CRÉER (templates messages)
4. packages/client/src/components/communication/SMSPreview.tsx        ← CRÉER (prévisualisation)
5. packages/client/src/components/communication/SMSHistory.tsx        ← CRÉER (historique)
6. packages/client/src/hooks/useSMS.ts                                ← CRÉER (hook TanStack Query)
7. packages/server/src/modules/communication/sms/sms.routes.ts        ← CRÉER
8. packages/server/src/modules/communication/sms/sms.controller.ts    ← CRÉER
9. packages/server/src/modules/communication/sms/sms.service.ts       ← CRÉER
10. packages/server/src/lib/sms/africasTalking.ts                     ← CRÉER (intégration API)


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ ENVOI SMS GROUPÉS                         [Historique]           │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ Solde SMS  │ │ Envoyés    │ │ En attente │ │ Échecs     │   │
  │  │ 2,450      │ │ 847 (mois) │ │ 0          │ │ 12         │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  ÉTAPE 1/3 : DESTINATAIRES                                       │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ Envoyer à :                                                │ │
  │  │ (•) Parents d'élèves  ( ) Enseignants  ( ) Tous            │ │
  │  │                                                            │ │
  │  │ Filtres avancés :                                          │ │
  │  │ Classes : [☑ 4ScA] [☑ 5PédA] [☐ 6ScA]                     │ │
  │  │ Statut paiement : [☑ Impayés] [☐ À jour]                  │ │
  │  │                                                            │ │
  │  │ Destinataires sélectionnés : 127 parents                   │ │
  │  │ Coût estimé : 127 SMS × 25 FC = 3,175 FC                  │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ÉTAPE 2/3 : MESSAGE                                             │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ Templates :                                                │ │
  │  │ [Rappel créances] [Convocation] [Résultats] [Personnalisé] │ │
  │  │                                                            │ │
  │  │ Message (160 caractères max) :                             │ │
  │  │ ┌────────────────────────────────────────────────────────┐ │ │
  │  │ │ EduGoma360: Cher parent, votre solde est de {montant}  │ │ │
  │  │ │ FC. Merci de régulariser avant le {date}. ISS Tumaini  │ │ │
  │  │ │                                                        │ │ │
  │  │ │                                           143/160 ✓    │ │ │
  │  │ └────────────────────────────────────────────────────────┘ │ │
  │  │                                                            │ │
  │  │ Variables disponibles :                                    │ │
  │  │ {nom}, {prenom}, {classe}, {montant}, {date}, {ecole}     │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ÉTAPE 3/3 : PRÉVISUALISATION                                    │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ Aperçu pour AMISI Pierre (parent de AMISI Jean) :         │ │
  │  │                                                            │ │
  │  │ EduGoma360: Cher parent, votre solde est de 45,000 FC.    │ │
  │  │ Merci de régulariser avant le 15/04/2026. ISS Tumaini     │ │
  │  │                                                            │ │
  │  │ Nombre de SMS : 1                                          │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  [← Retour]           [Programmer] [Envoyer maintenant]          │
  └──────────────────────────────────────────────────────────────────┘


ZONE STATISTIQUES (4 CARTES)
------------------------------
Carte 1 — Solde SMS
  Icône : 💳
  Valeur : 2,450 SMS
  Sous-texte : Recharger si < 500
  Couleur : Bleu #0D47A1

Carte 2 — Envoyés ce mois
  Icône : 📤
  Valeur : 847 SMS
  Sous-texte : -12% vs mois dernier
  Couleur : Vert #1B5E20

Carte 3 — En attente (queue)
  Icône : ⏳
  Valeur : 0 SMS
  Sous-texte : Aucun envoi en cours
  Couleur : Orange #F57F17

Carte 4 — Échecs ce mois
  Icône : ⚠️
  Valeur : 12 SMS
  Sous-texte : 1.4% taux échec
  Couleur : Rouge #C62828


COMPOSANT RecipientSelector.tsx
---------------------------------
Sélection avancée des destinataires avec filtres.

Props :
  interface RecipientSelectorProps {
    onSelectionChange: (recipients: Recipient[]) => void
  }

Structure :
  ┌────────────────────────────────────────────────────────┐
  │ Envoyer à :                                            │
  │ (•) Parents d'élèves                                   │
  │ ( ) Enseignants                                        │
  │ ( ) Tous (Parents + Enseignants)                       │
  │                                                        │
  │ FILTRES AVANCÉS (si Parents sélectionné)               │
  │                                                        │
  │ Classes :                                              │
  │ [☑ Toutes] [☑ 4ScA] [☐ 4ScB] [☑ 5PédA]               │
  │                                                        │
  │ Statut paiement :                                      │
  │ [☑ Tous] [☑ Impayés] [☐ Partiellement payé] [☐ À jour]│
  │                                                        │
  │ Présence (30 derniers jours) :                         │
  │ [☑ Tous] [☐ < 80%] [☐ < 60%]                         │
  │                                                        │
  │ ────────────────────────────────────────────           │
  │                                                        │
  │ 📊 Résumé sélection :                                  │
  │ • 127 parents sélectionnés                             │
  │ • 158 numéros valides                                  │
  │ • 12 numéros manquants ⚠️                              │
  │                                                        │
  │ 💰 Coût estimé :                                        │
  │ 158 SMS × 25 FC = 3,950 FC                            │
  │                                                        │
  │ [Voir la liste détaillée]                              │
  └────────────────────────────────────────────────────────┘

Validation :
  - Au moins 1 destinataire sélectionné
  - Vérifier numéros téléphone valides (+243...)
  - Alerte si > 500 destinataires (confirmation requise)


COMPOSANT SMSTemplates.tsx
----------------------------
Templates prédéfinis avec variables dynamiques.

Templates disponibles :

1. **Rappel créances**
   ```
   EduGoma360: Cher parent, votre solde est de {montant} FC pour {nom}. 
   Merci de régulariser avant le {date}. {ecole}
   ```

2. **Convocation parent**
   ```
   EduGoma360: Vous êtes convoqué le {date} à {heure} pour {motif}. 
   Merci de confirmer. {ecole}
   ```

3. **Résultats disponibles**
   ```
   EduGoma360: Les résultats du {periode} de {nom} sont disponibles. 
   Consultez sur {url}. {ecole}
   ```

4. **Absence élève**
   ```
   EduGoma360: {nom} absent(e) aujourd'hui {periode}. 
   Veuillez justifier. {ecole}
   ```

5. **Réunion parents**
   ```
   EduGoma360: Réunion parents le {date} à {heure}. 
   Thème: {sujet}. Présence obligatoire. {ecole}
   ```

6. **Personnalisé**
   Champ texte libre avec variables disponibles.

Variables disponibles :
  - {nom} : Nom élève
  - {prenom} : Prénom élève
  - {classe} : Classe élève
  - {montant} : Montant créance
  - {date} : Date formatée
  - {heure} : Heure
  - {periode} : Période (Trimestre 1, etc.)
  - {motif} : Motif convocation
  - {sujet} : Sujet réunion
  - {url} : URL plateforme
  - {ecole} : Nom école

Compteur caractères :
  - Afficher : "143/160" en vert si ≤160
  - Rouge si >160 (sera découpé en 2 SMS)
  - Alerte si >160 : "Ce message sera envoyé en 2 SMS (coût ×2)"


COMPOSANT SMSPreview.tsx
--------------------------
Prévisualisation du message personnalisé avant envoi.

Structure :
  ┌────────────────────────────────────────────────────────┐
  │ PRÉVISUALISATION                                       │
  │                                                        │
  │ Aperçu pour :                                          │
  │ [AMISI Pierre (parent) ▼]                              │
  │ → Élève : AMISI Jean-Baptiste (4ScA)                   │
  │ → Numéro : +243 997 123 456                            │
  │                                                        │
  │ ┌────────────────────────────────────────────────────┐ │
  │ │ 📱 Message tel que reçu :                          │ │
  │ │                                                    │ │
  │ │ EduGoma360: Cher parent, votre solde est de       │ │
  │ │ 45,000 FC pour AMISI Jean. Merci de régulariser   │ │
  │ │ avant le 15/04/2026. ISS Tumaini                  │ │
  │ │                                                    │ │
  │ │                                      143 caractères│ │
  │ └────────────────────────────────────────────────────┘ │
  │                                                        │
  │ Nombre de SMS : 1                                      │
  │ Coût unitaire : 25 FC                                  │
  │                                                        │
  │ [◀ Destinataire précédent] [Destinataire suivant ▶]    │
  └────────────────────────────────────────────────────────┘


VALIDATION ET ENVOI
--------------------
Avant envoi, vérifications :

1. Solde SMS suffisant
   → Si solde < nombre SMS : bloquer + message "Solde insuffisant. Rechargez."

2. Numéros valides
   → Vérifier format +243 XX XXX XXXX
   → Exclure numéros invalides automatiquement

3. Confirmation si > 100 destinataires
   → Modal : "Vous allez envoyer 158 SMS (coût : 3,950 FC). Confirmer ?"

4. Horaires d'envoi
   → Si heure actuelle 22h-7h : proposer programmation pour 8h

Modal confirmation :
  ┌─────────────────────────────────────────────┐
  │ CONFIRMER L'ENVOI                           │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Vous allez envoyer :                        │
  │ • 158 SMS                                   │
  │ • À 127 parents                             │
  │ • Coût total : 3,950 FC                     │
  │                                             │
  │ Solde actuel : 2,450 SMS                    │
  │ Solde après envoi : 2,292 SMS               │
  │                                             │
  │ ⚠️ Cette action est irréversible            │
  │                                             │
  │ [Annuler]              [Envoyer maintenant] │
  └─────────────────────────────────────────────┘


PROGRAMMATION ENVOI
---------------------
Option d'envoi différé :

  ┌─────────────────────────────────────────────┐
  │ PROGRAMMER L'ENVOI                          │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Date d'envoi * :                            │
  │ [15/04/2026] 📅                             │
  │                                             │
  │ Heure d'envoi * :                           │
  │ [08:00] 🕐                                  │
  │                                             │
  │ ⓘ Les SMS seront envoyés automatiquement    │
  │   à la date et heure spécifiées.            │
  │                                             │
  │ [Annuler]              [Programmer]         │
  └─────────────────────────────────────────────┘


APPELS API
-----------
GET /api/sms/balance
  Response 200 :
    {
      balance: number,       // Nombre SMS restants
      lastRecharge: string,  // ISO date
      provider: "Africa's Talking"
    }

POST /api/sms/send
  Body : {
    recipients: Array<{
      phone: string,      // +243 XX XXX XXXX
      variables: {        // Variables pour personnalisation
        nom: string,
        prenom?: string,
        classe?: string,
        montant?: number,
        date?: string,
        // ...
      }
    }>,
    template: string,     // Template message avec variables
    scheduledAt?: string  // ISO date si programmé
  }
  
  Response 202 :
    {
      jobId: string,
      totalRecipients: number,
      validRecipients: number,
      invalidRecipients: number,
      estimatedCost: number,
      status: 'QUEUED' | 'SCHEDULED'
    }

GET /api/sms/job/:jobId
  Response 200 :
    {
      jobId: string,
      status: 'QUEUED' | 'SENDING' | 'COMPLETED' | 'FAILED',
      totalSMS: number,
      sentSMS: number,
      failedSMS: number,
      progress: number,  // 0-100
      logs: Array<{
        phone: string,
        status: 'SENT' | 'FAILED',
        errorMessage?: string,
        sentAt?: string
      }>
    }


INTÉGRATION AFRICA'S TALKING
------------------------------
packages/server/src/lib/sms/africasTalking.ts :

```typescript
import AfricasTalking from 'africastalking'

const africastalking = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY!,
  username: process.env.AFRICASTALKING_USERNAME!
})

const sms = africastalking.SMS

interface SendSMSParams {
  to: string[]          // Array de numéros +243...
  message: string
  from?: string         // Sender ID (optionnel)
}

export async function sendSMS(params: SendSMSParams) {
  try {
    const result = await sms.send({
      to: params.to,
      message: params.message,
      from: params.from || 'EduGoma360'
    })
    
    return {
      success: true,
      data: result.SMSMessageData.Recipients.map(r => ({
        phone: r.number,
        status: r.status,      // 'Success' | 'Rejected'
        messageId: r.messageId,
        cost: r.cost
      }))
    }
  } catch (error) {
    console.error('Africa\'s Talking Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getBalance() {
  try {
    const result = await africastalking.APPLICATION.fetchApplicationData()
    return {
      balance: result.UserData.balance
    }
  } catch (error) {
    throw new Error('Failed to fetch SMS balance')
  }
}
```

Configuration .env :
```
AFRICASTALKING_API_KEY=your_api_key_here
AFRICASTALKING_USERNAME=your_username
AFRICASTALKING_SENDER_ID=EduGoma360
```


MODÈLE DE DONNÉES PRISMA
--------------------------
model SMSCampaign {
  id            String   @id @default(uuid())
  schoolId      String
  school        School   @relation(fields: [schoolId], references: [id])
  
  name          String?  // Nom campagne (optionnel)
  template      String   // Message avec variables
  recipientType RecipientType
  
  totalRecipients   Int
  validRecipients   Int
  invalidRecipients Int
  
  status        SMSCampaignStatus @default(QUEUED)
  scheduledAt   DateTime?
  startedAt     DateTime?
  completedAt   DateTime?
  
  sentSMS       Int      @default(0)
  failedSMS     Int      @default(0)
  cost          Float    @default(0)  // En FC
  
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  
  messages      SMSMessage[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([schoolId, status])
  @@index([createdAt])
}

model SMSMessage {
  id            String   @id @default(uuid())
  campaignId    String
  campaign      SMSCampaign @relation(fields: [campaignId], references: [id])
  
  phone         String
  message       String
  
  status        SMSStatus @default(PENDING)
  errorMessage  String?
  
  messageId     String?  // ID Africa's Talking
  cost          Float?   // Coût unitaire
  
  sentAt        DateTime?
  
  createdAt     DateTime @default(now())
  
  @@index([campaignId, status])
}

enum RecipientType {
  PARENTS
  TEACHERS
  ALL
}

enum SMSCampaignStatus {
  QUEUED
  SCHEDULED
  SENDING
  COMPLETED
  FAILED
  CANCELLED
}

enum SMSStatus {
  PENDING
  SENT
  FAILED
}


RÈGLES MÉTIER
--------------
1. Coût SMS : 25 FC par SMS (RDC, Africa's Talking)
   → SMS > 160 caractères = 2× SMS

2. Validation numéro RDC :
   → Format : +243 XX XXX XXXX
   → Opérateurs : 81/82 (Vodacom), 97/98 (Airtel), 89/90/91 (Orange), 99 (Africell)

3. Horaires envoi :
   → Éviter 22h-7h (notification nocturne gênante)
   → Si envoi hors horaires → proposer programmation automatique

4. Solde minimum :
   → Alerte si solde < 500 SMS
   → Bloquer envoi si solde < nombre SMS à envoyer

5. Rate limiting :
   → Max 1000 SMS/minute (limite Africa's Talking)
   → Envois > 1000 SMS → processing par batch de 1000


NOTIFICATIONS
--------------
1. Après envoi réussi :
   - Toast : "✓ 158 SMS envoyés avec succès (coût : 3,950 FC)"
   - Mise à jour solde en temps réel

2. Si échecs partiels :
   - Toast orange : "⚠️ 150/158 SMS envoyés. 8 échecs (numéros invalides)"
   - Lien vers détails échecs

3. Solde bas :
   - Toast rouge : "⚠️ Solde SMS bas (245 restants). Rechargez."


HISTORIQUE SMS
----------------
Onglet "Historique" en haut à droite :

  ┌────────────────────────────────────────────────────────┐
  │ HISTORIQUE DES ENVOIS                                  │
  │                                                        │
  │ Filtres : [Tous statuts ▼] [7 derniers jours ▼]       │
  │                                                        │
  │ ┌────────────────────────────────────────────────────┐ │
  │ │ 📅 15/03/2026 08:00 — Rappel créances              │ │
  │ │ ✅ Complété                                         │ │
  │ │ 158 SMS envoyés • 8 échecs • Coût : 3,950 FC       │ │
  │ │ Par : MUKASA Jean (Secrétaire)                     │ │
  │ │ [Voir détails] [Télécharger rapport]               │ │
  │ └────────────────────────────────────────────────────┘ │
  │                                                        │
  │ ... (autres campagnes)                                 │
  │                                                        │
  └────────────────────────────────────────────────────────┘


RESPONSIVE
-----------
Mobile (<768px) :
  - Stats cards : 2 colonnes
  - Filtres : empilés verticalement
  - Prévisualisation : pleine largeur
  - Boutons : full-width

Desktop (≥1024px) :
  - Stats cards : 4 colonnes
  - Filtres : grille 3 colonnes
  - Prévisualisation : sidebar droite


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Solde SMS affiché en temps réel
[ ] Sélection destinataires avec filtres fonctionne
[ ] Templates SMS prédéfinis disponibles
[ ] Variables {nom}, {montant}, etc. remplacées
[ ] Compteur caractères 160 fonctionne
[ ] Prévisualisation message personnalisé
[ ] Validation numéros +243 XX XXX XXXX
[ ] Confirmation avant envoi
[ ] Intégration Africa's Talking fonctionne
[ ] Envoi SMS réel (test avec 1-2 numéros)
[ ] Mise à jour solde après envoi
[ ] Historique campagnes affiché
[ ] Programmation envoi différé fonctionne
[ ] Responsive mobile parfait
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 4 — SCR-038 : ENVOI EMAILS GROUPÉS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Fichier : packages/client/src/pages/communication/EmailPage.tsx
Route : /communication/emails
Rôle : SECRÉTAIRE


OBJECTIF
--------
Envoi d'emails groupés avec éditeur HTML, pièces jointes, templates.
Tracking ouvertures et clics. Intégration Resend API.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/communication/EmailPage.tsx
2. packages/client/src/components/communication/EmailEditor.tsx
3. packages/client/src/components/communication/EmailTemplates.tsx
4. packages/client/src/components/communication/AttachmentManager.tsx
5. packages/server/src/lib/email/resend.ts


UI — STRUCTURE
---------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ ENVOI EMAILS GROUPÉS                                             │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  DESTINATAIRES                                                   │
  │  À : [Parents 4ScA (32) ▼]                                       │
  │  Cc : [Non]                                                      │
  │                                                                  │
  │  OBJET                                                           │
  │  [Résultats Trimestre 1 - 2025/2026]                             │
  │                                                                  │
  │  MESSAGE                                                         │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ [Gras] [Italique] [Souligner] [Liste] [Lien] [Image]      │ │
  │  │                                                            │ │
  │  │ Chers parents,                                             │ │
  │  │                                                            │ │
  │  │ Les résultats du Trimestre 1 sont disponibles...          │ │
  │  │                                                            │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  PIÈCES JOINTES (3 max, 10MB total)                              │
  │  📎 bulletin_t1.pdf (248 KB) [✕]                                 │
  │  [+ Ajouter fichier]                                             │
  │                                                                  │
  │  [Programmer] [Envoyer]                                          │
  └──────────────────────────────────────────────────────────────────┘


TEMPLATES EMAILS
-----------------
1. Résultats disponibles (HTML)
2. Convocation réunion
3. Rappel paiement
4. Annonce événement
5. Personnalisé


APPELS API
-----------
POST /api/emails/send
  Body : multipart/form-data {
    recipients: string[],
    subject: string,
    htmlContent: string,
    attachments?: File[]
  }
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 4 — SCR-039 : CONVOCATIONS PARENTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/communication/ConvocationsPage.tsx
Route : /communication/convocations
Accès : Protégé (authentification requise)
Rôle minimum requis : SECRÉTAIRE


OBJECTIF
--------
Créer l'écran de génération de convocations officielles aux parents
avec motifs prédéfinis, génération PDF automatique, envoi par email/SMS,
et suivi des accusés de réception.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/communication/ConvocationsPage.tsx           ← CRÉER (page principale)
2. packages/client/src/components/communication/ConvocationForm.tsx       ← CRÉER (formulaire)
3. packages/client/src/components/communication/ConvocationPreview.tsx    ← CRÉER (aperçu PDF)
4. packages/client/src/components/communication/ConvocationsList.tsx      ← CRÉER (liste)
5. packages/client/src/hooks/useConvocations.ts                           ← CRÉER (hook)
6. packages/server/src/modules/communication/convocations.routes.ts       ← CRÉER
7. packages/server/src/modules/communication/convocations.controller.ts   ← CRÉER
8. packages/server/src/modules/communication/convocations.service.ts      ← CRÉER
9. packages/server/src/lib/pdf/convocationGenerator.ts                    ← CRÉER (génération PDF)


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ CONVOCATIONS PARENTS                  [+ Nouvelle convocation]   │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ Total      │ │ En attente │ │ Confirmées │ │ Non venues │   │
  │  │ convocs    │ │ réponse    │ │            │ │            │   │
  │  │ 47         │ │ 12 (26%)   │ │ 28 (60%)   │ │ 7 (14%)    │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  Filtres : [Tous motifs ▼] [Toutes classes ▼] [🔍 Rechercher]  │
  │                                                                  │
  │  CONVOCATIONS RÉCENTES                                           │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 📅 15/04/2026 à 14h00                                      │ │
  │  │ AMISI Pierre (père de AMISI Jean - 4ScA)                   │ │
  │  │ Motif : Résultats insuffisants T1                          │ │
  │  │ Statut : ✅ Confirmé (12/04/2026)                          │ │
  │  │                                                            │ │
  │  │ [📄 PDF] [📧 Renvoyer] [✏️ Modifier] [🗑️ Annuler]         │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 📅 18/04/2026 à 10h00                                      │ │
  │  │ BAHATI Marie (mère de CIZA Pierre - 5PédA)                 │ │
  │  │ Motif : Absences répétées (12 jours)                       │ │
  │  │ Statut : ⏳ En attente réponse                             │ │
  │  │                                                            │ │
  │  │ [📄 PDF] [📧 Renvoyer] [✏️ Modifier] [🗑️ Annuler]         │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


ZONE STATISTIQUES (4 CARTES)
------------------------------
Carte 1 — Total convocations
  Icône : 📋
  Valeur : 47 convocations
  Sous-texte : Ce trimestre
  Couleur : Bleu #0D47A1

Carte 2 — En attente réponse
  Icône : ⏳
  Valeur : 12 (26%)
  Sous-texte : Relancer si > 3 jours
  Couleur : Orange #F57F17

Carte 3 — Confirmées
  Icône : ✅
  Valeur : 28 (60%)
  Sous-texte : Parents présents attendus
  Couleur : Vert #1B5E20

Carte 4 — Non venus
  Icône : ❌
  Valeur : 7 (14%)
  Sous-texte : Nouvelle convocation nécessaire
  Couleur : Rouge #C62828


MODAL NOUVELLE CONVOCATION
----------------------------
  ┌─────────────────────────────────────────────┐
  │ NOUVELLE CONVOCATION                        │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ ÉLÈVE CONCERNÉ *                            │
  │ [Rechercher élève...                    ▼] │
  │                                             │
  │ → AMISI Jean-Baptiste (4ScA)                │
  │   Tuteurs :                                 │
  │   • AMISI Pierre (Père) +243 997 123 456    │
  │   • AMISI Marie (Mère) +243 810 987 654     │
  │                                             │
  │ TUTEUR CONVOQUÉ *                           │
  │ (•) AMISI Pierre (Père)                     │
  │ ( ) AMISI Marie (Mère)                      │
  │ ( ) Les deux parents                        │
  │                                             │
  │ ────────────────────────────────────────    │
  │                                             │
  │ MOTIF DE CONVOCATION *                      │
  │ ( ) Résultats insuffisants                  │
  │ (•) Absences répétées                       │
  │ ( ) Problème disciplinaire                  │
  │ ( ) Retard paiement frais scolaires         │
  │ ( ) Autre (préciser)                        │
  │                                             │
  │ Détails du motif * :                        │
  │ [Élève absent 12 jours ce trimestre sans   │
  │  justification. Risque d'échec scolaire.]   │
  │                                             │
  │ ────────────────────────────────────────    │
  │                                             │
  │ DATE ET HEURE *                             │
  │ Date : [18/04/2026] 📅                      │
  │ Heure : [10:00] 🕐                          │
  │                                             │
  │ Lieu : [Bureau du Préfet]                   │
  │                                             │
  │ ────────────────────────────────────────    │
  │                                             │
  │ ENVOI DE LA CONVOCATION                     │
  │ [☑] Email (si disponible)                   │
  │ [☑] SMS de rappel                           │
  │ [☑] Impression pour remise à l'élève        │
  │                                             │
  │ [Annuler]      [Aperçu] [Générer & Envoyer] │
  └─────────────────────────────────────────────┘


MOTIFS PRÉDÉFINIS
------------------
6 motifs standards avec templates :

1. **Résultats insuffisants**
   ```
   Moyenne générale T{trimestre} : {moyenne}/20
   Risque d'ajournement si aucune amélioration
   ```

2. **Absences répétées**
   ```
   {nombre} jours d'absence sur {total} jours
   Dont {non_justifiees} absences non justifiées
   ```

3. **Problème disciplinaire**
   ```
   Incident le {date} : {description}
   Sanction temporaire : {sanction}
   ```

4. **Retard paiement**
   ```
   Solde impayé : {montant} FC
   Risque de non-participation aux examens
   ```

5. **Comportement préoccupant**
   ```
   Signalements répétés : {description}
   Nécessite suivi et engagement parental
   ```

6. **Autre**
   Champ libre pour motif personnalisé.


GÉNÉRATION PDF CONVOCATION
----------------------------
Format A4 portrait avec en-tête officiel.

Structure PDF :
  ┌─────────────────────────────────────────────┐
  │ [LOGO ÉCOLE]     INSTITUT SUPÉRIEUR ET      │
  │                  SECONDAIRE TUMAINI          │
  │                  Goma, Nord-Kivu, RDC        │
  │                                             │
  │ ─────────────────────────────────────────   │
  │                                             │
  │              CONVOCATION                    │
  │                                             │
  │ N° : CONV-2026-042                          │
  │ Date d'émission : 12 avril 2026             │
  │                                             │
  │ ─────────────────────────────────────────   │
  │                                             │
  │ Nous avons l'honneur de convoquer :         │
  │                                             │
  │ Monsieur/Madame : AMISI Pierre              │
  │ Qualité : Père de l'élève                   │
  │ Élève : AMISI Jean-Baptiste                 │
  │ Classe : 4ème Scientifique A                │
  │                                             │
  │ MOTIF : Absences répétées                   │
  │                                             │
  │ Détails :                                   │
  │ L'élève a été absent 12 jours ce trimestre  │
  │ sans justification valable. Cette situation │
  │ compromet sa réussite scolaire.             │
  │                                             │
  │ DATE : Vendredi 18 avril 2026               │
  │ HEURE : 10h00                               │
  │ LIEU : Bureau du Préfet des Études          │
  │                                             │
  │ Votre présence est OBLIGATOIRE.             │
  │                                             │
  │ Fait à Goma, le 12 avril 2026               │
  │                                             │
  │                    Le Préfet des Études     │
  │                    [Signature + Cachet]     │
  │                                             │
  │ ─────────────────────────────────────────   │
  │                                             │
  │ ACCUSÉ DE RÉCEPTION                         │
  │ (À retourner signé)                         │
  │                                             │
  │ Je soussigné(e) __________________ certifie │
  │ avoir bien reçu cette convocation.          │
  │                                             │
  │ Signature :                                 │
  │                                             │
  │ Date : ____/____/______                     │
  │                                             │
  └─────────────────────────────────────────────┘


CODE GÉNÉRATION PDF
---------------------
packages/server/src/lib/pdf/convocationGenerator.ts :

```typescript
import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

interface ConvocationData {
  numero: string
  dateEmission: Date
  tuteur: {
    nom: string
    prenom: string
    qualite: string // Père, Mère, Tuteur
  }
  eleve: {
    nom: string
    prenom: string
    classe: string
  }
  motif: string
  details: string
  dateRendezVous: Date
  heureRendezVous: string
  lieu: string
  school: {
    nom: string
    logoUrl: string
    adresse: string
  }
}

export async function generateConvocationPDF(
  data: ConvocationData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    })

    const chunks: Buffer[] = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // En-tête avec logo
    if (data.school.logoUrl && fs.existsSync(data.school.logoUrl)) {
      doc.image(data.school.logoUrl, 50, 50, { width: 80 })
    }
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(data.school.nom, 150, 60, { align: 'center' })
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(data.school.adresse, { align: 'center' })

    // Ligne séparatrice
    doc.moveTo(50, 130).lineTo(545, 130).stroke()

    // Titre CONVOCATION
    doc.moveDown(2)
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('CONVOCATION', { align: 'center' })

    // Numéro et date
    doc.moveDown()
    doc.fontSize(10)
       .font('Helvetica')
       .text(`N° : ${data.numero}`, 50)
       .text(`Date d'émission : ${formatDate(data.dateEmission)}`)

    doc.moveDown()
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()

    // Corps de la convocation
    doc.moveDown()
    doc.fontSize(11)
       .font('Helvetica')
       .text('Nous avons l\'honneur de convoquer :')

    doc.moveDown()
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text(`Monsieur/Madame : ${data.tuteur.prenom} ${data.tuteur.nom}`)
    
    doc.font('Helvetica')
       .text(`Qualité : ${data.tuteur.qualite} de l'élève`)
       .text(`Élève : ${data.eleve.prenom} ${data.eleve.nom}`)
       .text(`Classe : ${data.eleve.classe}`)

    doc.moveDown()
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(`MOTIF : ${data.motif}`)

    doc.moveDown()
    doc.fontSize(11)
       .font('Helvetica')
       .text('Détails :', { continued: false })
       .text(data.details, { align: 'justify' })

    doc.moveDown()
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text(`DATE : ${formatDateLong(data.dateRendezVous)}`)
       .text(`HEURE : ${data.heureRendezVous}`)
       .text(`LIEU : ${data.lieu}`)

    doc.moveDown()
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('Votre présence est OBLIGATOIRE.', { align: 'center' })

    // Signature
    doc.moveDown(2)
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Fait à Goma, le ${formatDate(data.dateEmission)}`, 50)
    
    doc.moveDown()
    doc.text('Le Préfet des Études', 350)
    doc.moveDown()
    doc.text('[Signature + Cachet]', 350)

    // Section accusé réception
    doc.moveDown(2)
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke()
    doc.moveDown()
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('ACCUSÉ DE RÉCEPTION', { align: 'center' })
       .font('Helvetica')
       .text('(À retourner signé)', { align: 'center' })

    doc.moveDown()
    doc.text('Je soussigné(e) __________________ certifie avoir bien reçu cette convocation.')
    
    doc.moveDown(2)
    doc.text('Signature :')
    doc.moveDown(2)
    doc.text('Date : ____/____/______')

    doc.end()
  })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR')
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
```


ENVOI CONVOCATION
------------------
Après génération PDF, 3 options d'envoi :

1. **Email** (si disponible)
   - Sujet : "Convocation - {Motif} - {École}"
   - Corps : Message type + PDF en pièce jointe
   - Lien tracking pour accusé lecture

2. **SMS**
   ```
   EduGoma360: Convocation le {date} à {heure}. 
   Motif: {motif}. Document remis à votre enfant. {école}
   ```

3. **Impression**
   - PDF imprimé
   - Remis à l'élève avec accusé signature
   - Scan accusé uploadé dans système


SUIVI ACCUSÉS RÉCEPTION
-------------------------
3 statuts possibles :

1. **En attente** (par défaut)
   - Convocation envoyée
   - Aucune réponse reçue

2. **Confirmé**
   - Parent a confirmé présence
   - Via email (clic lien), SMS (réponse), ou téléphone

3. **Venu / Non venu**
   - Marqué par secrétaire après RDV
   - Si non venu → option nouvelle convocation

Modal confirmation présence :
  ┌─────────────────────────────────────────────┐
  │ MARQUER PRÉSENCE                            │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Convocation du 18/04/2026 à 10h00           │
  │ AMISI Pierre (père de AMISI Jean)           │
  │                                             │
  │ Le parent s'est-il présenté ?               │
  │ (•) Oui, présent                            │
  │ ( ) Non, absent                             │
  │                                             │
  │ Compte-rendu de l'entretien :               │
  │ [_____________________________________]     │
  │ [_____________________________________]     │
  │                                             │
  │ Actions décidées :                          │
  │ [☑] Suivi hebdomadaire présence             │
  │ [☐] Soutien scolaire                        │
  │ [☐] Nouvelle convocation si récidive        │
  │                                             │
  │ [Annuler]              [Enregistrer]        │
  └─────────────────────────────────────────────┘


APPELS API
-----------
GET /api/convocations
  Query params :
    - motif?: string
    - status?: 'PENDING' | 'CONFIRMED' | 'ATTENDED' | 'MISSED'
    - classId?: string
  
  Response 200 :
    {
      convocations: Array<{
        id: string,
        numero: string,
        student: { id, nom, classe },
        parent: { nom, qualite, phone, email },
        motif: string,
        details: string,
        dateRendezVous: string,
        heureRendezVous: string,
        lieu: string,
        status: ConvocationStatus,
        confirmedAt?: string,
        attendedAt?: string,
        pdfUrl: string,
        createdBy: { nom },
        createdAt: string
      }>,
      stats: {
        total: number,
        pending: number,
        confirmed: number,
        attended: number,
        missed: number
      }
    }

POST /api/convocations
  Body : {
    studentId: string,
    parentId: string,
    motif: string,
    details: string,
    dateRendezVous: string (ISO),
    heureRendezVous: string,
    lieu: string,
    sendEmail: boolean,
    sendSMS: boolean,
    print: boolean
  }
  
  Response 201 :
    {
      convocation: Convocation,
      pdfUrl: string
    }

PUT /api/convocations/:id/status
  Body : {
    status: 'CONFIRMED' | 'ATTENDED' | 'MISSED',
    notes?: string,
    actions?: string[]
  }


MODÈLE DONNÉES PRISMA
----------------------
model Convocation {
  id              String   @id @default(uuid())
  schoolId        String
  school          School   @relation(fields: [schoolId], references: [id])
  
  numero          String   @unique  // CONV-2026-042
  
  studentId       String
  student         Student  @relation(fields: [studentId], references: [id])
  
  parentId        String
  parent          User     @relation("ParentConvocations", fields: [parentId], references: [id])
  
  motif           ConvocationMotif
  details         String
  
  dateRendezVous  DateTime
  heureRendezVous String   // HH:MM
  lieu            String
  
  status          ConvocationStatus @default(PENDING)
  
  confirmedAt     DateTime?
  attendedAt      DateTime?
  
  pdfUrl          String
  
  emailSent       Boolean  @default(false)
  emailOpenedAt   DateTime?
  
  smsSent         Boolean  @default(false)
  
  notes           String?  // Compte-rendu entretien
  actions         String[] // Actions décidées
  
  createdById     String
  createdBy       User     @relation("ConvocationCreator", fields: [createdById], references: [id])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([studentId, status])
  @@index([dateRendezVous])
}

enum ConvocationMotif {
  RESULTATS_INSUFFISANTS
  ABSENCES_REPETEES
  PROBLEME_DISCIPLINAIRE
  RETARD_PAIEMENT
  COMPORTEMENT_PREOCCUPANT
  AUTRE
}

enum ConvocationStatus {
  PENDING      // En attente réponse
  CONFIRMED    // Confirmé par parent
  ATTENDED     // Parent présent
  MISSED       // Parent absent
  CANCELLED    // Annulée
}


RÈGLES MÉTIER
--------------
1. Numérotation auto : CONV-{ANNÉE}-{SÉQUENCE}
   → Ex: CONV-2026-042

2. Rappel automatique si pas confirmé :
   → J-3 : SMS rappel
   → J-1 : SMS rappel urgent

3. Si non venu :
   → Alerte Préfet
   → Option nouvelle convocation automatique

4. Archivage après 1 an


NOTIFICATIONS
--------------
1. Après génération :
   - Email parent avec PDF joint
   - SMS : "Convocation le {date}. Document remis à votre enfant."

2. Rappels automatiques :
   - J-3 : SMS rappel
   - J-1 : Email + SMS

3. Après RDV :
   - Email compte-rendu au parent
   - Notification Préfet si élève récidiviste


RESPONSIVE
-----------
Mobile (<768px) :
  - Formulaire : champs empilés
  - PDF : téléchargement (pas aperçu)
  - Liste : mode carte

Desktop (≥1024px) :
  - Formulaire : 2 colonnes
  - PDF : aperçu inline
  - Liste : tableau complet


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Formulaire création convocation fonctionne
[ ] Sélection élève charge tuteurs
[ ] 6 motifs prédéfinis disponibles
[ ] Génération PDF conforme modèle
[ ] Logo école affiché sur PDF
[ ] Envoi email avec PDF fonctionne
[ ] Envoi SMS notification fonctionne
[ ] Suivi statuts (pending/confirmed/attended)
[ ] Modal marquage présence fonctionne
[ ] Rappels J-3 et J-1 automatiques (CRON)
[ ] Historique convocations affiché
[ ] Filtres (motif, statut, classe) fonctionnent
[ ] Export PDF liste convocations
[ ] Responsive mobile parfait
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4 / 4 — SCR-040 : ANNONCES & NOTIFICATIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/communication/AnnouncementsPage.tsx
Route : /communication/announcements
Accès : Protégé (authentification requise)
Rôle minimum requis : PRÉFET


OBJECTIF
--------
Créer l'écran de gestion des annonces générales et notifications push
affichées dans le dashboard. 3 niveaux de priorité : Info, Urgent, Critique.
Archivage automatique après 30 jours.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/communication/AnnouncementsPage.tsx      ← CRÉER
2. packages/client/src/components/communication/AnnouncementForm.tsx  ← CRÉER
3. packages/client/src/components/communication/AnnouncementCard.tsx  ← CRÉER
4. packages/client/src/components/dashboard/AnnouncementBanner.tsx    ← CRÉER (pour dashboard)
5. packages/client/src/hooks/useAnnouncements.ts                      ← CRÉER
6. packages/server/src/modules/communication/announcements.routes.ts  ← CRÉER
7. packages/server/src/modules/communication/announcements.service.ts ← CRÉER


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ ANNONCES & NOTIFICATIONS              [+ Nouvelle annonce]       │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ Total      │ │ Actives    │ │ Programmées│ │ Archivées  │   │
  │  │ annonces   │ │            │ │            │ │            │   │
  │  │ 28         │ │ 5          │ │ 2          │ │ 21         │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  Filtres : [Toutes priorités ▼] [Toutes cibles ▼]               │
  │                                                                  │
  │  ANNONCES ACTIVES                                                │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🔴 URGENT                              [Éditer] [Archiver]  │ │
  │  │ Fermeture école le 20/04/2026 (jour férié)                 │ │
  │  │                                                            │ │
  │  │ En raison de la fête nationale du 20 avril, l'école sera  │ │
  │  │ fermée. Reprise des cours le 21 avril.                     │ │
  │  │                                                            │ │
  │  │ 👥 Visible par : Tous (Parents + Enseignants)              │ │
  │  │ 📅 Du 15/04 au 21/04/2026                                  │ │
  │  │ 👁️ Vu par 247/312 personnes (79%)                          │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🔵 INFO                                [Éditer] [Archiver]  │ │
  │  │ Résultats T1 disponibles dès le 25/04                      │ │
  │  │                                                            │ │
  │  │ Les bulletins du Trimestre 1 seront disponibles sur la    │ │
  │  │ plateforme dès le 25 avril. Consultation en ligne.         │ │
  │  │                                                            │ │
  │  │ 👥 Visible par : Parents uniquement                        │ │
  │  │ 📅 Du 18/04 au 30/04/2026                                  │ │
  │  │ 👁️ Vu par 142/245 parents (58%)                            │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


ZONE STATISTIQUES (4 CARTES)
------------------------------
Carte 1 — Total annonces
  Icône : 📢
  Valeur : 28 annonces
  Sous-texte : Cette année scolaire
  Couleur : Bleu #0D47A1

Carte 2 — Actives
  Icône : ✅
  Valeur : 5 annonces
  Sous-texte : Affichées maintenant
  Couleur : Vert #1B5E20

Carte 3 — Programmées
  Icône : ⏰
  Valeur : 2 annonces
  Sous-texte : À venir
  Couleur : Orange #F57F17

Carte 4 — Archivées
  Icône : 📦
  Valeur : 21 annonces
  Sous-texte : Expirées ou supprimées
  Couleur : Gris #757575


MODAL NOUVELLE ANNONCE
------------------------
  ┌─────────────────────────────────────────────┐
  │ NOUVELLE ANNONCE                            │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ PRIORITÉ *                                  │
  │ ( ) 🔵 Info                                 │
  │ (•) 🟠 Urgent                               │
  │ ( ) 🔴 Critique                             │
  │                                             │
  │ TITRE * (60 caractères max)                 │
  │ [Fermeture école le 20/04 (jour férié)]    │
  │                                47/60        │
  │                                             │
  │ MESSAGE * (300 caractères max)              │
  │ [En raison de la fête nationale du 20      │
  │  avril, l'école sera fermée. Reprise des   │
  │  cours le 21 avril.]                        │
  │                                124/300      │
  │                                             │
  │ ────────────────────────────────────────    │
  │                                             │
  │ DESTINATAIRES *                             │
  │ [☑] Parents d'élèves                        │
  │ [☑] Enseignants                             │
  │ [☐] Secrétariat                             │
  │                                             │
  │ Filtrer par classe (optionnel) :            │
  │ [☐ Toutes] [☐ 4ScA] [☐ 5PédA] ...          │
  │                                             │
  │ ────────────────────────────────────────    │
  │                                             │
  │ PÉRIODE D'AFFICHAGE                         │
  │ Date début * : [15/04/2026] 📅              │
  │ Date fin * : [21/04/2026] 📅                │
  │                                             │
  │ [☑] Envoyer notification push (si activé)   │
  │ [☐] Épingler en haut du dashboard           │
  │                                             │
  │ [Annuler]     [Programmer] [Publier]        │
  └─────────────────────────────────────────────┘


NIVEAUX DE PRIORITÉ
--------------------
3 niveaux avec codes couleur et icônes :

1. **🔵 INFO** (par défaut)
   - Couleur : Bleu #0D47A1
   - Usage : Informations générales, rappels
   - Exemples : Résultats disponibles, Réunion parents, Vacances
   - Affichage : Bannière bleue normale

2. **🟠 URGENT**
   - Couleur : Orange #F57F17
   - Usage : Informations importantes, changements
   - Exemples : Fermeture école, Modification horaires, Événement proche
   - Affichage : Bannière orange avec icône ⚠️

3. **🔴 CRITIQUE**
   - Couleur : Rouge #C62828
   - Usage : Urgences, alertes sécurité
   - Exemples : Évacuation, Alerte sécurité, Fermeture urgente
   - Affichage : Bannière rouge clignotante + notification push forcée


AFFICHAGE DASHBOARD
---------------------
Component : AnnouncementBanner.tsx (dans dashboard)

Bannière en haut du dashboard :

Priorité INFO :
  ┌────────────────────────────────────────────────────────┐
  │ 🔵 Résultats T1 disponibles dès le 25/04               │
  │ Les bulletins du Trimestre 1 seront disponibles...    │
  │                                           [Détails] [✕]│
  └────────────────────────────────────────────────────────┘

Priorité URGENT :
  ┌────────────────────────────────────────────────────────┐
  │ ⚠️ URGENT : Fermeture école le 20/04 (jour férié)      │
  │ En raison de la fête nationale du 20 avril...          │
  │                                           [Détails] [✕]│
  └────────────────────────────────────────────────────────┘

Priorité CRITIQUE :
  ┌────────────────────────────────────────────────────────┐
  │ 🚨 ALERTE : Évacuation immédiate de l'école            │
  │ Pour des raisons de sécurité, tous les élèves...      │
  │                                                  [✕]│
  └────────────────────────────────────────────────────────┘
  (Bannière rouge clignotante, impossible à fermer pendant 5s)


NOTIFICATIONS PUSH (PWA)
-------------------------
Si l'application est installée en PWA et l'utilisateur a autorisé
les notifications, envoyer notification push.

Code service worker (packages/client/public/sw.js) :

```javascript
self.addEventListener('push', function(event) {
  const data = event.data.json()
  
  const options = {
    body: data.message,
    icon: '/logo-192.png',
    badge: '/badge-72.png',
    vibrate: data.priority === 'CRITIQUE' ? [200, 100, 200] : [100],
    tag: `announcement-${data.id}`,
    requireInteraction: data.priority === 'CRITIQUE',
    actions: [
      { action: 'view', title: 'Voir détails' },
      { action: 'close', title: 'Fermer' }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.titre, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})
```


APPELS API
-----------
GET /api/announcements
  Query params :
    - priority?: 'INFO' | 'URGENT' | 'CRITIQUE'
    - status?: 'ACTIVE' | 'SCHEDULED' | 'ARCHIVED'
    - audience?: 'PARENTS' | 'TEACHERS' | 'STAFF' | 'ALL'
  
  Response 200 :
    {
      announcements: Array<{
        id: string,
        priority: AnnouncementPriority,
        titre: string,
        message: string,
        audience: string[],
        classIds: string[],
        startDate: string,
        endDate: string,
        isPinned: boolean,
        sendPush: boolean,
        status: 'ACTIVE' | 'SCHEDULED' | 'ARCHIVED',
        viewCount: number,
        totalAudience: number,
        createdBy: { nom },
        createdAt: string
      }>,
      stats: {
        total: number,
        active: number,
        scheduled: number,
        archived: number
      }
    }

POST /api/announcements
  Body : {
    priority: 'INFO' | 'URGENT' | 'CRITIQUE',
    titre: string,
    message: string,
    audience: string[],  // ['PARENTS', 'TEACHERS']
    classIds?: string[],
    startDate: string (ISO),
    endDate: string (ISO),
    isPinned: boolean,
    sendPush: boolean
  }
  
  Response 201 :
    {
      announcement: Announcement,
      pushSent: number  // Nombre de notifications envoyées
    }

POST /api/announcements/:id/view
  Body : { userId: string }
  
  Response 200 :
    { viewCount: number }


MODÈLE DONNÉES PRISMA
----------------------
model Announcement {
  id            String   @id @default(uuid())
  schoolId      String
  school        School   @relation(fields: [schoolId], references: [id])
  
  priority      AnnouncementPriority
  titre         String   @db.VarChar(60)
  message       String   @db.VarChar(300)
  
  audience      String[] // PARENTS, TEACHERS, STAFF, ALL
  classIds      String[] // Si filtre par classe
  
  startDate     DateTime
  endDate       DateTime
  
  isPinned      Boolean  @default(false)
  sendPush      Boolean  @default(false)
  
  status        AnnouncementStatus @default(SCHEDULED)
  
  views         AnnouncementView[]
  
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([schoolId, status, startDate])
  @@index([endDate])
}

model AnnouncementView {
  id              String   @id @default(uuid())
  announcementId  String
  announcement    Announcement @relation(fields: [announcementId], references: [id])
  
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  viewedAt        DateTime @default(now())
  
  @@unique([announcementId, userId])
}

enum AnnouncementPriority {
  INFO
  URGENT
  CRITIQUE
}

enum AnnouncementStatus {
  SCHEDULED  // Pas encore active
  ACTIVE     // En cours d'affichage
  ARCHIVED   // Expirée ou archivée manuellement
}


RÈGLES MÉTIER
--------------
1. Activation/Désactivation automatique selon dates
   → CRON quotidien 00:00 :
     * Si date début atteinte → status = ACTIVE
     * Si date fin dépassée → status = ARCHIVED

2. Archivage automatique après 30 jours
   → Annonces expirées > 30 jours → supprimées

3. Limite annonces actives simultanées : 5 max
   → Si > 5 actives → afficher uniquement les plus récentes

4. Priorité CRITIQUE :
   → Force envoi notification push (même si désactivé)
   → Bannière impossible à fermer pendant 5 secondes
   → Son d'alerte (si navigateur autorise)


NOTIFICATIONS
--------------
1. Nouvelle annonce publiée :
   - Si sendPush = true → Notification push PWA
   - Si priority = CRITIQUE → Push forcé

2. Annonce programmée activée :
   - Apparition automatique dans dashboard
   - Compteur vues initialisé

3. Annonce archivée :
   - Disparition dashboard
   - Conservée en base pour historique


RESPONSIVE
-----------
Mobile (<768px) :
  - Bannière : full width, texte tronqué après 2 lignes
  - Liste annonces : mode carte
  - Formulaire : champs empilés

Desktop (≥1024px) :
  - Bannière : full width avec boutons droite
  - Liste annonces : tableau
  - Formulaire : 2 colonnes


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Formulaire création annonce fonctionne
[ ] 3 priorités (Info, Urgent, Critique) disponibles
[ ] Sélection audience (Parents, Enseignants, Tous)
[ ] Filtre par classe optionnel
[ ] Validation titre 60 chars, message 300 chars
[ ] Programmation dates début/fin
[ ] Option épingler en haut
[ ] Bannière affichée dashboard selon priorité
[ ] Couleurs distinctes par priorité
[ ] Notifications push PWA fonctionnent
[ ] Tracking vues par utilisateur
[ ] CRON activation/archivage automatique
[ ] Priorité CRITIQUE non fermable 5s
[ ] Historique annonces archivées
[ ] Responsive mobile parfait
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RÉCAPITULATIF MODULE COMMUNICATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| N° | Écran | Fonction | Fichiers | Complexité |
|----|-------|----------|----------|------------|
| 037 | Envoi SMS groupés | Templates, Africa's Talking | 10 | ⭐⭐⭐⭐ |
| 038 | Envoi Emails | Éditeur HTML, Resend API | 5 | ⭐⭐⭐⭐ |
| 039 | Convocations | PDF, suivi accusés | 9 | ⭐⭐⭐⭐ |
| 040 | Annonces | Dashboard, push PWA | 7 | ⭐⭐⭐ |

**Total : 4 écrans, ~31 fichiers**

---

*EduGoma 360 — Module Communication Complet — © 2026*
