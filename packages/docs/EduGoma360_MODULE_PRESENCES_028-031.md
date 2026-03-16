# 📅 EDUGOMA 360 — MODULE PRÉSENCES COMPLET
## Prompts SCR-028 à SCR-031 | Appel quotidien, Absences, Justificatifs, Rapports

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
Offline    : Dexie.js + Service Worker
Backend    : Express + Prisma + PostgreSQL
Palette    : Vert #1B5E20 (primary) | Or #F57F17 (accent) | Bleu #0D47A1 (info)
Monorepo   : packages/client + packages/server + packages/shared

Module     : Gestion des Présences
Écrans     : SCR-028 à SCR-031 (4 écrans)
Prérequis  : Module Élèves validé
Rôles      : Enseignant (appel), Préfet (validation), Secrétaire (rapports)
Complexité : ⭐⭐⭐⭐
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 4 — SCR-028 : APPEL QUOTIDIEN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/attendance/DailyRollCallPage.tsx
Route : /attendance/roll-call
Accès : Protégé (authentification requise)
Rôle minimum requis : ENSEIGNANT


OBJECTIF
--------
Créer l'écran d'appel quotidien permettant à un enseignant de marquer
les présences/absences de ses élèves de manière rapide et intuitive.
L'écran doit fonctionner OFFLINE avec synchronisation automatique.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/attendance/DailyRollCallPage.tsx          ← CRÉER (composant principal)
2. packages/client/src/components/attendance/ClassSelector.tsx         ← CRÉER (sélecteur classe)
3. packages/client/src/components/attendance/AttendanceGrid.tsx        ← CRÉER (grille élèves)
4. packages/client/src/components/attendance/StudentAttendanceRow.tsx  ← CRÉER (ligne élève)
5. packages/client/src/components/attendance/QuickStats.tsx            ← CRÉER (stats rapides)
6. packages/client/src/hooks/useAttendance.ts                          ← CRÉER (hook TanStack Query)
7. packages/client/src/lib/offline/attendanceQueue.ts                  ← CRÉER (queue offline)
8. packages/server/src/modules/attendance/attendance.routes.ts         ← CRÉER
9. packages/server/src/modules/attendance/attendance.controller.ts     ← CRÉER
10. packages/server/src/modules/attendance/attendance.service.ts       ← CRÉER
11. packages/shared/src/types/attendance.ts                            ← CRÉER (types partagés)


UI — STRUCTURE VISUELLE
------------------------
L'écran est divisé en 3 zones principales :

  ┌──────────────────────────────────────────────────────────────────┐
  │ APPEL QUOTIDIEN                         [🟢 Connecté]   [👤]     │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  Classe : [4ème Scientifique A ▼]    Date : [26/02/2026 ▼]      │
  │  Période : [Matin (7h30-12h30) ▼]                                │
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ Total      │ │ Présents   │ │ Absents    │ │ En retard  │   │
  │  │ 32 élèves  │ │ 28 (88%)   │ │ 3 (9%)     │ │ 1 (3%)     │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  Actions rapides : [✓ Tous présents] [✗ Tous absents]           │
  │                                                                  │
  ├──────────────────────────────────────────────────────────────────┤
  │ N°  │ Photo │ Matricule        │ Nom               │ Statut     │
  ├─────┼───────┼──────────────────┼───────────────────┼────────────┤
  │ 1   │ [📷]  │ NK-GOM-ISS-0234  │ AMISI Jean-B.     │ [P][A][R]  │
  │ 2   │ [📷]  │ NK-GOM-ISS-0235  │ BAHATI Marie      │ [P][A][R]  │
  │ 3   │ [📷]  │ NK-GOM-ISS-0236  │ CIZA Pierre       │ [P][A][R]  │
  │ ... │       │                  │                   │            │
  ├──────────────────────────────────────────────────────────────────┤
  │ [← Précédent] [Enregistrer] [Enregistrer & Fermer] [Suivant →]  │
  └──────────────────────────────────────────────────────────────────┘


ZONE 1 — EN-TÊTE AVEC FILTRES
-------------------------------
3 sélecteurs principaux :

1. Sélecteur Classe
   - Dropdown affichant les classes où l'enseignant enseigne
   - Format : "4ème Scientifique A (32 élèves)"
   - Si enseignant titulaire : sa classe en premier
   - Si enseignant matière : toutes ses classes
   - Icône 🏫 devant le nom

2. Sélecteur Date
   - Date picker (shadcn/ui Calendar)
   - Par défaut : aujourd'hui
   - Désactivé pour dates futures
   - Indication visuelle si appel déjà fait : badge vert "✓ Fait"

3. Sélecteur Période
   - Radio buttons : Matin | Après-midi | Soir (si école du soir)
   - Par défaut : selon l'heure actuelle
     * Avant 12h30 → Matin
     * 12h30-17h → Après-midi
     * Après 17h → Soir

Indicateur connexion :
  - Badge vert "🟢 Connecté" si online
  - Badge orange "🟠 Hors ligne" si offline avec compteur sync


ZONE 2 — STATISTIQUES RAPIDES
-------------------------------
4 cartes avec icônes et pourcentages :

Carte 1 — Total élèves
  Icône : 👥
  Valeur : 32 élèves
  Couleur : Gris #757575

Carte 2 — Présents
  Icône : ✅
  Valeur : 28 (88%)
  Couleur : Vert #1B5E20
  Calcul temps réel selon les statuts

Carte 3 — Absents
  Icône : ❌
  Valeur : 3 (9%)
  Couleur : Rouge #C62828
  Calcul temps réel

Carte 4 — En retard
  Icône : ⏰
  Valeur : 1 (3%)
  Couleur : Orange #F57F17
  Calcul temps réel

Actions rapides (boutons secondaires) :
  - "✓ Tous présents" → marque tous comme présents en 1 clic
  - "✗ Tous absents" → marque tous comme absents (cas grève, etc.)


ZONE 3 — GRILLE DES ÉLÈVES
---------------------------
Tableau responsive avec colonnes :

N° | Photo | Matricule | Nom | Statut

Colonne Statut = 3 boutons toggle :
  [P] Présent   → background vert si actif
  [A] Absent    → background rouge si actif
  [R] Retard    → background orange si actif

Comportement :
  - Un seul statut actif à la fois (radio buttons visuels)
  - Clic rapide pour basculer
  - Transition smooth (200ms)
  - Si "Absent" ou "Retard" → petite icône "+" pour ajouter remarque


LIGNE ÉLÈVE — COMPOSANT StudentAttendanceRow.tsx
--------------------------------------------------
Structure d'une ligne :

  ┌────────────────────────────────────────────────────────────────┐
  │ 1  [📷]  NK-GOM-ISS-0234  AMISI Jean-Baptiste  [P✓][A ][R ]    │
  └────────────────────────────────────────────────────────────────┘

Props :
  interface StudentAttendanceRowProps {
    index: number
    student: {
      id: string
      matricule: string
      nom: string
      postNom: string
      prenom?: string
      photoUrl?: string
    }
    currentStatus?: 'PRESENT' | 'ABSENT' | 'LATE'
    hasRemark: boolean
    onStatusChange: (studentId: string, status: AttendanceStatus) => void
    onAddRemark: (studentId: string) => void
  }

Boutons statut :
  - Bouton P (Présent) :
      className={cn(
        "px-4 py-2 rounded-md font-medium transition-all",
        currentStatus === 'PRESENT' 
          ? "bg-green-600 text-white shadow-lg" 
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
      onClick={() => onStatusChange(student.id, 'PRESENT')}

  - Bouton A (Absent) :
      currentStatus === 'ABSENT' → bg-red-600
      Affiche icône "+" si sélectionné pour ajouter remarque

  - Bouton R (Retard) :
      currentStatus === 'LATE' → bg-orange-600
      Affiche heure de retard si présente


MODAL REMARQUE (si Absent ou Retard)
--------------------------------------
Ouverte par clic sur icône "+" :

  ┌─────────────────────────────────────────────────┐
  │ REMARQUE — AMISI Jean-Baptiste                  │
  ├─────────────────────────────────────────────────┤
  │                                                 │
  │ Type :                                          │
  │ ( ) Absence justifiée                           │
  │ (•) Absence non justifiée                       │
  │ ( ) Retard justifié                             │
  │ ( ) Retard non justifié                         │
  │                                                 │
  │ Motif (optionnel) :                             │
  │ [____________________________________]          │
  │                                                 │
  │ Si retard, heure d'arrivée :                    │
  │ [08:45]                                         │
  │                                                 │
  │ [Annuler]              [Enregistrer]            │
  └─────────────────────────────────────────────────┘


VALIDATION ET ENREGISTREMENT
------------------------------
Bouton "Enregistrer" (en bas de page) :
  - Désactivé si aucun changement
  - Active si au moins 1 statut modifié
  - Affiche spinner pendant l'enregistrement
  - Toast de confirmation : "✓ Appel enregistré (28 présents, 3 absents, 1 retard)"

Bouton "Enregistrer & Fermer" :
  - Même comportement + redirection vers /attendance après succès

Validation avant enregistrement :
  - Vérifier que TOUS les élèves ont un statut
  - Si élèves sans statut → modal confirmation :
      "3 élèves n'ont pas de statut. Les marquer comme absents ?"
      [Non, revenir] [Oui, marquer absents]


MODE OFFLINE
-------------
Fichier : packages/client/src/lib/offline/attendanceQueue.ts

Interface Dexie.js :
  class AttendanceDatabase extends Dexie {
    attendanceQueue: Table<AttendanceQueueItem>
    
    constructor() {
      super('EduGomaAttendance')
      this.version(1).stores({
        attendanceQueue: '++id, date, classId, synced'
      })
    }
  }
  
  interface AttendanceQueueItem {
    id?: number
    date: string          // ISO date
    classId: string
    period: 'MORNING' | 'AFTERNOON' | 'EVENING'
    records: Array<{
      studentId: string
      status: 'PRESENT' | 'ABSENT' | 'LATE'
      remark?: string
      arrivalTime?: string  // Si retard
    }>
    synced: boolean
    createdAt: string
  }

Logique offline :
  1. Vérifier navigator.onLine
  2. Si offline → sauvegarder dans Dexie avec synced=false
  3. Badge orange "🟠 Hors ligne · 3 en attente"
  4. Au retour connexion → sync automatique en background
  5. Toast : "✓ 3 appels synchronisés"


APPELS API
-----------
GET /api/attendance/daily
  Query params :
    - classId: string (UUID)
    - date: string (ISO date, ex: 2026-02-26)
    - period: 'MORNING' | 'AFTERNOON' | 'EVENING'
  
  Response 200 :
    {
      classId: string,
      className: string,
      date: string,
      period: string,
      students: Array<{
        studentId: string,
        student: {
          id: string,
          matricule: string,
          nom: string,
          postNom: string,
          prenom?: string,
          photoUrl?: string
        },
        status?: 'PRESENT' | 'ABSENT' | 'LATE',
        remark?: string,
        arrivalTime?: string,
        isJustified: boolean
      }>,
      stats: {
        total: number,
        present: number,
        absent: number,
        late: number
      },
      isLocked: boolean  // Si verrouillé par Préfet
    }

POST /api/attendance/daily
  Body : {
    classId: string,
    date: string (ISO),
    period: 'MORNING' | 'AFTERNOON' | 'EVENING',
    records: Array<{
      studentId: string,
      status: 'PRESENT' | 'ABSENT' | 'LATE',
      remark?: string,
      arrivalTime?: string,
      isJustified: boolean
    }>
  }
  
  Response 201 :
    {
      message: "Appel enregistré avec succès",
      attendanceId: string,
      stats: { present: number, absent: number, late: number }
    }


MODÈLE DE DONNÉES PRISMA
--------------------------
model Attendance {
  id            String   @id @default(uuid())
  schoolId      String
  school        School   @relation(fields: [schoolId], references: [id])
  
  classId       String
  class         Class    @relation(fields: [classId], references: [id])
  
  date          DateTime @db.Date
  period        AttendancePeriod
  
  teacherId     String
  teacher       User     @relation("TeacherAttendances", fields: [teacherId], references: [id])
  
  records       AttendanceRecord[]
  
  isLocked      Boolean  @default(false)  // Verrouillé par Préfet
  lockedBy      String?
  lockedAt      DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([classId, date, period])
  @@index([date, classId])
}

model AttendanceRecord {
  id            String   @id @default(uuid())
  attendanceId  String
  attendance    Attendance @relation(fields: [attendanceId], references: [id], onDelete: Cascade)
  
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  
  status        AttendanceStatus
  remark        String?
  arrivalTime   String?  // Format HH:MM si retard
  isJustified   Boolean  @default(false)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([attendanceId, studentId])
}

enum AttendancePeriod {
  MORNING
  AFTERNOON
  EVENING
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
}


RÈGLES MÉTIER
--------------
1. Un appel = 1 classe + 1 date + 1 période
   → Un seul appel par combinaison (contrainte unique DB)

2. Si appel déjà fait → mode édition
   → Charger les statuts existants
   → Bouton devient "Mettre à jour"

3. Si appel verrouillé par Préfet → lecture seule
   → Afficher bannière : "⚠ Appel verrouillé par le Préfet (date de verrouillage)"
   → Tous les boutons désactivés

4. Élèves transférés ou archivés → ne pas afficher
   → Filtrer par enrollments.academicYearId actif

5. Ordre d'affichage élèves :
   → Par ordre alphabétique : NOM, POSTNOM, Prénom


NOTIFICATIONS
--------------
1. Après enregistrement :
   - Toast vert : "✓ Appel enregistré (28 présents, 3 absents, 1 retard)"

2. Si > 20% absents :
   - Alerte orange : "⚠ Taux d'absence élevé (25%). Le Préfet sera notifié."
   - Email automatique au Préfet

3. Si élève absent 3 jours consécutifs :
   - SMS automatique au tuteur (via CRON quotidien)
   - Notification Préfet dans dashboard


RACCOURCIS CLAVIER
-------------------
- P → Marquer présent l'élève sélectionné
- A → Marquer absent
- R → Marquer en retard
- ↓ → Élève suivant
- ↑ → Élève précédent
- Entrée → Valider et passer au suivant
- Ctrl+S → Enregistrer


RESPONSIVE
-----------
Desktop (≥1280px) :
  - Tableau complet avec 5 colonnes
  - Stats en 4 cartes horizontales

Tablette (768px-1279px) :
  - Tableau scroll horizontal
  - Stats en 2×2 grid

Mobile (<768px) :
  - Mode carte verticale par élève
  - Stats en carousel horizontal
  - Boutons P/A/R en largeur complète


TESTS À ÉCRIRE
---------------
packages/client/src/pages/attendance/DailyRollCallPage.test.tsx :

describe('DailyRollCallPage', () => {
  it('charge la liste des élèves', async () => {
    // Mock API
    // Vérifier que 32 élèves s'affichent
  })
  
  it('marque un élève présent', async () => {
    // Clic sur bouton P
    // Vérifier background vert
    // Vérifier stats mise à jour
  })
  
  it('active bouton Enregistrer si changement', () => {
    // Initialement désactivé
    // Marquer 1 élève → activé
  })
  
  it('fonctionne offline', async () => {
    // Simuler offline
    // Enregistrer appel
    // Vérifier sauvegarde Dexie
  })
  
  it('synchronise au retour connexion', async () => {
    // 2 appels en attente
    // Simuler retour online
    // Vérifier POST API × 2
  })
})


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Page charge les classes enseignant
[ ] Sélection classe charge élèves (ordre alphabétique)
[ ] 4 cartes stats calculent en temps réel
[ ] 3 boutons P/A/R fonctionnent
[ ] Modal remarque s'ouvre si Absent/Retard
[ ] Bouton "Tous présents" marque tous en 1 clic
[ ] Validation bloque si élèves sans statut
[ ] Enregistrement appelle POST /api/attendance/daily
[ ] Toast confirmation s'affiche
[ ] Mode offline sauvegarde dans Dexie
[ ] Badge "Hors ligne · X en attente" visible
[ ] Sync auto au retour connexion fonctionne
[ ] Responsive mobile parfait
[ ] Tests unitaires passent (5 tests min)
[ ] Raccourcis clavier P/A/R fonctionnent
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 4 — SCR-029 : HISTORIQUE DES ABSENCES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/attendance/AbsenceHistoryPage.tsx
Route : /attendance/history
Accès : Protégé (authentification requise)
Rôle minimum requis : SECRÉTAIRE


OBJECTIF
--------
Créer l'écran de consultation de l'historique complet des absences
avec filtres avancés, recherche, et export Excel/PDF.
Vue détaillée par élève avec statistiques.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/attendance/AbsenceHistoryPage.tsx        ← CRÉER
2. packages/client/src/components/attendance/AbsenceFilters.tsx       ← CRÉER
3. packages/client/src/components/attendance/AbsenceTable.tsx         ← CRÉER
4. packages/client/src/components/attendance/AbsenceStatsCards.tsx    ← CRÉER
5. packages/client/src/components/attendance/StudentAbsenceModal.tsx  ← CRÉER
6. packages/client/src/hooks/useAbsenceHistory.ts                     ← CRÉER


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ HISTORIQUE DES ABSENCES                                [📥 Export]│
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ Total      │ │ Justifiées │ │ Non        │ │ Retards    │   │
  │  │ absences   │ │            │ │ justifiées │ │            │   │
  │  │ 142        │ │ 89 (63%)   │ │ 53 (37%)   │ │ 28         │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  Filtres :                                                       │
  │  [Période ▼] [Classe ▼] [Type ▼] [🔍 Rechercher élève...]      │
  │                                                                  │
  ├──────────────────────────────────────────────────────────────────┤
  │ Date      │ Élève           │ Classe │ Type      │ Justifié │ Actions│
  ├───────────┼─────────────────┼────────┼───────────┼──────────┼────────┤
  │ 26/02 AM  │ AMISI Jean-B.   │ 4ScA   │ Absent    │ ❌       │ [👁][📝]│
  │ 26/02 AM  │ BAHATI Marie    │ 5PédA  │ Retard    │ ✅       │ [👁][📝]│
  │ 25/02 PM  │ CIZA Pierre     │ 4ScA   │ Absent    │ ❌       │ [👁][📝]│
  │ ...                                                              │
  ├──────────────────────────────────────────────────────────────────┤
  │ Page 1/12 · 142 absences                        [← 1 2 3 ... →] │
  └──────────────────────────────────────────────────────────────────┘


ZONE STATISTIQUES (4 CARTES)
------------------------------
Carte 1 — Total absences
  Icône : 📊
  Valeur : 142 absences
  Période : selon filtres
  Couleur : Bleu #0D47A1

Carte 2 — Justifiées
  Icône : ✅
  Valeur : 89 (63%)
  Sous-texte : Certificats médicaux, convocations
  Couleur : Vert #1B5E20

Carte 3 — Non justifiées
  Icône : ⚠️
  Valeur : 53 (37%)
  Sous-texte : Nécessitent suivi
  Couleur : Rouge #C62828

Carte 4 — Retards
  Icône : ⏰
  Valeur : 28 retards
  Sous-texte : Moyenne : 15 min/retard
  Couleur : Orange #F57F17


FILTRES AVANCÉS
----------------
Component : AbsenceFilters.tsx

1. Filtre Période
   - Select avec options :
     * Aujourd'hui
     * Cette semaine
     * Ce mois
     * Mois dernier
     * Ce trimestre
     * Cette année scolaire
     * Personnalisé (date début → date fin)

2. Filtre Classe
   - Select multi-choix avec recherche
   - Options : Toutes | 4ScA | 4ScB | 5PédA | etc.
   - Compteur sélections : "(3 classes)"

3. Filtre Type
   - Checkboxes :
     [☑] Absences non justifiées
     [☑] Absences justifiées
     [☑] Retards
   - Bouton "Tout sélectionner" / "Tout désélectionner"

4. Recherche élève
   - Input avec debounce 300ms
   - Placeholder : "Rechercher par nom, matricule..."
   - Recherche insensible à la casse
   - Icône loupe


TABLEAU HISTORIQUE
-------------------
Component : AbsenceTable.tsx

Colonnes :
1. Date — Format : "26/02 AM" ou "26/02 PM"
2. Élève — Nom complet format congolais
3. Classe — Nom court (4ScA)
4. Type — Badge coloré :
   - "Absent" : rouge
   - "Retard" : orange
5. Justifié — Icône :
   - ✅ si justifié
   - ❌ si non justifié
6. Actions — 2 icônes :
   - 👁 Voir détails → ouvre modal
   - 📝 Modifier justification (Préfet uniquement)

Tri :
  - Par date décroissante (plus récent en haut)
  - Clic en-tête colonne pour tri alternatif

Pagination :
  - 25 par page
  - Boutons < 1 2 3 ... >
  - Select "Afficher : 25 | 50 | 100 par page"


MODAL DÉTAILS ABSENCE
-----------------------
Component : StudentAbsenceModal.tsx

Ouvert par clic icône 👁 :

  ┌─────────────────────────────────────────────────────────┐
  │ DÉTAILS ABSENCE                              [✕]        │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │ ÉLÈVE :                                                 │
  │ [📷] AMISI KALOMBO Jean-Baptiste                        │
  │ Matricule : NK-GOM-ISS-0234                             │
  │ Classe : 4ème Scientifique A                            │
  │                                                         │
  │ ABSENCE :                                               │
  │ Date : 26 février 2026                                  │
  │ Période : Matin (7h30-12h30)                            │
  │ Type : Absent                                           │
  │ Statut : ❌ Non justifié                                │
  │                                                         │
  │ REMARQUE ENSEIGNANT :                                   │
  │ Aucune remarque                                         │
  │                                                         │
  │ HISTORIQUE ÉLÈVE (30 derniers jours) :                  │
  │ • Total absences : 4 (3 non justifiées)                 │
  │ • Total retards : 2                                     │
  │ • Taux présence : 92%                                   │
  │                                                         │
  │ ACTIONS :                                               │
  │ [📞 Contacter tuteur] [📧 Envoyer email]                │
  │ [📝 Modifier justification]                             │
  │                                                         │
  │ [Fermer]                                                │
  └─────────────────────────────────────────────────────────┘


EXPORT DONNÉES
---------------
Bouton "📥 Export" en haut à droite ouvre menu :

Options export :
1. Excel (.xlsx)
   - Toutes colonnes
   - Filtres appliqués
   - Mise en forme couleurs

2. PDF
   - Format A4 paysage
   - Logo école
   - Période + filtres affichés
   - Tableau complet

3. CSV
   - Format simple pour Excel
   - Encodage UTF-8

Nom fichier généré :
  Absences_[PERIODE]_[DATE].xlsx
  Ex: Absences_Fevrier2026_26-02-2026.xlsx


APPELS API
-----------
GET /api/attendance/absences
  Query params :
    - startDate?: string (ISO)
    - endDate?: string (ISO)
    - classIds?: string[] (array UUIDs)
    - types?: ('ABSENT' | 'LATE')[]
    - isJustified?: boolean
    - studentSearch?: string
    - page?: number
    - limit?: number (défaut: 25)
  
  Response 200 :
    {
      data: Array<{
        id: string,
        date: string,
        period: 'MORNING' | 'AFTERNOON' | 'EVENING',
        student: {
          id: string,
          matricule: string,
          nom: string,
          postNom: string,
          prenom?: string,
          photoUrl?: string
        },
        class: {
          id: string,
          name: string
        },
        status: 'ABSENT' | 'LATE',
        remark?: string,
        arrivalTime?: string,
        isJustified: boolean,
        justificationFile?: string,
        createdBy: {
          id: string,
          nom: string,
          role: string
        }
      }>,
      total: number,
      page: number,
      pages: number,
      stats: {
        totalAbsences: number,
        justified: number,
        notJustified: number,
        lates: number
      }
    }

GET /api/attendance/student/:studentId/stats
  Query params :
    - period?: number (jours, défaut: 30)
  
  Response 200 :
    {
      studentId: string,
      period: number,
      stats: {
        totalAbsences: number,
        justifiedAbsences: number,
        notJustifiedAbsences: number,
        totalLates: number,
        attendanceRate: number  // Pourcentage
      },
      recentAbsences: Array<{
        date: string,
        period: string,
        status: string,
        isJustified: boolean
      }>
    }


MODIFICATION JUSTIFICATION
---------------------------
Accessible uniquement par PRÉFET.

Modal "Modifier justification" :

  ┌─────────────────────────────────────────────┐
  │ MODIFIER JUSTIFICATION                      │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Absence du 26/02/2026 — AMISI Jean-B.      │
  │                                             │
  │ Statut :                                    │
  │ ( ) Non justifié                            │
  │ (•) Justifié                                │
  │                                             │
  │ Pièce justificative :                       │
  │ [📎 Glisser-déposer certificat médical]     │
  │                                             │
  │ Remarque (optionnel) :                      │
  │ [Certificat médical reçu le 27/02]         │
  │                                             │
  │ [Annuler]              [Enregistrer]        │
  └─────────────────────────────────────────────┘

API :
PUT /api/attendance/records/:id/justification
  Body : {
    isJustified: boolean,
    remark?: string,
    justificationFile?: File
  }


NOTIFICATIONS AUTOMATIQUES
----------------------------
CRON quotidien (8h00) :

1. Élève absent 3 jours consécutifs :
   - SMS tuteur automatique :
     FR: "EduGoma360: {NOM} absent 3 jours consécutifs. Merci de nous contacter."
     SW: "EduGoma360: {NOM} haijakuwepo siku 3 mfululizo. Tafadhali wasiliana nasi."

2. Taux absence classe > 30% :
   - Email Préfet avec liste élèves absents
   - Alerte dashboard

3. Élève > 10 absences non justifiées ce mois :
   - Convocation parent générée automatiquement
   - Notification Préfet


RÈGLES MÉTIER
--------------
1. Seul l'enseignant qui a fait l'appel peut modifier dans les 24h
   → Après 24h : seul Préfet peut modifier

2. Justification peut être ajoutée jusqu'à 7 jours après
   → Après 7 jours : définitivement non justifié

3. Retard < 15 min = tolérance (pas enregistré)
   → Retard ≥ 15 min = enregistré

4. 3 retards = 1 absence dans le calcul du taux présence


RESPONSIVE
-----------
Desktop (≥1280px) :
  - Tableau complet 6 colonnes
  - Filtres en ligne horizontale

Tablette (768px-1279px) :
  - Tableau scroll horizontal
  - Filtres en 2 lignes

Mobile (<768px) :
  - Mode carte verticale
  - Filtres en accordion
  - Actions en menu hamburger


DÉFINITION DE "TERMINÉ"
------------------------
[ ] 4 cartes stats affichent valeurs correctes
[ ] Filtres (période, classe, type) fonctionnent
[ ] Recherche élève avec debounce fonctionne
[ ] Tableau affiche absences paginées
[ ] Tri colonnes fonctionne
[ ] Modal détails s'ouvre au clic 👁
[ ] Stats élève (30 jours) chargent
[ ] Export Excel génère fichier
[ ] Export PDF génère fichier
[ ] Modification justification (Préfet) fonctionne
[ ] Upload pièce justificative fonctionne
[ ] Responsive mobile parfait
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 4 — SCR-030 : JUSTIFICATIFS D'ABSENCE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/attendance/JustificationsPage.tsx
Route : /attendance/justifications
Accès : Protégé (authentification requise)
Rôle minimum requis : SECRÉTAIRE


OBJECTIF
--------
Créer l'écran de gestion des demandes de justificatifs d'absence.
Les parents peuvent soumettre des justificatifs, le personnel les valide.
Workflow : Soumis → En attente → Approuvé/Rejeté


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/attendance/JustificationsPage.tsx        ← CRÉER
2. packages/client/src/components/attendance/JustificationCard.tsx    ← CRÉER
3. packages/client/src/components/attendance/JustificationModal.tsx   ← CRÉER
4. packages/client/src/components/attendance/ApprovalModal.tsx        ← CRÉER
5. packages/client/src/hooks/useJustifications.ts                     ← CRÉER


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ JUSTIFICATIFS D'ABSENCE                                          │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ En attente │ │ Approuvés  │ │ Rejetés    │ │ Expirés    │   │
  │  │ 12         │ │ 45         │ │ 3          │ │ 2          │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  [Tous] [En attente] [Approuvés] [Rejetés]                      │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 🟡 EN ATTENTE                                              │ │
  │  │ AMISI Jean-Baptiste · 4ScA                                 │ │
  │  │ Absence : 26/02/2026 (Matin)                               │ │
  │  │ Motif : Maladie (grippe)                                   │ │
  │  │ Document : certificat_medical.pdf [📄 Voir]                │ │
  │  │ Soumis le : 26/02/2026 à 14:32 par AMISI Pierre (tuteur)   │ │
  │  │                                                            │ │
  │  │ [❌ Rejeter] [✅ Approuver]                                 │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ... (autres demandes)                                           │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


ZONE STATISTIQUES (4 CARTES)
------------------------------
Carte 1 — En attente
  Icône : ⏳
  Valeur : 12 demandes
  Action : Clic → filtre "En attente"
  Couleur : Orange #F57F17

Carte 2 — Approuvés
  Icône : ✅
  Valeur : 45 (ce mois)
  Couleur : Vert #1B5E20

Carte 3 — Rejetés
  Icône : ❌
  Valeur : 3 (ce mois)
  Couleur : Rouge #C62828

Carte 4 — Expirés
  Icône : ⏰
  Valeur : 2
  Sous-texte : Délai 7 jours dépassé
  Couleur : Gris #757575


FILTRES PAR STATUT
-------------------
Onglets (tabs) :
  [Tous] [En attente] [Approuvés] [Rejetés]

Par défaut : "En attente" (demandes nécessitant action)


CARTE JUSTIFICATIF
-------------------
Component : JustificationCard.tsx

Structure :

  ┌────────────────────────────────────────────────────────────┐
  │ 🟡 EN ATTENTE                               [3 jours]      │
  │                                                            │
  │ [📷] AMISI KALOMBO Jean-Baptiste                           │
  │ Matricule : NK-GOM-ISS-0234 · Classe : 4ScA                │
  │                                                            │
  │ ABSENCE :                                                  │
  │ Date : 26 février 2026                                     │
  │ Période : Matin (7h30-12h30)                               │
  │                                                            │
  │ MOTIF :                                                    │
  │ Maladie (grippe avec fièvre)                               │
  │                                                            │
  │ PIÈCE JUSTIFICATIVE :                                      │
  │ 📄 certificat_medical.pdf (248 KB)                         │
  │ [👁 Visualiser] [📥 Télécharger]                           │
  │                                                            │
  │ SOUMIS PAR :                                               │
  │ AMISI Pierre (Père) — +243 810 000 000                     │
  │ Le 26/02/2026 à 14:32                                      │
  │                                                            │
  │ [❌ Rejeter] [✅ Approuver]                                 │
  └────────────────────────────────────────────────────────────┘

Badge statut (en haut à gauche) :
  - 🟡 EN ATTENTE (orange)
  - ✅ APPROUVÉ (vert)
  - ❌ REJETÉ (rouge)
  - ⏰ EXPIRÉ (gris)

Badge délai (en haut à droite) :
  - "3 jours" si en attente depuis 3 jours
  - Devient rouge si > 5 jours


MODAL APPROBATION
------------------
Component : ApprovalModal.tsx

Clic bouton "✅ Approuver" :

  ┌─────────────────────────────────────────────┐
  │ APPROUVER LE JUSTIFICATIF                   │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Absence du 26/02/2026 — AMISI Jean-B.      │
  │                                             │
  │ En approuvant, l'absence sera marquée       │
  │ comme justifiée dans le système.            │
  │                                             │
  │ Observations (optionnel) :                  │
  │ [Certificat médical conforme]              │
  │                                             │
  │ [Annuler]              [✅ Approuver]       │
  └─────────────────────────────────────────────┘


MODAL REJET
------------
Clic bouton "❌ Rejeter" :

  ┌─────────────────────────────────────────────┐
  │ REJETER LE JUSTIFICATIF                     │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Absence du 26/02/2026 — AMISI Jean-B.      │
  │                                             │
  │ Motif du rejet * :                          │
  │ ( ) Document non conforme                   │
  │ ( ) Document illisible                      │
  │ (•) Date ne correspond pas                  │
  │ ( ) Signature manquante                     │
  │ ( ) Autre                                   │
  │                                             │
  │ Détails (obligatoire) :                     │
  │ [La date sur le certificat est le 25/02    │
  │  alors que l'absence est le 26/02]         │
  │                                             │
  │ [Annuler]              [❌ Rejeter]         │
  └─────────────────────────────────────────────┘


SOUMISSION JUSTIFICATIF (PARENT)
----------------------------------
Route : /parent/justifications/new (écran parent)

Formulaire :

  ┌─────────────────────────────────────────────┐
  │ SOUMETTRE UN JUSTIFICATIF                   │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Élève * :                                   │
  │ [AMISI Jean-Baptiste ▼]                     │
  │                                             │
  │ Date d'absence * :                          │
  │ [26/02/2026]                                │
  │                                             │
  │ Période * :                                 │
  │ (•) Matin  ( ) Après-midi  ( ) Toute la journée │
  │                                             │
  │ Motif * :                                   │
  │ ( ) Maladie                                 │
  │ ( ) Décès familial                          │
  │ ( ) Rendez-vous médical                     │
  │ ( ) Autre                                   │
  │                                             │
  │ Détails du motif * :                        │
  │ [Grippe avec fièvre prescrite par Dr...]   │
  │                                             │
  │ Pièce justificative * :                     │
  │ [📎 Glisser-déposer ou cliquer]             │
  │ Formats acceptés : PDF, JPG, PNG (max 5MB)  │
  │                                             │
  │ [Annuler]              [Soumettre]          │
  └─────────────────────────────────────────────┘


APPELS API
-----------
GET /api/justifications
  Query params :
    - status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
    - page?: number
    - limit?: number
  
  Response 200 :
    {
      data: Array<{
        id: string,
        attendanceRecordId: string,
        student: {
          id: string,
          matricule: string,
          nom: string,
          postNom: string,
          prenom?: string,
          photoUrl?: string,
          class: { name: string }
        },
        absence: {
          date: string,
          period: string
        },
        reason: string,
        reasonDetails: string,
        documentUrl: string,
        documentName: string,
        documentSize: number,
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED',
        submittedBy: {
          id: string,
          nom: string,
          relationship: string,  // Père, Mère, Tuteur
          phone: string
        },
        submittedAt: string,
        reviewedBy?: {
          id: string,
          nom: string,
          role: string
        },
        reviewedAt?: string,
        reviewComment?: string,
        rejectionReason?: string
      }>,
      total: number,
      stats: {
        pending: number,
        approved: number,
        rejected: number,
        expired: number
      }
    }

POST /api/justifications
  Body : multipart/form-data {
    studentId: string,
    attendanceRecordId: string,
    reason: string,
    reasonDetails: string,
    documentFile: File
  }
  
  Response 201 : {
    justification: Justification,
    message: "Justificatif soumis avec succès"
  }

PUT /api/justifications/:id/approve
  Body : {
    comment?: string
  }
  Response 200 : { justification: Justification }

PUT /api/justifications/:id/reject
  Body : {
    rejectionReason: string,
    comment: string
  }
  Response 200 : { justification: Justification }


MODÈLE DONNÉES PRISMA
----------------------
model Justification {
  id                  String   @id @default(uuid())
  schoolId            String
  school              School   @relation(fields: [schoolId], references: [id])
  
  attendanceRecordId  String
  attendanceRecord    AttendanceRecord @relation(fields: [attendanceRecordId], references: [id])
  
  studentId           String
  student             Student  @relation(fields: [studentId], references: [id])
  
  reason              JustificationReason
  reasonDetails       String
  
  documentUrl         String
  documentName        String
  documentSize        Int      // Bytes
  
  status              JustificationStatus @default(PENDING)
  
  submittedById       String
  submittedBy         User     @relation("JustificationSubmitter", fields: [submittedById], references: [id])
  
  reviewedById        String?
  reviewedBy          User?    @relation("JustificationReviewer", fields: [reviewedById], references: [id])
  reviewedAt          DateTime?
  reviewComment       String?
  rejectionReason     String?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@index([status, createdAt])
  @@index([studentId])
}

enum JustificationReason {
  MALADIE
  DECES_FAMILIAL
  RENDEZ_VOUS_MEDICAL
  AUTRE
}

enum JustificationStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}


RÈGLES MÉTIER
--------------
1. Délai soumission : 7 jours après absence
   → Après 7 jours : statut automatique EXPIRED

2. Formats acceptés : PDF, JPG, PNG
   → Max 5MB par fichier

3. Seuls SECRÉTAIRE et PRÉFET peuvent approuver/rejeter

4. Après approbation :
   → AttendanceRecord.isJustified = true
   → Mise à jour automatique stats élève

5. Parent reçoit SMS après traitement :
   - Approuvé : "Justificatif approuvé pour {NOM} le {DATE}"
   - Rejeté : "Justificatif rejeté pour {NOM}. Raison: {MOTIF}"


NOTIFICATIONS
--------------
1. Nouvelle soumission :
   - Notification Secrétaire dans dashboard
   - Badge compteur "12 en attente"

2. Délai > 5 jours :
   - Email rappel Secrétaire
   - Badge rouge sur carte

3. Après approbation/rejet :
   - SMS parent automatique
   - Notification dans espace parent


TÂCHE CRON (QUOTIDIENNE 23h00)
--------------------------------
Marquer EXPIRED les justificatifs :
  - Status = PENDING
  - createdAt > 7 jours


RESPONSIVE
-----------
Desktop (≥1280px) :
  - Grille 2 colonnes cartes
  - Modal visualisation document grande taille

Mobile (<768px) :
  - 1 colonne cartes
  - Scroll vertical
  - Boutons actions largeur complète


DÉFINITION DE "TERMINÉ"
------------------------
[ ] 4 cartes stats affichent valeurs
[ ] Filtres par statut fonctionnent
[ ] Cartes justificatifs affichent données complètes
[ ] Bouton "Visualiser" ouvre PDF dans modal
[ ] Bouton "Approuver" ouvre modal confirmation
[ ] Approbation met à jour statut + AttendanceRecord
[ ] Bouton "Rejeter" ouvre modal avec motifs
[ ] Rejet enregistre motif + envoie SMS parent
[ ] Soumission parent fonctionne (formulaire + upload)
[ ] CRON expire justificatifs > 7 jours
[ ] Notifications fonctionnent
[ ] Responsive mobile parfait
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4 / 4 — SCR-031 : RAPPORTS DE PRÉSENCE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/attendance/AttendanceReportsPage.tsx
Route : /attendance/reports
Accès : Protégé (authentification requise)
Rôle minimum requis : SECRÉTAIRE


OBJECTIF
--------
Créer l'écran de génération de rapports de présence avec graphiques,
statistiques détaillées, et export PDF/Excel.
Vue globale école ou détaillée par classe/élève.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/attendance/AttendanceReportsPage.tsx     ← CRÉER
2. packages/client/src/components/attendance/ReportFilters.tsx        ← CRÉER
3. packages/client/src/components/attendance/AttendanceCharts.tsx     ← CRÉER
4. packages/client/src/components/attendance/ClassRankingTable.tsx    ← CRÉER
5. packages/client/src/components/attendance/GenerateReportModal.tsx  ← CRÉER
6. packages/client/src/hooks/useAttendanceReports.ts                  ← CRÉER


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ RAPPORTS DE PRÉSENCE                        [📊 Générer rapport] │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  Période : [Ce mois ▼]    Classe : [Toutes ▼]                   │
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ Taux       │ │ Absences   │ │ Retards    │ │ Meilleure  │   │
  │  │ présence   │ │ totales    │ │ totaux     │ │ classe     │   │
  │  │ 92.5%      │ │ 142        │ │ 28         │ │ 6ScA       │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  ÉVOLUTION MENSUELLE                                             │
  │  [Graphique courbe taux présence]                                │
  │                                                                  │
  │  RÉPARTITION PAR CLASSE                                          │
  │  [Graphique barres horizontales]                                 │
  │                                                                  │
  │  CLASSEMENT DES CLASSES                                          │
  │  [Tableau ranking]                                               │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


ZONE STATISTIQUES (4 CARTES)
------------------------------
Carte 1 — Taux présence global
  Icône : 📊
  Valeur : 92.5%
  Tendance : ▲ +1.2% vs mois dernier
  Couleur : Vert #1B5E20 si ≥90%, Orange si <90%, Rouge si <80%

Carte 2 — Absences totales
  Icône : ❌
  Valeur : 142 absences
  Sous-texte : 89 justifiées, 53 non justifiées
  Couleur : Bleu #0D47A1

Carte 3 — Retards totaux
  Icône : ⏰
  Valeur : 28 retards
  Sous-texte : Moyenne 18 min/retard
  Couleur : Orange #F57F17

Carte 4 — Meilleure classe
  Icône : 🏆
  Valeur : 6ScA (98.2%)
  Sous-texte : 22 élèves
  Couleur : Or #F57F17


GRAPHIQUE 1 — ÉVOLUTION MENSUELLE
-----------------------------------
Component : AttendanceCharts.tsx (LineChart)

Type : Courbe (line chart)
Axes :
  - X : Jours du mois (1-31)
  - Y : Taux présence (0-100%)

Données :
  - 1 courbe : taux présence quotidien
  - Ligne pointillée horizontale : objectif 90%

Couleurs :
  - Vert si ≥90%
  - Orange si 80-90%
  - Rouge si <80%

Tooltip au hover :
  "26/02/2026 : 92.5% (28 présents / 32 élèves)"


GRAPHIQUE 2 — RÉPARTITION PAR CLASSE
--------------------------------------
Type : Barres horizontales

Données :
  - 1 barre par classe
  - Triées par taux présence décroissant

Exemple :
  6ScA   ████████████████████ 98.2%
  5PédA  ██████████████████   94.5%
  4ScA   █████████████████    92.0%
  4ScB   ████████████████     88.5%
  TC-1A  ███████████████      85.0%

Couleurs :
  - Vert : ≥95%
  - Jaune : 90-94%
  - Orange : 80-89%
  - Rouge : <80%


TABLEAU CLASSEMENT CLASSES
----------------------------
Component : ClassRankingTable.tsx

Colonnes :
  1. Rang
  2. Classe
  3. Effectif
  4. Taux présence
  5. Absences
  6. Retards
  7. Évolution (vs mois dernier)

Exemple :
  │ Rang │ Classe │ Effectif │ Taux    │ Absences │ Retards │ Évolution │
  ├──────┼────────┼──────────┼─────────┼──────────┼─────────┼───────────┤
  │ 🥇 1 │ 6ScA   │ 22       │ 98.2%   │ 3        │ 1       │ ▲ +0.5%   │
  │ 🥈 2 │ 5PédA  │ 28       │ 94.5%   │ 12       │ 3       │ ▲ +1.2%   │
  │ 🥉 3 │ 4ScA   │ 32       │ 92.0%   │ 18       │ 5       │ ▼ -0.8%   │
  │   4  │ 4ScB   │ 30       │ 88.5%   │ 25       │ 7       │ ▼ -2.1%   │

Badges rang :
  - 1er : 🥇 Or
  - 2ème : 🥈 Argent
  - 3ème : 🥉 Bronze


FILTRES
--------
Component : ReportFilters.tsx

1. Filtre Période
   - Select : Ce jour | Cette semaine | Ce mois | Mois dernier | Ce trimestre | Cette année | Personnalisé

2. Filtre Classe
   - Multi-select : Toutes | 4ScA | 4ScB | 5PédA | ...


MODAL GÉNÉRATION RAPPORT
--------------------------
Component : GenerateReportModal.tsx

Bouton "📊 Générer rapport" ouvre modal :

  ┌─────────────────────────────────────────────┐
  │ GÉNÉRER UN RAPPORT DE PRÉSENCE              │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Type de rapport * :                         │
  │ ( ) Rapport global école                    │
  │ (•) Rapport par classe                      │
  │ ( ) Rapport individuel élève                │
  │                                             │
  │ Période * :                                 │
  │ Du : [01/02/2026] Au : [28/02/2026]         │
  │                                             │
  │ Classes (si rapport classe) :               │
  │ [☑ 4ScA] [☑ 4ScB] [☐ 5PédA] ...             │
  │                                             │
  │ Sections à inclure :                        │
  │ [☑] Statistiques globales                   │
  │ [☑] Graphiques                              │
  │ [☑] Classement classes                      │
  │ [☑] Liste détaillée absences                │
  │ [☑] Élèves avec taux < 80%                  │
  │                                             │
  │ Format :                                    │
  │ (•) PDF  ( ) Excel                          │
  │                                             │
  │ [Annuler]              [Générer]            │
  └─────────────────────────────────────────────┘


STRUCTURE RAPPORT PDF
-----------------------
1. Page de garde
   - Logo école
   - Titre : "Rapport de Présence — Février 2026"
   - Période
   - Date génération

2. Résumé exécutif (1 page)
   - 4 KPIs principaux
   - Faits marquants
   - Recommandations

3. Statistiques globales (1 page)
   - Taux présence école
   - Évolution mensuelle
   - Comparaison objectifs

4. Analyse par classe (2-3 pages)
   - Tableau classement
   - Top 3 et bottom 3
   - Graphique barres

5. Graphiques (2 pages)
   - Courbe évolution
   - Camembert répartition statuts
   - Heatmap jours semaine

6. Élèves à risque (1 page)
   - Liste élèves < 80% présence
   - Nombre absences non justifiées
   - Actions recommandées

7. Annexes (optionnel)
   - Liste complète absences
   - Détails par élève


APPELS API
-----------
GET /api/attendance/reports/stats
  Query params :
    - startDate: string (ISO)
    - endDate: string (ISO)
    - classIds?: string[]
  
  Response 200 :
    {
      period: { start: string, end: string },
      stats: {
        totalAttendanceRate: number,
        totalAbsences: number,
        justifiedAbsences: number,
        notJustifiedAbsences: number,
        totalLates: number,
        avgLateMinutes: number
      },
      evolution: Array<{
        date: string,
        attendanceRate: number,
        present: number,
        absent: number,
        late: number
      }>,
      byClass: Array<{
        classId: string,
        className: string,
        studentCount: number,
        attendanceRate: number,
        absences: number,
        lates: number,
        trend: number  // % évolution
      }>,
      atRiskStudents: Array<{
        studentId: string,
        student: { matricule: string, nom: string, class: string },
        attendanceRate: number,
        absences: number,
        notJustifiedAbsences: number
      }>
    }

POST /api/attendance/reports/generate
  Body : {
    type: 'SCHOOL' | 'CLASS' | 'STUDENT',
    startDate: string,
    endDate: string,
    classIds?: string[],
    studentId?: string,
    sections: string[],
    format: 'PDF' | 'EXCEL'
  }
  
  Response 200 : {
    reportUrl: string,
    filename: string
  }


ÉLÈVES À RISQUE
----------------
Critères identification :
  - Taux présence < 80%
  - OU > 5 absences non justifiées ce mois
  - OU > 10 retards ce mois

Actions recommandées (affichées dans rapport) :
  1. Convocation parent
  2. Entretien avec élève
  3. Suivi rapproché


EXPORT EXCEL
-------------
Feuilles (sheets) :
  1. Résumé — Stats globales
  2. Par classe — Tableau classement
  3. Par élève — Détail tous élèves
  4. Absences — Liste complète
  5. Graphiques — Charts Excel


RÈGLES MÉTIER
--------------
1. Taux présence = (Présents / (Présents + Absents + Retards)) × 100
   → Retard compte comme 0.5 absence

2. Classement classes par taux présence décroissant

3. Rapports générés en background si > 1000 élèves
   → Notification quand prêt

4. Cache rapport 1h (même filtres → même résultat)


RESPONSIVE
-----------
Desktop (≥1280px) :
  - Graphiques côte à côte
  - Tableau classement complet

Tablette (768px-1279px) :
  - Graphiques en colonne
  - Tableau scroll horizontal

Mobile (<768px) :
  - Graphiques en carousel
  - Tableau mode carte
  - Génération rapport désactivée (complexe)


DÉFINITION DE "TERMINÉ"
------------------------
[ ] 4 cartes stats calculent valeurs correctes
[ ] Graphique courbe évolution affiche
[ ] Graphique barres classes affiche
[ ] Tableau classement trie correctement
[ ] Filtres (période, classe) fonctionnent
[ ] Modal génération rapport s'ouvre
[ ] Génération PDF fonctionne
[ ] PDF contient toutes les sections
[ ] Export Excel génère fichier
[ ] API stats retourne données correctes
[ ] Calcul taux présence correct (formule RDC)
[ ] Responsive desktop/tablette fonctionne
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RÉCAPITULATIF MODULE PRÉSENCES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| N° | Écran | Fonction | Fichiers | Complexité |
|----|-------|----------|----------|------------|
| 28 | Appel quotidien | Saisie P/A/R avec offline | 11 fichiers | ⭐⭐⭐⭐ |
| 29 | Historique absences | Consultation + filtres | 6 fichiers | ⭐⭐⭐ |
| 30 | Justificatifs | Workflow validation | 5 fichiers | ⭐⭐⭐ |
| 31 | Rapports | Stats + graphiques + PDF | 6 fichiers | ⭐⭐⭐⭐ |

**Total : 4 écrans, ~28 fichiers**

---

*EduGoma 360 — Module Présences Complet — Goma, RDC — © 2025*
