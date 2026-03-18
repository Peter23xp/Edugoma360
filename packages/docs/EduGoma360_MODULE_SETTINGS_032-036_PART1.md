# ⚙️ EDUGOMA 360 — MODULE PARAMÈTRES COMPLET (PARTIE 1/2)
## Prompts SCR-032 à SCR-036 | Configuration École, Sections, Classes, Utilisateurs

> **MODE D'EMPLOI :**
> Ce fichier contient **5 prompts indépendants**, un par écran (partie 1/2).
> Exécute-les **dans l'ordre**, un à la fois dans ton IDE IA.
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> Attends la confirmation de l'IDE avant de passer au suivant.
> **⚠️ Ce module est CRITIQUE : il doit être configuré AVANT tous les autres.**

---

## CONTEXTE GLOBAL (rappel rapide pour chaque prompt)

```
Projet     : EduGoma 360 — Gestion école secondaire, Goma, RDC
Stack      : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
State      : Zustand (auth) + TanStack Query (serveur)
Offline    : Dexie.js + Service Worker
Backend    : Express + Prisma + PostgreSQL
Palette    : Vert #1B5E20 (primary) | Or #F57F17 (accent) | Bleu #0D47A1 (info)
Monorepo   : packages/client + packages/server + packages/shared

Module     : Paramètres & Configuration
Écrans     : SCR-032 à SCR-040 (9 écrans au total, ce fichier = 5 premiers)
Prérequis  : Aucun (c'est le PREMIER module à configurer)
Rôles      : SUPER_ADMIN, PRÉFET uniquement
Complexité : ⭐⭐⭐⭐⭐
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 5 — SCR-032 : INFORMATIONS ÉCOLE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/settings/SchoolInfoPage.tsx
Route : /settings/school-info
Accès : Protégé (authentification requise)
Rôle minimum requis : PRÉFET


OBJECTIF
--------
Créer l'écran de configuration des informations générales de l'école.
C'est le PREMIER écran à configurer lors du setup initial.
Formulaire exhaustif avec upload logo, validation stricte, prévisualisation.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/settings/SchoolInfoPage.tsx              ← CRÉER (page principale)
2. packages/client/src/components/settings/SchoolInfoForm.tsx         ← CRÉER (formulaire)
3. packages/client/src/components/settings/LogoUploadZone.tsx         ← CRÉER (upload logo)
4. packages/client/src/components/settings/ProvinceVilleSelector.tsx  ← CRÉER (sélecteur géo)
5. packages/client/src/hooks/useSchoolSettings.ts                     ← CRÉER (hook TanStack Query)
6. packages/server/src/modules/settings/school/school.routes.ts       ← CRÉER
7. packages/server/src/modules/settings/school/school.controller.ts   ← CRÉER
8. packages/server/src/modules/settings/school/school.service.ts      ← CRÉER
9. packages/server/src/lib/upload/imageOptimizer.ts                   ← CRÉER (optimisation logo)


UI — STRUCTURE VISUELLE
------------------------
La page est divisée en 5 sections accordéon collapsibles.

  ┌──────────────────────────────────────────────────────────────────┐
  │ INFORMATIONS DE L'ÉCOLE                                          │
  │                                                                  │
  │ [Enregistrer les modifications]  [Annuler]      [🔄 Réinitialiser]│
  ├──────────────────────────────────────────────────────────────────┤
  │                                                                  │
  │  ▼ IDENTITÉ DE L'ÉCOLE                                           │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │                                                            │ │
  │  │  Logo de l'école :                                         │ │
  │  │  ┌──────────────────┐      ┌──────────────────┐          │ │
  │  │  │                  │      │   [Aperçu logo   │          │ │
  │  │  │  📷 Glisser-     │      │    actuel]       │          │ │
  │  │  │  déposer ou      │      │                  │          │ │
  │  │  │  cliquer         │      │   200×200px      │          │ │
  │  │  │                  │      │                  │          │ │
  │  │  │  PNG, JPG, SVG   │      │   [Changer]      │          │ │
  │  │  │  Max 2MB         │      │   [Supprimer]    │          │ │
  │  │  └──────────────────┘      └──────────────────┘          │ │
  │  │                                                            │ │
  │  │  Nom officiel de l'école * :                               │ │
  │  │  [___________________________________________________]     │ │
  │  │  Ex: Institut Supérieur et Secondaire Tumaini              │ │
  │  │                                                            │ │
  │  │  Nom court * :                                             │ │
  │  │  [____________________]                                    │ │
  │  │  Ex: ISS Tumaini (affiché dans l'interface)                │ │
  │  │                                                            │ │
  │  │  Code établissement * :                                    │ │
  │  │  [__________]  ⓘ Utilisé dans tous les matricules          │ │
  │  │  Ex: ISS001 → matricules : NK-GOM-ISS001-0234              │ │
  │  │  ⚠️ Immuable après création                                │ │
  │  │                                                            │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ▼ LOCALISATION                                                  │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │  Province * :                                              │ │
  │  │  [Nord-Kivu                                          ▼]    │ │
  │  │                                                            │ │
  │  │  Ville * :                                                 │ │
  │  │  [Goma                                               ▼]    │ │
  │  │  (Chargement dynamique selon province sélectionnée)        │ │
  │  │                                                            │ │
  │  │  Commune/Quartier * :                                      │ │
  │  │  [Himbi                                                 ]  │ │
  │  │                                                            │ │
  │  │  Avenue * :                                                │ │
  │  │  [Avenue de la Paix                                     ]  │ │
  │  │                                                            │ │
  │  │  Numéro :                                                  │ │
  │  │  [N°12                                                  ]  │ │
  │  │                                                            │ │
  │  │  Point de référence (optionnel) :                          │ │
  │  │  [Face à l'église catholique Sainte Marie              ]  │ │
  │  │                                                            │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ▼ COORDONNÉES DE CONTACT                                        │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │  Téléphone principal * :                                   │ │
  │  │  [+243 ] [997] [123] [456]                                 │ │
  │  │  Format : +243 XX XXX XXXX                                 │ │
  │  │                                                            │ │
  │  │  Téléphone secondaire :                                    │ │
  │  │  [+243 ] [810] [987] [654]                                 │ │
  │  │                                                            │ │
  │  │  Email officiel * :                                        │ │
  │  │  [contact@isstumaini.cd                                 ]  │ │
  │  │  ⓘ Utilisé pour les communications officielles             │ │
  │  │                                                            │ │
  │  │  Site web :                                                │ │
  │  │  [https://www.isstumaini.cd                             ]  │ │
  │  │                                                            │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ▼ INFORMATIONS OFFICIELLES                                      │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │  Type d'école * :                                          │ │
  │  │  ( ) Publique/Officielle                                   │ │
  │  │  (•) Privée                                                │ │
  │  │  ( ) Conventionnée                                         │ │
  │  │                                                            │ │
  │  │  Numéro d'agrément * :                                     │ │
  │  │  [AGR/NK/2010/042                                       ]  │ │
  │  │  Format: AGR/{PROVINCE}/{ANNÉE}/{NUMÉRO}                   │ │
  │  │                                                            │ │
  │  │  Date d'agrément * :                                       │ │
  │  │  [15/09/2010                                            ]  │ │
  │  │                                                            │ │
  │  │  Devise de l'école (optionnel) :                           │ │
  │  │  [Savoir, Discipline, Excellence                        ]  │ │
  │  │                                                            │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ▼ PARAMÈTRES ACADÉMIQUES                                        │
  │  ┌────────────────────────────────────────────────────────────┐ │
  │  │  Langue d'enseignement principale * :                      │ │
  │  │  (•) Français  ( ) Anglais  ( ) Bilingue                   │ │
  │  │                                                            │ │
  │  │  Système d'évaluation * :                                  │ │
  │  │  (•) Notes sur 20                                          │ │
  │  │  ( ) Notes sur 10                                          │ │
  │  │  ( ) Mixte (selon matière)                                 │ │
  │  │                                                            │ │
  │  │  Nombre de trimestres * :                                  │ │
  │  │  (•) 3 trimestres  ( ) 2 semestres                         │ │
  │  │                                                            │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  [Annuler]                              [Enregistrer]           │
  └──────────────────────────────────────────────────────────────────┘


COMPOSANT LogoUploadZone.tsx
------------------------------
Zone upload drag & drop avec prévisualisation en temps réel.

Props :
  interface LogoUploadZoneProps {
    currentLogoUrl?: string
    onUpload: (file: File) => void
    onRemove: () => void
    isUploading: boolean
  }

États visuels :

État 1 — Aucun logo (zone vide) :
  ┌─────────────────────────────────────────┐
  │                                         │
  │         [📷 Icône upload 64×64]         │
  │                                         │
  │  Glissez-déposez votre logo ici        │
  │  ou cliquez pour parcourir              │
  │                                         │
  │  Formats acceptés : PNG, JPG, SVG       │
  │  Taille maximale : 2MB                  │
  │  Dimensions recommandées : 500×500px    │
  │                                         │
  └─────────────────────────────────────────┘
  
  Bordure : Dashed #CBD5E1
  Hover : Background #F8FAFC
  Drag over : Border #1B5E20 + background #E8F5E9

État 2 — Upload en cours :
  ┌─────────────────────────────────────────┐
  │                                         │
  │       [Spinner animé 48×48]             │
  │                                         │
  │  Upload en cours...                     │
  │  [Barre progression 60%]                │
  │                                         │
  └─────────────────────────────────────────┘

État 3 — Logo uploadé avec succès :
  ┌─────────────────────────────────────────┐
  │                                         │
  │     [Aperçu logo 200×200px]             │
  │                                         │
  │  logo_ecole.png (345 KB)                │
  │  Uploadé le 26/02/2026 à 14:32          │
  │                                         │
  │  [Changer le logo] [Supprimer]          │
  │                                         │
  └─────────────────────────────────────────┘

Validation upload :
  - Formats acceptés : image/png, image/jpeg, image/jpg, image/svg+xml
  - Taille max : 2MB (2 097 152 bytes)
  - Dimensions min : 100×100px
  - Dimensions max : 2000×2000px
  - Dimensions recommandées : 500×500px (ratio 1:1)

Traitement backend :
  1. Validation format/taille
  2. Resize automatique à 500×500px (si plus grand)
  3. Conversion en WebP pour optimisation
  4. Upload vers stockage (S3/Local/CDN)
  5. Génération 3 tailles :
     - Original : 500×500px (WebP)
     - Thumbnail : 200×200px (pour prévisualisation)
     - Icon : 64×64px (pour favicon/PWA)


COMPOSANT ProvinceVilleSelector.tsx
-------------------------------------
Sélecteur géographique en cascade : Province → Ville

Props :
  interface ProvinceVilleSelectorProps {
    provinceValue: string
    villeValue: string
    onProvinceChange: (province: string) => void
    onVilleChange: (ville: string) => void
  }

Données provinces RDC (26 provinces) :
  const PROVINCES_RDC = [
    { code: 'KIN', name: 'Kinshasa', villes: ['Kinshasa'] },
    { code: 'KC', name: 'Kongo Central', villes: ['Matadi', 'Boma', 'Mbanza-Ngungu'] },
    { code: 'KWG', name: 'Kwango', villes: ['Kenge', 'Kasongo-Lunda'] },
    { code: 'KWL', name: 'Kwilu', villes: ['Bandundu', 'Kikwit'] },
    { code: 'MN', name: 'Mai-Ndombe', villes: ['Inongo', 'Nioki'] },
    { code: 'KAS', name: 'Kasaï', villes: ['Tshikapa', 'Ilebo'] },
    { code: 'KC', name: 'Kasaï-Central', villes: ['Kananga', 'Luiza'] },
    { code: 'KO', name: 'Kasaï-Oriental', villes: ['Mbuji-Mayi', 'Kabinda'] },
    { code: 'LOM', name: 'Lomami', villes: ['Kabinda', 'Kamina'] },
    { code: 'SNK', name: 'Sankuru', villes: ['Lusambo', 'Lodja'] },
    { code: 'MAN', name: 'Maniema', villes: ['Kindu', 'Kasongo', 'Kabambare'] },
    { code: 'SK', name: 'Sud-Kivu', villes: ['Bukavu', 'Uvira', 'Kabare', 'Walungu'] },
    { 
      code: 'NK', 
      name: 'Nord-Kivu', 
      villes: ['Goma', 'Butembo', 'Beni', 'Rutshuru', 'Masisi', 'Walikale']
    },
    { code: 'ITU', name: 'Ituri', villes: ['Bunia', 'Mahagi', 'Aru'] },
    { code: 'HU', name: 'Haut-Uélé', villes: ['Isiro', 'Watsa', 'Dungu'] },
    { code: 'TSH', name: 'Tshopo', villes: ['Kisangani', 'Isangi', 'Ubundu'] },
    { code: 'BU', name: 'Bas-Uélé', villes: ['Buta', 'Aketi', 'Bambesa'] },
    { code: 'NU', name: 'Nord-Ubangi', villes: ['Gbadolite', 'Mobayi-Mbongo'] },
    { code: 'MON', name: 'Mongala', villes: ['Lisala', 'Bumba', 'Bongandanga'] },
    { code: 'SU', name: 'Sud-Ubangi', villes: ['Gemena', 'Libenge', 'Kungu'] },
    { code: 'EQ', name: 'Équateur', villes: ['Mbandaka', 'Bikoro', 'Lukolela'] },
    { code: 'TSU', name: 'Tshuapa', villes: ['Boende', 'Ikela', 'Monkoto'] },
    { code: 'TAN', name: 'Tanganyika', villes: ['Kalemie', 'Kongolo', 'Nyunzu'] },
    { code: 'HL', name: 'Haut-Lomami', villes: ['Kamina', 'Bukama', 'Kaniama'] },
    { code: 'LUA', name: 'Lualaba', villes: ['Kolwezi', 'Dilolo', 'Mutshatsha'] },
    { code: 'HK', name: 'Haut-Katanga', villes: ['Lubumbashi', 'Likasi', 'Kambove'] }
  ]

Comportement :
  1. Select Province affiche les 26 provinces
  2. Changement province → reset ville + charge villes de cette province
  3. Select Ville désactivé si aucune province sélectionnée
  4. Affichage : "Goma, Nord-Kivu" (ville en gras, province en gris)


VALIDATION ZOD COMPLÈTE
-------------------------
packages/client/src/schemas/schoolInfoSchema.ts :

import { z } from 'zod'

export const schoolInfoSchema = z.object({
  // IDENTITÉ
  nomOfficiel: z.string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(200, "Le nom ne peut pas dépasser 200 caractères"),
  
  nomCourt: z.string()
    .min(2, "Le nom court doit contenir au moins 2 caractères")
    .max(50, "Le nom court ne peut pas dépasser 50 caractères"),
  
  code: z.string()
    .min(3, "Le code doit contenir au moins 3 caractères")
    .max(10, "Le code ne peut pas dépasser 10 caractères")
    .regex(/^[A-Z0-9]+$/, "Le code ne peut contenir que des lettres majuscules et des chiffres")
    .regex(/^[A-Z]/, "Le code doit commencer par une lettre"),
  
  logoFile: z.instanceof(File)
    .refine((file) => file.size <= 2097152, "Le fichier ne doit pas dépasser 2MB")
    .refine(
      (file) => ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type),
      "Format invalide. Utilisez PNG, JPG ou SVG"
    )
    .optional(),
  
  // LOCALISATION
  province: z.string()
    .min(1, "Veuillez sélectionner une province"),
  
  ville: z.string()
    .min(1, "Veuillez sélectionner une ville"),
  
  commune: z.string()
    .min(2, "Le nom de la commune est requis"),
  
  avenue: z.string()
    .min(2, "Le nom de l'avenue est requis"),
  
  numero: z.string().optional(),
  
  reference: z.string().optional(),
  
  // CONTACT
  telephonePrincipal: z.string()
    .regex(
      /^\+243(81|82|97|98|89|90|91|99)\d{7}$/,
      "Format invalide. Utilisez +243 XX XXX XXXX (opérateurs congolais)"
    ),
  
  telephoneSecondaire: z.string()
    .regex(/^\+243(81|82|97|98|89|90|91|99)\d{7}$/)
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .email("Format d'email invalide")
    .toLowerCase(),
  
  siteWeb: z.string()
    .url("URL invalide. Format : https://exemple.com")
    .optional()
    .or(z.literal('')),
  
  // OFFICIEL
  type: z.enum(['OFFICIELLE', 'PRIVEE', 'CONVENTIONNEE'], {
    errorMap: () => ({ message: "Veuillez sélectionner un type d'école" })
  }),
  
  numeroAgrement: z.string()
    .min(5, "Le numéro d'agrément doit contenir au moins 5 caractères")
    .regex(
      /^AGR\/[A-Z]{2,3}\/\d{4}\/\d+$/,
      "Format invalide. Utilisez AGR/PROVINCE/ANNÉE/NUMÉRO (ex: AGR/NK/2010/042)"
    ),
  
  dateAgrement: z.date({
    required_error: "La date d'agrément est requise",
    invalid_type_error: "Date invalide"
  })
    .max(new Date(), "La date d'agrément ne peut pas être dans le futur"),
  
  devise: z.string()
    .max(200, "La devise ne peut pas dépasser 200 caractères")
    .optional(),
  
  // ACADÉMIQUE
  langueEnseignement: z.enum(['FRANCAIS', 'ANGLAIS', 'BILINGUE']),
  
  systemeEvaluation: z.enum(['NOTE_20', 'NOTE_10', 'MIXTE']),
  
  nombrePeriodes: z.enum(['TRIMESTRES', 'SEMESTRES'])
})

export type SchoolInfoFormData = z.infer<typeof schoolInfoSchema>


APPELS API
-----------
GET /api/settings/school
  Headers : Authorization: Bearer {token}
  
  Response 200 :
    {
      school: {
        id: string,
        nomOfficiel: string,
        nomCourt: string,
        code: string,
        logoUrl?: string,
        logoThumbnailUrl?: string,
        logoIconUrl?: string,
        province: string,
        ville: string,
        commune: string,
        avenue: string,
        numero?: string,
        reference?: string,
        telephonePrincipal: string,
        telephoneSecondaire?: string,
        email: string,
        siteWeb?: string,
        type: 'OFFICIELLE' | 'PRIVEE' | 'CONVENTIONNEE',
        numeroAgrement: string,
        dateAgrement: string (ISO),
        devise?: string,
        langueEnseignement: 'FRANCAIS' | 'ANGLAIS' | 'BILINGUE',
        systemeEvaluation: 'NOTE_20' | 'NOTE_10' | 'MIXTE',
        nombrePeriodes: 'TRIMESTRES' | 'SEMESTRES',
        createdAt: string,
        updatedAt: string
      }
    }
  
  Response 404 :
    {
      error: "SCHOOL_NOT_FOUND",
      message: "Aucune école configurée. Veuillez compléter la configuration initiale."
    }

PUT /api/settings/school
  Headers : 
    Authorization: Bearer {token}
    Content-Type: multipart/form-data
  
  Body (FormData) :
    - nomOfficiel: string
    - nomCourt: string
    - code: string
    - logoFile: File (optionnel si logo déjà existant)
    - province: string
    - ville: string
    - commune: string
    - avenue: string
    - numero: string
    - reference: string
    - telephonePrincipal: string
    - telephoneSecondaire: string
    - email: string
    - siteWeb: string
    - type: string
    - numeroAgrement: string
    - dateAgrement: string (ISO)
    - devise: string
    - langueEnseignement: string
    - systemeEvaluation: string
    - nombrePeriodes: string
  
  Response 200 :
    {
      school: School,
      message: "Informations de l'école mises à jour avec succès",
      logoUrls: {
        original: string,
        thumbnail: string,
        icon: string
      }
    }
  
  Response 400 (validation error) :
    {
      error: "VALIDATION_ERROR",
      message: "Données invalides",
      details: [
        { field: "email", message: "Format d'email invalide" },
        { field: "code", message: "Le code ne peut contenir que des majuscules" }
      ]
    }


TRAITEMENT BACKEND — UPLOAD LOGO
----------------------------------
packages/server/src/lib/upload/imageOptimizer.ts :

import sharp from 'sharp'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'

interface OptimizedImages {
  original: string     // 500×500px WebP
  thumbnail: string    // 200×200px WebP
  icon: string         // 64×64px WebP
}

export async function optimizeSchoolLogo(
  file: Express.Multer.File
): Promise<OptimizedImages> {
  const fileId = uuidv4()
  const uploadDir = path.join(process.cwd(), 'uploads', 'logos')
  
  // Créer dossier si inexistant
  await fs.mkdir(uploadDir, { recursive: true })
  
  // Charger l'image
  const image = sharp(file.buffer)
  const metadata = await image.metadata()
  
  // Validation dimensions minimales
  if (metadata.width < 100 || metadata.height < 100) {
    throw new Error('Dimensions minimales : 100×100px')
  }
  
  // 1. Original - 500×500px WebP
  const originalPath = path.join(uploadDir, `${fileId}-original.webp`)
  await image
    .resize(500, 500, { 
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 90 })
    .toFile(originalPath)
  
  // 2. Thumbnail - 200×200px WebP
  const thumbnailPath = path.join(uploadDir, `${fileId}-thumb.webp`)
  await image
    .resize(200, 200, { 
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 85 })
    .toFile(thumbnailPath)
  
  // 3. Icon - 64×64px WebP
  const iconPath = path.join(uploadDir, `${fileId}-icon.webp`)
  await image
    .resize(64, 64, { 
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 80 })
    .toFile(iconPath)
  
  // Retourner URLs publiques
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  
  return {
    original: `${baseUrl}/uploads/logos/${fileId}-original.webp`,
    thumbnail: `${baseUrl}/uploads/logos/${fileId}-thumb.webp`,
    icon: `${baseUrl}/uploads/logos/${fileId}-icon.webp`
  }
}


MODÈLE DE DONNÉES PRISMA
--------------------------
model School {
  id                   String   @id @default(uuid())
  
  // IDENTITÉ
  nomOfficiel          String
  nomCourt             String
  code                 String   @unique  // ISS001
  logoUrl              String?  // Original 500×500
  logoThumbnailUrl     String?  // 200×200
  logoIconUrl          String?  // 64×64
  
  // LOCALISATION
  province             String
  ville                String
  commune              String
  avenue               String
  numero               String?
  reference            String?
  
  // CONTACT
  telephonePrincipal   String
  telephoneSecondaire  String?
  email                String   @unique
  siteWeb              String?
  
  // OFFICIEL
  type                 SchoolType
  numeroAgrement       String
  dateAgrement         DateTime @db.Date
  devise               String?
  
  // ACADÉMIQUE
  langueEnseignement   LangueEnseignement
  systemeEvaluation    SystemeEvaluation
  nombrePeriodes       NombrePeriodes
  
  // RELATIONS
  users                User[]
  students             Student[]
  teachers             Teacher[]
  classes              Class[]
  sections             Section[]
  academicYears        AcademicYear[]
  fees                 Fee[]
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  @@index([code])
  @@index([email])
}

enum SchoolType {
  OFFICIELLE
  PRIVEE
  CONVENTIONNEE
}

enum LangueEnseignement {
  FRANCAIS
  ANGLAIS
  BILINGUE
}

enum SystemeEvaluation {
  NOTE_20
  NOTE_10
  MIXTE
}

enum NombrePeriodes {
  TRIMESTRES
  SEMESTRES
}


RÈGLES MÉTIER
--------------
1. Une seule école par installation EduGoma 360
   → Pas de multi-école (multi-tenancy)

2. Code établissement IMMUABLE après création
   → Utilisé dans tous les matricules élèves/enseignants
   → Format : NK-GOM-ISS001-0234
            (Province-Ville-CodeÉcole-Séquence)

3. Logo obligatoire pour :
   → Bulletins PDF
   → Reçus de paiement
   → Convocations
   → En-tête documents officiels

4. Email école utilisé pour :
   → Notifications officielles
   → Communications parents
   → Rapports automatiques

5. Si modification code école après utilisation :
   → Alerte : "Attention : modifier le code affectera tous les matricules existants"
   → Confirmation avec mot de passe Préfet requis


NOTIFICATIONS
--------------
1. Après enregistrement réussi :
   - Toast vert : "✓ Informations de l'école enregistrées avec succès"
   - Redirection auto vers /settings/academic-year (écran suivant)

2. Si logo uploadé :
   - Toast bleu : "Logo optimisé et enregistré (3 formats générés)"

3. Si erreur upload logo :
   - Toast rouge : "Erreur upload logo : {message}"
   - Formulaire reste éditable


RESPONSIVE
-----------
Desktop (≥1280px) :
  - Sections accordéon côte à côte si possibles
  - Logo upload + aperçu horizontaux

Tablette (768px-1279px) :
  - Sections accordéon empilées
  - Logo upload + aperçu empilés

Mobile (<768px) :
  - Formulaire full width
  - Inputs empilés
  - Logo upload adapté tactile


TESTS À ÉCRIRE
---------------
packages/client/src/pages/settings/__tests__/SchoolInfoPage.test.tsx :

describe('SchoolInfoPage', () => {
  it('charge les données école existantes', async () => {
    // Mock GET /api/settings/school
    // Vérifier pré-remplissage formulaire
  })
  
  it('valide le format téléphone congolais', () => {
    // Tester +243 XX XXX XXXX
    // Rejeter autres formats
  })
  
  it('valide le format code établissement', () => {
    // Accepter ISS001, INST42
    // Rejeter iss001, ISS_001
  })
  
  it('upload logo avec succès', async () => {
    // Simuler drag & drop PNG
    // Vérifier aperçu affiché
    // Vérifier POST avec FormData
  })
  
  it('bloque upload logo trop lourd', () => {
    // Fichier 3MB → erreur
  })
  
  it('enregistre modifications', async () => {
    // Remplir formulaire
    // Clic Enregistrer
    // Vérifier PUT /api/settings/school
    // Vérifier toast succès
  })
})


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Page charge données école (ou formulaire vide si nouveau)
[ ] Upload logo drag & drop fonctionne
[ ] Validation format logo (PNG/JPG/SVG, max 2MB)
[ ] Aperçu logo temps réel
[ ] Backend optimise logo (3 tailles WebP)
[ ] Sélecteur Province → filtre Villes
[ ] Validation téléphone +243 XX XXX XXXX
[ ] Validation email format correct
[ ] Validation code établissement (majuscules + chiffres)
[ ] Enregistrement appelle PUT /api/settings/school
[ ] Toast confirmation succès
[ ] Redirection auto vers /settings/academic-year
[ ] Logo affiché dans navbar
[ ] Logo affiché dans bulletins/reçus
[ ] Responsive mobile parfait
[ ] Tests unitaires passent (6 tests min)
```

---

*[SUITE DANS PARTIE 2/2 : SCR-033 à SCR-036]*
