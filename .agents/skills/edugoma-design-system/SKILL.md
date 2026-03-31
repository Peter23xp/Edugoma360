---
name: EduGoma 360 Design System
description: Règles de design strictes pour cohérence visuelle totale - EduGoma 360
---

# 🎨 EDUGOMA 360 — DESIGN SYSTEM SKILL ANTIGRAVITY
## Règles de design strictes pour cohérence visuelle totale

> **OBJECTIF DE CE SKILL :**
> Garantir que Antigravity utilise **EXACTEMENT** le même design sur tous les écrans.
> Aucune variation, aucune improvisation. Cohérence totale = expérience professionnelle.

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. PALETTE DE COULEURS (IMMUABLE)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## COULEURS PRINCIPALES (ne JAMAIS modifier)

```css
/* PRIMAIRE — Vert École (boutons, liens, focus) */
--primary: #1B5E20;           /* Vert foncé — bouton principal */
--primary-hover: #2E7D32;     /* Vert moyen — hover bouton */
--primary-light: #4CAF50;     /* Vert clair — backgrounds subtils */
--primary-lighter: #E8F5E9;   /* Vert très clair — hover cards */

/* ACCENT — Or/Jaune (badges, highlights) */
--accent: #F57F17;            /* Orange/Or — badges importants */
--accent-hover: #FF8F00;      /* Orange vif — hover */
--accent-light: #FFF3E0;      /* Beige clair — backgrounds */

/* INFO — Bleu (notifications, info) */
--info: #0D47A1;              /* Bleu foncé — info boxes */
--info-hover: #1565C0;        /* Bleu moyen — hover */
--info-light: #E3F2FD;        /* Bleu très clair — backgrounds */

/* SUCCÈS — Vert clair */
--success: #1B5E20;           /* Identique à primary */
--success-light: #E8F5E9;

/* ERREUR — Rouge */
--error: #C62828;             /* Rouge foncé — erreurs */
--error-hover: #D32F2F;
--error-light: #FFEBEE;

/* ATTENTION — Orange */
--warning: #F57F17;           /* Identique à accent */
--warning-light: #FFF3E0;
```

## COULEURS NEUTRES

```css
/* BACKGROUNDS */
--background: #FAFAFA;        /* Gris très clair — fond global */
--card-background: #FFFFFF;   /* Blanc pur — cartes */
--input-background: #FFFFFF;  /* Blanc pur — inputs */

/* BORDURES */
--border: #E0E0E0;            /* Gris clair — bordures normales */
--border-focus: #1B5E20;      /* Vert primary — focus inputs */
--border-error: #C62828;      /* Rouge — validation erreur */

/* TEXTES */
--text-primary: #212121;      /* Noir presque pur — titres */
--text-secondary: #757575;    /* Gris moyen — sous-titres */
--text-disabled: #BDBDBD;     /* Gris clair — disabled */
--text-on-primary: #FFFFFF;   /* Blanc — texte sur vert */
```

## COULEURS STATUTS (utilisées dans badges)

```css
/* STATUTS ÉLÈVES */
--status-actif: #1B5E20;      /* Vert */
--status-inactif: #757575;    /* Gris */
--status-archive: #BDBDBD;    /* Gris clair */
--status-suspendu: #C62828;   /* Rouge */

/* STATUTS PAIEMENTS */
--status-paye: #1B5E20;       /* Vert */
--status-partiel: #F57F17;    /* Orange */
--status-impaye: #C62828;     /* Rouge */

/* STATUTS PRÉSENCE */
--status-present: #1B5E20;    /* Vert */
--status-absent: #C62828;     /* Rouge */
--status-retard: #F57F17;     /* Orange */

/* STATUTS CONNEXION */
--status-online: #1B5E20;     /* Vert */
--status-offline: #F57F17;    /* Orange */
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. TYPOGRAPHIE (IMMUABLE)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## POLICE DE CARACTÈRES

```css
/* FAMILLE */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;

/* Si Inter non disponible, utiliser system fonts */
```

## TAILLES DE TEXTE (respecter strictement)

```css
/* TITRES */
--text-h1: 2rem;              /* 32px — Titres de pages */
--text-h2: 1.5rem;            /* 24px — Sections principales */
--text-h3: 1.25rem;           /* 20px — Sous-sections */
--text-h4: 1.125rem;          /* 18px — Sous-sous-sections */

/* CORPS */
--text-body: 1rem;            /* 16px — Texte normal */
--text-small: 0.875rem;       /* 14px — Texte secondaire */
--text-xs: 0.75rem;           /* 12px — Labels, captions */

/* BOUTONS */
--text-button: 0.875rem;      /* 14px — Texte boutons */
--text-button-large: 1rem;    /* 16px — Gros boutons */
```

## POIDS DE POLICE

```css
--font-weight-normal: 400;    /* Texte normal */
--font-weight-medium: 500;    /* Sous-titres, labels */
--font-weight-semibold: 600;  /* Boutons, titres cards */
--font-weight-bold: 700;      /* Titres de pages */
```

## HAUTEUR DE LIGNE

```css
--line-height-tight: 1.25;    /* Titres compacts */
--line-height-normal: 1.5;    /* Texte normal */
--line-height-relaxed: 1.75;  /* Paragraphes aérés */
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. ESPACEMENTS (SYSTÈME 4PX)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tous les espacements DOIVENT être multiples de 4px.

```css
--spacing-1: 0.25rem;   /* 4px  — Très serré */
--spacing-2: 0.5rem;    /* 8px  — Serré */
--spacing-3: 0.75rem;   /* 12px — Compact */
--spacing-4: 1rem;      /* 16px — Normal ⭐ (valeur par défaut) */
--spacing-5: 1.25rem;   /* 20px — Aéré */
--spacing-6: 1.5rem;    /* 24px — Très aéré */
--spacing-8: 2rem;      /* 32px — Espacement sections */
--spacing-10: 2.5rem;   /* 40px — Espacement inter-sections */
--spacing-12: 3rem;     /* 48px — Grande séparation */
--spacing-16: 4rem;     /* 64px — Marges pages */
```

## RÈGLES D'APPLICATION

```
Padding boutons       : spacing-3 spacing-6 (12px 24px)
Padding inputs        : spacing-3 spacing-4 (12px 16px)
Padding cards         : spacing-6 (24px)
Gap entre éléments    : spacing-4 (16px) ⭐ valeur par défaut
Margin entre sections : spacing-8 (32px)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. COMPOSANTS SHADCN/UI (RÈGLES STRICTES)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## BOUTONS (Button)

### Bouton Primary (action principale)
```tsx
<Button variant="default" size="default">
  Texte bouton
</Button>

/* CSS appliqué automatiquement */
background: var(--primary);        /* #1B5E20 */
color: var(--text-on-primary);     /* #FFFFFF */
padding: 12px 24px;
border-radius: 6px;
font-weight: 600;
font-size: 14px;

/* Hover */
background: var(--primary-hover);  /* #2E7D32 */

/* Disabled */
background: #BDBDBD;
cursor: not-allowed;
```

### Bouton Secondary (action secondaire)
```tsx
<Button variant="outline" size="default">
  Annuler
</Button>

/* CSS */
background: transparent;
border: 1px solid var(--border);   /* #E0E0E0 */
color: var(--text-primary);        /* #212121 */

/* Hover */
background: #F5F5F5;
```

### Bouton Destructive (supprimer, archiver)
```tsx
<Button variant="destructive" size="default">
  Supprimer
</Button>

/* CSS */
background: var(--error);          /* #C62828 */
color: white;

/* Hover */
background: var(--error-hover);    /* #D32F2F */
```

### Tailles disponibles
```tsx
<Button size="sm">Petit</Button>       /* padding: 8px 16px, font: 12px */
<Button size="default">Normal</Button> /* padding: 12px 24px, font: 14px */
<Button size="lg">Grand</Button>       /* padding: 16px 32px, font: 16px */
```

---

## INPUTS (Input)

### Input texte standard
```tsx
<Input 
  type="text"
  placeholder="Entrez votre nom"
  className="w-full"
/>

/* CSS appliqué */
height: 40px;
padding: 12px 16px;
border: 1px solid var(--border);   /* #E0E0E0 */
border-radius: 6px;
font-size: 14px;
background: white;

/* Focus */
border-color: var(--border-focus); /* #1B5E20 */
outline: 2px solid rgba(27, 94, 32, 0.1); /* Halo vert */

/* Error */
border-color: var(--border-error); /* #C62828 */
```

### Input avec icône
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
  <Input 
    type="text"
    placeholder="Rechercher..."
    className="pl-10"
  />
</div>
```

---

## CARTES (Card)

### Card standard
```tsx
<Card>
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description optionnelle</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenu */}
  </CardContent>
</Card>

/* CSS appliqué */
Card:
  background: white;
  border: 1px solid var(--border);  /* #E0E0E0 */
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

CardHeader:
  padding: 24px;
  border-bottom: 1px solid var(--border);

CardTitle:
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);

CardDescription:
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;

CardContent:
  padding: 24px;
```

### Card interactive (cliquable)
```tsx
<Card className="cursor-pointer hover:shadow-md transition-shadow">
  {/* contenu */}
</Card>

/* Hover */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
border-color: var(--primary-light);
```

---

## BADGES (Badge)

### Badge par défaut
```tsx
<Badge variant="default">Actif</Badge>

/* CSS */
background: var(--primary);        /* #1B5E20 */
color: white;
padding: 2px 8px;
border-radius: 4px;
font-size: 12px;
font-weight: 500;
```

### Badge selon statut
```tsx
/* Succès */
<Badge variant="default" className="bg-green-600">
  ✓ Payé
</Badge>

/* Attention */
<Badge variant="default" className="bg-orange-500">
  ⚠ En attente
</Badge>

/* Erreur */
<Badge variant="destructive">
  ✗ Impayé
</Badge>

/* Neutre */
<Badge variant="secondary">
  Archivé
</Badge>
```

### Badges avec icônes
```tsx
<Badge>
  <CheckCircle className="h-3 w-3 mr-1" />
  Validé
</Badge>
```

---

## TABLEAUX (Table)

### Structure standard
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>N°</TableHead>
      <TableHead>Nom</TableHead>
      <TableHead>Classe</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>1</TableCell>
      <TableCell className="font-medium">AMISI Jean</TableCell>
      <TableCell>4ScA</TableCell>
      <TableCell className="text-right">
        <Button size="sm">Voir</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>

/* CSS appliqué */
Table:
  width: 100%;
  border-collapse: collapse;

TableHeader:
  background: #F9FAFB;

TableHead:
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;

TableRow:
  border-bottom: 1px solid var(--border);

TableRow:hover:
  background: var(--primary-lighter); /* #E8F5E9 */

TableCell:
  padding: 12px 16px;
  font-size: 14px;
```

---

## LABELS (Label)

```tsx
<Label htmlFor="email">
  Email *
</Label>
<Input id="email" type="email" />

/* CSS Label */
font-size: 14px;
font-weight: 500;
color: var(--text-primary);
margin-bottom: 8px;
display: block;

/* Astérisque requis */
.required::after {
  content: " *";
  color: var(--error);
}
```

---

## ALERTES (Alert)

### Alert info
```tsx
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    Ceci est une information importante.
  </AlertDescription>
</Alert>

/* CSS */
background: var(--info-light);     /* #E3F2FD */
border: 1px solid var(--info);     /* #0D47A1 */
padding: 16px;
border-radius: 8px;
```

### Alert succès
```tsx
<Alert className="bg-green-50 border-green-600">
  <CheckCircle className="h-4 w-4 text-green-600" />
  <AlertTitle className="text-green-900">Succès</AlertTitle>
  <AlertDescription className="text-green-800">
    Opération réussie !
  </AlertDescription>
</Alert>
```

### Alert erreur
```tsx
<Alert variant="destructive">
  <XCircle className="h-4 w-4" />
  <AlertTitle>Erreur</AlertTitle>
  <AlertDescription>
    Une erreur est survenue.
  </AlertDescription>
</Alert>

/* CSS */
background: var(--error-light);    /* #FFEBEE */
border: 1px solid var(--error);    /* #C62828 */
```

---

## TOASTS (Sonner)

```tsx
import { toast } from 'sonner'

/* Succès */
toast.success("Enregistré avec succès !")

/* Erreur */
toast.error("Erreur lors de l'enregistrement")

/* Info */
toast.info("3 nouveaux messages")

/* Attention */
toast.warning("Attention : créances impayées")

/* CSS Toasts (via Sonner) */
Position: bottom-right
Background: selon type (vert/rouge/bleu/orange)
Durée: 4000ms
Font-size: 14px
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. ICONOGRAPHIE (LUCIDE REACT)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Toujours utiliser **Lucide React** (jamais un autre set d'icônes).

## TAILLES STANDARD

```tsx
/* Petit (dans badges, à côté texte) */
<Icon className="h-3 w-3" />       /* 12px */

/* Normal (dans boutons, inputs) */
<Icon className="h-4 w-4" />       /* 16px */

/* Moyen (icônes standalone) */
<Icon className="h-5 w-5" />       /* 20px */

/* Grand (icônes importantes) */
<Icon className="h-6 w-6" />       /* 24px */

/* Très grand (icônes héros) */
<Icon className="h-8 w-8" />       /* 32px */
```

## ICÔNES PAR CONTEXTE

```tsx
/* Actions */
import { 
  Plus,           // Ajouter
  Edit,           // Modifier
  Trash2,         // Supprimer
  Save,           // Enregistrer
  X,              // Fermer/Annuler
  Check,          // Valider
  Download,       // Télécharger
  Upload,         // Uploader
  Search,         // Rechercher
} from 'lucide-react'

/* Statuts */
import {
  CheckCircle,    // Succès
  XCircle,        // Erreur
  AlertCircle,    // Attention
  Info,           // Information
  Loader2,        // Chargement (avec animate-spin)
} from 'lucide-react'

/* Navigation */
import {
  Home,           // Accueil
  Users,          // Élèves
  GraduationCap,  // Académique
  DollarSign,     // Finance
  Calendar,       // Présences
  Settings,       // Paramètres
  LogOut,         // Déconnexion
} from 'lucide-react'

/* Fonctionnel */
import {
  Eye,            // Voir
  EyeOff,         // Masquer
  ChevronDown,    // Dropdown ouvert
  ChevronRight,   // Dropdown fermé
  MoreVertical,   // Menu actions
  Filter,         // Filtres
} from 'lucide-react'
```

## COULEURS ICÔNES

```tsx
/* Icône primaire (actions importantes) */
<Icon className="h-4 w-4 text-primary" />

/* Icône secondaire (actions normales) */
<Icon className="h-4 w-4 text-gray-600" />

/* Icône disabled */
<Icon className="h-4 w-4 text-gray-400" />

/* Icône succès */
<CheckCircle className="h-4 w-4 text-green-600" />

/* Icône erreur */
<XCircle className="h-4 w-4 text-red-600" />

/* Icône attention */
<AlertCircle className="h-4 w-4 text-orange-500" />
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. LAYOUT ET STRUCTURE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## STRUCTURE PAGE TYPE

```tsx
<div className="min-h-screen bg-background">
  {/* Header/Navbar */}
  <header className="sticky top-0 z-50 bg-white border-b border-border">
    {/* Contenu header */}
  </header>

  {/* Contenu principal */}
  <main className="container mx-auto px-4 py-8">
    {/* Titre page */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-primary mb-2">
        Titre de la page
      </h1>
      <p className="text-secondary">
        Description optionnelle
      </p>
    </div>

    {/* Stats cards (si applicable) */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Cards */}
    </div>

    {/* Filtres (si applicable) */}
    <Card className="mb-6">
      <CardContent className="py-4">
        {/* Filtres */}
      </CardContent>
    </Card>

    {/* Contenu principal (tableau, liste, formulaire) */}
    <Card>
      <CardContent>
        {/* Contenu */}
      </CardContent>
    </Card>
  </main>
</div>
```

## GRILLES RESPONSIVE

```tsx
/* 1 colonne mobile, 2 desktop */
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

/* 1 mobile, 2 tablette, 3 desktop */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

/* 1 mobile, 3 desktop */
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

/* 1 mobile, 4 desktop */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

## BREAKPOINTS TAILWIND

```
sm:  640px   → Mobile large
md:  768px   → Tablette
lg:  1024px  → Desktop petit
xl:  1280px  → Desktop
2xl: 1536px  → Grand écran
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 7. ANIMATIONS ET TRANSITIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## TRANSITIONS STANDARD

```tsx
/* Transition normale (200ms) */
className="transition-colors duration-200"

/* Transition rapide (150ms) */
className="transition-all duration-150"

/* Transition lente (300ms) */
className="transition-all duration-300"
```

## ANIMATIONS COMMUNES

```tsx
/* Spinner chargement */
<Loader2 className="h-4 w-4 animate-spin" />

/* Pulse (badge notification) */
<div className="animate-pulse">
  <Badge>Nouveau</Badge>
</div>

/* Bounce (attention) */
<div className="animate-bounce">
  ↓
</div>
```

## HOVER STATES

```tsx
/* Card hover */
className="hover:shadow-md hover:border-primary-light transition-all"

/* Bouton hover */
className="hover:bg-primary-hover transition-colors"

/* Lien hover */
className="hover:text-primary hover:underline transition-colors"
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 8. RÈGLES DE NOMMAGE CLASSES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ORDRE DES CLASSES TAILWIND

Toujours dans cet ordre :
1. Layout (flex, grid, block)
2. Sizing (w-, h-, min-, max-)
3. Spacing (p-, m-, gap-)
4. Typography (text-, font-)
5. Colors (bg-, text-, border-)
6. Effects (shadow-, opacity-, transition-)

Exemple :
```tsx
className="flex items-center gap-4 w-full h-12 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover transition-colors"
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 9. EXEMPLES COMPLETS PAR ÉCRAN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ÉCRAN LOGIN (SCR-001)

```tsx
<div className="min-h-screen flex items-center justify-center bg-background">
  <Card className="w-full max-w-md">
    <CardHeader className="text-center">
      <img src="/logo.svg" alt="Logo" className="h-16 mx-auto mb-4" />
      <CardTitle className="text-2xl font-bold text-primary">
        EduGoma 360
      </CardTitle>
      <CardDescription>
        Système de Gestion Scolaire — Goma, RDC
      </CardDescription>
    </CardHeader>
    
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="email">Email ou Matricule</Label>
        <Input 
          id="email"
          type="text"
          placeholder="nom@exemple.com"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input 
          id="password"
          type="password"
          placeholder="••••••••"
          className="mt-1"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-sm">
            Se souvenir de moi
          </Label>
        </div>
        <Button variant="link" size="sm">
          Mot de passe oublié ?
        </Button>
      </div>
      
      <Button className="w-full" size="lg">
        Se connecter
      </Button>
    </CardContent>
  </Card>
</div>
```

---

## TABLEAU ÉLÈVES (SCR-005)

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Liste des élèves</CardTitle>
        <CardDescription>847 élèves inscrits</CardDescription>
      </div>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un élève
      </Button>
    </div>
  </CardHeader>
  
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N°</TableHead>
          <TableHead>Matricule</TableHead>
          <TableHead>Nom complet</TableHead>
          <TableHead>Classe</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>1</TableCell>
          <TableCell className="font-mono text-xs">NK-GOM-ISS001-0234</TableCell>
          <TableCell className="font-medium">AMISI KALOMBO Jean-Baptiste</TableCell>
          <TableCell>4ScA</TableCell>
          <TableCell>
            <Badge variant="default">Actif</Badge>
          </TableCell>
          <TableCell className="text-right">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 10. CHECKLIST ANTIGRAVITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Avant de générer du code, VÉRIFIER :

[ ] Couleurs primary (#1B5E20), accent (#F57F17), info (#0D47A1) utilisées
[ ] Police Inter partout
[ ] Espacements multiples de 4px
[ ] Boutons avec variant correct (default/outline/destructive)
[ ] Inputs avec height: 40px, padding: 12px 16px
[ ] Cards avec border-radius: 8px, padding: 24px
[ ] Badges avec padding: 2px 8px, font-size: 12px
[ ] Icônes Lucide React (h-4 w-4 par défaut)
[ ] Grilles responsive (grid grid-cols-1 md:grid-cols-X)
[ ] Transitions 200ms par défaut
[ ] Classes Tailwind dans le bon ordre

---

*EduGoma 360 — Design System Skill — © 2025*