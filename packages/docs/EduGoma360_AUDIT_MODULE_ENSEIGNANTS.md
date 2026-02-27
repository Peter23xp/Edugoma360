# 🔍 EDUGOMA 360 — AUDIT COMPLET MODULE ENSEIGNANTS
## Checklist de validation exhaustive | SCR-018 à SCR-020

> **MODE D'EMPLOI :**
> Ce prompt audite les **3 écrans du module Enseignants** (gestion, profils, absences).
> Exécute cet audit **APRÈS** avoir développé tous les écrans SCR-018 à SCR-020.
> Critère de succès : 100% des fonctionnalités + matricule auto + CRON fonctionnel.

---

## CONTEXTE DE L'AUDIT

```
Module audité    : Gestion des Enseignants (SCR-018 à SCR-020)
Écrans concernés : 3 écrans + 1 tâche CRON critique
Fichiers attendus: ~34 fichiers TypeScript/TSX
Prérequis        : Modules Élèves + Académique validés
Complexité       : ⭐⭐⭐
Critère de succès: Matricule auto + compte user + CRON + 20j congés
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 1 — AUDIT STRUCTUREL (FICHIERS ET ARCHITECTURE)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTIF : Vérifier que tous les fichiers attendus existent.

VÉRIFICATION AUTOMATIQUE :
```bash
find packages/client/src -type f -path "*teachers*" -name "*.tsx" -o -name "*.ts" | sort
find packages/server/src -type f -path "*teachers*" -o -path "*absences*" | sort
```

## FICHIERS FRONTEND ATTENDUS

### Pages (3)
✓ pages/teachers/TeachersListPage.tsx
✓ pages/teachers/TeacherProfilePage.tsx
✓ pages/teachers/AbsencesPage.tsx

### Composants Liste (7)
✓ components/teachers/TeacherCard.tsx
✓ components/teachers/TeacherRow.tsx
✓ components/teachers/TeacherFilters.tsx
✓ components/teachers/TeacherFormModal.tsx
✓ components/teachers/AssignSubjectsModal.tsx
✓ components/teachers/TeacherStatsCards.tsx
✓ components/teachers/ImportTeachersModal.tsx

### Composants Profil (5)
✓ components/teachers/ProfileHeader.tsx
✓ components/teachers/ProfileTabs.tsx
✓ components/teachers/ProfileActionMenu.tsx
✓ components/teachers/tabs/InfoTab.tsx
✓ components/teachers/tabs/ClassesTab.tsx
✓ components/teachers/tabs/TimetableTab.tsx
✓ components/teachers/tabs/StatsTab.tsx

### Composants Absences (5)
✓ components/teachers/AbsenceCalendar.tsx
✓ components/teachers/AbsenceRequestModal.tsx
✓ components/teachers/AbsenceApprovalModal.tsx
✓ components/teachers/AbsencesList.tsx
✓ components/teachers/AbsenceStatsCards.tsx

### Hooks (3)
✓ hooks/useTeachers.ts
✓ hooks/useTeacherProfile.ts
✓ hooks/useAbsences.ts

**Total Frontend attendu : 23 fichiers**

## FICHIERS BACKEND ATTENDUS

### Routes & Controllers (3)
✓ modules/teachers/teachers.routes.ts
✓ modules/teachers/teachers.controller.ts
✓ modules/absences/absences.routes.ts
✓ modules/absences/absences.controller.ts

### Services (3)
✓ modules/teachers/teachers.service.ts
✓ modules/absences/absences.service.ts
✓ modules/teachers/teachers.cron.ts  ← TÂCHE CRON CRITIQUE

### DTOs (2)
✓ modules/teachers/teachers.dto.ts
✓ modules/absences/absences.dto.ts

### Templates PDF (2)
✓ modules/teachers/templates/contract.html
✓ modules/teachers/templates/timetable.html

**Total Backend attendu : 10 fichiers**

## FICHIERS PARTAGÉS ATTENDUS

✓ shared/src/types/teacher.ts
✓ shared/src/types/absence.ts
✓ shared/src/constants/subjects.ts
✓ shared/src/constants/teacherStatuses.ts
✓ shared/src/utils/teacherMatricule.ts

**Total Partagés attendu : 5 fichiers**

## CRITÈRES PARTIE 1

✓ PASS : 38/38 fichiers existent + 0 erreur TypeScript
✗ FAIL : Fichiers manquants OU erreurs compilation

```bash
# Vérifier compilation
cd packages/client && npm run type-check  # → 0 erreur
cd packages/server && npm run type-check  # → 0 erreur
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 2 — AUDIT SCR-018 (LISTE ENSEIGNANTS)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTERFACE :
[ ] Toggle Mode grille / Mode liste fonctionne
[ ] Mode grille : 3 colonnes desktop, 1 mobile
[ ] Mode liste : tableau avec toutes colonnes

TEACHERCARD (MODE GRILLE) :
[ ] Photo 80×80px (ou initiales si absent)
[ ] Nom format congolais : "NOM POSTNOM Prénom"
[ ] Matricule affiché (ex: ENS-NK-042)
[ ] Badge statut coloré (🟢 Actif, 🟡 Congé, 🔴 Suspendu)
[ ] Matière principale affichée
[ ] Nombre de classes affiché (ex: "6 classes")
[ ] Téléphone cliquable (tel:...)
[ ] Boutons : Voir profil | ⋮

TEACHERROW (MODE LISTE) :
[ ] Colonnes : Photo | Matricule | Nom | Matière | Classes | Statut | ⋮
[ ] Tri par colonne fonctionne
[ ] Pagination 25/page

FILTRES :
[ ] Select Matière (toutes matières disponibles)
[ ] Select Statut (défaut : Actif uniquement)
[ ] Select Section
[ ] Recherche avec debounce 300ms

CRÉATION ENSEIGNANT (MODAL) :
[ ] Wizard 2 étapes : Identité | Professionnel
[ ] Upload photo drag & drop fonctionne
[ ] Nom/Post-nom → MAJUSCULES auto
[ ] Prénom → Capitalize
[ ] Date naissance : âge min 21 ans validé
[ ] Téléphone : validation +243XXXXXXXXX
[ ] Email : validation format email
[ ] Diplôme : select (Graduat, Licence, Master, Doctorat)
[ ] Matière principale : select dynamique

MATRICULE AUTO-GÉNÉRÉ ⭐ :
[ ] Format correct : ENS-{PROVINCE}-{SEQUENCE}
[ ] Exemple : ENS-NK-042
[ ] Séquentiel par école (001, 002, 003...)
[ ] Unique par école
[ ] Généré côté serveur (PAS client)

COMPTE UTILISATEUR AUTO ⭐ :
[ ] Compte créé avec rôle ENSEIGNANT
[ ] Email = celui fourni OU {matricule}@temp.edugoma360.cd
[ ] Mot de passe initial : "Edugoma2025"
[ ] Flag mustChangePassword = true
[ ] Transaction atomique (enseignant + user)

NOTIFICATIONS :
[ ] Email bienvenue envoyé avec identifiants
[ ] SMS bienvenue envoyé au téléphone
[ ] Toast succès : "✓ Enseignant ajouté ! Matricule : {matricule}"
[ ] Redirection vers /teachers/{id} après création

ATTRIBUTION MATIÈRES (MODAL) :
[ ] Affiche matière principale
[ ] Sélection sections + classes par section
[ ] Checkbox classes par section
[ ] Matières secondaires (optionnel)
[ ] Validation : max 10 classes
[ ] Alerte si classe déjà assignée à autre prof

STATS CARDS (3) :
[ ] Carte 1 : Total enseignants + évolution mois
[ ] Carte 2 : Ratio élèves/enseignants
[ ] Carte 3 : Enseignants en congé + date retour

MENU ACTIONS (⋮) :
[ ] Options Préfet : 8 options (Voir, Modifier, Attribuer, etc.)
[ ] Options Enseignant : 2 options (Voir profil, Emploi temps)
[ ] Bouton "Générer contrat" fonctionne (PDF)
[ ] Archivage (démission) demande raison

API :
[ ] GET /api/teachers → liste avec filtres + pagination
[ ] POST /api/teachers → création avec matricule auto
[ ] PUT /api/teachers/:id → modification
[ ] DELETE /api/teachers/:id → archivage soft
[ ] POST /api/teachers/:id/assign → attribution matières

RESPONSIVE :
[ ] Mobile 375px : mode liste forcé
[ ] Desktop 1280px : mode grille par défaut

STATUT SCR-018 : _____ / 38 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 3 — AUDIT SCR-019 (PROFIL ENSEIGNANT)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROFILEHEADER :
[ ] Photo 120×120px (ou initiales)
[ ] Nom complet format congolais
[ ] Matricule affiché
[ ] Badge statut coloré
[ ] Matière principale + nombre classes
[ ] Téléphone + email cliquables
[ ] Date embauche + ancienneté calculée
[ ] Boutons : Modifier | Voir emploi temps | ⋮

PERMISSIONS RÔLES :
[ ] Enseignant voit SEULEMENT son propre profil
[ ] Enseignant peut modifier : photo, téléphone, email, adresse
[ ] Enseignant NE peut PAS modifier : statut, diplôme, matricule
[ ] Préfet voit tous les profils
[ ] Préfet peut tout modifier

ONGLET 1 — INFOS (InfoTab) :
[ ] 4 cartes : Identité | Contact | Professionnel | Observations
[ ] Carte Identité : sexe, date naissance, âge calculé, lieu, nationalité
[ ] Carte Contact : téléphone avec [Appeler] [SMS], email avec [Envoyer]
[ ] Carte Pro : matricule, statut, embauche, ancienneté, diplôme, spé, matière
[ ] N° SECOPE affiché (si présent)
[ ] Compte bancaire affiché (si présent)

ONGLET 2 — CLASSES (ClassesTab) :
[ ] Stats : X classes · Y élèves · Z périodes/semaine
[ ] Tableau : Classe | Section | Matière | Effectif | Périodes | Actions
[ ] Bouton [Notes] redirige vers SCR-012 pré-filtré
[ ] Si Préfet : bouton "Retirer attribution" visible
[ ] Si Préfet : bouton "+ Attribuer nouvelle classe" visible

ONGLET 3 — EMPLOI TEMPS (TimetableTab) :
[ ] Grille 5 jours × 8 périodes affichée
[ ] Cellules avec matière + classe + horaire
[ ] Total périodes calculé affiché
[ ] Périodes libres calculées affichées
[ ] Bouton "Télécharger PDF" génère PDF A4 paysage
[ ] Bouton "Imprimer" ouvre dialog impression

ONGLET 4 — STATS (StatsTab) :
[ ] Sélecteur trimestre (T1, T2, T3)
[ ] 4 cartes stats : Moy générale | Taux réussite | Notes manquantes | Top 3
[ ] Graphique évolution moyennes T1→T2→T3
[ ] Tableau moyennes par classe
[ ] Colonne "Excellence" = nombre élèves ≥16

MENU ACTIONS PROFIL :
[ ] Préfet : 8 options dont réinitialiser mdp + contrat PDF
[ ] Enseignant : 2 options (modifier infos + changer mdp)
[ ] Réinitialiser mdp génère nouveau mdp + envoie email

PDF CONTRAT TRAVAIL :
[ ] Génération PDF fonctionne
[ ] Format A4, qualité 300 DPI
[ ] En-tête logo école
[ ] 7 articles présents (identité, objet, durée, etc.)
[ ] Zones signatures : Enseignant + Directeur + Date
[ ] Filename : Contrat_{MATRICULE}_{ANNEE}.pdf

PDF EMPLOI DU TEMPS :
[ ] Génération PDF fonctionne
[ ] Format A4 paysage
[ ] Grille complète 5×8
[ ] Total périodes en bas
[ ] Signature Préfet

API :
[ ] GET /api/teachers/:id → profil complet avec relations
[ ] GET /api/teachers/:id/stats?termId= → stats académiques
[ ] GET /api/teachers/:id/timetable/pdf → PDF emploi
[ ] GET /api/teachers/:id/contract → PDF contrat
[ ] POST /api/teachers/:id/reset-password → nouveau mdp

STATUT SCR-019 : _____ / 33 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 4 — AUDIT SCR-020 (GESTION ABSENCES) ⭐ CRITIQUE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VUE PRÉFET :
[ ] 3 cartes stats : En attente | Taux approbation | Absences semaine
[ ] Calendrier mensuel avec absences marquées
[ ] Navigation mois ← →
[ ] Tooltip hover jour : liste enseignants absents

VUE ENSEIGNANT :
[ ] 3 cartes stats : Jours pris/20 | Jours restants | En attente
[ ] Bouton "+ Nouvelle demande" visible
[ ] Liste mes demandes avec statuts
[ ] Badge solde congés affiché

CALENDRIER :
[ ] Jours colorés : Vert (approuvé), Orange (attente), Rouge (non justifié), Gris (weekend)
[ ] Clic jour → détail absences ce jour
[ ] Légende couleurs affichée

DEMANDE CONGÉ (MODAL ENSEIGNANT) :
[ ] 6 types : Maladie | Personnel | Formation | Maternité | Décès | Autre
[ ] Date début + Date fin (date pickers)
[ ] Durée calculée automatiquement (jours ouvrables)
[ ] Raison (textarea min 10 chars)
[ ] Upload certificat médical (si maladie)
[ ] Validation : date fin > date début
[ ] Validation : durée ≤ jours restants (sauf maladie avec certificat)
[ ] Alerte si jours épuisés

RÈGLES 20 JOURS CONGÉS ⭐ :
[ ] Chaque enseignant = 20 jours/an
[ ] Personnel : compte dans les 20
[ ] Formation : NE compte PAS (illimité)
[ ] Maladie sans certificat : compte dans les 20
[ ] Maladie avec certificat : NE compte PAS
[ ] Maternité 90j : NE compte PAS
[ ] Décès familial 3j : NE compte PAS

CALCUL DURÉE :
[ ] Exclut week-ends (samedi, dimanche)
[ ] Exemple : Ven→Lun = 2 jours (sam/dim exclus)
[ ] Exemple : Lun→Mer = 3 jours

VALIDATION DEMANDE (MODAL PRÉFET) :
[ ] Affiche : Type, Période, Durée, Raison
[ ] Affiche certificat si uploadé (bouton [Voir])
[ ] Liste classes concernées avec périodes manquées
[ ] Total périodes à remplacer calculé
[ ] Select "Enseignant remplaçant" (optionnel)
[ ] Textarea "Observations" (obligatoire si refus)
[ ] Boutons : [Refuser] [Approuver]

APPROBATION :
[ ] Statut enseignant → EN_CONGE
[ ] Notification SMS + Email enseignant
[ ] Si remplaçant : notification remplaçant
[ ] Toast : "Congé approuvé"

REFUS :
[ ] Observations obligatoires (raison refus)
[ ] Notification enseignant avec raison
[ ] Toast : "Demande refusée"

TÂCHE CRON QUOTIDIENNE ⭐⭐⭐ :
[ ] Fichier teachers.cron.ts existe
[ ] CRON schedule : '0 8 * * *' (8h00 chaque jour)
[ ] Fonction updateTeacherStatuses() implémentée
[ ] Mise à jour : statut → EN_CONGE si congé commence aujourd'hui
[ ] Mise à jour : statut → ACTIF si congé termine aujourd'hui
[ ] Notifications SMS envoyées automatiquement
[ ] Logger les mises à jour dans system_logs

TESTER CRON MANUELLEMENT :
```bash
# Exécuter la tâche manuellement pour tester
node -e "require('./dist/modules/teachers/teachers.cron.js').updateTeacherStatuses()"
```

NOTIFICATIONS AUTO :
[ ] Demande envoyée → SMS Préfet "Nouvelle demande {NOM}"
[ ] Approuvée → SMS enseignant "Congé approuvé"
[ ] Refusée → SMS enseignant avec raison
[ ] 1 jour avant fin → SMS enseignant "Congé se termine demain"
[ ] Jour retour → Email Préfet si absent

LISTE ABSENCES :
[ ] Tableau avec filtres : Enseignant | Type | Statut | Période
[ ] Colonnes : Enseignant | Type | Période | Durée | Statut | Actions
[ ] Pagination 25/page
[ ] Badge statut : ⏳ Attente | ✅ Approuvé | ❌ Refusé

API :
[ ] GET /api/absences → liste avec filtres + stats
[ ] POST /api/absences → création demande avec upload certificat
[ ] PUT /api/absences/:id/approve → approbation
[ ] PUT /api/absences/:id/reject → refus avec raison
[ ] DELETE /api/absences/:id → annulation (si en attente)
[ ] GET /api/absences/my-balance → solde congés enseignant

RÈGLES BLOQUANTES :
[ ] Impossible demander congé pendant période examens
[ ] Impossible demander congé pendant délibération
[ ] Impossible modifier/supprimer absence approuvée
[ ] Maternité uniquement pour enseignantes (F)

RESPONSIVE :
[ ] Mobile : onglets Calendrier | Liste | Stats
[ ] Desktop : tout visible simultanément

STATUT SCR-020 : _____ / 45 critères ⭐

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 5 — AUDIT FONCTIONS CRITIQUES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GÉNÉRATION MATRICULE ⭐⭐⭐ :

Fichier : shared/src/utils/teacherMatricule.ts

```typescript
function generateTeacherMatricule(
  province: string,
  sequence: number
): string
```

[ ] Fonction existe et exportée
[ ] Format : ENS-{PROVINCE}-{SEQUENCE}
[ ] Sequence padding 3 chiffres (001, 042, 156)
[ ] Exemples validés :
    - generateTeacherMatricule("NK", 1) → "ENS-NK-001"
    - generateTeacherMatricule("NK", 42) → "ENS-NK-042"
    - generateTeacherMatricule("SK", 156) → "ENS-SK-156"
[ ] Tests unitaires passent (3 cas)

CALCUL DURÉE CONGÉ ⭐⭐ :

Fichier : modules/absences/absences.service.ts

```typescript
function calculateDuration(
  startDate: Date,
  endDate: Date
): number
```

[ ] Fonction existe
[ ] Exclut samedi (6) et dimanche (0)
[ ] Exemples validés :
    - Lun→Mer = 3 jours
    - Ven→Lun = 2 jours (sam/dim exclus)
    - Lun→Ven = 5 jours
    - Lun(semaine1)→Lun(semaine2) = 6 jours (2 weekends exclus)
[ ] Tests unitaires passent (5 cas)

CALCUL SOLDE CONGÉS ⭐⭐ :

```typescript
function calculateBalance(
  teacherId: string,
  academicYearId: string
): Promise<{
  total: number,
  pris: number,
  restants: number
}>
```

[ ] Fonction existe
[ ] Récupère toutes absences approuvées année en cours
[ ] Comptabilise selon type :
    - Personnel : OUI (compte)
    - Maladie sans certificat : OUI
    - Maladie avec certificat : NON
    - Formation : NON
    - Maternité : NON
    - Décès : NON
[ ] Retourne objet correct
[ ] Tests passent (4 cas)

MISE À JOUR STATUTS AUTO ⭐⭐⭐ :

Fichier : modules/teachers/teachers.cron.ts

```typescript
async function updateTeacherStatuses(): Promise<void>
```

[ ] Fonction existe et exportée
[ ] Trouve absences commençant aujourd'hui (approuvées)
[ ] Met à jour statut enseignant → EN_CONGE
[ ] Envoie notification SMS
[ ] Trouve absences terminant aujourd'hui
[ ] Met à jour statut enseignant → ACTIF
[ ] Envoie notification Préfet
[ ] Logger chaque mise à jour
[ ] Gestion erreurs (try/catch)
[ ] Tests passent (3 cas)

CRON REGISTRATION ⭐⭐⭐ :

Fichier : server/src/app.ts ou server/src/index.ts

```typescript
import cron from 'node-cron'
import { updateTeacherStatuses } from './modules/teachers/teachers.cron'

cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Mise à jour statuts enseignants...')
  await updateTeacherStatuses()
})
```

[ ] CRON enregistré au démarrage serveur
[ ] Schedule correct : '0 8 * * *' (8h00 quotidien)
[ ] Logger au démarrage : "CRON teacher statuses registered"
[ ] Gestion erreurs ne crash pas le serveur

STATUT PARTIE 5 : _____ / 30 critères ⭐⭐⭐

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 6 — AUDIT QUALITÉ CODE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TYPESCRIPT :
[ ] 0 erreur npm run type-check
[ ] Aucun type any
[ ] Interfaces Teacher, Absence correctement typées
[ ] Enums TeacherStatus, AbsenceType, AbsenceStatus définis

VALIDATION ZOD :
[ ] Schema createTeacherDto validé
[ ] Schema createAbsenceDto validé
[ ] Téléphone congolais validé
[ ] Email validé
[ ] Dates validées (fin > début)
[ ] Âge min 21 ans validé

SÉCURITÉ :
[ ] RBAC : Enseignant voit seulement son profil
[ ] RBAC : Préfet voit tous les profils
[ ] Matricule généré serveur (PAS client)
[ ] Transaction atomique enseignant + user
[ ] Upload certificat sécurisé (max 5MB, PDF/JPG/PNG)

PERFORMANCE :
[ ] Pagination sur liste enseignants
[ ] Pagination sur liste absences
[ ] Index DB sur matricule
[ ] Index DB sur telephone (unique)
[ ] Cache stats calendrier (1h)

TESTS UNITAIRES :
[ ] Tests generateTeacherMatricule (3 cas)
[ ] Tests calculateDuration (5 cas)
[ ] Tests calculateBalance (4 cas)
[ ] Tests updateTeacherStatuses (3 cas)
[ ] Coverage ≥ 70%

STATUT PARTIE 6 : _____ / 21 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 7 — AUDIT INTÉGRATION & DÉPLOIEMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTÉGRATION MODULE ACADÉMIQUE :
[ ] Attribution matières crée assignments
[ ] Emploi du temps enseignant charge depuis timetable
[ ] Stats académiques calculent depuis grades

INTÉGRATION MODULE ÉLÈVES :
[ ] Classes dans profil chargent les élèves
[ ] Lien vers saisie notes fonctionne (SCR-012)

INTÉGRATION DASHBOARD :
[ ] Carte "Enseignants" affiche total
[ ] Alerte "Congés en attente" visible
[ ] Widget "Anniversaires enseignants" (optionnel)

BASE DONNÉES :
[ ] Table teachers avec toutes colonnes
[ ] Table teacher_assignments existe
[ ] Table absences existe
[ ] Index créés (matricule, telephone)
[ ] Contraintes : @@unique([schoolId, matricule])
[ ] Seed 10 enseignants de démo

ENV :
[ ] NODE_CRON installé : npm list node-cron
[ ] BCRYPT installé : npm list bcrypt
[ ] Variables email définies (SMTP)
[ ] Variables SMS définies (AT_API_KEY)

BUILD :
[ ] npm run build réussit
[ ] CRON enregistré au démarrage
[ ] Logs CRON visibles : "CRON teacher statuses registered"

DÉPLOIEMENT :
[ ] Migrations appliquées
[ ] Seed enseignants exécuté
[ ] CRON fonctionne en production
[ ] Génération PDF contrat fonctionne
[ ] Génération PDF emploi temps fonctionne

POST-DEPLOY :
[ ] Création enseignant → matricule généré
[ ] Compte user créé avec rôle ENSEIGNANT
[ ] Email/SMS bienvenue envoyés
[ ] Attribution matières fonctionne
[ ] Demande congé fonctionne
[ ] Approbation congé fonctionne
[ ] CRON met à jour statuts à 8h00
[ ] Notifications envoyées par CRON

STATUT PARTIE 7 : _____ / 28 critères

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RAPPORT FINAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYNTHÈSE :

| Partie | Nom | Critères | Statut |
|--------|-----|----------|--------|
| 1  | Structurel | 38 fichiers | ✓ / ✗ |
| 2  | SCR-018 Liste | 38 | ✓ / ✗ |
| 3  | SCR-019 Profil | 33 | ✓ / ✗ |
| 4  | SCR-020 Absences ⭐ | 45 | ✓ / ✗ |
| 5  | Fonctions critiques ⭐⭐⭐ | 30 | ✓ / ✗ |
| 6  | Qualité Code | 21 | ✓ / ✗ |
| 7  | Intégration/Deploy | 28 | ✓ / ✗ |

**TOTAL : _____ / 233 critères**

## DÉCISION

[ ] ✅ MODULE VALIDÉ → Production ready
[ ] ⚠️  PARTIELLEMENT VALIDÉ → Corrections mineures
[ ] ❌ NON VALIDÉ → Corrections majeures

## CRITÈRES SUCCÈS ABSOLUS

Pour validation, **TOUS** ces critères doivent être ✅ :

✅ **38/38** fichiers créés
✅ **0** erreur TypeScript
✅ **Matricule auto** format ENS-{PROVINCE}-{SEQ}
✅ **Compte user** créé automatiquement avec enseignant
✅ **Transaction atomique** (enseignant + user)
✅ **20 jours congés/an** respectés
✅ **Calcul durée** exclut week-ends
✅ **CRON quotidien** fonctionne (8h00)
✅ **Notifications** SMS/Email envoyées
✅ **Tests unitaires** passent (15 tests min)

Si **UN SEUL** critère échoue → **MODULE NON VALIDÉ**

---

## SCÉNARIO TEST COMPLET (12 ÉTAPES)

```
1. Créer enseignant "MUKASA Jean"                  → ✅
2. Vérifier matricule généré : ENS-NK-042          → ✅
3. Vérifier compte user créé (role=ENSEIGNANT)     → ✅
4. Vérifier email/SMS bienvenue envoyés            → ✅
5. Attribuer 6 classes à MUKASA                    → ✅
6. Consulter profil → 4 onglets visibles           → ✅
7. Générer PDF contrat → téléchargé                → ✅
8. Demander congé 3 jours (enseignant)             → ✅
9. Approuver congé (préfet)                        → ✅
10. Vérifier statut → EN_CONGE                     → ✅
11. Attendre lendemain 8h → CRON exécuté           → ✅
12. Vérifier notification SMS reçue                → ✅
```

Si **TOUS** les 12 points ✅ → **MODULE VALIDÉ**

---

## COMMANDES VÉRIFICATION FINALE

```bash
# 1. Compilation
npm run type-check  # → 0 erreur

# 2. Tests fonctions critiques
npm test -- teacherMatricule.test.ts  # → 3/3 pass
npm test -- calculateDuration.test.ts # → 5/5 pass
npm test -- calculateBalance.test.ts  # → 4/4 pass
npm test -- updateTeacherStatuses.test.ts # → 3/3 pass

# 3. Vérifier CRON enregistré
npm start
# Chercher dans logs : "[CRON] teacher statuses registered"

# 4. Tester CRON manuellement
node -e "require('./dist/modules/teachers/teachers.cron.js').updateTeacherStatuses()"

# 5. Build
npm run build  # → Succès
```

---

## CORRECTIONS PRIORITAIRES (si échec)

### 🔴 CRITIQUES (bloqueurs production)
1. Matricule pas généré automatiquement
2. Compte user pas créé avec enseignant
3. Transaction pas atomique (rollback échoue)
4. CRON pas enregistré ou pas exécuté
5. Calcul durée inclut week-ends

### 🟡 IMPORTANTES (avant MVP)
6. Tests unitaires manquants
7. Notifications SMS/Email pas envoyées
8. PDF contrat/emploi temps ne génèrent pas
9. 20 jours congés pas respectés
10. Validation âge min 21 ans absente

### 🟢 AMÉLIORATIONS (post-MVP)
11. Cache stats calendrier
12. Export Excel liste enseignants
13. Import masse enseignants
14. Rappel automatique formation continue
15. Audit accessibilité

---

*EduGoma 360 — Audit Module Enseignants — Goma, RDC — © 2025*
