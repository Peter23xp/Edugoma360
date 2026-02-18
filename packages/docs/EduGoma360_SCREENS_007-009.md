# 🖥️ EDUGOMA 360 — PROMPTS FINAUX MODULE ÉLÈVES
## Écrans SCR-007, SCR-008, SCR-009 | Inscription, Import, Carte

> **MODE D'EMPLOI :**
> Ces 3 prompts finalisent le module Élèves.
> Exécute-les **dans l'ordre** après avoir terminé SCR-005 et SCR-006.
> SCR-007 = formulaire inscription | SCR-008 = import Excel | SCR-009 = carte élève PDF

---

## CONTEXTE GLOBAL

```
Projet     : EduGoma 360 — Gestion école secondaire, Goma, RDC
Stack      : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
State      : Zustand (auth) + TanStack Query (serveur)
Offline    : Dexie.js + Service Worker
Backend    : Express + Prisma + PostgreSQL
Palette    : Vert #1B5E20 (primary) | Or #F57F17 (accent) | Bleu #0D47A1 (info)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 3 — SCR-007 : FORMULAIRE INSCRIPTION ÉLÈVE (WIZARD)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/students/StudentFormPage.tsx
Routes : /students/new (création) ET /students/:id/edit (modification)
Accès : Authentifié — Rôle minimum : SECRETAIRE
Prérequis : SCR-005 (liste élèves) et SCR-006 (détail) terminés


OBJECTIF
--------
Crée le formulaire complet d'inscription d'un élève (SCR-007).
Le formulaire est organisé en wizard (4 étapes) pour ne pas surcharger l'utilisateur.
Il doit fonctionner en mode création ET en mode édition (même composant, logique différente).
Le matricule est généré automatiquement côté serveur (JAMAIS saisi par l'utilisateur).


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/students/StudentFormPage.tsx           ← CRÉER
2. packages/client/src/components/students/form/Step1Identity.tsx   ← CRÉER
3. packages/client/src/components/students/form/Step2Academic.tsx   ← CRÉER
4. packages/client/src/components/students/form/Step3Contacts.tsx   ← CRÉER
5. packages/client/src/components/students/form/Step4Confirm.tsx    ← CRÉER
6. packages/client/src/components/students/form/PhotoUpload.tsx     ← CRÉER
7. packages/client/src/hooks/useStudentForm.ts                      ← CRÉER
8. packages/shared/src/utils/matricule.ts                           ← CRÉER
9. packages/server/src/modules/students/students.service.ts         ← MODIFIER


UI — STRUCTURE DU WIZARD
-------------------------
Le wizard occupe la zone centrale avec une barre de progression en haut.

  ┌──────────────────────────────────────────────────────────────┐
  │ ← Retour    INSCRIPTION D'UN ÉLÈVE           Étape 1/4       │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  [━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]       │
  │   Identité      Scolarité     Contacts     Confirmation      │
  │                                                              │
  │  ┌────────────────────────────────────────────────────────┐  │
  │  │                                                        │  │
  │  │         CONTENU DE L'ÉTAPE ACTIVE                      │  │
  │  │         (Step1 à Step4)                                │  │
  │  │                                                        │  │
  │  └────────────────────────────────────────────────────────┘  │
  │                                                              │
  │  [← Précédent]                        [Suivant →]           │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘

MODE ÉDITION :
  - Titre devient "MODIFIER UN ÉLÈVE"
  - Les données existantes pré-remplissent le formulaire
  - Le matricule est affiché en lecture seule (non modifiable)
  - Bouton final : "Enregistrer les modifications" au lieu de "Inscrire l'élève"


HOOK useStudentForm.ts
-----------------------
Gère l'état du wizard et la soumission :

  interface StudentFormState {
    mode: 'create' | 'edit'
    studentId?: string
    currentStep: number
    formData: Partial<StudentFormData>
    validationErrors: Record<string, string[]>
    isSubmitting: boolean
    
    nextStep: () => void
    prevStep: () => void
    goToStep: (step: number) => void
    updateFormData: (step: string, data: any) => void
    validateStep: (step: number) => boolean
    submitForm: () => Promise<void>
    reset: () => void
  }

En mode édition :
  - Au montage, charger GET /api/students/:id
  - Pré-remplir formData avec les données existantes
  - Envoyer PUT /api/students/:id au lieu de POST /api/students


═══════════════════════════════════════════════════════════════
ÉTAPE 1 / 4 — IDENTITÉ CIVILE (Step1Identity.tsx)
═══════════════════════════════════════════════════════════════

CHAMPS DU FORMULAIRE
---------------------
1. Photo de l'élève (PhotoUpload.tsx)
   Zone de drop carrée 160×160px, centrée en haut
   Formats : JPG, PNG | Taille max : 2MB
   Redimensionnement client-side à 400×400px avec Sharp (via API)
   Preview immédiat après sélection
   Bouton "Changer la photo" si déjà uploadée

2. Nom (de famille) * (Input text)
   Affiché et stocké en MAJUSCULES
   Min 2 chars, max 50
   Transform automatique : .toUpperCase()
   Exemple : AMISI

3. Post-nom (nom du père) * (Input text)
   Affiché et stocké en MAJUSCULES
   Min 2 chars, max 50
   Exemple : KALOMBO

4. Prénom(s) (Input text — optionnel)
   Première lettre majuscule automatique (capitalize)
   Max 50 chars
   Exemple : Jean-Baptiste

5. Sexe * (Radio group horizontal)
   Options : ⚪ Masculin  ⚪ Féminin
   Valeur : M | F

6. Date de naissance * (Date picker)
   Format : JJ/MM/AAAA
   Validation : entre 1990 et aujourd'hui - 5 ans (âge min 5 ans)
   Calcul âge automatique affiché : "(16 ans)"

7. Lieu de naissance * (Input text)
   Format libre : "Ville, Province"
   Exemple : Goma, Nord-Kivu
   Max 100 chars

8. Nationalité * (Select avec recherche)
   Valeur par défaut : "Congolaise"
   Options : liste des nationalités (focus Afrique)
   Nationalités courantes en haut : Congolaise, Rwandaise, Burundaise, Ougandaise

VALIDATION (Zod)
----------------
const step1Schema = z.object({
  nom: z.string().min(2).max(50).transform(s => s.toUpperCase()),
  postNom: z.string().min(2).max(50).transform(s => s.toUpperCase()),
  prenom: z.string().max(50).optional(),
  sexe: z.enum(['M', 'F']),
  dateNaissance: z.date()
    .min(new Date('1990-01-01'), "Date trop ancienne")
    .max(subtractYears(new Date(), 5), "L'élève doit avoir au moins 5 ans"),
  lieuNaissance: z.string().min(2).max(100),
  nationalite: z.string().min(2),
  photoFile: z.instanceof(File).optional()
})


═══════════════════════════════════════════════════════════════
ÉTAPE 2 / 4 — SCOLARITÉ (Step2Academic.tsx)
═══════════════════════════════════════════════════════════════

CHAMPS DU FORMULAIRE
---------------------
1. Section * (Select)
   Options dynamiques : GET /api/sections?schoolId=:id
   Format : "Tronc Commun | Scientifique | Commerciale | Pédagogique | Technique | Littéraire"
   Filtre les classes disponibles selon la section choisie

2. Classe * (Select — dépend de la section)
   Options dynamiques filtrées : GET /api/classes?sectionId=:id
   Exemple : si Section = Scientifique → classes 3ScA, 4ScA, 4ScB, 5ScA, 6ScA
   Désactivé tant que Section n'est pas sélectionnée

3. Statut de l'élève * (Select)
   Options :
     - Nouveau (première inscription dans cette école)
     - Redoublant (redouble cette année)
     - Transféré (vient d'une autre école)
     - Déplacé interne (contexte humanitaire — guerre/catastrophe)
     - Réfugié (statut officiel UNHCR)
   Valeur par défaut : "Nouveau"

4. École d'origine (Input text — visible si statut = Transféré)
   Optionnel si Nouveau
   Requis si Transféré
   Exemple : "Complexe Scolaire de Nyiragongo"

5. Résultat TENASOSP (Input number — visible si classe ≥ 3ème)
   Format : note sur 100 (0 à 100)
   Optionnel
   Label : "Pourcentage obtenu au TENASOSP (ex: 67)"
   Visible seulement si la classe est 3ème année ou plus

VALIDATION
----------
const step2Schema = z.object({
  sectionId: z.string().uuid("Sélectionnez une section"),
  classId: z.string().uuid("Sélectionnez une classe"),
  statut: z.enum(['NOUVEAU', 'REDOUBLANT', 'TRANSFERE', 'DEPLACE', 'REFUGIE']),
  ecoleOrigine: z.string().optional(),
  resultatTenasosp: z.number().min(0).max(100).optional()
}).refine(data => {
  if (data.statut === 'TRANSFERE' && !data.ecoleOrigine) {
    return false
  }
  return true
}, {
  message: "L'école d'origine est requise pour un élève transféré",
  path: ['ecoleOrigine']
})


═══════════════════════════════════════════════════════════════
ÉTAPE 3 / 4 — CONTACTS FAMILLE (Step3Contacts.tsx)
═══════════════════════════════════════════════════════════════

INTERFACE EN 3 CARTES
----------------------
Afficher 3 cartes côte à côte (1 colonne sur mobile) :

  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
  │    PÈRE          │ │    MÈRE          │ │  TUTEUR LÉGAL    │
  │                  │ │                  │ │                  │
  │ Nom complet      │ │ Nom complet      │ │ Nom complet      │
  │ [____________]   │ │ [____________]   │ │ [____________]   │
  │                  │ │                  │ │                  │
  │ Téléphone        │ │ Téléphone        │ │ Téléphone *      │
  │ [+243|_______]   │ │ [+243|_______]   │ │ [+243|_______]   │
  │                  │ │                  │ │                  │
  │ ☐ Tuteur principal│ │ ☐ Tuteur principal│ │ ☑ Tuteur principal│
  └──────────────────┘ └──────────────────┘ └──────────────────┘

CHAMPS
------
PÈRE (optionnel complet)
  - Nom complet : Input text, max 100 chars
  - Téléphone : Input tel, format +243XXXXXXXXX, optionnel

MÈRE (optionnel complet)
  - Nom complet : Input text, max 100 chars
  - Téléphone : Input tel, format +243XXXXXXXXX, optionnel

TUTEUR LÉGAL (au moins 1 téléphone requis)
  - Nom complet : Input text, max 100 chars, optionnel
  - Téléphone * : Input tel, format +243XXXXXXXXX, REQUIS
  - Case "Tuteur principal" : cochée par défaut

RÈGLE DU TUTEUR PRINCIPAL :
  Une seule case peut être cochée à la fois.
  Le tuteur principal est celui qui recevra les SMS et convocations.
  Si aucun téléphone saisi → erreur de validation.
  Par défaut, c'est le tuteur légal.

VALIDATION
----------
const step3Schema = z.object({
  nomPere: z.string().max(100).optional(),
  telPere: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/).optional().or(z.literal('')),
  nomMere: z.string().max(100).optional(),
  telMere: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/).optional().or(z.literal('')),
  nomTuteur: z.string().max(100).optional(),
  telTuteur: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/, "Numéro congolais invalide"),
  tuteurPrincipal: z.enum(['pere', 'mere', 'tuteur']).default('tuteur')
}).refine(data => {
  // Au moins un téléphone doit être renseigné
  return data.telPere || data.telMere || data.telTuteur
}, {
  message: "Au moins un numéro de téléphone est requis",
  path: ['telTuteur']
})


═══════════════════════════════════════════════════════════════
ÉTAPE 4 / 4 — CONFIRMATION (Step4Confirm.tsx)
═══════════════════════════════════════════════════════════════

RÉCAPITULATIF COMPLET
----------------------
Afficher toutes les données saisies pour vérification finale :

  ┌────────────────────────────────────────────────────────────┐
  │  ✓ Récapitulatif de l'inscription                          │
  ├────────────────────────────────────────────────────────────┤
  │                                                            │
  │  [PHOTO]    AMISI KALOMBO Jean-Baptiste                    │
  │  160×160    Sexe : Masculin                                │
  │             Né le : 12/03/2008 à Goma, Nord-Kivu (16 ans)  │
  │             Nationalité : Congolaise                       │
  │                                                            │
  │  SCOLARITÉ                                                 │
  │  Section : Scientifique                                    │
  │  Classe : 4ème Scientifique A                              │
  │  Statut : Nouveau                                          │
  │  TENASOSP : 67%                                            │
  │                                                            │
  │  CONTACTS FAMILLE                                          │
  │  Père : AMISI PIERRE  +243 810 000 000                     │
  │  Mère : KAHINDO ALICE  +243 820 000 000                    │
  │  Tuteur : —                                                │
  │  Tuteur principal : Père (recevra les SMS)                 │
  │                                                            │
  │  ℹ️ Un matricule unique sera généré automatiquement        │
  │     après validation de l'inscription.                     │
  │                                                            │
  │  [← Modifier]              [Inscrire l'élève →]            │
  │                                                            │
  └────────────────────────────────────────────────────────────┘

Bouton "Modifier" → permet de revenir à l'étape spécifique (goToStep).
Bouton "Inscrire l'élève" → soumet toutes les données.

En mode édition : le bouton devient "Enregistrer les modifications"


APPELS API
-----------
POST /api/students (mode création)
  Corps : multipart/form-data {
    // Step 1
    nom: string,
    postNom: string,
    prenom?: string,
    sexe: "M" | "F",
    dateNaissance: string (ISO),
    lieuNaissance: string,
    nationalite: string,
    photoFile?: File,

    // Step 2
    classId: string (UUID),
    statut: StudentStatus,
    ecoleOrigine?: string,
    resultatTenasosp?: number,

    // Step 3
    nomPere?: string,
    telPere?: string,
    nomMere?: string,
    telMere?: string,
    nomTuteur?: string,
    telTuteur: string,
    tuteurPrincipal: "pere" | "mere" | "tuteur"
  }

  Réponse 201 : {
    student: Student (avec matricule généré),
    message: "Élève inscrit avec succès"
  }

PUT /api/students/:id (mode édition)
  Corps : même structure que POST (sauf photoFile optionnel si pas changée)
  Réponse 200 : {
    student: Student,
    message: "Élève modifié avec succès"
  }


BACKEND — GÉNÉRATION DU MATRICULE
-----------------------------------
Dans packages/shared/src/utils/matricule.ts :

  export function generateMatricule(
    province: string,      // "NK" pour Nord-Kivu
    ville: string,         // "GOM" pour Goma
    schoolCode: string,    // "ISS001" (défini dans school.code)
    sequence: number       // auto-incrémenté par école
  ): string {
    const seq = sequence.toString().padStart(4, '0')
    return `${province}-${ville}-${schoolCode}-${seq}`
  }

  // Exemple : "NK-GOM-ISS001-0234"

Dans students.service.ts (méthode create) :

  async function createStudent(data: CreateStudentDto, schoolId: string) {
    // 1. Récupérer la school pour obtenir le code
    const school = await prisma.school.findUnique({ where: { id: schoolId } })
    
    // 2. Obtenir le dernier matricule pour incrémenter la séquence
    const lastStudent = await prisma.student.findFirst({
      where: { schoolId },
      orderBy: { createdAt: 'desc' }
    })
    
    const sequence = lastStudent 
      ? parseInt(lastStudent.matricule.split('-')[3]) + 1
      : 1
    
    // 3. Générer le matricule
    const matricule = generateMatricule(
      getProvinceCode(school.province),  // "NK"
      getCityCode(school.ville),         // "GOM"
      school.code,                       // "ISS001"
      sequence
    )
    
    // 4. Upload photo si présente
    let photoUrl = null
    if (data.photoFile) {
      photoUrl = await uploadToStorage(data.photoFile, 'students')
    }
    
    // 5. Créer l'élève avec enrollment automatique
    const student = await prisma.student.create({
      data: {
        schoolId,
        matricule,
        nom: data.nom,
        postNom: data.postNom,
        prenom: data.prenom,
        sexe: data.sexe,
        dateNaissance: data.dateNaissance,
        lieuNaissance: data.lieuNaissance,
        nationalite: data.nationalite,
        photoUrl,
        statut: data.statut,
        nomPere: data.nomPere,
        telPere: data.telPere,
        nomMere: data.nomMere,
        telMere: data.telMere,
        nomTuteur: data.nomTuteur,
        telTuteur: data.telTuteur,
        enrollments: {
          create: {
            classId: data.classId,
            academicYearId: getCurrentAcademicYearId(schoolId),
            ecoleOrigine: data.ecoleOrigine,
            resultatTenasosp: data.resultatTenasosp
          }
        }
      },
      include: { enrollments: { include: { class: true } } }
    })
    
    // 6. Envoyer SMS de bienvenue au tuteur principal
    const phone = data[`tel${capitalize(data.tuteurPrincipal)}`]
    if (phone) {
      await sendWelcomeSMS(phone, student.nom, student.postNom, matricule)
    }
    
    return student
  }

SMS de bienvenue (exemple) :
  FR: "EduGoma360: Bienvenue {NOM} {POSTNOM} ! Matricule: {MATRICULE}. Classe: {CLASSE}."
  SW: "EduGoma360: Karibu {NOM} {POSTNOM} ! Nambari: {MATRICULE}. Darasa: {CLASSE}."


POST-SOUMISSION — REDIRECTION
-------------------------------
Après succès :
  1. Afficher toast vert : "✓ Élève inscrit avec succès ! Matricule : {matricule}"
  2. Attendre 2 secondes
  3. Rediriger vers /students/{newStudentId} (fiche détail du nouvel élève)

En mode édition :
  1. Toast : "✓ Élève modifié avec succès"
  2. Invalider le cache TanStack Query : queryClient.invalidateQueries(['students', id])
  3. Rester sur la même page OU rediriger vers /students/{id}


SAUVEGARDE BROUILLON (DRAFT)
------------------------------
Comme pour le wizard setup, sauvegarder en localStorage toutes les 30 secondes :
  Clé : `edugoma_student_draft_${userId}`
  Au montage, proposer de restaurer si présent
  Supprimer après soumission réussie


GESTION DES ERREURS
--------------------
400 MATRICULE_CONFLICT
  → "Un élève avec ce matricule existe déjà (erreur système)"

400 CLASS_FULL
  → "La classe {classe} est complète (maximum {max} élèves)"

400 DUPLICATE_PHONE
  → "Ce numéro de téléphone est déjà utilisé par un autre élève"

400 INVALID_CLASS
  → "La classe sélectionnée n'existe pas ou n'est pas active"

500 PHOTO_UPLOAD_FAILED
  → "Erreur lors de l'upload de la photo. Réessayez."


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Le wizard en 4 étapes fonctionne (navigation avant/arrière)
[ ] La validation Zod bloque le passage à l'étape suivante si erreurs
[ ] La photo s'uploade et affiche un preview immédiat
[ ] Les selects Section et Classe sont liés (Classe filtrée selon Section)
[ ] Le statut "Transféré" rend le champ École d'origine requis
[ ] Le résultat TENASOSP n'apparaît que si classe ≥ 3ème
[ ] Un seul tuteur principal peut être coché à la fois
[ ] Le récapitulatif affiche toutes les données saisies
[ ] Le backend génère le matricule automatiquement (format NK-GOM-XXX-0001)
[ ] Un SMS de bienvenue est envoyé au tuteur principal après inscription
[ ] La redirection fonctionne vers /students/:id après succès
[ ] Le mode édition pré-remplit le formulaire avec les données existantes
[ ] Le brouillon se sauvegarde toutes les 30s en localStorage
[ ] Le wizard est responsive (mobile 375px et desktop 1280px)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 3 — SCR-008 : IMPORT ÉLÈVES EN MASSE (EXCEL)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/students/StudentsImportPage.tsx
Route : /students/import
Accès : Authentifié — Rôle minimum : SECRETAIRE
Prérequis : SCR-005 (liste élèves) terminé


OBJECTIF
--------
Crée l'écran d'import en masse d'élèves via fichier Excel (SCR-008).
Cet écran permet d'importer 50, 100, 200+ élèves en une seule fois.
Il parse le fichier côté client (prévisualisation + validation), puis l'envoie au serveur.
Affiche un rapport d'import détaillé avec les succès et les erreurs.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/students/StudentsImportPage.tsx        ← CRÉER
2. packages/client/src/components/students/import/UploadZone.tsx    ← CRÉER
3. packages/client/src/components/students/import/PreviewTable.tsx  ← CRÉER
4. packages/client/src/components/students/import/ImportReport.tsx  ← CRÉER
5. packages/client/src/lib/excel/parseStudents.ts                   ← CRÉER
6. packages/server/src/modules/students/students.import.service.ts  ← CRÉER


UI — FLUX EN 4 ÉTAPES
----------------------
L'écran gère 4 étapes qui s'affichent successivement :

  ÉTAPE 1 : Upload du fichier
  ÉTAPE 2 : Prévisualisation et validation
  ÉTAPE 3 : Import en cours (barre de progression)
  ÉTAPE 4 : Rapport d'import


═══════════════════════════════════════════════════════════════
ÉTAPE 1 — UPLOAD DU FICHIER (UploadZone.tsx)
═══════════════════════════════════════════════════════════════

INTERFACE
---------
  ┌────────────────────────────────────────────────────────────┐
  │  IMPORTER DES ÉLÈVES EN MASSE                              │
  ├────────────────────────────────────────────────────────────┤
  │                                                            │
  │  ┌──────────────────────────────────────────────────────┐  │
  │  │                                                      │  │
  │  │        📁   Glissez-déposez votre fichier ici        │  │
  │  │                   ou cliquez pour parcourir          │  │
  │  │                                                      │  │
  │  │   Formats acceptés : .xlsx, .xls, .csv               │  │
  │  │   Taille maximum : 5 MB                              │  │
  │  │                                                      │  │
  │  └──────────────────────────────────────────────────────┘  │
  │                                                            │
  │  📥 Télécharger le modèle Excel vide                       │
  │     (avec colonnes pré-définies et exemples)               │
  │                                                            │
  │  ℹ️ Instructions :                                         │
  │  1. Téléchargez le modèle Excel                            │
  │  2. Remplissez une ligne par élève                         │
  │  3. Sauvegardez et importez le fichier                     │
  │                                                            │
  └────────────────────────────────────────────────────────────┘

Zone de drop :
  - Hauteur 240px, bordure pointillée verte
  - État hover : fond vert clair + bordure solide verte
  - État dragging : fond vert clair + icône Upload animée
  - Clic → ouvre file picker (input[type="file"] caché)

Validation côté client :
  - Vérifier extension : .xlsx | .xls | .csv
  - Vérifier taille : max 5MB
  - Si invalide → toast rouge avec message d'erreur


MODÈLE EXCEL (Template)
------------------------
Générer dynamiquement côté serveur :

GET /api/students/import-template
  Réponse : fichier .xlsx binaire

Structure du modèle (ExcelJS) :
  - Nom du fichier : "Modele_Import_Eleves_EduGoma360.xlsx"
  - Feuille 1 : "Élèves"
  - Feuille 2 : "Instructions" (guide d'utilisation)

COLONNES REQUISES (feuille "Élèves") :
  A : nom *                   (texte, MAJUSCULES)
  B : postNom *               (texte, MAJUSCULES)
  C : prenom                  (texte, optionnel)
  D : sexe *                  (M ou F)
  E : dateNaissance *         (JJ/MM/AAAA)
  F : lieuNaissance *         (texte)
  G : nationalite *           (texte, défaut: Congolaise)
  H : classe *                (nom exact : "4ScA", "TC-1B", etc.)
  I : statut *                (NOUVEAU | REDOUBLANT | TRANSFERE | DEPLACE | REFUGIE)
  J : ecoleOrigine            (texte, optionnel)
  K : resultatTenasosp        (nombre 0-100, optionnel)
  L : nomPere                 (texte, optionnel)
  M : telPere                 (format +243XXXXXXXXX, optionnel)
  N : nomMere                 (texte, optionnel)
  O : telMere                 (format +243XXXXXXXXX, optionnel)
  P : nomTuteur               (texte, optionnel)
  Q : telTuteur *             (format +243XXXXXXXXX, REQUIS)
  R : tuteurPrincipal *       (pere | mere | tuteur)

Ligne 1 : En-têtes (en gras, fond vert clair)
Ligne 2 : Exemple valide (données fictives)
Ligne 3 : Exemple avec erreur (pour montrer la validation)
Ligne 4+ : Vides (prêtes à remplir)

Feuille "Instructions" :
  - Guide d'utilisation en français
  - Exemples de données valides
  - Liste des codes de classe disponibles dans l'école
  - Format des téléphones congolais
  - Règles de validation


═══════════════════════════════════════════════════════════════
ÉTAPE 2 — PRÉVISUALISATION (PreviewTable.tsx)
═══════════════════════════════════════════════════════════════

PARSING CÔTÉ CLIENT
--------------------
Dans packages/client/src/lib/excel/parseStudents.ts :

  import * as XLSX from 'xlsx'
  
  interface ParsedStudent {
    row: number
    data: Partial<StudentImportData>
    errors: string[]
    warnings: string[]
  }
  
  export async function parseStudentsFile(file: File): Promise<ParsedStudent[]> {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    // Ignorer la ligne d'en-têtes (row 0)
    const dataRows = rows.slice(1)
    
    return dataRows.map((row: any[], index) => {
      const rowNum = index + 2 // +2 car Excel commence à 1 et on skip l'en-tête
      const parsed = parseRow(row, rowNum)
      const errors = validateRow(parsed.data, rowNum)
      const warnings = checkWarnings(parsed.data, rowNum)
      
      return { row: rowNum, data: parsed.data, errors, warnings }
    })
  }
  
  function validateRow(data: any, rowNum: number): string[] {
    const errors: string[] = []
    
    // Valider chaque champ avec les mêmes règles que le formulaire
    if (!data.nom || data.nom.length < 2) {
      errors.push(`Ligne ${rowNum}: Nom invalide (min 2 caractères)`)
    }
    if (!data.sexe || !['M', 'F'].includes(data.sexe)) {
      errors.push(`Ligne ${rowNum}: Sexe invalide (doit être M ou F)`)
    }
    if (!data.telTuteur || !/^\+243(81|82|97|98|89)\d{7}$/.test(data.telTuteur)) {
      errors.push(`Ligne ${rowNum}: Téléphone tuteur invalide`)
    }
    // ... autres validations
    
    return errors
  }

AFFICHAGE DE LA PRÉVISUALISATION
---------------------------------
  ┌────────────────────────────────────────────────────────────┐
  │  PRÉVISUALISATION — 47 lignes détectées                    │
  ├────────────────────────────────────────────────────────────┤
  │                                                            │
  │  Résumé :                                                  │
  │  ✅ 42 lignes valides    ⚠️ 3 avertissements    ❌ 2 erreurs│
  │                                                            │
  │  [Afficher seulement les erreurs ▼]                        │
  │                                                            │
  │  ┌──────────────────────────────────────────────────────┐  │
  │  │ Ligne│Nom           │Classe│Statut  │Tel      │État │  │
  │  ├──────┼──────────────┼──────┼────────┼─────────┼─────┤  │
  │  │  2   │AMISI KALOMBO │4ScA  │NOUVEAU │+243810..│ ✅  │  │
  │  │  3   │BAHATI MARIE  │5PédB │NOUVEAU │+243820..│ ✅  │  │
  │  │  4   │CIZA Pierre   │TC-1A │        │+243830..│ ⚠️  │  │
  │  │      │(Post-nom manquant)                        │     │  │
  │  │  5   │DUSABE ALICE  │9ScZ  │NOUVEAU │invalide │ ❌  │  │
  │  │      │(Classe inexistante · Téléphone invalide)  │     │  │
  │  │ ...                                                    │  │
  │  └──────────────────────────────────────────────────────┘  │
  │                                                            │
  │  ❌ Vous ne pouvez pas importer tant qu'il y a des erreurs│
  │     Corrigez le fichier et réimportez-le.                 │
  │                                                            │
  │  [← Annuler]                     [Lancer l'import →]      │
  │                                  (désactivé si erreurs)   │
  │                                                            │
  └────────────────────────────────────────────────────────────┘

Couleurs des badges état :
  ✅ Vert   : ligne valide, prête à importer
  ⚠️ Orange : avertissement (ex: champ optionnel manquant), import possible
  ❌ Rouge  : erreur bloquante, import impossible

Filtre dropdown :
  - Toutes les lignes
  - Seulement les erreurs (❌)
  - Seulement les avertissements (⚠️)
  - Seulement les valides (✅)


═══════════════════════════════════════════════════════════════
ÉTAPE 3 — IMPORT EN COURS
═══════════════════════════════════════════════════════════════

INTERFACE
---------
  ┌────────────────────────────────────────────────────────────┐
  │  IMPORT EN COURS...                                        │
  ├────────────────────────────────────────────────────────────┤
  │                                                            │
  │  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━] 67%   │
  │                                                            │
  │  28 / 42 élèves importés                                   │
  │                                                            │
  │  Dernière action : Création de MUKASA JEAN (4ScA)          │
  │                                                            │
  │  ⏱ Temps écoulé : 00:23                                   │
  │  ⏱ Temps restant estimé : 00:11                           │
  │                                                            │
  └────────────────────────────────────────────────────────────┘

Barre de progression animée (Progress shadcn/ui).
Mise à jour en temps réel via WebSocket OU polling GET /api/students/import-status/:jobId.

Alternative simple (pas de temps réel) :
  Afficher spinner + "Import en cours, veuillez patienter..."
  Attendre la réponse POST complète (peut prendre 30s-2min selon le nombre)


═══════════════════════════════════════════════════════════════
ÉTAPE 4 — RAPPORT D'IMPORT (ImportReport.tsx)
═══════════════════════════════════════════════════════════════

INTERFACE
---------
  ┌────────────────────────────────────────────────────────────┐
  │  ✅ IMPORT TERMINÉ                                         │
  ├────────────────────────────────────────────────────────────┤
  │                                                            │
  │  ✅ 40 élèves importés avec succès                         │
  │  ⚠️  2 élèves ignorés (doublons)                           │
  │  ❌  0 erreur                                              │
  │                                                            │
  │  Détails des élèves importés :                             │
  │  ┌──────────────────────────────────────────────────────┐  │
  │  │ Matricule    │ Nom                │ Classe │ Résultat│  │
  │  ├──────────────┼────────────────────┼────────┼─────────┤  │
  │  │ NK-GOM-0248  │ AMISI KALOMBO Jean │ 4ScA   │ ✅ OK   │  │
  │  │ NK-GOM-0249  │ BAHATI MARIE       │ 5PédB  │ ✅ OK   │  │
  │  │ —            │ CIZA PIERRE        │ TC-1A  │ ⚠️ Dbl  │  │
  │  │ NK-GOM-0250  │ DUSABE ALICE       │ 4ScA   │ ✅ OK   │  │
  │  │ ...                                                    │  │
  │  └──────────────────────────────────────────────────────┘  │
  │                                                            │
  │  [📥 Télécharger le rapport complet (Excel)]               │
  │  [← Importer un autre fichier]   [Voir la liste →]        │
  │                                                            │
  └────────────────────────────────────────────────────────────┘

Bouton "Voir la liste" → redirige vers /students avec filtre sur les nouveaux inscrits.


APPELS API
-----------
GET /api/students/import-template
  Réponse : fichier .xlsx binaire

POST /api/students/import
  Corps : multipart/form-data { file: File, classId?: string }
  Réponse 200 : {
    imported: number,
    skipped: number,
    errors: ImportError[],
    students: Student[]  // élèves créés
  }
  
  ImportError : {
    row: number,
    field?: string,
    message: string
  }


BACKEND — students.import.service.ts
--------------------------------------
async function importStudentsFromExcel(
  file: Express.Multer.File,
  schoolId: string,
  userId: string
): Promise<ImportResult> {
  // 1. Parser le fichier avec ExcelJS
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(file.buffer)
  const worksheet = workbook.getWorksheet(1)
  
  // 2. Valider les en-têtes
  const headers = worksheet.getRow(1).values as string[]
  validateHeaders(headers)
  
  // 3. Parser chaque ligne
  const rows = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // skip headers
    rows.push({ rowNumber, data: parseRowData(row) })
  })
  
  // 4. Valider toutes les lignes
  const validated = rows.map(({ rowNumber, data }) => ({
    rowNumber,
    data,
    errors: validateStudentData(data, rowNumber)
  }))
  
  // 5. Filtrer les lignes valides
  const valid = validated.filter(v => v.errors.length === 0)
  
  // 6. Import en transaction
  const result = await prisma.$transaction(async (tx) => {
    const imported: Student[] = []
    const skipped: number[] = []
    const errors: ImportError[] = []
    
    for (const { rowNumber, data } of valid) {
      try {
        // Vérifier doublon (même nom + date naissance)
        const existing = await tx.student.findFirst({
          where: {
            schoolId,
            nom: data.nom,
            postNom: data.postNom,
            dateNaissance: data.dateNaissance
          }
        })
        
        if (existing) {
          skipped.push(rowNumber)
          continue
        }
        
        // Récupérer la classe
        const classe = await tx.class.findFirst({
          where: { schoolId, name: data.classe }
        })
        
        if (!classe) {
          errors.push({
            row: rowNumber,
            field: 'classe',
            message: `Classe "${data.classe}" introuvable`
          })
          continue
        }
        
        // Générer matricule
        const sequence = await getNextMatriculeSequence(tx, schoolId)
        const matricule = generateMatricule(
          getProvinceCode(school.province),
          getCityCode(school.ville),
          school.code,
          sequence
        )
        
        // Créer l'élève
        const student = await tx.student.create({
          data: {
            schoolId,
            matricule,
            ...data,
            classId: classe.id,
            enrollments: {
              create: {
                classId: classe.id,
                academicYearId: getCurrentAcademicYearId(schoolId)
              }
            }
          }
        })
        
        imported.push(student)
        
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error.message
        })
      }
    }
    
    return { imported, skipped, errors }
  })
  
  // 7. Logger l'import
  await logImportActivity(userId, schoolId, {
    total: rows.length,
    imported: result.imported.length,
    skipped: result.skipped.length,
    errors: result.errors.length
  })
  
  return result
}


GESTION DES DOUBLONS
---------------------
Critère de détection de doublon :
  nom + postNom + dateNaissance identiques → considéré comme doublon

Stratégie :
  - Ignorer silencieusement (skip)
  - Compter dans le rapport comme "⚠️ ignoré (doublon)"
  - NE PAS créer de ligne en base


OPTIMISATION PERFORMANCE
--------------------------
Pour des imports de 200+ élèves :
  - Utiliser prisma.student.createMany() au lieu de boucle de .create()
  - Générer tous les matricules en lot AVANT l'insertion
  - Désactiver les hooks Prisma pendant l'import
  - Ne pas envoyer de SMS de bienvenue pendant l'import (option batch SMS après)


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Le modèle Excel se télécharge correctement avec exemples
[ ] La zone de drop accepte les fichiers .xlsx, .xls, .csv
[ ] Le parsing côté client fonctionne avec SheetJS
[ ] La prévisualisation affiche toutes les lignes avec leur état
[ ] Les erreurs bloquent l'import (bouton désactivé)
[ ] L'import POST fonctionne et crée bien les élèves en base
[ ] Les matricules sont générés automatiquement et séquentiels
[ ] Les doublons sont détectés et ignorés
[ ] Le rapport final affiche le nombre d'importés/ignorés/erreurs
[ ] La redirection vers /students fonctionne après import
[ ] L'import de 100+ élèves termine en < 2 minutes
[ ] Le modèle Excel contient la feuille Instructions en français
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 3 — SCR-009 : GÉNÉRATION CARTE ÉLÈVE (PDF)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/server/src/modules/students/students.pdf.service.ts
Route API : GET /api/students/:id/card
Accès : Authentifié — Rôle minimum : SECRETAIRE
Déclenchement : Depuis SCR-006 (fiche élève) → menu ⋮ → "Générer carte d'élève"


OBJECTIF
--------
Génère une carte d'élève officielle au format PDF imprimable (SCR-009).
La carte respecte le format ID standard (85.6mm × 54mm) pour impression recto-verso.
Elle doit contenir tous les éléments d'identification officiels + un code-barres.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/server/src/modules/students/students.pdf.service.ts     ← CRÉER
2. packages/server/src/modules/students/templates/card-front.html   ← CRÉER
3. packages/server/src/modules/students/templates/card-back.html    ← CRÉER
4. packages/server/src/modules/students/students.routes.ts          ← AJOUTER route
5. packages/server/src/lib/pdf.ts                                   ← VÉRIFIER (Puppeteer)
6. packages/server/src/lib/barcode.ts                               ← CRÉER (JsBarcode)


APPEL API
----------
GET /api/students/:id/card
  Query params :
    - format?: "pdf" | "png"  (défaut: pdf)
    - side?: "front" | "back" | "both"  (défaut: both)
  
  Headers :
    Authorization: Bearer {token}
  
  Réponse :
    Content-Type: application/pdf (ou image/png si format=png)
    Content-Disposition: attachment; filename="Carte_{MATRICULE}.pdf"
    Body: Binary PDF ou PNG

Exemple d'URL complète :
  https://api.edugoma360.cd/api/students/abc-123-def/card?format=pdf&side=both


DIMENSIONS ET FORMAT
---------------------
Format carte ID standard (ISO/IEC 7810 ID-1) :
  - Largeur  : 85.6 mm (3.370 inches)
  - Hauteur  : 54.0 mm (2.125 inches)
  - Ratio    : 1.586:1

Conversion en pixels pour Puppeteer (300 DPI pour impression) :
  - Largeur  : 1011px (85.6mm × 300 DPI / 25.4)
  - Hauteur  : 638px (54.0mm × 300 DPI / 25.4)

Marges internes : 4mm (47px à 300 DPI) sur tous les bords


TEMPLATE HTML — RECTO (card-front.html)
-----------------------------------------
Structure :

  ┌─────────────────────────────────────────────────────────┐
  │ [LOGO]              INSTITUT TECHNIQUE DE GOMA          │
  │                     Province du Nord-Kivu               │
  │                                                         │
  │ ┌────────┐  AMISI KALOMBO                               │
  │ │ PHOTO  │  Jean-Baptiste                               │
  │ │ 120x   │                                              │
  │ │ 150px  │  Matricule : NK-GOM-ISS001-0234              │
  │ └────────┘  Classe : 4ème Scientifique A                │
  │                                                         │
  │                       [CODE-BARRES]                      │
  │              Année scolaire : 2024-2025                 │
  └─────────────────────────────────────────────────────────┘

Code HTML (card-front.html) :

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Arial', sans-serif;
      width: 85.6mm;
      height: 54mm;
      background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
      border: 1px solid #1B5E20;
      padding: 4mm;
      position: relative;
    }
    
    .header {
      text-align: center;
      border-bottom: 2px solid #1B5E20;
      padding-bottom: 2mm;
      margin-bottom: 3mm;
    }
    
    .logo {
      width: 12mm;
      height: 12mm;
      float: left;
      margin-right: 2mm;
    }
    
    .school-name {
      font-size: 11pt;
      font-weight: bold;
      color: #1B5E20;
      line-height: 1.2;
    }
    
    .province {
      font-size: 8pt;
      color: #424242;
    }
    
    .content {
      display: flex;
      margin-top: 2mm;
    }
    
    .photo {
      width: 25mm;
      height: 30mm;
      border: 2px solid #1B5E20;
      margin-right: 3mm;
      object-fit: cover;
      flex-shrink: 0;
    }
    
    .info {
      flex: 1;
    }
    
    .student-name {
      font-size: 12pt;
      font-weight: bold;
      color: #212121;
      text-transform: uppercase;
      line-height: 1.3;
      margin-bottom: 1mm;
    }
    
    .prenom {
      font-weight: normal;
      text-transform: capitalize;
      font-size: 10pt;
    }
    
    .details {
      font-size: 8pt;
      color: #424242;
      line-height: 1.5;
    }
    
    .matricule {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      color: #1B5E20;
      margin: 1mm 0;
    }
    
    .footer {
      position: absolute;
      bottom: 4mm;
      left: 4mm;
      right: 4mm;
      text-align: center;
    }
    
    .barcode {
      width: 60mm;
      height: 8mm;
      margin: 0 auto 1mm;
    }
    
    .year {
      font-size: 7pt;
      color: #757575;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="{{logoUrl}}" class="logo" alt="Logo">
    <div class="school-name">{{schoolName}}</div>
    <div class="province">Province du {{province}}</div>
  </div>
  
  <div class="content">
    <img src="{{photoUrl}}" class="photo" alt="Photo élève">
    <div class="info">
      <div class="student-name">
        {{nom}} {{postNom}}<br>
        <span class="prenom">{{prenom}}</span>
      </div>
      <div class="details">
        <div class="matricule">{{matricule}}</div>
        <div>Classe : {{className}}</div>
        <div>Né(e) le : {{dateNaissance}}</div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <img src="{{barcodeDataUrl}}" class="barcode" alt="Code-barres">
    <div class="year">Année scolaire : {{academicYear}}</div>
  </div>
</body>
</html>
```


TEMPLATE HTML — VERSO (card-back.html)
----------------------------------------
Structure :

  ┌─────────────────────────────────────────────────────────┐
  │                 CARTE D'ÉLÈVE OFFICIELLE                │
  │                                                         │
  │  En cas de perte, veuillez retourner à :                │
  │                                                         │
  │  INSTITUT TECHNIQUE DE GOMA                             │
  │  Avenue de la Paix, N°12                                │
  │  Goma, Nord-Kivu                                        │
  │  Tél : +243 810 000 000                                 │
  │                                                         │
  │  ───────────────────────────────────────────────        │
  │                                                         │
  │  Cette carte est valable pour l'année scolaire          │
  │  2024-2025 uniquement.                                  │
  │                                                         │
  │  [Signature du Préfet]        [CACHET OFFICIEL]        │
  │                                                         │
  └─────────────────────────────────────────────────────────┘

Code HTML (card-back.html) :

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Arial', sans-serif;
      width: 85.6mm;
      height: 54mm;
      background: linear-gradient(135deg, #f5f5f5 0%, #e8f5e9 100%);
      border: 1px solid #1B5E20;
      padding: 4mm;
      position: relative;
    }
    
    .title {
      text-align: center;
      font-size: 10pt;
      font-weight: bold;
      color: #1B5E20;
      border-bottom: 2px solid #1B5E20;
      padding-bottom: 2mm;
      margin-bottom: 3mm;
      text-transform: uppercase;
    }
    
    .return-info {
      font-size: 7pt;
      color: #424242;
      line-height: 1.4;
      margin-bottom: 2mm;
    }
    
    .return-info strong {
      display: block;
      color: #212121;
      margin-bottom: 1mm;
    }
    
    .school-contact {
      font-size: 9pt;
      font-weight: bold;
      color: #1B5E20;
      margin-bottom: 1mm;
    }
    
    .separator {
      border-top: 1px dashed #BDBDBD;
      margin: 3mm 0;
    }
    
    .validity {
      font-size: 7pt;
      color: #424242;
      line-height: 1.4;
      text-align: center;
    }
    
    .footer {
      position: absolute;
      bottom: 4mm;
      left: 4mm;
      right: 4mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .signature {
      font-size: 7pt;
      text-align: center;
      flex: 1;
    }
    
    .signature-line {
      border-top: 1px solid #424242;
      width: 25mm;
      margin: 1mm auto 0;
    }
    
    .stamp-area {
      width: 20mm;
      height: 20mm;
      border: 1px dashed #BDBDBD;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6pt;
      color: #BDBDBD;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="title">Carte d'Élève Officielle</div>
  
  <div class="return-info">
    <strong>En cas de perte, veuillez retourner à :</strong>
    <div class="school-contact">{{schoolName}}</div>
    <div>{{address}}</div>
    <div>{{ville}}, {{province}}</div>
    <div>Tél : {{telephone}}</div>
  </div>
  
  <div class="separator"></div>
  
  <div class="validity">
    Cette carte est valable uniquement pour<br>
    l'année scolaire <strong>{{academicYear}}</strong>
  </div>
  
  <div class="footer">
    <div class="signature">
      Signature du Préfet
      <div class="signature-line"></div>
    </div>
    <div class="stamp-area">
      CACHET<br>OFFICIEL
    </div>
  </div>
</body>
</html>
```


GÉNÉRATION DU CODE-BARRES
---------------------------
Dans packages/server/src/lib/barcode.ts :

```typescript
import JsBarcode from 'jsbarcode'
import { createCanvas } from 'canvas'

export function generateBarcodeDataUrl(text: string): string {
  const canvas = createCanvas(600, 100) // 600x100px à 300 DPI
  
  JsBarcode(canvas, text, {
    format: 'CODE128',
    displayValue: false, // pas de texte sous le barcode
    width: 2,
    height: 80,
    margin: 10,
    background: '#ffffff',
    lineColor: '#000000'
  })
  
  return canvas.toDataURL('image/png')
}
```

Le texte du code-barres encode le matricule : NK-GOM-ISS001-0234


GÉNÉRATION PDF AVEC PUPPETEER
-------------------------------
Dans packages/server/src/modules/students/students.pdf.service.ts :

```typescript
import puppeteer from 'puppeteer'
import Handlebars from 'handlebars'
import fs from 'fs/promises'
import path from 'path'
import { generateBarcodeDataUrl } from '@/lib/barcode'

export async function generateStudentCard(
  studentId: string,
  format: 'pdf' | 'png' = 'pdf',
  side: 'front' | 'back' | 'both' = 'both'
): Promise<Buffer> {
  // 1. Récupérer les données de l'élève
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      school: true,
      enrollments: {
        include: { class: true, academicYear: true },
        where: { academicYear: { isActive: true } }
      }
    }
  })
  
  if (!student) {
    throw new Error('Élève introuvable')
  }
  
  // 2. Préparer les données pour les templates
  const enrollment = student.enrollments[0]
  const barcodeDataUrl = generateBarcodeDataUrl(student.matricule)
  
  const data = {
    logoUrl: student.school.logoUrl || '/default-logo.png',
    schoolName: student.school.name,
    province: student.school.province,
    address: student.school.adresse,
    ville: student.school.ville,
    telephone: student.school.telephone,
    photoUrl: student.photoUrl || '/default-avatar.png',
    nom: student.nom,
    postNom: student.postNom,
    prenom: student.prenom || '',
    matricule: student.matricule,
    className: enrollment.class.name,
    dateNaissance: format(student.dateNaissance, 'dd/MM/yyyy'),
    academicYear: enrollment.academicYear.label,
    barcodeDataUrl
  }
  
  // 3. Compiler les templates HTML
  const frontTemplate = await fs.readFile(
    path.join(__dirname, 'templates/card-front.html'),
    'utf-8'
  )
  const backTemplate = await fs.readFile(
    path.join(__dirname, 'templates/card-back.html'),
    'utf-8'
  )
  
  const compiledFront = Handlebars.compile(frontTemplate)
  const compiledBack = Handlebars.compile(backTemplate)
  
  const frontHtml = compiledFront(data)
  const backHtml = compiledBack(data)
  
  // 4. Générer le PDF avec Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const page = await browser.newPage()
  
  // Configuration pour format carte ID
  await page.setViewport({
    width: 1011,   // 85.6mm à 300 DPI
    height: 638,   // 54mm à 300 DPI
    deviceScaleFactor: 2  // Retina pour meilleure qualité
  })
  
  if (side === 'both') {
    // Générer recto-verso en 2 pages
    await page.setContent(frontHtml, { waitUntil: 'networkidle0' })
    const frontPdf = await page.pdf({
      width: '85.6mm',
      height: '54mm',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    })
    
    await page.setContent(backHtml, { waitUntil: 'networkidle0' })
    const backPdf = await page.pdf({
      width: '85.6mm',
      height: '54mm',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    })
    
    await browser.close()
    
    // Fusionner les 2 PDFs (utiliser pdf-lib)
    const merged = await mergePDFs([frontPdf, backPdf])
    return merged
    
  } else {
    // Générer un seul côté
    const html = side === 'front' ? frontHtml : backHtml
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    if (format === 'pdf') {
      const pdf = await page.pdf({
        width: '85.6mm',
        height: '54mm',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      })
      await browser.close()
      return pdf
      
    } else {
      // Format PNG
      const screenshot = await page.screenshot({
        type: 'png',
        omitBackground: false,
        fullPage: true
      })
      await browser.close()
      return screenshot
    }
  }
}
```


FUSION DE PDFS (recto-verso)
------------------------------
Utiliser pdf-lib pour fusionner les 2 pages :

```typescript
import { PDFDocument } from 'pdf-lib'

async function mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create()
  
  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer)
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach(page => mergedPdf.addPage(page))
  }
  
  const merged = await mergedPdf.save()
  return Buffer.from(merged)
}
```


ROUTE BACKEND
--------------
Dans students.routes.ts :

```typescript
router.get(
  '/:id/card',
  requireAuth,
  requireRole('SECRETAIRE', 'PREFET', 'SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const { id } = req.params
      const { format = 'pdf', side = 'both' } = req.query
      
      const buffer = await generateStudentCard(
        id,
        format as 'pdf' | 'png',
        side as 'front' | 'back' | 'both'
      )
      
      const student = await prisma.student.findUnique({
        where: { id },
        select: { matricule: true }
      })
      
      const extension = format === 'pdf' ? 'pdf' : 'png'
      const filename = `Carte_${student.matricule}.${extension}`
      
      res.setHeader('Content-Type', format === 'pdf' 
        ? 'application/pdf' 
        : 'image/png')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(buffer)
      
    } catch (error) {
      next(error)
    }
  }
)
```


IMPRESSION PHYSIQUE — INSTRUCTIONS
------------------------------------
Pour imprimer les cartes sur du plastique PVC :

1. **Imprimante recommandée** :
   - Canon PIXMA iP7250 (accepte cartes PVC)
   - Evolis Primacy (imprimante dédiée cartes ID)

2. **Support d'impression** :
   - Cartes PVC blanches pré-découpées 85.6×54mm
   - Grammage : 0.76mm d'épaisseur

3. **Paramètres d'impression** :
   - Qualité : Haute (300 DPI minimum)
   - Support : "Carte / Épais"
   - Mode : Recto-verso (si imprimante capable)
   - Marges : 0mm (borderless)

4. **Alternative économique** :
   - Imprimer sur papier cartonné 300g/m²
   - Plastifier avec plastifieuse à chaud
   - Découper avec massicot au format 85.6×54mm


GESTION DES ERREURS
--------------------
404 STUDENT_NOT_FOUND
  → "Élève introuvable"

404 NO_ENROLLMENT
  → "Aucune inscription active pour cet élève"

500 PDF_GENERATION_FAILED
  → "Erreur lors de la génération de la carte"

500 TEMPLATE_NOT_FOUND
  → "Fichier template manquant (contactez l'administrateur)"


OPTIMISATION — CACHE
---------------------
Pour éviter de régénérer la carte à chaque requête :

```typescript
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 jours

async function getCachedCard(studentId: string): Promise<Buffer | null> {
  const cacheKey = `card:${studentId}`
  const cached = await redis.get(cacheKey)
  
  if (cached) {
    return Buffer.from(cached, 'base64')
  }
  
  return null
}

async function setCachedCard(studentId: string, buffer: Buffer): Promise<void> {
  const cacheKey = `card:${studentId}`
  await redis.set(cacheKey, buffer.toString('base64'), 'EX', CACHE_TTL / 1000)
}

// Invalider le cache quand la photo ou les infos changent
async function invalidateCardCache(studentId: string): Promise<void> {
  await redis.del(`card:${studentId}`)
}
```


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Le template HTML recto affiche tous les éléments requis
[ ] Le template HTML verso affiche les infos de contact de l'école
[ ] Le code-barres est généré et encode le matricule
[ ] Le PDF généré respecte les dimensions 85.6×54mm exactes
[ ] La route GET /api/students/:id/card répond avec un PDF valide
[ ] Le PDF recto-verso contient bien 2 pages
[ ] Le nom de fichier téléchargé est Carte_{MATRICULE}.pdf
[ ] La qualité d'impression est suffisante à 300 DPI
[ ] Le logo de l'école s'affiche correctement (ou logo par défaut)
[ ] La photo de l'élève s'affiche (ou avatar par défaut)
[ ] Le cache Redis fonctionne et accélère les générations suivantes
[ ] Les erreurs (élève inexistant, etc.) sont gérées proprement
[ ] Testé avec une vraie impression physique sur papier cartonné
```

---

## RÉCAPITULATIF MODULE ÉLÈVES COMPLET

| N° | Écran    | Fonction                      | Fichier principal                      |
|----|----------|-------------------------------|----------------------------------------|
| 5  | SCR-005  | Liste avec filtres & recherche | pages/students/StudentsListPage.tsx    |
| 6  | SCR-006  | Fiche détail avec 5 onglets   | pages/students/StudentDetailPage.tsx   |
| 7  | SCR-007  | Formulaire wizard 4 étapes    | pages/students/StudentFormPage.tsx     |
| 8  | SCR-008  | Import Excel en masse         | pages/students/StudentsImportPage.tsx  |
| 9  | SCR-009  | Génération carte élève PDF    | modules/students/students.pdf.service.ts|

---

## ORDRE D'EXÉCUTION POUR LE MODULE ÉLÈVES

```
SCR-005 (Liste)
   ↓
SCR-006 (Détail) ← utilise les données de la liste
   ↓
SCR-007 (Formulaire) ← appelé depuis "Modifier" dans SCR-006 ou "Inscrire" dans SCR-005
   ↓
SCR-008 (Import Excel) ← alternative au formulaire pour inscription massive
   ↓
SCR-009 (Carte PDF) ← généré depuis le menu ⋮ de SCR-006
```

Le module Élèves est maintenant **100% complet** et prêt pour le développement.

---

*EduGoma 360 — Module Élèves Finalisé — Goma, RDC — © 2025*
