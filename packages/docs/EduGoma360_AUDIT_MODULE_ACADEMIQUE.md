# 🔍 EDUGOMA 360 — AUDIT COMPLET MODULE ACADÉMIQUE
## Checklist de validation exhaustive | SCR-010 à SCR-017

> **MODE D'EMPLOI :**
> Ce prompt audite les **8 écrans du module Académique** (gestion notes, délibération, bulletins).
> Exécute cet audit **APRÈS** avoir développé tous les écrans SCR-010 à SCR-017.
> Critère de succès : 100% des fonctionnalités implémentées + 0 erreur.

---

## CONTEXTE DE L'AUDIT

```
Module audité    : Gestion Académique (SCR-010 à SCR-017)
Écrans concernés : 8 écrans + 2 services backend critiques
Fichiers attendus: ~50 fichiers TypeScript/TSX
Prérequis        : Module Élèves validé
Complexité       : ⭐⭐⭐⭐⭐ (module le plus critique)
Critère de succès: 100% des tests + formules RDC validées
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 1 — AUDIT STRUCTUREL (FICHIERS ET ARCHITECTURE)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTIF : Vérifier que tous les fichiers attendus existent.

VÉRIFICATION AUTOMATIQUE :
```bash
find packages/client/src -type f -path "*academic*" -name "*.tsx" -o -name "*.ts" | sort
find packages/server/src -type f -path "*grades*" -o -path "*timetable*" -o -path "*classes*" | sort
```

## FICHIERS FRONTEND ATTENDUS

### Pages principales (8)
✓ pages/academic/ClassesPage.tsx
✓ pages/academic/TimetablePage.tsx
✓ pages/academic/GradeEntryPage.tsx
✓ pages/academic/ClassGradesPage.tsx
✓ pages/academic/AveragesPage.tsx
✓ pages/academic/DeliberationPage.tsx
✓ pages/academic/BulletinPage.tsx
✓ pages/academic/PalmaresPage.tsx

### Composants Classes (4)
✓ components/academic/ClassCard.tsx
✓ components/academic/ClassFormModal.tsx
✓ components/academic/TeacherAssignmentModal.tsx
✓ components/academic/ClassStatsCard.tsx

### Composants Emploi du Temps (3)
✓ components/academic/TimetableGrid.tsx
✓ components/academic/TimetableCell.tsx
✓ components/academic/PeriodFormModal.tsx

### Composants Notes (6)
✓ components/academic/GradeEntryTable.tsx
✓ components/academic/GradeInput.tsx
✓ components/academic/LockGradesModal.tsx
✓ components/academic/GradeStatsCard.tsx
✓ components/academic/GradesMatrixTable.tsx
✓ components/academic/GradeFilters.tsx

### Composants Moyennes (4)
✓ components/academic/AveragesTable.tsx
✓ components/academic/StudentAverageCard.tsx
✓ components/academic/ClassRankingTable.tsx
✓ components/academic/AverageCharts.tsx

### Composants Délibération (5)
✓ components/academic/DeliberationTable.tsx
✓ components/academic/DecisionModal.tsx
✓ components/academic/DeliberationStatsCard.tsx
✓ components/academic/DecisionBadge.tsx
✓ components/academic/ApprovalWorkflow.tsx

### Composants Bulletin (3)
✓ components/academic/BulletinPreview.tsx
✓ components/academic/BulletinPDFViewer.tsx
✓ components/academic/BulletinBatchGenerator.tsx

### Composants Palmarès (2)
✓ components/academic/PalmaresRankingList.tsx
✓ components/academic/PalmaresStatsCard.tsx

### Hooks (5)
✓ hooks/useGrades.ts
✓ hooks/useAverages.ts
✓ hooks/useDeliberation.ts
✓ hooks/useTimetable.ts
✓ hooks/useClasses.ts

### Offline (2)
✓ lib/offline/gradeQueue.ts
✓ lib/offline/syncGrades.ts

**Total Frontend attendu : 42 fichiers**

## FICHIERS BACKEND ATTENDUS

### Routes & Controllers (5)
✓ modules/classes/classes.routes.ts
✓ modules/classes/classes.controller.ts
✓ modules/timetable/timetable.routes.ts
✓ modules/timetable/timetable.controller.ts
✓ modules/grades/grades.routes.ts
✓ modules/grades/grades.controller.ts
✓ modules/deliberation/deliberation.routes.ts
✓ modules/deliberation/deliberation.controller.ts

### Services (5)
✓ modules/classes/classes.service.ts
✓ modules/timetable/timetable.service.ts
✓ modules/grades/grades.service.ts
✓ modules/deliberation/deliberation.service.ts
✓ modules/bulletins/bulletins.service.ts

### Templates PDF (2)
✓ modules/bulletins/templates/bulletin.html
✓ modules/bulletins/templates/palmares.html

**Total Backend attendu : 12 fichiers**

## FICHIERS PARTAGÉS CRITIQUES

✓ shared/src/utils/gradeCalc.ts         ← FORMULES OFFICIELLES RDC
✓ shared/src/constants/evalTypes.ts     ← Types évaluation
✓ shared/src/constants/decisions.ts     ← Décisions délibération
✓ shared/src/types/academic.ts          ← Types académiques

**Total Partagés attendu : 4 fichiers**

## CRITÈRES PARTIE 1

✓ PASS : 58/58 fichiers existent + 0 erreur TypeScript
✗ FAIL : Fichiers manquants OU erreurs compilation

```bash
# Vérifier compilation
cd packages/client && npm run type-check  # → 0 erreur
cd packages/server && npm run type-check  # → 0 erreur
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 2 — AUDIT SCR-010 (GESTION DES CLASSES)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTERFACE :
[ ] Grille de cartes classes (3 colonnes desktop, 1 mobile)
[ ] Bouton "+ Créer une classe" visible
[ ] Filtres : Section | Année | Statut

CLASSCARD :
[ ] Nom classe affiché (ex: "4ScA")
[ ] Section + Année affichés
[ ] Effectif actuel/max (ex: "32/45")
[ ] Enseignant titulaire (ou "Non assigné")
[ ] Badge statut (Actif vert / Archivé gris)
[ ] 3 boutons : Voir élèves | Attribuer cours | ⋮

MODAL CRÉATION CLASSE :
[ ] Champs : Nom, Section, Année, Max élèves
[ ] Validation : nom unique par école
[ ] Génération auto nomenclature (TC-1A, 4ScB, etc.)

ATTRIBUTION ENSEIGNANTS :
[ ] Modal liste matières de la section
[ ] Select enseignant par matière
[ ] Validation : 1 enseignant max par matière
[ ] Badge ✅ si enseignant assigné

API :
[ ] GET /api/classes → liste classes avec effectifs
[ ] POST /api/classes → création classe
[ ] PUT /api/classes/:id → modification
[ ] DELETE /api/classes/:id → archivage
[ ] POST /api/classes/:id/assign → attribution enseignant

RÈGLES MÉTIER :
[ ] Max élèves ≥ effectif actuel
[ ] Impossible supprimer classe avec notes saisies
[ ] Archivage conserve historique

STATUT SCR-010 : _____ / 17 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 3 — AUDIT SCR-011 (EMPLOI DU TEMPS)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GRILLE HEBDOMADAIRE :
[ ] 5 jours × 8 périodes affichées
[ ] Cellules vides affichent "LIBRE"
[ ] Périodes récréation marquées (non modifiables)

TIMETABLECELL :
[ ] Nom matière affiché
[ ] Nom classe affiché
[ ] Badge coloré selon section (TC bleu, Sc vert, etc.)
[ ] Nom enseignant si vue classe

MODES VISUALISATION :
[ ] Mode Enseignant : affiche emploi du temps connecté
[ ] Mode Classe : sélecteur classe → emploi temps classe
[ ] Mode Enseignant spécifique (Préfet uniquement)

ÉDITION (PRÉFET) :
[ ] Clic cellule → modal ajout cours
[ ] Validation : pas 2 cours même heure même prof
[ ] Validation : pas 2 cours même heure même classe
[ ] Détection conflits affichée

API :
[ ] GET /api/timetable/teacher/:id → emploi enseignant
[ ] GET /api/timetable/class/:id → emploi classe
[ ] POST /api/timetable → ajout période
[ ] DELETE /api/timetable/:id → suppression

RESPONSIVE :
[ ] Mobile : scroll horizontal grille
[ ] Desktop : grille complète visible

STATUT SCR-011 : _____ / 14 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 4 — AUDIT SCR-012 (SAISIE DES NOTES) ⭐ CRITIQUE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SÉLECTEURS :
[ ] Select Classe (filtrées selon enseignant)
[ ] Select Matière (filtrées selon enseignant)
[ ] Select Trimestre (T1, T2, T3)
[ ] Select Type éval (Inter, TP, Examen)

TABLEAU SAISIE :
[ ] Colonnes : Élève | Note /20 | Observation | Statut
[ ] Input note : max 20, accepte décimales (.5)
[ ] Badge statut : ✅ Saisi | ⏳ Attente | ⚠️ Note<10
[ ] Auto-save après chaque saisie (debounce 1s)

INDICATEUR OFFLINE :
[ ] Badge "🟢 Connecté" si online
[ ] Badge "🔴 Hors ligne · X en attente" si offline
[ ] File d'attente visible

OFFLINE SYNC :
[ ] Notes sauvées en Dexie.js si offline
[ ] Sync auto au retour connexion
[ ] Détection conflits (version serveur diff)
[ ] Modal résolution conflits

VERROUILLAGE NOTES :
[ ] Bouton "🔒 Verrouiller les notes"
[ ] Modal confirmation avec date limite
[ ] Après verrouillage : lecture seule
[ ] Déverrouillage possible (Préfet uniquement)

STATISTIQUES :
[ ] Carte "Progression" : X/Y élèves notés
[ ] Carte "Moyenne classe" : calculée en temps réel
[ ] Carte "Notes manquantes" : liste élèves

API :
[ ] GET /api/grades → notes filtrées
[ ] POST /api/grades → création note
[ ] PUT /api/grades/:id → modification
[ ] POST /api/grades/lock → verrouillage
[ ] POST /api/grades/sync → sync offline batch

VALIDATION :
[ ] Note 0-20 uniquement
[ ] Absents notés "ABS" (valeur null)
[ ] Impossible modifier notes verrouillées
[ ] Seul le prof propriétaire peut saisir

FORMULES (gradeCalc.ts) :
[ ] Moyenne matière = (Inter×0.3 + TP×0.2 + Examen×0.5)
[ ] Total points = Σ(Moyenne × Coeff)
[ ] Moyenne générale = Total / Σ Coeffs
[ ] Arrondi au 0.5 près (règle RDC)

STATUT SCR-012 : _____ / 27 critères ⭐

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 5 — AUDIT SCR-013 (VUE NOTES PAR CLASSE)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILTRES :
[ ] Select Classe
[ ] Select Trimestre
[ ] Toggle "Notes manquantes seulement"

MATRICE NOTES :
[ ] Lignes : élèves (nom format congolais)
[ ] Colonnes : matières (Math, Phys, Chim, etc.)
[ ] Cellules : moyenne matière ou "—" si absent
[ ] Colonne finale : Moyenne générale + Rang

COULEURS CELLULES :
[ ] ≥14 : vert foncé
[ ] 12-14 : vert clair
[ ] 10-12 : jaune
[ ] 8-10 : orange
[ ] <8 : rouge

NOTES MANQUANTES :
[ ] Cellule grise "—" si Inter/TP/Exam manquant
[ ] Icône ⚠️ à côté de la moyenne si incomplet
[ ] Tooltip : "2 notes manquantes : Inter, TP"

EXPORT :
[ ] Bouton "Export Excel" → fichier .xlsx
[ ] Colonnes : Matricule, Nom, toutes matières, Moy, Rang
[ ] Formatage couleurs préservé

API :
[ ] GET /api/grades/matrix → matrice complète classe
[ ] Réponse : { students: [], subjects: [], grades: [] }

STATUT SCR-013 : _____ / 14 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 6 — AUDIT SCR-014 (CALCUL DES MOYENNES)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SÉLECTEURS :
[ ] Select Classe
[ ] Select Trimestre

TABLEAU MOYENNES :
[ ] Colonnes : Rang | Matricule | Nom | Moy | Total pts | Statut
[ ] Tri par moyenne décroissante automatique
[ ] Badge statut : ADMIS (≥10) | AJOURNÉ (<10)

CARTES STATISTIQUES (3) :
[ ] Carte 1 : Moyenne classe
[ ] Carte 2 : Taux de réussite (% ≥10)
[ ] Carte 3 : Premier & dernier de classe

GRAPHIQUES :
[ ] Histogramme distribution notes
[ ] Courbe évolution moyenne T1 → T2 → T3

CALCUL RANG :
[ ] Rang 1 = meilleure moyenne
[ ] Ex-æquo : même rang (ex: 2 élèves à 15.0 → rang 1, suivant rang 3)
[ ] Tri stable (ordre alphabétique si même moyenne)

DÉTAIL ÉLÈVE :
[ ] Clic ligne → modal détail
[ ] Affiche : toutes notes matières + observations
[ ] Bouton "Voir bulletin" → navigation SCR-016

API :
[ ] GET /api/averages/class/:id → moyennes calculées
[ ] POST /api/averages/recalculate → recalcul forcé

FORMULES (gradeCalc.ts) :
[ ] calculateStudentAverage() implémenté
[ ] calculateClassAverage() implémenté
[ ] calculateRanking() implémenté
[ ] Arrondi 0.5 (14.3 → 14.5, 14.7 → 15.0)

STATUT SCR-014 : _____ / 18 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 7 — AUDIT SCR-015 (DÉLIBÉRATION) ⭐ CRITIQUE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRÉREQUIS VÉRIFIÉS :
[ ] Notes T3 verrouillées
[ ] Moyennes calculées
[ ] Message bloqueur si conditions non remplies

TABLEAU DÉLIBÉRATION :
[ ] Colonnes : Rang | Nom | Moy T1 | Moy T2 | Moy T3 | Moy An | Décision
[ ] Select décision par élève (7 options)
[ ] Couleur ligne selon décision

DÉCISIONS DISPONIBLES :
[ ] ADMIS (vert) : Moy ≥ 10
[ ] REFUSÉ (rouge) : Moy < 8
[ ] AJOURNÉ (orange) : 8 ≤ Moy < 10
[ ] ADMIS_EXCELLENCE (vert foncé) : Moy ≥ 16
[ ] ADMIS_DISTINCTION (vert clair) : 14 ≤ Moy < 16
[ ] REDOUBLE (violet) : cas spécial
[ ] DÉPLACÉ (bleu) : transfert interne

RÈGLES AUTO DÉCISION :
[ ] Moy ≥ 16 → suggestion EXCELLENCE
[ ] 14 ≤ Moy < 16 → suggestion DISTINCTION
[ ] 10 ≤ Moy < 14 → suggestion ADMIS
[ ] 8 ≤ Moy < 10 → suggestion AJOURNÉ
[ ] Moy < 8 → suggestion REFUSÉ

WORKFLOW APPROBATION :
[ ] Enseignants proposent décisions
[ ] Préfet valide en masse
[ ] Statut : Brouillon → Validé → Approuvé
[ ] Historique modifications tracé

STATISTIQUES :
[ ] Carte taux réussite (% ADMIS*)
[ ] Carte mentions (Excellence, Distinction)
[ ] Graphique camembert décisions

VERROUILLAGE FINAL :
[ ] Bouton "Approuver délibération"
[ ] Modal confirmation avec date + signature
[ ] Après approbation : lecture seule permanente
[ ] Génération auto bulletins en batch

API :
[ ] GET /api/deliberation/:termId → délibération
[ ] PUT /api/deliberation/:studentId → décision
[ ] POST /api/deliberation/approve → approbation finale
[ ] POST /api/deliberation/export → PV délibération PDF

PV DÉLIBÉRATION (PDF) :
[ ] En-tête école + année
[ ] Tableau élèves avec décisions
[ ] Signatures : Préfet + Directeur
[ ] Date d'approbation

STATUT SCR-015 : _____ / 28 critères ⭐

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 8 — AUDIT SCR-016 (BULLETIN SCOLAIRE PDF)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SÉLECTION ÉLÈVE :
[ ] Route /bulletins/:studentId/:termId
[ ] Accès depuis fiche élève OU liste

PREVIEW BULLETIN :
[ ] Aperçu HTML avant génération PDF
[ ] Bouton "Télécharger PDF"
[ ] Bouton "Imprimer"

CONTENU BULLETIN (RECTO) :
[ ] En-tête : Logo + Nom école + Province
[ ] Identité élève : Photo, Nom, Matricule, Classe
[ ] Année scolaire + Trimestre
[ ] Tableau notes par matière :
    - Matière | Coeff | Inter | TP | Exam | Moy | Rang
[ ] Total points
[ ] Moyenne générale (grand format)
[ ] Rang / Effectif
[ ] Décision délibération (badge coloré)

CONTENU BULLETIN (VERSO) :
[ ] Tableau absences : Justifiées | Non justifiées
[ ] Tableau conduite : Observations discipline
[ ] Décision conseil de classe
[ ] Observations générales (texte libre)
[ ] Visa Titulaire + Date
[ ] Visa Préfet + Date
[ ] Signature Parent + Date

TEMPLATE HTML :
[ ] Template Handlebars compilable
[ ] Format A4 (210×297mm)
[ ] Qualité 300 DPI
[ ] Marges 15mm

GÉNÉRATION PDF :
[ ] Puppeteer génère PDF
[ ] Cache Redis 30 jours
[ ] Filename : Bulletin_{MATRICULE}_{TRIMESTRE}.pdf
[ ] Watermark si brouillon (délibération non approuvée)

GÉNÉRATION EN MASSE :
[ ] Bouton "Générer bulletins classe"
[ ] Modal sélection : Classe + Trimestre
[ ] Barre progression génération
[ ] ZIP téléchargeable avec tous les PDFs

API :
[ ] GET /api/bulletins/:studentId/:termId → PDF
[ ] POST /api/bulletins/batch → génération masse
[ ] GET /api/bulletins/batch/:jobId → statut génération

RÈGLES MÉTIER :
[ ] Bulletin générable uniquement si délibération validée
[ ] Watermark "BROUILLON" si non approuvée
[ ] Cache invalidé si notes modifiées

STATUT SCR-016 : _____ / 24 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 9 — AUDIT SCR-017 (PALMARÈS DE CLASSE)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SÉLECTEURS :
[ ] Select Classe
[ ] Select Trimestre

PODIUM (TOP 3) :
[ ] 3 cartes distinctes : 🥇 🥈 🥉
[ ] Photo élève
[ ] Nom élève
[ ] Moyenne (grande taille)
[ ] Badge mention (Excellence/Distinction)

TABLEAU CLASSEMENT :
[ ] Colonnes : Rang | Photo | Nom | Moyenne | Mention
[ ] Top 10 affiché par défaut
[ ] Toggle "Afficher tout le classement"

CARTES STATISTIQUES :
[ ] Meilleure moyenne de la classe
[ ] Moyenne la plus basse
[ ] Écart-type (dispersion)

GRAPHIQUE :
[ ] Histogramme distribution moyennes
[ ] Courbe cumulative

EXPORT PDF PALMARÈS :
[ ] Bouton "Générer palmarès PDF"
[ ] Format A4 paysage
[ ] Top 20 élèves
[ ] Logos + signatures officielles

API :
[ ] GET /api/palmares/:classId/:termId → classement
[ ] GET /api/palmares/:classId/:termId/pdf → PDF

RÈGLES :
[ ] Palmarès visible uniquement après délibération
[ ] Export PDF avec watermark si non approuvé

STATUT SCR-017 : _____ / 15 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 10 — AUDIT FORMULES & CALCULS (CRITIQUES)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FICHIER : shared/src/utils/gradeCalc.ts

FORMULE MOYENNE MATIÈRE :
```typescript
function calculateSubjectAverage(
  inter: number | null,
  tp: number | null,
  exam: number | null
): number | null
```
[ ] Formule RDC correcte : (Inter×0.3 + TP×0.2 + Exam×0.5)
[ ] Retourne null si Exam manquant
[ ] Retourne moyenne partielle si Inter ou TP manquant
[ ] Tests unitaires passent (3 cas)

FORMULE TOTAL POINTS :
```typescript
function calculateTotalPoints(
  grades: Array<{ average: number; coefficient: number }>
): number
```
[ ] Formule : Σ(Moyenne × Coefficient)
[ ] Gère les notes null (exclues du total)
[ ] Arrondi 2 décimales
[ ] Tests passent (4 cas)

FORMULE MOYENNE GÉNÉRALE :
```typescript
function calculateGeneralAverage(
  totalPoints: number,
  totalCoefficients: number
): number
```
[ ] Formule : Total / Σ Coefficients
[ ] Arrondi au 0.5 près (règle RDC)
[ ] Exemples validés :
    - 14.3 → 14.5
    - 14.7 → 15.0
    - 14.25 → 14.5
    - 14.74 → 15.0
[ ] Tests passent (6 cas)

CALCUL RANG :
```typescript
function calculateRanking(
  students: Array<{ id: string; average: number }>
): Array<{ id: string; rank: number }>
```
[ ] Tri décroissant par moyenne
[ ] Ex-æquo ont même rang
[ ] Rang suivant = rang précédent + nombre d'ex-æquo
[ ] Exemple validé :
    - Student A: 15.0 → Rang 1
    - Student B: 15.0 → Rang 1
    - Student C: 14.5 → Rang 3 (pas 2)
[ ] Tests passent (5 cas)

DÉCISION AUTO :
```typescript
function suggestDecision(average: number): Decision
```
[ ] Moy ≥ 16 → EXCELLENCE
[ ] 14 ≤ Moy < 16 → DISTINCTION
[ ] 10 ≤ Moy < 14 → ADMIS
[ ] 8 ≤ Moy < 10 → AJOURNÉ
[ ] Moy < 8 → REFUSÉ
[ ] Tests passent (5 cas)

TESTS UNITAIRES :
```bash
npm test -- gradeCalc.test.ts
```
[ ] 23/23 tests passent
[ ] Coverage ≥ 95%

STATUT PARTIE 10 : _____ / 23 critères ⭐⭐⭐

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 11 — AUDIT QUALITÉ CODE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TYPESCRIPT :
[ ] 0 erreur npm run type-check
[ ] Aucun type any
[ ] Props typés avec interface
[ ] Types Academic dans shared/types/

REACT :
[ ] Composants fonctionnels
[ ] Hooks corrects
[ ] useMemo sur calculs lourds (moyennes)
[ ] useCallback sur callbacks lourds

TANSTACK QUERY :
[ ] Toutes requêtes via Query
[ ] queryKey avec dépendances (classId, termId)
[ ] staleTime adapté (notes: 30s, moyennes: 2min)
[ ] Mutations invalidate queries

VALIDATION ZOD :
[ ] Notes 0-20 validées
[ ] Types évaluation enum
[ ] Décisions enum

OFFLINE (Dexie.js) :
[ ] Table grades avec index
[ ] Queue sync implémentée
[ ] Détection conflits
[ ] Retry automatique

PERFORMANCE :
[ ] Calcul moyennes optimisé (memoïzé)
[ ] Pagination sur grandes classes (>100 élèves)
[ ] Lazy loading images bulletins
[ ] Worker threads pour calculs lourds

SÉCURITÉ :
[ ] RBAC : Enseignant peut saisir notes de ses matières uniquement
[ ] Notes verrouillées = readonly
[ ] Délibération approuvée = immutable
[ ] Validation double client + serveur

TESTS :
[ ] Tests unitaires gradeCalc.ts
[ ] Tests composants GradeEntryTable
[ ] Tests API grades endpoints
[ ] Tests e2e : saisie note → délibération → bulletin

STATUT PARTIE 11 : _____ / 24 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 12 — AUDIT INTÉGRATION & DÉPLOIEMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTÉGRATION MODULE ÉLÈVES :
[ ] Onglet Notes fiche élève fonctionne
[ ] Navigation élève → bulletin fluide
[ ] Création élève → auto-ajout dans classe

INTÉGRATION DASHBOARD :
[ ] Carte "Notes en attente" fonctionne
[ ] Alerte "Délibération à approuver" visible
[ ] Stats académiques temps réel

BASE DONNÉES :
[ ] Migrations appliquées (grades, deliberation, etc.)
[ ] Index sur classId + termId + subjectId
[ ] Contraintes uniques (1 note par élève/matière/type)
[ ] Seed 100 notes de démo

OFFLINE :
[ ] Service Worker enregistré
[ ] Cache API responses
[ ] Sync queue fonctionne
[ ] Indicateur sync visible

ENV :
[ ] Vars académique définies
[ ] PUPPETEER_EXECUTABLE_PATH (si Docker)

BUILD :
[ ] npm run build réussit
[ ] Bundle < 800KB gzip (avec formules)

DÉPLOIEMENT :
[ ] Migrations DB appliquées
[ ] Seed académique exécuté
[ ] Génération PDF fonctionne
[ ] Cache Redis actif

POST-DEPLOY :
[ ] Saisie note fonctionne
[ ] Calcul moyennes correct
[ ] Délibération approuve
[ ] Bulletin PDF généré
[ ] Palmarès affiché

STATUT PARTIE 12 : _____ / 18 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RAPPORT FINAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYNTHÈSE :

| Partie | Nom | Critères | Statut |
|--------|-----|----------|--------|
| 1  | Structurel | 58 fichiers | ✓ / ✗ |
| 2  | SCR-010 Classes | 17 | ✓ / ✗ |
| 3  | SCR-011 Emploi temps | 14 | ✓ / ✗ |
| 4  | SCR-012 Saisie notes ⭐ | 27 | ✓ / ✗ |
| 5  | SCR-013 Vue classe | 14 | ✓ / ✗ |
| 6  | SCR-014 Moyennes | 18 | ✓ / ✗ |
| 7  | SCR-015 Délibération ⭐ | 28 | ✓ / ✗ |
| 8  | SCR-016 Bulletin PDF | 24 | ✓ / ✗ |
| 9  | SCR-017 Palmarès | 15 | ✓ / ✗ |
| 10 | Formules RDC ⭐⭐⭐ | 23 | ✓ / ✗ |
| 11 | Qualité Code | 24 | ✓ / ✗ |
| 12 | Intégration/Deploy | 18 | ✓ / ✗ |

**TOTAL : _____ / 280 critères**

## DÉCISION

[ ] ✅ MODULE VALIDÉ → Production ready
[ ] ⚠️  PARTIELLEMENT VALIDÉ → Corrections mineures
[ ] ❌ NON VALIDÉ → Corrections majeures

## CRITÈRES SUCCÈS ABSOLUS

Pour validation, **TOUS** ces critères doivent être ✅ :

✅ **100%** fichiers créés (58/58)
✅ **0** erreur TypeScript
✅ **23/23** tests formules passent ⭐⭐⭐
✅ **SCR-012** saisie notes fonctionne offline
✅ **SCR-015** délibération workflow complet
✅ **SCR-016** bulletin PDF généré correctement
✅ **Formules RDC** validées par tests unitaires
✅ **Moyenne générale** arrondie 0.5 (règle RDC)
✅ **Build** réussit sans erreur

Si **UN SEUL** critère échoue → **MODULE NON VALIDÉ**

---

## CORRECTIONS PRIORITAIRES (si échec)

### 🔴 CRITIQUES (bloqueurs production)
1. Formules RDC incorrectes
2. Saisie notes ne fonctionne pas offline
3. Délibération workflow cassé
4. Bulletin PDF ne génère pas

### 🟡 IMPORTANTES (avant MVP)
5. Tests formules manquants
6. Cache Redis non implémenté
7. Validation RBAC incomplète
8. Export Excel notes défaillant

### 🟢 AMÉLIORATIONS (post-MVP)
9. Lazy loading images
10. Worker threads calculs
11. Tests e2e complets
12. Audit accessibilité

---

## COMMANDES VÉRIFICATION FINALE

```bash
# 1. Compilation
npm run type-check  # → 0 erreur

# 2. Tests formules (CRITIQUE)
npm test -- gradeCalc.test.ts  # → 23/23 pass

# 3. Build
npm run build  # → Succès

# 4. Seed académique
npm run db:seed:academic  # → 100 notes

# 5. Lancer app
npm run dev
```

## SCÉNARIO TEST COMPLET

1. ✅ Créer classe "4ScA" avec 10 élèves
2. ✅ Assigner enseignant Math
3. ✅ Saisir notes Inter (tous élèves)
4. ✅ Saisir notes TP (tous élèves)
5. ✅ Saisir notes Examen (tous élèves)
6. ✅ Verrouiller notes Math
7. ✅ Vérifier calcul moyennes (formule RDC)
8. ✅ Approuver délibération
9. ✅ Générer bulletin 1 élève → PDF téléchargé
10. ✅ Générer palmarès classe → affichage correct

Si **TOUS** les 10 points ✅ → **MODULE VALIDÉ**

---

*EduGoma 360 — Audit Module Académique — Goma, RDC — © 2025*
