# SCR-014 - Calcul des Moyennes - Endpoints Backend

## ✅ Endpoints Implémentés

### 1. GET /api/grades/averages
**Description**: Récupère les moyennes calculées pour une classe et un trimestre

**Paramètres Query**:
- `classId` (required): ID de la classe
- `termId` (required): ID du trimestre

**Réponse**:
```json
{
  "averages": [
    {
      "studentId": "uuid",
      "studentName": "NOM PostNom",
      "subjectAverages": [
        {
          "subjectId": "uuid",
          "subjectName": "Mathématiques",
          "average": 14.5,
          "hasFailed": false
        }
      ],
      "generalAverage": 13.2,
      "totalPoints": 312,
      "rank": 3,
      "hasEliminatoryFailure": false
    }
  ],
  "subjects": [
    {
      "id": "uuid",
      "name": "Mathématiques",
      "abbreviation": "Math"
    }
  ],
  "isValidated": false
}
```

**Permission**: `grades:read`

---

### 2. POST /api/grades/calculate-averages
**Description**: Recalcule les moyennes pour une classe et un trimestre

**Body**:
```json
{
  "classId": "uuid",
  "termId": "uuid"
}
```

**Réponse**: Même structure que GET /api/grades/averages

**Permission**: `grades:create`

**Notes**:
- Utilise les formules officielles EPSP-RDC
- Pondération: Interro 20%, TP 30%, Examen 50%
- Calcule les rangs automatiquement
- Détecte les notes éliminatoires

---

### 3. POST /api/grades/validate-averages
**Description**: Valide les moyennes et crée une délibération (action irréversible)

**Body**:
```json
{
  "classId": "uuid",
  "termId": "uuid"
}
```

**Réponse**:
```json
{
  "deliberationId": "uuid"
}
```

**Permission**: `grades:update`

**Effets**:
- Crée une entrée dans la table `deliberations` avec status `DRAFT`
- Verrouille toutes les notes de la classe pour ce trimestre (`isLocked = true`)
- Seul le Préfet peut déverrouiller après validation

**Erreurs**:
- `CLASS_NOT_FOUND`: Classe introuvable
- `AVERAGES_ALREADY_VALIDATED`: Moyennes déjà validées

---

## 📊 Formules de Calcul (gradeCalc.ts)

### Moyenne Matière
```
Moyenne = (Interro × 20% + TP × 30% + Examen × 50%) / Total Poids
```

### Moyenne Générale
```
Moyenne Générale = Σ(Moyenne_Matière × Coefficient) / Σ(Coefficients)
```

### Total Points
```
Total Points = Moyenne_Générale × Total_Coefficients
```

### Classement
- Ordre décroissant par total de points
- Gestion des ex-aequo (même rang, suivant décalé)

### Note Éliminatoire
```
hasFailed = isEliminatorySubject && score < elimThreshold
```

---

## 🗄️ Modèles Prisma Utilisés

### Grade
- `studentId`, `subjectId`, `termId`, `evalType`
- `score`, `maxScore`
- `isLocked` (verrouillé après validation)

### Deliberation
- `classId`, `termId`
- `status` (DRAFT, VALIDATED, PUBLISHED)
- `validatedAt`

### Enrollment
- Relation `student` pour récupérer les élèves d'une classe

### SubjectSection
- `coefficient` pour le calcul pondéré

---

## ✅ Statut d'Implémentation

- [x] Service: `packages/server/src/modules/grades/grades.service.ts`
  - [x] `calculateAverages()` - Calcul complet avec formules officielles
  - [x] `getAverages()` - Récupération avec statut de validation
  - [x] `validateAverages()` - Validation et verrouillage
  
- [x] Controller: `packages/server/src/modules/grades/grades.controller.ts`
  - [x] `getAverages()` - GET endpoint
  - [x] `calculateAverages()` - POST endpoint
  - [x] `validateAverages()` - POST endpoint
  
- [x] Routes: `packages/server/src/modules/grades/grades.routes.ts`
  - [x] GET `/averages`
  - [x] POST `/calculate-averages`
  - [x] POST `/validate-averages`
  
- [x] Utilities: `packages/shared/src/utils/gradeCalc.ts`
  - [x] `calculateStudentSubjectAverage()`
  - [x] `calculateGeneralAverage()`
  - [x] `calculateTotalPoints()`
  - [x] `calculateRanking()`
  - [x] `checkEliminatory()`
  - [x] `suggestDelibDecision()`

- [x] Frontend: `packages/client/src/pages/academic/AveragesPage.tsx`
- [x] Components:
  - [x] `AveragesTable.tsx`
  - [x] `FormulaExplanation.tsx`

---

## 🧪 Tests à Effectuer

1. **Calcul des moyennes**
   - [ ] Vérifier que les moyennes sont calculées correctement
   - [ ] Tester avec notes manquantes
   - [ ] Vérifier la pondération (20%, 30%, 50%)
   - [ ] Tester la normalisation des notes (/10 → /20)

2. **Classement**
   - [ ] Vérifier l'ordre décroissant
   - [ ] Tester les ex-aequo
   - [ ] Vérifier que le rang suivant est décalé

3. **Notes éliminatoires**
   - [ ] Vérifier la détection des échecs éliminatoires
   - [ ] Tester avec seuil personnalisé

4. **Validation**
   - [ ] Vérifier la création de la délibération
   - [ ] Vérifier le verrouillage des notes
   - [ ] Tester l'erreur si déjà validé

5. **Permissions**
   - [ ] Tester avec rôle SECRÉTAIRE (lecture/calcul)
   - [ ] Tester avec rôle PRÉFET (validation)

---

## 📝 Notes Importantes

1. **Prisma Schema**: Le modèle `Deliberation` n'a pas de champ `validatedById`. Le champ `validatedAt` est utilisé pour marquer la validation.

2. **Academic Year**: Le service utilise `classId` directement sans filtrer par année académique active. Tous les enrollments de la classe sont inclus.

3. **Offline Support**: Les endpoints de calcul sont synchrones. Pour l'offline, utiliser le système de queue existant pour les notes.

4. **Performance**: Pour les grandes classes (>100 élèves), considérer la mise en cache des résultats calculés.

5. **Sécurité**: La validation est irréversible sans autorisation Préfet. Implémenter un endpoint de déverrouillage séparé si nécessaire.
