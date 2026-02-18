# 📦 Guide d'installation - EduGoma360

## Prérequis

### Logiciels requis

- **Node.js** : Version 20.x ou supérieure
- **npm** : Version 10.x ou supérieure
- **PostgreSQL** : Version 14.x ou supérieure
- **Redis** : Version 7.x ou supérieure (optionnel mais recommandé)
- **Git** : Pour cloner le repository

### Vérification des versions

```bash
node --version    # v20.x.x
npm --version     # 10.x.x
psql --version    # 14.x
redis-cli --version  # 7.x
```

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/edugoma360/edugoma360.git
cd edugoma360
```

### 2. Installer les dépendances

```bash
# Installer toutes les dépendances (root + packages)
npm install
```

Cette commande installe :
- Les dépendances du workspace root
- Les dépendances de `packages/client`
- Les dépendances de `packages/server`
- Les dépendances de `packages/shared`

### 3. Configuration de la base de données

#### Créer la base de données PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE edugoma360;

# Créer un utilisateur (optionnel)
CREATE USER edugoma_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE edugoma360 TO edugoma_user;

# Quitter
\q
```

#### Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL="postgresql://edugoma_user:your_password@localhost:5432/edugoma360"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Redis (optionnel)
REDIS_URL="redis://localhost:6379"

# Storage
STORAGE_TYPE="local"
STORAGE_PATH="./uploads"

# SMS (AfricasTalking)
SMS_PROVIDER="africastalking"
SMS_API_KEY="your-africastalking-api-key"
SMS_USERNAME="your-africastalking-username"

# Server
PORT=3000
NODE_ENV="development"

# Client
VITE_API_URL="http://localhost:3000/api"
```

### 4. Générer le client Prisma

```bash
cd packages/server
npm run db:generate
```

### 5. Exécuter les migrations

```bash
npm run db:migrate
```

Cette commande crée toutes les tables dans la base de données.

### 6. Seed la base de données (optionnel)

```bash
npm run db:seed
```

Cette commande crée :
- Un utilisateur admin par défaut
- Une école de démonstration
- Des classes et sections
- Des données de test

### 7. Installer les dépendances système pour Puppeteer

#### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install -y \
  chromium-browser \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libcups2 \
  libxss1 \
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgtk-3-0
```

#### macOS

```bash
# Puppeteer installe automatiquement Chromium
# Aucune action requise
```

#### Windows

```bash
# Puppeteer installe automatiquement Chromium
# Aucune action requise
```

## Démarrage

### Mode développement

```bash
# Démarrer tous les services (client + server)
npm run dev
```

Cette commande démarre :
- **Frontend** : http://localhost:5173
- **Backend** : http://localhost:3000
- **API** : http://localhost:3000/api

### Mode production

```bash
# Build
npm run build

# Démarrer
npm start
```

## Vérification de l'installation

### 1. Vérifier le backend

```bash
curl http://localhost:3000/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2026-02-18T12:00:00.000Z"
}
```

### 2. Vérifier le frontend

Ouvrir http://localhost:5173 dans le navigateur.

**Page attendue** : Page de connexion

### 3. Se connecter

Utiliser les identifiants par défaut (si seed exécuté) :

```
Email : admin@edugoma360.cd
Mot de passe : Admin123!
```

### 4. Tester les fonctionnalités

#### Liste des élèves
- Aller sur `/students`
- Vérifier que la liste s'affiche

#### Formulaire d'inscription
- Cliquer sur "Nouvelle inscription"
- Remplir le formulaire
- Vérifier la création

#### Import Excel
- Aller sur `/students/import`
- Télécharger le modèle
- Importer un fichier de test

#### Carte d'élève
- Aller sur le détail d'un élève
- Cliquer sur "Générer carte d'élève"
- Vérifier le téléchargement du PDF

## Dépannage

### Erreur : "Cannot connect to database"

**Cause** : PostgreSQL n'est pas démarré ou DATABASE_URL incorrect

**Solution** :
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Démarrer PostgreSQL
sudo systemctl start postgresql

# Vérifier DATABASE_URL dans .env
```

### Erreur : "Port 3000 already in use"

**Cause** : Un autre processus utilise le port 3000

**Solution** :
```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans .env
PORT=3001
```

### Erreur : "Puppeteer failed to launch"

**Cause** : Dépendances système manquantes

**Solution** :
```bash
# Installer les dépendances (voir section 7)
sudo apt-get install -y chromium-browser libx11-xcb1 ...
```

### Erreur : "Module not found"

**Cause** : Dépendances non installées

**Solution** :
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur : "Prisma Client not generated"

**Cause** : Client Prisma non généré

**Solution** :
```bash
cd packages/server
npm run db:generate
```

## Structure du projet

```
edugoma360/
├── packages/
│   ├── client/          # Frontend React
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   ├── server/          # Backend Express
│   │   ├── src/
│   │   ├── prisma/
│   │   └── package.json
│   └── shared/          # Types partagés
│       ├── src/
│       └── package.json
├── .env                 # Variables d'environnement
├── package.json         # Workspace root
└── README.md
```

## Scripts disponibles

### Root

```bash
npm run dev          # Démarrer en mode développement
npm run build        # Build tous les packages
npm start            # Démarrer en mode production
npm run lint         # Linter
npm test             # Tests
```

### Client

```bash
cd packages/client
npm run dev          # Démarrer le frontend
npm run build        # Build le frontend
npm run preview      # Preview du build
```

### Server

```bash
cd packages/server
npm run dev          # Démarrer le backend
npm run build        # Build le backend
npm start            # Démarrer en production
npm run db:migrate   # Exécuter les migrations
npm run db:seed      # Seed la base de données
npm run db:studio    # Ouvrir Prisma Studio
```

## Configuration avancée

### Redis (optionnel)

Redis est utilisé pour le cache des cartes d'élèves.

```bash
# Installer Redis
sudo apt-get install redis-server

# Démarrer Redis
sudo systemctl start redis

# Vérifier
redis-cli ping
# PONG
```

### SMS (AfricasTalking)

Pour envoyer des SMS, créer un compte sur https://africastalking.com

```env
SMS_PROVIDER="africastalking"
SMS_API_KEY="your-api-key"
SMS_USERNAME="your-username"
```

### Storage

#### Local (par défaut)

```env
STORAGE_TYPE="local"
STORAGE_PATH="./uploads"
```

#### S3 (production)

```env
STORAGE_TYPE="s3"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET="edugoma360-uploads"
```

## Mise à jour

### Mettre à jour les dépendances

```bash
# Vérifier les mises à jour
npm outdated

# Mettre à jour
npm update

# Ou mettre à jour une dépendance spécifique
npm install package-name@latest
```

### Mettre à jour la base de données

```bash
cd packages/server

# Créer une nouvelle migration
npm run db:migrate

# Ou appliquer les migrations existantes
npm run db:push
```

## Sauvegarde

### Base de données

```bash
# Backup
pg_dump -U edugoma_user edugoma360 > backup.sql

# Restore
psql -U edugoma_user edugoma360 < backup.sql
```

### Fichiers uploadés

```bash
# Backup
tar -czf uploads-backup.tar.gz ./uploads

# Restore
tar -xzf uploads-backup.tar.gz
```

## Support

### Documentation
- **Guide utilisateur** : `STUDENT_FORM_GUIDE.md`
- **Guide import** : `IMPORT_FEATURE_SUMMARY.md`
- **Guide carte** : `STUDENT_CARD_GUIDE.md`
- **Module complet** : `MODULE_STUDENTS_COMPLETE.md`

### Contact
- Email : support@edugoma360.cd
- GitHub : https://github.com/edugoma360/edugoma360
- Documentation : https://docs.edugoma360.cd

---

**Bonne installation ! 🚀**

**Dernière mise à jour** : 18 Février 2026
