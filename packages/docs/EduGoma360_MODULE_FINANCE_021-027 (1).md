# 💰 EDUGOMA 360 — MODULE FINANCE COMPLET
## Prompts SCR-021 à SCR-027 | Frais, Paiements, Créances, Rapports

> **MODE D'EMPLOI :**
> Ce fichier contient **7 prompts indépendants** pour les 7 écrans du module Finance.
> Exécute-les **dans l'ordre numérique** (021 → 027).
> Prérequis : Module Élèves validé (pour lier paiements aux élèves).

---

## CONTEXTE GLOBAL DU MODULE

```
Module         : Gestion Financière
Écrans         : SCR-021 à SCR-027 (7 écrans)
Prérequis      : Module Élèves validé
Rôles concernés: Comptable, Trésorier, Préfet
Complexité     : ⭐⭐⭐⭐
Fichiers totaux: ~45 fichiers

COMPOSANTS PARTAGÉS À CRÉER :
- shared/src/types/payment.ts
- shared/src/types/fee.ts
- shared/src/constants/paymentMethods.ts
- shared/src/utils/receipt.ts
- shared/src/utils/currency.ts (Franc Congolais)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1/7 — SCR-021 : CONFIGURATION DES FRAIS SCOLAIRES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-021 - Configuration des Frais Scolaires
Route : /finance/fees
Rôle minimum : PRÉFET (configuration) | COMPTABLE (consultation)
Prérequis : Module Élèves validé


OBJECTIF
--------
Configurer tous les frais scolaires de l'école pour l'année en cours.
Les frais sont définis par type (inscription, minerval, examen) et peuvent
varier selon la classe, la section, ou être uniformes pour toute l'école.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/finance/FeesConfigPage.tsx
2. packages/client/src/components/finance/FeeCard.tsx
3. packages/client/src/components/finance/FeeFormModal.tsx
4. packages/client/src/components/finance/FeeTemplateModal.tsx
5. packages/client/src/components/finance/FeeStatsCards.tsx
6. packages/client/src/hooks/useFees.ts
7. packages/server/src/modules/fees/fees.routes.ts
8. packages/server/src/modules/fees/fees.controller.ts
9. packages/server/src/modules/fees/fees.service.ts
10. packages/shared/src/types/fee.ts
11. packages/shared/src/constants/feeTypes.ts


UI — STRUCTURE DE LA PAGE
---------------------------
  ┌──────────────────────────────────────────────────────────┐
  │ CONFIGURATION DES FRAIS SCOLAIRES 2024-2025             │
  │                                                          │
  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
  │ │ Frais totaux│ │ À percevoir │ │ Classes     │        │
  │ │ 2 450 000 FC│ │ 1 850 000 FC│ │ configurées │        │
  │ └─────────────┘ └─────────────┘ └─────────────┘        │
  │                                                          │
  │ [+ Nouveau frais] [📋 Utiliser modèle] [📥 Export]      │
  │                                                          │
  │ FRAIS D'INSCRIPTION                                      │
  │ ┌────────────────────────────────────────────────────┐  │
  │ │ Frais d'inscription nouveau                        │  │
  │ │ 50 000 FC · Tronc Commun · Paiement unique         │  │
  │ │ [Modifier] [Dupliquer] [Archiver]                  │  │
  │ └────────────────────────────────────────────────────┘  │
  │                                                          │
  │ MINERVAL MENSUEL                                         │
  │ ┌────────────────────────────────────────────────────┐  │
  │ │ Minerval Scientifique                              │  │
  │ │ 30 000 FC/mois · 4ème-6ème Sc · 9 mois            │  │
  │ │ [Modifier] [Dupliquer] [Archiver]                  │  │
  │ └────────────────────────────────────────────────────┘  │
  │                                                          │
  └──────────────────────────────────────────────────────────┘


TYPES DE FRAIS
---------------
packages/shared/src/constants/feeTypes.ts :

  export const FEE_TYPES = {
    // Frais uniques
    INSCRIPTION: {
      code: 'INSCRIPTION',
      label: 'Frais d\'inscription',
      frequency: 'UNIQUE',      // Payé 1 seule fois
      required: true
    },
    
    REINSCRIPTION: {
      code: 'REINSCRIPTION',
      label: 'Frais de réinscription',
      frequency: 'ANNUAL',      // 1 fois par an
      required: true
    },
    
    // Frais mensuels
    MINERVAL: {
      code: 'MINERVAL',
      label: 'Minerval mensuel',
      frequency: 'MONTHLY',     // 9 mois (sept-juin)
      required: true
    },
    
    // Frais trimestriels
    EXAMEN: {
      code: 'EXAMEN',
      label: 'Frais d\'examen',
      frequency: 'TRIMESTRAL',  // 3 fois par an
      required: true
    },
    
    BULLETIN: {
      code: 'BULLETIN',
      label: 'Frais de bulletin',
      frequency: 'TRIMESTRAL',
      required: true
    },
    
    // Frais optionnels
    CANTINE: {
      code: 'CANTINE',
      label: 'Cantine',
      frequency: 'MONTHLY',
      required: false
    },
    
    TRANSPORT: {
      code: 'TRANSPORT',
      label: 'Transport scolaire',
      frequency: 'MONTHLY',
      required: false
    },
    
    UNIFORME: {
      code: 'UNIFORME',
      label: 'Uniforme',
      frequency: 'UNIQUE',
      required: false
    },
    
    LIVRE: {
      code: 'LIVRE',
      label: 'Manuels scolaires',
      frequency: 'ANNUAL',
      required: false
    },
    
    ASSURANCE: {
      code: 'ASSURANCE',
      label: 'Assurance scolaire',
      frequency: 'ANNUAL',
      required: false
    },
    
    AUTRE: {
      code: 'AUTRE',
      label: 'Autre frais',
      frequency: 'CUSTOM',
      required: false
    }
  }


COMPOSANT FeeFormModal.tsx
----------------------------
Modal de création/modification d'un frais.

Formulaire :
  ┌────────────────────────────────────────────┐
  │ NOUVEAU FRAIS                              │
  ├────────────────────────────────────────────┤
  │                                            │
  │ Type de frais * :                          │
  │ [Minerval mensuel           ▼]            │
  │                                            │
  │ Libellé * :                                │
  │ [Minerval 4ème Scientifique]              │
  │                                            │
  │ Montant * :                                │
  │ [30000] FC                                 │
  │                                            │
  │ Applicable à * :                           │
  │ ( ) Toute l'école                          │
  │ (•) Sections spécifiques                   │
  │ ( ) Classes spécifiques                    │
  │                                            │
  │ Sections (si applicable) :                 │
  │ [☑ Scientifique] [☐ Tronc Commun]         │
  │                                            │
  │ Classes (si applicable) :                  │
  │ [4ScA] [4ScB] [5ScA] [6ScA] ...           │
  │                                            │
  │ Fréquence * :                              │
  │ (•) Mensuel (9 mois)                       │
  │ ( ) Trimestriel (3 fois)                   │
  │ ( ) Annuel (1 fois)                        │
  │ ( ) Unique                                 │
  │                                            │
  │ Échéancier (si mensuel/trimestriel) :     │
  │ Mois de paiement :                         │
  │ [☑ Sept] [☑ Oct] [☑ Nov] ... [☑ Juin]     │
  │                                            │
  │ Obligatoire :                              │
  │ [☑] Ce frais est obligatoire               │
  │                                            │
  │ Observations :                             │
  │ [                                    ]     │
  │                                            │
  │ [Annuler]              [Enregistrer]       │
  └────────────────────────────────────────────┘

Validation Zod :
  const feeSchema = z.object({
    type: z.enum(Object.keys(FEE_TYPES)),
    label: z.string().min(3).max(100),
    amount: z.number().min(0),
    scope: z.enum(['SCHOOL', 'SECTION', 'CLASS']),
    sectionIds: z.array(z.string().uuid()).optional(),
    classIds: z.array(z.string().uuid()).optional(),
    frequency: z.enum(['MONTHLY', 'TRIMESTRAL', 'ANNUAL', 'UNIQUE']),
    months: z.array(z.number().min(1).max(12)).optional(),
    required: z.boolean(),
    observations: z.string().optional()
  })


MODÈLE DE DONNÉES
------------------
Schéma Prisma :

  model Fee {
    id            String   @id @default(uuid())
    schoolId      String
    school        School   @relation(fields: [schoolId], references: [id])
    academicYearId String
    academicYear  AcademicYear @relation(fields: [academicYearId], references: [id])
    
    type          FeeType
    label         String
    amount        Int      // En Francs Congolais (FC)
    
    scope         FeeScope // SCHOOL | SECTION | CLASS
    sectionIds    String[] // Array de section IDs si scope=SECTION
    classIds      String[] // Array de class IDs si scope=CLASS
    
    frequency     FeeFrequency
    months        Int[]    // [9,10,11,12,1,2,3,4,5,6] pour mensuel sept-juin
    
    required      Boolean  @default(true)
    observations  String?
    
    isActive      Boolean  @default(true)
    
    // Relations
    payments      Payment[]
    
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
    deletedAt     DateTime?
    
    @@index([schoolId, academicYearId, isActive])
  }
  
  enum FeeType {
    INSCRIPTION
    REINSCRIPTION
    MINERVAL
    EXAMEN
    BULLETIN
    CANTINE
    TRANSPORT
    UNIFORME
    LIVRE
    ASSURANCE
    AUTRE
  }
  
  enum FeeScope {
    SCHOOL      // Tous les élèves
    SECTION     // Élèves de certaines sections
    CLASS       // Élèves de certaines classes
  }
  
  enum FeeFrequency {
    MONTHLY     // 9 fois (septembre-juin)
    TRIMESTRAL  // 3 fois (par trimestre)
    ANNUAL      // 1 fois par an
    UNIQUE      // 1 seule fois (inscription nouveau)
  }


MODÈLE PRÉDÉFINI (TEMPLATE)
-----------------------------
Bouton "📋 Utiliser modèle" ouvre un modal avec templates :

Templates disponibles :
1. "École Officielle RDC Standard"
   - Inscription nouveau : 50 000 FC
   - Réinscription : 30 000 FC
   - Minerval TC : 25 000 FC/mois
   - Minerval Sc : 30 000 FC/mois
   - Examen : 10 000 FC/trimestre
   - Bulletin : 3 000 FC/trimestre

2. "École Privée Goma Standard"
   - Inscription : 100 000 FC
   - Réinscription : 75 000 FC
   - Minerval : 50 000 FC/mois
   - Cantine : 30 000 FC/mois
   - Transport : 25 000 FC/mois

3. "École Conventionnée"
   - Montants intermédiaires

Modal confirme : "Cette action créera X frais. Continuer ?"
Après confirmation : tous les frais sont créés en batch.


CALCUL AUTOMATIQUE FRAIS ÉLÈVE
--------------------------------
Lors de l'inscription d'un élève, le système calcule automatiquement
tous les frais applicables selon sa classe.

Fonction backend : calculateStudentFees(studentId)

  async function calculateStudentFees(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { 
        enrollments: { 
          include: { class: { include: { section: true } } } 
        } 
      }
    })
    
    const enrollment = student.enrollments[0] // Année en cours
    const classId = enrollment.classId
    const sectionId = enrollment.class.sectionId
    
    // Récupérer tous les frais applicables
    const fees = await prisma.fee.findMany({
      where: {
        schoolId: student.schoolId,
        academicYearId: enrollment.academicYearId,
        isActive: true,
        OR: [
          { scope: 'SCHOOL' },
          { scope: 'SECTION', sectionIds: { has: sectionId } },
          { scope: 'CLASS', classIds: { has: classId } }
        ]
      }
    })
    
    // Calculer le total annuel
    let totalAnnual = 0
    
    for (const fee of fees) {
      switch (fee.frequency) {
        case 'MONTHLY':
          totalAnnual += fee.amount * 9 // Sept-Juin
          break
        case 'TRIMESTRAL':
          totalAnnual += fee.amount * 3
          break
        case 'ANNUAL':
        case 'UNIQUE':
          totalAnnual += fee.amount
          break
      }
    }
    
    return { fees, totalAnnual }
  }


APPELS API
-----------
GET /api/fees
  Query params :
    - academicYearId: string (défaut: année active)
    - scope?: FeeScope
    - type?: FeeType
  
  Response 200 :
    {
      fees: Fee[],
      stats: {
        total: number,        // Nombre de frais configurés
        totalAmount: number,  // Montant total annuel moyen
        byType: { [key: string]: number }
      }
    }

POST /api/fees
  Body : {
    type: FeeType,
    label: string,
    amount: number,
    scope: FeeScope,
    sectionIds?: string[],
    classIds?: string[],
    frequency: FeeFrequency,
    months?: number[],
    required: boolean,
    observations?: string
  }
  
  Response 201 : { fee: Fee }

PUT /api/fees/:id
  Body : Même structure que POST
  Response 200 : { fee: Fee }

DELETE /api/fees/:id
  Response 200 : { success: true }

POST /api/fees/template
  Body : { templateName: string }
  Response 201 : { fees: Fee[], count: number }


RÈGLES MÉTIER
--------------
1. Impossible modifier un frais si des paiements ont déjà été effectués
   → Archiver et créer un nouveau

2. Impossible supprimer un frais avec paiements liés
   → Seul l'archivage (soft delete) est autorisé

3. Les frais d'inscription et réinscription sont toujours requis

4. Le minerval mensuel couvre 9 mois (septembre à juin)

5. Les frais optionnels (cantine, transport) peuvent être désactivés
   par élève individuellement


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Liste des frais charge avec stats
[ ] Création frais fonctionne (tous types)
[ ] Modification frais fonctionne
[ ] Archivage frais fonctionne
[ ] Filtres par scope et type fonctionnent
[ ] Templates prédéfinis créent frais en batch
[ ] Calcul automatique frais élève fonctionne
[ ] Validation bloque modification si paiements existants
[ ] Export Excel liste frais fonctionne
[ ] Responsive mobile/desktop
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2/7 — SCR-022 : ENREGISTREMENT DES PAIEMENTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-022 - Enregistrement des Paiements
Route : /finance/payments/new
Rôle minimum : COMPTABLE | TRÉSORIER
Prérequis : SCR-021 (frais configurés), Module Élèves


OBJECTIF
--------
Interface de caisse pour enregistrer rapidement les paiements des élèves.
Génération automatique de reçus PDF imprimables.
Support paiement partiel et multi-frais en une transaction.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/finance/PaymentEntryPage.tsx
2. packages/client/src/components/finance/StudentSelector.tsx
3. packages/client/src/components/finance/PaymentForm.tsx
4. packages/client/src/components/finance/FeeSelector.tsx
5. packages/client/src/components/finance/PaymentSummary.tsx
6. packages/client/src/components/finance/ReceiptPreview.tsx
7. packages/client/src/hooks/usePayments.ts
8. packages/server/src/modules/payments/payments.routes.ts
9. packages/server/src/modules/payments/payments.controller.ts
10. packages/server/src/modules/payments/payments.service.ts
11. packages/server/src/modules/payments/templates/receipt.html
12. packages/shared/src/types/payment.ts
13. packages/shared/src/constants/paymentMethods.ts
14. packages/shared/src/utils/receipt.ts


UI — STRUCTURE (WIZARD 4 ÉTAPES)
----------------------------------
  ┌──────────────────────────────────────────────────────────┐
  │ NOUVEAU PAIEMENT                         Étape 1/4       │
  ├──────────────────────────────────────────────────────────┤
  │ [●━━━━━━━━○━━━━━━━━○━━━━━━━━○]                          │
  │  Élève    Frais    Paiement  Reçu                        │
  │                                                          │
  │ [CONTENU DE L'ÉTAPE ACTIVE]                              │
  │                                                          │
  │ [← Précédent]                        [Suivant →]         │
  └──────────────────────────────────────────────────────────┘


ÉTAPE 1 — SÉLECTION ÉLÈVE (StudentSelector)
---------------------------------------------
Recherche élève par :
- Matricule (recherche exacte)
- Nom/Post-nom (recherche fuzzy)
- Téléphone tuteur

Interface :
  ┌────────────────────────────────────────────┐
  │ RECHERCHER UN ÉLÈVE                        │
  │                                            │
  │ [🔍 Matricule, nom ou téléphone...]        │
  │                                            │
  │ RÉSULTATS :                                │
  │ ┌────────────────────────────────────────┐ │
  │ │ [📷] AMISI KALOMBO Jean-Baptiste       │ │
  │ │ NK-GOM-ISS001-0234 · 4ScA              │ │
  │ │ Solde dû : 180 000 FC                  │ │
  │ │ [Sélectionner]                         │ │
  │ └────────────────────────────────────────┘ │
  │                                            │
  └────────────────────────────────────────────┘

Après sélection, afficher carte résumé élève :
  ┌────────────────────────────────────────────┐
  │ [📷] AMISI KALOMBO Jean-Baptiste           │
  │ Matricule : NK-GOM-ISS001-0234             │
  │ Classe : 4ème Scientifique A               │
  │ Tuteur : +243 810 000 000                  │
  │                                            │
  │ SOLDE ACTUEL :                             │
  │ Total dû : 450 000 FC                      │
  │ Payé : 270 000 FC                          │
  │ Reste : 180 000 FC ⚠️                      │
  └────────────────────────────────────────────┘


ÉTAPE 2 — SÉLECTION FRAIS (FeeSelector)
-----------------------------------------
Liste des frais dus par l'élève (non payés ou partiellement payés).

Interface :
  ┌────────────────────────────────────────────┐
  │ FRAIS À PAYER                              │
  │                                            │
  │ [☑] Minerval Octobre                       │
  │     30 000 FC · Dû le 01/10/2024           │
  │                                            │
  │ [☑] Minerval Novembre                      │
  │     30 000 FC · Dû le 01/11/2024           │
  │                                            │
  │ [☑] Frais d'examen T1                      │
  │     10 000 FC · Dû le 01/12/2024           │
  │                                            │
  │ [☐] Minerval Décembre                      │
  │     30 000 FC · Dû le 01/12/2024           │
  │                                            │
  │ TOTAL SÉLECTIONNÉ : 70 000 FC              │
  │                                            │
  │ ℹ️ Vous pouvez sélectionner plusieurs frais│
  │                                            │
  └────────────────────────────────────────────┘

Frais triés par priorité :
1. Retards (rouge) - en retard de paiement
2. Échéance proche (orange) - dû dans < 7 jours
3. Normaux (vert) - dû ce mois
4. Futurs (gris) - dû dans > 30 jours


ÉTAPE 3 — DÉTAILS PAIEMENT (PaymentForm)
------------------------------------------
Formulaire de paiement :
  ┌────────────────────────────────────────────┐
  │ DÉTAILS DU PAIEMENT                        │
  │                                            │
  │ Montant total dû : 70 000 FC               │
  │                                            │
  │ Montant payé * :                           │
  │ [70000] FC                                 │
  │ [Payer tout] [25%] [50%] [75%]             │
  │                                            │
  │ Mode de paiement * :                       │
  │ (•) Espèces                                │
  │ ( ) Mobile Money (M-PESA, Airtel Money)    │
  │ ( ) Virement bancaire                      │
  │ ( ) Chèque                                 │
  │                                            │
  │ Référence transaction (optionnel) :        │
  │ [                              ]           │
  │ (N° transaction si Mobile Money/Virement)  │
  │                                            │
  │ Date du paiement * :                       │
  │ [26/02/2026] (aujourd'hui)                 │
  │                                            │
  │ Observations :                             │
  │ [                                    ]     │
  │                                            │
  │ RÉSUMÉ :                                   │
  │ Total dû :        70 000 FC                │
  │ Payé :            70 000 FC                │
  │ Reste à payer :    0 FC ✅                 │
  │                                            │
  └────────────────────────────────────────────┘

Modes de paiement RDC :
  - CASH : Espèces (Francs Congolais)
  - MOBILE_MONEY : M-PESA, Airtel Money, Orange Money
  - BANK_TRANSFER : Virement bancaire
  - CHECK : Chèque

Paiement partiel autorisé :
  - Si montant payé < montant dû → reste enregistré comme créance
  - Boutons raccourcis : 25%, 50%, 75%, 100%


ÉTAPE 4 — REÇU (ReceiptPreview & Confirmation)
------------------------------------------------
Aperçu du reçu avant impression :
  ┌────────────────────────────────────────────┐
  │ APERÇU DU REÇU N° 2026-0234                │
  │                                            │
  │ [Rendu HTML du reçu]                       │
  │ (voir template receipt.html ci-dessous)    │
  │                                            │
  │ [← Modifier]      [Valider & Imprimer]     │
  └────────────────────────────────────────────┘

Après validation :
1. Enregistrement en base
2. Génération PDF reçu
3. Impression automatique (dialog navigateur)
4. Toast : "✓ Paiement enregistré. Reçu N° 2026-0234"
5. Proposition : "Nouveau paiement" ou "Retour accueil"


TEMPLATE REÇU PDF (receipt.html)
----------------------------------
Format : 80mm × variable (imprimante thermique ou A4)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Courier New', monospace;
      width: 80mm;
      margin: 0 auto;
      padding: 5mm;
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #000;
      padding-bottom: 5mm;
      margin-bottom: 5mm;
    }
    .logo { width: 20mm; height: 20mm; }
    .school-name { font-weight: bold; font-size: 12pt; }
    .receipt-number { font-size: 14pt; font-weight: bold; margin: 3mm 0; }
    .section { margin: 3mm 0; }
    .label { font-weight: bold; }
    .amount { font-size: 16pt; font-weight: bold; text-align: right; }
    .footer {
      border-top: 2px dashed #000;
      padding-top: 5mm;
      margin-top: 5mm;
      text-align: center;
      font-size: 8pt;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="{{logoUrl}}" class="logo">
    <div class="school-name">{{schoolName}}</div>
    <div>{{schoolAddress}}</div>
    <div>Tél: {{schoolPhone}}</div>
  </div>
  
  <div class="receipt-number">REÇU N° {{receiptNumber}}</div>
  
  <div class="section">
    <span class="label">Date:</span> {{date}}<br>
    <span class="label">Heure:</span> {{time}}
  </div>
  
  <div class="section">
    <span class="label">Élève:</span><br>
    {{studentName}}<br>
    <span class="label">Matricule:</span> {{studentMatricule}}<br>
    <span class="label">Classe:</span> {{className}}
  </div>
  
  <div class="section">
    <span class="label">DÉTAILS DU PAIEMENT:</span><br>
    {{#each fees}}
    {{label}} ......... {{amount}} FC<br>
    {{/each}}
  </div>
  
  <div class="section">
    <span class="label">Mode:</span> {{paymentMethod}}<br>
    {{#if transactionRef}}
    <span class="label">Réf:</span> {{transactionRef}}<br>
    {{/if}}
  </div>
  
  <div class="section amount">
    TOTAL: {{totalAmount}} FC
  </div>
  
  {{#if remainingBalance}}
  <div class="section">
    <span class="label">Reste à payer:</span> {{remainingBalance}} FC
  </div>
  {{/if}}
  
  <div class="footer">
    Signature caissier: _________________<br>
    {{cashierName}}<br>
    <br>
    Merci pour votre confiance<br>
    www.edugoma360.cd
  </div>
</body>
</html>
```


MODÈLE DE DONNÉES
------------------
Schéma Prisma :

  model Payment {
    id            String   @id @default(uuid())
    schoolId      String
    school        School   @relation(fields: [schoolId], references: [id])
    
    receiptNumber String   @unique  // 2026-0234
    
    studentId     String
    student       Student  @relation(fields: [studentId], references: [id])
    
    // Montants (en Francs Congolais)
    totalDue      Int      // Montant total des frais payés
    amountPaid    Int      // Montant effectivement payé
    remainingBalance Int   // Reste à payer (si partiel)
    
    // Paiement
    paymentMethod PaymentMethod
    transactionRef String? // Référence si Mobile Money/Virement
    paymentDate   DateTime
    
    // Relations
    feePayments   FeePayment[] // Détail par frais
    
    // Métadonnées
    cashierId     String
    cashier       User     @relation(fields: [cashierId], references: [id])
    observations  String?
    
    receiptUrl    String?  // URL du PDF généré
    
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
    
    @@index([schoolId, studentId])
    @@index([receiptNumber])
    @@index([paymentDate])
  }
  
  model FeePayment {
    id          String   @id @default(uuid())
    paymentId   String
    payment     Payment  @relation(fields: [paymentId], references: [id])
    feeId       String
    fee         Fee      @relation(fields: [feeId], references: [id])
    
    amountDue   Int      // Montant dû pour ce frais
    amountPaid  Int      // Montant payé pour ce frais (peut être partiel)
    
    createdAt   DateTime @default(now())
    
    @@unique([paymentId, feeId])
  }
  
  enum PaymentMethod {
    CASH
    MOBILE_MONEY
    BANK_TRANSFER
    CHECK
  }


GÉNÉRATION NUMÉRO REÇU
-----------------------
Format : {ANNÉE}-{SEQUENCE}
Exemple : 2026-0234

  async function generateReceiptNumber(schoolId: string, year: number) {
    const lastPayment = await prisma.payment.findFirst({
      where: {
        schoolId,
        receiptNumber: { startsWith: `${year}-` }
      },
      orderBy: { receiptNumber: 'desc' }
    })
    
    let sequence = 1
    if (lastPayment) {
      const lastSeq = parseInt(lastPayment.receiptNumber.split('-')[1])
      sequence = lastSeq + 1
    }
    
    return `${year}-${sequence.toString().padStart(4, '0')}`
  }


APPELS API
-----------
GET /api/students/:id/fees-due
  Response 200 : {
    fees: Array<{
      fee: Fee,
      dueDate: Date,
      amountDue: number,
      amountPaid: number,
      remainingBalance: number,
      status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE'
    }>,
    totalDue: number,
    totalPaid: number,
    totalRemaining: number
  }

POST /api/payments
  Body : {
    studentId: string,
    feeIds: string[],        // Array de frais sélectionnés
    amountPaid: number,
    paymentMethod: PaymentMethod,
    transactionRef?: string,
    paymentDate: string (ISO),
    observations?: string
  }
  
  Response 201 : {
    payment: Payment,
    receiptUrl: string,      // URL du PDF
    receiptNumber: string
  }

GET /api/payments/:id/receipt
  Response : PDF binary (reçu)


NOTIFICATIONS
--------------
Après paiement :
1. SMS au tuteur :
   FR: "EduGoma360: Paiement reçu 70 000 FC pour {NOM}. Reçu N° 2026-0234. Solde: 0 FC"
   SW: "EduGoma360: Malipo yapokelewa 70 000 FC kwa {NOM}. Risiti N° 2026-0234. Deni: 0 FC"

2. Email au tuteur (si email présent) avec PDF reçu en PJ


RÈGLES MÉTIER
--------------
1. Paiement partiel autorisé (montant payé < montant dû)

2. Priorité d'affectation des paiements partiels :
   - Frais les plus anciens en premier
   - Frais obligatoires avant optionnels

3. Un reçu = une transaction, plusieurs frais possibles

4. Impossible modifier un paiement après génération du reçu
   → Seule l'annulation (avec motif) est autorisée

5. Annulation nécessite rôle PRÉFET et génère un avoir

6. Les paiements en espèces nécessitent rapprochement caisse quotidien


OFFLINE SUPPORT
----------------
Le module paiement peut fonctionner hors ligne :
1. Enregistrement dans Dexie.js
2. Génération reçu temporaire (numéro OFFLINE-XXXX)
3. Sync auto au retour connexion
4. Reçu définitif généré avec vrai numéro


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Wizard 4 étapes fonctionne
[ ] Recherche élève (matricule, nom, téléphone) fonctionne
[ ] Affichage frais dus avec solde correct
[ ] Sélection multiple frais fonctionne
[ ] Paiement partiel autorisé et calculé correctement
[ ] 4 modes paiement supportés
[ ] Génération numéro reçu séquentiel fonctionne
[ ] Génération PDF reçu fonctionne
[ ] Impression automatique après validation
[ ] SMS tuteur envoyé après paiement
[ ] Email avec PDF reçu en PJ envoyé
[ ] Enregistrement hors ligne fonctionne
[ ] Responsive mobile/desktop
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3/7 — SCR-023 : HISTORIQUE DES PAIEMENTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-023 - Historique des Paiements
Route : /finance/payments
Rôle minimum : COMPTABLE (consultation) | TRÉSORIER (+ export)
Prérequis : SCR-022 (paiements enregistrés)


OBJECTIF
--------
Consulter l'historique complet de tous les paiements avec filtres avancés.
Export Excel pour comptabilité. Réimpression de reçus.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/finance/PaymentsHistoryPage.tsx
2. packages/client/src/components/finance/PaymentFilters.tsx
3. packages/client/src/components/finance/PaymentRow.tsx
4. packages/client/src/components/finance/PaymentDetailsModal.tsx
5. packages/client/src/components/finance/CancelPaymentModal.tsx


UI — STRUCTURE
---------------
  ┌──────────────────────────────────────────────────────────┐
  │ HISTORIQUE DES PAIEMENTS                                 │
  │                                                          │
  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
  │ │ Aujourd'hui │ │ Cette semaine│ │ Ce mois     │        │
  │ │ 450 000 FC  │ │ 2 850 000 FC │ │ 12 500 000  │        │
  │ └─────────────┘ └─────────────┘ └─────────────┘        │
  │                                                          │
  │ Filtres : [Date ▼] [Élève ▼] [Mode ▼] [🔍 N° reçu]      │
  │ [📥 Export Excel] [📊 Rapport]                           │
  │                                                          │
  │ ┌────────────────────────────────────────────────────┐  │
  │ │ Date  │Reçu   │Élève      │Montant │Mode   │Actions│  │
  │ ├───────┼───────┼───────────┼────────┼───────┼───────┤  │
  │ │26/02  │2026-  │AMISI Jean │70 000  │Espèces│[👁][🖨]│  │
  │ │ 14:32 │0234   │4ScA       │        │       │       │  │
  │ ├───────┼───────┼───────────┼────────┼───────┼───────┤  │
  │ │26/02  │2026-  │BAHATI M.  │50 000  │Mobile │[👁][🖨]│  │
  │ │ 12:15 │0233   │5PédA      │        │Money  │       │  │
  │ ├───────┼───────┼───────────┼────────┼───────┼───────┤  │
  │ │...                                                 │  │
  │ └────────────────────────────────────────────────────┘  │
  │                                                          │
  │ Page 1/34 · Total : 847 paiements                        │
  └──────────────────────────────────────────────────────────┘


FILTRES AVANCÉS
----------------
1. Période :
   - Aujourd'hui
   - Cette semaine
   - Ce mois
   - Mois dernier
   - Personnalisé (date début → date fin)

2. Élève :
   - Select avec recherche (nom ou matricule)

3. Classe :
   - Select classes disponibles

4. Mode de paiement :
   - Tous
   - Espèces
   - Mobile Money
   - Virement bancaire
   - Chèque

5. Caissier :
   - Select utilisateurs avec rôle COMPTABLE/TRÉSORIER

6. Recherche N° reçu :
   - Input avec debounce (recherche exacte sur receiptNumber)


MODAL DÉTAILS PAIEMENT (PaymentDetailsModal)
----------------------------------------------
Clic sur icône 👁 ouvre modal avec détails complets :

  ┌────────────────────────────────────────────┐
  │ DÉTAILS DU PAIEMENT                        │
  │ Reçu N° 2026-0234                          │
  ├────────────────────────────────────────────┤
  │                                            │
  │ ÉLÈVE :                                    │
  │ AMISI KALOMBO Jean-Baptiste                │
  │ Matricule : NK-GOM-ISS001-0234             │
  │ Classe : 4ème Scientifique A               │
  │                                            │
  │ DATE & HEURE :                             │
  │ 26 février 2026 à 14:32                    │
  │                                            │
  │ FRAIS PAYÉS :                              │
  │ • Minerval Octobre ........ 30 000 FC      │
  │ • Minerval Novembre ....... 30 000 FC      │
  │ • Frais examen T1 ......... 10 000 FC      │
  │                                            │
  │ MODE DE PAIEMENT :                         │
  │ Espèces                                    │
  │                                            │
  │ MONTANTS :                                 │
  │ Total dû .................. 70 000 FC      │
  │ Montant payé .............. 70 000 FC      │
  │ Reste à payer ............. 0 FC ✅        │
  │                                            │
  │ CAISSIER :                                 │
  │ MUKASA Jean (Comptable)                    │
  │                                            │
  │ OBSERVATIONS :                             │
  │ —                                          │
  │                                            │
  │ [🖨 Réimprimer reçu] [❌ Annuler paiement] │
  │ [Fermer]                                   │
  └────────────────────────────────────────────┘


RÉIMPRESSION REÇU
------------------
Bouton "🖨 Réimprimer reçu" :
1. Récupère le PDF depuis receiptUrl
2. Ouvre dialog impression navigateur
3. Logger l'action (audit) : réimpression par {user} le {date}


ANNULATION PAIEMENT (CancelPaymentModal)
------------------------------------------
Accessible uniquement par PRÉFET.

Modal confirmation :
  ┌────────────────────────────────────────────┐
  │ ANNULER LE PAIEMENT                        │
  │ Reçu N° 2026-0234                          │
  ├────────────────────────────────────────────┤
  │                                            │
  │ ⚠️ Cette action est IRRÉVERSIBLE           │
  │                                            │
  │ Un avoir sera généré automatiquement.      │
  │ Le solde de l'élève sera mis à jour.       │
  │                                            │
  │ Motif d'annulation * :                     │
  │ ( ) Erreur de saisie                       │
  │ ( ) Paiement annulé par la famille         │
  │ ( ) Doublon                                │
  │ ( ) Autre                                  │
  │                                            │
  │ Détails (obligatoire) :                    │
  │ [                                    ]     │
  │                                            │
  │ [Annuler]              [Confirmer l'annulation]│
  └────────────────────────────────────────────┘

Après annulation :
1. Statut payment → CANCELLED
2. Génération avoir PDF (crédit note)
3. Mise à jour solde élève (+ montant annulé)
4. Notification SMS tuteur : "Paiement N° 2026-0234 annulé. Avoir généré."
5. Logger dans audit trail


EXPORT EXCEL
-------------
Bouton "📥 Export Excel" génère fichier avec colonnes :
- Date
- Heure
- N° reçu
- Matricule élève
- Nom élève
- Classe
- Frais payés (liste)
- Montant payé
- Mode paiement
- Référence transaction
- Caissier
- Observations

Format : Paiements_{DD-MM-YYYY}.xlsx
Avec formatage : en-têtes gras, montants format monétaire


RAPPORT PÉRIODIQUE
-------------------
Bouton "📊 Rapport" génère rapport PDF avec :
- En-tête école
- Période sélectionnée
- Statistiques :
  * Total encaissé
  * Nombre de paiements
  * Répartition par mode de paiement (camembert)
  * Répartition par frais (barres)
  * Top 10 classes (revenus)
- Liste détaillée paiements
- Signature comptable + Préfet


APPELS API
-----------
GET /api/payments
  Query params :
    - startDate?: string (ISO)
    - endDate?: string (ISO)
    - studentId?: string
    - classId?: string
    - paymentMethod?: PaymentMethod
    - cashierId?: string
    - receiptNumber?: string
    - page?: number
    - limit?: number (défaut: 50)
  
  Response 200 : {
    data: Payment[],
    total: number,
    page: number,
    pages: number,
    stats: {
      todayTotal: number,
      weekTotal: number,
      monthTotal: number
    }
  }

GET /api/payments/:id
  Response 200 : {
    payment: Payment & {
      student: Student,
      cashier: User,
      feePayments: FeePayment[]
    }
  }

POST /api/payments/:id/cancel
  Body : {
    reason: string,
    details: string
  }
  Response 200 : {
    payment: Payment,
    creditNote: CreditNote,
    message: string
  }

GET /api/payments/export
  Query params : même que GET /api/payments
  Response : Excel file binary


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Liste paiements charge avec pagination
[ ] Filtres (date, élève, mode, caissier) fonctionnent
[ ] Recherche N° reçu fonctionne
[ ] Modal détails affiche infos complètes
[ ] Réimpression reçu fonctionne
[ ] Annulation paiement (PRÉFET only) fonctionne
[ ] Génération avoir automatique après annulation
[ ] Export Excel fonctionne
[ ] Rapport PDF génère avec stats
[ ] Responsive mobile/desktop
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4/7 — SCR-024 : GESTION DES CRÉANCES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-024 - Gestion des Créances
Route : /finance/debts
Rôle minimum : COMPTABLE (consultation) | PRÉFET (actions)
Prérequis : SCR-022 (paiements enregistrés)


OBJECTIF
--------
Suivi des élèves en retard de paiement. Envoi de rappels automatiques.
Blocage délibération/bulletin si créance non régularisée.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/finance/DebtsPage.tsx
2. packages/client/src/components/finance/DebtCard.tsx
3. packages/client/src/components/finance/DebtFilters.tsx
4. packages/client/src/components/finance/SendReminderModal.tsx
5. packages/client/src/components/finance/DebtStatsCards.tsx


UI — STRUCTURE
---------------
  ┌──────────────────────────────────────────────────────────┐
  │ GESTION DES CRÉANCES                                     │
  │                                                          │
  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
  │ │ Total       │ │ > 30 jours  │ │ Élèves      │        │
  │ │ 3 850 000 FC│ │ 1 200 000 FC│ │ 142 en retard│        │
  │ └─────────────┘ └─────────────┘ └─────────────┘        │
  │                                                          │
  │ Filtres : [Classe ▼] [Retard ▼] [🔍 Recherche]          │
  │ [📧 Envoyer rappels groupés] [📥 Export]                 │
  │                                                          │
  │ PRIORITÉ ÉLEVÉE (> 90 jours)                             │
  │ ┌────────────────────────────────────────────────────┐  │
  │ │ 🔴 AMISI Jean-Baptiste · NK-GOM-0234               │  │
  │ │ 4ScA · Solde : 180 000 FC · Retard : 120 jours     │  │
  │ │ Dernier paiement : 01/10/2025                      │  │
  │ │ [Détails] [📧 Rappel] [🚫 Bloquer]                │  │
  │ └────────────────────────────────────────────────────┘  │
  │                                                          │
  │ RETARD MOYEN (30-90 jours)                               │
  │ ...                                                      │
  │                                                          │
  │ RETARD LÉGER (< 30 jours)                                │
  │ ...                                                      │
  │                                                          │
  └──────────────────────────────────────────────────────────┘


NIVEAUX DE RETARD
------------------
Classification automatique :

1. 🟢 LÉGER : 1-30 jours
   - Rappel SMS automatique à 7 jours
   - Pas de blocage

2. 🟡 MOYEN : 31-90 jours
   - Rappel SMS automatique à 30 jours
   - Rappel email à 45 jours
   - Convocation parent à 60 jours
   - Blocage bulletin si > 60 jours

3. 🔴 ÉLEVÉ : > 90 jours
   - Convocation parent obligatoire
   - Blocage délibération
   - Blocage bulletin
   - Plan d'apurement proposé


CALCUL CRÉANCE
---------------
Pour chaque élève :
  Créance = Frais obligatoires échus - Paiements effectués

Frais échus = frais dont la date d'échéance est passée.

Exemple :
  - Minerval Sept : 30 000 FC (échu le 01/09)
  - Minerval Oct : 30 000 FC (échu le 01/10)
  - Minerval Nov : 30 000 FC (échu le 01/11)
  - Total frais échus : 90 000 FC
  - Paiements : 40 000 FC (minerval Sept + 10 000 sur Oct)
  - Créance : 50 000 FC
  - Retard : depuis le 01/10 (date du premier frais impayé)


MODAL ENVOI RAPPEL (SendReminderModal)
----------------------------------------
Envoi rappel individuel ou groupé.

  ┌────────────────────────────────────────────┐
  │ ENVOYER UN RAPPEL                          │
  ├────────────────────────────────────────────┤
  │                                            │
  │ Destinataires : 14 tuteurs sélectionnés    │
  │                                            │
  │ Canal * :                                  │
  │ [☑] SMS                                    │
  │ [☑] Email                                  │
  │                                            │
  │ Modèle de message :                        │
  │ ( ) Rappel amical (1er rappel)             │
  │ (•) Rappel ferme (2ème rappel)             │
  │ ( ) Dernière sommation (3ème rappel)       │
  │                                            │
  │ APERÇU MESSAGE (SMS) :                     │
  │ ┌────────────────────────────────────────┐ │
  │ │ EduGoma360: Cher parent, nous vous    │ │
  │ │ rappelons que le solde impayé pour    │ │
  │ │ {NOM} s'élève à {MONTANT} FC. Merci   │ │
  │ │ de régulariser. Contact: {TEL_ECOLE}  │ │
  │ └────────────────────────────────────────┘ │
  │                                            │
  │ Coût estimé : 14 SMS × 50 FC = 700 FC      │
  │                                            │
  │ [Annuler]              [Envoyer]           │
  └────────────────────────────────────────────┘

Modèles de messages :

1. Rappel amical (FR) :
   "EduGoma360: Cher parent, nous vous rappelons que le solde impayé pour {NOM} ({MATRICULE}) s'élève à {MONTANT} FC depuis le {DATE}. Merci de régulariser. Contact: {TEL_ECOLE}"

2. Rappel ferme (FR) :
   "EduGoma360: URGENT - Le solde impayé de {MONTANT} FC pour {NOM} doit être régularisé sous 7 jours. Passé ce délai, le bulletin sera bloqué. Contact: {TEL_ECOLE}"

3. Dernière sommation (FR) :
   "EduGoma360: DERNIÈRE SOMMATION - Le solde de {MONTANT} FC pour {NOM} doit être payé sous 3 jours. Au-delà, exclusion de la délibération. Contact: {TEL_ECOLE}"

Versions Swahili disponibles.


BLOCAGE AUTOMATIQUE
--------------------
Règles de blocage appliquées automatiquement :

1. Blocage bulletin (> 60 jours retard) :
   - Impossible générer bulletin (SCR-016)
   - Message : "Bulletin bloqué : solde impayé de {MONTANT} FC"

2. Blocage délibération (> 90 jours retard) :
   - Élève exclu de la délibération (SCR-015)
   - Message : "Exclusion délibération : régulariser {MONTANT} FC"

3. Déblocage immédiat après paiement partiel/total


PLAN D'APUREMENT
-----------------
Pour créances > 90 jours, proposition plan d'apurement :

  ┌────────────────────────────────────────────┐
  │ PLAN D'APUREMENT                           │
  │ Élève : AMISI Jean-Baptiste                │
  │ Solde dû : 180 000 FC                      │
  ├────────────────────────────────────────────┤
  │                                            │
  │ Proposition de paiement échelonné :        │
  │                                            │
  │ ( ) 2 mensualités de 90 000 FC            │
  │ ( ) 3 mensualités de 60 000 FC            │
  │ (•) 4 mensualités de 45 000 FC            │
  │ ( ) 6 mensualités de 30 000 FC            │
  │                                            │
  │ Échéancier :                               │
  │ • 15/03/2026 : 45 000 FC                   │
  │ • 15/04/2026 : 45 000 FC                   │
  │ • 15/05/2026 : 45 000 FC                   │
  │ • 15/06/2026 : 45 000 FC                   │
  │                                            │
  │ Engagement signé requis                    │
  │                                            │
  │ [Annuler]              [Créer le plan]     │
  └────────────────────────────────────────────┘

Plan enregistré en base avec :
- Échéances définies
- Suivi automatique
- Rappels avant chaque échéance
- Possibilité paiement anticipé


TÂCHE CRON RAPPELS AUTO
-------------------------
Tâche quotidienne (9h00) qui envoie rappels automatiques :

  cron.schedule('0 9 * * *', async () => {
    // Rappel léger à 7 jours
    const leger = await findDebtsWithDays(7)
    sendReminders(leger, 'AMICAL')
    
    // Rappel moyen à 30 jours
    const moyen = await findDebtsWithDays(30)
    sendReminders(moyen, 'FERME')
    
    // Rappel élevé à 90 jours
    const eleve = await findDebtsWithDays(90)
    sendReminders(eleve, 'SOMMATION')
  })


APPELS API
-----------
GET /api/debts
  Query params :
    - classId?: string
    - level?: 'LEGER' | 'MOYEN' | 'ELEVE'
    - minAmount?: number
    - page?: number
    - limit?: number
  
  Response 200 : {
    data: Array<{
      student: Student,
      totalDebt: number,
      daysPastDue: number,
      level: string,
      lastPaymentDate: Date,
      blockedServices: string[]
    }>,
    total: number,
    stats: {
      totalDebt: number,
      over90Days: number,
      studentsCount: number
    }
  }

POST /api/debts/send-reminders
  Body : {
    studentIds: string[],
    channel: 'SMS' | 'EMAIL' | 'BOTH',
    template: 'AMICAL' | 'FERME' | 'SOMMATION'
  }
  Response 200 : {
    sent: number,
    failed: number,
    cost: number  // Coût SMS
  }

POST /api/debts/:studentId/payment-plan
  Body : {
    totalAmount: number,
    installments: number,
    startDate: string (ISO)
  }
  Response 201 : {
    plan: PaymentPlan,
    schedule: Array<{
      dueDate: Date,
      amount: number
    }>
  }


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Liste créances avec 3 niveaux (Léger, Moyen, Élevé)
[ ] Calcul créance correct (frais échus - payé)
[ ] Calcul jours de retard correct
[ ] Filtres (classe, niveau retard) fonctionnent
[ ] Envoi rappel individuel fonctionne
[ ] Envoi rappel groupé fonctionne
[ ] 3 modèles messages (Amical, Ferme, Sommation)
[ ] Blocage bulletin si > 60 jours
[ ] Blocage délibération si > 90 jours
[ ] Création plan d'apurement fonctionne
[ ] CRON rappels automatiques fonctionne (9h00)
[ ] Export Excel créances fonctionne
[ ] Responsive mobile/desktop
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 5/7 — SCR-025 : RAPPORTS FINANCIERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-025 - Rapports Financiers
Route : /finance/reports
Rôle minimum : TRÉSORIER (tous rapports) | PRÉFET (validation)
Prérequis : SCR-022, SCR-023, SCR-024


OBJECTIF
--------
Génération de rapports financiers périodiques pour la direction.
Tableau de bord avec KPIs financiers en temps réel.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/finance/ReportsPage.tsx
2. packages/client/src/components/finance/FinancialDashboard.tsx
3. packages/client/src/components/finance/ReportFilters.tsx
4. packages/client/src/components/finance/RevenueChart.tsx
5. packages/client/src/components/finance/ExpensesChart.tsx
6. packages/client/src/components/finance/GenerateReportModal.tsx


UI — TABLEAU DE BORD
---------------------
  ┌──────────────────────────────────────────────────────────┐
  │ TABLEAU DE BORD FINANCIER                                │
  │                                                          │
  │ Période : [Ce mois ▼]      [📊 Générer rapport PDF]     │
  │                                                          │
  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
  │ │ Revenus     │ │ Créances    │ │ Taux        │        │
  │ │ 12 500 000  │ │ 3 850 000   │ │ recouvrement│        │
  │ │ FC          │ │ FC          │ │ 76%         │        │
  │ │ ▲ +12%      │ │ ▼ -5%       │ │ ▲ +3%       │        │
  │ └─────────────┘ └─────────────┘ └─────────────┘        │
  │                                                          │
  │ ÉVOLUTION DES REVENUS                                    │
  │ [Graphique courbe mensuelle]                             │
  │                                                          │
  │ RÉPARTITION PAR TYPE DE FRAIS                            │
  │ [Graphique camembert]                                    │
  │                                                          │
  │ RÉPARTITION PAR CLASSE                                   │
  │ [Graphique barres horizontales]                          │
  │                                                          │
  └──────────────────────────────────────────────────────────┘


KPIS PRINCIPAUX
----------------
1. Revenus totaux période
2. Créances totales
3. Taux de recouvrement = (Payé / (Payé + Créances)) × 100
4. Revenus moyens par élève
5. Nombre de paiements
6. Montant moyen par paiement
7. Répartition modes de paiement


GRAPHIQUES
-----------
1. Évolution revenus mensuels (courbe)
   - X : mois
   - Y : montant en FC
   - Comparaison année N vs année N-1

2. Répartition par type de frais (camembert)
   - Minerval : X%
   - Inscription : Y%
   - Examens : Z%
   - etc.

3. Revenus par classe (barres horizontales)
   - Classes triées par revenus décroissants

4. Modes de paiement (donut)
   - Espèces : X%
   - Mobile Money : Y%
   - Virement : Z%


MODAL GÉNÉRATION RAPPORT (GenerateReportModal)
------------------------------------------------
  ┌────────────────────────────────────────────┐
  │ GÉNÉRER UN RAPPORT FINANCIER               │
  ├────────────────────────────────────────────┤
  │                                            │
  │ Type de rapport * :                        │
  │ ( ) Rapport mensuel                        │
  │ (•) Rapport trimestriel                    │
  │ ( ) Rapport annuel                         │
  │ ( ) Rapport personnalisé                   │
  │                                            │
  │ Période * :                                │
  │ Du : [01/10/2025] Au : [31/12/2025]        │
  │                                            │
  │ Sections à inclure :                       │
  │ [☑] Résumé exécutif                        │
  │ [☑] Revenus détaillés                      │
  │ [☑] Créances et recouvrements              │
  │ [☑] Statistiques par classe                │
  │ [☑] Modes de paiement                      │
  │ [☑] Graphiques                             │
  │ [☑] Liste des transactions                 │
  │                                            │
  │ Format :                                   │
  │ (•) PDF  ( ) Excel                         │
  │                                            │
  │ [Annuler]              [Générer]           │
  └────────────────────────────────────────────┘


STRUCTURE RAPPORT PDF
----------------------
1. Page de garde
   - Logo école
   - Titre : "Rapport Financier Trimestriel T1 2025-2026"
   - Période
   - Date de génération

2. Résumé exécutif (1 page)
   - KPIs principaux
   - Faits marquants
   - Recommandations

3. Revenus détaillés (2-3 pages)
   - Tableau par type de frais
   - Évolution mensuelle
   - Comparaison objectifs vs réalisé

4. Créances et recouvrements (1-2 pages)
   - Créances par niveau (Léger, Moyen, Élevé)
   - Taux de recouvrement
   - Actions de recouvrement menées

5. Statistiques par classe (1 page)
   - Revenus par classe
   - Taux paiement par classe
   - Classes en difficulté

6. Modes de paiement (1 page)
   - Répartition
   - Évolution
   - Recommandations

7. Graphiques (2-3 pages)
   - Tous les graphiques du dashboard

8. Annexes (optionnel)
   - Liste complète transactions
   - Détail créances


APPELS API
-----------
GET /api/finance/dashboard
  Query params :
    - startDate: string (ISO)
    - endDate: string (ISO)
  
  Response 200 : {
    kpis: {
      totalRevenue: number,
      totalDebts: number,
      recoveryRate: number,
      avgRevenuePerStudent: number,
      paymentsCount: number,
      avgPaymentAmount: number
    },
    revenueEvolution: Array<{ month: string, amount: number }>,
    revenueByFeeType: Array<{ type: string, amount: number }>,
    revenueByClass: Array<{ className: string, amount: number }>,
    paymentMethods: Array<{ method: string, count: number, amount: number }>
  }

POST /api/finance/reports/generate
  Body : {
    type: 'MONTHLY' | 'TRIMESTRAL' | 'ANNUAL' | 'CUSTOM',
    startDate: string (ISO),
    endDate: string (ISO),
    sections: string[],
    format: 'PDF' | 'EXCEL'
  }
  
  Response 200 : {
    reportUrl: string,  // URL du PDF/Excel généré
    filename: string
  }


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Dashboard charge avec 6 KPIs
[ ] Graphique évolution revenus mensuels
[ ] Graphique camembert types de frais
[ ] Graphique barres revenus par classe
[ ] Graphique donut modes de paiement
[ ] Filtres période fonctionnent
[ ] Génération rapport PDF fonctionne
[ ] Rapport inclut toutes les sections
[ ] Export Excel fonctionne
[ ] Responsive mobile/desktop
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 6/7 — SCR-026 : CAISSE ET RAPPROCHEMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-026 - Gestion de Caisse et Rapprochement
Route : /finance/cashier
Rôle minimum : COMPTABLE (gestion quotidienne) | TRÉSORIER (validation)
Prérequis : SCR-022 (paiements espèces)


OBJECTIF
--------
Gestion quotidienne de la caisse physique (espèces).
Rapprochement théorique vs réel en fin de journée.
Gestion des écarts et des justificatifs.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/finance/CashierPage.tsx
2. packages/client/src/components/finance/CashSession.tsx
3. packages/client/src/components/finance/CashCount.tsx
4. packages/client/src/components/finance/CashReconciliation.tsx
5. packages/client/src/components/finance/ExpenseEntry.tsx


UI — STRUCTURE
---------------
  ┌──────────────────────────────────────────────────────────┐
  │ GESTION DE CAISSE                     [Fermer caisse]    │
  │                                                          │
  │ Session du 26/02/2026 · Caissier : MUKASA Jean          │
  │ Ouverture : 08:00 · Statut : 🟢 Ouverte                 │
  │                                                          │
  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
  │ │ Solde début │ │ Encaissements│ │ Décaissements│        │
  │ │ 250 000 FC  │ │ 1 850 000 FC │ │ 50 000 FC   │        │
  │ └─────────────┘ └─────────────┘ └─────────────┘        │
  │                                                          │
  │ SOLDE THÉORIQUE : 2 050 000 FC                           │
  │                                                          │
  │ [+ Enregistrer dépense]                                  │
  │                                                          │
  │ MOUVEMENTS DU JOUR                                       │
  │ ┌────────────────────────────────────────────────────┐  │
  │ │ Heure │ Type        │ Reçu/Réf │ Montant  │ Solde  │  │
  │ ├───────┼─────────────┼──────────┼──────────┼────────┤  │
  │ │ 08:00 │ Ouverture   │ —        │ 250 000  │250 000 │  │
  │ │ 09:15 │ Paiement    │ 2026-0231│ +70 000  │320 000 │  │
  │ │ 10:30 │ Paiement    │ 2026-0232│ +50 000  │370 000 │  │
  │ │ 11:00 │ Dépense     │ DEP-001  │ -20 000  │350 000 │  │
  │ │ ...                                                │  │
  │ └────────────────────────────────────────────────────┘  │
  │                                                          │
  └──────────────────────────────────────────────────────────┘


OUVERTURE SESSION CAISSE
--------------------------
Chaque jour, le comptable ouvre la caisse :

Modal "Ouvrir la caisse" :
  ┌────────────────────────────────────────────┐
  │ OUVERTURE DE CAISSE                        │
  ├────────────────────────────────────────────┤
  │                                            │
  │ Date : 26/02/2026                          │
  │ Heure : 08:00                              │
  │ Caissier : MUKASA Jean (connecté)          │
  │                                            │
  │ Fond de caisse initial * :                 │
  │ [250000] FC                                │
  │                                            │
  │ ℹ️ Ce montant correspond au solde de fin   │
  │   de journée précédente.                   │
  │                                            │
  │ Observations :                             │
  │ [                                    ]     │
  │                                            │
  │ [Annuler]              [Ouvrir la caisse]  │
  └────────────────────────────────────────────┘


ENREGISTREMENT DÉPENSES
------------------------
Bouton "+ Enregistrer dépense" ouvre modal :

  ┌────────────────────────────────────────────┐
  │ ENREGISTRER UNE DÉPENSE                    │
  ├────────────────────────────────────────────┤
  │                                            │
  │ Type de dépense * :                        │
  │ ( ) Fournitures scolaires                  │
  │ ( ) Entretien et maintenance               │
  │ (•) Salaires enseignants                   │
  │ ( ) Factures (eau, électricité)            │
  │ ( ) Autre                                  │
  │                                            │
  │ Montant * :                                │
  │ [50000] FC                                 │
  │                                            │
  │ Bénéficiaire * :                           │
  │ [BAHATI Marie - Enseignante]              │
  │                                            │
  │ Motif * :                                  │
  │ [Salaire mois de janvier 2026]            │
  │                                            │
  │ Justificatif :                             │
  │ [📎 Glisser-déposer reçu/facture]          │
  │                                            │
  │ [Annuler]              [Enregistrer]       │
  └────────────────────────────────────────────┘

Dépenses déduites du solde caisse.


FERMETURE SESSION CAISSE
--------------------------
Bouton "Fermer caisse" (fin de journée) :

  ┌────────────────────────────────────────────┐
  │ FERMETURE DE CAISSE                        │
  ├────────────────────────────────────────────┤
  │                                            │
  │ SOLDE THÉORIQUE :                          │
  │ Ouverture :        250 000 FC              │
  │ Encaissements :  1 850 000 FC              │
  │ Décaissements :    -50 000 FC              │
  │ = Solde théorique : 2 050 000 FC           │
  │                                            │
  │ COMPTAGE PHYSIQUE * :                      │
  │ [Lancer le comptage →]                     │
  │                                            │
  └────────────────────────────────────────────┘

Clic "Lancer le comptage" ouvre module de comptage.


MODULE COMPTAGE PHYSIQUE (CashCount)
--------------------------------------
  ┌────────────────────────────────────────────┐
  │ COMPTAGE PHYSIQUE DES ESPÈCES              │
  ├────────────────────────────────────────────┤
  │                                            │
  │ BILLETS :                                  │
  │ 20 000 FC × [  5] = 100 000 FC             │
  │ 10 000 FC × [ 10] = 100 000 FC             │
  │  5 000 FC × [ 20] = 100 000 FC             │
  │  1 000 FC × [ 50] =  50 000 FC             │
  │    500 FC × [100] =  50 000 FC             │
  │                                            │
  │ PIÈCES :                                   │
  │    200 FC × [ 25] =   5 000 FC             │
  │    100 FC × [ 50] =   5 000 FC             │
  │     50 FC × [100] =   5 000 FC             │
  │                                            │
  │ TOTAL COMPTÉ : 415 000 FC                  │
  │                                            │
  │ [← Refaire] [Valider le comptage →]        │
  └────────────────────────────────────────────┘


RAPPROCHEMENT ET ÉCARTS (CashReconciliation)
----------------------------------------------
Après validation du comptage :

  ┌────────────────────────────────────────────┐
  │ RAPPROCHEMENT DE CAISSE                    │
  ├────────────────────────────────────────────┤
  │                                            │
  │ Solde théorique : 2 050 000 FC             │
  │ Solde réel compté : 2 045 000 FC           │
  │                                            │
  │ ⚠️ ÉCART : -5 000 FC (manquant)            │
  │                                            │
  │ Justification de l'écart :                 │
  │ ( ) Erreur de caisse                       │
  │ ( ) Erreur de saisie                       │
  │ ( ) Vol / Perte                            │
  │ (•) Autre                                  │
  │                                            │
  │ Détails * :                                │
  │ [Billet de 5000 FC abîmé, retiré         │
  │  de la circulation et remplacé]           │
  │                                            │
  │ ⚠️ Un rapport sera généré pour validation  │
  │   par le Trésorier.                        │
  │                                            │
  │ [← Recompter] [Valider avec écart]         │
  └────────────────────────────────────────────┘

Si écart > 1 000 FC → validation Trésorier obligatoire.


MODÈLE DE DONNÉES
------------------
Schéma Prisma :

  model CashSession {
    id            String   @id @default(uuid())
    schoolId      String
    school        School   @relation(fields: [schoolId], references: [id])
    
    date          DateTime @db.Date
    cashierId     String
    cashier       User     @relation(fields: [cashierId], references: [id])
    
    openingBalance Int    // Solde ouverture
    closingBalance Int?   // Solde fermeture (après comptage)
    
    totalReceived  Int    // Total encaissements
    totalSpent     Int    // Total dépenses
    
    theoreticalBalance Int // Calculé : opening + received - spent
    actualBalance      Int? // Compté physiquement
    
    discrepancy    Int?   // Écart : actual - theoretical
    
    status         CashSessionStatus
    
    openedAt      DateTime
    closedAt      DateTime?
    
    movements     CashMovement[]
    
    @@unique([schoolId, date, cashierId])
  }
  
  model CashMovement {
    id            String   @id @default(uuid())
    sessionId     String
    session       CashSession @relation(fields: [sessionId], references: [id])
    
    type          CashMovementType  // IN | OUT
    category      String   // PAYMENT | EXPENSE | OPENING | CLOSING
    
    amount        Int
    balance       Int      // Solde après mouvement
    
    reference     String?  // N° reçu ou N° dépense
    description   String?
    
    receiptUrl    String?  // Justificatif uploadé
    
    createdAt     DateTime @default(now())
    
    @@index([sessionId, createdAt])
  }
  
  enum CashSessionStatus {
    OPEN
    CLOSED
    VALIDATED    // Validé par Trésorier
  }
  
  enum CashMovementType {
    IN           // Encaissement
    OUT          // Décaissement
  }


APPELS API
-----------
POST /api/cash-sessions/open
  Body : {
    date: string (ISO Date),
    openingBalance: number,
    observations?: string
  }
  Response 201 : { session: CashSession }

GET /api/cash-sessions/current
  Response 200 : {
    session: CashSession & { movements: CashMovement[] }
  }

POST /api/cash-sessions/:id/expense
  Body : {
    type: string,
    amount: number,
    beneficiary: string,
    motif: string,
    receiptFile?: File
  }
  Response 201 : { movement: CashMovement }

POST /api/cash-sessions/:id/close
  Body : {
    actualBalance: number,
    denominations: { [key: string]: number },
    discrepancyReason?: string,
    discrepancyDetails?: string
  }
  Response 200 : {
    session: CashSession,
    discrepancy: number,
    requiresValidation: boolean
  }


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Ouverture session caisse fonctionne
[ ] Enregistrement dépenses fonctionne
[ ] Liste mouvements du jour affichée
[ ] Solde théorique calculé correctement
[ ] Module comptage physique fonctionne
[ ] Rapprochement détecte écarts
[ ] Justification écart obligatoire si > 1000 FC
[ ] Validation Trésorier si écart important
[ ] Responsive mobile/desktop
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 7/7 — SCR-027 : BUDGETS ET PRÉVISIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-027 - Budgets et Prévisions
Route : /finance/budgets
Rôle minimum : PRÉFET (configuration) | TRÉSORIER (suivi)
Prérequis : SCR-021 (frais configurés), SCR-025 (rapports)


OBJECTIF
--------
Définir les objectifs financiers annuels et mensuels.
Suivre la réalisation par rapport aux prévisions.
Alertes si écarts importants.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/finance/BudgetsPage.tsx
2. packages/client/src/components/finance/BudgetForm.tsx
3. packages/client/src/components/finance/BudgetTracking.tsx
4. packages/client/src/components/finance/BudgetChart.tsx


UI — STRUCTURE
---------------
  ┌──────────────────────────────────────────────────────────┐
  │ BUDGETS ET PRÉVISIONS 2024-2025                          │
  │                                                          │
  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
  │ │ Budget total│ │ Réalisé     │ │ Taux        │        │
  │ │ 95 000 000  │ │ 72 500 000  │ │ réalisation │        │
  │ │ FC          │ │ FC          │ │ 76%         │        │
  │ └─────────────┘ └─────────────┘ └─────────────┘        │
  │                                                          │
  │ [Modifier budget annuel]                                 │
  │                                                          │
  │ SUIVI MENSUEL                                            │
  │ [Graphique barres : Prévu vs Réalisé par mois]           │
  │                                                          │
  │ DÉTAIL PAR CATÉGORIE                                     │
  │ ┌────────────────────────────────────────────────────┐  │
  │ │ Catégorie     │ Budget   │ Réalisé  │ Écart  │ %  │  │
  │ ├───────────────┼──────────┼──────────┼────────┼────┤  │
  │ │ Minerval      │50 000 000│38 000 000│-12 M   │76% │  │
  │ │ Inscription   │15 000 000│14 500 000│  -500K │97% │  │
  │ │ Examens       │ 9 000 000│ 7 200 000│-1.8M   │80% │  │
  │ │ Cantine       │12 000 000│ 8 500 000│-3.5M   │71%❗│  │
  │ │ ...                                                │  │
  │ └────────────────────────────────────────────────────┘  │
  │                                                          │
  └──────────────────────────────────────────────────────────┘


CONFIGURATION BUDGET ANNUEL
-----------------------------
Modal "Modifier budget annuel" :

  ┌────────────────────────────────────────────┐
  │ BUDGET ANNUEL 2024-2025                    │
  ├────────────────────────────────────────────┤
  │                                            │
  │ REVENUS PRÉVUS :                           │
  │                                            │
  │ Minerval (850 élèves × 30k × 9 mois)       │
  │ [50000000] FC                              │
  │                                            │
  │ Inscriptions (200 nouveaux × 75k)         │
  │ [15000000] FC                              │
  │                                            │
  │ Réinscriptions (650 anciens × 50k)        │
  │ [30000000] FC                              │
  │                                            │
  │ + [Ajouter ligne de revenu]                │
  │                                            │
  │ TOTAL REVENUS : 95 000 000 FC              │
  │                                            │
  │ Répartition mensuelle :                    │
  │ ( ) Uniforme (9 mois)                      │
  │ (•) Personnalisée par mois                 │
  │                                            │
  │ [Annuler]              [Enregistrer]       │
  └────────────────────────────────────────────┘

Si "Personnalisée" :
  - Tableau 12 mois avec montant par mois
  - Total doit égaler le budget annuel


SUIVI ET ALERTES
-----------------
Alertes automatiques si :
- Écart > 20% sur une catégorie
- Revenus mensuels < 70% du prévu
- 3 mois consécutifs sous objectif

Couleurs indicateurs :
- 🟢 Vert : réalisation ≥ 90%
- 🟡 Orange : réalisation 70-89%
- 🔴 Rouge : réalisation < 70%


APPELS API
-----------
GET /api/budgets/:academicYearId
  Response 200 : {
    budget: Budget,
    tracking: {
      totalBudget: number,
      totalRealized: number,
      realizationRate: number,
      byCategory: Array<{
        category: string,
        budgeted: number,
        realized: number,
        variance: number,
        rate: number
      }>,
      byMonth: Array<{
        month: string,
        budgeted: number,
        realized: number
      }>
    }
  }

POST /api/budgets
  Body : {
    academicYearId: string,
    categories: Array<{
      name: string,
      amount: number
    }>,
    monthlyDistribution: 'UNIFORM' | 'CUSTOM',
    months?: Array<{ month: number, amount: number }>
  }
  Response 201 : { budget: Budget }


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Configuration budget annuel fonctionne
[ ] Répartition mensuelle (uniforme ou custom) fonctionne
[ ] Graphique prévu vs réalisé affiche correctement
[ ] Tableau détail par catégorie affiche écarts
[ ] Alertes si écart > 20%
[ ] Export PDF budget fonctionne
[ ] Responsive mobile/desktop
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RÉCAPITULATIF MODULE FINANCE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| N° | Écran | Fonction | Fichiers | Complexité |
|----|-------|----------|----------|------------|
| 21 | Config frais | Tarification école | 11 fichiers | ⭐⭐⭐ |
| 22 | Enregistrement paiements | Caisse wizard 4 étapes | 14 fichiers | ⭐⭐⭐⭐ |
| 23 | Historique paiements | Consultation + export | 5 fichiers | ⭐⭐ |
| 24 | Créances | Relances auto + CRON | 5 fichiers | ⭐⭐⭐⭐ |
| 25 | Rapports | Dashboard + PDF | 6 fichiers | ⭐⭐⭐ |
| 26 | Caisse | Rapprochement quotidien | 5 fichiers | ⭐⭐⭐ |
| 27 | Budgets | Prévisions annuelles | 4 fichiers | ⭐⭐ |

**Total : 7 écrans, ~45 fichiers**

---

## ORDRE D'EXÉCUTION

```
SCR-021 (Config frais)
   ↓
SCR-022 (Enregistrement paiements) ← crée les paiements
   ↓
SCR-023 (Historique) ← consulte les paiements
   ↓
SCR-024 (Créances) ← calcule les impayés
   ↓
SCR-025 (Rapports) ← agrège toutes les données
   ↓
SCR-026 (Caisse) ← gère les espèces
   ↓
SCR-027 (Budgets) ← compare réalisé vs prévu
```

---

## POINTS CRITIQUES

1. **Reçu numéroté séquentiel** : {ANNÉE}-{SEQUENCE}
2. **Paiement partiel autorisé**
3. **4 modes de paiement** : Espèces, Mobile Money, Virement, Chèque
4. **CRON rappels créances** à 9h00 quotidien
5. **Blocage bulletin/délibération** si créance > 60/90 jours
6. **Rapprochement caisse quotidien** obligatoire
7. **Impression thermique 80mm** pour reçus

---

*EduGoma 360 — Module Finance Complet — Goma, RDC — © 2025*
