# 📦 EDUGOMA 360 — MODULE INVENTAIRE COMPLET
## Prompts SCR-045 à SCR-048 | Matériel, Bibliothèque, Salles, Maintenance

> **MODE D'EMPLOI :**
> Ce fichier contient **4 prompts indépendants**, un par écran.
> Exécute-les **dans l'ordre**, un à la fois dans ton IDE IA.
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> Attends la confirmation de l'IDE avant de passer au suivant.

---

## CONTEXTE GLOBAL (rappel rapide)

```
Projet     : EduGoma 360 — Gestion école secondaire, Goma, RDC
Stack      : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
Charts     : Recharts
State      : Zustand (auth) + TanStack Query (serveur)
Backend    : Express + Prisma + PostgreSQL
Palette    : Vert #1B5E20 (primary) | Or #F57F17 (accent) | Bleu #0D47A1 (info)
Monorepo   : packages/client + packages/server + packages/shared
Responsive : MOBILE-FIRST strict (Design System V3) — iPhone 12 = 390px

Module     : Inventaire
Écrans     : SCR-045 à SCR-048 (4 écrans)
Prérequis  : Module Settings (École, Classes)
Rôles      : PRÉFET (tous), SECRÉTAIRE (lecture + prêts biblio)
Complexité : ⭐⭐⭐⭐
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 4 — SCR-045 : GESTION MATÉRIEL SCOLAIRE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/inventory/MaterialPage.tsx
Route : /inventory/material
Accès : Protégé
Rôle minimum : SECRÉTAIRE


OBJECTIF
--------
Gérer le stock de matériel scolaire : tables, chaises, tableaux, équipements.
Suivi état, quantités, valeur totale, et alertes stock bas.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/inventory/MaterialPage.tsx              ← CRÉER
2. packages/client/src/components/inventory/MaterialCard.tsx         ← CRÉER
3. packages/client/src/components/inventory/AddMaterialModal.tsx     ← CRÉER
4. packages/client/src/components/inventory/StockMovementModal.tsx   ← CRÉER
5. packages/client/src/components/inventory/MaterialStatsCards.tsx   ← CRÉER
6. packages/client/src/hooks/useMaterial.ts                          ← CRÉER
7. packages/server/src/modules/inventory/material.routes.ts          ← CRÉER
8. packages/server/src/modules/inventory/material.controller.ts      ← CRÉER
9. packages/server/src/modules/inventory/material.service.ts         ← CRÉER


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ MATÉRIEL SCOLAIRE                    [+ Ajouter] [📊 Rapport]   │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ 📦 Total   │ │ ✅ Bon état│ │ ⚠️ Usé     │ │ ❌ HS      │   │
  │  │ articles   │ │            │ │            │ │            │   │
  │  │ 247        │ │ 198 (80%)  │ │ 38 (15%)   │ │ 11 (5%)    │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  Filtres : [Toutes catégories ▼] [Tous états ▼] [🔍 Rechercher] │
  │                                                                  │
  │  MOBILIER (89 articles)                                          │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🪑 Tables élèves                          [+] [⋮]          │ │
  │  │ Quantité : 142 unités                                      │ │
  │  │ État : ✅ 120 bonnes | ⚠️ 18 usées | ❌ 4 HS               │ │
  │  │ Valeur estimée : 4,260,000 FC                               │ │
  │  │ Dernière MAJ : 12/03/2026                                   │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🪑 Chaises élèves                         [+] [⋮]          │ │
  │  │ Quantité : 156 unités                                      │ │
  │  │ État : ✅ 140 bonnes | ⚠️ 12 usées | ❌ 4 HS               │ │
  │  │ Valeur estimée : 2,340,000 FC                               │ │
  │  │ ⚠️ Stock bas — en dessous du seuil minimum (160)           │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ÉQUIPEMENTS (47 articles)                                       │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🖥️ Ordinateurs                             [+] [⋮]          │ │
  │  │ Quantité : 24 unités                                       │ │
  │  │ État : ✅ 18 bonnes | ⚠️ 4 usées | ❌ 2 HS                 │ │
  │  │ Valeur estimée : 48,000,000 FC                              │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


CATÉGORIES MATÉRIEL
--------------------
6 catégories prédéfinies :

1. **Mobilier** (tables, chaises, bureaux, armoires, étagères)
2. **Équipements informatiques** (ordinateurs, imprimantes, projecteurs)
3. **Matériel pédagogique** (tableaux noirs/blancs, globes, microscopes)
4. **Fournitures** (craies, stylos, cahiers stock, papier)
5. **Équipements sportifs** (ballons, filets, matelas)
6. **Autre** (matériel divers)


MODAL AJOUT ARTICLE
--------------------
  ┌─────────────────────────────────────────────┐
  │ AJOUTER UN ARTICLE                          │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Désignation * :                             │
  │ [Tables élèves double                    ]  │
  │                                             │
  │ Catégorie * :                               │
  │ [Mobilier                            ▼]     │
  │                                             │
  │ Quantité totale * :                         │
  │ [142] unités                                │
  │                                             │
  │ Répartition état :                          │
  │ Bon état : [120]                            │
  │ Usé      : [18]                             │
  │ Hors service : [4]                          │
  │ ✓ Total : 142/142                           │
  │                                             │
  │ Valeur unitaire (FC) :                      │
  │ [30,000]                                    │
  │ Valeur totale : 4,260,000 FC                │
  │                                             │
  │ Seuil minimum * :                           │
  │ [160] unités                                │
  │ ⓘ Alerte si stock en dessous               │
  │                                             │
  │ Date d'acquisition :                        │
  │ [15/09/2023] 📅                             │
  │                                             │
  │ Localisation :                              │
  │ [Toutes les salles de classe            ]   │
  │                                             │
  │ Notes :                                     │
  │ [Achat financement FONER 2023           ]   │
  │                                             │
  │ [Annuler]              [Enregistrer]        │
  └─────────────────────────────────────────────┘


MODAL MOUVEMENT STOCK
-----------------------
Bouton [+] sur un article :

  ┌─────────────────────────────────────────────┐
  │ MOUVEMENT STOCK — Tables élèves             │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Stock actuel :                              │
  │ Bon état : 120 | Usé : 18 | HS : 4          │
  │                                             │
  │ Type de mouvement * :                       │
  │ ( ) Entrée (achat, don)                     │
  │ (•) Sortie (perte, vol, destruction)        │
  │ ( ) Changement état (bon → usé → HS)        │
  │                                             │
  │ Quantité * : [4]                            │
  │ État concerné * : [Bon état ▼]              │
  │                                             │
  │ Motif * :                                   │
  │ [Dégradation — tables cassées classe 4ScA ] │
  │                                             │
  │ Date * : [18/04/2026]                       │
  │                                             │
  │ Nouveau stock :                             │
  │ Bon état : 116 | Usé : 18 | HS : 8          │
  │ Total : 142 → 142 unités                    │
  │                                             │
  │ [Annuler]              [Enregistrer]        │
  └─────────────────────────────────────────────┘


ALERTES AUTOMATIQUES
---------------------
1. **Stock bas** (quantité < seuil minimum)
   → Badge orange sur article : "⚠️ Stock bas (156/160)"
   → Alerte dans Dashboard Direction

2. **Articles hors service > 10%**
   → Badge rouge : "❌ 12% HS — Action requise"

3. **Pas de mise à jour depuis 90 jours**
   → Badge gris : "⏰ Inventaire non vérifié depuis 3 mois"


APPELS API
-----------
GET /api/inventory/material
  Query params : category?, status?, search?
  Response 200 :
    {
      items: Array<{
        id: string,
        name: string,
        category: MaterialCategory,
        totalQty: number,
        goodQty: number,
        usedQty: number,
        brokenQty: number,
        unitValue: number,
        totalValue: number,
        minStock: number,
        isLowStock: boolean,
        location: string,
        lastUpdated: string,
        notes?: string
      }>,
      stats: {
        totalItems: number,
        goodItems: number,
        usedItems: number,
        brokenItems: number,
        totalValue: number
      }
    }

POST /api/inventory/material
  Body : { name, category, goodQty, usedQty, brokenQty, unitValue, minStock, location, notes }
  Response 201 : { item: MaterialItem }

POST /api/inventory/material/:id/movement
  Body : {
    type: 'ENTRY' | 'EXIT' | 'STATUS_CHANGE',
    quantity: number,
    fromStatus?: 'GOOD' | 'USED' | 'BROKEN',
    toStatus?: 'GOOD' | 'USED' | 'BROKEN',
    reason: string,
    date: string
  }
  Response 200 : { item: MaterialItem }


MODÈLE PRISMA
--------------
model MaterialItem {
  id          String   @id @default(uuid())
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])

  name        String
  category    MaterialCategory

  goodQty     Int      @default(0)
  usedQty     Int      @default(0)
  brokenQty   Int      @default(0)

  unitValue   Float    @default(0)
  minStock    Int      @default(0)

  location    String?
  acquiredAt  DateTime? @db.Date
  notes       String?

  movements   StockMovement[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([schoolId, category])
}

model StockMovement {
  id          String   @id @default(uuid())
  itemId      String
  item        MaterialItem @relation(fields: [itemId], references: [id])

  type        MovementType
  quantity    Int
  fromStatus  ItemStatus?
  toStatus    ItemStatus?
  reason      String
  date        DateTime @db.Date

  createdById String
  createdBy   User    @relation(fields: [createdById], references: [id])

  createdAt   DateTime @default(now())
}

enum MaterialCategory {
  MOBILIER
  INFORMATIQUE
  PEDAGOGIQUE
  FOURNITURES
  SPORT
  AUTRE
}

enum ItemStatus {
  GOOD
  USED
  BROKEN
}

enum MovementType {
  ENTRY
  EXIT
  STATUS_CHANGE
}


RÈGLES MÉTIER
--------------
1. Total = goodQty + usedQty + brokenQty (toujours cohérent)
2. Alerte si quantité < minStock
3. Valeur totale = (goodQty + usedQty) × unitValue
   (articles HS ne comptent pas dans valeur)
4. Historique mouvements conservé indéfiniment


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Liste matériel avec catégories
[ ] 4 cartes stats (total/bon/usé/HS)
[ ] Filtres catégorie + état fonctionnent
[ ] Modal ajout article fonctionne
[ ] Répartition état validée (total cohérent)
[ ] Modal mouvement stock (entrée/sortie/changement)
[ ] Badge alerte stock bas
[ ] Valeur totale calculée
[ ] Historique mouvements visible
[ ] Export Excel inventaire complet
[ ] Responsive mobile (mode carte)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 4 — SCR-046 : BIBLIOTHÈQUE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Fichier : packages/client/src/pages/inventory/LibraryPage.tsx
Route : /inventory/library
Rôle : SECRÉTAIRE


OBJECTIF
--------
Gérer le catalogue de la bibliothèque scolaire : livres, manuels, ressources.
Système de prêts aux élèves avec dates retour et suivi des retards.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/inventory/LibraryPage.tsx
2. packages/client/src/components/inventory/BookCard.tsx
3. packages/client/src/components/inventory/AddBookModal.tsx
4. packages/client/src/components/inventory/LoanModal.tsx
5. packages/client/src/components/inventory/ActiveLoansTab.tsx
6. packages/client/src/components/inventory/OverdueLoansAlert.tsx
7. packages/client/src/hooks/useLibrary.ts
8. packages/server/src/modules/inventory/library.routes.ts
9. packages/server/src/modules/inventory/library.service.ts


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ BIBLIOTHÈQUE                         [+ Ajouter livre] [🔍]     │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ 📚 Total   │ │ ✅ Dispos  │ │ 📖 Prêtés  │ │ ⚠️ Retard  │   │
  │  │ livres     │ │            │ │            │ │            │   │
  │  │ 342        │ │ 287 (84%)  │ │ 48 (14%)   │ │ 7 (2%)     │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  Onglets : [Catalogue] [Prêts actifs] [En retard] [Historique]  │
  │                                                                  │
  │  ONGLET CATALOGUE                                                │
  │                                                                  │
  │  Filtres : [Toutes matières ▼] [Tous niveaux ▼]                 │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 📗 Mathématiques 4ème                          [Prêter]    │ │
  │  │ Auteur : Programme EPSP RDC                               │ │
  │  │ Quantité : 28 ex. — Disponibles : 22 — Prêtés : 6         │ │
  │  │ Classes cibles : 4ScA, 4ScB, 4HCG-A                       │ │
  │  │ État général : Bon                                         │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 📘 Français 5ème                               [Prêter]    │ │
  │  │ Auteur : BACCALAURÉAT RDC                                  │ │
  │  │ Quantité : 15 ex. — Disponibles : 15 — Prêtés : 0         │ │
  │  │ Classes cibles : 5ScA, 5PédA, 5LitA                       │ │
  │  │ État général : Bon                                         │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ALERTE RETARDS                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ ⚠️ 7 livres en retard de retour                            │ │
  │  │ Retard le plus long : AMISI Jean (42 jours)                │ │
  │  │ [Voir les retards] [Envoyer rappels SMS]                   │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


MODAL AJOUT LIVRE
------------------
  ┌─────────────────────────────────────────────┐
  │ AJOUTER UN LIVRE                            │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Titre * :                                   │
  │ [Mathématiques 4ème                      ]  │
  │                                             │
  │ Auteur / Éditeur :                          │
  │ [Programme EPSP RDC                      ]  │
  │                                             │
  │ ISBN (optionnel) :                          │
  │ [978-2-01-135120-4                       ]  │
  │                                             │
  │ Matière * :                                 │
  │ [Mathématiques                       ▼]     │
  │                                             │
  │ Niveau(x) scolaire(s) * :                   │
  │ [☐ TC-1] [☐ TC-2] [☑ 4ème] [☐ 5ème] [☐ 6ème]│
  │                                             │
  │ Quantité totale * :                         │
  │ [28] exemplaires                            │
  │                                             │
  │ État général * :                            │
  │ (•) Bon  ( ) Passable  ( ) Mauvais          │
  │                                             │
  │ Valeur unitaire (FC) :                      │
  │ [25,000]                                    │
  │                                             │
  │ Date d'acquisition :                        │
  │ [01/09/2024]                                │
  │                                             │
  │ [Annuler]              [Enregistrer]        │
  └─────────────────────────────────────────────┘


MODAL PRÊT LIVRE
-----------------
  ┌─────────────────────────────────────────────┐
  │ PRÊT — Mathématiques 4ème                   │
  │ 22 exemplaires disponibles                  │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Élève * :                                   │
  │ [Rechercher élève...                   ▼]   │
  │ → AMISI Jean-Baptiste (4ScA)                │
  │                                             │
  │ Exemplaire N° :                             │
  │ [Ex. 07 ▼]  (auto-assigné si non précisé)  │
  │                                             │
  │ Date de prêt * :                            │
  │ [18/04/2026]                                │
  │                                             │
  │ Date de retour prévue * :                   │
  │ [18/06/2026] (défaut: fin trimestre)        │
  │                                             │
  │ Notes :                                     │
  │ [Légère déchirure page 24 constatée      ]  │
  │                                             │
  │ [Annuler]              [Enregistrer prêt]   │
  └─────────────────────────────────────────────┘


ONGLET PRÊTS ACTIFS
---------------------
  ┌──────────────────────────────────────────────────────────┐
  │ Livre               │ Élève       │ Prêté le │ Retour   │
  ├─────────────────────┼─────────────┼──────────┼──────────┤
  │ Math 4ème (Ex. 07)  │ AMISI Jean  │ 18/04/26 │ 18/06/26 │
  │                     │ 4ScA        │          │ ✅ Dans les temps│
  │ [Retourner]                                              │
  ├─────────────────────┼─────────────┼──────────┼──────────┤
  │ Français 3ème       │ CIZA Pierre │ 01/02/26 │ 01/04/26 │
  │ (Ex. 03)            │ 3HCG-B      │          │ 🔴 42j retard│
  │ [Retourner] [SMS Rappel]                                 │
  └──────────────────────────────────────────────────────────┘


RETOUR LIVRE
-------------
Modal confirmation retour :

  ┌─────────────────────────────────────────────┐
  │ RETOUR DE LIVRE                             │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Livre : Mathématiques 4ème (Ex. 07)         │
  │ Élève : AMISI Jean (4ScA)                   │
  │ Prêté le : 18/04/2026                       │
  │ Retour prévu : 18/06/2026                   │
  │ Retour effectif : 20/04/2026 (dans les temps)│
  │                                             │
  │ État au retour * :                          │
  │ (•) Bon  ( ) Dégradé  ( ) Endommagé         │
  │                                             │
  │ Si dégradé/endommagé :                      │
  │ [Coût réparation/remplacement (FC)       ]  │
  │ → À régler par l'élève                      │
  │                                             │
  │ [Annuler]              [Confirmer retour]   │
  └─────────────────────────────────────────────┘


APPELS API
-----------
GET /api/inventory/books
  Query : matiere?, niveau?, disponible?
  Response 200 :
    {
      books: Array<{
        id, titre, auteur, isbn, matiere, niveaux,
        totalQty, availableQty, loanedQty,
        etat, unitValue, acquiredAt
      }>,
      stats: { total, available, loaned, overdue }
    }

POST /api/inventory/books/:id/loan
  Body : { studentId, exemplaire?, datePret, dateRetourPrevue, notes? }
  Response 201 : { loan: BookLoan }

POST /api/inventory/loans/:id/return
  Body : { etatRetour: 'BON' | 'DEGRADE' | 'ENDOMMAGE', coutReparation? }
  Response 200 : { loan: BookLoan }


MODÈLE PRISMA
--------------
model Book {
  id            String   @id @default(uuid())
  schoolId      String
  school        School   @relation(fields: [schoolId], references: [id])

  titre         String
  auteur        String?
  isbn          String?
  matiere       String
  niveaux       Int[]    // [4, 5, 6]

  totalQty      Int
  availableQty  Int
  etat          BookCondition

  unitValue     Float?
  acquiredAt    DateTime? @db.Date

  loans         BookLoan[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([schoolId, matiere])
}

model BookLoan {
  id              String   @id @default(uuid())
  bookId          String
  book            Book     @relation(fields: [bookId], references: [id])

  studentId       String
  student         Student  @relation(fields: [studentId], references: [id])

  exemplaire      String?  // N° exemplaire
  notes           String?

  loanDate        DateTime @db.Date
  expectedReturn  DateTime @db.Date
  actualReturn    DateTime? @db.Date

  etatRetour      BookCondition?
  coutReparation  Float?

  status          LoanStatus @default(ACTIVE)

  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])

  createdAt       DateTime @default(now())

  @@index([bookId, status])
  @@index([studentId, status])
}

enum BookCondition { BON PASSABLE MAUVAIS }
enum LoanStatus { ACTIVE RETURNED OVERDUE }


RÈGLES MÉTIER
--------------
1. availableQty = totalQty - loanedQty (toujours cohérent)
2. Durée max prêt : fin du trimestre actuel
3. CRON quotidien : marque OVERDUE si date dépassée
4. Alerte si livre prêté > 30 jours sans retour
5. SMS rappel automatique à J-7 et J+1 retard


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Catalogue livres avec filtres
[ ] 4 cartes stats (total/dispo/prêtés/retard)
[ ] Modal ajout livre fonctionne
[ ] Modal prêt avec sélection élève
[ ] Date retour auto (fin trimestre)
[ ] Onglet prêts actifs
[ ] Badge retard (jours) calculé
[ ] Modal retour avec état livre
[ ] Coût réparation si endommagé
[ ] CRON marquage OVERDUE quotidien
[ ] SMS rappel automatique J-7
[ ] Historique prêts par livre
[ ] Historique prêts par élève
[ ] Responsive mobile parfait
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 4 — SCR-047 : GESTION SALLES & INFRASTRUCTURES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Fichier : packages/client/src/pages/inventory/RoomsPage.tsx
Route : /inventory/rooms
Rôle : PRÉFET


OBJECTIF
--------
Gérer toutes les salles et infrastructures de l'école :
salles de classe, laboratoires, bureaux, terrains.
Suivi capacité, état, occupation et attribution aux classes.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/inventory/RoomsPage.tsx
2. packages/client/src/components/inventory/RoomCard.tsx
3. packages/client/src/components/inventory/AddRoomModal.tsx
4. packages/client/src/components/inventory/RoomOccupancyView.tsx
5. packages/client/src/hooks/useRooms.ts
6. packages/server/src/modules/inventory/rooms.routes.ts
7. packages/server/src/modules/inventory/rooms.service.ts


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ SALLES & INFRASTRUCTURES              [+ Ajouter salle]          │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ 🏫 Total   │ │ ✅ Bonnes  │ │ ⚠️ Dégradées│ │ ❌ Fermées │   │
  │  │ salles     │ │            │ │            │ │            │   │
  │  │ 28         │ │ 22 (79%)   │ │ 4 (14%)    │ │ 2 (7%)     │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  Vue : [📋 Liste] [🗺️ Plan]      Filtres : [Tous types ▼]       │
  │                                                                  │
  │  SALLES DE CLASSE (16)                                           │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🏫 Salle 101                              [Modifier] [⋮]   │ │
  │  │ Capacité : 40 élèves • Occupation actuelle : 4ScA (32 él.) │ │
  │  │ État : ✅ Bon état                                          │ │
  │  │ Équipements : Tableau noir ✓ | Ventilateurs ✓ | Prises ✓   │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🏫 Salle 102                              [Modifier] [⋮]   │ │
  │  │ Capacité : 40 élèves • Occupation actuelle : TC-1B (32 él.)│ │
  │  │ État : ⚠️ Dégradée (toiture à réparer)                     │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  LABORATOIRES (3)                                                │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🔬 Labo Sciences                          [Modifier] [⋮]   │ │
  │  │ Capacité : 24 élèves • Partagé entre : 4ScA, 4ScB          │ │
  │  │ État : ✅ Bon état                                          │ │
  │  │ Équipements : Microscopes (8) ✓ | Paillasses ✓ | Gaz ✓    │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


TYPES DE SALLES
-----------------
1. Salle de classe
2. Laboratoire (Sciences, Informatique, Langues)
3. Bureau (Préfet, Secrétariat, Économat)
4. Salle des professeurs
5. Bibliothèque
6. Terrain sportif
7. Réfectoire/Cantine
8. Autre


MODAL AJOUT SALLE
------------------
  ┌─────────────────────────────────────────────┐
  │ AJOUTER UNE SALLE                           │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Nom/Numéro * :                              │
  │ [Salle 201                               ]  │
  │                                             │
  │ Type * :                                    │
  │ [Salle de classe                     ▼]     │
  │                                             │
  │ Capacité maximale * :                       │
  │ [40] élèves                                 │
  │                                             │
  │ État actuel * :                             │
  │ (•) Bon état  ( ) Dégradée  ( ) Fermée      │
  │                                             │
  │ Bâtiment :                                  │
  │ [Bâtiment A — 2ème étage               ]    │
  │                                             │
  │ Classe assignée (optionnel) :               │
  │ [4ScA                                ▼]     │
  │                                             │
  │ Équipements disponibles :                   │
  │ [☑] Tableau noir/blanc                      │
  │ [☑] Ventilateurs                            │
  │ [☑] Prises électriques                      │
  │ [☐] Projecteur                              │
  │ [☐] Climatisation                           │
  │ [☐] Connexion internet                      │
  │                                             │
  │ Description état :                          │
  │ [Toiture en bon état, peinture récente   ]  │
  │                                             │
  │ [Annuler]              [Enregistrer]        │
  └─────────────────────────────────────────────┘


VUE OCCUPATION
---------------
Tableau de toutes les salles avec taux d'occupation :

  ┌──────────────────────────────────────────────────────────┐
  │ Salle   │ Capacité │ Classe   │ Effectif │ Occupation   │
  ├─────────┼──────────┼──────────┼──────────┼──────────────┤
  │ S101    │ 40       │ 4ScA     │ 32       │ ████████ 80% │
  │ S102    │ 40       │ TC-1B    │ 38       │ █████████ 95%│
  │ S201    │ 40       │ 5PédA    │ 28       │ ███████ 70%  │
  │ S301    │ 40       │ —        │ —        │ ░░░░░░░  0%  │
  │ Lab Sc  │ 24       │ Partagé  │ —        │ ████     —   │
  └──────────────────────────────────────────────────────────┘


APPELS API
-----------
GET /api/inventory/rooms
  Query : type?, status?
  Response 200 :
    {
      rooms: Array<{
        id, name, type, capacity, status,
        building, assignedClass?, currentOccupancy,
        equipments: string[], stateDescription,
        maintenanceRequests: number
      }>,
      stats: { total, good, degraded, closed }
    }

POST /api/inventory/rooms
  Body : { name, type, capacity, status, building, classId?, equipments, stateDescription }
  Response 201 : { room: Room }

PUT /api/inventory/rooms/:id
  Body : Partiel (mêmes champs)
  Response 200 : { room: Room }


MODÈLE PRISMA
--------------
model Room {
  id                String   @id @default(uuid())
  schoolId          String
  school            School   @relation(fields: [schoolId], references: [id])

  name              String       // "Salle 101", "Labo Sciences"
  type              RoomType
  capacity          Int
  status            RoomStatus   @default(GOOD)

  building          String?      // "Bâtiment A"
  floor             String?      // "2ème étage"

  assignedClassId   String?      // Classe principale
  assignedClass     Class?       @relation(fields: [assignedClassId], references: [id])

  equipments        String[]     // ["TABLEAU", "VENTILATEUR"]
  stateDescription  String?

  maintenanceRequests MaintenanceRequest[]
  timetableSlots    TimetableSlot[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([schoolId, name])
  @@index([schoolId, type, status])
}

enum RoomType {
  CLASSROOM
  LABORATORY
  OFFICE
  TEACHERS_ROOM
  LIBRARY
  SPORTS
  CAFETERIA
  OTHER
}

enum RoomStatus {
  GOOD
  DEGRADED
  CLOSED
}


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Liste salles par type
[ ] 4 cartes stats
[ ] Filtres type + état
[ ] Modal ajout salle avec équipements
[ ] Assignation classe à salle
[ ] Vue taux d'occupation
[ ] Barre progression visuelle
[ ] Lien avec emploi du temps (Salle utilisée quand)
[ ] Salle CLOSED bloquée dans emploi du temps
[ ] Export liste salles
[ ] Responsive mobile parfait
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4 / 4 — SCR-048 : MAINTENANCE & RÉPARATIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Fichier : packages/client/src/pages/inventory/MaintenancePage.tsx
Route : /inventory/maintenance
Rôle : PRÉFET


OBJECTIF
--------
Suivre toutes les demandes de maintenance et réparations de l'école :
signalement pannes, suivi interventions, coûts et historique.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/inventory/MaintenancePage.tsx
2. packages/client/src/components/inventory/MaintenanceRequestCard.tsx
3. packages/client/src/components/inventory/CreateRequestModal.tsx
4. packages/client/src/components/inventory/UpdateStatusModal.tsx
5. packages/client/src/hooks/useMaintenance.ts
6. packages/server/src/modules/inventory/maintenance.routes.ts
7. packages/server/src/modules/inventory/maintenance.service.ts


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ MAINTENANCE & RÉPARATIONS          [+ Nouvelle demande]          │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ 📋 Total   │ │ 🔴 Urgents │ │ ⏳ En cours│ │ ✅ Résolus │   │
  │  │ demandes   │ │            │ │            │ │ ce mois    │   │
  │  │ 34         │ │ 3          │ │ 8          │ │ 23         │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  Filtres : [Tous statuts ▼] [Toutes urgences ▼]                 │
  │                                                                  │
  │  EN ATTENTE (5 demandes)                                         │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🔴 URGENT                           [Voir] [Prendre en ch.]│ │
  │  │ Fuite d'eau — Toiture Salle 102                            │ │
  │  │ Signalé par : MUKASA Jean • 15/04/2026                     │ │
  │  │ Impact : Salle inutilisable si pluie                        │ │
  │  │ ⏰ En attente depuis : 3 jours                              │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🟠 NORMAL                           [Voir] [Prendre en ch.]│ │
  │  │ Tableau noir fendu — Salle 205                             │ │
  │  │ Signalé par : CIZA Pierre • 10/04/2026                     │ │
  │  │ Impact : Tableau difficile à utiliser                       │ │
  │  │ ⏰ En attente depuis : 8 jours                              │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  EN COURS (3 demandes)                                           │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🟡 EN COURS                      [Voir] [Marquer résolu]   │ │
  │  │ Remplacement portes — Bâtiment B                           │ │
  │  │ Technicien : BAHATI Paul • Début : 12/04/2026              │ │
  │  │ Coût estimé : 450,000 FC                                   │ │
  │  │ Avancement : [████████░░░░] 65%                            │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


NIVEAUX D'URGENCE
------------------
1. 🔴 **URGENT** : Menace sécurité, salle inutilisable
   → Notification immédiate Préfet + Direction
   → Délai résolution : 24-48h

2. 🟠 **NORMAL** : Gêne importante mais salle utilisable
   → Délai résolution : 1 semaine

3. 🟡 **FAIBLE** : Inconfort mineur, pas bloquant
   → Délai résolution : 1 mois


MODAL NOUVELLE DEMANDE
-----------------------
  ┌─────────────────────────────────────────────┐
  │ NOUVELLE DEMANDE DE MAINTENANCE             │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Titre * :                                   │
  │ [Fuite d'eau toiture Salle 102           ]  │
  │                                             │
  │ Catégorie * :                               │
  │ (•) Plomberie  ( ) Électricité              │
  │ ( ) Menuiserie ( ) Peinture                 │
  │ ( ) Informatique ( ) Autre                  │
  │                                             │
  │ Lieu concerné * :                           │
  │ [Salle 102                           ▼]     │
  │ ou préciser : [Toiture côté est          ]  │
  │                                             │
  │ Niveau d'urgence * :                        │
  │ (•) 🔴 Urgent   ( ) 🟠 Normal   ( ) 🟡 Faible│
  │                                             │
  │ Description détaillée * :                   │
  │ [Fuite apparue après les pluies du 14/04.  │
  │  Eau coule directement sur les pupitres.   │
  │  Salle inutilisable par temps de pluie.]    │
  │                                             │
  │ Photo (optionnel) :                         │
  │ [📷 Ajouter photo]                          │
  │                                             │
  │ Coût estimé (optionnel) :                   │
  │ [____________] FC                           │
  │                                             │
  │ [Annuler]              [Soumettre]          │
  └─────────────────────────────────────────────┘


MODAL MISE À JOUR STATUT
--------------------------
  ┌─────────────────────────────────────────────┐
  │ MISE À JOUR — Fuite toiture Salle 102       │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Nouveau statut * :                          │
  │ ( ) En attente                              │
  │ (•) En cours                                │
  │ ( ) Résolu                                  │
  │ ( ) Annulé (non pertinent)                  │
  │                                             │
  │ Technicien/Prestataire :                    │
  │ [BAHATI Paul — Plombier                  ]  │
  │                                             │
  │ Date début intervention :                   │
  │ [18/04/2026]                                │
  │                                             │
  │ Date fin prévue :                           │
  │ [20/04/2026]                                │
  │                                             │
  │ Coût réel (FC) :                            │
  │ [350,000]                                   │
  │                                             │
  │ Notes intervention :                        │
  │ [Remplacement de 3 tôles ondulées et      │
  │  colmatage des joints défectueux.]          │
  │                                             │
  │ [Annuler]              [Mettre à jour]      │
  └─────────────────────────────────────────────┘


APPELS API
-----------
GET /api/inventory/maintenance
  Query : status?, urgency?, roomId?
  Response 200 :
    {
      requests: Array<{
        id, titre, category, urgency, status,
        room: { name }, location,
        description, photoUrl?,
        estimatedCost?, actualCost?,
        technicien?, startDate?, endDate?,
        progress: number,
        notes?,
        reportedBy: { nom },
        createdAt
      }>,
      stats: { total, urgent, inProgress, resolvedThisMonth }
    }

POST /api/inventory/maintenance
  Body : {
    titre, category, roomId?, location,
    urgency, description, photoFile?,
    estimatedCost?
  }
  Response 201 : { request: MaintenanceRequest }

PUT /api/inventory/maintenance/:id/status
  Body : {
    status, technicien?, startDate?,
    endDate?, actualCost?, notes?, progress?
  }
  Response 200 : { request: MaintenanceRequest }


MODÈLE PRISMA
--------------
model MaintenanceRequest {
  id            String   @id @default(uuid())
  schoolId      String
  school        School   @relation(fields: [schoolId], references: [id])

  titre         String
  category      MaintenanceCategory
  urgency       UrgencyLevel

  roomId        String?
  room          Room?    @relation(fields: [roomId], references: [id])
  location      String?  // Précision localisation

  description   String
  photoUrl      String?

  status        MaintenanceStatus @default(PENDING)

  technicien    String?
  estimatedCost Float?
  actualCost    Float?

  startDate     DateTime? @db.Date
  endDate       DateTime? @db.Date
  progress      Int       @default(0)  // 0-100%

  notes         String?

  reportedById  String
  reportedBy    User     @relation(fields: [reportedById], references: [id])

  resolvedAt    DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([schoolId, status, urgency])
  @@index([roomId])
}

enum MaintenanceCategory {
  PLOMBERIE
  ELECTRICITE
  MENUISERIE
  PEINTURE
  INFORMATIQUE
  AUTRE
}

enum UrgencyLevel {
  URGENT
  NORMAL
  LOW
}

enum MaintenanceStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  CANCELLED
}


RÈGLES MÉTIER
--------------
1. URGENT → notification immédiate Préfet (email + SMS)
2. Alerte si demande PENDING > 7 jours (NORMAL) ou > 2 jours (URGENT)
3. Coût total maintenance calculé par période
4. Salle marquée comme DEGRADED ou CLOSED auto si demande URGENT non résolue > 48h
5. Photo stockée localement (max 5MB, JPG/PNG)


NOTIFICATIONS
--------------
1. Nouvelle demande URGENT :
   - SMS Préfet : "🔴 Urgence maintenance : {titre}. Action requise."
   - Email avec photo si disponible

2. Demande en retard (CRON quotidien) :
   - Si URGENT non résolu > 48h → alerte critique dashboard
   - Si NORMAL non résolu > 7j → rappel Préfet


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Liste demandes avec filtres
[ ] 4 cartes stats (total/urgent/en cours/résolus)
[ ] Tri par urgence (Urgent en haut)
[ ] Modal création demande fonctionne
[ ] Upload photo optionnel
[ ] Modal mise à jour statut
[ ] Barre progression visible
[ ] Coûts estimé + réel saisis
[ ] Notification SMS/email si URGENT
[ ] CRON alertes retards (CRON quotidien)
[ ] Historique résolutions
[ ] Coût total maintenance (mois/année)
[ ] Responsive mobile parfait
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RÉCAPITULATIF MODULE INVENTAIRE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| N°  | Écran | Fonction | Fichiers | Complexité |
|-----|-------|----------|----------|------------|
| 045 | Matériel Scolaire | Stock, mouvements, alertes | 9 | ⭐⭐⭐⭐ |
| 046 | Bibliothèque | Catalogue, prêts, retards | 9 | ⭐⭐⭐⭐ |
| 047 | Salles & Infras | Occupation, attribution | 7 | ⭐⭐⭐ |
| 048 | Maintenance | Demandes, suivi, coûts | 7 | ⭐⭐⭐⭐ |

**Total : 4 écrans, 32 fichiers**

---

*EduGoma 360 — Module Inventaire Complet — © 2026*
