# Portail Parent — SCR-037, SCR-038, SCR-039

## Objectif

Implémenter les 3 pages manquantes du portail parent : Notes, Absences, Paiements.
Le parent accède en lecture seule aux données de son/ses enfant(s).

## Fichiers à créer

### Serveur

| Fichier | Rôle |
|---------|------|
| `packages/server/src/modules/parent/parent.routes.ts` | Routes API read-only |
| `packages/server/src/modules/parent/parent.service.ts` | Logique métier |

### Client

| Fichier | Rôle |
|---------|------|
| `packages/client/src/hooks/useParentPortal.ts` | Hook TanStack Query |
| `packages/client/src/pages/parent-portal/ParentGradesPage.tsx` | SCR-037 |
| `packages/client/src/pages/parent-portal/ParentAttendancePage.tsx` | SCR-038 |
| `packages/client/src/pages/parent-portal/ParentPaymentsPage.tsx` | SCR-039 |

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `packages/server/src/app.ts` | Ajouter `app.use('/api/parent', parentRoutes)` |
| `packages/client/src/router.tsx` | Ajouter les 3 routes `/parent/grades`, `/parent/attendance`, `/parent/payments` |
| `packages/client/src/pages/parent-portal/ParentHomePage.tsx` | Ajouter liens navigation vers les 3 sous-pages |

## API Endpoints

### GET /api/parent/children

Retourne la liste des enfants associés au parent connecté.

```typescript
Response 200:
{
  children: Array<{
    id: string;
    nom: string;
    postNom: string;
    prenom: string | null;
    matricule: string;
    photoUrl: string | null;
    className: string;
    classId: string;
    lastAverage: number | null;
    attendanceRate: number | null;
    balance: number; // solde dû (positif = dette)
  }>
}
```

### GET /api/parent/children/:studentId/grades

Query params: `termId` (optionnel, défaut = trimestre actif)

```typescript
Response 200:
{
  student: { nom, postNom, prenom, className },
  term: { id, label, number },
  grades: Array<{
    subjectName: string;
    subjectAbbr: string;
    maxScore: number;
    scores: Array<{ evalType: string; score: number }>;
    average: number | null;
  }>,
  summary: {
    generalAverage: number | null;
    rank: number | null;
    totalStudents: number;
    decision: string | null; // si délibération effectuée
  },
  availableTerms: Array<{ id: string; label: string; number: number }>
}
```

### GET /api/parent/children/:studentId/attendance

Query params: `termId` (optionnel, défaut = trimestre actif)

```typescript
Response 200:
{
  student: { nom, postNom, prenom, className },
  stats: {
    totalDays: number;
    presentDays: number;
    absentJustified: number;
    absentUnjustified: number;
    lateDays: number;
    attendanceRate: number; // pourcentage
  },
  absences: Array<{
    date: string;
    period: string;
    status: string; // ABSENT, LATE
    justification: string | null;
    isJustified: boolean;
  }>,
  availableTerms: Array<{ id: string; label: string; number: number }>
}
```

### GET /api/parent/children/:studentId/payments

```typescript
Response 200:
{
  student: { nom, postNom, prenom, className },
  summary: {
    totalDue: number;
    totalPaid: number;
    balance: number; // totalDue - totalPaid
  },
  payments: Array<{
    id: string;
    date: string;
    feeName: string;
    amount: number;
    paymentMethod: string;
    receiptNumber: string;
    receiptUrl: string | null;
  }>,
  unpaidFees: Array<{
    feeName: string;
    amount: number;
    amountPaid: number;
    remaining: number;
  }>
}
```

## UI — SCR-037 Notes

```
┌──────────────────────────────────────────────────────┐
│ 📚 Notes de AMISI Jean-Baptiste (4ScA)               │
│ Trimestre : [T1 ▼]                                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌─────────────────────────────────────────────────┐  │
│ │ Moyenne générale : 14.5/20 — Rang : 3ème/32     │  │
│ │ Décision : Admis                                │  │
│ │ [📄 Télécharger bulletin PDF]                    │  │
│ └─────────────────────────────────────────────────┘  │
│                                                      │
│ Matière       │ Interro │ Examen │ Moy  │ Max │ Obs │
│───────────────┼─────────┼────────┼──────┼─────┼─────│
│ Mathématiques │ 15      │ 14     │ 14.5 │ 20  │     │
│ Français      │ 12      │ 16     │ 14   │ 20  │     │
│ Physique      │ 8       │ 10     │ 9    │ 20  │ ⚠️  │
│ ...           │         │        │      │     │     │
└──────────────────────────────────────────────────────┘
```

## UI — SCR-038 Absences

```
┌──────────────────────────────────────────────────────┐
│ 📅 Absences de AMISI Jean-Baptiste (4ScA)            │
│ Trimestre : [T1 ▼]                                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│ │ Présent  │ │ Justifié │ │ Non just.│ │ Taux    │ │
│ │ 52 jours │ │ 3 jours  │ │ 1 jour   │ │ 93%     │ │
│ └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
│                                                      │
│ Date       │ Période  │ Statut    │ Motif           │
│────────────┼──────────┼───────────┼─────────────────│
│ 15/03/2026 │ Matin    │ 🟢 Justifié│ Maladie (cert.)│
│ 02/03/2026 │ Après-midi│ 🔴 Non just│ —              │
│ ...        │          │           │                 │
└──────────────────────────────────────────────────────┘
```

## UI — SCR-039 Paiements

```
┌──────────────────────────────────────────────────────┐
│ 💰 Paiements de AMISI Jean-Baptiste (4ScA)           │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │
│ │ Total dû │ │ Payé     │ │ Solde restant        │  │
│ │ 450,000  │ │ 350,000  │ │ 🔴 100,000 FC        │  │
│ └──────────┘ └──────────┘ └──────────────────────┘  │
│                                                      │
│ HISTORIQUE DES PAIEMENTS                             │
│ Date       │ Type frais    │ Montant  │ Mode │ Reçu │
│────────────┼───────────────┼──────────┼──────┼──────│
│ 15/01/2026 │ Minerval T1   │ 150,000  │ Cash │ [📄] │
│ 20/02/2026 │ Fonctionnement│ 200,000  │ Mobile│[📄] │
│                                                      │
│ FRAIS IMPAYÉS                                        │
│ ┌─────────────────────────────────────────────────┐  │
│ │ Minerval T2 : 150,000 FC (0 payé)              │  │
│ │ Examen T1  : 50,000 FC (50,000 payé, reste 0)  │  │
│ └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Navigation

La page `ParentHomePage` sera enrichie avec une barre de navigation :

```
[Accueil] [Notes] [Absences] [Paiements]
```

Si le parent a plusieurs enfants : sélecteur d'enfant dans chaque page de détail.

## Sécurité

- Middleware `requireRole('PARENT')` sur toutes les routes `/api/parent/*`
- Le service vérifie que `student.parentUserId === req.user.id` avant de retourner les données
- Aucune opération d'écriture (POST/PUT/DELETE) disponible
- Les URLs de reçu PDF passent par une vérification d'appartenance

## Contraintes techniques

- Mobile-first : les tableaux passent en mode carte sur mobile (< 640px)
- Les données sont cachées avec `staleTime: 60_000` (1 minute) car lecture seule
- Swahili : non implémenté dans cette itération (français uniquement)
- Offline : pas de support Dexie pour le portail parent (données fraîches requises)
