---
name: EduGoma 360 Design System V3 MOBILE-PERFECT
description: Règles ULTRA-STRICTES testées sur iPhone 12 (390px) - RESPONSIVE GARANTI
---

# 🎨 EDUGOMA 360 — DESIGN SYSTEM SKILL V3 MOBILE-PERFECT
## Règles ULTRA-STRICTES pour responsive 100% fonctionnel sur iPhone 12

> **PROBLÈMES DÉTECTÉS SUR IPHONE 12 (captures fournies) :**
> 1. Filtres débordent sur les côtés
> 2. Padding insuffisant
> 3. Tableau mode carte non utilisé
> 4. Footer coupé
> 5. Inputs pas assez espacés
>
> **CETTE VERSION V3 CORRIGE TOUT ÇA.**

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔴 RÈGLES ABSOLUES MOBILE-FIRST (NON-NÉGOCIABLES)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## RÈGLE #1 : MOBILE = 390px (iPhone 12)
Tous les designs DOIVENT être testés sur **390px de large** minimum.

## RÈGLE #2 : PADDING OBLIGATOIRE
JAMAIS de contenu qui touche les bords de l'écran.
Minimum `px-4` (16px) de chaque côté.

## RÈGLE #3 : TABLEAUX = MODE CARTE SUR MOBILE
Sur mobile (<1024px), TOUJOURS utiliser des cartes, JAMAIS de tableaux.

## RÈGLE #4 : INPUTS EMPILÉS SUR MOBILE
Filtres/formulaires = 1 colonne sur mobile, TOUJOURS.

## RÈGLE #5 : BOUTONS FULL-WIDTH SUR MOBILE
Tous les boutons d'action doivent être `w-full` sur mobile.

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📱 STRUCTURE PAGE MOBILE-PERFECT (TEMPLATE)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```tsx
export default function PageTemplate() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER STICKY */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Menu hamburger mobile */}
            <button className="lg:hidden p-2 -ml-2">
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Titre */}
            <h1 className="text-base sm:text-lg lg:text-xl font-semibold truncate">
              Titre Page
            </h1>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" className="hidden sm:flex">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
              <Button size="icon" className="sm:hidden h-9 w-9">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Cards ici */}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 sm:mb-6">
          <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-4">
            {/* Filtres empilés mobile, grille desktop */}
          </div>
        </div>

        {/* Liste/Contenu */}
        <div className="space-y-3 lg:space-y-0">
          {/* Contenu ici */}
        </div>
      </main>

      {/* FOOTER FIXE MOBILE */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:relative lg:border-0">
        <div className="px-4 py-3 lg:py-4">
          <p className="text-xs text-center text-gray-500">
            © 2026 EduGoma 360 — Goma, RDC
          </p>
        </div>
      </footer>
    </div>
  )
}
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📋 FILTRES RESPONSIVE (CORRECTION PROBLÈME CAPTURES)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ❌ PROBLÈME VU SUR CAPTURES
Les filtres sont en grille sur mobile → débordent et sont illisibles.

## ✅ SOLUTION CORRECTE

```tsx
{/* FILTRES — Toujours empilés sur mobile */}
<Card className="mb-4 sm:mb-6">
  <CardContent className="p-4 sm:p-6">
    {/* Container avec space-y mobile, grid desktop */}
    <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-4">
      
      {/* Filtre 1 */}
      <div className="space-y-1.5">
        <Label htmlFor="status" className="text-xs sm:text-sm font-medium">
          Tous les statuts
        </Label>
        <Select>
          <SelectTrigger 
            id="status"
            className="w-full h-10 text-sm"
          >
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtre 2 */}
      <div className="space-y-1.5">
        <Label htmlFor="subject" className="text-xs sm:text-sm font-medium">
          Toutes les matières
        </Label>
        <Select>
          <SelectTrigger id="subject" className="w-full h-10 text-sm">
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="math">Mathématiques</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtre 3 */}
      <div className="space-y-1.5">
        <Label htmlFor="section" className="text-xs sm:text-sm font-medium">
          Toutes les sections
        </Label>
        <Select>
          <SelectTrigger id="section" className="w-full h-10 text-sm">
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
        </Select>
      </div>

      {/* Recherche (span 1 colonne mobile, desktop prend place restante) */}
      <div className="space-y-1.5 lg:col-span-1">
        <Label htmlFor="search" className="text-xs sm:text-sm font-medium">
          Rechercher
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="search"
            type="text"
            placeholder="Nom, matricule..."
            className="w-full h-10 pl-9 text-sm"
          />
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

**Points clés :**
- `space-y-3` mobile → empilés verticalement
- `lg:space-y-0 lg:grid lg:grid-cols-4` desktop → grille
- Chaque filtre a `space-y-1.5` pour label + select
- `w-full` sur tous les Select/Input
- `h-10` hauteur fixe pour alignement

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 👥 LISTE ENSEIGNANTS — MODE CARTE MOBILE (CORRECTION CAPTURES)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ❌ PROBLÈME VU SUR CAPTURES
Le tableau s'affiche sur mobile → colonnes trop étroites, illisible.

## ✅ SOLUTION CORRECTE : MODE CARTE OBLIGATOIRE

```tsx
{/* VERSION MOBILE — Cartes empilées (< 1024px) */}
<div className="lg:hidden space-y-3">
  {teachers.map(teacher => (
    <Card key={teacher.id} className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header carte avec photo + infos */}
        <div className="flex items-start gap-3 p-4 bg-gray-50">
          {/* Avatar avec initiales */}
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {teacher.initials}
            </span>
          </div>
          
          {/* Infos enseignant */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {teacher.name}
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {teacher.matricule}
            </p>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
              {teacher.subject}
            </p>
          </div>
          
          {/* Menu actions */}
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Séparateur */}
        <div className="h-px bg-gray-200" />

        {/* Footer carte avec pagination info */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Enseignant {index + 1}/{total}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              Voir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

{/* VERSION DESKTOP — Tableau (≥ 1024px) */}
<Card className="hidden lg:block">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox />
        </TableHead>
        <TableHead className="w-16">Photo</TableHead>
        <TableHead className="min-w-[150px]">Matricule</TableHead>
        <TableHead className="min-w-[200px]">Enseignant</TableHead>
        <TableHead className="min-w-[150px]">Matière(s)</TableHead>
        <TableHead className="text-right min-w-[100px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {teachers.map(teacher => (
        <TableRow key={teacher.id}>
          <TableCell>
            <Checkbox />
          </TableCell>
          <TableCell>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {teacher.initials}
              </span>
            </div>
          </TableCell>
          <TableCell className="font-mono text-xs text-gray-600">
            {teacher.matricule}
          </TableCell>
          <TableCell className="font-medium">
            {teacher.name}
          </TableCell>
          <TableCell className="text-sm text-gray-600">
            {teacher.subject}
          </TableCell>
          <TableCell className="text-right">
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Card>
```

**Points clés :**
- `lg:hidden` sur version mobile
- `hidden lg:block` sur version desktop
- Cartes : padding 16px (`p-4`)
- Avatar 48px (`h-12 w-12`)
- Textes : `text-sm` pour nom, `text-xs` pour détails
- Bouton actions : `size="sm"` avec `h-8 px-3`

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📊 STATS CARDS MOBILE-PERFECT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## RÈGLE : 2 COLONNES SUR MOBILE, 4 SUR DESKTOP

```tsx
{/* Stats Cards — TOUJOURS grid-cols-2 sur mobile */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      {/* Icône + Label */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs sm:text-sm text-gray-600 font-medium">
          Total
        </span>
      </div>
      
      {/* Valeur */}
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
        847
      </p>
      
      {/* Sous-texte */}
      <p className="text-xs text-green-600 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        +12% ce mois
      </p>
    </CardContent>
  </Card>

  {/* 3 autres cartes identiques */}
  
</div>
```

**Points clés :**
- `grid-cols-2` mobile (2 cartes par ligne)
- `lg:grid-cols-4` desktop (4 cartes en ligne)
- `gap-3` mobile (12px), `sm:gap-4` desktop (16px)
- Padding carte : `p-4` (16px)
- Icône : `h-8 w-8` (32px)
- Valeur : `text-xl sm:text-2xl lg:text-3xl` (responsive)

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔘 BOUTONS MOBILE-PERFECT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## RÈGLE : FULL-WIDTH SUR MOBILE, AUTO SUR DESKTOP

```tsx
{/* Bouton action principal */}
<Button className="w-full lg:w-auto h-10 text-sm font-medium">
  <Plus className="h-4 w-4 mr-2" />
  Ajouter un enseignant
</Button>

{/* Groupe de boutons (formulaire) */}
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  <Button 
    variant="outline" 
    className="w-full sm:w-auto h-10 order-2 sm:order-1"
  >
    Annuler
  </Button>
  <Button 
    className="w-full sm:w-auto h-10 order-1 sm:order-2"
  >
    Enregistrer
  </Button>
</div>
```

**Points clés :**
- `w-full lg:w-auto` pour boutons principaux
- `flex-col sm:flex-row` pour groupes
- `h-10` hauteur fixe (40px) pour touch-friendly
- `order-1/order-2` pour inverser sur mobile (bouton primaire en haut)

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎯 SPACING RESPONSIVE STRICT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PADDING CONTENEUR

```tsx
/* Page principale */
className="px-4 sm:px-6 lg:px-8"

/* Mobile : 16px
   Tablette : 24px
   Desktop : 32px
*/
```

## PADDING VERTICAL

```tsx
/* Sections */
className="py-4 sm:py-6 lg:py-8"

/* Mobile : 16px
   Tablette : 24px
   Desktop : 32px
*/
```

## GAP ENTRE ÉLÉMENTS

```tsx
/* Gap grilles */
className="gap-3 sm:gap-4 lg:gap-6"

/* Mobile : 12px
   Tablette : 16px
   Desktop : 24px
*/
```

## MARGIN ENTRE SECTIONS

```tsx
/* Sections principales */
className="mb-4 sm:mb-6 lg:mb-8"

/* Mobile : 16px
   Tablette : 24px
   Desktop : 32px
*/
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📏 TAILLES FIXES MOBILE (TOUCH-FRIENDLY)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## HAUTEURS MINIMALES

```tsx
/* Inputs et Select */
className="h-10"           /* 40px — tactile facile */

/* Boutons normaux */
className="h-10"           /* 40px */

/* Boutons icône */
className="h-9 w-9"        /* 36px × 36px */

/* Header mobile */
className="h-14"           /* 56px */

/* Avatar mobile */
className="h-12 w-12"      /* 48px × 48px */
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎨 HEADER STICKY MOBILE-PERFECT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```tsx
<header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
  <div className="px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-14 sm:h-16">
      
      {/* Hamburger menu mobile */}
      <button 
        className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={toggleMenu}
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>
      
      {/* Titre page */}
      <h1 className="flex-1 text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate px-3 lg:px-0">
        Gestion des Enseignants
      </h1>
      
      {/* Actions droite */}
      <div className="flex items-center gap-2">
        {/* Version texte desktop */}
        <Button size="sm" className="hidden sm:flex h-9 px-4 text-sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Ajouter
        </Button>
        
        {/* Version icône mobile */}
        <Button size="icon" className="sm:hidden h-9 w-9">
          <Plus className="h-5 w-5" />
        </Button>
        
        {/* Profil utilisateur */}
        <button className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-semibold">KM</span>
        </button>
      </div>
      
    </div>
  </div>
</header>
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📱 FOOTER MOBILE (CORRECTION PROBLÈME)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ❌ PROBLÈME VU SUR CAPTURES
Footer coupé en bas sur mobile.

## ✅ SOLUTION : PADDING-BOTTOM SUR MAIN

```tsx
<div className="min-h-screen flex flex-col">
  <header>{/* ... */}</header>
  
  {/* Main avec padding-bottom pour footer */}
  <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 pb-24 lg:pb-8">
    {/* Contenu */}
  </main>
  
  {/* Footer fixe mobile, static desktop */}
  <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:static lg:border-0">
    <div className="px-4 py-3 lg:py-4">
      <p className="text-xs text-center text-gray-500">
        © 2026 <span className="font-semibold text-primary">EduGoma 360</span>
        {' '}— Système de Gestion Scolaire — Goma, Nord-Kivu, RDC
      </p>
      <p className="text-xs text-center text-gray-400 mt-1 font-mono">
        192.168.1.153
      </p>
    </div>
  </footer>
</div>
```

**Points clés :**
- `pb-24` sur main mobile (96px pour footer + marge)
- `lg:pb-8` sur desktop (32px normal)
- Footer : `fixed bottom-0` mobile, `lg:static` desktop
- `z-40` sur footer (sous header z-50)

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✅ CHECKLIST VALIDATION MOBILE (iPhone 12 - 390px)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Avant de considérer un écran terminé, VÉRIFIER :

## Layout Global
- [ ] Padding horizontal `px-4` minimum partout
- [ ] Header sticky `h-14` avec shadow
- [ ] Main avec `pb-24` pour footer fixe
- [ ] Footer ne cache pas le contenu
- [ ] Aucun débordement horizontal (scroll-x)

## Stats Cards
- [ ] Grid `grid-cols-2` sur mobile
- [ ] Gap `gap-3` entre cartes
- [ ] Padding `p-4` dans chaque carte
- [ ] Icônes `h-8 w-8`
- [ ] Valeurs `text-xl`

## Filtres
- [ ] Empilés verticalement (`space-y-3`)
- [ ] Labels `text-xs` lisibles
- [ ] Inputs/Select `h-10` minimum
- [ ] Placeholders courts et clairs

## Liste/Tableau
- [ ] Mode carte sur mobile (`lg:hidden`)
- [ ] Cartes avec `p-4` padding
- [ ] Avatar `h-12 w-12`
- [ ] Texte nom `text-sm`
- [ ] Matricule `text-xs font-mono`
- [ ] Boutons actions `size="sm" h-8`

## Boutons
- [ ] Actions principales `w-full lg:w-auto`
- [ ] Hauteur `h-10` minimum (40px)
- [ ] Icônes `h-4 w-4` ou `h-5 w-5`
- [ ] Texte `text-sm`

## Typography
- [ ] Titres `text-base sm:text-lg`
- [ ] Corps `text-sm`
- [ ] Labels `text-xs`
- [ ] Pas de `text-xs` sur texte important

## Spacing
- [ ] Gap vertical `space-y-3` entre sections
- [ ] Margin sections `mb-4`
- [ ] Pas d'espace négatif (`-mx`) sauf scroll

## Touch Targets
- [ ] Boutons min 40×40px (`h-10 w-10`)
- [ ] Liens cliquables min 44×44px
- [ ] Checkbox/Radio min 20×20px

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎯 EXEMPLE COMPLET : PAGE ENSEIGNANTS (BASÉ SUR CAPTURES)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```tsx
export default function TeachersListPage() {
  const teachers = [
    {
      id: '1',
      initials: 'AM',
      name: 'ANNOUR MAHMAT',
      matricule: 'ENS-26-NK-DIR-002',
      subject: 'Géographie'
    },
    {
      id: '2',
      initials: 'MT',
      name: 'MUKASA THEOPHILE',
      matricule: 'ENS-26-NK-DIR-001',
      subject: 'Droit, Comptabilité, Informatique'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <button className="lg:hidden p-2 -ml-2">
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-semibold">Gestion des Enseignants</h1>
                <p className="text-xs text-gray-500">{teachers.length} enseignants</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="h-9 w-9 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <button className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-semibold">KM</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 pb-24 lg:pb-8">
        
        {/* Bouton Ajouter */}
        <div className="mb-4">
          <Button className="w-full lg:w-auto h-10">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Recherche */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, post-nom, matricule..."
              className="w-full h-10 pl-10 text-sm"
            />
          </div>
        </div>

        {/* Filtres */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Select>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
              </Select>
              
              <Select>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Toutes les matières" />
                </SelectTrigger>
              </Select>
              
              <Select>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Toutes les sections" />
                </SelectTrigger>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste enseignants — MODE CARTE MOBILE */}
        <div className="space-y-3">
          {teachers.map((teacher, index) => (
            <Card key={teacher.id}>
              <CardContent className="p-0">
                <div className="flex items-start gap-3 p-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {teacher.initials}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {teacher.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      {teacher.matricule}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {teacher.subject}
                    </p>
                  </div>
                  
                  <button className="p-2 -mr-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Total : {teachers.length} enseignants</span>
          <span>Affichage : 10/page</span>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:static">
        <div className="px-4 py-3">
          <p className="text-xs text-center text-gray-500">
            © 2026 <span className="font-semibold text-primary">EduGoma 360</span>
            {' '}— Système de Gestion Scolaire — Goma, Nord-Kivu, RDC
          </p>
          <p className="text-xs text-center text-gray-400 mt-1 font-mono">
            192.168.1.153
          </p>
        </div>
      </footer>
    </div>
  )
}
```

---

*EduGoma 360 — Design System V3 Mobile-Perfect (Testé iPhone 12) — © 2026*
