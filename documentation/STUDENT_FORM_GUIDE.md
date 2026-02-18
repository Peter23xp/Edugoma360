# 📝 Guide du formulaire d'inscription élève

## Vue d'ensemble

Le formulaire d'inscription élève est un wizard multi-étapes permettant d'inscrire de nouveaux élèves ou de modifier les informations d'élèves existants.

## Accès

- **Création** : `/students/new`
- **Édition** : `/students/:id/edit`

## Structure du formulaire

### Étape 1 : Identité
- Photo de l'élève (optionnelle)
- Nom (obligatoire, en majuscules)
- Post-nom (obligatoire, en majuscules)
- Prénom (optionnel)
- Sexe (obligatoire : M/F)
- Date de naissance (obligatoire, min 5 ans)
- Lieu de naissance (obligatoire)
- Nationalité (obligatoire, par défaut "Congolaise")

### Étape 2 : Scolarité
- Section (obligatoire : Primaire, Secondaire, etc.)
- Classe (obligatoire, filtrée par section)
- Statut (obligatoire : Nouveau, Redoublant, Transféré, Déplacé, Réfugié)
- École d'origine (obligatoire si statut = Transféré)
- Résultat TENASOSP (optionnel, affiché si classe ≥ 3ème année)

### Étape 3 : Contacts
- Père : Nom + Téléphone
- Mère : Nom + Téléphone
- Tuteur : Nom + Téléphone
- **Au moins un numéro de téléphone requis**
- Sélection du tuteur principal (recevra les SMS)

### Étape 4 : Confirmation
- Récapitulatif complet de toutes les informations
- Photo + identité
- Informations académiques
- Contacts avec mise en évidence du tuteur principal

## Validation

### Règles de validation

#### Étape 1
- Nom et post-nom obligatoires
- Sexe obligatoire
- Date de naissance obligatoire (élève doit avoir au moins 5 ans)
- Lieu de naissance obligatoire
- Nationalité obligatoire

#### Étape 2
- Section obligatoire
- Classe obligatoire
- Statut obligatoire
- École d'origine obligatoire si statut = "Transféré"
- Résultat TENASOSP entre 0 et 100 si renseigné

#### Étape 3
- Au moins un numéro de téléphone requis
- Format téléphone : `+243XXXXXXXXX` (12 caractères)
- Tuteur principal doit être sélectionné si au moins un téléphone est fourni

### Messages d'erreur
- Affichés en rouge sous les champs concernés
- Toast d'erreur si tentative de navigation avec erreurs
- Blocage de la navigation tant que les erreurs ne sont pas corrigées

## Fonctionnalités

### Upload de photo
- Formats acceptés : JPG, PNG
- Taille max : 5 MB (à configurer côté backend)
- Preview immédiat après sélection
- Envoi via FormData (multipart/form-data)

### Gestion de brouillon
- Sauvegarde automatique dans localStorage (mode création uniquement)
- Restauration au rechargement de la page
- Expiration après 7 jours
- Suppression après soumission réussie

### Navigation
- Barre de progression visuelle
- Boutons Précédent/Suivant
- Bouton de soumission à la dernière étape
- Navigation fixe en bas de page
- Indicateur d'étape actuelle

### Mode édition
- Chargement automatique des données de l'élève
- Pré-remplissage de tous les champs
- Pas de sauvegarde de brouillon en mode édition
- Bouton "Enregistrer" au lieu de "Inscrire l'élève"

## Intégration API

### Endpoints utilisés

#### Création
```http
POST /students
Content-Type: multipart/form-data

{
  nom, postNom, prenom, sexe, dateNaissance, lieuNaissance, nationalite,
  sectionId, classId, statut, ecoleOrigine?, resultatTenasosp?,
  nomPere?, telPere?, nomMere?, telMere?, nomTuteur?, telTuteur?,
  tuteurPrincipal, photo (File)
}
```

#### Édition
```http
PUT /students/:id
Content-Type: multipart/form-data

{
  // Mêmes champs que création
}
```

#### Chargement élève (édition)
```http
GET /students/:id

Response: {
  student: {
    id, nom, postNom, prenom, sexe, dateNaissance, lieuNaissance,
    nationalite, photoUrl, statut, nomPere, telPere, nomMere, telMere,
    nomTuteur, telTuteur,
    currentEnrollment: {
      classId, class: { sectionId }, ecoleOrigine, resultatTenasosp
    }
  }
}
```

#### Sections
```http
GET /settings/sections

Response: {
  data: [{ id, name }]
}
```

#### Classes
```http
GET /settings/classes?sectionId=xxx

Response: {
  data: [{ id, name, sectionId }]
}
```

## Utilisation

### Depuis la liste des élèves

```typescript
// Bouton "Nouvelle inscription"
<button onClick={() => navigate('/students/new')}>
  <Plus size={16} />
  Nouvelle inscription
</button>

// Menu d'action sur un élève
<button onClick={() => navigate(`/students/${student.id}/edit`)}>
  <Edit size={16} />
  Modifier
</button>
```

### Programmatiquement

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Création
navigate('/students/new');

// Édition
navigate(`/students/${studentId}/edit`);
```

## Hooks utilisés

### useStudentForm
```typescript
const {
  formData,           // Données du formulaire
  updateFormData,     // Mettre à jour les données
  validationErrors,   // Erreurs de validation
  validateStep,       // Valider une étape
  resetForm,          // Réinitialiser le formulaire
} = useStudentForm();
```

### Exemple d'utilisation dans un composant
```typescript
import { useStudentForm } from '../../../hooks/useStudentForm';

export default function Step1Identity() {
  const { formData, updateFormData, validationErrors } = useStudentForm();

  const handleChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
  };

  return (
    <input
      value={formData.nom || ''}
      onChange={(e) => handleChange('nom', e.target.value)}
      className={validationErrors.nom ? 'border-red-500' : ''}
    />
  );
}
```

## Personnalisation

### Ajouter une étape

1. Créer le composant de l'étape dans `components/students/form/`
2. Ajouter l'étape dans `STEPS` de `StudentFormPage.tsx`
3. Ajouter la validation dans `useStudentForm.ts` > `validateStep()`

### Modifier les nationalités

Éditer `Step1Identity.tsx` > `NATIONALITES`

### Modifier les statuts

Éditer `Step2Academic.tsx` > `STATUTS`

## Dépannage

### La photo ne s'affiche pas
- Vérifier que le backend retourne `photoUrl` dans la réponse
- Vérifier que l'URL est accessible
- Vérifier la configuration CORS

### Les classes ne se chargent pas
- Vérifier que `sectionId` est bien défini
- Vérifier l'endpoint `/settings/classes?sectionId=xxx`
- Vérifier la console pour les erreurs API

### Le brouillon ne se charge pas
- Vérifier localStorage (F12 > Application > Local Storage)
- Vérifier que le brouillon a moins de 7 jours
- Vérifier que vous êtes en mode création (pas édition)

### Erreur de validation persistante
- Vérifier que tous les champs requis sont remplis
- Vérifier le format des numéros de téléphone
- Vérifier la console pour les erreurs

## Tests recommandés

### Test 1 : Création complète
1. Aller sur `/students/new`
2. Remplir l'étape 1 (identité)
3. Cliquer sur "Suivant"
4. Remplir l'étape 2 (scolarité)
5. Cliquer sur "Suivant"
6. Remplir l'étape 3 (contacts)
7. Sélectionner le tuteur principal
8. Cliquer sur "Suivant"
9. Vérifier le récapitulatif
10. Cliquer sur "Inscrire l'élève"
11. Vérifier la redirection vers `/students`
12. Vérifier que l'élève apparaît dans la liste

### Test 2 : Validation
1. Aller sur `/students/new`
2. Cliquer sur "Suivant" sans remplir
3. Vérifier les messages d'erreur
4. Remplir les champs requis
5. Vérifier que les erreurs disparaissent

### Test 3 : Brouillon
1. Aller sur `/students/new`
2. Remplir partiellement l'étape 1
3. Rafraîchir la page (F5)
4. Vérifier que les données sont restaurées

### Test 4 : Édition
1. Aller sur `/students/:id/edit`
2. Vérifier que les données sont pré-remplies
3. Modifier des champs
4. Soumettre
5. Vérifier que les modifications sont enregistrées

### Test 5 : Upload photo
1. Aller sur `/students/new`
2. Cliquer sur la zone de photo
3. Sélectionner une image
4. Vérifier le preview
5. Compléter le formulaire
6. Soumettre
7. Vérifier que la photo est enregistrée

## Performance

- Validation côté client pour feedback immédiat
- Sauvegarde de brouillon asynchrone (pas de blocage)
- Chargement des classes uniquement quand section sélectionnée
- Invalidation du cache React Query après soumission

## Sécurité

- Validation côté client ET serveur
- Sanitization des inputs (majuscules pour nom/post-nom)
- Validation du format des numéros de téléphone
- Upload de fichiers avec validation de type et taille

## Accessibilité

- Labels explicites pour tous les champs
- Messages d'erreur associés aux champs
- Navigation au clavier
- Indicateurs visuels clairs
- Contraste suffisant pour les erreurs

---

**Dernière mise à jour** : 18 Février 2026
