# Dashboard Enrichi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sparse 3-card dashboard with a rich, role-adaptive dashboard featuring compact KPI cards, attendance/finance charts, and operational widgets.

**Architecture:** New `GET /api/stats/dashboard-summary` endpoint aggregates all data in one parallel Prisma call. Client uses a single TanStack Query hook feeding 6 new focused components plus a refactored DashboardPage.

**Tech Stack:** React 18 + TypeScript + TailwindCSS + Recharts + TanStack Query (client), Express + Prisma + SQLite (server)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `packages/server/src/modules/stats/stats.service.ts` (modify) | Add `getDashboardSummary()` |
| Modify | `packages/server/src/modules/stats/stats.routes.ts` | Add `GET /dashboard-summary` |
| Create | `packages/client/src/components/dashboard/KpiCard.tsx` | Compact reusable KPI card |
| Create | `packages/client/src/components/dashboard/StatusBar.tsx` | Operational status bar |
| Create | `packages/client/src/components/dashboard/AttendanceWeekChart.tsx` | 7-day attendance bar chart |
| Create | `packages/client/src/components/dashboard/PaymentTrendChart.tsx` | 6-month payment area chart |
| Create | `packages/client/src/components/dashboard/RecentPayments.tsx` | Last 5 payments widget |
| Create | `packages/client/src/components/dashboard/TodayAbsences.tsx` | Today's absences widget |
| Rewrite | `packages/client/src/pages/dashboard/DashboardPage.tsx` | Full refactor using new components |

---

### Task 1: Server — getDashboardSummary service method

**Files:**
- Modify: `packages/server/src/modules/stats/stats.service.ts`

- [ ] **Step 1: Add getDashboardSummary to StatsService**

Append this method inside the `StatsService` class at the end, before the closing `}`:

```typescript
async getDashboardSummary(schoolId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const activeYear = await prisma.academicYear.findFirst({
    where: { schoolId, isActive: true },
    include: { terms: { where: { isActive: true }, take: 1 } },
  });
  const activeTerm = activeYear?.terms[0] ?? null;

  // Run all queries in parallel
  const [
    totalStudents,
    activeClasses,
    activeTeachers,
    presentToday,
    absencesTodayRaw,
    classesDoneToday,
    weekAttendanceRaw,
    gradesCount,
    totalSubjectsStudents,
    feeTypes,
    monthPayments,
    allPayments,
    recentPaymentsRaw,
    cashSessionRaw,
    openAlerts,
    openConvocations,
    calendarEvents,
  ] = await Promise.all([
    // enrollment
    prisma.student.count({ where: { schoolId, isActive: true } }),
    // classes
    prisma.class.count({ where: { schoolId, isActive: true } }),
    // teachers
    prisma.teacher.count({ where: { schoolId, isActive: true } }),
    // present today
    prisma.attendance.count({
      where: { student: { schoolId }, date: today, status: 'PRESENT' },
    }),
    // absences today with student info
    prisma.attendance.findMany({
      where: { student: { schoolId }, date: today, status: 'ABSENT' },
      include: {
        student: {
          select: {
            id: true, nom: true, postNom: true,
            enrollments: { take: 1, orderBy: { enrolledAt: 'desc' }, include: { class: { select: { name: true } } } },
          },
        },
      },
    }),
    // classes that took roll call today
    prisma.attendance.groupBy({
      by: ['classId'],
      where: { student: { schoolId }, date: today },
    }),
    // last 7 days attendance
    prisma.attendance.findMany({
      where: {
        student: { schoolId },
        date: { gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000) },
      },
      select: { date: true, status: true },
    }),
    // grades done this term
    activeTerm
      ? prisma.grade.count({ where: { student: { schoolId }, termId: activeTerm.id } })
      : Promise.resolve(0),
    // total expected grades (students × subjects in section)
    activeYear
      ? prisma.enrollment.count({ where: { academicYearId: activeYear.id, student: { schoolId, isActive: true } } })
      : Promise.resolve(0),
    // fee types for expected amount
    activeYear
      ? prisma.feeType.findMany({ where: { schoolId, academicYearId: activeYear.id, isActive: true } })
      : Promise.resolve([]),
    // payments this month
    prisma.payment.findMany({
      where: { schoolId, paymentDate: { gte: firstOfMonth, lte: lastOfMonth } },
      select: { amountPaid: true, totalDue: true, remainingBalance: true },
    }),
    // all payments for debt calc
    prisma.payment.groupBy({
      by: ['studentId'],
      where: { schoolId },
      _sum: { remainingBalance: true },
      having: { remainingBalance: { _sum: { gt: 0 } } },
    }),
    // recent payments
    prisma.payment.findMany({
      where: { schoolId },
      orderBy: { paymentDate: 'desc' },
      take: 5,
      include: { student: { select: { nom: true, postNom: true } } },
    }),
    // cash session
    prisma.cashSession.findFirst({
      where: { schoolId, status: 'OPEN' },
      include: { cashier: { select: { nom: true, postNom: true } } },
      orderBy: { openedAt: 'desc' },
    }),
    // open alerts
    prisma.announcement.count({
      where: { schoolId, endDate: { gte: now }, priority: 'URGENT' },
    }),
    // pending convocations
    prisma.convocation.count({ where: { schoolId, status: 'PENDING' } }),
    // upcoming calendar events
    prisma.announcement.findMany({
      where: { schoolId, startDate: { gte: today }, endDate: { gte: today } },
      orderBy: { startDate: 'asc' },
      take: 3,
      select: { titre: true, startDate: true, priority: true },
    }),
  ]);

  // Compute attendance today
  const attendanceToday = {
    rate: totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0,
    present: presentToday,
    total: totalStudents,
    classesDone: classesDoneToday.length,
    classesTotal: activeClasses,
  };

  // Compute 7-day attendance
  const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const weekMap: Record<string, { present: number; total: number }> = {};
  for (const rec of weekAttendanceRaw) {
    const key = rec.date.toISOString().split('T')[0];
    if (!weekMap[key]) weekMap[key] = { present: 0, total: 0 };
    weekMap[key].total += 1;
    if (rec.status === 'PRESENT') weekMap[key].present += 1;
  }
  const attendanceWeek = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    const slot = weekMap[key] || { present: 0, total: totalStudents };
    attendanceWeek.push({
      day: DAY_NAMES[d.getDay()],
      date: key,
      rate: slot.total > 0 ? Math.round((slot.present / slot.total) * 100) : 0,
      present: slot.present,
      total: slot.total,
    });
  }

  // Absences today with consecutive detection
  const absencesToday = await Promise.all(absencesTodayRaw.map(async (a) => {
    const recent = await prisma.attendance.count({
      where: {
        studentId: a.studentId,
        status: 'ABSENT',
        date: { gte: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), lte: today },
      },
    });
    return {
      studentId: a.studentId,
      nom: a.student.nom,
      postNom: a.student.postNom,
      className: a.student.enrollments[0]?.class?.name || '—',
      isConsecutive: recent >= 3,
    };
  }));

  // Grades progress
  const subjectCount = await prisma.subjectSection.count({
    where: { section: { classes: { some: { schoolId, isActive: true } } } },
  }).catch(() => 1);
  const expectedGrades = totalSubjectsStudents * Math.max(subjectCount, 1);
  const gradesProgress = {
    done: gradesCount,
    total: expectedGrades,
    percent: expectedGrades > 0 ? Math.round((gradesCount / expectedGrades) * 100) : 0,
  };

  // Finance
  const collectedThisMonth = monthPayments.reduce((s, p) => s + p.amountPaid, 0);
  const expectedPerStudent = feeTypes.reduce((s, f) => s + f.amount, 0);
  const expectedThisMonth = expectedPerStudent * totalStudents;
  const totalDebts = allPayments.reduce((s, p) => s + (p._sum.remainingBalance || 0), 0);
  const debtorsCount = allPayments.length;
  const recoveryRate = expectedThisMonth > 0
    ? Math.round((collectedThisMonth / expectedThisMonth) * 100)
    : 0;

  // Payment trend (6 months)
  const paymentTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const label = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(d);
    const monthPays = await prisma.payment.aggregate({
      where: { schoolId, paymentDate: { gte: first, lte: last } },
      _sum: { amountPaid: true },
    });
    paymentTrend.push({
      label,
      expected: Math.round(expectedThisMonth / (i === 0 ? 1 : 1)), // approximate
      collected: monthPays._sum.amountPaid || 0,
    });
  }

  // Recent payments
  const recentPayments = recentPaymentsRaw.map((p) => ({
    studentNom: `${p.student.nom} ${p.student.postNom}`,
    amount: p.amountPaid,
    method: p.paymentMethod,
    minutesAgo: Math.round((now.getTime() - new Date(p.paymentDate).getTime()) / 60000),
  }));

  // Cash session
  const cashSession = cashSessionRaw
    ? {
        isOpen: true,
        cashierName: `${cashSessionRaw.cashier.nom} ${cashSessionRaw.cashier.postNom}`,
        openedAt: cashSessionRaw.openedAt.toISOString(),
      }
    : { isOpen: false, cashierName: null, openedAt: null };

  // Next events
  const nextEvents = calendarEvents.map((e) => ({
    title: e.titre,
    date: e.startDate.toISOString(),
    type: e.priority,
  }));

  return {
    enrollment: { total: totalStudents, bySection: {} },
    activeClasses,
    activeTeachers,
    attendanceToday,
    attendanceWeek,
    absencesToday,
    gradesProgress,
    finance: { collectedThisMonth, expectedThisMonth, totalDebts, debtorsCount, recoveryRate },
    paymentTrend,
    recentPayments,
    cashSession,
    pendingAlerts: openAlerts,
    pendingConvocations: openConvocations,
    nextEvents,
  };
}
```

- [ ] **Step 2: Add route to stats.routes.ts**

In `packages/server/src/modules/stats/stats.routes.ts`, add after the existing routes:

```typescript
router.get('/dashboard-summary', authenticate, (req, res, next) =>
  statsController.getDashboardSummary(req, res, next)
);
```

- [ ] **Step 3: Add controller method to stats.controller.ts**

In `packages/server/src/modules/stats/stats.controller.ts`, add:

```typescript
async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const schoolId = req.user!.schoolId;
    const result = await statsService.getDashboardSummary(schoolId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd packages/server && npx tsc --noEmit --skipLibCheck
```
Expected: no errors

- [ ] **Step 5: Test endpoint manually**

Start server (`npm run dev:server`), then in another terminal generate a token and call:
```bash
curl -s "http://localhost:3000/api/stats/dashboard-summary" \
  -H "Authorization: Bearer <token>" | python -m json.tool | head -60
```
Expected: JSON with `data.enrollment.total`, `data.attendanceToday`, `data.finance` fields populated.

- [ ] **Step 6: Commit**

```bash
git add packages/server/src/modules/stats/
git commit -m "feat(dashboard): add getDashboardSummary endpoint"
```

---

### Task 2: KpiCard component

**Files:**
- Create: `packages/client/src/components/dashboard/KpiCard.tsx`

- [ ] **Step 1: Create KpiCard**

```tsx
// packages/client/src/components/dashboard/KpiCard.tsx
import { type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: { value: number; direction: 'up' | 'down'; isGood: boolean };
  href?: string;
  isLoading?: boolean;
  alert?: boolean;
}

export default function KpiCard({
  title, value, subtitle, icon: Icon, iconColor,
  trend, href, isLoading, alert,
}: KpiCardProps) {
  const content = (
    <div className={cn(
      'bg-white rounded-lg border p-3 flex items-center gap-3 h-20 transition-shadow',
      alert ? 'border-red-300 bg-red-50' : 'hover:shadow-sm',
      href && 'cursor-pointer',
    )}>
      <div className={cn('p-2 rounded-lg shrink-0', iconColor)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 truncate">{title}</p>
        {isLoading ? (
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-xl font-bold text-gray-900 leading-tight truncate">{value}</p>
        )}
        {subtitle && !isLoading && (
          <p className="text-xs text-gray-400 truncate">{subtitle}</p>
        )}
      </div>
      {trend && !isLoading && (
        <div className={cn(
          'text-xs font-medium shrink-0',
          trend.isGood ? 'text-green-600' : 'text-red-600',
        )}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
        </div>
      )}
    </div>
  );

  if (href) return <Link to={href}>{content}</Link>;
  return content;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/client/src/components/dashboard/KpiCard.tsx
git commit -m "feat(dashboard): add compact KpiCard component"
```

---

### Task 3: StatusBar component

**Files:**
- Create: `packages/client/src/components/dashboard/StatusBar.tsx`

- [ ] **Step 1: Create StatusBar**

```tsx
// packages/client/src/components/dashboard/StatusBar.tsx
import { CheckCircle, XCircle, ClipboardList, RefreshCw } from 'lucide-react';

interface StatusBarProps {
  cashSession: { isOpen: boolean; cashierName: string | null; openedAt: string | null };
  classesDone: number;
  classesTotal: number;
  lastSync?: string;
}

function timeAgo(isoString: string): string {
  const mins = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
  if (mins < 1) return 'à l\'instant';
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.floor(mins / 60);
  return `il y a ${h}h`;
}

export default function StatusBar({ cashSession, classesDone, classesTotal, lastSync }: StatusBarProps) {
  const allClassesDone = classesDone >= classesTotal && classesTotal > 0;

  return (
    <div className="bg-[#1B5E20]/5 border-b border-[#1B5E20]/20 px-4 py-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
        {/* Caisse */}
        <span className="flex items-center gap-1.5">
          {cashSession.isOpen ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          )}
          {cashSession.isOpen
            ? `Caisse ouverte${cashSession.cashierName ? ` (${cashSession.cashierName})` : ''}${cashSession.openedAt ? ` · ${timeAgo(cashSession.openedAt)}` : ''}`
            : 'Caisse fermée'}
        </span>

        <span className="text-gray-300 hidden sm:inline">|</span>

        {/* Appel */}
        <span className="flex items-center gap-1.5">
          <ClipboardList className={`w-3.5 h-3.5 ${allClassesDone ? 'text-green-600' : 'text-orange-500'}`} />
          Appel : {classesDone}/{classesTotal} classe{classesTotal > 1 ? 's' : ''}
        </span>

        {lastSync && (
          <>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-gray-400" />
              Sync : {timeAgo(lastSync)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/client/src/components/dashboard/StatusBar.tsx
git commit -m "feat(dashboard): add StatusBar operational widget"
```

---

### Task 4: AttendanceWeekChart component

**Files:**
- Create: `packages/client/src/components/dashboard/AttendanceWeekChart.tsx`

- [ ] **Step 1: Create AttendanceWeekChart**

```tsx
// packages/client/src/components/dashboard/AttendanceWeekChart.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

interface DayData {
  day: string;
  date: string;
  rate: number;
  present: number;
  total: number;
}

interface Props {
  data: DayData[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DayData;
  return (
    <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium">{d.day} {new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</p>
      <p className="text-gray-600">{d.present}/{d.total} élèves — <span className="font-bold">{d.rate}%</span></p>
    </div>
  );
};

function barColor(rate: number): string {
  if (rate >= 80) return '#1B5E20';
  if (rate >= 60) return '#F57F17';
  return '#C62828';
}

export default function AttendanceWeekChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-52 bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Présence — 7 derniers jours</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4' }} />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, i) => (
              <Cell key={i} fill={barColor(entry.rate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/client/src/components/dashboard/AttendanceWeekChart.tsx
git commit -m "feat(dashboard): add AttendanceWeekChart component"
```

---

### Task 5: PaymentTrendChart component

**Files:**
- Create: `packages/client/src/components/dashboard/PaymentTrendChart.tsx`

- [ ] **Step 1: Create PaymentTrendChart**

```tsx
// packages/client/src/components/dashboard/PaymentTrendChart.tsx
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

interface MonthData {
  label: string;
  expected: number;
  collected: number;
}

interface Props {
  data: MonthData[];
  isLoading?: boolean;
}

function formatFC(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString('fr-FR')} FC
        </p>
      ))}
    </div>
  );
};

export default function PaymentTrendChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-52 bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Paiements — 6 derniers mois</h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => formatFC(v)} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: 11 }} />
          <Area
            type="monotone" dataKey="expected" name="Attendu"
            stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 3"
            fill="none" dot={false}
          />
          <Area
            type="monotone" dataKey="collected" name="Collecté"
            stroke="#1B5E20" strokeWidth={2}
            fill="url(#colorCollected)" dot={{ r: 3, fill: '#1B5E20' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/client/src/components/dashboard/PaymentTrendChart.tsx
git commit -m "feat(dashboard): add PaymentTrendChart component"
```

---

### Task 6: RecentPayments + TodayAbsences widgets

**Files:**
- Create: `packages/client/src/components/dashboard/RecentPayments.tsx`
- Create: `packages/client/src/components/dashboard/TodayAbsences.tsx`

- [ ] **Step 1: Create RecentPayments**

```tsx
// packages/client/src/components/dashboard/RecentPayments.tsx
import { Banknote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Payment {
  studentNom: string;
  amount: number;
  method: string;
  minutesAgo: number;
}

interface Props {
  payments: Payment[];
  isLoading?: boolean;
}

function timeLabel(minutes: number): string {
  if (minutes < 1) return 'à l\'instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

export default function RecentPayments({ payments, isLoading }: Props) {
  return (
    <div className="bg-white border rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-green-600" />
          Derniers paiements
        </h3>
        <Link to="/finance/payments" className="text-xs text-[#1B5E20] hover:underline flex items-center gap-0.5">
          Voir tous <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucun paiement aujourd'hui</p>
      ) : (
        <ul className="space-y-2">
          {payments.map((p, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <div className="min-w-0">
                <p className="font-medium truncate">{p.studentNom}</p>
                <p className="text-xs text-gray-400">{p.method} · {timeLabel(p.minutesAgo)}</p>
              </div>
              <span className="font-bold text-green-700 shrink-0 ml-2">
                +{p.amount.toLocaleString('fr-FR')} FC
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create TodayAbsences**

```tsx
// packages/client/src/components/dashboard/TodayAbsences.tsx
import { UserX, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AbsentStudent {
  studentId: string;
  nom: string;
  postNom: string;
  className: string;
  isConsecutive: boolean;
}

interface Props {
  absences: AbsentStudent[];
  isLoading?: boolean;
}

export default function TodayAbsences({ absences, isLoading }: Props) {
  return (
    <div className="bg-white border rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <UserX className="w-4 h-4 text-red-500" />
          Absences du jour
          {absences.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {absences.length}
            </span>
          )}
        </h3>
        <Link to="/attendance/history" className="text-xs text-[#1B5E20] hover:underline flex items-center gap-0.5">
          Historique <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : absences.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucune absence enregistrée</p>
      ) : (
        <ul className="space-y-1.5">
          {absences.slice(0, 6).map((a) => (
            <li key={a.studentId} className="flex items-center justify-between text-sm">
              <span className="truncate">
                {a.nom} {a.postNom}
                <span className="text-gray-400 text-xs ml-1">({a.className})</span>
              </span>
              {a.isConsecutive && (
                <span title="3e absence consécutive">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 ml-1" />
                </span>
              )}
            </li>
          ))}
          {absences.length > 6 && (
            <li className="text-xs text-gray-400 text-center pt-1">
              +{absences.length - 6} autres
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/client/src/components/dashboard/RecentPayments.tsx \
        packages/client/src/components/dashboard/TodayAbsences.tsx
git commit -m "feat(dashboard): add RecentPayments and TodayAbsences widgets"
```

---

### Task 7: Rewrite DashboardPage

**Files:**
- Rewrite: `packages/client/src/pages/dashboard/DashboardPage.tsx`

- [ ] **Step 1: Rewrite DashboardPage**

```tsx
// packages/client/src/pages/dashboard/DashboardPage.tsx
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth.store';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { formatFC } from '@edugoma360/shared';
import {
  Users, CalendarCheck, BookOpen, AlertTriangle,
  Wallet, TrendingDown, Building2, GraduationCap,
  UserX, ClipboardList, Receipt,
} from 'lucide-react';

import KpiCard from '../../components/dashboard/KpiCard';
import StatusBar from '../../components/dashboard/StatusBar';
import AttendanceWeekChart from '../../components/dashboard/AttendanceWeekChart';
import PaymentTrendChart from '../../components/dashboard/PaymentTrendChart';
import RecentPayments from '../../components/dashboard/RecentPayments';
import TodayAbsences from '../../components/dashboard/TodayAbsences';
import AlertsPanel from '../../components/dashboard/AlertsPanel';
import AnnouncementBanner from '../../components/dashboard/AnnouncementBanner';

interface DashboardSummary {
  enrollment: { total: number; bySection: Record<string, number> };
  activeClasses: number;
  activeTeachers: number;
  attendanceToday: { rate: number; present: number; total: number; classesDone: number; classesTotal: number };
  attendanceWeek: Array<{ day: string; date: string; rate: number; present: number; total: number }>;
  absencesToday: Array<{ studentId: string; nom: string; postNom: string; className: string; isConsecutive: boolean }>;
  gradesProgress: { done: number; total: number; percent: number };
  finance: { collectedThisMonth: number; expectedThisMonth: number; totalDebts: number; debtorsCount: number; recoveryRate: number };
  paymentTrend: Array<{ label: string; expected: number; collected: number }>;
  recentPayments: Array<{ studentNom: string; amount: number; method: string; minutesAgo: number }>;
  cashSession: { isOpen: boolean; cashierName: string | null; openedAt: string | null };
  pendingAlerts: number;
  pendingConvocations: number;
  nextEvents: Array<{ title: string; date: string; type: string }>;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'ENSEIGNANT';

  const { data: raw, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => (await api.get('/stats/dashboard-summary')).data,
    refetchInterval: 2 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  const d: DashboardSummary | undefined = raw?.data;

  // ── PRÉFET / SUPER_ADMIN ──────────────────────────────────────────
  if (role === 'SUPER_ADMIN' || role === 'PREFET') {
    return (
      <div className="space-y-0">
        <AnnouncementBanner />

        <StatusBar
          cashSession={d?.cashSession ?? { isOpen: false, cashierName: null, openedAt: null }}
          classesDone={d?.attendanceToday.classesDone ?? 0}
          classesTotal={d?.attendanceToday.classesTotal ?? 0}
        />

        <div className="space-y-4 p-0 pt-4">
          {/* Row 1 KPIs — école */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard title="Élèves inscrits" value={d?.enrollment.total ?? 0}
              subtitle="actifs cette année"
              icon={Users} iconColor="bg-blue-100 text-blue-600"
              href="/students" isLoading={isLoading} />
            <KpiCard title="Présence du jour"
              value={`${d?.attendanceToday.rate ?? 0}%`}
              subtitle={`${d?.attendanceToday.present ?? 0}/${d?.attendanceToday.total ?? 0} élèves`}
              icon={CalendarCheck} iconColor="bg-green-100 text-green-600"
              href="/attendance/roll-call" isLoading={isLoading}
              alert={(d?.attendanceToday.rate ?? 100) < 70} />
            <KpiCard title="Notes saisies"
              value={`${d?.gradesProgress.percent ?? 0}%`}
              subtitle={`${d?.gradesProgress.done ?? 0} / ${d?.gradesProgress.total ?? 0}`}
              icon={BookOpen} iconColor="bg-purple-100 text-purple-600"
              href="/grades" isLoading={isLoading} />
            <KpiCard title="Alertes actives"
              value={d?.pendingAlerts ?? 0}
              subtitle={`${d?.pendingConvocations ?? 0} convocation(s) en attente`}
              icon={AlertTriangle} iconColor="bg-red-100 text-red-500"
              href="/announcements" isLoading={isLoading}
              alert={(d?.pendingAlerts ?? 0) > 0} />
          </div>

          {/* Row 2 KPIs — finance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard title="Collecté ce mois"
              value={formatFC(d?.finance.collectedThisMonth ?? 0)}
              subtitle={`sur ${formatFC(d?.finance.expectedThisMonth ?? 0)} attendus`}
              icon={Wallet} iconColor="bg-amber-100 text-amber-600"
              href="/finance" isLoading={isLoading} />
            <KpiCard title="Taux recouvrement"
              value={`${d?.finance.recoveryRate ?? 0}%`}
              subtitle="du total attendu"
              icon={TrendingDown} iconColor="bg-orange-100 text-orange-600"
              isLoading={isLoading}
              alert={(d?.finance.recoveryRate ?? 100) < 30} />
            <KpiCard title="Créances totales"
              value={formatFC(d?.finance.totalDebts ?? 0)}
              subtitle={`${d?.finance.debtorsCount ?? 0} élèves débiteurs`}
              icon={Receipt} iconColor="bg-red-100 text-red-500"
              href="/finance/debts" isLoading={isLoading}
              alert={(d?.finance.totalDebts ?? 0) > 0} />
            <KpiCard title="Classes actives"
              value={d?.activeClasses ?? 0}
              subtitle={`${d?.activeTeachers ?? 0} enseignants`}
              icon={Building2} iconColor="bg-teal-100 text-teal-600"
              href="/settings/classes" isLoading={isLoading} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AttendanceWeekChart data={d?.attendanceWeek ?? []} isLoading={isLoading} />
            <PaymentTrendChart data={d?.paymentTrend ?? []} isLoading={isLoading} />
          </div>

          {/* Bottom widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RecentPayments payments={d?.recentPayments ?? []} isLoading={isLoading} />
            <TodayAbsences absences={d?.absencesToday ?? []} isLoading={isLoading} />
            {/* Events */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Prochains événements</h3>
              {isLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
              ) : (d?.nextEvents ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Aucun événement</p>
              ) : (
                <ul className="space-y-2">
                  {(d?.nextEvents ?? []).map((e, i) => (
                    <li key={i} className="text-sm">
                      <p className="font-medium truncate">{e.title}</p>
                      <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString('fr-FR')}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ÉCONOME ───────────────────────────────────────────────────────
  if (role === 'ECONOME') {
    return (
      <div className="space-y-4">
        <AnnouncementBanner />
        <StatusBar
          cashSession={d?.cashSession ?? { isOpen: false, cashierName: null, openedAt: null }}
          classesDone={0} classesTotal={0}
        />
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard title="Collecté ce mois" value={formatFC(d?.finance.collectedThisMonth ?? 0)}
              subtitle={`sur ${formatFC(d?.finance.expectedThisMonth ?? 0)}`}
              icon={Wallet} iconColor="bg-green-100 text-green-600"
              href="/finance" isLoading={isLoading} />
            <KpiCard title="Créances totales" value={formatFC(d?.finance.totalDebts ?? 0)}
              subtitle="montant dû"
              icon={TrendingDown} iconColor="bg-red-100 text-red-500"
              href="/finance/debts" isLoading={isLoading} alert={(d?.finance.totalDebts ?? 0) > 0} />
            <KpiCard title="Élèves débiteurs" value={d?.finance.debtorsCount ?? 0}
              subtitle="ont un solde impayé"
              icon={UserX} iconColor="bg-orange-100 text-orange-600"
              isLoading={isLoading} />
            <KpiCard title="Taux recouvrement" value={`${d?.finance.recoveryRate ?? 0}%`}
              subtitle="du total attendu"
              icon={Receipt} iconColor="bg-blue-100 text-blue-600"
              isLoading={isLoading} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PaymentTrendChart data={d?.paymentTrend ?? []} isLoading={isLoading} />
            <RecentPayments payments={d?.recentPayments ?? []} isLoading={isLoading} />
          </div>
        </div>
      </div>
    );
  }

  // ── SECRÉTAIRE ────────────────────────────────────────────────────
  if (role === 'SECRETAIRE') {
    return (
      <div className="space-y-4">
        <AnnouncementBanner />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard title="Élèves inscrits" value={d?.enrollment.total ?? 0}
            icon={Users} iconColor="bg-blue-100 text-blue-600"
            href="/students" isLoading={isLoading} />
          <KpiCard title="Présence du jour" value={`${d?.attendanceToday.rate ?? 0}%`}
            subtitle={`${d?.attendanceToday.present ?? 0}/${d?.attendanceToday.total ?? 0}`}
            icon={CalendarCheck} iconColor="bg-green-100 text-green-600" isLoading={isLoading} />
          <KpiCard title="Convocations" value={d?.pendingConvocations ?? 0}
            subtitle="en attente"
            icon={ClipboardList} iconColor="bg-orange-100 text-orange-600"
            href="/convocations" isLoading={isLoading} />
          <KpiCard title="Alertes" value={d?.pendingAlerts ?? 0}
            icon={AlertTriangle} iconColor="bg-red-100 text-red-500"
            isLoading={isLoading} alert={(d?.pendingAlerts ?? 0) > 0} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TodayAbsences absences={d?.absencesToday ?? []} isLoading={isLoading} />
          <RecentPayments payments={d?.recentPayments ?? []} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  // ── ENSEIGNANT ────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <AnnouncementBanner />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Présence aujourd'hui" value={`${d?.attendanceToday.rate ?? 0}%`}
          icon={CalendarCheck} iconColor="bg-green-100 text-green-600"
          href="/attendance/roll-call" isLoading={isLoading} />
        <KpiCard title="Mes classes" value={d?.activeClasses ?? 0}
          icon={Building2} iconColor="bg-blue-100 text-blue-600"
          href="/classes" isLoading={isLoading} />
        <KpiCard title="Notes saisies" value={`${d?.gradesProgress.percent ?? 0}%`}
          icon={GraduationCap} iconColor="bg-purple-100 text-purple-600"
          href="/grades" isLoading={isLoading} />
        <KpiCard title="Alertes" value={d?.pendingAlerts ?? 0}
          icon={AlertTriangle} iconColor="bg-red-100 text-red-500"
          isLoading={isLoading} />
      </div>
      <AttendanceWeekChart data={d?.attendanceWeek ?? []} isLoading={isLoading} />
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd packages/client && npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | head -10
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add packages/client/src/pages/dashboard/DashboardPage.tsx \
        packages/client/src/components/dashboard/
git commit -m "feat(dashboard): full enriched dashboard with role-based views"
```

---

### Task 8: Final verification

- [ ] **Step 1: Full TypeScript check**

```bash
cd packages/server && npx tsc --noEmit --skipLibCheck && echo "Server OK"
cd ../client && npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "error" && echo "Client OK"
```
Expected: `Server OK`, `0`, `Client OK`

- [ ] **Step 2: Verify endpoint is accessible**

With server running: `curl -s http://localhost:3000/api/stats/dashboard-summary -H "Authorization: Bearer <token>" | python -m json.tool | head -30`
Expected: JSON with all required keys.

- [ ] **Step 3: Visual check per role in browser**

Navigate to `/dashboard` as PREFET — verify:
- StatusBar shows cash session state
- 8 KPI cards in 2 rows of 4
- 2 charts side by side
- 3 bottom widgets

Navigate to `/dashboard` as ECONOME — verify 4 finance KPIs + chart + recent payments.
