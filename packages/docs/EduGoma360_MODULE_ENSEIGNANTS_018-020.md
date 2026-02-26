# 👨‍🏫 EDUGOMA 360 — MODULE ENSEIGNANTS COMPLET
## Écrans SCR-018 à SCR-020 | Gestion Enseignants, Affectations, Performances

> **MODE D'EMPLOI :**
> Ce fichier contient **3 prompts indépendants** ultra-détaillés pour le module Enseignants.
> Exécute-les **dans l'ordre numérique** (018 → 020).
> Prérequis : Module Élèves (SCR-005 à SCR-009) ET Module Académique (SCR-010 à SCR-017) validés.

---

## CONTEXTE GLOBAL DU MODULE

```
Module         : Gestion des Enseignants
Écrans         : SCR-018 à SCR-020 (3 écrans)
Prérequis      : Modules Élèves + Académique validés
Rôles concernés: Préfet, Super Admin, Enseignant (lecture seule)
Complexité     : ⭐⭐⭐⭐

COMPOSANTS PARTAGÉS À CRÉER :
- shared/src/utils/teacherStats.ts (calculs statistiques)
- shared/src/constants/subjects.ts (matières RDC)
- shared/src/constants/teacherStatus.ts (statuts enseignants)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 3 — SCR-018 : LISTE ET GESTION DES ENSEIGNANTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-018 - Liste et Gestion des Enseignants
Route : /teachers
Rôle minimum : PRÉFET
Prérequis : Module Élèves terminé (pour référence utilisateurs)


OBJECTIF
--------
Créer l'interface complète de gestion des enseignants de l'école.
Cet écran permet de créer, modifier, voir le détail et gérer les affectations
des enseignants. C'est le point d'entrée du module Enseignants.


FICHIERS À CRÉER
-----------------
Frontend (17 fichiers) :
1. packages/client/src/pages/teachers/TeachersListPage.tsx
2. packages/client/src/pages/teachers/TeacherDetailPage.tsx
3. packages/client/src/pages/teachers/TeacherFormPage.tsx
4. packages/client/src/components/teachers/TeacherCard.tsx
5. packages/client/src/components/teachers/TeacherRow.tsx
6. packages/client/src/components/teachers/TeacherFilters.tsx
7. packages/client/src/components/teachers/TeacherHeader.tsx
8. packages/client/src/components/teachers/TeacherActionMenu.tsx
9. packages/client/src/components/teachers/tabs/TeacherInfoTab.tsx
10. packages/client/src/components/teachers/tabs/TeacherClassesTab.tsx
11. packages/client/src/components/teachers/tabs/TeacherScheduleTab.tsx
12. packages/client/src/components/teachers/tabs/TeacherPerformanceTab.tsx
13. packages/client/src/components/teachers/form/Step1Identity.tsx
14. packages/client/src/components/teachers/form/Step2Qualifications.tsx
15. packages/client/src/components/teachers/form/Step3Assignments.tsx
16. packages/client/src/hooks/useTeachers.ts
17. packages/client/src/hooks/useTeacherForm.ts

Backend (6 fichiers) :
18. packages/server/src/modules/teachers/teachers.routes.ts
19. packages/server/src/modules/teachers/teachers.controller.ts
20. packages/server/src/modules/teachers/teachers.service.ts
21. packages/server/src/modules/teachers/teachers.dto.ts
22. packages/server/src/modules/teachers/teachers.validation.ts

Partagés (3 fichiers) :
23. packages/shared/src/constants/subjects.ts
24. packages/shared/src/constants/teacherStatus.ts
25. packages/shared/src/utils/teacherStats.ts


UI — STRUCTURE DE LA PAGE (TeachersListPage.tsx)
--------------------------------------------------
La page liste affiche les enseignants en mode TABLEAU (desktop) ou CARTES (mobile).

En-tête de page :
  ┌────────────────────────────────────────────────────────────┐
  │ ENSEIGNANTS DE L'ÉCOLE           [+ Ajouter un enseignant] │
  ├────────────────────────────────────────────────────────────┤
  │ Recherche: [____________] | Statut: [Tous ▼] | Matière: [  │
  └────────────────────────────────────────────────────────────┘

Vue TABLEAU (desktop) :
  ┌──────────────────────────────────────────────────────────────┐
  │ Photo │ Nom Complet      │ Matières        │ Classes │ Statut│
  ├──────────────────────────────────────────────────────────────┤
  │ [IMG] │ MUKASA Jean      │ Math, Physique  │ 3       │ ● Actif│
  │ [IMG] │ BAHATI Marie     │ Français        │ 2       │ ● Actif│
  │ [IMG] │ CIZA Pierre      │ Chimie          │ 1       │ ⚠️ Congé│
  │ ...                                                          │
  └──────────────────────────────────────────────────────────────┘

Vue CARTES (mobile) :
  ┌──────────────────────────┐
  │ [Photo]  MUKASA Jean     │
  │          Mathématiques   │
  │          📚 3 classes     │
  │          ● Actif         │
  │ [Voir] [⋮]               │
  └──────────────────────────┘


COMPOSANT TeacherCard.tsx (Vue carte mobile)
----------------------------------------------
Props :
  interface TeacherCardProps {
    teacher: Teacher & { subjects: Subject[]; classes: Class[] }
    onView: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
  }

Structure visuelle :
  ┌─────────────────────────────────────────┐
  │ [Photo]  MUKASA Jean            [⋮]     │
  │ 80×80    Préfet des Études              │
  │                                         │
  │ 📚 Mathématiques, Physique              │
  │ 🏫 3 classes : 4ScA, 5ScB, 6ScA         │
  │ 📞 +243 810 123 456                     │
  │ ● Actif                                 │
  │                                         │
  │ [Voir la fiche complète →]              │
  └─────────────────────────────────────────┘

Badges de statut :
- ● Actif (vert #1B5E20)
- ⚠️ En congé (orange #F57F17)
- ⏸️ Suspendu (rouge #C62828)
- 📦 Archivé (gris #757575)


COMPOSANT TeacherRow.tsx (Vue tableau desktop)
------------------------------------------------
Props :
  interface TeacherRowProps {
    teacher: Teacher & { subjects: Subject[]; classes: Class[] }
    onView: (id: string) => void
    isSelected?: boolean
    onSelect?: (id: string) => void
  }

Colonnes :
  - Checkbox (sélection multiple)
  - Photo (40×40px, rounded-full)
  - Nom complet (format : "NOM Prénom")
  - Matières (liste séparée par virgules)
  - Nombre de classes (badge numérique)
  - Statut (badge coloré)
  - Menu actions (⋮)

Clic sur la ligne → navigation vers /teachers/:id


COMPOSANT TeacherFilters.tsx
------------------------------
Filtres disponibles :

1. Recherche (Input text avec debounce 300ms)
   Placeholder : "Rechercher par nom, post-nom ou téléphone..."
   Recherche dans : nom, postNom, prenom, telephone

2. Statut (Select)
   Options :
   - Tous les statuts
   - Actif
   - En congé
   - Suspendu
   - Archivé

3. Matière (Select dynamique)
   Options : Liste des matières chargées depuis /api/subjects
   Filtre les enseignants qui enseignent cette matière

4. Section (Select)
   Options : TC | Scientifique | Commerciale | Pédagogique | Technique | Littéraire
   Filtre les enseignants qui ont des classes dans cette section

Bouton "Réinitialiser les filtres" visible si au moins 1 filtre actif.


MODAL DE SUPPRESSION/ARCHIVAGE
--------------------------------
Lors du clic sur "Archiver" ou "Supprimer" :

Vérifications backend :
1. Si l'enseignant a des classes assignées cette année → refus
2. Si l'enseignant a des notes saisies ce trimestre → refus
3. Si l'enseignant est Préfet ou Directeur → demande confirmation spéciale

Message d'erreur si conditions non remplies :
  "Impossible d'archiver {NOM}. Il est assigné à 3 classes cette année.
   Veuillez d'abord retirer ses affectations."

Message de confirmation si conditions remplies :
  "Êtes-vous sûr de vouloir archiver {NOM} ?
   Cette action peut être annulée ultérieurement."


PAGINATION
-----------
- 25 enseignants par page sur desktop
- 10 enseignants par page sur mobile
- keepPreviousData = true (pas de flash blanc)
- Pagination : "< Précédent  1 2 3 ... 5  Suivant >"
- Sur mobile : "< Page 2/5 >"
- Total affiché : "Total : 47 enseignants"


ÉTAT VIDE
----------
Si aucun enseignant :
  ┌────────────────────────────────────┐
  │        👨‍🏫                          │
  │   Aucun enseignant dans l'école    │
  │                                    │
  │ [+ Ajouter le premier enseignant]  │
  └────────────────────────────────────┘

Si filtres actifs sans résultat :
  ┌────────────────────────────────────┐
  │        🔍                           │
  │   Aucun enseignant trouvé          │
  │   Modifiez vos critères de filtre  │
  │                                    │
  │ [Réinitialiser les filtres]        │
  └────────────────────────────────────┘


═════════════════════════════════════════════════════════════
FICHE DÉTAIL ENSEIGNANT (TeacherDetailPage.tsx)
═════════════════════════════════════════════════════════════

Route : /teachers/:id
Accès : PRÉFET, SECRÉTAIRE (lecture seule), ENSEIGNANT (sa propre fiche)


EN-TÊTE (TeacherHeader.tsx)
-----------------------------
  ┌──────────────────────────────────────────────────────────┐
  │ [←]  MUKASA JEAN PIERRE                          [⋮ Menu]│
  │                                                           │
  │ [Photo]  MUKASA JEAN PIERRE                               │
  │ 80×80    Préfet des Études                                │
  │          Matricule : ENS-2023-0042                        │
  │          📚 Mathématiques, Physique                       │
  │          🏫 3 classes actives                             │
  │          📞 +243 810 123 456                              │
  │          ● Actif depuis Sept 2023                         │
  └──────────────────────────────────────────────────────────┘

Menu actions (⋮) :
- ✏️ Modifier la fiche
- 📋 Voir l'emploi du temps
- 📊 Voir les performances
- 📥 Télécharger le CV
- 📱 Envoyer un SMS
- 🗃️ Archiver


ONGLETS (4 onglets)
--------------------
Navigation : Infos | Classes | Emploi du temps | Performances

Style onglet actif : bordure verte en bas (border-b-2 border-green-700)


═══════════════════════════════════════════════════════════
ONGLET 1 — INFORMATIONS PERSONNELLES (TeacherInfoTab.tsx)
═══════════════════════════════════════════════════════════

Structure en 4 sections :

SECTION 1 — IDENTITÉ CIVILE
────────────────────────────
  ┌──────────────────────────────┐
  │ 📋 IDENTITÉ CIVILE           │
  ├──────────────────────────────┤
  │ Nom de famille : MUKASA      │
  │ Post-nom       : JEAN         │
  │ Prénom         : Pierre       │
  │ Sexe           : Masculin     │
  │ Date naissance : 15/03/1985   │
  │ Lieu naissance : Bukavu, SK   │
  │ Nationalité    : Congolaise   │
  └──────────────────────────────┘

SECTION 2 — CONTACT
───────────────────
  ┌──────────────────────────────┐
  │ 📞 CONTACT                   │
  ├──────────────────────────────┤
  │ Téléphone      : +243 810... │
  │                  [Appeler]    │
  │ Email          : mukasa@...   │
  │ Adresse        : Avenue de... │
  │ Commune        : Goma         │
  └──────────────────────────────┘

SECTION 3 — QUALIFICATIONS
──────────────────────────
  ┌──────────────────────────────┐
  │ 🎓 QUALIFICATIONS            │
  ├──────────────────────────────┤
  │ Diplôme        : Licence      │
  │ Domaine        : Mathématiques│
  │ Université     : UNIKIN       │
  │ Année          : 2008         │
  │                               │
  │ Spécialisations :             │
  │ • Algèbre linéaire            │
  │ • Analyse numérique           │
  │                               │
  │ Certificats :                 │
  │ 📄 Agrégation (2010)          │
  │ 📄 Formation pédagogique      │
  └──────────────────────────────┘

SECTION 4 — STATUT PROFESSIONNEL
─────────────────────────────────
  ┌──────────────────────────────┐
  │ 💼 STATUT PROFESSIONNEL      │
  ├──────────────────────────────┤
  │ Matricule      : ENS-2023-... │
  │ Statut         : ● Actif      │
  │ Date embauche  : 01/09/2023   │
  │ Ancienneté     : 1 an 5 mois  │
  │ Fonction       : Préfet       │
  │ Type contrat   : Permanent    │
  └──────────────────────────────┘


═══════════════════════════════════════════════════════════
ONGLET 2 — CLASSES ET MATIÈRES (TeacherClassesTab.tsx)
═══════════════════════════════════════════════════════════

Structure : Liste des affectations actuelles

  ┌──────────────────────────────────────────────────────────┐
  │ AFFECTATIONS ANNÉE SCOLAIRE 2024-2025                    │
  ├──────────────────────────────────────────────────────────┤
  │                                                           │
  │ 📚 Mathématiques                                          │
  │ ┌─────────────────────────────────────────────────────┐  │
  │ │ 4ScA — 4ème Scientifique A                          │  │
  │ │ 32 élèves · 6h/semaine · Coeff. 5                   │  │
  │ │ [Voir l'emploi du temps] [Saisir les notes]         │  │
  │ └─────────────────────────────────────────────────────┘  │
  │                                                           │
  │ ┌─────────────────────────────────────────────────────┐  │
  │ │ 5ScB — 5ème Scientifique B                          │  │
  │ │ 28 élèves · 6h/semaine · Coeff. 5                   │  │
  │ │ [Voir l'emploi du temps] [Saisir les notes]         │  │
  │ └─────────────────────────────────────────────────────┘  │
  │                                                           │
  │ 📚 Physique                                               │
  │ ┌─────────────────────────────────────────────────────┐  │
  │ │ 6ScA — 6ème Scientifique A                          │  │
  │ │ 30 élèves · 4h/semaine · Coeff. 4                   │  │
  │ │ [Voir l'emploi du temps] [Saisir les notes]         │  │
  │ └─────────────────────────────────────────────────────┘  │
  │                                                           │
  │ TOTAL : 3 classes · 90 élèves · 16h/semaine             │
  └──────────────────────────────────────────────────────────┘

Carte d'affectation contient :
- Nom de la classe avec section complète
- Effectif de la classe
- Volume horaire hebdomadaire
- Coefficient de la matière
- 2 boutons d'action rapide


═══════════════════════════════════════════════════════════
ONGLET 3 — EMPLOI DU TEMPS (TeacherScheduleTab.tsx)
═══════════════════════════════════════════════════════════

Réutilise le composant TimetableGrid.tsx du module académique (SCR-011)
en mode "enseignant" (affiche uniquement les cours de l'enseignant).

  ┌──────────────────────────────────────────────────────────┐
  │ EMPLOI DU TEMPS HEBDOMADAIRE                             │
  ├──────────────────────────────────────────────────────────┤
  │       │ Lundi  │ Mardi │ Mercr. │ Jeudi │ Vendr.         │
  │ ──────┼────────┼───────┼────────┼───────┼────────        │
  │ 7h30  │ Math   │ Phys  │ Math   │       │ Math           │
  │       │ 4ScA   │ 6ScA  │ 5ScB   │ LIBRE │ 4ScA           │
  │ ──────┼────────┼───────┼────────┼───────┼────────        │
  │ 8h30  │ Math   │       │ Phys   │       │ Math           │
  │       │ 5ScB   │ LIBRE │ 6ScA   │ LIBRE │ 5ScB           │
  │ ──────┼────────┼───────┼────────┼───────┼────────        │
  │ ...                                                       │
  └──────────────────────────────────────────────────────────┘

Statistiques en bas :
- Total heures/semaine : 16h
- Périodes libres : 24
- Taux occupation : 40%

Bouton "Exporter PDF" pour impression


═══════════════════════════════════════════════════════════
ONGLET 4 — PERFORMANCES (TeacherPerformanceTab.tsx)
═══════════════════════════════════════════════════════════

Cet onglet affiche les statistiques de performance de l'enseignant.

CARTES MÉTRIQUES (3 cartes en ligne)
─────────────────────────────────────
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ Moyenne      │ │ Taux réussite│ │ Assiduité    │
  │ classes      │ │ élèves       │ │ cours        │
  │              │ │              │ │              │
  │   13.2 /20   │ │     78%      │ │     95%      │
  │              │ │              │ │              │
  │ 🟢 +0.5      │ │ 🟢 +5%       │ │ 🟢 Excellent │
  └──────────────┘ └──────────────┘ └──────────────┘

GRAPHIQUE — ÉVOLUTION DES MOYENNES
───────────────────────────────────
Graphique linéaire (recharts) affichant l'évolution des moyennes
des classes de l'enseignant sur les 3 trimestres.

Légende :
- Ligne bleue : 4ScA
- Ligne verte : 5ScB
- Ligne rouge : 6ScA
- Ligne pointillée grise : Moyenne école


TABLEAU — RÉSULTATS PAR CLASSE
───────────────────────────────
  ┌────────────────────────────────────────────────────────┐
  │ Classe │ Effectif │ Moy T1│ Moy T2│ Moy T3│ Taux réuss.│
  ├────────────────────────────────────────────────────────┤
  │ 4ScA   │ 32       │ 12.5  │ 13.1  │ 13.8  │ 81%        │
  │ 5ScB   │ 28       │ 11.8  │ 12.2  │ 12.5  │ 75%        │
  │ 6ScA   │ 30       │ 14.2  │ 14.5  │ 14.8  │ 90%        │
  └────────────────────────────────────────────────────────┘


SECTION — OBSERVATIONS DU PRÉFET
─────────────────────────────────
Zone de texte libre où le Préfet peut saisir des observations
sur la performance de l'enseignant.

  ┌──────────────────────────────────────────────────────────┐
  │ 📝 OBSERVATIONS DU PRÉFET                                │
  ├──────────────────────────────────────────────────────────┤
  │ Excellent travail ce trimestre. Les résultats sont en    │
  │ progression constante. Continue sur cette lancée.        │
  │                                                          │
  │ [Modifier] (visible uniquement pour PRÉFET)             │
  └──────────────────────────────────────────────────────────┘


═════════════════════════════════════════════════════════════
FORMULAIRE CRÉATION/MODIFICATION (TeacherFormPage.tsx)
═════════════════════════════════════════════════════════════

Route : /teachers/new (création) ET /teachers/:id/edit (modification)
Structure : Wizard en 3 étapes


WIZARD — BARRE DE PROGRESSION
───────────────────────────────
  ┌──────────────────────────────────────────────────────────┐
  │ [━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━]                    │
  │  Identité   Qualifications   Affectations                │
  └──────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════
ÉTAPE 1 — IDENTITÉ (Step1Identity.tsx)
═══════════════════════════════════════════════════════════

CHAMPS DU FORMULAIRE
─────────────────────

1. Photo de profil (PhotoUpload.tsx — réutiliser du module élèves)
   Zone de drop 160×160px
   Formats : JPG, PNG | Max 2MB
   Preview immédiat

2. Nom * (Input text)
   Transform automatique : .toUpperCase()
   Min 2 chars, max 50
   Exemple : MUKASA

3. Post-nom * (Input text)
   Transform automatique : .toUpperCase()
   Min 2 chars, max 50
   Exemple : JEAN

4. Prénom (Input text — optionnel)
   Capitalize automatique
   Max 50 chars
   Exemple : Pierre

5. Sexe * (Radio group horizontal)
   Options : ⚪ Masculin  ⚪ Féminin

6. Date de naissance * (Date picker)
   Format : JJ/MM/AAAA
   Validation : entre 1950 et aujourd'hui - 21 ans (âge min 21 ans)
   Calcul âge automatique affiché : "(39 ans)"

7. Lieu de naissance * (Input text)
   Format : "Ville, Province"
   Exemple : Bukavu, Sud-Kivu
   Max 100 chars

8. Nationalité * (Select avec recherche)
   Défaut : "Congolaise"
   Options : liste nationalités (focus Afrique)

9. Téléphone * (Input tel)
   Format : +243XXXXXXXXX
   Validation regex : `/^\+243(81|82|97|98|89)\d{7}$/`

10. Email (Input email — optionnel)
    Validation format email standard

11. Adresse physique * (Textarea)
    Min 10 chars, max 200
    Exemple : "Avenue de la Paix, N°42, Quartier Himbi"

VALIDATION ZOD (Step1)
──────────────────────
```typescript
const step1Schema = z.object({
  nom: z.string().min(2).max(50).transform(s => s.toUpperCase()),
  postNom: z.string().min(2).max(50).transform(s => s.toUpperCase()),
  prenom: z.string().max(50).optional(),
  sexe: z.enum(['M', 'F']),
  dateNaissance: z.date()
    .min(new Date('1950-01-01'))
    .max(subtractYears(new Date(), 21), "L'enseignant doit avoir au moins 21 ans"),
  lieuNaissance: z.string().min(2).max(100),
  nationalite: z.string().min(2),
  telephone: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/, "Numéro congolais invalide"),
  email: z.string().email().optional().or(z.literal('')),
  adresse: z.string().min(10).max(200),
  photoFile: z.instanceof(File).optional()
})
```


═══════════════════════════════════════════════════════════
ÉTAPE 2 — QUALIFICATIONS (Step2Qualifications.tsx)
═══════════════════════════════════════════════════════════

CHAMPS DU FORMULAIRE
─────────────────────

1. Niveau d'études * (Select)
   Options :
   - D6 (Diplôme d'État)
   - Graduat (Bac+3)
   - Licence (Bac+5)
   - Master (Bac+7)
   - Doctorat (Bac+8)

2. Domaine de formation * (Input text)
   Exemple : "Mathématiques et Physique"
   Max 100 chars

3. Université/Institut * (Input text)
   Exemple : "Université de Kinshasa (UNIKIN)"
   Max 100 chars

4. Année d'obtention * (Input number)
   Range : 1980 à année courante

5. Spécialisations (Textarea optionnel)
   Exemple : "Algèbre linéaire, Analyse numérique, Probabilités"
   Max 300 chars

6. Matières enseignées * (Multi-select avec checkboxes)
   Options : Liste des matières du système éducatif RDC
   Minimum 1 matière requise
   Matières disponibles :
   
   TRONC COMMUN :
   - Français
   - Mathématiques
   - Sciences
   - Histoire
   - Géographie
   - Éducation civique et morale
   - Anglais
   - Éducation physique
   
   SCIENTIFIQUE :
   - Mathématiques
   - Physique
   - Chimie
   - Biologie
   - Informatique
   
   COMMERCIALE & GESTION :
   - Comptabilité
   - Économie
   - Gestion
   - Droit
   - Informatique de gestion
   
   PÉDAGOGIQUE :
   - Psychologie de l'enfant
   - Didactique générale
   - Méthodologie
   - Pratique pédagogique
   
   TECHNIQUE :
   - Dessin technique
   - Électricité
   - Mécanique
   - Construction
   
   LITTÉRAIRE :
   - Français
   - Littérature
   - Philosophie
   - Latin
   - Langues africaines

7. Certificats et formations (Section dynamique)
   Bouton "+ Ajouter un certificat"
   Chaque certificat contient :
   - Nom du certificat (Input text)
   - Organisme délivrant (Input text)
   - Année (Input number)
   - Fichier PDF optionnel (Upload)

VALIDATION ZOD (Step2)
──────────────────────
```typescript
const step2Schema = z.object({
  niveauEtudes: z.enum(['D6', 'GRADUAT', 'LICENCE', 'MASTER', 'DOCTORAT']),
  domaineFormation: z.string().min(2).max(100),
  universite: z.string().min(2).max(100),
  anneeObtention: z.number()
    .min(1980)
    .max(new Date().getFullYear()),
  specialisations: z.string().max(300).optional(),
  matieres: z.array(z.string()).min(1, "Au moins une matière requise"),
  certificats: z.array(z.object({
    nom: z.string(),
    organisme: z.string(),
    annee: z.number(),
    fichier: z.instanceof(File).optional()
  })).optional()
})
```


═══════════════════════════════════════════════════════════
ÉTAPE 3 — AFFECTATIONS (Step3Assignments.tsx)
═══════════════════════════════════════════════════════════

Cette étape permet d'assigner l'enseignant à des classes/matières.

IMPORTANT : Cette étape est optionnelle en création (peut être faite plus tard)
mais recommandée pour compléter le dossier.

CHAMPS DU FORMULAIRE
─────────────────────

1. Statut de l'enseignant * (Select)
   Options :
   - Actif (peut enseigner)
   - En congé (temporairement absent)
   - Suspendu (sanction)
   - Archivé (ne travaille plus ici)
   Défaut : Actif

2. Date d'embauche * (Date picker)
   Format : JJ/MM/AAAA
   Validation : date ≤ aujourd'hui

3. Type de contrat * (Select)
   Options :
   - Permanent (CDI)
   - Temporaire (CDD)
   - Vacation (horaire)
   - Stagiaire

4. Fonction administrative (Select optionnel)
   Options :
   - Aucune
   - Préfet des Études
   - Directeur des Études
   - Chef de Travaux
   - Surveillant Général

5. Classes et matières (Section dynamique)
   Interface d'affectation :
   
   Pour chaque matière cochée à l'étape 2, afficher :
   
   ┌────────────────────────────────────────────┐
   │ 📚 Mathématiques                           │
   ├────────────────────────────────────────────┤
   │ Sélectionnez les classes :                 │
   │ ☐ TC-1A   ☐ TC-1B   ☐ TC-2A               │
   │ ☐ 4ScA    ☐ 4ScB    ☐ 5ScA                │
   │ ☐ 6ScA                                     │
   │                                            │
   │ Volume horaire/semaine : [6] heures        │
   └────────────────────────────────────────────┘
   
   Répéter pour chaque matière.

VALIDATION ZOD (Step3)
──────────────────────
```typescript
const step3Schema = z.object({
  statut: z.enum(['ACTIF', 'CONGE', 'SUSPENDU', 'ARCHIVE']).default('ACTIF'),
  dateEmbauche: z.date().max(new Date(), "Date future non autorisée"),
  typeContrat: z.enum(['PERMANENT', 'TEMPORAIRE', 'VACATION', 'STAGIAIRE']),
  fonction: z.enum(['AUCUNE', 'PREFET', 'DIRECTEUR', 'CHEF_TRAVAUX', 'SURVEILLANT']).optional(),
  affectations: z.array(z.object({
    matiereId: z.string().uuid(),
    classeId: z.string().uuid(),
    volumeHoraire: z.number().min(1).max(20)
  })).optional()
})
```


═══════════════════════════════════════════════════════════
ÉTAPE 4 — CONFIRMATION (Step4Confirm.tsx — existe déjà dans le pattern)
═══════════════════════════════════════════════════════════

Récapitulatif complet affichant toutes les données saisies :

  ┌──────────────────────────────────────────────────────────┐
  │ ✓ Récapitulatif de l'ajout enseignant                    │
  ├──────────────────────────────────────────────────────────┤
  │                                                           │
  │ [PHOTO]    MUKASA JEAN Pierre                            │
  │ 160×160    Sexe : Masculin                               │
  │            Né le : 15/03/1985 à Bukavu (39 ans)          │
  │            Téléphone : +243 810 123 456                  │
  │            Email : mukasa@example.com                    │
  │                                                           │
  │ QUALIFICATIONS                                            │
  │ Diplôme : Licence en Mathématiques et Physique           │
  │ Université : UNIKIN (2008)                               │
  │ Matières : Mathématiques, Physique                       │
  │                                                           │
  │ AFFECTATIONS                                              │
  │ Statut : Actif depuis 01/09/2023                         │
  │ Contrat : Permanent                                      │
  │ Fonction : Préfet des Études                             │
  │ Classes : 4ScA (Math 6h), 5ScB (Math 6h), 6ScA (Phys 4h)│
  │                                                           │
  │ ℹ️ Un matricule unique sera généré automatiquement       │
  │                                                           │
  │ [← Modifier]              [Enregistrer l'enseignant →]   │
  └──────────────────────────────────────────────────────────┘


APPELS API
-----------
POST /api/teachers (mode création)
  Corps : multipart/form-data {
    // Step 1
    nom: string,
    postNom: string,
    prenom?: string,
    sexe: "M" | "F",
    dateNaissance: string (ISO),
    lieuNaissance: string,
    nationalite: string,
    telephone: string,
    email?: string,
    adresse: string,
    photoFile?: File,

    // Step 2
    niveauEtudes: enum,
    domaineFormation: string,
    universite: string,
    anneeObtention: number,
    specialisations?: string,
    matieres: string[] (UUIDs),
    certificats?: Array<{
      nom: string,
      organisme: string,
      annee: number,
      fichier?: File
    }>,

    // Step 3
    statut: enum,
    dateEmbauche: string (ISO),
    typeContrat: enum,
    fonction?: enum,
    affectations?: Array<{
      matiereId: string,
      classeId: string,
      volumeHoraire: number
    }>
  }

  Réponse 201 : {
    teacher: Teacher (avec matricule généré),
    message: "Enseignant ajouté avec succès"
  }

PUT /api/teachers/:id (mode modification)
  Corps : même structure que POST
  Réponse 200 : {
    teacher: Teacher,
    message: "Enseignant modifié avec succès"
  }


BACKEND — GÉNÉRATION DU MATRICULE
-----------------------------------
Dans packages/shared/src/utils/matricule.ts (fonction existante, à étendre) :

```typescript
export function generateTeacherMatricule(
  province: string,      // "NK" pour Nord-Kivu
  ville: string,         // "GOM" pour Goma
  schoolCode: string,    // "ISS001"
  sequence: number       // auto-incrémenté par école
): string {
  const seq = sequence.toString().padStart(4, '0')
  return `${province}-${ville}-${schoolCode}-ENS-${seq}`
}

// Exemple : "NK-GOM-ISS001-ENS-0042"
```

Dans teachers.service.ts (méthode create) :

```typescript
async function createTeacher(data: CreateTeacherDto, schoolId: string) {
  // 1. Récupérer la school pour obtenir le code
  const school = await prisma.school.findUnique({ where: { id: schoolId } })
  
  // 2. Obtenir le dernier matricule pour incrémenter la séquence
  const lastTeacher = await prisma.teacher.findFirst({
    where: { schoolId },
    orderBy: { createdAt: 'desc' }
  })
  
  const sequence = lastTeacher 
    ? parseInt(lastTeacher.matricule.split('-')[4]) + 1
    : 1
  
  // 3. Générer le matricule
  const matricule = generateTeacherMatricule(
    getProvinceCode(school.province),
    getCityCode(school.ville),
    school.code,
    sequence
  )
  
  // 4. Upload photo si présente
  let photoUrl = null
  if (data.photoFile) {
    photoUrl = await uploadToStorage(data.photoFile, 'teachers')
  }
  
  // 5. Upload certificats si présents
  const certificatsWithUrls = await Promise.all(
    (data.certificats || []).map(async (cert) => {
      if (cert.fichier) {
        const url = await uploadToStorage(cert.fichier, 'certificates')
        return { ...cert, fichierUrl: url }
      }
      return cert
    })
  )
  
  // 6. Créer l'enseignant
  const teacher = await prisma.teacher.create({
    data: {
      schoolId,
      matricule,
      nom: data.nom,
      postNom: data.postNom,
      prenom: data.prenom,
      sexe: data.sexe,
      dateNaissance: data.dateNaissance,
      lieuNaissance: data.lieuNaissance,
      nationalite: data.nationalite,
      telephone: data.telephone,
      email: data.email,
      adresse: data.adresse,
      photoUrl,
      niveauEtudes: data.niveauEtudes,
      domaineFormation: data.domaineFormation,
      universite: data.universite,
      anneeObtention: data.anneeObtention,
      specialisations: data.specialisations,
      statut: data.statut,
      dateEmbauche: data.dateEmbauche,
      typeContrat: data.typeContrat,
      fonction: data.fonction,
      subjects: {
        connect: data.matieres.map(id => ({ id }))
      },
      certificats: {
        create: certificatsWithUrls
      }
    },
    include: { subjects: true, certificats: true }
  })
  
  // 7. Créer les affectations si présentes
  if (data.affectations && data.affectations.length > 0) {
    await Promise.all(
      data.affectations.map(aff => 
        prisma.teacherAssignment.create({
          data: {
            teacherId: teacher.id,
            subjectId: aff.matiereId,
            classId: aff.classeId,
            academicYearId: getCurrentAcademicYearId(schoolId),
            volumeHoraire: aff.volumeHoraire
          }
        })
      )
    )
  }
  
  // 8. Envoyer SMS de bienvenue
  await sendWelcomeSMS(data.telephone, data.nom, data.postNom, matricule)
  
  return teacher
}
```

SMS de bienvenue (exemple) :
```
FR: "EduGoma360: Bienvenue {NOM} ! Votre matricule enseignant est {MATRICULE}. Connectez-vous sur edugoma360.cd"
```


POST-SOUMISSION — REDIRECTION
-------------------------------
Après succès :
  1. Toast vert : "✓ Enseignant ajouté avec succès ! Matricule : {matricule}"
  2. Attendre 2 secondes
  3. Rediriger vers /teachers/{newTeacherId} (fiche détail)

En mode modification :
  1. Toast : "✓ Enseignant modifié avec succès"
  2. Invalider cache TanStack Query
  3. Rester sur /teachers/{id}


GESTION DES ERREURS
--------------------
400 PHONE_EXISTS
  → "Ce numéro de téléphone est déjà utilisé par un autre enseignant"

400 EMAIL_EXISTS
  → "Cet email est déjà utilisé"

400 INVALID_SUBJECT
  → "La matière sélectionnée n'existe pas"

400 INVALID_CLASS
  → "La classe sélectionnée n'existe pas"

400 CONFLICT_ASSIGNMENT
  → "Un autre enseignant enseigne déjà cette matière dans cette classe"

500 PHOTO_UPLOAD_FAILED
  → "Erreur lors de l'upload de la photo"


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Le wizard en 3 étapes fonctionne (navigation avant/arrière)
[ ] La validation Zod bloque le passage si erreurs
[ ] La photo s'uploade et affiche un preview
[ ] Les matières multi-select fonctionnent
[ ] Les certificats dynamiques s'ajoutent/suppriment
[ ] L'interface d'affectation classes/matières fonctionne
[ ] Le récapitulatif affiche toutes les données
[ ] Le backend génère le matricule automatiquement (ENS-0001)
[ ] Un SMS de bienvenue est envoyé
[ ] La redirection fonctionne vers /teachers/:id
[ ] Le mode édition pré-remplit le formulaire
[ ] Le wizard est responsive (mobile 375px et desktop 1280px)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 3 — SCR-019 : AFFECTATION DES ENSEIGNANTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-019 - Matrice d'Affectation des Enseignants
Route : /teachers/assignments
Rôle minimum : PRÉFET
Prérequis : SCR-018 (enseignants créés), SCR-010 (classes créées)


OBJECTIF
--------
Interface matricielle permettant de visualiser et gérer toutes les affectations
enseignants ↔ classes ↔ matières de l'école en un seul écran.
C'est l'outil central pour la répartition de la charge d'enseignement.


FICHIERS À CRÉER
-----------------
Frontend (8 fichiers) :
1. packages/client/src/pages/teachers/AssignmentsPage.tsx
2. packages/client/src/components/teachers/assignments/AssignmentMatrix.tsx
3. packages/client/src/components/teachers/assignments/AssignmentCell.tsx
4. packages/client/src/components/teachers/assignments/QuickAssignModal.tsx
5. packages/client/src/components/teachers/assignments/BulkAssignModal.tsx
6. packages/client/src/components/teachers/assignments/ConflictWarning.tsx
7. packages/client/src/components/teachers/assignments/MatrixFilters.tsx
8. packages/client/src/hooks/useAssignments.ts

Backend (3 fichiers) :
9. packages/server/src/modules/assignments/assignments.routes.ts
10. packages/server/src/modules/assignments/assignments.controller.ts
11. packages/server/src/modules/assignments/assignments.service.ts


UI — STRUCTURE DE LA PAGE
---------------------------
La page affiche une grande matrice interactive avec :
- Lignes : Classes (TC-1A, 4ScA, 5PédB, etc.)
- Colonnes : Matières (Math, Phys, Chim, Français, etc.)
- Cellules : Enseignant(s) assigné(s) ou vide


LAYOUT GLOBAL
──────────────
  ┌──────────────────────────────────────────────────────────┐
  │ AFFECTATIONS ENSEIGNANTS — ANNÉE 2024-2025              │
  │                                                          │
  │ [Section: Toutes ▼] [Recherche enseignant: _______]     │
  │ [+ Affectation rapide] [⚙️ Affectation en masse]        │
  ├──────────────────────────────────────────────────────────┤
  │                                                          │
  │          │ Math │ Phys │ Chim │ Bio │ Franç│ Hist │...  │
  │ ─────────┼──────┼──────┼──────┼─────┼──────┼──────┤     │
  │ TC-1A    │MUKASA│      │      │     │BAHATI│      │     │
  │          │ 6h   │      │      │     │ 5h   │      │     │
  │ ─────────┼──────┼──────┼──────┼─────┼──────┼──────┤     │
  │ TC-1B    │MUKASA│      │      │     │BAHATI│      │     │
  │          │ 6h   │      │      │     │ 5h   │      │     │
  │ ─────────┼──────┼──────┼──────┼─────┼──────┼──────┤     │
  │ 4ScA     │MUKASA│CIZA  │DUSABE│     │BAHATI│      │     │
  │          │ 6h   │ 4h   │ 3h   │     │ 4h   │      │     │
  │ ─────────┼──────┼──────┼──────┼─────┼──────┼──────┤     │
  │ ...                                                      │
  │                                                          │
  │ LÉGENDE : [🟢 Assigné] [⚪ Vide] [🔴 Conflit]            │
  └──────────────────────────────────────────────────────────┘

Scroll horizontal pour voir toutes les matières (jusqu'à 15+ colonnes)
Scroll vertical pour voir toutes les classes (jusqu'à 50+ lignes)


COMPOSANT AssignmentCell.tsx
------------------------------
Chaque cellule peut avoir 3 états :

État 1 — VIDE (aucun enseignant assigné) :
  ┌────────────┐
  │            │
  │     ➕     │
  │   Assigner │
  │            │
  └────────────┘
  Couleur : gris clair (#F5F5F5)
  Clic → ouvre QuickAssignModal

État 2 — ASSIGNÉ (1 enseignant) :
  ┌────────────┐
  │  MUKASA J. │
  │    6h/sem  │
  │     [⋮]    │
  └────────────┘
  Couleur : vert clair (#E8F5E9)
  Affiche : nom abrégé + volume horaire
  Menu (⋮) : Modifier | Retirer

État 3 — CONFLIT (2+ enseignants pour même matière/classe) :
  ┌────────────┐
  │ ⚠️ CONFLIT │
  │  2 profs   │
  │     [!]    │
  └────────────┘
  Couleur : rouge clair (#FFEBEE)
  Clic → modal résolution conflit

État 4 — SURCHARGE (enseignant a trop d'heures) :
  ┌────────────┐
  │  MUKASA J. │
  │ ⚠️ 24h/sem │
  │     [⋮]    │
  └────────────┘
  Couleur : orange clair (#FFF3E0)
  Warning : volume > 20h/semaine


MATRIXFILTERS.tsx
------------------
Filtres pour faciliter la navigation :

1. Section (Select)
   Options : Toutes | TC | Scientifique | Commerciale | Pédagogique | Technique | Littéraire
   Filtre les classes selon la section

2. Année (Select)
   Options : Toutes | 1ère | 2ème | 3ème | 4ème | 5ème | 6ème
   Filtre les classes selon l'année

3. Matière (Select)
   Options : Toutes | Math | Physique | Chimie | ...
   Masque les colonnes des autres matières

4. Recherche enseignant (Input text)
   Placeholder : "Rechercher MUKASA, BAHATI..."
   Highlight les cellules de cet enseignant

5. Afficher (Checkbox group)
   [ ] Classes vides seulement (aucune affectation)
   [ ] Conflits seulement (cellules rouges)
   [ ] Surcharges seulement (> 20h)


QUICKASSIGNMODAL.tsx
---------------------
Modal d'affectation rapide ouvert au clic sur cellule vide.

  ┌────────────────────────────────────────┐
  │ AFFECTER UN ENSEIGNANT                 │
  ├────────────────────────────────────────┤
  │ Classe   : 4ScA                        │
  │ Matière  : Mathématiques               │
  │                                        │
  │ Enseignant * :                         │
  │ [Sélectionnez un enseignant ▼]        │
  │                                        │
  │ Options disponibles (triées) :        │
  │ • MUKASA Jean (16h/20h) ✅            │
  │ • BAHATI Marie (12h/20h) ✅           │
  │ • CIZA Pierre (8h/20h) ✅             │
  │ • DUSABE Alice (22h/20h) ⚠️ Surchargé│
  │                                        │
  │ Volume horaire/semaine * :             │
  │ [6] heures                             │
  │                                        │
  │ [Annuler]           [Affecter →]      │
  └────────────────────────────────────────┘

Logique du select :
- Liste les enseignants qui enseignent cette matière
- Affiche le volume horaire actuel / max
- Badge ⚠️ si déjà surchargé
- Tri : enseignants avec moins d'heures en premier


BULKASSIGNMODAL.tsx
--------------------
Modal d'affectation en masse pour assigner un enseignant à plusieurs classes.

  ┌────────────────────────────────────────────────────────────┐
  │ AFFECTATION EN MASSE                                       │
  ├────────────────────────────────────────────────────────────┤
  │ Enseignant * :                                             │
  │ [MUKASA Jean ▼]                                            │
  │                                                            │
  │ Matière * :                                                │
  │ [Mathématiques ▼]                                          │
  │                                                            │
  │ Sélectionnez les classes :                                 │
  │ ☑ TC-1A (6h/sem)   ☑ TC-1B (6h/sem)   ☐ TC-2A            │
  │ ☑ 4ScA (6h/sem)    ☑ 4ScB (6h/sem)    ☐ 5ScA             │
  │ ☐ 6ScA                                                     │
  │                                                            │
  │ Total heures : 24h/semaine ⚠️ Surcharge détectée !        │
  │                                                            │
  │ [Annuler]                    [Affecter les 4 classes →]   │
  └────────────────────────────────────────────────────────────┘

Validation :
- Alerte si total > 20h
- Bloque si conflit détecté (classe déjà assignée)


CONFLICTWARNING.tsx
--------------------
Modal affiché en cas de conflit détecté.

  ┌────────────────────────────────────────┐
  │ ⚠️ CONFLIT DÉTECTÉ                    │
  ├────────────────────────────────────────┤
  │ Classe : 4ScA                          │
  │ Matière : Mathématiques                │
  │                                        │
  │ Enseignants assignés :                 │
  │ • MUKASA Jean (6h/sem)                 │
  │ • BAHATI Marie (6h/sem) ← Nouveau      │
  │                                        │
  │ ⚠️ Deux enseignants ne peuvent pas    │
  │ enseigner la même matière dans la     │
  │ même classe.                           │
  │                                        │
  │ Actions possibles :                    │
  │ • Remplacer MUKASA par BAHATI         │
  │ • Annuler l'affectation               │
  │                                        │
  │ [Annuler] [Remplacer MUKASA]          │
  └────────────────────────────────────────┘


STATISTIQUES EN BAS DE PAGE
-----------------------------
  ┌────────────────────────────────────────────────────────────┐
  │ STATISTIQUES GLOBALES                                      │
  ├────────────────────────────────────────────────────────────┤
  │ [Total affectations : 156]  [Classes complètes : 12/18]   │
  │ [Cellules vides : 23]       [Conflits : 2]                │
  │ [Enseignants surchargés : 3]                               │
  └────────────────────────────────────────────────────────────┘


EXPORT
-------
Bouton "📥 Exporter la matrice" génère un fichier Excel avec :
- Feuille 1 : Matrice complète (classes × matières × enseignants)
- Feuille 2 : Liste affectations (1 ligne par affectation)
- Feuille 3 : Récapitulatif par enseignant (volume horaire total)


APPELS API
-----------
GET /api/assignments
  Query : ?academicYearId=:id&section=:section&year=:year
  Réponse : {
    assignments: Array<{
      id: string
      teacherId: string
      teacherName: string
      classId: string
      className: string
      subjectId: string
      subjectName: string
      volumeHoraire: number
    }>,
    stats: {
      total: number,
      emptyCell: number,
      conflicts: number,
      overloaded: number
    }
  }

POST /api/assignments
  Body : {
    teacherId: string,
    classId: string,
    subjectId: string,
    volumeHoraire: number
  }
  Réponse 201 : { assignment: Assignment }

POST /api/assignments/bulk
  Body : {
    teacherId: string,
    subjectId: string,
    classes: Array<{ classId: string, volumeHoraire: number }>
  }
  Réponse 201 : { assignments: Assignment[], conflicts: [] }

DELETE /api/assignments/:id
  Réponse 200 : { success: true }

PUT /api/assignments/:id
  Body : { teacherId?, volumeHoraire? }
  Réponse 200 : { assignment: Assignment }


BACKEND — DÉTECTION DE CONFLITS
---------------------------------
Dans assignments.service.ts :

```typescript
async function checkConflicts(
  classId: string,
  subjectId: string,
  teacherId: string
): Promise<{ hasConflict: boolean; existing?: Assignment }> {
  const existing = await prisma.teacherAssignment.findFirst({
    where: {
      classId,
      subjectId,
      teacherId: { not: teacherId } // Un autre enseignant
    },
    include: { teacher: true }
  })
  
  return {
    hasConflict: !!existing,
    existing
  }
}

async function checkOverload(teacherId: string): Promise<boolean> {
  const assignments = await prisma.teacherAssignment.findMany({
    where: { teacherId }
  })
  
  const totalHours = assignments.reduce((sum, a) => sum + a.volumeHoraire, 0)
  
  return totalHours > 20 // Seuil de surcharge
}
```


RÈGLES MÉTIER
--------------
1. Un enseignant ne peut pas enseigner une matière qu'il n'a pas dans son profil
2. Une classe ne peut avoir qu'UN SEUL enseignant par matière
3. Volume horaire recommandé : 12-20h/semaine par enseignant
4. Alerte si > 20h (surcharge)
5. Bloque si > 30h (limite absolue)
6. Les affectations sont liées à l'année scolaire active


DÉFINITION DE "TERMINÉ"
------------------------
[ ] La matrice affiche toutes les classes × matières
[ ] Les cellules vides sont cliquables
[ ] QuickAssignModal fonctionne
[ ] BulkAssignModal fonctionne
[ ] Les conflits sont détectés et affichés
[ ] Les surcharges sont détectées (> 20h)
[ ] Les filtres fonctionnent (section, année, matière)
[ ] La recherche enseignant highlight les cellules
[ ] L'export Excel fonctionne
[ ] Les statistiques sont exactes
[ ] La matrice est responsive (scroll horizontal/vertical)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 3 — SCR-020 : RAPPORTS ET STATISTIQUES ENSEIGNANTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Écran : SCR-020 - Rapports et Statistiques Enseignants
Route : /teachers/reports
Rôle minimum : PRÉFET
Prérequis : SCR-018 (enseignants), SCR-019 (affectations), SCR-012 (notes)


OBJECTIF
--------
Interface de visualisation des statistiques et performances des enseignants.
Cet écran permet au Préfet d'évaluer l'efficacité pédagogique de chaque enseignant
et d'identifier ceux qui nécessitent un accompagnement.


FICHIERS À CRÉER
-----------------
Frontend (9 fichiers) :
1. packages/client/src/pages/teachers/ReportsPage.tsx
2. packages/client/src/components/teachers/reports/StatsOverview.tsx
3. packages/client/src/components/teachers/reports/TeacherRankingTable.tsx
4. packages/client/src/components/teachers/reports/PerformanceChart.tsx
5. packages/client/src/components/teachers/reports/WorkloadDistribution.tsx
6. packages/client/src/components/teachers/reports/AttendanceHeatmap.tsx
7. packages/client/src/components/teachers/reports/ReportFilters.tsx
8. packages/client/src/components/teachers/reports/ExportReportModal.tsx
9. packages/client/src/hooks/useTeacherStats.ts

Backend (3 fichiers) :
10. packages/server/src/modules/reports/teachers-reports.routes.ts
11. packages/server/src/modules/reports/teachers-reports.controller.ts
12. packages/server/src/modules/reports/teachers-reports.service.ts

Partagé (1 fichier) :
13. packages/shared/src/utils/teacherStats.ts


UI — STRUCTURE DE LA PAGE
---------------------------
La page est divisée en plusieurs sections :

  ┌──────────────────────────────────────────────────────────┐
  │ RAPPORTS ENSEIGNANTS — ANNÉE 2024-2025                  │
  │                                                          │
  │ [Trimestre: T2 ▼] [Section: Toutes ▼] [📥 Export PDF]  │
  ├──────────────────────────────────────────────────────────┤
  │ SECTION 1 : Vue d'ensemble (4 cartes métriques)         │
  │ SECTION 2 : Classement enseignants                      │
  │ SECTION 3 : Graphique performances                      │
  │ SECTION 4 : Répartition charge de travail               │
  │ SECTION 5 : Assiduité (heatmap)                         │
  └──────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════
SECTION 1 — VUE D'ENSEMBLE (StatsOverview.tsx)
═══════════════════════════════════════════════════════════

4 cartes métriques en ligne :

  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ Enseignants  │ │ Moy. classes │ │ Taux réussite│ │ Charge moy.  │
  │ actifs       │ │ enseignants  │ │ global       │ │ hebdo        │
  │              │ │              │ │              │ │              │
  │     47       │ │   13.2 /20   │ │     78%      │ │   16.5 h     │
  │              │ │              │ │              │ │              │
  │ 🟢 +2        │ │ 🟢 +0.3      │ │ 🟢 +5%       │ │ 🟡 Équilibré │
  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

Chaque carte contient :
- Titre de la métrique
- Valeur principale (grande taille)
- Indicateur d'évolution vs trimestre précédent (🟢 hausse | 🔴 baisse | 🟡 stable)
- Badge de statut (Excellent | Bon | Moyen | Faible)


═══════════════════════════════════════════════════════════
SECTION 2 — CLASSEMENT (TeacherRankingTable.tsx)
═══════════════════════════════════════════════════════════

Tableau classant les enseignants selon plusieurs critères.

En-tête avec onglets :
  [Performances ✓] [Charge travail] [Assiduité]

ONGLET PERFORMANCES (tri par moyenne classes) :
  ┌────────────────────────────────────────────────────────────┐
  │ Rang│ Enseignant      │ Classes│ Moy│ Taux│ Évol│ Badge    │
  ├────────────────────────────────────────────────────────────┤
  │  1  │ MUKASA Jean     │   3    │14.8│ 92%│ 🟢  │🏆Excellent│
  │  2  │ BAHATI Marie    │   2    │14.2│ 85%│ 🟢  │🏆Excellent│
  │  3  │ CIZA Pierre     │   1    │13.5│ 80%│ 🟡  │✅ Bon     │
  │  4  │ DUSABE Alice    │   4    │12.8│ 75%│ 🔴  │✅ Bon     │
  │ ... │                 │        │    │    │     │           │
  │ 47  │ FURAHA Emmanuel │   2    │ 9.2│ 45%│ 🔴  │⚠️ Faible │
  └────────────────────────────────────────────────────────────┘

Colonnes :
- Rang : position dans le classement
- Enseignant : nom complet avec photo miniature
- Classes : nombre de classes enseignées
- Moy : moyenne générale de toutes ses classes
- Taux : taux de réussite (% élèves ≥10)
- Évol : évolution vs trimestre précédent
- Badge : évaluation globale

Badges de performance :
- 🏆 Excellent : Moy ≥ 14 ET Taux ≥ 85%
- ✅ Bon : Moy ≥ 12 ET Taux ≥ 70%
- 🟡 Moyen : Moy ≥ 10 ET Taux ≥ 60%
- ⚠️ Faible : Moy < 10 OU Taux < 60%

Clic sur ligne → ouvre fiche détail enseignant (SCR-018)


ONGLET CHARGE TRAVAIL (tri par heures/semaine) :
  ┌────────────────────────────────────────────────────────────┐
  │ Rang│ Enseignant      │ Heures│ Classes│ Élèves│ Statut   │
  ├────────────────────────────────────────────────────────────┤
  │  1  │ MUKASA Jean     │  24h  │   4    │  120  │⚠️Surchargé│
  │  2  │ BAHATI Marie    │  20h  │   3    │   85  │✅Optimal  │
  │  3  │ CIZA Pierre     │  16h  │   2    │   60  │✅Optimal  │
  │ ... │                 │       │        │       │           │
  │ 47  │ FURAHA Emmanuel │   4h  │   1    │   28  │🟡Sous-ut. │
  └────────────────────────────────────────────────────────────┘

Statuts charge :
- ⚠️ Surchargé : > 20h/semaine
- ✅ Optimal : 12-20h/semaine
- 🟡 Sous-utilisé : < 12h/semaine


ONGLET ASSIDUITÉ (tri par taux présence) :
  ┌────────────────────────────────────────────────────────────┐
  │ Rang│ Enseignant      │ Présent│ Absent│ Retard│ Taux     │
  ├────────────────────────────────────────────────────────────┤
  │  1  │ MUKASA Jean     │  58/60 │   1   │   1   │ 97%  🟢  │
  │  2  │ BAHATI Marie    │  57/60 │   2   │   1   │ 95%  🟢  │
  │  3  │ CIZA Pierre     │  55/60 │   3   │   2   │ 92%  🟢  │
  │ ... │                 │        │       │       │          │
  │ 47  │ FURAHA Emmanuel │  42/60 │  15   │   3   │ 70%  🔴  │
  └────────────────────────────────────────────────────────────┘

Taux présence :
- 🟢 Excellent : ≥ 95%
- 🟡 Bon : 85-95%
- 🟠 Moyen : 75-85%
- 🔴 Faible : < 75%


═══════════════════════════════════════════════════════════
SECTION 3 — GRAPHIQUE PERFORMANCES (PerformanceChart.tsx)
═══════════════════════════════════════════════════════════

Graphique linéaire (Recharts) affichant l'évolution des moyennes.

  ┌──────────────────────────────────────────────────────────┐
  │ ÉVOLUTION DES MOYENNES PAR TRIMESTRE                     │
  ├──────────────────────────────────────────────────────────┤
  │                                                          │
  │   │                                     /── MUKASA       │
  │ 16│                                   /                  │
  │   │                                 /                    │
  │ 14│              ──── Moyenne école                      │
  │   │            /                                         │
  │ 12│          /                ── BAHATI                  │
  │   │        /                                             │
  │ 10│      /                      ── CIZA                  │
  │   │    /                                                 │
  │  8│  /                            ── FURAHA              │
  │   └────────────────────────────────────────             │
  │     T1          T2          T3                           │
  └──────────────────────────────────────────────────────────┘

Options :
- Afficher tous les enseignants (jusqu'à 10 max)
- Sélectionner enseignants spécifiques (multi-select)
- Afficher/masquer moyenne école (ligne pointillée)

Tooltip au survol :
  T2 - MUKASA Jean
  Moyenne : 14.2
  Évolution : +0.4


═══════════════════════════════════════════════════════════
SECTION 4 — RÉPARTITION CHARGE (WorkloadDistribution.tsx)
═══════════════════════════════════════════════════════════

Graphique en barres horizontales montrant la répartition des heures.

  ┌──────────────────────────────────────────────────────────┐
  │ RÉPARTITION DE LA CHARGE DE TRAVAIL                      │
  ├──────────────────────────────────────────────────────────┤
  │                                                          │
  │ MUKASA Jean      [████████████████████] 24h ⚠️          │
  │                                                          │
  │ BAHATI Marie     [████████████████] 20h ✅              │
  │                                                          │
  │ CIZA Pierre      [████████████] 16h ✅                   │
  │                                                          │
  │ DUSABE Alice     [████████████] 16h ✅                   │
  │                                                          │
  │ FURAHA Emmanuel  [████] 4h 🟡                            │
  │                                                          │
  │                  0   5   10  15  20  25  30              │
  │                  └── Heures/semaine ──┘                  │
  └──────────────────────────────────────────────────────────┘

Couleurs barres :
- Rouge : > 20h (surcharge)
- Vert : 12-20h (optimal)
- Jaune : < 12h (sous-utilisé)

Ligne verticale pointillée à 20h (seuil recommandé)


═══════════════════════════════════════════════════════════
SECTION 5 — ASSIDUITÉ (AttendanceHeatmap.tsx)
═══════════════════════════════════════════════════════════

Heatmap visualisant la présence des enseignants sur les derniers 30 jours.

  ┌──────────────────────────────────────────────────────────┐
  │ ASSIDUITÉ DES ENSEIGNANTS (30 DERNIERS JOURS)           │
  ├──────────────────────────────────────────────────────────┤
  │                                                          │
  │              L  M  M  J  V  L  M  M  J  V  ...           │
  │              1  2  3  4  5  8  9 10 11 12               │
  │ MUKASA     [🟢][🟢][🟢][🟢][🟢][🟢][🟢][🟡][🟢][🟢]...     │
  │ BAHATI     [🟢][🟢][🟢][🟢][🟢][🟢][🟢][🟢][🟢][🟢]...     │
  │ CIZA       [🟢][🟢][🔴][🟢][🟢][🟢][🟡][🟢][🟢][🟢]...     │
  │ DUSABE     [🟢][🟢][🟢][🟢][🟢][🟢][🟢][🟢][🟢][🟢]...     │
  │ FURAHA     [🟡][🔴][🔴][🟢][🔴][🔴][🟢][🟢][🟡][🔴]...     │
  │                                                          │
  │ LÉGENDE: [🟢 Présent] [🟡 Retard] [🔴 Absent] [⚪ Congé] │
  └──────────────────────────────────────────────────────────┘

Tooltip au survol :
  15/02/2025 - MUKASA Jean
  Présent toute la journée
  4 cours dispensés


FILTRES (ReportFilters.tsx)
-----------------------------

1. Trimestre (Select)
   Options : T1 | T2 | T3 | Année complète
   Défaut : Trimestre actif

2. Section (Select)
   Options : Toutes | TC | Scientifique | Commerciale | Pédagogique | Technique | Littéraire
   Filtre les enseignants qui ont des classes dans cette section

3. Matière (Select)
   Options : Toutes | Math | Physique | Chimie | ...
   Filtre les enseignants qui enseignent cette matière

4. Performance (Select)
   Options : Tous | Excellent | Bon | Moyen | Faible
   Filtre selon le badge de performance

5. Période assiduité (Date range picker)
   Sélectionner période pour la heatmap
   Défaut : 30 derniers jours


EXPORT PDF (ExportReportModal.tsx)
------------------------------------
Modal d'export avec options :

  ┌────────────────────────────────────────────────────────────┐
  │ EXPORTER LE RAPPORT ENSEIGNANTS                           │
  ├────────────────────────────────────────────────────────────┤
  │ Format : ⚪ PDF  ⚪ Excel                                  │
  │                                                            │
  │ Contenu à inclure :                                       │
  │ ☑ Vue d'ensemble (4 cartes métriques)                     │
  │ ☑ Classement performances (tableau)                       │
  │ ☑ Graphique évolution moyennes                            │
  │ ☑ Répartition charge travail                              │
  │ ☑ Heatmap assiduité                                       │
  │ ☑ Observations du Préfet (zone texte libre)               │
  │                                                            │
  │ [Annuler]                    [Générer le rapport →]       │
  └────────────────────────────────────────────────────────────┘

Le PDF généré contient :
- Page 1 : En-tête école + Vue d'ensemble + Graphiques
- Page 2 : Classement complet des enseignants
- Page 3 : Heatmap assiduité
- Page 4 : Observations et recommandations du Préfet
- Footer : Date génération + Signature Préfet


APPELS API
-----------
GET /api/reports/teachers/overview
  Query : ?termId=:id&section=:section
  Réponse : {
    totalActive: number,
    averageClassGrade: number,
    successRate: number,
    averageWorkload: number,
    trends: {
      teachers: string,
      grade: string,
      successRate: string
    }
  }

GET /api/reports/teachers/ranking
  Query : ?termId=:id&sortBy=performance|workload|attendance
  Réponse : {
    teachers: Array<{
      id: string,
      name: string,
      photoUrl: string,
      rank: number,
      averageGrade: number,
      successRate: number,
      workload: number,
      attendanceRate: number,
      badge: string,
      evolution: number
    }>
  }

GET /api/reports/teachers/performance-chart
  Query : ?termId=:id&teacherIds=:ids (comma-separated)
  Réponse : {
    data: Array<{
      term: string,
      schoolAverage: number,
      [teacherId]: number // moyennes par enseignant
    }>
  }

GET /api/reports/teachers/workload
  Réponse : {
    teachers: Array<{
      id: string,
      name: string,
      hours: number,
      classes: number,
      students: number,
      status: string
    }>
  }

GET /api/reports/teachers/attendance-heatmap
  Query : ?startDate=:date&endDate=:date
  Réponse : {
    teachers: Array<{
      id: string,
      name: string,
      days: Array<{
        date: string,
        status: "PRESENT" | "ABSENT" | "RETARD" | "CONGE"
      }>
    }>
  }

GET /api/reports/teachers/export
  Query : ?format=pdf|excel&termId=:id&sections=...
  Réponse : Binary file (PDF ou Excel)


BACKEND — CALCUL DES STATISTIQUES
-----------------------------------
Dans packages/shared/src/utils/teacherStats.ts :

```typescript
export function calculateTeacherPerformance(
  classAverages: number[]
): number {
  // Moyenne des moyennes de toutes les classes de l'enseignant
  return classAverages.reduce((sum, avg) => sum + avg, 0) / classAverages.length
}

export function calculateSuccessRate(
  students: Array<{ average: number }>
): number {
  const passed = students.filter(s => s.average >= 10).length
  return (passed / students.length) * 100
}

export function calculateWorkload(
  assignments: Array<{ volumeHoraire: number }>
): number {
  return assignments.reduce((sum, a) => sum + a.volumeHoraire, 0)
}

export function calculateAttendanceRate(
  attendances: Array<{ status: string }>
): number {
  const total = attendances.length
  const present = attendances.filter(a => 
    a.status === 'PRESENT' || a.status === 'RETARD'
  ).length
  return (present / total) * 100
}

export function determinePerformanceBadge(
  averageGrade: number,
  successRate: number
): 'EXCELLENT' | 'BON' | 'MOYEN' | 'FAIBLE' {
  if (averageGrade >= 14 && successRate >= 85) return 'EXCELLENT'
  if (averageGrade >= 12 && successRate >= 70) return 'BON'
  if (averageGrade >= 10 && successRate >= 60) return 'MOYEN'
  return 'FAIBLE'
}

export function determineWorkloadStatus(
  hours: number
): 'SURCHARGE' | 'OPTIMAL' | 'SOUS_UTILISE' {
  if (hours > 20) return 'SURCHARGE'
  if (hours >= 12) return 'OPTIMAL'
  return 'SOUS_UTILISE'
}
```


RÈGLES MÉTIER
--------------
1. Les statistiques sont calculées par trimestre
2. La moyenne enseignant = moyenne de ses moyennes de classe
3. Taux réussite = % élèves ayant moyenne ≥ 10
4. Charge optimale = 12-20h/semaine
5. Assiduité minimale requise = 85%
6. Les rapports sont accessibles uniquement au Préfet et au Directeur


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Les 4 cartes métriques affichent les bonnes valeurs
[ ] Le classement performances affiche tous les enseignants triés
[ ] Les 3 onglets du classement fonctionnent (performances, charge, assiduité)
[ ] Le graphique évolution moyennes affiche les courbes
[ ] Le graphique répartition charge affiche les barres colorées
[ ] La heatmap assiduité affiche les 30 derniers jours
[ ] Les filtres fonctionnent (trimestre, section, matière, performance)
[ ] L'export PDF fonctionne et contient toutes les sections
[ ] L'export Excel fonctionne
[ ] Les formules de calcul sont correctes (teacherStats.ts)
[ ] Les badges de performance sont attribués correctement
[ ] Les indicateurs d'évolution (🟢🟡🔴) fonctionnent
[ ] La page est responsive (graphiques adaptés mobile)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RÉCAPITULATIF MODULE ENSEIGNANTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| N° | Écran | Fonction | Fichier principal | Complexité |
|----|-------|----------|-------------------|------------|
| 18 | SCR-018 | Liste + Fiche détail + Form wizard | TeachersListPage.tsx | ⭐⭐⭐⭐ |
| 19 | SCR-019 | Matrice d'affectation interactive | AssignmentsPage.tsx | ⭐⭐⭐⭐⭐ |
| 20 | SCR-020 | Rapports et statistiques visuelles | ReportsPage.tsx | ⭐⭐⭐⭐ |

**Total : 3 écrans, ~25 fichiers frontend + 12 fichiers backend = 37 fichiers**

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
1. SCR-018 (Liste + Détail + Form)
   ↓
2. SCR-019 (Affectations) ← utilise les enseignants de SCR-018
   ↓
3. SCR-020 (Rapports) ← utilise les données de SCR-018 + SCR-019 + SCR-012 (notes)
```

Le module Enseignants est maintenant **100% spécifié** et prêt pour le développement.

---

*EduGoma 360 — Module Enseignants Complet — Goma, RDC — © 2025*
