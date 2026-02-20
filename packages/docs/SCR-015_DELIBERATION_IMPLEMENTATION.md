# SCR-015 - Délibération - Documentation d'Implémentation

## ✅ Vue d'Ensemble

Le système de délibération permet au Préfet de valider les décisions finales pour chaque élève après calcul des moyennes. C'est l'écran le plus sensible du système car il génère les décisions officielles.

## 🎯 Fonctionnalités Implémentées

### Frontend

#### 1. Wizard en 4 Étapes (`DeliberationPage.tsx`)

**Étape 1 - Vérification**
- ✅ Vérification que toutes les notes sont saisies
- ✅ Vérification que toutes les notes sont verrouillées
- ✅ Vérification que les moyennes sont validées
- ⚠️ Alerte pour les élèves avec notes éliminatoires
- Blocage si conditions non remplies

**Étape 2 - Calcul**
- Affichage des moyennes calculées
- Tableau avec: Élève, Moyenne, Points, Matière Éliminatoire, Suggestion
- Suggestions automatiques basées sur les formules officielles

**Étape 3 - Décisions**
- Tableau éditable avec sélecteur de décision par élève
- Champ justification obligatoire si décision ≠ suggestion
- Coloration de fond selon la décision choisie
- Validation des justifications avant passage à l'étape 4

**Étape 4 - Récapitulatif & PV**
- Résumé complet de la délibération
- Statistiques: Admis, Ajournés, Refusés
- Taux de réussite
- Nombre de décisions modifiées
- Modal de confirmation finale

#### 2. Composants

**`DeliberationWizard.tsx`**
- Barre de progression avec 4 étapes
- Indicateurs visuels (complété, actif, en attente)
- Navigation entre les étapes

**`DecisionSelector.tsx`**
- Ligne de tableau éditable pour chaque élève
- Select avec les 6 décisions possibles
- Champ justification avec validation
- Coloration selon la décision

**`DeliberationSummary.tsx`**
- Récapitulatif visuel des résultats
- Statistiques par catégorie de décision
- Alerte pour décisions modifiées

#### 3. Constantes (`decisions.ts`)

```typescript
DELIB_DECISIONS = {
  ADMITTED: 'Admis(e)',
  DISTINCTION: 'Admis(e) avec Distinction',
  GREAT_DISTINCTION: 'Admis(e) Grande Distinction',
  ADJOURNED: 'Ajourné(e)',
  FAILED: 'Refusé(e)',
  MEDICAL: 'Reporté(e) - Maladie'
}
```

### Backend

#### 1. Service (`deliberation.service.ts`)

**`getDeliberationData()`**
- Récupère les données de la classe et du trimestre
- Calcule les moyennes pour tous les élèves
- Génère les suggestions automatiques
- Effectue les vérifications (notes saisies, verrouillées, moyennes validées)
- Compte les élèves avec notes éliminatoires

**`validateDeliberation()`**
- Crée ou met à jour la délibération
- Enregistre les résultats pour chaque élève
- Marque la délibération comme VALIDATED
- Prépare la génération du PV et des bulletins

**`getDeliberationResults()`**
- Récupère les résultats d'une délibération validée
- Inclut tous les détails (classe, trimestre, résultats par élève)

#### 2. Controller (`deliberation.controller.ts`)

- `GET /api/deliberation/:classId/:termId` - Récupère les données
- `POST /api/deliberation/:classId/:termId/validate` - Valide la délibération
- `GET /api/deliberation/results/:deliberationId` - Récupère les résultats

#### 3. Routes (`deliberation.routes.ts`)

- Permission `deliberation:read` pour lecture
- Permission `deliberation:create` pour validation (Préfet uniquement)

## 📊 Modèles Prisma Utilisés

### Deliberation
```prisma
model Deliberation {
  id          String      @id @default(uuid())
  classId     String
  termId      String
  status      String      // DRAFT, VALIDATED, PUBLISHED
  validatedAt DateTime?
  pvUrl       String?
  results     DelibResult[]
}
```

### DelibResult
```prisma
model DelibResult {
  id             String        @id @default(uuid())
  deliberationId String
  studentId      String
  generalAverage Float
  totalPoints    Float
  rank           Int
  decision       String        // DelibDecision
  justification  String?
}
```

## 🔄 Flux de Travail

1. **Préfet accède à la délibération**
   - URL: `/deliberation?classId=xxx&termId=yyy`
   - Vérification des permissions (PRÉFET uniquement)

2. **Étape 1: Vérification**
   - Système vérifie automatiquement les prérequis
   - Blocage si conditions non remplies
   - Affichage des alertes pour notes éliminatoires

3. **Étape 2: Calcul**
   - Affichage des moyennes déjà calculées (SCR-014)
   - Suggestions automatiques basées sur les formules

4. **Étape 3: Décisions**
   - Préfet peut modifier les suggestions
   - Justification obligatoire si modification
   - Validation avant passage à l'étape 4

5. **Étape 4: Validation**
   - Récapitulatif complet
   - Modal de confirmation
   - Validation irréversible

6. **Post-Validation** (TODO)
   - Génération du PV en PDF
   - Génération batch des bulletins
   - Envoi SMS aux parents
   - Verrouillage définitif

## 🎨 Design & UX

### Couleurs par Décision

- **Grande Distinction**: Jaune/Or (`bg-yellow-100`)
- **Distinction**: Vert foncé (`bg-green-200`)
- **Admis**: Vert (`bg-green-100`)
- **Ajourné**: Orange (`bg-orange-100`)
- **Refusé**: Rouge (`bg-red-100`)
- **Reporté**: Bleu (`bg-blue-100`)

### Alertes & Validations

- ⚠️ Alerte orange pour décisions modifiées
- ❌ Erreur rouge si justification manquante
- ✅ Validation verte pour prérequis remplis

## 🔒 Sécurité & Permissions

1. **Accès Préfet uniquement**
   - Permission `deliberation:read` pour consultation
   - Permission `deliberation:create` pour validation

2. **Validation irréversible**
   - Modal de confirmation avec avertissement
   - Status VALIDATED empêche toute modification

3. **Justifications obligatoires**
   - Traçabilité des décisions modifiées
   - Validation côté client et serveur

## 📝 Règles Métier

1. **Suggestions Automatiques**
   ```
   - Moy ≥ 16/20 → Grande Distinction
   - Moy ≥ 14/20 → Distinction
   - Moy ≥ 10/20 + pas d'éliminatoire → Admis
   - 8/20 ≤ Moy < 10/20 → Ajourné
   - Moy < 8/20 OU éliminatoire → Refusé
   ```

2. **Notes Éliminatoires**
   - Échec automatique même si moyenne ≥ 10/20
   - Alerte visible dès l'étape 1

3. **Justifications**
   - Requises uniquement si décision ≠ suggestion
   - Minimum 1 caractère (validation côté client)

4. **Classement**
   - Basé sur le total de points
   - Ordre décroissant
   - Gestion des ex-aequo

## 🚀 Prochaines Étapes (TODO)

### 1. Génération PV PDF
- Template officiel RDC
- Signature électronique du Préfet
- Cachet de l'école
- Stockage dans `/uploads/pv/`

### 2. Génération Batch Bulletins
- Job asynchrone pour tous les élèves
- Utilisation du service existant (SCR-009)
- Notification de progression

### 3. Envoi SMS Parents
- Message personnalisé par décision
- Utilisation du service SMS existant
- Gestion des erreurs d'envoi

### 4. Interface PV
- Page de visualisation du PV
- Téléchargement PDF
- Impression

## 🧪 Tests à Effectuer

### Frontend
- [ ] Navigation wizard fonctionne
- [ ] Vérifications étape 1 correctes
- [ ] Suggestions automatiques affichées
- [ ] Modification décision + justification
- [ ] Validation bloquée si justification manquante
- [ ] Récapitulatif affiche bonnes statistiques
- [ ] Modal de confirmation s'affiche
- [ ] Redirection après validation

### Backend
- [ ] GET deliberation data retourne bonnes données
- [ ] Vérifications correctes (notes, verrouillage, moyennes)
- [ ] POST validation crée deliberation
- [ ] POST validation crée results
- [ ] Erreur si déjà validé
- [ ] Permissions Préfet vérifiées

### Intégration
- [ ] Flux complet de bout en bout
- [ ] Données persistées correctement
- [ ] Erreurs gérées proprement

## 📁 Fichiers Créés

### Frontend
- `packages/shared/src/constants/decisions.ts`
- `packages/client/src/pages/academic/DeliberationPage.tsx`
- `packages/client/src/components/academic/DeliberationWizard.tsx`
- `packages/client/src/components/academic/DecisionSelector.tsx`
- `packages/client/src/components/academic/DeliberationSummary.tsx`

### Backend
- `packages/server/src/modules/deliberation/deliberation.service.ts`
- `packages/server/src/modules/deliberation/deliberation.controller.ts`
- `packages/server/src/modules/deliberation/deliberation.routes.ts`

### Documentation
- `packages/docs/SCR-015_DELIBERATION_IMPLEMENTATION.md`

## ✅ Statut

- [x] Frontend: Wizard 4 étapes complet
- [x] Frontend: Composants de décision
- [x] Frontend: Validation et navigation
- [x] Backend: Service de délibération
- [x] Backend: Endpoints API
- [x] Backend: Routes et permissions
- [x] Intégration: Routes ajoutées à app.ts
- [x] Documentation complète
- [ ] Génération PV PDF (TODO)
- [ ] Génération batch bulletins (TODO)
- [ ] Envoi SMS parents (TODO)

Le système de délibération (SCR-015) est maintenant fonctionnel et prêt pour les tests. Les fonctionnalités de génération PV et bulletins seront implémentées dans les prochaines étapes.
