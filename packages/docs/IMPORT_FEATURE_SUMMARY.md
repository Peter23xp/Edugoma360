# 📥 Import Excel d'élèves - Guide complet

## Vue d'ensemble

L'import Excel permet d'inscrire plusieurs élèves à la fois (50, 100, 200+) via un fichier Excel. Cette fonctionnalité est essentielle pour les écoles qui ont beaucoup d'élèves à inscrire en début d'année.

## Accès

**Route** : `/students/import`  
**Rôle minimum** : SECRETAIRE

## Flux utilisateur

### Étape 1 : Télécharger le modèle

1. Aller sur `/students/import`
2. Cliquer sur "Télécharger le modèle"
3. Un fichier `Modele_Import_Eleves_EduGoma360.xlsx` se télécharge
4. Le modèle contient :
   - En-têtes des colonnes
   - Exemples de données valides
   - Instructions d'utilisation
   - Liste des classes disponibles

### Étape 2 : Remplir le fichier

Ouvrir le fichier Excel et remplir une ligne par élève :

#### Colonnes obligatoires (*)
- **A: nom*** - Nom de famille (MAJUSCULES)
- **B: postNom*** - Nom du père (MAJUSCULES)
- **C: prenom** - Prénom(s) (optionnel)
- **D: sexe*** - M ou F
- **E: dateNaissance*** - Format JJ/MM/AAAA
- **F: lieuNaissance*** - Ville, Province
- **G: nationalite*** - Par défaut "Congolaise"
- **H: classe*** - Nom exact (ex: 4ScA, TC-1B)
- **I: statut*** - NOUVEAU, REDOUBLANT, TRANSFERE, DEPLACE, REFUGIE
- **J: ecoleOrigine** - Requis si statut = TRANSFERE
- **K: resultatTenasosp** - Note 0-100 (optionnel)
- **L: nomPere** - Nom complet du père
- **M: telPere** - Format +243XXXXXXXXX
- **N: nomMere** - Nom complet de la mère
- **O: telMere** - Format +243XXXXXXXXX
- **P: nomTuteur** - Nom complet du tuteur
- **Q: telTuteur*** - Format +243XXXXXXXXX (REQUIS)
- **R: tuteurPrincipal*** - pere, mere ou tuteur

#### Exemple de ligne valide
```
AMISI | KALOMBO | Jean-Baptiste | M | 12/03/2008 | Goma, Nord-Kivu | Congolaise | 4ScA | NOUVEAU | | 67 | AMISI PIERRE | +243810000000 | KAHINDO ALICE | +243820000000 | | +243830000000 | pere
```

### Étape 3 : Uploader le fichier

1. Retourner sur `/students/import`
2. Glisser-déposer le fichier dans la zone prévue
3. OU cliquer pour parcourir et sélectionner le fichier
4. Le fichier est analysé automatiquement

### Étape 4 : Prévisualisation

Après l'upload, un tableau de prévisualisation s'affiche :

#### Résumé
- **Lignes valides** (✅ vert) : Prêtes à importer
- **Avertissements** (⚠️ orange) : Import possible mais champs optionnels manquants
- **Erreurs** (❌ rouge) : Import impossible, corrections requises

#### Filtres
- Toutes les lignes
- Seulement les valides
- Seulement les avertissements
- Seulement les erreurs

#### Actions
- **Changer de fichier** : Recommencer avec un autre fichier
- **Lancer l'import** : Importer les lignes valides (désactivé si erreurs)

### Étape 5 : Import

1. Cliquer sur "Lancer l'import (X élèves)"
2. Un loader s'affiche pendant le traitement
3. Le serveur traite les données en masse

### Étape 6 : Rapport

Après l'import, un rapport détaillé s'affiche :

#### Statistiques
- Nombre d'élèves importés avec succès
- Nombre d'échecs
- Taux de réussite (%)
- Barre de progression visuelle

#### Erreurs (si présentes)
- Liste des lignes en erreur
- Message d'erreur pour chaque ligne
- Suggestion de correction

#### Actions
- **Importer un autre fichier** : Recommencer
- **Voir la liste des élèves** : Aller sur `/students`

## Validation des données

### Règles de validation

#### Champs obligatoires
- Nom (min 2 caractères)
- Post-nom (min 2 caractères)
- Sexe (M ou F uniquement)
- Date de naissance (âge entre 5 et 30 ans)
- Lieu de naissance
- Nationalité
- Classe (doit exister dans l'école)
- Statut
- Au moins un numéro de téléphone
- Tuteur principal

#### Validations conditionnelles
- **École d'origine** : Obligatoire si statut = TRANSFERE
- **Résultat TENASOSP** : Entre 0 et 100 si renseigné
- **Téléphone tuteur principal** : Doit être renseigné

#### Format des téléphones
- Doit commencer par +243
- Suivi de 9 chiffres
- Opérateurs valides : 81, 82, 89, 90-99
- Exemple : +243810123456

### Messages d'erreur courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| Nom manquant | Colonne A vide | Remplir le nom de famille |
| Sexe invalide | Valeur différente de M ou F | Utiliser M ou F uniquement |
| Date invalide | Format incorrect | Utiliser JJ/MM/AAAA |
| Âge invalide | Élève trop jeune/vieux | Vérifier la date de naissance |
| Classe inexistante | Nom de classe incorrect | Vérifier la liste des classes |
| Téléphone invalide | Format incorrect | Utiliser +243XXXXXXXXX |
| École d'origine manquante | Statut TRANSFERE sans école | Renseigner l'école d'origine |
| Tuteur principal sans téléphone | Téléphone manquant | Renseigner le téléphone |

## Intégration technique

### Frontend

#### Composants
```
StudentsImportPage.tsx       - Page principale
├── UploadZone.tsx          - Zone de drag & drop
├── PreviewTable.tsx        - Tableau de prévisualisation
└── ImportReport.tsx        - Rapport d'import
```

#### Bibliothèque
```
parseStudents.ts            - Parsing et validation Excel
```

#### Dépendances
- `xlsx` : Lecture des fichiers Excel
- `react-hot-toast` : Notifications
- `@tanstack/react-query` : Gestion des requêtes

### Backend (à implémenter)

#### Endpoints

##### GET /students/import-template
Génère et retourne le modèle Excel vide.

**Réponse** : Fichier .xlsx binaire

**Implémentation suggérée** :
```typescript
import ExcelJS from 'exceljs';

async function generateTemplate(schoolId: string) {
  const workbook = new ExcelJS.Workbook();
  
  // Feuille 1: Élèves
  const sheet = workbook.addWorksheet('Élèves');
  
  // En-têtes
  sheet.addRow([
    'nom*', 'postNom*', 'prenom', 'sexe*', 'dateNaissance*',
    'lieuNaissance*', 'nationalite*', 'classe*', 'statut*',
    'ecoleOrigine', 'resultatTenasosp', 'nomPere', 'telPere',
    'nomMere', 'telMere', 'nomTuteur', 'telTuteur*', 'tuteurPrincipal*'
  ]);
  
  // Style des en-têtes
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8F5E9' } // Vert clair
  };
  
  // Exemples
  sheet.addRow([
    'AMISI', 'KALOMBO', 'Jean-Baptiste', 'M', '12/03/2008',
    'Goma, Nord-Kivu', 'Congolaise', '4ScA', 'NOUVEAU',
    '', '67', 'AMISI PIERRE', '+243810000000',
    'KAHINDO ALICE', '+243820000000', '', '+243830000000', 'pere'
  ]);
  
  // Feuille 2: Instructions
  const instructionsSheet = workbook.addWorksheet('Instructions');
  // ... ajouter les instructions
  
  // Feuille 3: Classes disponibles
  const classesSheet = workbook.addWorksheet('Classes');
  const classes = await getSchoolClasses(schoolId);
  classes.forEach(c => classesSheet.addRow([c.name, c.section.name]));
  
  return workbook.xlsx.writeBuffer();
}
```

##### POST /students/import
Importe les élèves en masse.

**Corps** :
```json
{
  "students": [
    {
      "nom": "AMISI",
      "postNom": "KALOMBO",
      "prenom": "Jean-Baptiste",
      "sexe": "M",
      "dateNaissance": "2008-03-12",
      "lieuNaissance": "Goma, Nord-Kivu",
      "nationalite": "Congolaise",
      "className": "4ScA",
      "statut": "NOUVEAU",
      "resultatTenasosp": 67,
      "nomPere": "AMISI PIERRE",
      "telPere": "+243810000000",
      "nomMere": "KAHINDO ALICE",
      "telMere": "+243820000000",
      "telTuteur": "+243830000000",
      "tuteurPrincipal": "pere"
    }
  ]
}
```

**Réponse** :
```json
{
  "success": 42,
  "failed": 3,
  "errors": [
    {
      "row": 5,
      "message": "Classe inexistante: 9ScZ"
    },
    {
      "row": 12,
      "message": "Téléphone invalide"
    }
  ],
  "students": [
    { "id": "...", "matricule": "NK-GOM-ISS001-0234", ... }
  ]
}
```

**Implémentation suggérée** :
```typescript
async function importStudents(data: StudentImportData[], schoolId: string) {
  const results = {
    success: 0,
    failed: 0,
    errors: [],
    students: []
  };
  
  // Traiter en transaction
  await prisma.$transaction(async (tx) => {
    for (const [index, studentData] of data.entries()) {
      try {
        // 1. Trouver la classe par nom
        const classe = await tx.class.findFirst({
          where: {
            name: studentData.className,
            section: { schoolId }
          }
        });
        
        if (!classe) {
          throw new Error(`Classe inexistante: ${studentData.className}`);
        }
        
        // 2. Générer le matricule
        const matricule = await generateMatricule(schoolId);
        
        // 3. Créer l'élève
        const student = await tx.student.create({
          data: {
            schoolId,
            matricule,
            nom: studentData.nom,
            postNom: studentData.postNom,
            prenom: studentData.prenom,
            sexe: studentData.sexe,
            dateNaissance: new Date(studentData.dateNaissance),
            lieuNaissance: studentData.lieuNaissance,
            nationalite: studentData.nationalite,
            statut: studentData.statut,
            nomPere: studentData.nomPere,
            telPere: studentData.telPere,
            nomMere: studentData.nomMere,
            telMere: studentData.telMere,
            nomTuteur: studentData.nomTuteur,
            telTuteur: studentData.telTuteur,
            enrollments: {
              create: {
                classId: classe.id,
                academicYearId: getCurrentAcademicYearId(schoolId),
                ecoleOrigine: studentData.ecoleOrigine,
                resultatTenasosp: studentData.resultatTenasosp
              }
            }
          }
        });
        
        results.success++;
        results.students.push(student);
        
        // 4. Envoyer SMS de bienvenue (async, non bloquant)
        const phone = studentData[`tel${capitalize(studentData.tuteurPrincipal)}`];
        if (phone) {
          sendWelcomeSMS(phone, student.nom, student.postNom, matricule).catch(console.error);
        }
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: index + 2, // +2 car Excel commence à 1 et on skip l'en-tête
          message: error.message
        });
      }
    }
  });
  
  return results;
}
```

## Bonnes pratiques

### Pour les utilisateurs

1. **Toujours télécharger le modèle** : Ne pas créer son propre fichier
2. **Vérifier les noms de classe** : Utiliser exactement les noms fournis
3. **Format des téléphones** : Toujours +243XXXXXXXXX
4. **Sauvegarder régulièrement** : Ne pas perdre son travail
5. **Tester avec peu de lignes** : Importer 5-10 élèves d'abord

### Pour les développeurs

1. **Validation côté client ET serveur** : Double sécurité
2. **Transactions** : Tout ou rien pour éviter les données partielles
3. **Logs détaillés** : Tracer chaque import pour debug
4. **Limite de taille** : Max 500 élèves par import
5. **Timeout** : Prévoir un timeout adapté (30s-60s)

## Dépannage

### Le modèle ne se télécharge pas
- Vérifier que l'endpoint `/students/import-template` existe
- Vérifier les permissions CORS
- Vérifier la console navigateur pour les erreurs

### Le fichier n'est pas accepté
- Vérifier le format (.xlsx, .xls, .csv uniquement)
- Vérifier la taille (max 5 MB)
- Essayer de sauvegarder le fichier dans un autre format

### Erreurs de validation
- Vérifier que toutes les colonnes obligatoires sont remplies
- Vérifier le format des dates (JJ/MM/AAAA)
- Vérifier le format des téléphones (+243XXXXXXXXX)
- Vérifier que les noms de classe existent

### L'import échoue
- Vérifier la console navigateur
- Vérifier les logs serveur
- Vérifier que le backend est démarré
- Vérifier la connexion à la base de données

## Tests recommandés

### Test 1 : Import simple (5 élèves)
1. Télécharger le modèle
2. Remplir 5 lignes valides
3. Importer
4. Vérifier que les 5 élèves apparaissent dans la liste

### Test 2 : Import avec erreurs
1. Remplir 10 lignes dont 3 avec des erreurs
2. Importer
3. Vérifier que 7 élèves sont importés
4. Vérifier que les 3 erreurs sont listées

### Test 3 : Import massif (100+ élèves)
1. Remplir 100 lignes valides
2. Importer
3. Vérifier les performances
4. Vérifier que tous les élèves sont créés

### Test 4 : Validation des téléphones
1. Tester différents formats de téléphone
2. Vérifier que seul +243XXXXXXXXX est accepté
3. Vérifier les messages d'erreur

### Test 5 : Classes inexistantes
1. Utiliser des noms de classe invalides
2. Vérifier que l'erreur est détectée
3. Vérifier le message d'erreur

## Performance

### Optimisations

- **Parsing côté client** : Validation avant envoi au serveur
- **Batch processing** : Traiter par lots de 50 élèves
- **Transactions** : Utiliser des transactions pour la cohérence
- **Async SMS** : Envoyer les SMS en arrière-plan
- **Cache** : Mettre en cache les classes disponibles

### Limites recommandées

- **Taille de fichier** : 5 MB max
- **Nombre d'élèves** : 500 max par import
- **Timeout** : 60 secondes
- **Retry** : 3 tentatives en cas d'échec

---

**Dernière mise à jour** : 18 Février 2026
