# 🎓 EDUGOMA 360 — MODULE ACADÉMIQUE COMPLET
## Écrans SCR-010 à SCR-017 | Gestion Notes, Moyennes, Délibération, Bulletins

> **MODE D'EMPLOI :**
> Ce fichier contient **8 prompts indépendants** pour les 8 écrans du module Académique.
> Exécute-les **dans l'ordre numérique** (010 → 017).
> Le module Élèves (SCR-005 à SCR-009) DOIT être terminé avant de commencer.

---

## CONTEXTE GLOBAL DU MODULE

```
Module         : Gestion Académique
Écrans         : SCR-010 à SCR-017 (8 écrans)
Prérequis      : Module Élèves validé
Rôles concernés: Enseignant, Secrétaire, Préfet
Complexité     : ⭐⭐⭐⭐⭐ (module le plus critique du système)

COMPOSANTS PARTAGÉS À CRÉER :
- shared/src/utils/gradeCalc.ts (formules officielles RDC)
- shared/src/constants/evalTypes.ts (types d'évaluation)
- shared/src/constants/decisions.ts (décisions délibération)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 8 — SCR-010 : GESTION DES CLASSES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-010 - Gestion des Classes
Route : /classes
Rôle minimum : PRÉFET
Prérequis : Module Élèves terminé


OBJECTIF
--------
Créer l'écran de gestion des classes (création, modification, attribution).
Les classes sont le pivot central du système académique : sans classes correctement
configurées, les notes et la délibération ne peuvent pas fonctionner.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/academic/ClassesPage.tsx
2. packages/client/src/components/academic/ClassCard.tsx
3. packages/client/src/components/academic/ClassFormModal.tsx
4. packages/client/src/components/academic/TeacherAssignmentModal.tsx
5. packages/server/src/modules/classes/classes.routes.ts
6. packages/server/src/modules/classes/classes.controller.ts
7. packages/server/src/modules/classes/classes.service.ts


UI — STRUCTURE DE LA PAGE
---------------------------
Liste en grille de cartes (cards), 3 par ligne sur desktop, 1 sur mobile.
Chaque carte représente une classe avec :
- Nom de la classe (ex: "4ème Scientifique A")
- Section + Année
- Effectif actuel / Maximum
- Enseignant titulaire (si assigné)
- Badge statut (Actif / Archivé)
- Actions rapides : Voir élèves | Attribuer cours | Modifier | Archiver

En-tête de page :
- Bouton "+ Créer une classe"
- Filtres : Par section | Par année | Statut
- Recherche par nom de classe


COMPOSANT ClassCard.tsx
-------------------------
Props :
  interface ClassCardProps {
    class: Class & { section: Section; students: Student[]; teacher?: Teacher }
    onEdit: (id: string) => void
    onAssignTeachers: (id: string) => void
    onArchive: (id: string) => void
  }

Structure visuelle :
  ┌─────────────────────────────────────────┐
  │ 4ScA                        [Badge: Actif] │
  │ 4ème Scientifique A                      │
  │                                          │
  │ 📚 Scientifique — 4ème année             │
  │ 👥 32 / 45 élèves                        │
  │ 👨‍🏫 Titulaire : MUKASA Jean (Préfet)      │
  │                                          │
  │ [Voir élèves] [Attribuer cours] [⋮]     │
  └─────────────────────────────────────────┘

Couleurs de badge :
- Actif : vert (#1B5E20)
- Archivé : gris (#757575)


MODAL ClassFormModal.tsx
--------------------------
Formulaire de création/édition en 2 modes :

CRÉATION :
  1. Sélectionner Section (Select dynamique depuis l'API)
  2. Sélectionner Année (1 à 6)
  3. Nom de la classe (généré auto ou personnalisable)
     - Auto : "1TC-A", "4ScB", "5PédA"
     - Format : {Année}{CodeSection}{Lettre}
  4. Effectif maximum (default: 45, min: 20, max: 60)
  5. Enseignant titulaire (optionnel, Select depuis /api/teachers)

ÉDITION :
  - Nom non modifiable (pour éviter de casser les références)
  - Effectif max modifiable
  - Enseignant titulaire modifiable
  - Statut Actif/Archivé

Validation :
  - Nom de classe unique par école
  - Si effectif réduit < nombre élèves actuels → warning + confirmation


MODAL TeacherAssignmentModal.tsx
----------------------------------
Attribution des enseignants aux matières pour une classe.

Interface :
  ┌──────────────────────────────────────────────────┐
  │ ATTRIBUTION DES COURS — 4ScA                     │
  ├──────────────────────────────────────────────────┤
  │ Matière           │ Enseignant assigné           │
  ├───────────────────┼──────────────────────────────┤
  │ Mathématiques     │ [MUKASA Jean ▼]              │
  │ Physique          │ [BAHATI Pierre ▼]            │
  │ Chimie            │ [Non assigné ▼]              │
  │ Biologie          │ [CIZA Marie ▼]               │
  │ Français          │ [DUSABE Alice ▼]             │
  │ ...               │                              │
  └──────────────────────────────────────────────────┘
  
  [Annuler] [Enregistrer les attributions]

Les matières listées dépendent de la section de la classe.
Un enseignant peut être assigné à plusieurs matières dans plusieurs classes.


API BACKEND
------------
POST /api/classes
  Body: { sectionId, year, name?, maxStudents, teacherId? }
  Response: { class: Class }

GET /api/classes?schoolId=&sectionId=&year=&status=
  Response: { classes: Class[] }

PATCH /api/classes/:id
  Body: { maxStudents?, teacherId?, isActive? }
  Response: { class: Class }

DELETE /api/classes/:id
  → Soft delete (isActive = false)
  → Impossible si élèves actifs dans la classe

POST /api/classes/:id/assign-teachers
  Body: { assignments: [{ subjectId, teacherId }] }
  Response: { assignments: TeacherClassSubject[] }

GET /api/classes/:id/assignments
  Response: { assignments: [{ subject, teacher }] }


RÈGLES MÉTIER
--------------
1. Une classe ne peut pas être supprimée si elle contient des élèves actifs
2. Le nom de classe doit être unique par école
3. L'effectif maximum ne peut pas être réduit en dessous de l'effectif actuel
4. Un enseignant peut enseigner plusieurs matières dans plusieurs classes
5. Seul le Préfet peut créer, modifier ou archiver des classes


DÉFINITION DE TERMINÉ
----------------------
[ ] Liste des classes affichée en grille responsive
[ ] Création de classe avec génération auto du nom
[ ] Édition de classe (effectif max, titulaire)
[ ] Attribution enseignants ↔ matières fonctionne
[ ] Validation nom unique + effectif
[ ] Archivage avec vérification élèves actifs
[ ] Filtres et recherche fonctionnels
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 8 — SCR-011 : EMPLOI DU TEMPS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-011 - Emploi du Temps
Route : /timetable
Rôle minimum : ENSEIGNANT
Prérequis : SCR-010 (classes avec enseignants assignés)


OBJECTIF
--------
Afficher l'emploi du temps hebdomadaire d'un enseignant ou d'une classe.
L'enseignant voit ses propres cours, le Préfet peut voir tous les emplois du temps.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/academic/TimetablePage.tsx
2. packages/client/src/components/academic/TimetableGrid.tsx
3. packages/client/src/components/academic/TimetableCell.tsx
4. packages/server/src/modules/timetable/timetable.routes.ts
5. packages/server/src/modules/timetable/timetable.service.ts


UI — GRILLE HEBDOMADAIRE
--------------------------
Vue en grille 5 jours × N périodes (typiquement 8 périodes par jour).

       │ Lundi  │ Mardi │ Mercr. │ Jeudi │ Vendr. │
  ─────┼────────┼───────┼────────┼───────┼────────┤
  7h30 │ Math   │ Phys  │ Math   │ Chim  │ Math   │
       │ 4ScA   │ 4ScB  │ 4ScA   │ 4ScA  │ 4ScB   │
  ─────┼────────┼───────┼────────┼───────┼────────┤
  8h30 │ Math   │       │ Phys   │       │ Chim   │
       │ 5PédA  │ LIBRE │ 5PédA  │ LIBRE │ 5PédA  │
  ─────┼────────┼───────┼────────┼───────┼────────┤
  9h30 │ RÉCRÉATION                                │
  ─────┼────────┼───────┼────────┼───────┼────────┤
  10h  │ Math   │ Math  │        │ Math  │        │
       │ 6ScA   │ 6ScA  │ LIBRE  │ TC-2A │ LIBRE  │
  ─────┼────────┼───────┼────────┼───────┼────────┤

Chaque cellule contient :
- Nom de la matière
- Nom de la classe
- Horaire
- Badge de couleur selon la section


FILTRES & VUES
---------------
1. Mode Enseignant (défaut pour rôle ENSEIGNANT) :
   - Affiche uniquement les cours de l'enseignant connecté
   - Pas de sélecteur (automatique)

2. Mode Classe (pour PRÉFET/SECRÉTAIRE) :
   - Sélecteur de classe
   - Affiche tous les cours de cette classe
   - Indication de l'enseignant pour chaque cours

3. Mode Enseignant spécifique (pour PRÉFET) :
   - Sélecteur d'enseignant
   - Affiche tous les cours de cet enseignant


COMPOSANT TimetableCell.tsx
-----------------------------
Props :
  interface TimetableCellProps {
    period: TimetablePeriod | null
    onEdit?: (period: TimetablePeriod) => void
  }

Si period = null → cellule vide "LIBRE"
Si period existe :
  ┌──────────────────────┐
  │ Mathématiques        │
  │ 4ScA  🟢             │
  │ MUKASA Jean          │ (si vue classe)
  │ [⋮ Modifier]         │ (si Préfet)
  └──────────────────────┘

Couleur de badge selon section :
- TC : bleu
- Sc : vert
- HCG : orange
- Péda : violet
- HT : rouge
- Lit : indigo


API BACKEND
------------
GET /api/timetable/teacher/:teacherId
  Response: { periods: TimetablePeriod[] }

GET /api/timetable/class/:classId
  Response: { periods: TimetablePeriod[] }

POST /api/timetable
  Body: { classId, subjectId, teacherId, dayOfWeek, periodSlot }
  Response: { period: TimetablePeriod }

DELETE /api/timetable/:id
  Response: { success: true }


MODÈLE DE DONNÉES
------------------
TimetablePeriod {
  id: UUID
  classId: UUID
  subjectId: UUID
  teacherId: UUID
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY"
  periodSlot: 1..8 (numéro de la période)
  startTime: "07:30"
  endTime: "08:30"
}


RÈGLES MÉTIER
--------------
1. Un enseignant ne peut pas avoir 2 cours en même temps
2. Une classe ne peut pas avoir 2 cours en même temps
3. Les périodes de récréation ne sont pas modifiables (fixes)
4. L'emploi du temps est modifiable uniquement par le Préfet


FONCTIONNALITÉS AVANCÉES (optionnel)
--------------------------------------
- Export PDF de l'emploi du temps
- Import depuis Excel
- Détection automatique des conflits d'horaire
- Vue imprimable pour affichage en classe


DÉFINITION DE TERMINÉ
----------------------
[ ] Grille hebdomadaire affichée correctement
[ ] Mode enseignant (vue propre emploi du temps)
[ ] Mode classe (vue emploi du temps classe)
[ ] Cellules vides affichent "LIBRE"
[ ] Badges colorés selon section
[ ] API retourne les périodes correctes
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 8 — SCR-012 : SAISIE DES NOTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-012 - Saisie des Notes
Route : /grades/entry
Rôle minimum : ENSEIGNANT
Prérequis : SCR-010 (classes), SCR-011 (emploi du temps)


OBJECTIF
--------
Interface de saisie rapide des notes pour un enseignant.
Cet écran doit fonctionner OFFLINE (SQLite + sync auto).
C'est l'écran le plus critique du module académique.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/academic/GradeEntryPage.tsx
2. packages/client/src/components/academic/GradeEntryTable.tsx
3. packages/client/src/components/academic/GradeInput.tsx
4. packages/client/src/components/academic/LockGradesModal.tsx
5. packages/client/src/lib/offline/gradeQueue.ts
6. packages/server/src/modules/grades/grades.routes.ts
7. packages/server/src/modules/grades/grades.controller.ts
8. packages/server/src/modules/grades/grades.service.ts
9. packages/shared/src/constants/evalTypes.ts


UI — STRUCTURE DE LA PAGE
---------------------------
  ┌──────────────────────────────────────────────────────────┐
  │ SAISIE DES NOTES                                         │
  │                                                          │
  │ Classe: [4ScA ▼]  Matière: [Mathématiques ▼]            │
  │ Trimestre: [T2 ▼]  Type: [Examen trimestriel ▼]         │
  │                                                          │
  │ [🟢 Connecté] | Hors ligne: 0 en attente                │
  ├──────────────────────────────────────────────────────────┤
  │ Élève             │ Note /20 │ Observation │ Statut     │
  ├──────────────────────────────────────────────────────────┤
  │ AMISI Jean-Bapt.  │ [14.5]   │ [          ]│ ✅ Saisi   │
  │ BAHATI Marie      │ [    ]   │ [          ]│ ⏳ Attente │
  │ CIZA Pierre       │ [ 8  ]   │ [Absent    ]│ ⚠️ Note<10 │
  │ DUSABE Alice      │ [17.0]   │ [          ]│ ✅ Saisi   │
  │ ...                                                      │
  ├──────────────────────────────────────────────────────────┤
  │ Progression: 23/35 saisis | Moyenne classe: 12.4/20     │
  │                                                          │
  │ [Enregistrer brouillon] [Verrouiller notes] [Annuler]   │
  └──────────────────────────────────────────────────────────┘


SÉLECTEURS EN-TÊTE
-------------------
1. Classe (Select) :
   - Options : UNIQUEMENT les classes où l'enseignant est assigné
   - API : GET /api/teachers/me/classes

2. Matière (Select) :
   - Options : UNIQUEMENT les matières que l'enseignant enseigne dans cette classe
   - Dépend de la classe sélectionnée
   - API : GET /api/teachers/me/subjects?classId=

3. Trimestre (Select) :
   - T1 | T2 | T3
   - Coloré selon actif/passé : vert=actif, gris=passé, orange=futur

4. Type d'évaluation (Select) :
   - Interrogation (max 10/20 ou 10/10 selon config)
   - Travail Pratique (TP)
   - Examen trimestriel
   - Examen de synthèse


COMPOSANT GradeInput.tsx
-------------------------
Input numérique avec validation en temps réel.

Props :
  interface GradeInputProps {
    studentId: string
    currentValue: number | null
    maxScore: number  // 10 ou 20
    onChange: (value: number | null) => void
    isLocked: boolean
  }

Comportement :
- Type: number
- Min: 0
- Max: maxScore (10 ou 20)
- Step: 0.25 (pour notes type 14.75)
- Couleur bordure :
  * Vide : gris
  * < seuil passage : rouge
  * ≥ seuil passage : vert
- Si isLocked = true → disabled + icône cadenas 🔒


BARRE DE PROGRESSION
---------------------
Affiche en temps réel :
- Nombre de notes saisies / Total élèves
- Moyenne provisoire de la classe
- Pourcentage de complétion (barre visuelle)

Calcul moyenne :
```typescript
const average = grades
  .filter(g => g.score !== null)
  .reduce((sum, g) => sum + g.score, 0) / gradesCount
```


BADGES STATUT PAR LIGNE
-------------------------
- ✅ Saisi (vert) : note saisie
- ⏳ Attente (gris) : pas encore de note
- ⚠️ Note basse (orange) : note < 10/20 (ou < 5/10)
- 🔴 Éliminatoire (rouge) : note < seuil éliminatoire défini


BOUTON "VERROUILLER NOTES"
---------------------------
Modal de confirmation :
  ┌─────────────────────────────────────────────────┐
  │ ⚠️  VERROUILLER LES NOTES ?                     │
  │                                                 │
  │ Cette action est irréversible sans              │
  │ l'autorisation du Préfet.                       │
  │                                                 │
  │ Notes concernées: 35                            │
  │ Classe: 4ScA                                    │
  │ Matière: Mathématiques                          │
  │ Type: Examen trimestriel                        │
  │                                                 │
  │ [Annuler] [Verrouiller définitivement]          │
  └─────────────────────────────────────────────────┘

Après verrouillage :
- Tous les inputs deviennent disabled
- Badge 🔒 affiché en haut
- Notification envoyée au Préfet
- Impossibilité de modifier (sauf Préfet via SCR-015)


MODE OFFLINE (CRITIQUE)
------------------------
Fichier : lib/offline/gradeQueue.ts

Interface SyncQueueItem :
```typescript
{
  id: string
  type: 'grade_create' | 'grade_update'
  data: {
    studentId: string
    subjectId: string
    termId: string
    evalType: string
    score: number
    observation?: string
  }
  timestamp: number
  syncStatus: 'pending' | 'syncing' | 'error'
}
```

Workflow :
1. Enseignant saisit note → sauvegarde IMMÉDIATE dans Dexie
2. Ajout dans syncQueue
3. Badge orange "Hors ligne" affiché
4. Au retour de connexion → POST /api/grades/batch-sync automatique
5. Suppression de syncQueue si succès
6. Badge vert "Connecté" + toast "X notes synchronisées"


API BACKEND
------------
GET /api/grades?classId=&subjectId=&termId=&evalType=
  Response: { grades: Grade[] }

POST /api/grades/batch
  Body: { grades: [{ studentId, score, observation }] }
  Response: { saved: number, errors: GradeError[] }

PATCH /api/grades/:id/lock
  Body: { locked: true }
  Response: { success: true }

POST /api/grades/batch-sync (depuis offline)
  Body: { queue: SyncQueueItem[], deviceId }
  Response: { processed: number, conflicts: Conflict[] }


FICHIER PARTAGÉ : shared/src/constants/evalTypes.ts
-----------------------------------------------------
```typescript
export const EVAL_TYPES = {
  INTERRO: { code: 'INTERRO', label: 'Interrogation', weight: 0.2 },
  TP: { code: 'TP', label: 'Travail Pratique', weight: 0.3 },
  EXAM_TRIM: { code: 'EXAM_TRIM', label: 'Examen trimestriel', weight: 0.5 },
  EXAM_SYNTH: { code: 'EXAM_SYNTH', label: 'Examen de synthèse', weight: 1.0 }
} as const

export type EvalType = keyof typeof EVAL_TYPES
```


RÈGLES MÉTIER (CRITIQUES)
---------------------------
1. Un enseignant ne peut saisir que les notes de ses cours assignés
2. Note sur 10 ou 20 selon la config de la matière (SCR-045)
3. Note < seuil éliminatoire → ligne rouge + alerte dashboard
4. Mode offline → notes en SQLite local, sync auto au retour connexion
5. Verrouillage → seul Préfet peut déverrouiller (via SCR-015)
6. Notification push Préfet quand toutes notes classe/matière saisies


DÉFINITION DE TERMINÉ
----------------------
[ ] Sélecteurs filtrés selon enseignant connecté
[ ] Table de saisie avec validation temps réel
[ ] Badges statut corrects selon note saisie
[ ] Barre progression + moyenne temps réel
[ ] Sauvegarde offline dans Dexie fonctionne
[ ] Sync auto au retour connexion
[ ] Verrouillage empêche modification
[ ] Tests offline : couper WiFi, saisir, reconnecter → sync ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4 / 8 — SCR-013 : VUE NOTES PAR CLASSE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-013 - Vue Notes par Classe
Route : /grades/:classId
Rôle minimum : SECRÉTAIRE
Prérequis : SCR-012 (notes saisies)


OBJECTIF
--------
Vue d'ensemble de toutes les notes d'une classe pour un trimestre.
Permet de vérifier que toutes les notes sont saisies avant la délibération.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/academic/ClassGradesPage.tsx
2. packages/client/src/components/academic/GradesMatrix.tsx
3. packages/client/src/components/academic/MissingGradesAlert.tsx


UI — MATRICE DES NOTES
------------------------
Vue en tableau croisé : Élèves × Matières

         │ Math │ Phys │ Chim │ Bio │ Fr │ Ang │ ... │ Moy │ Rang │
  ───────┼──────┼──────┼──────┼─────┼────┼─────┼─────┼─────┼──────┤
  AMISI  │ 14.5 │ 12   │ 13   │ 15  │ 11 │ 12  │ ... │ 13.2│  3   │
  BAHATI │ 16   │ 15   │ 17   │ 16  │ 14 │ 15  │ ... │ 15.4│  1   │
  CIZA   │  8   │ ——   │ 10   │  9  │ 11 │ ——  │ ... │ ——  │ ——   │
  DUSABE │ 17   │ 16   │ 15   │ 18  │ 13 │ 14  │ ... │ 15.1│  2   │

Légende :
- Note présente : affichée normalement
- Note manquante : "——" en gris italic
- Note < 10 : rouge
- Note ≥ 14 : vert
- Note éliminatoire : rouge gras + ⚠️


ALERTE NOTES MANQUANTES
-------------------------
En haut de page, si notes manquantes :

  ┌───────────────────────────────────────────────────┐
  │ ⚠️  NOTES MANQUANTES                              │
  │                                                   │
  │ 12 notes manquantes pour ce trimestre :           │
  │ • Chimie (3 élèves) — Enseignant: MUKASA         │
  │ • Anglais (5 élèves) — Enseignant: BAHATI        │
  │ • Biologie (4 élèves) — Enseignant: CIZA         │
  │                                                   │
  │ [Relancer les enseignants par SMS]                │
  └───────────────────────────────────────────────────┘

Relance SMS :
- Template : "{Enseignant}, {N} notes manquantes en {Matière} ({Classe}). Veuillez compléter avant le {date_limite}."


FILTRES
--------
- Sélecteur trimestre : T1 | T2 | T3
- Type d'évaluation : Interrogation | TP | Examen | Toutes
- Affichage : Notes brutes | Moyennes calculées


ACTIONS RAPIDES
----------------
- Export Excel de la matrice
- Imprimer (format paysage A4)
- Envoyer rapport au Préfet


API BACKEND
------------
GET /api/grades/class/:classId/matrix?termId=&evalType=
  Response: {
    matrix: {
      students: Student[]
      subjects: Subject[]
      grades: Record<studentId, Record<subjectId, number | null>>
      averages: Record<studentId, number | null>
      ranks: Record<studentId, number | null>
    }
    missing: {
      subjectId: string
      subjectName: string
      teacherId: string
      teacherName: string
      count: number
    }[]
  }


RÈGLES MÉTIER
--------------
1. Notes non saisies affichées comme "——"
2. Impossible de calculer moyenne si notes manquantes
3. Rang non attribué si moyenne incomplète
4. Accès en lecture seule (modifications via SCR-012)


DÉFINITION DE TERMINÉ
----------------------
[ ] Matrice affichée correctement
[ ] Notes manquantes en "——" gris italic
[ ] Alertes notes manquantes en haut
[ ] Bouton relance SMS enseignants
[ ] Export Excel fonctionne
[ ] Responsive : scroll horizontal sur mobile
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 5 / 8 — SCR-014 : CALCUL DES MOYENNES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-014 - Calcul des Moyennes
Route : /grades/averages
Rôle minimum : SECRÉTAIRE
Prérequis : SCR-012 (notes saisies), SCR-013 (vue notes)


OBJECTIF
--------
Calculer automatiquement les moyennes selon la formule officielle du système
éducatif RDC. Cet écran prépare les données pour la délibération (SCR-015).


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/academic/AveragesPage.tsx
2. packages/client/src/components/academic/AveragesTable.tsx
3. packages/client/src/components/academic/FormulaExplanation.tsx
4. packages/shared/src/utils/gradeCalc.ts  ← **FICHIER CRITIQUE**


FICHIER PARTAGÉ CRITIQUE : shared/src/utils/gradeCalc.ts
----------------------------------------------------------
```typescript
/**
 * Formules officielles de calcul des moyennes selon le système EPSP-RDC
 */

export interface SubjectGrade {
  subjectId: string
  coefficient: number
  interro?: number
  tp?: number
  exam?: number
  maxScore: number  // 10 ou 20
}

export interface SubjectAverage {
  subjectId: string
  average: number
  rank: number
  isEliminatory: boolean
  hasFailed: boolean  // true si < seuil éliminatoire
}

/**
 * Calcule la moyenne d'une matière selon pondération des évaluations
 */
export function calculateSubjectAverage(grades: {
  interro?: number
  tp?: number
  exam?: number
}): number {
  // Pondération officielle RDC :
  // Interrogation : 20%
  // TP : 30%
  // Examen : 50%
  
  const weights = { interro: 0.2, tp: 0.3, exam: 0.5 }
  let total = 0
  let totalWeight = 0
  
  Object.entries(grades).forEach(([type, score]) => {
    if (score !== undefined && score !== null) {
      total += score * weights[type as keyof typeof weights]
      totalWeight += weights[type as keyof typeof weights]
    }
  })
  
  return totalWeight > 0 ? total / totalWeight : 0
}

/**
 * Calcule la moyenne générale pondérée par les coefficients
 */
export function calculateGeneralAverage(
  subjectAverages: { average: number; coefficient: number }[]
): number {
  const totalPoints = subjectAverages.reduce(
    (sum, s) => sum + (s.average * s.coefficient),
    0
  )
  const totalCoefficients = subjectAverages.reduce(
    (sum, s) => sum + s.coefficient,
    0
  )
  
  return totalCoefficients > 0 ? totalPoints / totalCoefficients : 0
}

/**
 * Calcule le total des points (pour le système de points RDC)
 */
export function calculateTotalPoints(
  generalAverage: number,
  totalCoefficients: number
): number {
  return generalAverage * totalCoefficients
}

/**
 * Génère le classement par ordre décroissant de points totaux
 * Gère les ex-aequo (même rang, suivant décalé)
 */
export function calculateRanking(
  students: { id: string; totalPoints: number }[]
): Record<string, number> {
  const sorted = [...students].sort((a, b) => b.totalPoints - a.totalPoints)
  const ranks: Record<string, number> = {}
  
  let currentRank = 1
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].totalPoints < sorted[i - 1].totalPoints) {
      currentRank = i + 1
    }
    ranks[sorted[i].id] = currentRank
  }
  
  return ranks
}

/**
 * Vérifie si une note est éliminatoire
 */
export function checkEliminatory(
  score: number,
  threshold: number,
  isEliminatorySubject: boolean
): boolean {
  return isEliminatorySubject && score < threshold
}

/**
 * Suggère une décision de délibération (utilisé dans SCR-015)
 */
export function suggestDelibDecision(
  generalAverage: number,
  hasEliminatoryFailure: boolean
): string {
  if (hasEliminatoryFailure) return 'FAILED'
  if (generalAverage >= 16) return 'GREAT_DISTINCTION'
  if (generalAverage >= 14) return 'DISTINCTION'
  if (generalAverage >= 10) return 'ADMITTED'
  if (generalAverage >= 8) return 'ADJOURNED'
  return 'FAILED'
}
```


UI — TABLEAU DE CALCUL
------------------------
  ┌──────────────────────────────────────────────────────────┐
  │ CALCUL DES MOYENNES — 4ScA — Trimestre 2                 │
  ├──────────────────────────────────────────────────────────┤
  │ Classe: [4ScA ▼]  Trimestre: [T2 ▼]                      │
  │                                                          │
  │ [Recalculer] [Valider les moyennes] [Export Excel]      │
  ├──────────────────────────────────────────────────────────┤
  │ Élève    │ Math │ Phys │ Chim │ ... │ Total │ Moy │ Rang │
  ├──────────────────────────────────────────────────────────┤
  │ AMISI    │ 14.5 │ 12.0 │ 13.0 │ ... │ 312   │13.2 │  3   │
  │ BAHATI   │ 16.0 │ 15.0 │ 17.0 │ ... │ 368   │15.4 │  1   │
  │ CIZA     │  8.0 │ 10.0 │  9.0 │ ... │ 228   │ 9.5 │ 28   │
  │ DUSABE   │ 17.0 │ 16.0 │ 15.0 │ ... │ 361   │15.1 │  2   │
  │ ...                                                      │
  └──────────────────────────────────────────────────────────┘

Colonnes :
- Moyennes par matière (calculées depuis interro/TP/exam)
- Total points (moyenne générale × total coefficients)
- Moyenne générale sur 20
- Rang dans la classe


BADGES DE SEUIL
----------------
Colonne Moy avec badge coloré :
- Vert : ≥ 10/20 (seuil de passage)
- Rouge : < 10/20 (échec)
- Orange : matière éliminatoire échouée (⚠️)


BOUTON "RECALCULER"
--------------------
Déclenche le recalcul complet côté serveur.
Affiche un spinner + "Calcul en cours..."

POST /api/grades/calculate-averages
  Body: { classId, termId }
  Response: {
    averages: [{
      studentId
      subjectAverages: [{ subjectId, average, rank }]
      generalAverage
      totalPoints
      rank
      hasEliminatoryFailure
    }]
  }


BOUTON "VALIDER LES MOYENNES"
------------------------------
Action IRRÉVERSIBLE sans autorisation Préfet.

Modal de confirmation :
  ┌─────────────────────────────────────────────────┐
  │ ⚠️  VALIDER LES MOYENNES ?                      │
  │                                                 │
  │ Une fois validées, les moyennes seront          │
  │ figées pour la délibération.                    │
  │                                                 │
  │ Seul le Préfet pourra les déverrouiller.        │
  │                                                 │
  │ Élèves concernés: 35                            │
  │ Classe: 4ScA — Trimestre: T2                    │
  │                                                 │
  │ [Annuler] [Valider définitivement]              │
  └─────────────────────────────────────────────────┘

Après validation :
- Passage automatique à l'étape délibération (SCR-015)
- Notification Préfet
- Les notes sous-jacentes sont verrouillées


API BACKEND
------------
POST /api/grades/calculate-averages
  Body: { classId, termId }
  → Calcule moyennes avec gradeCalc.ts
  → Retourne tableau complet

POST /api/grades/validate-averages
  Body: { classId, termId }
  → Marque moyennes comme validated
  → Crée entrée dans table deliberations (status: DRAFT)
  → Retourne { deliberationId }


FORMULE AFFICHÉE (FormulaExplanation.tsx)
-------------------------------------------
Composant collapsible qui explique la formule :

  ┌─────────────────────────────────────────────────┐
  │ ℹ️  FORMULE DE CALCUL (système EPSP-RDC)        │
  │                                                 │
  │ Moyenne Matière =                               │
  │   (Interro×20% + TP×30% + Examen×50%)           │
  │                                                 │
  │ Moyenne Générale =                              │
  │   Σ(Moyenne_Matière × Coeff) / Σ(Coeff)        │
  │                                                 │
  │ Total Points =                                  │
  │   Moyenne_Générale × Total_Coefficients         │
  │                                                 │
  │ Seuil de Passage = 50% (10/20)                  │
  │                                                 │
  │ [Voir exemples de calcul]                       │
  └─────────────────────────────────────────────────┘


RÈGLES MÉTIER
--------------
1. Toutes les notes doivent être saisies avant calcul
2. Rang calculé par ordre décroissant de total points
3. Ex-aequo → même rang, suivant décalé
4. Note éliminatoire → échec automatique même si moy ≥ 10
5. Validation → irréversible sans autorisation Préfet


DÉFINITION DE TERMINÉ
----------------------
[ ] Fichier gradeCalc.ts créé avec toutes les formules
[ ] Tests unitaires gradeCalc.ts passent (Vitest)
[ ] Tableau de calcul affiche moyennes correctes
[ ] Badges de couleur selon seuil
[ ] Recalcul fonctionne
[ ] Validation fige les moyennes
[ ] Formule affichée dans composant collapsible
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 6 / 8 — SCR-015 : DÉLIBÉRATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-015 - Délibération
Route : /deliberation
Rôle minimum : PRÉFET (exclusif)
Prérequis : SCR-014 (moyennes calculées et validées)


OBJECTIF
--------
Conseil de classe final pour attribuer les décisions (Admis, Ajourné, Refusé).
C'est l'écran le plus sensible du système : décisions officielles pour les élèves.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/academic/DeliberationPage.tsx
2. packages/client/src/components/academic/DeliberationWizard.tsx
3. packages/client/src/components/academic/DecisionSelector.tsx
4. packages/client/src/components/academic/DeliberationSummary.tsx
5. packages/client/src/components/academic/PVGenerator.tsx
6. packages/shared/src/constants/decisions.ts


FICHIER PARTAGÉ : shared/src/constants/decisions.ts
----------------------------------------------------
```typescript
export const DELIB_DECISIONS = {
  ADMITTED: {
    code: 'ADMITTED',
    label: 'Admis(e)',
    color: 'green',
    condition: 'Moy ≥ 10/20 + aucune éliminatoire échouée'
  },
  DISTINCTION: {
    code: 'DISTINCTION',
    label: 'Admis(e) avec Distinction',
    color: 'darkgreen',
    condition: 'Moy ≥ 14/20'
  },
  GREAT_DISTINCTION: {
    code: 'GREAT_DISTINCTION',
    label: 'Admis(e) Grande Distinction',
    color: 'gold',
    condition: 'Moy ≥ 16/20'
  },
  ADJOURNED: {
    code: 'ADJOURNED',
    label: 'Ajourné(e)',
    color: 'orange',
    condition: '8/20 ≤ Moy < 10/20'
  },
  FAILED: {
    code: 'FAILED',
    label: 'Refusé(e)',
    color: 'red',
    condition: 'Moy < 8/20 OU éliminatoire échouée'
  },
  MEDICAL: {
    code: 'MEDICAL',
    label: 'Reporté(e) - Maladie',
    color: 'blue',
    condition: 'Décision spéciale Préfet avec justificatif'
  }
} as const

export type DelibDecision = keyof typeof DELIB_DECISIONS
```


UI — WIZARD EN 4 ÉTAPES
-------------------------
  ┌──────────────────────────────────────────────────────────┐
  │ DÉLIBÉRATION — 4ScA — Trimestre 2 — Année 2024-2025      │
  ├──────────────────────────────────────────────────────────┤
  │                                                          │
  │ [━━━●━━━━━━━━━━━━━━━━━━━━━━━━]                           │
  │  1. Vérif  2. Calcul  3. Décisions  4. PV                │
  │                                                          │
  │ [CONTENU DE L'ÉTAPE ACTIVE]                              │
  │                                                          │
  │ [← Précédent]                        [Suivant →]         │
  └──────────────────────────────────────────────────────────┘


ÉTAPE 1 — VÉRIFICATION
-----------------------
Checklist automatique :

  ✅ Toutes les notes saisies (35/35 élèves)
  ✅ Toutes les notes verrouillées
  ✅ Moyennes calculées et validées
  ⚠️  3 élèves avec notes éliminatoires

Si une condition non remplie → blocage + message d'erreur.


ÉTAPE 2 — CALCUL AUTOMATIQUE
------------------------------
Affiche les moyennes déjà calculées (depuis SCR-014).
Tableau récapitulatif :

  Élève       │ Moyenne │ Points │ Mtn Elim │ Suggestion
  ────────────┼─────────┼────────┼──────────┼────────────
  AMISI Jean  │ 14.2    │ 227    │ Non      │ Admis Dist.
  BAHATI Marie│ 09.8    │ 157    │ Non      │ Ajourné
  CIZA Pierre │ 11.5    │ 184    │ OUI (Chim)│ Refusé

Colonne "Suggestion" = décision proposée par l'algorithme.


ÉTAPE 3 — DÉCISIONS (LA PLUS IMPORTANTE)
------------------------------------------
Tableau éditable :

  Élève      │ Moy │ Suggest.  │ Décision finale │ Justif.
  ───────────┼─────┼───────────┼─────────────────┼────────
  AMISI Jean │14.2 │ Admis Dist│ [Admis Dist ▼]  │ [     ]
  BAHATI M.  │ 9.8 │ Ajourné   │ [Ajourné ▼]     │ [     ]
  CIZA P.    │11.5 │ Refusé    │ [Admis ▼]       │ [requis]

Composant DecisionSelector.tsx :
- Select avec les 6 décisions possibles
- Si décision ≠ suggestion → champ Justification devient requis
- Couleur de fond selon décision choisie


ÉTAPE 4 — RÉCAPITULATIF & GÉNÉRATION PV
-----------------------------------------
Résumé final avant validation :

  ┌─────────────────────────────────────────────────┐
  │ RÉCAPITULATIF DE LA DÉLIBÉRATION                │
  │                                                 │
  │ Classe: 4ScA                                    │
  │ Trimestre: T2                                   │
  │ Date: 19/02/2026                                │
  │ Président: M. MUKASA Jean (Préfet)              │
  │                                                 │
  │ ✅ 28 Admis (80%)                               │
  │ ⚠️  5 Ajournés (14%)                            │
  │ ❌ 2 Refusés (6%)                               │
  │                                                 │
  │ Décisions modifiées: 3                          │
  │ (contre suggestion automatique)                 │
  │                                                 │
  │ [Modifier] [Valider la délibération]            │
  └─────────────────────────────────────────────────┘

Bouton "Valider" :
- Modal de confirmation ultime
- Signature électronique du Préfet (optionnel)
- Irréversible


POST-VALIDATION
----------------
1. Génération automatique du PV (Procès-Verbal) en PDF
2. Génération en batch de TOUS les bulletins de la classe (SCR-016)
3. Notification SMS à tous les parents
4. Verrouillage définitif de la délibération


API BACKEND
------------
GET /api/deliberation/:classId/:termId
  → Charge données + calcule suggestions
  Response: {
    students: Student[]
    averages: Record<studentId, Average>
    suggestions: Record<studentId, DelibDecision>
  }

POST /api/deliberation/:classId/:termId/validate
  Body: {
    decisions: [{
      studentId
      decision: DelibDecision
      justification?: string
    }]
    prefetSignature?: string
  }
  Response: {
    pv_url: string  // PDF du PV
    bulletin_batch_job_id: string  // ID du job de génération bulletins
  }


GÉNÉRATION PV (PVGenerator.tsx)
--------------------------------
Template PDF officiel :

```
        RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
          PROVINCE DU NORD-KIVU — GOMA
          
    PROCÈS-VERBAL DE DÉLIBÉRATION TRIMESTRIELLE
    
École: Institut Technique de Goma
Classe: 4ème Scientifique A
Trimestre: Deuxième trimestre 2024-2025
Date: 19 février 2026

Président: M. MUKASA Jean, Préfet

RÉSULTATS:
- Inscrits: 35
- Admis: 28 (80%)
- Ajournés: 5 (14%)
- Refusés: 2 (6%)

[Tableau détaillé par élève avec nom, moyenne, décision]

Fait à Goma, le 19/02/2026

[Signature Préfet]            [Cachet de l'école]
```


RÈGLES MÉTIER
--------------
1. Seul le Préfet peut effectuer la délibération
2. Toutes les notes doivent être verrouillées avant
3. Modification d'une suggestion → justification obligatoire
4. Validation → action IRRÉVERSIBLE
5. Génération automatique PV + bulletins après validation
6. SMS envoyé à chaque parent après validation


DÉFINITION DE TERMINÉ
----------------------
[ ] Wizard 4 étapes fonctionne
[ ] Étape 1 vérifie toutes les conditions
[ ] Étape 2 affiche moyennes calculées
[ ] Étape 3 permet modification décisions
[ ] Champ justification requis si ≠ suggestion
[ ] Étape 4 affiche récapitulatif complet
[ ] Validation génère PV PDF
[ ] Validation déclenche génération batch bulletins
[ ] Délibération verrouillée après validation
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 7 / 8 — SCR-016 : BULLETIN SCOLAIRE ÉLÈVE (PDF)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-016 - Bulletin Scolaire Élève
Route : /bulletin/:studentId/:termId
Rôle minimum : SECRÉTAIRE
Prérequis : SCR-015 (délibération validée)


OBJECTIF
--------
Générer le bulletin scolaire officiel conforme EPSP-RDC.
Ce PDF est le document officiel remis aux parents.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/academic/BulletinPage.tsx
2. packages/server/src/modules/bulletins/bulletins.routes.ts
3. packages/server/src/modules/bulletins/bulletins.service.ts
4. packages/server/src/modules/bulletins/templates/bulletin.html


TEMPLATE HTML — bulletin.html
-------------------------------
Template Puppeteer pour génération PDF A4 portrait.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.4;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #1B5E20;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .logo { width: 60px; height: 60px; }
    .school-name { font-size: 16pt; font-weight: bold; color: #1B5E20; }
    .province { font-size: 10pt; color: #424242; }
    
    .student-info {
      display: flex;
      margin: 15px 0;
      border: 2px solid #1B5E20;
      padding: 10px;
    }
    .photo { width: 80px; height: 100px; margin-right: 15px; }
    
    table.grades {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table.grades th {
      background: #1B5E20;
      color: white;
      padding: 8px;
      text-align: center;
      font-size: 9pt;
    }
    table.grades td {
      border: 1px solid #BDBDBD;
      padding: 6px;
      text-align: center;
      font-size: 10pt;
    }
    
    .decision {
      text-align: center;
      font-size: 18pt;
      font-weight: bold;
      padding: 15px;
      margin: 20px 0;
      border: 3px solid;
    }
    .decision.admitted { border-color: #1B5E20; color: #1B5E20; }
    .decision.failed { border-color: #B71C1C; color: #B71C1C; }
    .decision.adjourned { border-color: #E65100; color: #E65100; }
    
    .signatures {
      display: flex;
      justify-content: space-around;
      margin-top: 30px;
    }
    .signature-box {
      width: 40%;
      border-top: 1px solid #212121;
      padding-top: 10px;
      text-align: center;
      font-size: 9pt;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="{{logoUrl}}" class="logo" />
    <div class="school-name">{{schoolName}}</div>
    <div class="province">Province du {{province}} — {{ville}}</div>
    <div style="font-size: 12pt; margin-top: 5px;">BULLETIN SCOLAIRE</div>
    <div style="font-size: 9pt; color: #757575;">
      Année Scolaire {{academicYear}} — {{termLabel}}
    </div>
  </div>
  
  <div class="student-info">
    <img src="{{studentPhoto}}" class="photo" />
    <div style="flex: 1;">
      <div><strong>Nom:</strong> {{studentName}}</div>
      <div><strong>Matricule:</strong> {{matricule}}</div>
      <div><strong>Classe:</strong> {{className}} ({{sectionName}})</div>
      <div><strong>N° Bulletin:</strong> {{bulletinNumber}} (100 FC)</div>
    </div>
  </div>
  
  <table class="grades">
    <thead>
      <tr>
        <th>Matière</th>
        <th>Coeff</th>
        <th>Interro</th>
        <th>TP</th>
        <th>Exam</th>
        <th>Total</th>
        <th>Moy</th>
        <th>Rang</th>
      </tr>
    </thead>
    <tbody>
      {{#each subjects}}
      <tr>
        <td style="text-align: left;">{{name}}</td>
        <td>{{coefficient}}</td>
        <td>{{interro}}</td>
        <td>{{tp}}</td>
        <td>{{exam}}</td>
        <td>{{total}}</td>
        <td>{{average}}</td>
        <td>{{rank}}</td>
      </tr>
      {{/each}}
    </tbody>
    <tfoot>
      <tr style="font-weight: bold; background: #F5F5F5;">
        <td colspan="5" style="text-align: right;">TOTAL POINTS:</td>
        <td colspan="3">{{totalPoints}} / {{maxPoints}}</td>
      </tr>
      <tr style="font-weight: bold; background: #F5F5F5;">
        <td colspan="5" style="text-align: right;">MOYENNE GÉNÉRALE:</td>
        <td colspan="3">{{generalAverage}} / 20</td>
      </tr>
      <tr style="font-weight: bold; background: #F5F5F5;">
        <td colspan="5" style="text-align: right;">RANG:</td>
        <td colspan="3">{{rank}}{{getRankSuffix rank}} / {{totalStudents}}</td>
      </tr>
    </tfoot>
  </table>
  
  <div style="margin: 15px 0;">
    <strong>APPRÉCIATION DU PRÉFET:</strong>
    <div style="border: 1px solid #BDBDBD; padding: 10px; min-height: 60px;">
      {{appreciation}}
    </div>
  </div>
  
  <div class="decision {{decisionClass}}">
    {{decisionLabel}}
  </div>
  
  <div class="signatures">
    <div class="signature-box">
      Le Préfet<br><br>
      {{prefetName}}<br>
      [Cachet de l'école]
    </div>
    <div class="signature-box">
      Visa du Parent<br>
      (Accusé de réception)<br><br>
      _____________________
    </div>
  </div>
  
  <div style="text-align: center; font-size: 8pt; color: #757575; margin-top: 30px;">
    N° Agrément: {{agrement}} — Code EDU-NK — Édité le {{issuedDate}}
  </div>
</body>
</html>
```


SERVICE BACKEND — bulletins.service.ts
----------------------------------------
```typescript
export async function generateBulletin(
  studentId: string,
  termId: string
): Promise<Buffer> {
  // 1. Charger toutes les données
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      school: true,
      enrollments: { include: { class: { include: { section: true } } } }
    }
  })
  
  const grades = await prisma.grade.findMany({
    where: { studentId, termId },
    include: { subject: true }
  })
  
  const deliberation = await prisma.delibResult.findFirst({
    where: { studentId, deliberation: { termId } }
  })
  
  // 2. Calculer moyennes par matière
  const subjectData = grades.reduce((acc, g) => {
    if (!acc[g.subjectId]) {
      acc[g.subjectId] = {
        name: g.subject.name,
        coefficient: g.subject.coefficient,
        interro: null,
        tp: null,
        exam: null
      }
    }
    
    if (g.evalType === 'INTERRO') acc[g.subjectId].interro = g.score
    if (g.evalType === 'TP') acc[g.subjectId].tp = g.score
    if (g.evalType === 'EXAM_TRIM') acc[g.subjectId].exam = g.score
    
    return acc
  }, {})
  
  // 3. Compiler le template HTML
  const template = await fs.readFile(
    path.join(__dirname, 'templates/bulletin.html'),
    'utf-8'
  )
  
  const compiled = Handlebars.compile(template)
  const html = compiled({
    logoUrl: student.school.logoUrl,
    schoolName: student.school.name,
    province: student.school.province,
    ville: student.school.ville,
    academicYear: '2024-2025',
    termLabel: 'Trimestre 2',
    studentPhoto: student.photoUrl,
    studentName: `${student.nom} ${student.postNom} ${student.prenom}`,
    matricule: student.matricule,
    className: enrollment.class.name,
    sectionName: enrollment.class.section.name,
    bulletinNumber: generateBulletinNumber(student.id, termId),
    subjects: Object.values(subjectData),
    totalPoints: deliberation.totalPoints,
    maxPoints: 400,  // À calculer dynamiquement
    generalAverage: deliberation.generalAverage.toFixed(2),
    rank: deliberation.rank,
    totalStudents: 35,  // À calculer
    appreciation: deliberation.appreciation || "Bon élève, continue.",
    decisionLabel: DELIB_DECISIONS[deliberation.decision].label,
    decisionClass: getDecisionClass(deliberation.decision),
    prefetName: "M. MUKASA Jean",
    agrement: student.school.agrement,
    issuedDate: format(new Date(), 'dd/MM/yyyy')
  })
  
  // 4. Générer PDF avec Puppeteer
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(html)
  
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true
  })
  
  await browser.close()
  
  return pdf
}
```


API ROUTES
-----------
GET /api/bulletin/:studentId/:termId
  → Génère et retourne le PDF
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="Bulletin_{MATRICULE}_{T2}.pdf"

POST /api/bulletin/batch
  Body: { classId, termId }
  → Génère TOUS les bulletins d'une classe en background
  Response: { jobId, total }

GET /api/bulletin/batch/:jobId
  → Statut du job de génération batch
  Response: { status, progress, downloadUrl? }


PAGE FRONTEND — BulletinPage.tsx
----------------------------------
Interface simple :

  ┌──────────────────────────────────────────────────┐
  │ BULLETIN SCOLAIRE                                │
  │                                                  │
  │ Élève: AMISI Jean-Baptiste (4ScA)                │
  │ Trimestre: T2                                    │
  │                                                  │
  │ [Aperçu] [Télécharger PDF] [Imprimer]           │
  │                                                  │
  │ [Iframe preview du PDF]                          │
  │                                                  │
  └──────────────────────────────────────────────────┘

Accessible depuis :
- Fiche élève (SCR-006) → menu ⋮
- Après délibération (SCR-015) → génération automatique


RÈGLES MÉTIER
--------------
1. Bulletin généré seulement après délibération validée
2. Format A4 portrait obligatoire (norme EPSP)
3. N° de bulletin unique : {SCHOOL}-{YEAR}-{SEQ}
4. Coût bulletin : 100 FC (mention obligatoire)
5. Décision affichée en GRAND et CENTRÉ


DÉFINITION DE TERMINÉ
----------------------
[ ] Template HTML bulletin.html complet
[ ] Service génération PDF fonctionne
[ ] Toutes les données du bulletin correctes
[ ] Décision colorée selon résultat
[ ] Format A4 respecté
[ ] Génération batch pour toute une classe
[ ] PDF téléchargeable depuis frontend
[ ] Impression directe possible
```

---
