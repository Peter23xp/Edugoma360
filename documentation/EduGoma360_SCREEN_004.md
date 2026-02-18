# 🖥️ EDUGOMA 360 — PROMPT SCR-004
## Configuration Initiale École | Wizard de Setup

> **MODE D'EMPLOI :**
> Ce prompt est à exécuter **APRÈS SCR-001** (auth) et **AVANT SCR-003** (dashboard).
> C'est l'écran qui s'affiche la toute première fois qu'un Super Admin se connecte.
> Il configure l'école de A à Z en 6 étapes.

---

## CONTEXTE GLOBAL

```
Projet     : EduGoma 360 — Gestion école secondaire, Goma, RDC
Stack      : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
State      : Zustand (auth) + TanStack Query (serveur)
Backend    : Express + Prisma + PostgreSQL
Palette    : Vert #1B5E20 (primary) | Or #F57F17 (accent) | Bleu #0D47A1 (info)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT — SCR-004 : CONFIGURATION INITIALE ÉCOLE (WIZARD)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/settings/SchoolSetupPage.tsx
Route : /setup
Accès : Authentifié — Rôle requis : SUPER_ADMIN uniquement
Prérequis : SCR-001 (auth) doit être terminé


OBJECTIF
--------
Crée le wizard de configuration initiale en 6 étapes (SCR-004).
Cet écran s'affiche automatiquement si school.isConfigured = false.
Une fois complété, l'école est prête à être utilisée et l'admin est redirigé vers /dashboard.
Le wizard doit guider pas à pas sans surcharger l'utilisateur.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/settings/SchoolSetupPage.tsx        ← CRÉER (wizard principal)
2. packages/client/src/components/setup/ProgressBar.tsx          ← CRÉER (barre 6 étapes)
3. packages/client/src/components/setup/Step1Identity.tsx        ← CRÉER (étape 1)
4. packages/client/src/components/setup/Step2Location.tsx        ← CRÉER (étape 2)
5. packages/client/src/components/setup/Step3Contact.tsx         ← CRÉER (étape 3)
6. packages/client/src/components/setup/Step4AcademicYear.tsx    ← CRÉER (étape 4)
7. packages/client/src/components/setup/Step5Classes.tsx         ← CRÉER (étape 5)
8. packages/client/src/components/setup/Step6Admin.tsx           ← CRÉER (étape 6)
9. packages/client/src/components/setup/SetupSummary.tsx         ← CRÉER (récap final)
10. packages/client/src/hooks/useSetupWizard.ts                  ← CRÉER (state wizard)
11. packages/server/src/modules/schools/schools.routes.ts        ← CRÉER/VÉRIFIER
12. packages/server/src/modules/schools/schools.controller.ts    ← CRÉER/VÉRIFIER
13. packages/server/src/modules/schools/schools.service.ts       ← CRÉER/VÉRIFIER
14. packages/shared/src/constants/provinces.ts                   ← CRÉER (26 provinces RDC)
15. packages/shared/src/constants/sections.ts                    ← VÉRIFIER (sections/options)


UI — STRUCTURE GÉNÉRALE DU WIZARD
-----------------------------------
Le wizard occupe tout l'écran avec un layout centré et épuré.
Aucune sidebar ni header complexe (juste un logo en haut à gauche).

  ┌───────────────────────────────────────────────────────────┐
  │  [LOGO]    Configuration de votre école     Étape 1/6      │
  ├───────────────────────────────────────────────────────────┤
  │                                                           │
  │  [━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]       │
  │   Identité   Localisation   Contact   Année   Classes   Admin │
  │                                                           │
  │  ┌─────────────────────────────────────────────────────┐  │
  │  │                                                     │  │
  │  │         CONTENU DE L'ÉTAPE ACTIVE                   │  │
  │  │         (composant Step1 à Step6)                   │  │
  │  │                                                     │  │
  │  │                                                     │  │
  │  │                                                     │  │
  │  └─────────────────────────────────────────────────────┘  │
  │                                                           │
  │  [← Précédent]                        [Suivant →]         │
  │                                                           │
  └───────────────────────────────────────────────────────────┘

NOTES :
- Étape 1 : bouton "Précédent" MASQUÉ (première étape)
- Dernière étape : bouton "Suivant" devient "Terminer la configuration"
- Bouton "Suivant" désactivé si la validation échoue pour l'étape courante
- La barre de progression affiche visuellement l'avancement (1/6 → 6/6)


COMPOSANT ProgressBar.tsx
---------------------------
Props :
  interface ProgressBarProps {
    currentStep: number  // 1 à 6
    steps: { id: number; label: string }[]
  }

Affichage :
  - Ligne horizontale continue avec 6 points numérotés
  - Points passés : vert rempli + ✓
  - Point actif   : vert avec border épais + numéro
  - Points futurs : gris clair + numéro
  - Labels sous chaque point (petit texte)

Style :
  - Ligne : h-1 bg-neutral-200, portion complétée en bg-[#1B5E20]
  - Points : w-10 h-10 rounded-full avec numéro centré
  - Animation smooth entre étapes (transition-all duration-300)


HOOK useSetupWizard.ts
-----------------------
Gère l'état global du wizard avec Zustand ou un simple useState :

  interface SetupWizardState {
    currentStep: number
    formData: Partial<SchoolSetupData>
    validationErrors: Record<string, string[]>
    
    nextStep: () => void
    prevStep: () => void
    goToStep: (step: number) => void
    updateFormData: (step: string, data: any) => void
    validateStep: (step: number) => boolean
    submitSetup: () => Promise<void>
  }

Chaque étape met à jour formData avec ses propres données.
La validation se fait étape par étape (Zod schema).


═══════════════════════════════════════════════════════════════
ÉTAPE 1 / 6 — IDENTITÉ DE L'ÉCOLE (Step1Identity.tsx)
═══════════════════════════════════════════════════════════════

CHAMPS DU FORMULAIRE
---------------------
1. Nom officiel de l'école *
   Input text, max 100 chars
   Exemple : "Institut Technique de Goma"
   Placeholder : "Nom complet de l'établissement"

2. Type d'établissement * (Select)
   Options :
     - École Officielle (gérée par l'État)
     - École Conventionnée (gérée par une confession religieuse)
     - École Privée Agréée
   Valeur : OFFICIELLE | CONVENTIONNEE | PRIVEE

3. Convention religieuse (Select — visible seulement si type = CONVENTIONNEE)
   Options :
     - Catholique
     - Protestante
     - Kimbanguiste
     - Islamique
     - Armée du Salut
   Optionnel si type = OFFICIELLE ou PRIVEE

4. Numéro d'agrément MEPST (Input text)
   Format : NK/EPSP/XXX/2024 (exemple)
   Optionnel mais recommandé
   Placeholder : "Ex: NK/EPSP/ISS001/2024"

5. Logo de l'école (File upload)
   Formats acceptés : PNG, JPG, SVG
   Taille max : 2MB
   Dimensions recommandées : 512×512px
   Preview immédiat après sélection
   Bouton "Parcourir" + zone drag & drop

VALIDATION (Zod schema)
------------------------
const step1Schema = z.object({
  name: z.string().min(5, "Minimum 5 caractères").max(100),
  type: z.enum(['OFFICIELLE', 'CONVENTIONNEE', 'PRIVEE']),
  convention: z.string().optional(),
  agrement: z.string().optional(),
  logoFile: z.instanceof(File).optional()
})

Règle supplémentaire :
  Si type = CONVENTIONNEE → convention devient requis


═══════════════════════════════════════════════════════════════
ÉTAPE 2 / 6 — LOCALISATION (Step2Location.tsx)
═══════════════════════════════════════════════════════════════

CHAMPS DU FORMULAIRE
---------------------
1. Province * (Select avec recherche — Combobox shadcn/ui)
   26 provinces de la RDC (voir packages/shared/src/constants/provinces.ts)
   Valeur par défaut : "Nord-Kivu"
   Options complètes :
     Bas-Uele, Équateur, Haut-Katanga, Haut-Lomami, Haut-Uele, Ituri,
     Kasaï, Kasaï-Central, Kasaï-Oriental, Kinshasa, Kongo-Central,
     Kwango, Kwilu, Lomami, Lualaba, Mai-Ndombe, Maniema, Mongala,
     Nord-Kivu, Nord-Ubangi, Sankuru, Sud-Kivu, Sud-Ubangi,
     Tanganyika, Tshopo, Tshuapa

2. Territoire / Ville * (Input text OU Select dynamique selon province)
   Si Province = Nord-Kivu → options : Goma, Beni, Butembo, Rutshuru...
   Sinon → input text libre
   Valeur par défaut si Nord-Kivu : "Goma"

3. Commune / Quartier (Input text)
   Optionnel
   Exemple : "Goma — Quartier Himbi"

4. Adresse physique * (Textarea)
   Exemple : "Avenue de la Paix, N°12, près de la Ronde-Point Virunga"
   Min 10 chars, max 200 chars

5. Coordonnées GPS (optionnel — 2 inputs)
   Latitude  : Input number (ex: -1.6740)
   Longitude : Input number (ex: 29.2228)
   Bouton "📍 Utiliser ma position actuelle" (Geolocation API)

VALIDATION
----------
const step2Schema = z.object({
  province: z.string().min(1, "Sélectionnez une province"),
  ville: z.string().min(2, "Minimum 2 caractères"),
  commune: z.string().optional(),
  adresse: z.string().min(10, "Minimum 10 caractères").max(200),
  latitude: z.number().optional(),
  longitude: z.number().optional()
})


═══════════════════════════════════════════════════════════════
ÉTAPE 3 / 6 — CONTACTS (Step3Contact.tsx)
═══════════════════════════════════════════════════════════════

CHAMPS DU FORMULAIRE
---------------------
1. Téléphone principal * (Input tel)
   Format : +243XXXXXXXXX (regex RDC)
   Validation : /^\+243(81|82|97|98|89)\d{7}$/
   Exemple : +243 810 000 000

2. Email de l'école (Input email)
   Optionnel mais recommandé
   Exemple : contact@institutgoma.cd

3. Site web (Input url)
   Optionnel
   Exemple : https://www.institutgoma.cd

4. Réseaux sociaux (optionnel — 3 inputs)
   Facebook  : URL complète ou @ (ex: @InstitutGoma)
   WhatsApp  : Numéro (même format que téléphone)
   Twitter/X : @ (ex: @InstitutGoma)

VALIDATION
----------
const step3Schema = z.object({
  telephone: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/, "Numéro congolais invalide"),
  email: z.string().email("Email invalide").optional().or(z.literal('')),
  website: z.string().url("URL invalide").optional().or(z.literal('')),
  facebook: z.string().optional(),
  whatsapp: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/).optional().or(z.literal('')),
  twitter: z.string().optional()
})


═══════════════════════════════════════════════════════════════
ÉTAPE 4 / 6 — ANNÉE SCOLAIRE (Step4AcademicYear.tsx)
═══════════════════════════════════════════════════════════════

CHAMPS DU FORMULAIRE
---------------------
1. Libellé de l'année * (Input text — pré-rempli)
   Valeur par défaut : "2024-2025" (calculé depuis new Date())
   Format : YYYY-YYYY+1

2. Date de début * (Date picker)
   Valeur par défaut : 1er septembre de l'année en cours
   
3. Date de fin * (Date picker)
   Valeur par défaut : 1er juillet de l'année suivante

4. Configuration des trimestres (3 blocs — inline form)
   
   TRIMESTRE 1 :
     Début       : [01/09/2024] (date picker)
     Fin         : [14/12/2024]
     Examens du  : [05/12/2024] au [13/12/2024]

   TRIMESTRE 2 :
     Début       : [06/01/2025]
     Fin         : [28/03/2025]
     Examens du  : [17/03/2025] au [27/03/2025]

   TRIMESTRE 3 :
     Début       : [07/04/2025]
     Fin         : [27/06/2025]
     Examens du  : [09/06/2025] au [20/06/2025]

5. Jours fériés RDC (Checkbox list — pré-cochés par défaut)
   Liste complète des fêtes nationales :
     ☑ 1er janvier    - Nouvel An
     ☑ 4 janvier      - Journée des Martyrs de l'Indépendance
     ☑ 16 janvier     - Assassinat de Lumumba
     ☑ 17 janvier     - Assassinat de Laurent-Désiré Kabila
     ☑ 1er mai        - Fête du Travail
     ☑ 17 mai         - Journée de la Libération
     ☑ 30 juin        - Fête de l'Indépendance
     ☑ 1er août       - Fête des Parents
     ☑ 25 décembre    - Noël
   
   + Bouton "Ajouter une fermeture exceptionnelle" (ex: épidémie, instabilité)

VALIDATION
----------
const step4Schema = z.object({
  label: z.string().regex(/^\d{4}-\d{4}$/, "Format YYYY-YYYY"),
  startDate: z.date(),
  endDate: z.date(),
  terms: z.array(z.object({
    number: z.number().int().min(1).max(3),
    startDate: z.date(),
    endDate: z.date(),
    examStartDate: z.date(),
    examEndDate: z.date()
  })).length(3, "3 trimestres requis"),
  holidays: z.array(z.object({
    date: z.date(),
    label: z.string()
  }))
}).refine(data => data.endDate > data.startDate, {
  message: "La date de fin doit être après la date de début"
})


═══════════════════════════════════════════════════════════════
ÉTAPE 5 / 6 — SECTIONS & CLASSES (Step5Classes.tsx)
═══════════════════════════════════════════════════════════════

INTERFACE
---------
Afficher en 2 colonnes :
  
  COLONNE GAUCHE : Sélection des sections ouvertes
    Checkbox list des 6 sections du système éducatif RDC :
      ☑ Tronc Commun (1ère et 2ème année)
      ☐ Scientifique (3ème à 6ème année)
      ☐ Commerciale & Gestion (3ème à 6ème année)
      ☐ Pédagogique (3ème à 6ème année)
      ☐ Technique (3ème à 6ème année — options : Électricité, Mécanique, Informatique)
      ☐ Littéraire (3ème à 6ème année)

  COLONNE DROITE : Création des classes (dynamique selon sections cochées)
    
    Exemple si "Tronc Commun" et "Scientifique" cochés :

    TRONC COMMUN :
      1ère année : [Nombre de classes : 2 ▼]  → génère TC-1A, TC-1B
      2ème année : [Nombre de classes : 2 ▼]  → génère TC-2A, TC-2B

    SCIENTIFIQUE :
      3ème année : [Nombre de classes : 1 ▼]  → génère 3ScA
      4ème année : [Nombre de classes : 2 ▼]  → génère 4ScA, 4ScB
      5ème année : [Nombre de classes : 1 ▼]  → génère 5ScA
      6ème année : [Nombre de classes : 1 ▼]  → génère 6ScA

Options pour le nombre de classes : 0 à 5 (Select)
Nomenclature automatique : {Année}{CodeSection}{Lettre}
  Codes : TC (Tronc Commun), Sc (Scientifique), HCG (Commerciale),
          Péda (Pédagogique), HT (Technique), Lit (Littéraire)

VALIDATION
----------
Au moins 1 section doit être cochée.
Au moins 1 classe doit être créée au total.

Exemple de structure de données générée :
  classes: [
    { sectionCode: 'TC', year: 1, name: 'TC-1A', maxStudents: 45 },
    { sectionCode: 'TC', year: 1, name: 'TC-1B', maxStudents: 45 },
    { sectionCode: 'SC', year: 4, name: '4ScA', maxStudents: 45 },
    { sectionCode: 'SC', year: 4, name: '4ScB', maxStudents: 45 }
  ]


═══════════════════════════════════════════════════════════════
ÉTAPE 6 / 6 — COMPTE ADMINISTRATEUR (Step6Admin.tsx)
═══════════════════════════════════════════════════════════════

CHAMPS DU FORMULAIRE
---------------------
Cette étape crée le compte du Préfet (directeur académique).

1. Nom * (Input text)
   Exemple : MUKASA

2. Post-nom * (Input text)
   Exemple : KABILA

3. Prénom (Input text — optionnel)
   Exemple : Joseph

4. Numéro de téléphone * (Input tel)
   Format : +243XXXXXXXXX
   Ce numéro servira pour l'authentification

5. Email (Input email — optionnel)
   Exemple : prefet@institutgoma.cd

6. Mot de passe initial * (Input password)
   Min 8 caractères, au moins 1 majuscule, 1 chiffre
   Indicateur de force (Faible / Moyen / Fort) en temps réel

7. Confirmer le mot de passe * (Input password)
   Doit être identique

IMPORTANT :
  Afficher un message d'information :
  "ℹ️ Ce compte aura le rôle de Préfet (directeur académique).
   Vous pourrez créer d'autres comptes utilisateurs depuis les Paramètres."

VALIDATION
----------
const step6Schema = z.object({
  nom: z.string().min(2, "Minimum 2 caractères"),
  postNom: z.string().min(2, "Minimum 2 caractères"),
  prenom: z.string().optional(),
  phone: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/\d/, "Au moins un chiffre"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ['confirmPassword']
})


═══════════════════════════════════════════════════════════════
ÉCRAN FINAL — RÉCAPITULATIF ET CONFIRMATION (SetupSummary.tsx)
═══════════════════════════════════════════════════════════════

Avant de soumettre, afficher une page de récapitulatif avec toutes les infos :

  ┌─────────────────────────────────────────────────────────┐
  │  ✓ Configuration terminée — Récapitulatif               │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │  IDENTITÉ                                               │
  │  [Logo]  Institut Technique de Goma                     │
  │          École Officielle                               │
  │          Agrément : NK/EPSP/ISS001/2024                 │
  │                                                         │
  │  LOCALISATION                                           │
  │  Nord-Kivu, Goma                                        │
  │  Avenue de la Paix, N°12                                │
  │                                                         │
  │  CONTACT                                                │
  │  +243 810 000 000                                       │
  │  contact@institutgoma.cd                                │
  │                                                         │
  │  ANNÉE SCOLAIRE                                         │
  │  2024-2025 (01/09/2024 → 01/07/2025)                    │
  │  3 trimestres configurés                                │
  │                                                         │
  │  CLASSES                                                │
  │  8 classes créées (TC-1A, TC-1B, 4ScA, 4ScB...)         │
  │  Sections : Tronc Commun, Scientifique                  │
  │                                                         │
  │  ADMINISTRATEUR                                         │
  │  MUKASA KABILA Joseph (Préfet)                          │
  │  +243 810 000 001                                       │
  │                                                         │
  │  [← Modifier]          [Terminer la configuration →]    │
  │                                                         │
  └─────────────────────────────────────────────────────────┘

Bouton "Modifier" → permet de revenir à une étape spécifique (goToStep).
Bouton "Terminer la configuration" → soumet toutes les données en une seule fois.


APPELS API
-----------
POST /api/schools/setup
  Corps : { 
    school: { ...step1, ...step2, ...step3 },
    academicYear: { ...step4 },
    classes: [...step5],
    admin: { ...step6 }
  }
  Réponse 201 : { 
    success: true, 
    schoolId: string,
    userId: string,
    message: "Configuration terminée avec succès"
  }
  
  Erreur 400 : { error: { code: string, message: string, field?: string } }

Cette requête doit ATOMIQUEMENT :
  1. Créer l'école (table schools)
  2. Créer l'année scolaire (table academic_years) avec les 3 termes (table terms)
  3. Créer toutes les sections (table sections)
  4. Créer toutes les classes (table classes)
  5. Créer le compte Préfet (table users avec role = PREFET)
  6. Marquer l'école comme configurée (isConfigured = true)

Si une seule étape échoue → rollback complet (transaction Prisma).


BACKEND — schools.service.ts
------------------------------
async function setupSchool(data: SetupSchoolDto, logoFile?: Express.Multer.File) {
  return await prisma.$transaction(async (tx) => {
    // 1. Upload logo si présent
    let logoUrl = null
    if (logoFile) {
      logoUrl = await uploadToStorage(logoFile, 'logos')
    }

    // 2. Créer l'école
    const school = await tx.school.create({
      data: {
        name: data.school.name,
        type: data.school.type,
        convention: data.school.convention,
        agrement: data.school.agrement,
        logoUrl,
        province: data.school.province,
        ville: data.school.ville,
        commune: data.school.commune,
        adresse: data.school.adresse,
        telephone: data.school.telephone,
        email: data.school.email,
        website: data.school.website,
        isConfigured: true
      }
    })

    // 3. Créer l'année scolaire
    const academicYear = await tx.academicYear.create({
      data: {
        schoolId: school.id,
        label: data.academicYear.label,
        startDate: data.academicYear.startDate,
        endDate: data.academicYear.endDate,
        isActive: true,
        terms: {
          create: data.academicYear.terms.map(t => ({
            number: t.number,
            label: `Trimestre ${t.number}`,
            startDate: t.startDate,
            endDate: t.endDate,
            examStartDate: t.examStartDate,
            examEndDate: t.examEndDate,
            isActive: t.number === 1
          }))
        }
      }
    })

    // 4. Créer les sections et classes
    for (const classData of data.classes) {
      const section = await tx.section.upsert({
        where: { schoolId_code_year: {
          schoolId: school.id,
          code: classData.sectionCode,
          year: classData.year
        }},
        create: {
          schoolId: school.id,
          code: classData.sectionCode,
          name: getSectionName(classData.sectionCode),
          year: classData.year
        },
        update: {}
      })

      await tx.class.create({
        data: {
          schoolId: school.id,
          sectionId: section.id,
          name: classData.name,
          maxStudents: classData.maxStudents
        }
      })
    }

    // 5. Créer le compte Préfet
    const passwordHash = await bcrypt.hash(data.admin.password, 12)
    const user = await tx.user.create({
      data: {
        schoolId: school.id,
        nom: data.admin.nom,
        postNom: data.admin.postNom,
        prenom: data.admin.prenom,
        phone: data.admin.phone,
        email: data.admin.email,
        passwordHash,
        role: 'PREFET',
        isActive: true
      }
    })

    return { school, user, academicYear }
  })
}


POST-CONFIGURATION — REDIRECTION
----------------------------------
Après succès de l'API :
  1. Afficher un toast vert : "✓ École configurée avec succès !"
  2. Mettre à jour le store auth avec les nouvelles données (school.isConfigured = true)
  3. Attendre 2 secondes (laisser le toast visible)
  4. Rediriger vers /dashboard

Dans AppLayout.tsx ou dans le router :
  Ajouter une vérification au montage :
    if (user?.role === 'SUPER_ADMIN' && !school?.isConfigured) {
      navigate('/setup')
    }


GESTION DES ERREURS
--------------------
Erreurs possibles et messages utilisateur :

400 SCHOOL_NAME_EXISTS
  → "Une école avec ce nom existe déjà"

400 PHONE_EXISTS
  → "Ce numéro de téléphone est déjà utilisé"

400 INVALID_DATE_RANGE
  → "Les dates sont invalides (vérifiez que fin > début)"

500 UPLOAD_FAILED
  → "Erreur lors de l'upload du logo. Réessayez."

500 TRANSACTION_FAILED
  → "Erreur lors de la configuration. Aucune donnée n'a été enregistrée. Contactez le support."


SAUVEGARDE LOCALE (DRAFT)
--------------------------
Implémenter un système de sauvegarde automatique en localStorage :
  - Toutes les 30 secondes, sauvegarder formData dans localStorage
  - Clé : `edugoma_setup_draft_${userId}`
  - Au chargement de la page, proposer de restaurer le brouillon si présent
  - Supprimer le brouillon après soumission réussie


ACCESSIBILITÉ ET UX
--------------------
- Tous les champs requis ont l'attribut aria-required="true"
- Les erreurs de validation sont annoncées via aria-live="polite"
- Navigation au clavier : Tab / Shift+Tab entre les champs
- Bouton "Suivant" : accessKey="n" (next)
- Bouton "Précédent" : accessKey="p" (previous)
- Indicateur de chargement : spinner + texte "Configuration en cours..."
- Empêcher la double soumission (disable le bouton après 1er clic)


TESTS À ÉCRIRE
---------------
1. Navigation entre les 6 étapes fonctionne ✓
2. Validation bloque le passage à l'étape suivante si erreur ✓
3. La barre de progression affiche visuellement l'étape courante ✓
4. Le récapitulatif affiche toutes les données saisies ✓
5. La soumission appelle l'API avec toutes les données ✓
6. Redirection vers /dashboard après succès ✓
7. Les erreurs API s'affichent correctement ✓
8. Le brouillon se sauvegarde et se restaure ✓


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Les 6 étapes du wizard s'affichent correctement
[ ] La validation Zod fonctionne pour chaque étape
[ ] La barre de progression se met à jour à chaque étape
[ ] Les boutons Précédent/Suivant gèrent la navigation
[ ] L'étape 1 masque le bouton Précédent
[ ] L'étape 6 affiche "Terminer" au lieu de "Suivant"
[ ] Le récapitulatif affiche toutes les données saisies
[ ] La soumission POST /api/schools/setup fonctionne
[ ] Le backend crée bien l'école + année + classes + admin en transaction
[ ] La redirection vers /dashboard fonctionne après succès
[ ] Le logo s'upload correctement (si fourni)
[ ] Les 26 provinces RDC sont listées correctement
[ ] La nomenclature des classes est correcte (TC-1A, 4ScB, etc.)
[ ] Le brouillon se sauvegarde en localStorage toutes les 30s
[ ] Le wizard est responsive (375px mobile et 1280px desktop)
```

---

## FICHIERS CONNEXES À CRÉER

### packages/shared/src/constants/provinces.ts
```typescript
export const RDC_PROVINCES = [
  'Bas-Uele', 'Équateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uele',
  'Ituri', 'Kasaï', 'Kasaï-Central', 'Kasaï-Oriental', 'Kinshasa',
  'Kongo-Central', 'Kwango', 'Kwilu', 'Lomami', 'Lualaba',
  'Mai-Ndombe', 'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi',
  'Sankuru', 'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa'
] as const

export const NORD_KIVU_CITIES = [
  'Goma', 'Beni', 'Butembo', 'Rutshuru', 'Masisi', 'Walikale', 'Lubero'
] as const
```

### packages/shared/src/constants/holidays.ts
```typescript
export const RDC_NATIONAL_HOLIDAYS = [
  { date: '01-01', label: 'Nouvel An' },
  { date: '01-04', label: 'Journée des Martyrs de l\'Indépendance' },
  { date: '01-16', label: 'Assassinat de Lumumba' },
  { date: '01-17', label: 'Assassinat de Laurent-Désiré Kabila' },
  { date: '05-01', label: 'Fête du Travail' },
  { date: '05-17', label: 'Journée de la Libération' },
  { date: '06-30', label: 'Fête de l\'Indépendance' },
  { date: '08-01', label: 'Fête des Parents' },
  { date: '12-25', label: 'Noël' }
] as const
```

---

## ORDRE D'EXÉCUTION

```
SCR-001 (Login) → SCR-004 (Setup) → SCR-003 (Dashboard)
     ↓                ↓                    ↓
   Auth           Config École        Écran principal
  Zustand        Wizard 6 steps       Stats & widgets
```

Le wizard SCR-004 doit être exécuté **AVANT** le dashboard SCR-003 car :
- Le dashboard a besoin que school.isConfigured = true
- Le dashboard charge des données (classes, élèves) qui n'existent pas avant le setup

---

*EduGoma 360 — SCR-004 Wizard Setup — Goma, RDC — © 2025*
