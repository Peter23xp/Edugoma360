# 🖥️ EDUGOMA 360 — PROMPTS DE DÉVELOPPEMENT
## Écrans SCR-001 à SCR-005 | 5 premiers écrans

> **MODE D'EMPLOI :**
> Ce fichier contient **5 prompts indépendants**, un par écran.
> Exécute-les **dans l'ordre**, un à la fois dans ton IDE IA.
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> Attends la confirmation de l'IDE avant de passer au suivant.

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
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 5 — SCR-001 : PAGE DE CONNEXION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/auth/LoginPage.tsx
Route : /login
Accès : Public (non authentifié uniquement)
Rôle minimum requis : Aucun


OBJECTIF
--------
Crée le composant React complet de la page de connexion (SCR-001).
Ce composant est le point d'entrée principal de l'application.
Il doit fonctionner en mode connecté ET en mode hors-ligne (offline).


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/auth/LoginPage.tsx          ← CRÉER (composant principal)
2. packages/client/src/pages/auth/LoginPage.test.tsx     ← CRÉER (tests Vitest)
3. packages/client/src/hooks/useAuth.ts                  ← CRÉER (hook Auth Zustand)
4. packages/client/src/stores/auth.store.ts              ← CRÉER (store Zustand)
5. packages/client/src/lib/api.ts                        ← CRÉER (client Axios)
6. packages/server/src/modules/auth/auth.routes.ts       ← VÉRIFIER / COMPLÉTER
7. packages/server/src/modules/auth/auth.controller.ts   ← VÉRIFIER / COMPLÉTER
8. packages/server/src/modules/auth/auth.service.ts      ← VÉRIFIER / COMPLÉTER


UI — STRUCTURE VISUELLE
------------------------
La page est centrée verticalement et horizontalement sur fond blanc cassé (#FAFAFA).
Elle affiche une carte (card) centrale avec :

  ┌─────────────────────────────────────────────────┐
  │        [ LOGO EDUGOMA 360 — SVG/PNG ]           │
  │   Système de Gestion Scolaire — Goma, RDC        │
  │                                                 │
  │  ┌───────────────────────────────────────────┐  │
  │  │  Email ou Matricule                       │  │
  │  │  [________________________________]       │  │
  │  │                                           │  │
  │  │  Mot de passe              [ 👁 ]         │  │
  │  │  [________________________________]       │  │
  │  │                                           │  │
  │  │  ☐ Se souvenir de moi   Mot de passe ?   │  │
  │  │                                           │  │
  │  │        [ SE CONNECTER ]                   │  │
  │  └───────────────────────────────────────────┘  │
  │                                                 │
  │  Hors-ligne ?  [ Continuer sans connexion ]      │
  │  v1.0 — EduGoma360 © 2025                       │
  └─────────────────────────────────────────────────┘


COMPOSANTS UI À UTILISER (shadcn/ui)
--------------------------------------
- Card, CardContent, CardHeader          → conteneur principal
- Input                                  → champs texte/password
- Button (variant="default")             → bouton connexion (vert primaire)
- Checkbox                               → "Se souvenir de moi"
- Label                                  → labels des champs
- Alert, AlertDescription                → messages d'erreur
- Badge                                  → indicateur statut connexion serveur


COMPORTEMENTS ET ÉTATS À IMPLÉMENTER
--------------------------------------
État 1 — DÉFAUT
  - Bouton "Se connecter" DÉSACTIVÉ si l'un des deux champs est vide
  - Aucun message d'erreur visible
  - Indicateur serveur = vert si online, rouge si offline

État 2 — CHARGEMENT (pendant l'appel API)
  - Bouton affiche un spinner (Loader2 de lucide-react, animate-spin)
  - Les deux champs sont disabled
  - Bouton reste désactivé

État 3 — ERREUR CREDENTIALS
  - Message rouge sous la carte : "Email/matricule ou mot de passe incorrect."
  - Compteur de tentatives : "Tentative 2/3"
  - Les champs restent éditables
  - Focus automatique sur le champ email/matricule

État 4 — VERROUILLAGE (après 3 échecs)
  - Message rouge : "Compte temporairement bloqué. Réessayez dans 15 minutes."
  - Les deux champs et le bouton sont disabled
  - Compte à rebours visible (15:00 → 0:00) mis à jour chaque seconde

État 5 — ERREUR RÉSEAU
  - Toast orange (Sonner ou shadcn/ui toast) : "Serveur inaccessible. Vérifiez votre connexion."
  - Le lien "Continuer sans connexion" devient visible et cliquable

État 6 — MODE HORS-LIGNE ACTIVÉ
  - Bannière jaune en haut : "⚠ Mode hors-ligne — Données locales utilisées"
  - Le lien "Continuer sans connexion" est visible même avant tentative
  - La connexion offline utilise le dernier token Dexie.js valide


CHAMP IDENTIFIANT — LOGIQUE DE DÉTECTION
------------------------------------------
Le champ accepte DEUX formats :
  - Email        → format user@domain.com  (regex standard)
  - Matricule    → format NK-GOM-XXXXX-NNNN (regex : /^[A-Z]{2}-[A-Z]{3}-[A-Z0-9]+-\d+$/i)

Détecter automatiquement le type et envoyer le bon champ à l'API :
  { email: "..." }      si c'est un email
  { matricule: "..." }  si c'est un matricule


APPELS API
-----------
POST /api/auth/login
  Corps : { identifier: string, password: string, rememberMe: boolean }
  Succès 200 :
    {
      token: string,
      refreshToken: string,
      user: {
        id: string,
        role: "SUPER_ADMIN" | "PREFET" | "ECONOME" | "SECRETAIRE" | "ENSEIGNANT" | "PARENT",
        nom: string,
        postNom: string,
        schoolId: string,
        schoolName: string
      }
    }
  Erreur 401 : { error: { code: "INVALID_CREDENTIALS", message: string } }
  Erreur 423 : { error: { code: "ACCOUNT_LOCKED", message: string, unlockAt: string } }

POST /api/auth/refresh
  Corps : { refreshToken: string }
  Succès 200 : { token: string, expiresIn: number }


LOGIQUE POST-CONNEXION (redirection par rôle)
----------------------------------------------
Après connexion réussie, rediriger IMMÉDIATEMENT selon le rôle :
  SUPER_ADMIN  → /dashboard
  PREFET       → /dashboard
  ECONOME      → /finance
  SECRETAIRE   → /students
  ENSEIGNANT   → /attendance/daily
  PARENT       → /parent/home

Si l'URL contient un paramètre ?redirect=/chemin, rediriger vers ce chemin
après connexion (pour les redirections protégées).


STORE ZUSTAND — auth.store.ts
------------------------------
Interface du store à créer :
  interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    loginAttempts: number
    lockedUntil: Date | null

    login: (identifier: string, password: string, rememberMe: boolean) => Promise<void>
    logout: () => void
    refreshToken: () => Promise<void>
    setUser: (user: User) => void
    incrementAttempts: () => void
    resetAttempts: () => void
  }

Règles du store :
  - Le token EST stocké en mémoire (variable JS dans le store)
  - Le refreshToken EST stocké dans un httpOnly cookie (géré par le serveur)
  - Si rememberMe = true → le cookie expire dans 30 jours
  - Si rememberMe = false → le cookie expire à la fermeture du navigateur
  - NE PAS utiliser localStorage pour les tokens (sécurité)
  - Utiliser Dexie.js pour stocker le dernier user offline (clé: "last_user")


HOOK useAuth.ts
----------------
Exporte les fonctions suivantes :
  const { user, isAuthenticated, login, logout, isLoading } = useAuth()


RÈGLES DE VALIDATION (côté client — Zod)
------------------------------------------
const loginSchema = z.object({
  identifier: z.string().min(4, "Minimum 4 caractères"),
  password:   z.string().min(6, "Minimum 6 caractères"),
  rememberMe: z.boolean().default(false)
})

Utiliser react-hook-form + zodResolver pour la gestion du formulaire.


STYLE ET DESIGN
----------------
- Fond de page    : bg-neutral-50 (#FAFAFA)
- Carte           : bg-white, shadow-lg, rounded-2xl, max-w-md, w-full, p-8
- Bouton connect  : bg-[#1B5E20] hover:bg-[#2E7D32] text-white, h-11, w-full, rounded-lg
- Bouton loading  : opacity-70 cursor-not-allowed
- Input focus     : ring-2 ring-[#1B5E20] border-transparent
- Erreur texte    : text-red-600 text-sm
- Logo            : h-16 mx-auto mb-4 (centré)
- Lien MDP oublié : text-[#0D47A1] hover:underline text-sm
- Lien offline    : text-amber-600 text-sm, visible seulement si isOffline = true
- Footer          : text-neutral-400 text-xs text-center mt-6


ROUTE BACKEND À VÉRIFIER
--------------------------
POST /api/auth/login dans auth.routes.ts doit :
  1. Valider le body avec Zod (même schema que le client)
  2. Chercher l'utilisateur par email OU par matricule
  3. Vérifier le mot de passe avec bcrypt.compare()
  4. Vérifier que isActive = true
  5. Générer JWT (payload: { userId, role, schoolId }, expiresIn: '8h')
  6. Générer refreshToken (payload: { userId }, expiresIn: '30d')
  7. Définir le refreshToken en httpOnly cookie (sameSite: 'strict')
  8. Retourner { token, user } (JAMAIS le refreshToken dans le body)
  9. Journaliser la connexion (champ lastLoginAt dans la table users)


TESTS À ÉCRIRE (LoginPage.test.tsx)
-------------------------------------
1. Rendu initial : bouton désactivé si champs vides ✓
2. Activation bouton si les deux champs remplis ✓
3. Affichage spinner pendant le chargement ✓
4. Affichage message erreur si credentials invalides ✓
5. Redirection vers /dashboard si rôle PREFET ✓
6. Redirection vers /finance si rôle ECONOME ✓
7. Affichage lien offline si isOffline = true ✓


DÉFINITION DE "TERMINÉ" (Definition of Done)
---------------------------------------------
[ ] Le composant LoginPage.tsx compile sans erreur TypeScript
[ ] Les 7 états de l'écran sont implémentés et visuellement distincts
[ ] La redirection post-login fonctionne pour chaque rôle
[ ] Le formulaire valide avec Zod avant tout appel API
[ ] Le store Zustand persiste correctement le user et le token
[ ] Le mode offline affiche la bannière et le lien appropriés
[ ] Les 7 tests passent (vitest run)
[ ] Testé sur mobile Chrome (viewport 375px)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 5 — SCR-002 : MOT DE PASSE OUBLIÉ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/auth/ForgotPasswordPage.tsx
Route : /forgot-password
Accès : Public (non authentifié)
Prérequis : SCR-001 doit être terminé (le lien "Mot de passe ?" pointe ici)


OBJECTIF
--------
Crée le composant React de réinitialisation de mot de passe via SMS OTP (SCR-002).
Le flux en 3 étapes est géré dans un seul composant avec un état local de progression.
Adapté à la réalité de Goma : l'utilisateur a un téléphone (Airtel/Vodacom), pas forcément un email.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/auth/ForgotPasswordPage.tsx   ← CRÉER
2. packages/server/src/modules/auth/auth.routes.ts         ← AJOUTER 2 routes
3. packages/server/src/modules/auth/auth.service.ts        ← AJOUTER 2 méthodes


UI — FLUX EN 3 ÉTAPES (dans un seul composant)
------------------------------------------------
Le composant affiche UNE étape à la fois, avec une barre de progression en haut.

  BARRE DE PROGRESSION : [━━━━━━━━●━━━━━━━━━━━━━━━]
                          Étape 1 de 3

ÉTAPE 1 — Saisie du numéro de téléphone
  ┌──────────────────────────────────────────────────┐
  │  📱 Réinitialisation du mot de passe             │
  │                                                  │
  │  Entrez votre numéro de téléphone enregistré     │
  │  [+243 │ _______________________________]        │
  │                                                  │
  │  Opérateurs acceptés : Airtel · Vodacom · Orange │
  │                                                  │
  │  [ Envoyer le code SMS ]                         │
  │                                                  │
  │  ← Retour à la connexion                         │
  └──────────────────────────────────────────────────┘

ÉTAPE 2 — Saisie du code OTP reçu par SMS
  ┌──────────────────────────────────────────────────┐
  │  📩 Code envoyé au +243 81X XXX XXX              │
  │                                                  │
  │  Entrez le code à 6 chiffres reçu par SMS        │
  │                                                  │
  │  [  1  ][  2  ][  3  ][  4  ][  5  ][  6  ]     │
  │  (6 inputs séparés, focus auto sur suivant)      │
  │                                                  │
  │  Code valable : 09:47  (compte à rebours)        │
  │                                                  │
  │  Pas reçu ?  [ Renvoyer le code ] (actif après 60s)
  │                                                  │
  │  [ Vérifier le code ]                            │
  └──────────────────────────────────────────────────┘

ÉTAPE 3 — Nouveau mot de passe
  ┌──────────────────────────────────────────────────┐
  │  🔒 Créez votre nouveau mot de passe             │
  │                                                  │
  │  Nouveau mot de passe         [ 👁 ]             │
  │  [________________________________]              │
  │                                                  │
  │  Confirmer le mot de passe    [ 👁 ]             │
  │  [________________________________]              │
  │                                                  │
  │  Force du mot de passe : [ ████░░ ] Moyen        │
  │  (indicateur coloré dynamique)                   │
  │                                                  │
  │  [ Enregistrer le nouveau mot de passe ]         │
  └──────────────────────────────────────────────────┘

ÉTAPE FINALE — Succès
  ┌──────────────────────────────────────────────────┐
  │  ✅ Mot de passe modifié avec succès !           │
  │                                                  │
  │  Vous pouvez maintenant vous connecter avec      │
  │  votre nouveau mot de passe.                     │
  │                                                  │
  │  [ Aller à la connexion ]  → /login              │
  └──────────────────────────────────────────────────┘


COMPOSANTS UI À UTILISER (shadcn/ui)
--------------------------------------
- Card, CardContent, CardHeader   → conteneur
- Input                           → téléphone, mot de passe
- Button                          → actions
- Progress                        → barre de progression étapes (valeur: 33/66/100)
- Badge                           → compteur OTP restant
- Alert                           → erreurs (code invalide, expiré, etc.)
- Separator                       → séparateur visuel entre étapes


OTP INPUT — COMPOSANT PERSONNALISÉ
------------------------------------
Crée un composant OtpInput.tsx dans packages/client/src/components/shared/ :
  - 6 inputs séparés de type "text" (maxLength=1, inputMode="numeric")
  - Focus automatique sur le suivant à chaque saisie
  - Retour en arrière (Backspace) → revient sur l'input précédent
  - Coller (Ctrl+V) d'un code à 6 chiffres → distribue automatiquement
  - Style : h-12 w-10 text-center text-xl font-bold border-2 rounded-lg
  - Focus : border-[#1B5E20] ring-2 ring-[#1B5E20]/30
  - Rempli : border-[#1B5E20] bg-green-50


VALIDATION DES TÉLÉPHONES CONGOLAIS
-------------------------------------
Opérateurs valides à Goma :
  Airtel   : +24381XXXXXXX ou +24382XXXXXXX (commence par 81 ou 82)
  Vodacom  : +24397XXXXXXX ou +24398XXXXXXX (commence par 97 ou 98)
  Orange   : +24389XXXXXXX (commence par 89)

Regex de validation :
  /^\+243(81|82|97|98|89)\d{7}$/

L'input affiche automatiquement le préfixe "+243" et laisse l'utilisateur
saisir les 9 chiffres restants. Le numéro complet est assemblé avant envoi.


COMPTE À REBOURS OTP
---------------------
- Durée de validité : 10 minutes (600 secondes)
- Affiché format MM:SS (ex: "09:47")
- Couleur : vert si > 3 min, orange si 1-3 min, rouge si < 1 min
- À 0:00 → afficher "Code expiré. Demandez un nouveau code."
- Bouton "Renvoyer le code" : désactivé les 60 premières secondes,
  puis affiche "(disponible dans Xs)" jusqu'à activation


INDICATEUR DE FORCE DU MOT DE PASSE
--------------------------------------
Calculer la force en temps réel sur l'étape 3 :
  Faible (rouge)  → longueur < 8 OU que des minuscules
  Moyen (orange)  → longueur >= 8 ET majuscule OU chiffre
  Fort (vert)     → longueur >= 10 ET majuscule ET chiffre ET caractère spécial

Afficher une barre colorée (4 segments) + label textuel.


APPELS API
-----------
POST /api/auth/forgot-password
  Corps : { phone: string }  (format +243XXXXXXXXX)
  Succès 200 : { success: true, expiresIn: 600, maskedPhone: "+243 81X XXX XXX" }
  Erreur 404 : { error: { code: "PHONE_NOT_FOUND", message: "Aucun compte trouvé avec ce numéro" } }
  Erreur 429 : { error: { code: "TOO_MANY_REQUESTS", message: "Trop de tentatives. Attendez 5 minutes." } }

POST /api/auth/verify-otp
  Corps : { phone: string, otp: string }
  Succès 200 : { success: true, resetToken: string }  (token à usage unique, 10 min)
  Erreur 400 : { error: { code: "INVALID_OTP", message: "Code incorrect" } }
  Erreur 410 : { error: { code: "OTP_EXPIRED", message: "Code expiré. Demandez-en un nouveau." } }

POST /api/auth/reset-password
  Corps : { resetToken: string, newPassword: string }
  Succès 200 : { success: true, message: "Mot de passe modifié avec succès" }
  Erreur 400 : { error: { code: "WEAK_PASSWORD", message: "Mot de passe trop faible" } }
  Erreur 401 : { error: { code: "INVALID_RESET_TOKEN", message: "Session expirée" } }


BACKEND — LOGIQUE SMS OTP
--------------------------
Dans auth.service.ts, ajouter :

sendOtp(phone: string):
  1. Vérifier que le téléphone existe en base (table users, champ phone)
  2. Générer un OTP à 6 chiffres aléatoires (crypto.randomInt(100000, 999999))
  3. Stocker en base : table otp_tokens { phone, otp_hash, expires_at, used }
     - Hasher l'OTP avec bcrypt avant stockage (ne jamais stocker en clair)
     - expires_at = maintenant + 10 minutes
  4. Envoyer le SMS via Africa's Talking :
     Message FR : "EduGoma360: Votre code de réinitialisation est {OTP}. Valable 10 minutes."
     Message SW : "EduGoma360: Nambari yako ya kufungua ni {OTP}. Itaisha dakika 10."
  5. Logger dans sms_logs (table existante)

verifyOtp(phone: string, otp: string):
  1. Trouver le dernier OTP non utilisé pour ce téléphone
  2. Vérifier expires_at > now()
  3. Vérifier bcrypt.compare(otp, otp_hash)
  4. Marquer l'OTP comme utilisé (used = true)
  5. Générer un resetToken JWT (expiresIn: '10m', payload: { phone, purpose: 'reset' })
  6. Retourner le resetToken

IMPORTANT : Ajouter le modèle OtpToken dans le schéma Prisma :
  model OtpToken {
    id        String   @id @default(uuid())
    phone     String
    otpHash   String
    expiresAt DateTime
    used      Boolean  @default(false)
    createdAt DateTime @default(now())
    @@map("otp_tokens")
  }


GESTION D'ÉTAT LOCAL (useState dans le composant)
---------------------------------------------------
type Step = 'phone' | 'otp' | 'password' | 'success'

interface ForgotPasswordState {
  step: Step
  phone: string
  otpValue: string[]      // tableau de 6 strings
  resetToken: string
  isLoading: boolean
  error: string | null
  resendCountdown: number  // secondes avant pouvoir renvoyer
  otpCountdown: number     // secondes avant expiration OTP
}


RÈGLES DE VALIDATION (Zod)
----------------------------
phoneSchema    : z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/, "Numéro congolais invalide")
otpSchema      : z.string().length(6, "Le code doit contenir 6 chiffres").regex(/^\d{6}$/)
passwordSchema : z.string().min(8, "Minimum 8 caractères")
confirmSchema  : mêmes règles + vérification que les deux mots de passe sont identiques


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Les 3 étapes + écran succès s'affichent correctement en séquence
[ ] L'OTP input reçoit le focus automatiquement et gère le coller
[ ] Le compte à rebours OTP fonctionne (10 min) et change de couleur
[ ] Le compte à rebours "Renvoyer" fonctionne (60 sec)
[ ] L'indicateur de force du mot de passe est dynamique
[ ] Les 3 appels API sont branchés avec gestion d'erreurs
[ ] Le backend envoie un vrai SMS via Africa's Talking (sandbox)
[ ] Le modèle OtpToken est ajouté au schéma Prisma et migré
[ ] Testé sur mobile Chrome (viewport 375px)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 5 — SCR-003 : TABLEAU DE BORD PRINCIPAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/dashboard/DashboardPage.tsx
Route : /dashboard
Accès : Authentifié — Rôle minimum : ENSEIGNANT
Prérequis : SCR-001 terminé (auth + layout AppLayout.tsx doivent exister)


OBJECTIF
--------
Crée le tableau de bord principal adaptatif (SCR-003).
Le contenu s'adapte automatiquement selon le rôle de l'utilisateur connecté.
Les données se rafraîchissent automatiquement (polling) sans rechargement de page.
La mise en page fonctionne sur mobile (1 colonne) et desktop (2-3 colonnes).


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/dashboard/DashboardPage.tsx         ← CRÉER
2. packages/client/src/components/dashboard/StatCard.tsx         ← CRÉER
3. packages/client/src/components/dashboard/AlertsPanel.tsx      ← CRÉER
4. packages/client/src/components/dashboard/CalendarPanel.tsx    ← CRÉER
5. packages/client/src/components/dashboard/ChartAverages.tsx    ← CRÉER
6. packages/client/src/components/dashboard/ChartFinance.tsx     ← CRÉER
7. packages/client/src/components/dashboard/QuickActions.tsx     ← CRÉER
8. packages/client/src/components/layout/AppLayout.tsx           ← CRÉER (si absent)
9. packages/client/src/components/layout/Sidebar.tsx             ← CRÉER (si absent)
10. packages/client/src/components/layout/OfflineBanner.tsx      ← CRÉER (si absent)
11. packages/server/src/modules/stats/stats.routes.ts            ← CRÉER
12. packages/server/src/modules/stats/stats.controller.ts        ← CRÉER
13. packages/server/src/modules/stats/stats.service.ts           ← CRÉER


LAYOUT GÉNÉRAL (AppLayout.tsx)
--------------------------------
Structure HTML globale de toutes les pages authentifiées :

  ┌────────────────────────────────────────────────────────┐
  │ [OFFLINE BANNER — si hors ligne ou sync > 5 min]       │
  ├──────────┬─────────────────────────────────────────────┤
  │          │  [HEADER : nom école | 🔔 | 👤 | ⚙]        │
  │ SIDEBAR  ├─────────────────────────────────────────────┤
  │ (240px   │                                             │
  │ desktop  │           CONTENU DE LA PAGE               │
  │  / menu  │           (children)                        │
  │  burger  │                                             │
  │  mobile) │                                             │
  └──────────┴─────────────────────────────────────────────┘

Sidebar (Sidebar.tsx) — items de navigation selon le rôle :
  🏠 Dashboard       → /dashboard        (tous les rôles)
  👥 Élèves          → /students         (SECRETAIRE+)
  📚 Académique      → /grades           (ENSEIGNANT+)
  👨‍🏫 Enseignants    → /teachers         (PREFET+)
  💰 Finances        → /finance          (ECONOME+)
  📅 Présences       → /attendance/daily (ENSEIGNANT+)
  📲 Communication   → /sms/send         (PREFET+)
  📊 Rapports        → /reports          (PREFET+)
  ⚙ Paramètres      → /settings         (SUPER_ADMIN+)

  Masquer les items inaccessibles au rôle (ne pas juste les désactiver).
  Item actif : fond vert clair + texte vert foncé + barre gauche verte.


OFFLINE BANNER (OfflineBanner.tsx)
------------------------------------
Composant fixe en haut de page (z-50), hauteur 36px.
Visible seulement si isOffline = true OU lastSync > 5 minutes.

  Mode hors-ligne :
    Fond amber-500, texte blanc
    "⚠  Mode hors-ligne · X actions en attente de synchronisation  [Sync maintenant]"

  Connexion restaurée (pendant 3 secondes) :
    Fond green-600, texte blanc
    "✓  Connexion restaurée · Synchronisation en cours..."
    Puis disparaît avec animation fadeOut.


TABLEAU DE BORD — WIDGETS PAR RÔLE
-------------------------------------
Afficher les widgets selon ce tableau :

  ┌──────────────────┬──────────────────────────────────────────────┐
  │ RÔLE             │ WIDGETS AFFICHÉS                             │
  ├──────────────────┼──────────────────────────────────────────────┤
  │ PREFET / ADMIN   │ StatCard×3 + AlertsPanel + CalendarPanel +   │
  │                  │ ChartAverages + ChartFinance + QuickActions   │
  ├──────────────────┼──────────────────────────────────────────────┤
  │ ECONOME          │ StatCard×3 (finances) + Top5Debiteurs +      │
  │                  │ ChartFinance + QuickActions                   │
  ├──────────────────┼──────────────────────────────────────────────┤
  │ SECRETAIRE       │ StatCard×3 (académique) + AlertsPanel +      │
  │                  │ QuickActions                                  │
  ├──────────────────┼──────────────────────────────────────────────┤
  │ ENSEIGNANT       │ StatCard×2 (mes classes, présence) +         │
  │                  │ CalendarPanel (emploi du temps du jour)       │
  └──────────────────┴──────────────────────────────────────────────┘


COMPOSANT StatCard.tsx
------------------------
Props :
  interface StatCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: LucideIcon
    iconColor?: string
    trend?: { value: number; label: string; positive: boolean }
    isLoading?: boolean
    onClick?: () => void
    href?: string       // si défini, la carte est cliquable → navigation
  }

Apparence :
  - Carte blanche, shadow-sm, rounded-xl, p-5
  - Icône à gauche (taille 40px, fond coloré arrondi)
  - Titre en text-neutral-500 text-sm
  - Valeur en text-2xl font-bold text-neutral-900
  - Trend : flèche ↑ (vert) ou ↓ (rouge) + texte "+12% vs mois dernier"
  - Si isLoading : skeleton loader (pulsation grise) à la place des données
  - Si onClick ou href : hover:shadow-md cursor-pointer transition

Exemples de StatCards par rôle (PREFET) :
  Card 1 : 👥 "Élèves inscrits"  | 847  | "actifs cette année" → /students
  Card 2 : 📅 "Présence du jour" | 91%  | "32/35 élèves"      → /attendance
  Card 3 : 💰 "Frais collectés"  | 2.4M FC | "sur 3.2M attendus" → /finance


COMPOSANT AlertsPanel.tsx
---------------------------
Props :
  interface Alert {
    id: string
    type: 'error' | 'warning' | 'info'
    message: string
    href: string   // URL vers l'écran concerné
    createdAt: string
  }

Apparence :
  - Titre "Alertes" avec badge compteur rouge (si > 0)
  - Chaque alerte : icône colorée + message + lien "→ Voir"
  - Types :
    error   → icône 🔴 AlertCircle rouge   → "12 élèves sans note en Chimie (4ScA)"
    warning → icône 🟡 AlertTriangle jaune → "Classe 4ScB : appel non fait aujourd'hui"
    info    → icône 🔵 Info bleue          → "Délibération T2 dans 3 jours"
  - Si aucune alerte : empty state "✅ Aucune alerte en cours"
  - Clic sur une alerte → navigation vers href


COMPOSANT CalendarPanel.tsx
-----------------------------
Affiche les 5 prochains événements du calendrier scolaire :
  - Date + Libellé de l'événement + Badge type (Examen / Vacances / Délibération / Réunion)
  - Événement du jour : fond vert clair + texte en gras
  - Si vide : "Aucun événement à venir"


COMPOSANT ChartAverages.tsx
-----------------------------
Graphique en barres horizontales (Recharts) :
  - X : moyenne générale de la classe (0 à 20)
  - Y : nom de chaque classe (ex: 4ScA, 4ScB, 5PédA...)
  - Couleur barre : vert si ≥ 12, orange si 10-12, rouge si < 10
  - Ligne verticale de référence à 10/20 (seuil de passage)
  - Tooltip : "4ScA — Moyenne : 13.4/20 — 35 élèves"
  - Si données vides : skeleton loader


COMPOSANT ChartFinance.tsx
----------------------------
Graphique en courbe (Recharts LineChart) :
  - X : 6 derniers mois (ex: Sep | Oct | Nov | Déc | Jan | Fév)
  - Y : montant en FC (formaté : "1.2M", "450K")
  - 2 lignes : "Attendu" (gris pointillé) et "Collecté" (vert plein)
  - Remplissage (fill) sous la courbe "Collecté" en vert semi-transparent
  - Tooltip : "Février — Attendu: 3.2M FC — Collecté: 2.4M FC (75%)"


COMPOSANT QuickActions.tsx
----------------------------
Grille de raccourcis (4 boutons maximum) selon le rôle :

  PREFET / SECRETAIRE :
    [+ Inscrire un élève]    → /students/new
    [Saisir des notes]       → /grades/entry
    [Générer les bulletins]  → /bulletin/generate
    [Envoyer un SMS]         → /sms/send

  ECONOME :
    [Enregistrer un paiement] → /finance/payment/new
    [Voir les créances]       → /finance/debts
    [Exporter rapport]        → /finance/report

  ENSEIGNANT :
    [Faire l'appel]           → /attendance/daily
    [Saisir mes notes]        → /grades/entry


APPELS API (TanStack Query)
-----------------------------
Utiliser useQuery avec refetchInterval pour le polling automatique :

  // Statistiques générales
  useQuery({
    queryKey: ['stats', 'enrollment'],
    queryFn: () => api.get('/api/stats/enrollment'),
    refetchInterval: 5 * 60 * 1000,  // 5 minutes
    staleTime: 4 * 60 * 1000,
  })

  // Taux de présence du jour
  useQuery({
    queryKey: ['stats', 'attendance-today'],
    queryFn: () => api.get('/api/attendance/today-rate'),
    refetchInterval: 60 * 1000,  // 1 minute
  })

  // Résumé financier mensuel
  useQuery({
    queryKey: ['finance', 'monthly-summary'],
    queryFn: () => api.get('/api/finance/monthly-summary'),
    refetchInterval: 5 * 60 * 1000,
  })

  // Alertes ouvertes
  useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get('/api/alerts?status=open'),
    refetchInterval: 2 * 60 * 1000,  // 2 minutes
  })

  // Événements calendrier
  useQuery({
    queryKey: ['calendar', 'upcoming'],
    queryFn: () => api.get('/api/calendar/upcoming'),
    refetchInterval: 30 * 60 * 1000,  // 30 minutes
  })

  // Moyennes par classe
  useQuery({
    queryKey: ['stats', 'class-averages'],
    queryFn: () => api.get('/api/stats/class-averages'),
    refetchInterval: 30 * 60 * 1000,
  })

  // Graphique recouvrement financier
  useQuery({
    queryKey: ['finance', 'recovery-chart'],
    queryFn: () => api.get('/api/finance/recovery-chart'),
    refetchInterval: 60 * 60 * 1000,  // 60 minutes
  })


BACKEND — ENDPOINTS À CRÉER (stats.service.ts)
------------------------------------------------
GET /api/stats/enrollment
  → SELECT COUNT(*) FROM students WHERE schoolId = :sid AND isActive = true
  → Retourne : { total: number, bySection: Record<string, number> }

GET /api/attendance/today-rate
  → Calculer taux présence du jour pour toutes les classes actives
  → Retourne : { rate: number, present: number, total: number }

GET /api/finance/monthly-summary
  → Somme des amountDue vs amountPaid du mois en cours
  → Retourne : { expected: number, collected: number, currency: "FC" }

GET /api/alerts?status=open
  → Agréger les alertes depuis plusieurs tables :
    - Élèves avec paiement en retard > 30 jours
    - Classes avec notes manquantes (évaluations non saisies)
    - Appels non faits aujourd'hui
  → Retourne : { alerts: Alert[], total: number }

GET /api/calendar/upcoming
  → Requête sur la table terms et une future table calendar_events
  → Retourne les 5 prochains événements
  → Retourne : { events: CalendarEvent[] }

GET /api/stats/class-averages
  → Calculer la moyenne générale de chaque classe pour le trimestre actif
  → Retourne : { averages: { classId, className, average, studentCount }[] }

GET /api/finance/recovery-chart
  → Agréger les paiements des 6 derniers mois
  → Retourne : { months: { label, expected, collected }[] }


MISE EN PAGE RESPONSIVE
------------------------
Mobile (< 768px) :
  - StatCards : grille 1 colonne (full width)
  - AlertsPanel + CalendarPanel : stacking vertical
  - Graphiques : dans des accordions (Accordion shadcn/ui) pour économiser l'espace
  - QuickActions : grille 2 colonnes
  - Sidebar : masquée, accessible via bouton hamburger dans le header

Desktop (>= 768px) :
  - StatCards : grille 3 colonnes
  - AlertsPanel + CalendarPanel : côte à côte (2 colonnes)
  - Graphiques : côte à côte (2 colonnes)
  - QuickActions : ligne horizontale en bas


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Le dashboard s'affiche pour chaque rôle avec les bons widgets
[ ] Les StatCards affichent le skeleton loader pendant le chargement
[ ] Le polling fonctionne (inspecter le réseau → requêtes régulières)
[ ] La bannière offline s'affiche si navigator.onLine = false
[ ] Les graphiques s'affichent avec Recharts (pas d'erreur de rendu)
[ ] La Sidebar masque les items inaccessibles selon le rôle
[ ] Le clic sur une StatCard navigue vers le bon écran
[ ] Le clic sur une alerte navigue vers l'écran concerné
[ ] Le layout est correct sur mobile 375px ET desktop 1280px
[ ] Les 7 endpoints backend répondent en < 500ms
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4 / 5 — SCR-005 : LISTE DES ÉLÈVES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/students/StudentsListPage.tsx
Route : /students
Accès : Authentifié — Rôle minimum : SECRETAIRE
Prérequis : SCR-001 et SCR-003 terminés (AppLayout, Sidebar, auth fonctionnels)


OBJECTIF
--------
Crée la page de liste et de gestion des élèves (SCR-005).
C'est le point d'entrée principal du module Élèves.
Elle doit gérer des centaines d'élèves avec filtres, recherche rapide,
sélection multiple et actions groupées.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/students/StudentsListPage.tsx        ← CRÉER
2. packages/client/src/components/students/StudentRow.tsx         ← CRÉER
3. packages/client/src/components/students/StudentFilters.tsx     ← CRÉER
4. packages/client/src/components/students/BulkActionsBar.tsx     ← CRÉER
5. packages/client/src/components/students/ImportModal.tsx        ← CRÉER
6. packages/client/src/hooks/useStudents.ts                       ← CRÉER
7. packages/server/src/modules/students/students.routes.ts        ← VÉRIFIER
8. packages/server/src/modules/students/students.controller.ts    ← VÉRIFIER
9. packages/server/src/modules/students/students.service.ts       ← VÉRIFIER


UI — STRUCTURE DE LA PAGE
--------------------------
  ┌─────────────────────────────────────────────────────────────────┐
  │ GESTION DES ÉLÈVES                  [+ Inscrire]  [↑ Importer] │
  ├─────────────────────────────────────────────────────────────────┤
  │ [Classe ▼] [Section ▼] [Statut ▼]  [🔍 Rechercher par nom...] │
  ├─────────────────────────────────────────────────────────────────┤
  │ ☐ | Photo | Matricule  | Nom Complet        | Classe | Statut |⋮│
  ├─────────────────────────────────────────────────────────────────┤
  │ ☐ | 👤   | NK-0234   | AMISI Jean-Baptiste | 4ScA   | Actif  |…│
  │ ☐ | 👤   | NK-0235   | BAHATI Marie-Claire | 5PédB  | Actif  |…│
  │ ☐ | 👤   | NK-0236   | CIZA Pierre         | TC-1A  |⚠ Retard|…│
  │ ☐ | 👤   | NK-0237   | DUSABE Alice        | 4ScA   | Actif  |…│
  │                          ...                                     │
  ├─────────────────────────────────────────────────────────────────┤
  │ Total : 847 élèves     │  Affichage : 25/page  < 1 2 3...34 >  │
  └─────────────────────────────────────────────────────────────────┘

  [BARRE D'ACTIONS GROUPÉES — visible seulement si ≥ 1 sélectionné]
  ┌────────────────────────────────────────────────────────────────┐
  │ 3 élèves sélectionnés  [Exporter] [Imprimer liste] [Archiver] │
  └────────────────────────────────────────────────────────────────┘


COMPOSANT StudentFilters.tsx
------------------------------
Filtres actifs en permanence au-dessus du tableau :

  1. Filtre "Classe" (Select)
     Options dynamiques : GET /api/classes?active=true
     Format : "4ème Scientifique A" → valeur : classId (UUID)
     Option par défaut : "Toutes les classes"

  2. Filtre "Section" (Select)
     Options statiques :
       Tronc Commun | Scientifique | Commerciale | Pédagogique | Technique | Littéraire
     Option par défaut : "Toutes les sections"

  3. Filtre "Statut" (Select)
     Options : Actif | Redoublant | Transféré | Déplacé | Archivé | Tous
     Option par défaut : "Actif" (par défaut, ne pas afficher les archivés)

  4. Barre de recherche (Input)
     Placeholder : "Rechercher par nom, post-nom ou matricule..."
     Comportement : debounce 300ms avant de déclencher la requête API
     Insensible à la casse et aux accents (ex: "amisi" = "AMISI" = "Amisi")
     Effacer avec bouton ✕ qui apparaît si la barre n'est pas vide

Quand un filtre change → réinitialiser la pagination à la page 1.
URL params : synchroniser les filtres avec l'URL (?class=uuid&section=SC&status=ACTIF&q=amisi&page=2)
pour permettre le partage de liens et le retour arrière navigateur.


COMPOSANT StudentRow.tsx
--------------------------
Props :
  interface StudentRowProps {
    student: Student
    isSelected: boolean
    onSelect: (id: string, checked: boolean) => void
    onAction: (action: 'view' | 'edit' | 'card' | 'transfer' | 'archive', id: string) => void
  }

Colonnes du tableau :
  ☐           Checkbox de sélection (onClick stopPropagation)
  Photo       Avatar 36px (photoUrl ou initiales NOM sur fond coloré si pas de photo)
  Matricule   Texte mono, badge discret (font-mono text-xs)
  Nom Complet Ordre congolais : "NOM POSTNOM Prénom" (NOM en majuscules, gras)
  Classe      Badge vert arrondi (ex: "4ScA")
  Statut      Badge coloré :
                Actif      → badge vert
                Redoublant → badge orange + icône "R"
                Transféré  → badge bleu
                Déplacé    → badge violet
                Archivé    → badge gris (row entière en opacity-50)
              + Si paiement en retard → icône ⚠ orange supplémentaire
  ⋮           Menu contextuel (DropdownMenu shadcn/ui) :
                👁 Voir la fiche        → /students/:id
                ✏ Modifier              → /students/:id/edit
                🪪 Imprimer carte       → /students/:id/card
                ↗ Transférer            → modal de transfert
                🗃 Archiver             → modal de confirmation

Clic sur la ligne (hors checkbox et menu) → naviguer vers /students/:id


HOOK useStudents.ts
--------------------
Encapsule toute la logique de fetch et de filtre :

  function useStudents(filters: StudentFilters) {
    // TanStack Query avec paramètres de filtre
    const query = useQuery({
      queryKey: ['students', filters],
      queryFn: () => api.get('/api/students', { params: filters }),
      keepPreviousData: true,  // Évite le flash lors du changement de page
      staleTime: 2 * 60 * 1000,
    })

    // Mutation pour archiver
    const archiveMutation = useMutation({
      mutationFn: (id: string) => api.delete('/api/students/' + id),
      onSuccess: () => queryClient.invalidateQueries(['students'])
    })

    return { ...query, archiveMutation }
  }


SÉLECTION MULTIPLE — BulkActionsBar.tsx
-----------------------------------------
État géré dans le composant parent StudentsListPage :
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  Sélectionner tout (checkbox en-tête) :
    - Si aucun ou partiel → cocher tous les éléments de la PAGE courante
    - Si tous cochés → tout décocher
    - État "indéterminé" (tiret) si certains cochés mais pas tous

  Barre d'actions groupées (BulkActionsBar.tsx) :
    Visible si selectedIds.size > 0 avec animation slide-in depuis le bas
    Affiche : "{N} élève(s) sélectionné(s)"
    Boutons :
      [Exporter Excel]   → GET /api/students/export?ids=id1,id2,...
      [Imprimer liste]   → ouvre fenêtre d'impression avec la liste filtrée
      [Archiver]         → modal de confirmation → PATCH /api/students/batch-archive


PAGINATION
-----------
- 25 élèves par page (desktop) / 10 par page (mobile)
- Composant Pagination de shadcn/ui
- Affiche toujours : "< Précédent  1 2 3 ... 34  Suivant >"
- Sur mobile : "< Page 2/34 >"
- keepPreviousData = true pour éviter le flash entre pages


IMPORT EXCEL — ImportModal.tsx
--------------------------------
Modal déclenché par le bouton "↑ Importer" :

  Étape 1 — Upload
    Zone de drop (drag & drop) OU bouton "Parcourir"
    Formats acceptés : .xlsx, .xls, .csv
    Taille max : 5MB
    Bouton "Télécharger le modèle" → GET /api/students/import-template

  Étape 2 — Prévisualisation (après parsing côté client avec SheetJS)
    Tableau des 5 premières lignes du fichier
    Correspondance colonnes : matricule | nom | postNom | classe | etc.
    Erreurs détectées : "Ligne 3 : colonne 'classe' invalide (4ScX inconnu)"
    Compte : "X lignes valides · Y erreurs"

  Étape 3 — Confirmation
    Résumé : "Importer 45 élèves dans la classe 4ScA ?"
    Bouton "Lancer l'import" → POST /api/students/import (multipart/form-data)

  Étape 4 — Résultat
    "45 élèves importés · 3 ignorés (doublons)"
    Bouton "Fermer et actualiser"


APPELS API
-----------
GET /api/students
  Paramètres query :
    classId   ?: string       (UUID de la classe)
    section   ?: string       (code section : SC, HCG, PEDA, HT, LIT, TC)
    status    ?: StudentStatus (NOUVEAU, REDOUBLANT, TRANSFERE, DEPLACE, ARCHIVE)
    q         ?: string       (recherche textuelle)
    page      ?: number       (défaut: 1)
    limit     ?: number       (défaut: 25)
  Réponse 200 :
    {
      data: Student[],
      total: number,
      page: number,
      pages: number,
      limit: number
    }

GET /api/students/export
  Paramètres query : (mêmes filtres que la liste + ids?: string)
  Réponse : fichier .xlsx binaire (Content-Type: application/vnd.openxmlformats...)
  Nom fichier : "eleves-{classe}-{date}.xlsx"

GET /api/students/import-template
  Réponse : fichier .xlsx modèle vide avec en-têtes officielles
  Colonnes : matricule | nom | postNom | prenom | sexe | dateNaissance |
             lieuNaissance | classe | statut | nomPere | telPere | nomMere | telMere

POST /api/students/import
  Corps : multipart/form-data { file: File }
  Réponse : { imported: number, skipped: number, errors: ImportError[] }

PATCH /api/students/batch-archive
  Corps : { ids: string[], reason: string }
  Réponse : { archived: number }

DELETE /api/students/:id
  Corps : { reason: string }
  Réponse : { success: true }


BACKEND — students.service.ts
-------------------------------
findMany(filters: StudentFilters, schoolId: string):
  Requête Prisma avec WHERE dynamique selon les filtres.
  Inclure : enrollments (pour la classe courante), _count (pour le total).
  Utiliser prisma.$transaction pour la pagination (count + findMany).

exportToExcel(filters: StudentFilters, schoolId: string):
  Utiliser ExcelJS pour générer le fichier.
  Colonnes selon le format officiel EDU-NC.
  Formatage : en-têtes en gras, colonnes auto-width.

importFromExcel(buffer: Buffer, schoolId: string):
  Parser avec ExcelJS.
  Valider chaque ligne avec Zod.
  Upsert par matricule (créer si absent, ignorer si existant).
  Retourner le rapport d'import.


FORMATAGE DES NOMS CONGOLAIS
------------------------------
RÈGLE ABSOLUE : Afficher dans l'ordre NOM POSTNOM Prénom
  - NOM      : MAJUSCULES (text-transform: uppercase OU .toUpperCase() en JS)
  - POSTNOM  : MAJUSCULES
  - Prénom   : Première lettre majuscule seulement
  Exemple : "AMISI KALOMBO Jean-Baptiste"

Fonction utilitaire à créer dans packages/shared/src/utils/names.ts :
  function formatStudentName(nom: string, postNom: string, prenom?: string): string {
    return [nom.toUpperCase(), postNom.toUpperCase(), prenom].filter(Boolean).join(' ')
  }

Fonction pour les avatars (initiales) :
  function getInitials(nom: string, postNom: string): string {
    return (nom[0] + postNom[0]).toUpperCase()
  }


ÉTAT VIDE (Empty State)
------------------------
Si aucun résultat après filtrage :
  Icône Users grisée (lucide-react)
  "Aucun élève trouvé"
  Si filtres actifs : "Modifiez vos filtres pour voir plus de résultats"
  Si aucun filtre : "Aucun élève inscrit cette année. Commencez par inscrire un élève."
  Bouton "Inscrire le premier élève" → /students/new


DÉFINITION DE "TERMINÉ"
------------------------
[ ] La liste s'affiche avec les données réelles de la base (seed)
[ ] Les 4 filtres fonctionnent et se synchronisent avec l'URL
[ ] La recherche fonctionne avec debounce (vérifiable dans Network tab)
[ ] La sélection multiple et la barre d'actions groupées fonctionnent
[ ] La pagination affiche correctement et garde les données précédentes
[ ] L'import Excel fonctionne (tester avec le template téléchargé)
[ ] L'export Excel génère un fichier valide
[ ] Les noms sont affichés dans l'ordre congolais (NOM POSTNOM Prénom)
[ ] L'état vide s'affiche quand aucun résultat
[ ] La page est responsive (375px mobile et 1280px desktop)
[ ] Le menu contextuel (⋮) fonctionne sur mobile (tap) et desktop (hover)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 5 / 5 — SCR-006 : FICHE DÉTAIL ÉLÈVE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet : EduGoma 360
Fichier cible : packages/client/src/pages/students/StudentDetailPage.tsx
Route : /students/:id
Accès : Authentifié — Rôle minimum : SECRETAIRE
Prérequis : SCR-005 terminé (liste élèves et StudentFilters fonctionnels)


OBJECTIF
--------
Crée la fiche détail complète d'un élève (SCR-006).
C'est un écran à onglets : chaque onglet charge ses données indépendamment.
L'en-tête avec la photo et les infos principales reste fixe quel que soit l'onglet actif.


FICHIERS À CRÉER OU MODIFIER
------------------------------
1. packages/client/src/pages/students/StudentDetailPage.tsx        ← CRÉER
2. packages/client/src/components/students/tabs/InfoTab.tsx        ← CRÉER
3. packages/client/src/components/students/tabs/ScolariteTab.tsx   ← CRÉER
4. packages/client/src/components/students/tabs/GradesTab.tsx      ← CRÉER
5. packages/client/src/components/students/tabs/AttendanceTab.tsx  ← CRÉER
6. packages/client/src/components/students/tabs/PaymentsTab.tsx    ← CRÉER
7. packages/client/src/components/students/StudentHeader.tsx       ← CRÉER
8. packages/client/src/components/students/ActionMenu.tsx          ← CRÉER
9. packages/server/src/modules/students/students.routes.ts         ← AJOUTER routes détail


UI — STRUCTURE GÉNÉRALE DE LA PAGE
-------------------------------------
  ┌──────────────────────────────────────────────────────────────┐
  │ ← Retour à la liste     [Modifier]  [Imprimer carte]  [⋮]   │
  ├──────────────────────────────────────────────────────────────┤
  │ [PHOTO]  AMISI KALOMBO Jean-Baptiste                         │
  │ 80×80px  Matricule : NK-GOM-ISS001-0234                     │
  │ rounded  4ème Scientifique A  |  Badge: Actif                │
  │          📞 +243 81 000 0000 (père)                          │
  ├──────────────────────────────────────────────────────────────┤
  │ [Infos] [Scolarité] [Notes] [Présences] [Paiements]          │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │         CONTENU DE L'ONGLET ACTIF                            │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘


COMPOSANT StudentHeader.tsx
-----------------------------
Props : { student: Student }

Affiche en permanence au sommet de la page :
  - Photo : 80×80px, rounded-full, border-2 vert primaire
    → Si pas de photo : avatar initiales (NOM[0]+POSTNOM[0]) sur fond vert
    → Clic sur la photo (rôle SECRETAIRE+) → ouvre un modal de remplacement de photo
  - Nom complet : format congolais "NOM POSTNOM Prénom" en text-2xl font-bold
  - Matricule : font-mono text-sm text-neutral-500
  - Classe + Section : Badge vert (ex: "4ScA") + texte "4ème Scientifique A"
  - Badge statut (Actif / Redoublant / Archivé) avec couleur appropriée
  - Téléphone principal du tuteur : icône Phone + numéro cliquable (tel:...)
  - Si paiement en retard → badge rouge "⚠ Solde dû" avec montant


COMPOSANT ActionMenu.tsx
--------------------------
Bouton "⋮" (DropdownMenu) en haut à droite de la page :
  ✏  Modifier la fiche          → /students/:id/edit
  🖨  Imprimer attestation       → GET /api/students/:id/attestation (PDF)
  🪪  Générer carte d'élève      → GET /api/students/:id/card (PDF)
  ↗   Transférer                 → Modal de transfert d'école
  📱  Envoyer un SMS             → Modal SMS pré-rempli
  🗃  Archiver                   → Modal de confirmation

Chaque action qui génère un PDF ouvre le PDF dans un nouvel onglet navigateur.
Le modal SMS pré-remplit le numéro du tuteur et propose des templates FR/SW.


ONGLET 1 — "Infos Personnelles" (InfoTab.tsx)
-----------------------------------------------
Chargement : données disponibles depuis le StudentHeader (pas de requête supplémentaire).
Afficher en grille 2 colonnes (1 colonne sur mobile) :

  SECTION "Identité"
    Date de naissance    : 12/03/2008 (calculer âge : "16 ans")
    Lieu de naissance    : Goma, Nord-Kivu
    Sexe                 : Masculin / Féminin
    Nationalité          : Congolaise
    Statut               : Nouveau / Redoublant / Transféré / Déplacé

  SECTION "Contacts Famille"
    ┌──────────────────────────┬──────────────────────────┐
    │ PÈRE                     │ MÈRE                     │
    │ AMISI PIERRE             │ KAHINDO ALICE            │
    │ +243 810 000 000  📞     │ +243 820 000 000  📞     │
    │ [Appeler] [SMS]          │ [Appeler] [SMS]          │
    └──────────────────────────┴──────────────────────────┘
    Tuteur légal : [si différent]

  Les boutons [Appeler] et [SMS] sur mobile déclenchent tel: et sms: respectivement.
  Les numéros sont cliquables (liens <a href="tel:...">).


ONGLET 2 — "Scolarité" (ScolariteTab.tsx)
-------------------------------------------
Chargement : GET /api/students/:id/academic-history

Afficher :
  1. École d'origine et résultat TENASOSP (si applicable)
  2. Tableau "Historique scolaire" :
     ┌──────────────┬──────────┬───────────┬──────────────────┐
     │ Année        │ Classe   │ Résultat  │ Moyenne générale │
     ├──────────────┼──────────┼───────────┼──────────────────┤
     │ 2024-2025    │ 4ScA     │ En cours  │ 13.4/20          │
     │ 2023-2024    │ 3ScB     │ Admis     │ 14.2/20          │
     │ 2022-2023    │ 2ème TC  │ Admis     │ 12.8/20 (TENASOSP) │
     └──────────────┴──────────┴───────────┴──────────────────┘

  3. Si la ligne "En cours" est cliquée → naviguer vers l'onglet Notes


ONGLET 3 — "Notes" (GradesTab.tsx)
-------------------------------------
Chargement : GET /api/grades?studentId=:id&termId=:currentTermId

Sélecteur de trimestre en haut : [T1 ▼] [T2 ▼] [T3 ▼]
Quand le trimestre change → recharger les notes via TanStack Query.

Tableau des matières pour le trimestre sélectionné :
  ┌────────────────────┬───────┬───────┬────┬─────────┬─────────┬──────┐
  │ Matière            │ Coeff │ Inter │ TP │ Examen  │ Moyenne │ Rang │
  ├────────────────────┼───────┼───────┼────┼─────────┼─────────┼──────┤
  │ Mathématiques      │   4   │  14   │ 16 │   13    │  13.8   │  4è  │
  │ Physique           │   3   │  12   │ 14 │   15    │  13.5   │  6è  │
  │ Chimie             │   3   │  10   │ 12 │  ——     │ Incomplet│ ——  │
  │ Biologie           │   3   │  16   │ 15 │   17    │  16.1   │  1è  │
  │ Français           │   3   │  13   │ ——  │   14    │  13.6   │  5è  │
  └────────────────────┴───────┴───────┴────┴─────────┴─────────┴──────┘
  │                            TOTAL  │ MOYENNE GÉNÉRALE│ RANG  │
  │                            312/400│      13.4/20    │  3ème │

Couleurs de la colonne Moyenne :
  ≥ 14 → text-green-700 bg-green-50 (mention)
  10-14 → text-neutral-800
  8-10  → text-orange-600
  < 8   → text-red-600 font-bold

Si une note est manquante ("——") → afficher en italic text-neutral-400.
Si toutes les notes d'une matière sont manquantes → ligne en gris clair + texte "En attente".

Résumé en bas si T terminé (délibéré) :
  Décision de délibération : [badge ADMIS(E) AVEC DISTINCTION] (ou AJOURNÉ, REFUSÉ)


ONGLET 4 — "Présences" (AttendanceTab.tsx)
--------------------------------------------
Chargement : GET /api/attendance?studentId=:id&academicYearId=:currentYear

En haut : métriques rapides
  [87% de présence] [12 absences] [8 justifiées] [4 non justifiées]

Calendrier visuel mensuel :
  Afficher le mois courant (navigable ← →) avec chaque jour coloré :
    Vert    → Présent
    Rouge   → Absent non justifié
    Orange  → Absent justifié
    Bleu    → Absent malade
    Gris    → Week-end / Jour férié / Vacances
    Blanc   → Pas de cours (hors jours scolaires)

  Clic sur un jour → popup avec détail :
    "Lundi 17 Fév 2025 — Matin: Absent (Maladie) — Après-midi: Présent"

Tableau des absences :
  ┌────────────────┬─────────┬───────────┬───────────────────┐
  │ Date           │ Période │ Statut    │ Justification     │
  ├────────────────┼─────────┼───────────┼───────────────────┤
  │ 15/02/2025     │ Matin   │ 🟠 Just. │ Visite médicale   │
  │ 08/02/2025     │ Full    │ 🔴 Abs.  │ —                 │
  └────────────────┴─────────┴───────────┴───────────────────┘


ONGLET 5 — "Paiements" (PaymentsTab.tsx)
------------------------------------------
Chargement : GET /api/payments?studentId=:id&academicYearId=:currentYear

Résumé financier en haut (3 cartes) :
  [Total dû : 150.000 FC] [Payé : 100.000 FC] [Solde : 50.000 FC]
  Barre de progression : 67% payé → progress bar verte

Tableau des paiements :
  ┌───────────────┬─────────────────────────┬──────────┬──────────┬─────────┐
  │ Reçu N°       │ Type de frais           │ Montant  │ Date     │ Mode    │
  ├───────────────┼─────────────────────────┼──────────┼──────────┼─────────┤
  │ ISS001-25-047 │ Frais fonctionnement T2 │ 50.000FC │17/02/25  │ Espèces │
  │ ISS001-25-031 │ Frais fonctionnement T1 │ 50.000FC │02/10/24  │ Airtel  │
  └───────────────┴─────────────────────────┴──────────┴──────────┴─────────┘

  Clic sur le N° de reçu → ouvre le PDF du reçu dans un nouvel onglet

  Solde dû :
    Tableau des frais non payés :
    "Frais Fonctionnement T3 : 50.000 FC — [Enregistrer paiement →]"
    Le bouton "Enregistrer paiement" → /finance/payment/new?studentId=:id (pré-sélectionné)


APPELS API
-----------
GET /api/students/:id
  Réponse : { student: Student (avec enrollments, classe, section inclus) }

GET /api/students/:id/academic-history
  Réponse : { history: { year, class, decision, average }[] }

GET /api/grades?studentId=:id&termId=:termId
  Réponse : { grades: Grade[], average: number, rank: number, decision?: DelibDecision }

GET /api/attendance?studentId=:id&academicYearId=:yearId
  Réponse : { records: Attendance[], stats: { rate, total, present, absent, justified } }

GET /api/payments?studentId=:id&academicYearId=:yearId
  Réponse : { payments: Payment[], summary: { due, paid, remaining } }

GET /api/students/:id/attestation
  Réponse : PDF binaire (Content-Type: application/pdf)

GET /api/students/:id/card
  Réponse : PDF binaire format ID


GESTION DU CHARGEMENT ET DES ERREURS
---------------------------------------
- Onglet "Infos" : données du parent (StudentHeader) → pas de loader supplémentaire
- Autres onglets : afficher skeleton loader pendant le fetch
- Si l'élève n'existe pas (404) → page d'erreur "Élève introuvable" + bouton retour
- Si l'élève est archivé → bannière grise "Cet élève est archivé" en haut de page
- Si données manquantes dans un onglet → empty state avec message explicatif


NAVIGATION RETOUR
------------------
Bouton "← Retour" en haut à gauche :
  - Utiliser le router.back() pour revenir à la liste avec les filtres intacts
  - Si l'URL de retour n'est pas /students → rediriger vers /students
  - Conserver les filtres dans l'URL (grâce à la synchronisation URL de SCR-005)


IMPRESSION ET PDF
------------------
Attestation d'inscription (PDF généré par Puppeteer) :
  En-tête : Logo + Nom école + "Attestation d'Inscription Scolaire"
  Corps :
    "Je soussigné(e), [Nom Préfet], Préfet de l'[Nom école], certifie que
    [NOM POSTNOM Prénom], matricule [XXXXX], est régulièrement inscrit(e)
    en [classe] [section] pour l'année scolaire [année]."
  Date + Signature + Cachet officiel

Carte d'élève (PDF format ID — 85.6mm × 54mm) :
  Recto : Logo école | Nom élève | Matricule | Classe | Photo | Code-barres
  Verso : Nom de l'école | Adresse | Téléphone | Année scolaire | Mention légale


DÉFINITION DE "TERMINÉ"
------------------------
[ ] La page charge les données réelles de l'élève depuis la base
[ ] Les 5 onglets chargent leurs données indépendamment
[ ] Le changement d'onglet ne recharge pas les données déjà fetched (cache TanStack)
[ ] L'onglet Notes affiche le sélecteur de trimestre fonctionnel
[ ] L'onglet Présences affiche le calendrier coloré correctement
[ ] L'onglet Paiements affiche la barre de progression et le solde dû
[ ] Les 3 PDF (attestation, carte) s'ouvrent dans un nouvel onglet
[ ] Le bouton retour préserve les filtres de la liste (SCR-005)
[ ] Les numéros de téléphone sont cliquables sur mobile (tel:)
[ ] Les noms sont dans l'ordre congolais sur toute la page
[ ] La page est responsive (375px et 1280px)
[ ] Si élève inexistant → page 404 dédiée sans crash
```

---

## RÉCAPITULATIF DES 5 PROMPTS

| N° | Écran    | Route                | Fichier principal                              | Priorité |
|----|----------|----------------------|------------------------------------------------|----------|
| 1  | SCR-001  | /login               | pages/auth/LoginPage.tsx                       | P0       |
| 2  | SCR-002  | /forgot-password     | pages/auth/ForgotPasswordPage.tsx              | P0       |
| 3  | SCR-003  | /dashboard           | pages/dashboard/DashboardPage.tsx              | P0       |
| 4  | SCR-005  | /students            | pages/students/StudentsListPage.tsx            | P0       |
| 5  | SCR-006  | /students/:id        | pages/students/StudentDetailPage.tsx           | P1       |

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
Prompt 1 → Prompt 2 → Prompt 3 → Prompt 4 → Prompt 5
  Auth        OTP       Dashboard   Liste       Détail
   ↓           ↓          ↓           ↓           ↓
 useAuth    OtpInput   AppLayout  DataTable  TabbedView
 Zustand    Africa's   Recharts   Filters    5 onglets
            Talking    Widgets    Export     PDF gen
```

Chaque prompt produit des composants réutilisés par les prompts suivants.
Ne pas sauter d'étape.

---

*EduGoma 360 — SSD v1.0 — Prompts Écrans 01 à 05 — Goma, RDC — © 2025*
