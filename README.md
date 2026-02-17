# 🎓 EduGoma 360

> Système de Gestion d'École Secondaire — Goma, Nord-Kivu, RDC

## 📋 Description

**EduGoma 360** est un système web fullstack de gestion complète d'école secondaire basé à Goma, Nord-Kivu, République Démocratique du Congo.

Le système gère :
- 📝 Inscriptions des élèves avec matricule MEPST automatique
- 📊 Notes & bulletins officiels conformes EPSP-RDC
- 💰 Finances en Francs Congolais (FC) avec support bi-devise FC/USD
- 📅 Présences (matin/après-midi) avec justifications
- 📱 Communication SMS aux parents (français & swahili)
- 📄 Rapports EPSP (palmarès, PV de délibération)

**Fonctionnalités clés :**
- 🔄 **Offline-first** — Fonctionne sans connexion Internet via IndexedDB
- 📱 **Optimisé mobile** — Interface responsive pour Android et réseaux 3G
- 🔐 **RBAC** — Contrôle d'accès par rôle (Super Admin, Préfet, Économe, Secrétaire, Enseignant, Parent)

## 🛠️ Stack Technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui |
| State | Zustand + TanStack Query |
| Offline | Dexie.js + Service Worker (Workbox) |
| Backend | Node.js 20 + Express + TypeScript |
| ORM | Prisma |
| BDD | PostgreSQL (prod) / SQLite (dev) |
| Auth | JWT + bcrypt + RBAC |
| SMS | Africa's Talking SDK |
| PDF | Puppeteer |
| Excel | ExcelJS |

## 🚀 Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Créer la base de données et appliquer les migrations
npm run db:migrate

# 4. Charger les données initiales
npm run db:seed

# 5. Lancer en développement
npm run dev

# Accès :
# Frontend  → http://localhost:5173
# API       → http://localhost:3000/api
# Admin     → admin@edugoma360.cd / Admin@2025
# Autres comptes : Voir dashboard après connexion
```

## 📁 Structure du Projet

```
edugoma360/
├── packages/
│   ├── shared/     # Types & utilitaires partagés
│   ├── server/     # Backend Express + Prisma
│   └── client/     # Frontend React + Vite
└── package.json    # Workspace root
```

## 📄 Licence

Propriété privée — Tous droits réservés © 2025 EduGoma 360

---

*EduGoma 360 — Système de Gestion d'École Secondaire — Goma, Nord-Kivu, RDC*
