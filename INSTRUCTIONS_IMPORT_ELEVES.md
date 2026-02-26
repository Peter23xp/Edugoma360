# Instructions pour l'import des élèves

## Problème identifié

Votre fichier Excel a les colonnes dans le mauvais ordre. Les données sont décalées.

## Solution

### Option 1 : Utiliser le modèle de l'application (RECOMMANDÉ)

1. Dans l'application, allez sur la page "Importer des élèves"
2. Cliquez sur le bouton **"Télécharger le modèle"**
3. Ouvrez le fichier téléchargé `Modele_Import_Eleves_EduGoma360.xlsx`
4. Vous verrez un exemple à la ligne 2 - utilisez-le comme référence
5. Remplissez vos données en suivant EXACTEMENT l'ordre des colonnes
6. Sauvegardez et importez

### Option 2 : Corriger votre fichier actuel

Assurez-vous que les colonnes sont dans CET ORDRE EXACT :

| Colonne | Nom | Obligatoire | Exemple |
|---------|-----|-------------|---------|
| A | matricule | Non | (laissez vide, généré automatiquement) |
| B | nom * | OUI | AMISI |
| C | postNom * | OUI | KALOMBO |
| D | prenom | Non | Jean-Baptiste |
| E | sexe * | OUI | M ou F |
| F | dateNaissance * | OUI | 12/03/2008 (format JJ/MM/AAAA) |
| G | lieuNaissance * | OUI | Goma, Nord-Kivu |
| H | nationalite * | OUI | Congolaise |
| I | classe * | OUI | 4ScA (nom exact de la classe) |
| J | statut * | OUI | NOUVEAU, REDOUBLANT, TRANSFERE, DEPLACE, REFUGIE |
| K | ecoleOrigine | Non | Nom de l'école précédente |
| L | resultatTenasosp | Non | 67 (nombre entre 0 et 100) |
| M | nomPere | Non | AMISI PIERRE |
| N | telPere | Non | +243810000000 |
| O | nomMere | Non | KAHINDO ALICE |
| P | telMere | Non | +243820000000 |
| Q | nomTuteur | Non | MUKENDI JOSEPH |
| R | telTuteur | Non | +243990000000 |
| S | tuteurPrincipal | Non | pere, mere, ou tuteur |

## Erreurs dans votre fichier actuel

D'après les logs, voici ce qui ne va pas :

1. **Colonne H (nationalite)** contient "4ScA" → devrait contenir "Congolaise"
2. **Colonne I (classe)** contient "NOUVEAU" → devrait contenir "4ScA"
3. **Colonne J (statut)** contient "AMISI Pierre" → devrait contenir "NOUVEAU"
4. **Colonne K (ecoleOrigine)** contient "+243991234567" → devrait contenir le nom de l'école ou être vide

Les colonnes sont décalées vers la gauche. Il manque probablement des colonnes au début.

## Points importants

1. **Ne supprimez AUCUNE colonne** du modèle, même si vous ne les utilisez pas
2. **Laissez les colonnes vides** si vous n'avez pas les données (sauf les colonnes obligatoires *)
3. **Respectez les formats** :
   - Date : JJ/MM/AAAA (ex: 12/03/2008)
   - Téléphone : +243XXXXXXXXX
   - Sexe : M ou F (majuscule)
   - Statut : NOUVEAU, REDOUBLANT, TRANSFERE, DEPLACE, REFUGIE, ARCHIVE (majuscule)

4. **Le nom de la classe doit correspondre EXACTEMENT** à une classe existante dans votre système

## Test rapide

Téléchargez le modèle et essayez d'importer UNIQUEMENT la ligne d'exemple (ligne 2). Si ça fonctionne, vous saurez que le problème vient de votre fichier.
