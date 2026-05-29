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

# PROMPTS 3-4 : RÉSUMÉS

**SCR-039 — Convocations Parents**
- Génération PDF convocation
- Motifs prédéfinis (discipline, résultats, financier)
- Suivi accusés réception
- Historique convocations par élève

**SCR-040 — Annonces & Notifications**
- Annonces générales (affichage dashboard)
- Priorités (Info, Urgent, Critique)
- Notifications push PWA
- Archive annonces

---

*EduGoma 360 — Module Communication — © 2026*
