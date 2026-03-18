# ⚙️ EDUGOMA 360 — MODULE PARAMÈTRES COMPLET (PARTIE 3/3)
## Prompts SCR-035 à SCR-036 | Gestion Classes & Gestion Utilisateurs

> **MODE D'EMPLOI :**
> Ce fichier contient les **2 derniers prompts** du module Settings (partie 3/3).
> Prérequis : SCR-032 à SCR-034 doivent être complétés.
> Exécute ces prompts dans l'ordre : 035 → 036.

---

## CONTEXTE GLOBAL (rappel rapide)

```
Projet     : EduGoma 360 — Gestion école secondaire, Goma, RDC
Stack      : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
State      : Zustand (auth) + TanStack Query (serveur)
Offline    : Dexie.js + Service Worker
Backend    : Express + Prisma + PostgreSQL
Palette    : Vert #1B5E20 (primary) | Or #F57F17 (accent) | Bleu #0D47A1 (info)
Monorepo   : packages/client + packages/server + packages/shared

Module     : Paramètres & Configuration
Écrans     : SCR-035 à SCR-036 (2 derniers écrans)
Prérequis  : SCR-032 (École), SCR-033 (Année), SCR-034 (Sections)
Rôles      : PRÉFET uniquement
Complexité : ⭐⭐⭐⭐⭐
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 2 — SCR-035 : GESTION DES CLASSES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/settings/ClassesManagementPage.tsx
Route : /settings/classes
Accès : Protégé (authentification requise)
Rôle minimum requis : PRÉFET


OBJECTIF
--------
Créer et gérer toutes les classes de l'école avec attribution des enseignants
titulaires et enseignants par matière. Génération automatique d'emploi du temps.
Configuration des effectifs maximum et salles de classe.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/settings/ClassesManagementPage.tsx           ← CRÉER (page principale)
2. packages/client/src/components/settings/ClassCard.tsx                  ← CRÉER (carte classe)
3. packages/client/src/components/settings/CreateClassModal.tsx           ← CRÉER (modal création)
4. packages/client/src/components/settings/AssignTeachersModal.tsx        ← CRÉER (attribution profs)
5. packages/client/src/components/settings/TimetableGeneratorModal.tsx    ← CRÉER (génération emploi)
6. packages/client/src/components/settings/ClassStatsCards.tsx            ← CRÉER (statistiques)
7. packages/client/src/hooks/useClasses.ts                                ← CRÉER (hook TanStack Query)
8. packages/server/src/modules/classes/classes.routes.ts                  ← CRÉER
9. packages/server/src/modules/classes/classes.controller.ts              ← CRÉER
10. packages/server/src/modules/classes/classes.service.ts                ← CRÉER
11. packages/server/src/lib/timetable/timetableGenerator.ts               ← CRÉER (algorithme)


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ GESTION DES CLASSES                       [+ Créer classe]       │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ Total      │ │ Classes    │ │ Effectif   │ │ Salles     │   │
  │  │ classes    │ │ complètes  │ │ moyen      │ │ utilisées  │   │
  │  │ 24         │ │ 18/24      │ │ 32 élèves  │ │ 22/24      │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  Filtres : [Toutes sections ▼] [Toutes années ▼] [🔍 Rechercher]│
  │                                                                  │
  │  TRONC COMMUN                                                    │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ TC-1A                                    [Gérer] [⋮]        │ │
  │  │ 1ère année • Salle 101                                      │ │
  │  │ Effectif: 28/35 élèves • 🟢 80%                             │ │
  │  │                                                            │ │
  │  │ 👨‍🏫 Titulaire: MUKASA Jean                                  │ │
  │  │ 📚 Matières: 11/11 attribuées                               │ │
  │  │ 📅 Emploi du temps: ✅ Généré                               │ │
  │  │                                                            │ │
  │  │ [Voir détails] [Attribution enseignants] [Emploi du temps] │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ TC-1B                                    [Gérer] [⋮]        │ │
  │  │ 1ère année • Salle 102                                      │ │
  │  │ Effectif: 32/35 élèves • 🟢 91%                             │ │
  │  │                                                            │ │
  │  │ 👨‍🏫 Titulaire: BAHATI Marie                                │ │
  │  │ 📚 Matières: 11/11 attribuées                               │ │
  │  │ 📅 Emploi du temps: ✅ Généré                               │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  SCIENTIFIQUE                                                    │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ 4ScA                                     [Gérer] [⋮]        │ │
  │  │ 4ème année Sc • Salle 201                                   │ │
  │  │ Effectif: 32/40 élèves • 🟢 80%                             │ │
  │  │                                                            │ │
  │  │ 👨‍🏫 Titulaire: CIZA Pierre                                  │ │
  │  │ 📚 Matières: 9/9 attribuées                                 │ │
  │  │ 📅 Emploi du temps: ✅ Généré                               │ │
  │  │                                                            │ │
  │  │ ⚠️ Math: Enseignant non attribué                            │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


ZONE STATISTIQUES (4 CARTES)
------------------------------
Carte 1 — Total classes
  Icône : 🏫
  Valeur : 24 classes
  Sous-texte : 6 sections actives
  Couleur : Bleu #0D47A1

Carte 2 — Classes complètes
  Icône : ✅
  Valeur : 18/24 (75%)
  Sous-texte : 6 classes en dessous effectif min
  Couleur : Vert #1B5E20 si >80%, Orange si <80%

Carte 3 — Effectif moyen
  Icône : 👥
  Valeur : 32 élèves/classe
  Sous-texte : Total : 768 élèves
  Couleur : Bleu #0D47A1

Carte 4 — Salles utilisées
  Icône : 🚪
  Valeur : 22/24 salles
  Sous-texte : 2 salles libres
  Couleur : Gris #757575


COMPOSANT ClassCard.tsx
-------------------------
Structure d'une carte classe :

  ┌────────────────────────────────────────────────────────────┐
  │ 4ScA                                     [Gérer] [⋮]       │
  │ 4ème année Scientifique • Salle 201                        │
  │ Effectif: 32/40 élèves • 🟢 80%                            │
  │                                                            │
  │ 👨‍🏫 Titulaire: CIZA Pierre                                 │
  │ 📚 Matières: 9/9 attribuées                                │
  │ 📅 Emploi du temps: ✅ Généré le 15/09/2024                │
  │                                                            │
  │ [Voir détails] [Attribution enseignants] [Emploi du temps] │
  └────────────────────────────────────────────────────────────┘

Props :
  interface ClassCardProps {
    class: {
      id: string
      name: string           // "4ScA"
      section: Section
      year: number          // 4
      room?: string         // "201"
      maxStudents: number
      currentStudents: number
      titulaire?: Teacher
      subjectsAssigned: number
      totalSubjects: number
      hasTimetable: boolean
      timetableGeneratedAt?: Date
    }
    onEdit: (classId: string) => void
    onAssignTeachers: (classId: string) => void
    onViewTimetable: (classId: string) => void
    onDelete: (classId: string) => void
  }

Badge effectif :
  - 🟢 Vert si ≥80% (classe bien remplie)
  - 🟡 Orange si 50-79% (classe acceptable)
  - 🔴 Rouge si <50% (classe sous-remplie)

Alerte matières :
  - Si matières non attribuées → badge rouge "⚠️ {nombre} matières non attribuées"


MODAL CRÉATION CLASSE
-----------------------
  ┌─────────────────────────────────────────────┐
  │ CRÉER UNE CLASSE                            │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Section * :                                 │
  │ [Scientifique                         ▼]    │
  │                                             │
  │ Année * :                                   │
  │ [4ème                                 ▼]    │
  │                                             │
  │ Lettre/Groupe * :                           │
  │ [A]                                         │
  │ Nom généré automatiquement : 4ScA           │
  │                                             │
  │ ────────────────────────────────────────    │
  │                                             │
  │ Effectif maximum * :                        │
  │ [40] élèves                                 │
  │ ⓘ Recommandé : 35-40 pour Sc                │
  │                                             │
  │ Salle de classe :                           │
  │ [201                                  ▼]    │
  │ [☑] Salle principale (matières théoriques)  │
  │                                             │
  │ Salle laboratoire (optionnel) :             │
  │ [Lab Chimie                           ▼]    │
  │ Pour Physique, Chimie, Biologie             │
  │                                             │
  │ ────────────────────────────────────────    │
  │                                             │
  │ Enseignant titulaire :                      │
  │ [CIZA Pierre                          ▼]    │
  │ ⓘ Peut être attribué plus tard              │
  │                                             │
  │ [☑] Copier les attributions matières de:    │
  │     [3ScA ▼] (classe précédente)            │
  │     Gagne du temps si même section          │
  │                                             │
  │ [Annuler]              [Créer la classe]    │
  └─────────────────────────────────────────────┘


GÉNÉRATION NOM CLASSE
-----------------------
Format automatique selon section et année :

Règles :
  - Tronc Commun : TC-{année}{lettre} → TC-1A, TC-2B
  - Scientifique : {année}Sc{lettre} → 4ScA, 5ScB, 6ScA
  - Commerciale : {année}HCG-{lettre} → 4HCG-A, 5HCG-B
  - Pédagogie : {année}Péd{lettre} → 4PédA, 5PédB
  - Littéraire : {année}Lit{lettre} → 4LitA
  - Technique : {année}Tech{lettre} → 4TechA

Code TypeScript :
  function generateClassName(
    section: Section,
    year: number,
    letter: string
  ): string {
    const sectionCode = section.code // "Sc", "HCG", etc.
    
    switch (sectionCode) {
      case 'TC':
        return `TC-${year}${letter}`
      case 'Sc':
      case 'Péd':
      case 'Lit':
      case 'Tech':
        return `${year}${sectionCode}${letter}`
      case 'HCG':
        return `${year}HCG-${letter}`
      default:
        return `${year}${sectionCode}${letter}`
    }
  }


MODAL ATTRIBUTION ENSEIGNANTS
-------------------------------
Clic "Attribution enseignants" ouvre modal grande taille :

  ┌──────────────────────────────────────────────────────────────┐
  │ ATTRIBUTION ENSEIGNANTS — 4ScA                               │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  Enseignant titulaire : [CIZA Pierre              ▼] [✏️]    │
  │                                                              │
  │  ─────────────────────────────────────────────────────────   │
  │                                                              │
  │  ENSEIGNANTS PAR MATIÈRE (9 matières)                        │
  │                                                              │
  │  ┌────────────────────────────────────────────────────────┐ │
  │  │ Matière           │ Coeff │ Enseignant         │ Act  │ │
  │  ├──────────────────┼───────┼────────────────────┼──────┤ │
  │  │ Mathématiques    │ 5     │ [MUKASA Jean   ▼]  │ [✅] │ │
  │  │ Physique         │ 4     │ [DUSABE Alice  ▼]  │ [✅] │ │
  │  │ Chimie           │ 4     │ [AMANI Patrick ▼]  │ [✅] │ │
  │  │ Biologie         │ 3     │ [Non attribué  ▼]  │ [❌] │ │
  │  │ Français         │ 3     │ [CIZA Pierre   ▼]  │ [✅] │ │
  │  │ Anglais          │ 2     │ [BAHATI Marie  ▼]  │ [✅] │ │
  │  │ Informatique     │ 2     │ [Non attribué  ▼]  │ [❌] │ │
  │  │ Éd. civique      │ 1     │ [KALOMBO Paul  ▼]  │ [✅] │ │
  │  │ Éd. physique     │ 1     │ [SHABANI Jean  ▼]  │ [✅] │ │
  │  └────────────────────────────────────────────────────────┘ │
  │                                                              │
  │  ⚠️ 2 matières non attribuées (Biologie, Informatique)       │
  │                                                              │
  │  [Copier de 3ScA] [Réinitialiser]  [Annuler] [Enregistrer]  │
  └──────────────────────────────────────────────────────────────┘

Fonctionnalités :
  1. Select enseignant par matière
     - Filtre enseignants par matière (ex: Physique → seulement profs de Physique)
     - Option "Non attribué" disponible
  
  2. Bouton "Copier de 3ScA"
     - Copie toutes attributions classe précédente
     - Gain de temps si même section/année
  
  3. Validation avant enregistrement
     - Alerte si matières non attribuées : "Continuer quand même ?"
     - Vérification conflits horaires enseignants (si emploi temps généré)


MODAL GÉNÉRATION EMPLOI DU TEMPS
----------------------------------
Bouton "Emploi du temps" → si pas encore généré, propose génération :

  ┌─────────────────────────────────────────────┐
  │ GÉNÉRER L'EMPLOI DU TEMPS — 4ScA            │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ ⓘ L'algorithme va répartir automatiquement  │
  │   les 9 matières sur 5 jours × 8 périodes   │
  │                                             │
  │ PARAMÈTRES :                                │
  │                                             │
  │ Heures de cours :                           │
  │ Du lundi au vendredi                        │
  │ 8 périodes/jour (7h30-15h30)                │
  │                                             │
  │ Répartition intelligente :                  │
  │ [☑] Math en matinée (concentration)         │
  │ [☑] Éd. physique en après-midi              │
  │ [☑] Éviter 3h consécutives même matière     │
  │ [☑] Respecter disponibilités enseignants    │
  │                                             │
  │ CONTRAINTES DÉTECTÉES :                     │
  │ • MUKASA Jean enseigne aussi en 5ScA        │
  │   → Éviter conflits horaires                │
  │ • Lab Chimie partagé avec 4ScB              │
  │   → Alterner créneaux                       │
  │                                             │
  │ ⏱️ Génération estimée : 5-10 secondes        │
  │                                             │
  │ [Annuler]              [Générer]            │
  └─────────────────────────────────────────────┘

Après génération :
  ┌─────────────────────────────────────────────┐
  │ ✅ EMPLOI DU TEMPS GÉNÉRÉ                   │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Grille 5 jours × 8 périodes générée         │
  │                                             │
  │ Statistiques :                              │
  │ • Périodes utilisées : 36/40                │
  │ • Périodes libres : 4                       │
  │ • Conflits détectés : 0 ✅                  │
  │                                             │
  │ [Voir l'emploi du temps] [Régénérer]        │
  └─────────────────────────────────────────────┘


ALGORITHME GÉNÉRATION EMPLOI DU TEMPS
---------------------------------------
packages/server/src/lib/timetable/timetableGenerator.ts :

interface TimetableSlot {
  day: number          // 1-5 (Lun-Ven)
  period: number       // 1-8
  subjectId: string
  teacherId: string
  room?: string
}

interface GenerationConstraints {
  teacherAvailability: Map<string, Set<string>>  // teacherId → slots indisponibles
  roomAvailability: Map<string, Set<string>>     // roomId → slots occupés
  subjectPreferences: {
    morningSubjects: string[]    // Math, Physique (concentration)
    afternoonSubjects: string[]  // Éd. physique, Arts
  }
}

async function generateTimetable(
  classId: string,
  subjects: Subject[],
  teachers: Teacher[],
  constraints: GenerationConstraints
): Promise<TimetableSlot[]> {
  const slots: TimetableSlot[] = []
  const availableSlots = generateAllSlots() // 5 jours × 8 périodes = 40 slots
  
  // 1. Trier matières par coefficient (priorité aux matières importantes)
  const sortedSubjects = subjects.sort((a, b) => b.coefficient - a.coefficient)
  
  // 2. Calculer nombre de périodes par matière
  const periodsPerSubject = calculatePeriods(sortedSubjects)
  // Ex: Math coeff 5 → 6 périodes/semaine
  //     Physique coeff 4 → 5 périodes/semaine
  
  // 3. Placer matières une par une
  for (const subject of sortedSubjects) {
    const teacher = teachers.find(t => t.id === subject.teacherId)
    const periods = periodsPerSubject.get(subject.id)
    
    let placed = 0
    for (const slot of availableSlots) {
      if (placed >= periods) break
      
      // Vérifications
      if (!isSlotAvailable(slot, teacher, constraints)) continue
      if (!respectsPreferences(slot, subject, constraints)) continue
      if (hasConflict(slot, slots)) continue
      
      // Placer
      slots.push({
        day: slot.day,
        period: slot.period,
        subjectId: subject.id,
        teacherId: teacher.id,
        room: getRoom(subject, constraints)
      })
      
      placed++
    }
    
    if (placed < periods) {
      throw new Error(`Impossible de placer ${subject.name} (${placed}/${periods} périodes)`)
    }
  }
  
  return slots
}

function calculatePeriods(subjects: Subject[]): Map<string, number> {
  const totalCoeff = subjects.reduce((sum, s) => sum + s.coefficient, 0)
  const totalPeriods = 36 // Sur 40 disponibles (4 libres)
  
  const periods = new Map<string, number>()
  
  for (const subject of subjects) {
    // Proportionnel au coefficient
    const ratio = subject.coefficient / totalCoeff
    const count = Math.round(ratio * totalPeriods)
    periods.set(subject.id, Math.max(count, 2)) // Min 2 périodes/matière
  }
  
  return periods
}


APPELS API
-----------
GET /api/classes
  Query params :
    - sectionId?: string
    - year?: number
    - search?: string
  
  Response 200 :
    {
      classes: Array<{
        id: string,
        name: string,
        section: Section,
        year: number,
        room?: string,
        maxStudents: number,
        currentStudents: number,
        titulaire?: Teacher,
        subjectsAssigned: number,
        totalSubjects: number,
        hasTimetable: boolean
      }>,
      stats: {
        total: number,
        complete: number,
        avgStudents: number,
        roomsUsed: number
      }
    }

POST /api/classes
  Body : {
    sectionId: string,
    year: number,
    letter: string,
    maxStudents: number,
    room?: string,
    titulaireId?: string,
    copyAssignmentsFrom?: string  // classId
  }
  
  Response 201 : { class: Class }

POST /api/classes/:id/assign-teachers
  Body : {
    titulaireId: string,
    assignments: Array<{
      subjectId: string,
      teacherId: string
    }>
  }
  
  Response 200 : { class: Class, assignments: Assignment[] }

POST /api/classes/:id/generate-timetable
  Body : {
    preferences: {
      morningSubjects: string[],
      afternoonSubjects: string[]
    }
  }
  
  Response 200 : {
    timetable: TimetableSlot[],
    statistics: {
      periodsUsed: number,
      periodsFree: number,
      conflicts: number
    }
  }


MODÈLE DE DONNÉES PRISMA
--------------------------
model Class {
  id            String   @id @default(uuid())
  schoolId      String
  school        School   @relation(fields: [schoolId], references: [id])
  
  name          String   // "4ScA"
  sectionId     String
  section       Section  @relation(fields: [sectionId], references: [id])
  year          Int      // 1-6
  letter        String   // "A", "B"
  
  room          String?
  labRoom       String?
  maxStudents   Int      @default(40)
  
  titulaireId   String?
  titulaire     Teacher? @relation("ClassTitulaire", fields: [titulaireId], references: [id])
  
  // Relations
  enrollments   Enrollment[]
  assignments   TeacherAssignment[]
  timetable     TimetableSlot[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([schoolId, name])
  @@index([sectionId, year])
}

model TeacherAssignment {
  id          String   @id @default(uuid())
  classId     String
  class       Class    @relation(fields: [classId], references: [id])
  subjectId   String
  subject     Subject  @relation(fields: [subjectId], references: [id])
  teacherId   String
  teacher     Teacher  @relation(fields: [teacherId], references: [id])
  
  createdAt   DateTime @default(now())
  
  @@unique([classId, subjectId])
}

model TimetableSlot {
  id          String   @id @default(uuid())
  classId     String
  class       Class    @relation(fields: [classId], references: [id])
  
  day         Int      // 1-5 (Lun-Ven)
  period      Int      // 1-8
  
  subjectId   String
  subject     Subject  @relation(fields: [subjectId], references: [id])
  teacherId   String
  teacher     Teacher  @relation(fields: [teacherId], references: [id])
  
  room        String?
  
  createdAt   DateTime @default(now())
  
  @@unique([classId, day, period])
}


RÈGLES MÉTIER
--------------
1. Nom classe unique par école
   → Impossible créer 2 classes "4ScA"

2. Effectif max recommandé :
   - Tronc Commun : 35 élèves
   - Scientifique : 40 élèves
   - Autres : 35 élèves

3. Enseignant titulaire peut enseigner dans sa classe

4. Génération emploi temps nécessite :
   → Toutes matières attribuées
   → Enseignants disponibles

5. Impossible supprimer classe avec élèves inscrits
   → Seul archivage autorisé


NOTIFICATIONS
--------------
1. Après création classe :
   - Toast : "✓ Classe 4ScA créée avec succès"
   - Suggestion : "Attribuer les enseignants maintenant ?"

2. Après attribution enseignants :
   - Toast : "✓ 9 enseignants attribués à 4ScA"
   - Si matières manquantes : "⚠️ 2 matières non attribuées"

3. Après génération emploi temps :
   - Toast : "✓ Emploi du temps généré (36 périodes, 0 conflit)"
   - Email enseignants avec leur emploi temps


RESPONSIVE
-----------
Desktop (≥1280px) :
  - Grille 2 colonnes classes
  - Modal attribution full width

Mobile (<768px) :
  - 1 colonne cartes
  - Modal attribution scroll vertical


TESTS À ÉCRIRE
---------------
packages/client/src/pages/settings/__tests__/ClassesManagementPage.test.tsx :

describe('ClassesManagementPage', () => {
  it('génère nom classe correctement', () => {
    expect(generateClassName('Sc', 4, 'A')).toBe('4ScA')
    expect(generateClassName('TC', 1, 'B')).toBe('TC-1B')
  })
  
  it('crée classe avec validation', async () => {
    // Formulaire complet
    // Clic Créer
    // Vérifier POST /api/classes
  })
  
  it('attribue enseignants par matière', async () => {
    // Ouvrir modal attribution
    // Sélectionner enseignants
    // Vérifier POST /api/classes/:id/assign-teachers
  })
  
  it('génère emploi temps sans conflit', async () => {
    // Mock contraintes
    // Générer emploi temps
    // Vérifier 0 conflit
  })
})


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Liste classes charge avec filtres
[ ] 4 cartes stats calculent correctement
[ ] Création classe génère nom auto
[ ] Select enseignant titulaire fonctionne
[ ] Modal attribution enseignants fonctionne
[ ] Validation toutes matières attribuées
[ ] Génération emploi temps fonctionne
[ ] Algorithme évite conflits horaires
[ ] Sauvegarde emploi temps en DB
[ ] Export PDF emploi temps par classe
[ ] Responsive mobile parfait
[ ] Tests unitaires passent (4 tests min)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 2 — SCR-036 : GESTION DES UTILISATEURS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/settings/UsersManagementPage.tsx
Route : /settings/users
Accès : Protégé
Rôle minimum : SUPER_ADMIN (gestion complète) | PRÉFET (consultation + création limitée)


OBJECTIF
--------
Gérer tous les utilisateurs du système : création comptes, attribution rôles,
permissions granulaires, réinitialisation mots de passe, activation/désactivation.


FICHIERS À CRÉER
-----------------
1. packages/client/src/pages/settings/UsersManagementPage.tsx
2. packages/client/src/components/settings/UserCard.tsx
3. packages/client/src/components/settings/CreateUserModal.tsx
4. packages/client/src/components/settings/EditPermissionsModal.tsx
5. packages/client/src/components/settings/ResetPasswordModal.tsx
6. packages/client/src/components/settings/UserStatsCards.tsx
7. packages/client/src/hooks/useUsers.ts
8. packages/server/src/modules/users/users.routes.ts
9. packages/server/src/modules/users/users.controller.ts
10. packages/server/src/modules/users/users.service.ts


UI — STRUCTURE
---------------
  ┌──────────────────────────────────────────────────────────────────┐
  │ GESTION DES UTILISATEURS                  [+ Créer utilisateur]  │
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
  │  │ Total      │ │ Actifs     │ │ Inactifs   │ │ En ligne   │   │
  │  │ utilisateurs│ │            │ │            │ │ maintenant │   │
  │  │ 47         │ │ 45 (96%)   │ │ 2 (4%)     │ │ 12         │   │
  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
  │                                                                  │
  │  Filtres : [Tous rôles ▼] [Tous statuts ▼] [🔍 Rechercher...]   │
  │                                                                  │
  │  ADMINISTRATEURS                                                 │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ [👤] ADMIN Système                       [⋮]              │ │
  │  │ admin@edugoma360.cd                                        │ │
  │  │ 🟢 Actif • SUPER_ADMIN • En ligne                          │ │
  │  │ Dernière connexion : Aujourd'hui à 08:32                   │ │
  │  │ [Éditer] [Permissions] [Historique]                        │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  PRÉFETS                                                         │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │ [👤] MUKASA Jean                         [⋮]              │ │
  │  │ mukasa.jean@isstumaini.cd                                  │ │
  │  │ 🟢 Actif • PRÉFET • Hors ligne                             │ │
  │  │ Dernière connexion : Hier à 16:45                          │ │
  │  │ [Éditer] [Permissions] [Réinitialiser MDP]                 │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘


RÔLES SYSTÈME
--------------
6 rôles hiérarchiques définis :

1. **SUPER_ADMIN** (Administrateur système)
   - Accès total sans restriction
   - Gestion utilisateurs
   - Configuration système
   - Logs et audit
   - Sauvegarde/Restauration

2. **PRÉFET** (Directeur des études)
   - Gestion académique complète
   - Validation délibération
   - Gestion enseignants
   - Consultation finance
   - Paramètres école (limité)

3. **ECONOME** (Comptable/Trésorier)
   - Gestion finance complète
   - Enregistrement paiements
   - Rapports financiers
   - Gestion créances
   - Consultation élèves

4. **SECRÉTAIRE**
   - Gestion élèves (inscription, modification)
   - Consultation notes (lecture seule)
   - Gestion présences
   - Impression bulletins
   - Communication parents

5. **ENSEIGNANT**
   - Appel quotidien (ses classes)
   - Saisie notes (ses matières)
   - Consultation emploi temps
   - Modification profil (limité)

6. **PARENT** (Tuteur)
   - Consultation notes enfants
   - Consultation présences
   - Historique paiements
   - Justificatifs absences
   - Messagerie école


MODAL CRÉATION UTILISATEUR
----------------------------
  ┌─────────────────────────────────────────────┐
  │ CRÉER UN UTILISATEUR                        │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Rôle * :                                    │
  │ [PRÉFET                               ▼]    │
  │                                             │
  │ Nom * :                                     │
  │ [MUKASA                                  ]  │
  │                                             │
  │ Post-nom * :                                │
  │ [KALOMBO                                 ]  │
  │                                             │
  │ Prénom :                                    │
  │ [Jean                                    ]  │
  │                                             │
  │ ────────────────────────────────────────    │
  │                                             │
  │ Email * :                                   │
  │ [mukasa.jean@isstumaini.cd               ]  │
  │ ⓘ Utilisé pour connexion                    │
  │                                             │
  │ Téléphone :                                 │
  │ [+243 810 123 456                        ]  │
  │                                             │
  │ ────────────────────────────────────────    │
  │                                             │
  │ Mot de passe initial :                      │
  │ (•) Générer automatiquement                 │
  │ ( ) Définir manuellement                    │
  │     [________________________]              │
  │                                             │
  │ [☑] Forcer changement au 1er connexion      │
  │                                             │
  │ ────────────────────────────────────────    │
  │                                             │
  │ Si rôle ENSEIGNANT :                        │
  │ Lier au profil enseignant :                 │
  │ [MUKASA Jean                          ▼]    │
  │                                             │
  │ Si rôle PARENT :                            │
  │ Élèves rattachés :                          │
  │ [+ Ajouter un élève]                        │
  │                                             │
  │ ────────────────────────────────────────    │
  │                                             │
  │ [☑] Compte actif (peut se connecter)        │
  │ [☑] Envoyer email avec identifiants         │
  │                                             │
  │ [Annuler]              [Créer]              │
  └─────────────────────────────────────────────┘


GÉNÉRATION MOT DE PASSE AUTO
------------------------------
Format sécurisé : 12 caractères
- Majuscules + Minuscules + Chiffres + Symboles
- Exemple : Edg@2025Xk4!

Code TypeScript :
  function generateSecurePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%&!'
    let password = ''
    
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return password
  }


MODAL ÉDITION PERMISSIONS
---------------------------
Accessible via bouton "Permissions" :

  ┌─────────────────────────────────────────────┐
  │ PERMISSIONS — MUKASA Jean (PRÉFET)          │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ MODULE ÉLÈVES                               │
  │ [☑] Consulter                               │
  │ [☑] Créer/Modifier                          │
  │ [☑] Archiver                                │
  │                                             │
  │ MODULE ACADÉMIQUE                           │
  │ [☑] Consulter notes                         │
  │ [☑] Valider notes                           │
  │ [☑] Délibération                            │
  │ [☑] Génération bulletins                    │
  │                                             │
  │ MODULE ENSEIGNANTS                          │
  │ [☑] Consulter                               │
  │ [☑] Gérer (créer/modifier)                  │
  │ [☐] Supprimer                               │
  │                                             │
  │ MODULE FINANCE                              │
  │ [☑] Consulter paiements                     │
  │ [☐] Enregistrer paiements                   │
  │ [☑] Consulter créances                      │
  │ [☑] Rapports financiers                     │
  │                                             │
  │ MODULE PARAMÈTRES                           │
  │ [☑] Consulter                               │
  │ [☐] Modifier (réservé SUPER_ADMIN)          │
  │                                             │
  │ [Rétablir défaut] [Annuler] [Enregistrer]   │
  └─────────────────────────────────────────────┘


MATRICE PERMISSIONS PAR DÉFAUT
--------------------------------
| Module | Action | SUPER_ADMIN | PRÉFET | ECONOME | SECRÉTAIRE | ENSEIGNANT | PARENT |
|--------|--------|-------------|--------|---------|------------|------------|--------|
| **Élèves** | Consulter | ✅ | ✅ | ✅ | ✅ | ✅ (ses classes) | ✅ (ses enfants) |
| | Créer/Modifier | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| | Archiver | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Notes** | Consulter | ✅ | ✅ | ❌ | ✅ | ✅ (ses matières) | ✅ (ses enfants) |
| | Saisir | ✅ | ✅ | ❌ | ❌ | ✅ (ses matières) | ❌ |
| | Valider | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Finance** | Consulter | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (ses paiements) |
| | Enregistrer | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| | Rapports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Paramètres** | Modifier | ✅ | ⚠️ (limité) | ❌ | ❌ | ❌ | ❌ |


MODAL RÉINITIALISATION MDP
----------------------------
  ┌─────────────────────────────────────────────┐
  │ RÉINITIALISER MOT DE PASSE                  │
  │ MUKASA Jean (mukasa.jean@isstumaini.cd)     │
  ├─────────────────────────────────────────────┤
  │                                             │
  │ Nouveau mot de passe :                      │
  │ (•) Générer automatiquement                 │
  │     Edg@2025Xk4! [Copier]                   │
  │                                             │
  │ ( ) Définir manuellement                    │
  │     [________________________]              │
  │                                             │
  │ [☑] Forcer changement à la prochaine        │
  │     connexion                               │
  │                                             │
  │ [☑] Envoyer nouveau mot de passe par email  │
  │                                             │
  │ ⚠️ L'utilisateur sera déconnecté            │
  │    immédiatement                            │
  │                                             │
  │ [Annuler]              [Réinitialiser]      │
  └─────────────────────────────────────────────┘


APPELS API
-----------
GET /api/users
  Query params :
    - role?: UserRole
    - status?: 'ACTIVE' | 'INACTIVE'
    - search?: string
  
  Response 200 :
    {
      users: Array<{
        id: string,
        email: string,
        nom: string,
        postNom: string,
        prenom?: string,
        role: UserRole,
        isActive: boolean,
        isOnline: boolean,
        lastLoginAt?: Date,
        createdAt: Date
      }>,
      stats: {
        total: number,
        active: number,
        inactive: number,
        online: number
      }
    }

POST /api/users
  Body : {
    email: string,
    nom: string,
    postNom: string,
    prenom?: string,
    role: UserRole,
    phone?: string,
    password?: string,  // Si manuel
    autoGeneratePassword: boolean,
    mustChangePassword: boolean,
    isActive: boolean,
    sendEmailCredentials: boolean,
    teacherId?: string,  // Si ENSEIGNANT
    parentStudents?: string[]  // Si PARENT
  }
  
  Response 201 : {
    user: User,
    generatedPassword?: string  // Si auto-généré
  }

PUT /api/users/:id/permissions
  Body : {
    permissions: {
      [module: string]: string[]  // Ex: "students": ["read", "create", "update"]
    }
  }
  
  Response 200 : { user: User }

POST /api/users/:id/reset-password
  Body : {
    newPassword?: string,
    autoGenerate: boolean,
    mustChangePassword: boolean,
    sendEmail: boolean
  }
  
  Response 200 : {
    success: true,
    generatedPassword?: string
  }

PUT /api/users/:id/toggle-status
  Response 200 : {
    user: User,
    isActive: boolean
  }


MODÈLE PRISMA
--------------
model User {
  id                String   @id @default(uuid())
  schoolId          String
  school            School   @relation(fields: [schoolId], references: [id])
  
  email             String   @unique
  passwordHash      String
  
  nom               String
  postNom           String
  prenom            String?
  phone             String?
  
  role              UserRole
  permissions       Json?    // Permissions granulaires
  
  isActive          Boolean  @default(true)
  mustChangePassword Boolean @default(true)
  
  // Liaisons spécifiques
  teacherId         String?  @unique
  teacher           Teacher? @relation(fields: [teacherId], references: [id])
  
  parentStudents    Student[] @relation("ParentStudents")
  
  // Audit
  lastLoginAt       DateTime?
  lastLoginIp       String?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([email])
  @@index([role, isActive])
}

enum UserRole {
  SUPER_ADMIN
  PREFET
  ECONOME
  SECRETAIRE
  ENSEIGNANT
  PARENT
}


RÈGLES MÉTIER
--------------
1. Email unique par école
2. SUPER_ADMIN ne peut être désactivé (au moins 1 actif)
3. Mot de passe min 8 caractères
4. Session expire après 24h inactivité
5. Historique connexions conservé 90 jours


NOTIFICATIONS
--------------
1. Création utilisateur :
   - Email avec identifiants si option cochée
   - Template : "Bienvenue sur EduGoma 360"

2. Réinitialisation MDP :
   - Email avec nouveau mot de passe
   - Déconnexion immédiate utilisateur

3. Désactivation compte :
   - Email notification
   - Déconnexion immédiate


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Liste utilisateurs avec filtres
[ ] 4 cartes stats correctes
[ ] Création utilisateur fonctionne
[ ] Génération MDP auto sécurisé
[ ] Email identifiants envoyé
[ ] Modal permissions fonctionne
[ ] Matrice permissions par rôle
[ ] Réinitialisation MDP fonctionne
[ ] Toggle activation/désactivation
[ ] Historique connexions visible
[ ] Responsive mobile parfait
```

---

*EduGoma 360 — Module Paramètres Complet (Partie 3/3 - FINALE) — © 2025*
