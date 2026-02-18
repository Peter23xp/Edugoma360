# 🚀 Quick Start - EduGoma360

## Démarrage rapide

### 1. Installer les dépendances (si pas déjà fait)
```bash
npm install
```

### 2. Démarrer l'application
```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

## 🧪 Tester le formulaire d'inscription élève

### Accès direct
- **Nouvelle inscription** : http://localhost:5173/students/new
- **Liste des élèves** : http://localhost:5173/students

### Parcours complet

1. **Aller sur la liste des élèves**
   ```
   http://localhost:5173/students
   ```

2. **Cliquer sur "Nouvelle inscription"** (bouton en haut à droite)

3. **Remplir l'étape 1 - Identité**
   - Nom : AMISI (obligatoire)
   - Post-nom : KALOMBO (obligatoire)
   - Prénom : Jean-Baptiste (optionnel)
   - Sexe : Masculin
   - Date de naissance : 01/01/2010
   - Lieu de naissance : Goma
   - Nationalité : Congolaise
   - Photo : (optionnel)

4. **Cliquer sur "Suivant"**

5. **Remplir l'étape 2 - Scolarité**
   - Section : Primaire
   - Classe : 5ème Primaire
   - Statut : Nouveau

6. **Cliquer sur "Suivant"**

7. **Remplir l'étape 3 - Contacts**
   - Téléphone père : +243991234567
   - Sélectionner "Tuteur principal" pour le père

8. **Cliquer sur "Suivant"**

9. **Vérifier le récapitulatif**

10. **Cliquer sur "Inscrire l'élève"**

## ✅ Vérifications

### Console navigateur (F12)
- Aucune erreur rouge
- Requêtes API réussies (200)

### Fonctionnalités à tester

#### ✓ Navigation
- [x] Bouton "Précédent" fonctionne
- [x] Bouton "Suivant" fonctionne
- [x] Barre de progression s'actualise
- [x] Retour à la liste fonctionne

#### ✓ Validation
- [x] Impossible de passer à l'étape suivante sans remplir les champs requis
- [x] Messages d'erreur s'affichent en rouge
- [x] Toast d'erreur apparaît si tentative de navigation avec erreurs

#### ✓ Upload photo
- [x] Cliquer sur la zone de photo ouvre le sélecteur
- [x] Preview s'affiche après sélection
- [x] Photo est envoyée avec le formulaire

#### ✓ Brouillon
- [x] Remplir partiellement le formulaire
- [x] Rafraîchir la page (F5)
- [x] Les données sont restaurées

#### ✓ Soumission
- [x] Toast de succès apparaît
- [x] Redirection vers `/students`
- [x] Nouvel élève apparaît dans la liste

## 🐛 Dépannage

### Erreur : "Cannot find module '@edugoma360/shared'"
```bash
cd packages/shared
npm run build
cd ../..
npm run dev
```

### Erreur : "Export not found"
```bash
# Vérifier que tous les exports sont présents
cat packages/shared/src/index.ts | grep "SCHOOL_SECTIONS"
```

### Page blanche
1. Ouvrir la console (F12)
2. Vérifier les erreurs
3. Vérifier que le serveur est démarré
4. Vérifier que le port 5173 est libre

### Les classes ne se chargent pas
1. Vérifier que le backend est démarré
2. Vérifier l'endpoint `/settings/classes`
3. Vérifier la console pour les erreurs API

## 📚 Documentation

- **Guide complet** : `STUDENT_FORM_GUIDE.md`
- **Corrections appliquées** : `FIXES_APPLIED.md`
- **Spécifications** : `EduGoma360_SCREENS_007-009.md`

## 🔧 Commandes utiles

```bash
# Démarrer l'application
npm run dev

# Build de production
npm run build

# Linter
npm run lint

# Tests (si configurés)
npm run test

# Nettoyer le cache Vite
rm -rf packages/client/node_modules/.vite
```

## 📞 Support

En cas de problème :
1. Vérifier la console navigateur (F12)
2. Vérifier le terminal serveur
3. Consulter `FIXES_APPLIED.md`
4. Consulter `STUDENT_FORM_GUIDE.md`

---

**Bon développement ! 🎉**
