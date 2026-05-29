# Dashboard Enrichi — Design Spec

## Objectif

Refonte complète du dashboard EduGoma 360 : passer de 3 grosses KPI cards à un dashboard riche, dense et adapté au rôle. Chaque rôle voit une vue optimisée pour ses priorités quotidiennes.

## Architecture

### Nouveau endpoint serveur

`GET /api/stats/dashboard-summary`

Un seul appel qui retourne toutes les données nécessaires (évite 7 requêtes parallèles actuelles) :

```typescript
{
  // École
  enrollment: { total: number, bySection: Record<string, number> },
  activeClasses: number,
  activeTeachers: number,

  // Présences
  attendanceToday: { rate: number, present: number, total: number, classesDone: number, classesTotal: number },
  attendanceWeek: Array<{ day: string, date: string, rate: number, present: number, total: number }>,
  absencesToday: Array<{ studentId: string, nom: string, postNom: string, className: string, isConsecutive: boolean }>,

  // Notes
  gradesProgress: { done: number, total: number, percent: number },

  // Finance
  finance: {
    collectedThisMonth: number,
    expectedThisMonth: number,
    totalDebts: number,
    debtorsCount: number,
    recoveryRate: number,
  },
  paymentTrend: Array<{ label: string, expected: number, collected: number }>,
  recentPayments: Array<{ studentNom: string, amount: number, method: string, minutesAgo: number }>,

  // Opérationnel
  cashSession: { isOpen: boolean, cashierName: string | null, openedAt: string | null },
  pendingAlerts: number,
  pendingConvocations: number,
  nextEvents: Array<{ title: string, date: string, type: string }>,
}
```

### Fichiers à créer

| Fichier | Rôle |
|---------|------|
| `components/dashboard/KpiCard.tsx` | Carte KPI compacte réutilisable (~80px hauteur) |
| `components/dashboard/AttendanceWeekChart.tsx` | BarChart présence 7 jours (Recharts) |
| `components/dashboard/PaymentTrendChart.tsx` | AreaChart paiements 6 mois (Recharts) |
| `components/dashboard/RecentPayments.tsx` | Widget 5 derniers paiements |
| `components/dashboard/TodayAbsences.tsx` | Widget absences du jour |
| `components/dashboard/StatusBar.tsx` | Barre statut opérationnel (caisse, appels, sync) |

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `pages/dashboard/DashboardPage.tsx` | Refonte complète — utilise le nouveau endpoint et les nouveaux composants |
| `server/src/modules/stats/stats.service.ts` | Ajout `getDashboardSummary()` |
| `server/src/modules/stats/stats.routes.ts` | Ajout `GET /dashboard-summary` |

---

## Layout par rôle

### PRÉFET / SUPER_ADMIN

```
┌─────────────────────────────────────────────────────────────────────┐
│ StatusBar: 🟢 Caisse ouverte · 📋 5/6 classes ont fait l'appel · 🔄 │
├──────────┬──────────┬──────────┬──────────────────────────────────────┤
│ 👥 48    │ ✅ 87%   │ 📚 73%   │ ⚠️  3                               │
│ Élèves   │ Présence │ Notes    │ Alertes                             │
├──────────┼──────────┼──────────┼──────────────────────────────────────┤
│ 💰 198K  │ 📈 2.5%  │ 🔴 7.7M  │ 🏫 6 classes                       │
│ Collecté │ Recouvr. │ Créances │ 8 enseignants                       │
├──────────────────────────┬──────────────────────────────────────────┤
│ Présence 7 jours         │ Paiements 6 mois                         │
│ [BarChart]               │ [AreaChart attendu vs collecté]          │
├────────────────┬─────────┴──────────┬───────────────────────────────┤
│ Derniers       │ Absences du jour   │ Prochains événements           │
│ paiements (5)  │ (liste élèves)     │ + Convocations en attente      │
└────────────────┴────────────────────┴───────────────────────────────┘
```

### ÉCONOME

```
┌─────────────────────────────────────────────────────────────────────┐
│ StatusBar: 🟢 Caisse ouverte depuis 08h32 · Total caisse: 45,000 FC │
├──────────┬──────────┬──────────┬──────────────────────────────────────┤
│ 💰 198K  │ 7.7M FC  │ 47       │ 📈 2.5%                             │
│ Ce mois  │ Créances │ Débiteurs│ Taux recouvrement                   │
├──────────────────────────┬──────────────────────────────────────────┤
│ Paiements 6 mois         │ Derniers paiements (10 lignes)           │
│ [AreaChart]              │ Nom · Montant · Mode · Il y a Xmin       │
└──────────────────────────┴──────────────────────────────────────────┘
```

### SECRÉTAIRE

```
├──────────┬──────────┬──────────┬──────────────────────────────────────┤
│ 👥 48    │ ✅ 87%   │ 📅 3     │ 📝 0                                │
│ Élèves   │ Présence │ Convoc.  │ Justificatifs en attente            │
├──────────────────────────┬──────────────────────────────────────────┤
│ Absences du jour         │ Activité récente                         │
└──────────────────────────┴──────────────────────────────────────────┘
```

### ENSEIGNANT

```
├──────────┬──────────┬──────────┬──────────────────────────────────────┤
│ 🏫 Mes   │ ✅ Appel │ 📚 Notes │ 📅 Prochain cours                   │
│ 3 classes│ fait ?   │ saisies  │ Maths 4ScA 10h00                    │
└──────────┴──────────┴──────────┴──────────────────────────────────────┘
```

---

## Composant KpiCard

```tsx
interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor: string        // ex: "bg-blue-100 text-blue-600"
  trend?: { value: number; direction: 'up' | 'down'; isGood: boolean }
  href?: string
  isLoading?: boolean
  alert?: boolean          // bordure rouge si true
}
```

- Hauteur fixe : `h-20` (~80px)
- Grille : `grid-cols-2 sm:grid-cols-4` (2 colonnes mobile, 4 desktop)
- Valeur en `text-xl font-bold`
- Icône 36x36px à gauche
- Optionnel : micro-trend `↑ +3%` en vert/rouge

## Composant AttendanceWeekChart

- `BarChart` Recharts, hauteur 200px
- Barre verte si rate ≥ 80%, orange si 60-79%, rouge si < 60%
- Tooltip : "Lundi — 42/48 élèves (87%)"
- Axe Y : 0-100%
- Données : 7 jours glissants depuis aujourd'hui

## Composant PaymentTrendChart

- `AreaChart` Recharts, hauteur 200px
- 2 séries : `expected` (ligne pointillée grise) + `collected` (aire verte pâle)
- Tooltip en FC formaté
- 6 mois glissants

## Composant StatusBar

Ligne unique sticky en haut du contenu :
```
🟢 Caisse ouverte (BAHATI - depuis 08h32)  |  📋 Appel fait : 5/6 classes  |  🔄 Sync: il y a 2 min
```
- Fond `bg-[#1B5E20]/5 border-b border-[#1B5E20]/20`
- Icône couleur selon état (vert=ok, orange=attention, rouge=problème)
- Si caisse fermée : `🔴 Caisse fermée`

---

## Endpoint `getDashboardSummary` — logique serveur

Requêtes Prisma en `Promise.all` (parallèle) pour minimiser la latence :

```typescript
const [
  enrollmentStats,
  attendanceToday,
  attendanceWeek,
  absencesToday,
  gradeStats,
  financeStats,
  paymentTrend,
  recentPayments,
  cashSession,
  alerts,
  convocations,
  nextEvents,
] = await Promise.all([...])
```

Présence 7 jours : boucle sur les 7 derniers jours, `groupBy date` sur `Attendance`.

Absences du jour : `Attendance.findMany({ where: { date: today, status: 'ABSENT' } })` avec détection consécutive (3 absences de suite).

Notes progress : `Grade.count` sur termId actif / (nbElèves × nbMatières).

---

## Contraintes

- Mobile-first : sur mobile, StatusBar devient 2 lignes, KPIs en 2x2, graphiques en accordéon
- `isLoading` sur chaque composant affiche un skeleton (`animate-pulse`)
- Si données vides (école sans année active) : message d'onboarding "Configurez votre année scolaire"
- Pas de breaking change sur les endpoints existants (nouveaux s'ajoutent)
