# ⚙️ EDUGOMA 360 — MODULE PARAMÈTRES COMPLET (PARTIE 2/2)
## Prompts SCR-033 à SCR-036 | Année Scolaire, Sections, Classes, Utilisateurs

> **MODE D'EMPLOI :**
> Ce fichier contient **4 prompts** (suite de la Partie 1/2).
> Prérequis : SCR-032 (Informations école) doit être complété.
> Exécute ces prompts dans l'ordre : 033 → 034 → 035 → 036.

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 5 — SCR-033 : GESTION ANNÉE SCOLAIRE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/settings/AcademicYearPage.tsx
Route : /settings/academic-year
Accès : Protégé
Rôle minimum : PRÉFET


OBJECTIF
--------
Gérer les années scolaires : création, activation, clôture.
Une seule année active à la fois. Définition 3 trimestres ou 2 semestres.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/settings/AcademicYearPage.tsx
2. packages/client/src/components/settings/AcademicYearCard.tsx
3. packages/client/src/components/settings/CreateYearModal.tsx
4. packages/client/src/components/settings/CloseYearModal.tsx
5. packages/client/src/hooks/useAcademicYears.ts
6. packages/server/src/modules/academic-year/academic-year.routes.ts
7. packages/server/src/modules/academic-year/academic-year.controller.ts
8. packages/server/src/modules/academic-year/academic-year.service.ts


UI — STRUCTURE
---------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ ANNÉES SCOLAIRES                          [+ Nouvelle année]     │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  🟢 ANNÉE ACTIVE                                                 │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 2024-2025                      Badge: 🟢 Active            │ │
  │  │ Du 04/09/2024 au 30/06/2025 (39 semaines)                  │ │
  │  │                                                            │ │
  │  │ ▶ TRIMESTRE 1                                              │ │
  │  │   04/09/2024 → 15/12/2024 (14 semaines)                    │ │
  │  │   Status: ✅ Terminé                                        │ │
  │  │                                                            │ │
  │  │ ▶ TRIMESTRE 2                                              │ │
  │  │   06/01/2025 → 31/03/2025 (12 semaines)                    │ │
  │  │   Status: 🟢 En cours (Semaine 8/12)                       │ │
  │  │                                                            │ │
  │  │ ▶ TRIMESTRE 3                                              │ │
  │  │   07/04/2025 → 30/06/2025 (12 semaines)                    │ │
  │  │   Status: ⏳ À venir                                        │ │
  │  │                                                            │ │
  │  │ [Modifier dates] [Clôturer l'année]                        │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  📚 ANNÉES PRÉCÉDENTES                                           │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 2023-2024                      Badge: 🔒 Clôturée          │ │
  │  │ Clôturée le 28/06/2024                                     │ │
  │  │ 847 élèves • 3 trimestres                                  │ │
  │  │                                                            │ │
  │  │ [📄 Voir détails] [📊 Rapports]                            │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 2022-2023                      Badge: 🔒 Clôturée          │ │
  │  │ Clôturée le 30/06/2023                                     │ │
  │  │ 792 élèves • 3 trimestres                                  │ │
  │  │                                                            │ │
  │  │ [📄 Voir détails] [📊 Rapports]                            │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


MODAL CRÉATION ANNÉE
----------------------
  ┌─────────────────────────────────────────────┐
  │ NOUVELLE ANNÉE SCOLAIRE                     │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Nom * :                                     │
  │ [2025-2026]                                 │
  │ Format : AAAA-AAAA                          │
  │                                             │
  │ Date de début * :                           │
  │ [04/09/2025] 📅                             │
  │                                             │
  │ Date de fin * :                             │
  │ [30/06/2026] 📅                             │
  │                                             │
  │ Durée calculée : 39 semaines                │
  │                                             │
  │ ──────────────────────────────────────────  │
  │                                             │
  │ Découpage en trimestres/semestres :         │
  │ (•) 3 Trimestres  ( ) 2 Semestres           │
  │                                             │
  │ ▼ TRIMESTRE 1                               │
  │   Début : [04/09/2025] 📅                   │
  │   Fin   : [15/12/2025] 📅                   │
  │   Durée : 14 semaines                       │
  │                                             │
  │ ▼ TRIMESTRE 2                               │
  │   Début : [06/01/2026] 📅                   │
  │   Fin   : [31/03/2026] 📅                   │
  │   Durée : 12 semaines                       │
  │                                             │
  │ ▼ TRIMESTRE 3                               │
  │   Début : [07/04/2026] 📅                   │
  │   Fin   : [30/06/2026] 📅                   │
  │   Durée : 12 semaines                       │
  │                                             │
  │ Total : 38 semaines (1 semaine de vacances) │
  │                                             │
  │ ──────────────────────────────────────────  │
  │                                             │
  │ [☑] Activer immédiatement cette année       │
  │     (L'année 2024-2025 sera clôturée auto)  │
  │                                             │
  │ [Annuler]              [Créer l'année]      │
  └─────────────────────────────────────────────┘


VALIDATION TRIMESTRES/SEMESTRES
---------------------------------
Règles :
1. Trimestre 1 début = Année début
2. Trimestre 3 fin = Année fin
3. Pas de chevauchement entre périodes
4. Pas de trous (T1 fin + 1 jour = T2 début, sauf vacances)
5. Chaque trimestre min 8 semaines, max 16 semaines

Calcul automatique :
  - Si sélection "3 Trimestres" :
    * Proposer découpage équitable
    * T1 : 14 sem (sept-déc)
    * T2 : 12 sem (jan-mars)
    * T3 : 12 sem (avr-juin)
  
  - Si sélection "2 Semestres" :
    * S1 : sept-janvier (20 semaines)
    * S2 : février-juin (18 semaines)


MODAL CLÔTURE ANNÉE
--------------------
  ┌─────────────────────────────────────────────┐
  │ CLÔTURER L'ANNÉE 2024-2025                  │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ ⚠️ Cette action est IRRÉVERSIBLE            │
  │                                             │
  │ VÉRIFICATIONS PRÉALABLES :                  │
  │ ✅ Tous les trimestres terminés             │
  │ ✅ Délibération T3 approuvée (45 classes)   │
  │ ✅ Bulletins générés (847/847)              │
  │ ❌ 12 élèves ont des créances impayées      │
  │                                             │
  │ STATISTIQUES ANNÉE :                        │
  │ • Élèves inscrits : 847                     │
  │ • Admis : 678 (80%)                         │
  │ • Ajournés : 98 (12%)                       │
  │ • Exclus : 71 (8%)                          │
  │ • Taux présence : 91.2%                     │
  │                                             │
  │ CONSÉQUENCES CLÔTURE :                      │
  │ • Aucune modification notes/présences       │
  │ • Année archivée (consultation seule)       │
  │ • Élèves admis passent année supérieure     │
  │                                             │
  │ Clôturer quand même avec créances ?         │
  │ ( ) Non, corriger d'abord                   │
  │ (•) Oui, clôturer malgré créances           │
  │                                             │
  │ [Annuler]              [Clôturer]           │
  └─────────────────────────────────────────────┘


APPELS API
-----------
GET /api/academic-years
  Response 200 :
    {
      current: {
        id: string,
        name: string,
        startDate: string,
        endDate: string,
        isActive: boolean,
        isClosed: boolean,
        terms: Array<{
          id: string,
          number: 1 | 2 | 3,
          startDate: string,
          endDate: string,
          status: 'UPCOMING' | 'CURRENT' | 'COMPLETED'
        }>
      },
      past: Array<{
        id: string,
        name: string,
        closedAt: string,
        studentCount: number,
        termCount: number
      }>
    }

POST /api/academic-years
  Body : {
    name: string,
    startDate: string (ISO),
    endDate: string (ISO),
    type: 'TRIMESTRES' | 'SEMESTRES',
    terms: Array<{
      number: number,
      startDate: string,
      endDate: string
    }>,
    activateImmediately: boolean
  }
  
  Response 201 : { academicYear: AcademicYear }

POST /api/academic-years/:id/close
  Body : {
    ignoreUnpaidDebts: boolean
  }
  
  Response 200 : {
    academicYear: AcademicYear,
    statistics: {
      totalStudents: number,
      admitted: number,
      failed: number
    }
  }


MODÈLE PRISMA
--------------
model AcademicYear {
  id            String   @id @default(uuid())
  schoolId      String
  school        School   @relation(fields: [schoolId], references: [id])
  
  name          String   // "2024-2025"
  startDate     DateTime @db.Date
  endDate       DateTime @db.Date
  
  type          PeriodType  // TRIMESTRES | SEMESTRES
  
  isActive      Boolean  @default(false)
  isClosed      Boolean  @default(false)
  closedAt      DateTime?
  closedById    String?
  closedBy      User?    @relation(fields: [closedById], references: [id])
  
  terms         Term[]
  enrollments   Enrollment[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([schoolId, name])
  @@index([schoolId, isActive])
}

model Term {
  id              String   @id @default(uuid())
  academicYearId  String
  academicYear    AcademicYear @relation(fields: [academicYearId], references: [id])
  
  number          Int      // 1, 2, 3 (trimestres) ou 1, 2 (semestres)
  startDate       DateTime @db.Date
  endDate         DateTime @db.Date
  
  grades          Grade[]
  
  createdAt       DateTime @default(now())
  
  @@unique([academicYearId, number])
}

enum PeriodType {
  TRIMESTRES
  SEMESTRES
}


RÈGLES MÉTIER
--------------
1. Une seule année active à la fois
   → Activer nouvelle = désactiver ancienne automatiquement

2. Impossible modifier année clôturée
   → Lecture seule permanente

3. Clôture nécessite :
   → Toutes délibérations approuvées
   → Tous bulletins générés
   → (Optionnel) Toutes créances réglées

4. Après clôture :
   → Élèves admis → passage année N+1
   → Élèves ajournés → redoublement
   → Notes archivées
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 5 — SCR-034 : GESTION SECTIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Fichier : packages/client/src/pages/settings/SectionsPage.tsx
Route : /settings/sections
Rôle : PRÉFET


OBJECTIF
--------
Configurer les sections de l'école (Tronc Commun, Scientifique, etc.)
avec leurs matières, coefficients, et système de notation.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/settings/SectionsPage.tsx
2. packages/client/src/components/settings/SectionCard.tsx
3. packages/client/src/components/settings/CreateSectionModal.tsx
4. packages/client/src/components/settings/SubjectManagementModal.tsx
5. packages/client/src/hooks/useSections.ts
6. packages/server/src/modules/sections/sections.routes.ts
7. packages/server/src/modules/sections/sections.controller.ts
8. packages/server/src/modules/sections/sections.service.ts


UI — STRUCTURE
---------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ SECTIONS DE L'ÉCOLE                       [+ Ajouter section]    │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ℹ️ Les sections définissent les filières disponibles dans       │
  │     votre école et leurs matières respectives.                   │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 📘 TRONC COMMUN (TC)                  [Gérer] [Suppr]      │ │
  │  │ Années : 1ère et 2ème                                       │ │
  │  │ 11 matières configurées                                     │ │
  │  │ 3 classes · 89 élèves                                       │ │
  │  │                                                            │ │
  │  │ [▼ Voir les matières]                                      │ │
  │  │ ┌──────────────────────────────────────────────────────┐  │ │
  │  │ │ Matière           │ Coeff │ Note sur │ Oblig │ Act  │  │ │
  │  │ ├──────────────────┼───────┼──────────┼───────┼──────┤  │ │
  │  │ │ Mathématiques    │ 4     │ 20       │ ✅    │ [✏️] │  │ │
  │  │ │ Physique         │ 3     │ 20       │ ✅    │ [✏️] │  │ │
  │  │ │ Chimie           │ 3     │ 20       │ ✅    │ [✏️] │  │ │
  │  │ │ Biologie         │ 2     │ 20       │ ✅    │ [✏️] │  │ │
  │  │ │ Français         │ 4     │ 20       │ ✅    │ [✏️] │  │ │
  │  │ │ Anglais          │ 2     │ 20       │ ✅    │ [✏️] │  │ │
  │  │ │ Histoire         │ 2     │ 10       │ ✅    │ [✏️] │  │ │
  │  │ │ Géographie       │ 2     │ 10       │ ✅    │ [✏️] │  │ │
  │  │ │ Éd. civique      │ 2     │ 10       │ ✅    │ [✏️] │  │ │
  │  │ │ Éd. physique     │ 2     │ 10       │ ✅    │ [✏️] │  │ │
  │  │ │ Religion         │ 1     │ 10       │ ✅    │ [✏️] │  │ │
  │  │ └──────────────────────────────────────────────────────┘  │ │
  │  │                                                            │ │
  │  │ [+ Ajouter matière]                                        │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🔬 SCIENTIFIQUE (Sc)                  [Gérer] [Suppr]      │ │
  │  │ Années : 3ème, 4ème, 5ème, 6ème                             │ │
  │  │ 9 matières configurées                                      │ │
  │  │ 8 classes · 246 élèves                                      │ │
  │  │                                                            │ │
  │  │ [▶ Voir les matières]                                      │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


SECTIONS STANDARD RDC
----------------------
Créer par défaut 6 sections avec templates :

1. **Tronc Commun (TC)** — 1ère et 2ème années
   Matières : Math, Physique, Chimie, Bio, Français, Anglais, Histoire, Géo, Éd. civique, Éd. physique, Religion

2. **Scientifique (Sc)** — 3ème à 6ème
   Matières : Math (coeff 5), Physique (4), Chimie (4), Bio (3), Français (3), Anglais (2), Informatique (2), Éd. civique (1), Éd. physique (1)

3. **Commerciale & Gestion (HCG)** — 3ème à 6ème
   Matières : Comptabilité (5), Gestion (4), Économie (4), Math commerciales (3), Français (3), Anglais (2), Informatique (2), Droit (2)

4. **Pédagogie (Péd)** — 3ème à 6ème
   Matières : Pédagogie générale (5), Psychologie (4), Didactique (4), Français (3), Math (3), Histoire (2), Géo (2)

5. **Littéraire (Lit)** — 3ème à 6ème
   Matières : Français (5), Littérature (4), Philosophie (4), Histoire (3), Géo (3), Anglais (3), Latin (2)

6. **Technique (Tech)** — 3ème à 6ème
   Matières : Techno mécanique (5), Techno électrique (5), Dessin technique (4), Math (3), Physique (3), Français (2)


MODAL AJOUT MATIÈRE
--------------------
  ┌─────────────────────────────────────────────┐
  │ AJOUTER UNE MATIÈRE — Scientifique          │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Nom de la matière * :                       │
  │ [Mathématiques                           ]  │
  │                                             │
  │ Code court * :                              │
  │ [MATH]                                      │
  │ Utilisé dans bulletins et rapports          │
  │                                             │
  │ Coefficient * :                             │
  │ [5] ⓘ Impact sur moyenne générale (1-10)    │
  │                                             │
  │ Notation sur * :                            │
  │ (•) 20 points                               │
  │ ( ) 10 points                               │
  │ ( ) 100 points                              │
  │                                             │
  │ Type de matière :                           │
  │ (•) Matière principale                      │
  │ ( ) Matière secondaire                      │
  │ ( ) Travaux pratiques                       │
  │                                             │
  │ [☑] Matière obligatoire (éliminatoire)      │
  │     Si échec → élève ajourné                │
  │                                             │
  │ [☑] Seuil éliminatoire                      │
  │     Note minimale : [10] / 20               │
  │                                             │
  │ [Annuler]              [Ajouter]            │
  └─────────────────────────────────────────────┘


APPELS API
-----------
GET /api/sections
POST /api/sections
PUT /api/sections/:id
DELETE /api/sections/:id
POST /api/sections/:id/subjects
PUT /api/subjects/:id
DELETE /api/subjects/:id


MODÈLE PRISMA
--------------
model Section {
  id            String   @id @default(uuid())
  schoolId      String
  school        School   @relation(fields: [schoolId], references: [id])
  
  name          String   // "Scientifique"
  code          String   // "Sc"
  annees        Int[]    // [3, 4, 5, 6]
  
  subjects      Subject[]
  classes       Class[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([schoolId, code])
}

model Subject {
  id                String   @id @default(uuid())
  sectionId         String
  section           Section  @relation(fields: [sectionId], references: [id])
  
  name              String   // "Mathématiques"
  code              String   // "MATH"
  coefficient       Int      // 1-10
  maxScore          Int      // 10, 20, ou 100
  
  type              SubjectType
  isRequired        Boolean  @default(true)
  hasThreshold      Boolean  @default(false)
  thresholdScore    Int?     // Note minimale si hasThreshold=true
  
  grades            Grade[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([sectionId, code])
}

enum SubjectType {
  PRINCIPALE
  SECONDAIRE
  TRAVAUX_PRATIQUES
}


RÈGLES MÉTIER
--------------
1. Impossible supprimer section avec classes
2. Coefficient min = 1, max = 10
3. Note sur 10, 20 ou 100
4. Seuil éliminatoire optionnel
```

---

# PROMPTS 4-5 : Résumés

**SCR-035 — Gestion Classes** ⭐⭐⭐⭐
- Création classes (ex: 4ScA, TC-1B)
- Attribution enseignants titulaires
- Attribution matières par enseignant
- Génération auto emploi du temps

**SCR-036 — Gestion Utilisateurs** ⭐⭐⭐
- CRUD utilisateurs (Admin, Préfet, Secrétaire, Enseignant)
- Attribution rôles granulaires
- Permissions spécifiques
- Réinitialisation mots de passe

---

*EduGoma 360 — Module Paramètres Complet (Partie 2/2) — © 2025*
