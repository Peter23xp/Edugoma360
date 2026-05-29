# Parent Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 3 read-only parent portal pages (Notes, Absences, Paiements) with their backend API.

**Architecture:** New server module `parent/` exposes 4 GET endpoints authenticated as PARENT role. Data is fetched from existing Prisma models (Grade, Attendance, Payment) filtered by `student.parentUserId`. Client uses a single `useParentPortal` hook feeding 3 page components.

**Tech Stack:** Express + Prisma (server), React + TanStack Query + TailwindCSS (client)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `packages/server/src/modules/parent/parent.service.ts` | Business logic: fetch children, grades, attendance, payments |
| Create | `packages/server/src/modules/parent/parent.routes.ts` | Express router with 4 GET endpoints |
| Create | `packages/client/src/hooks/useParentPortal.ts` | TanStack Query hook for all parent API calls |
| Create | `packages/client/src/pages/parent-portal/ParentGradesPage.tsx` | SCR-037 |
| Create | `packages/client/src/pages/parent-portal/ParentAttendancePage.tsx` | SCR-038 |
| Create | `packages/client/src/pages/parent-portal/ParentPaymentsPage.tsx` | SCR-039 |
| Modify | `packages/server/src/app.ts` | Register `/api/parent` route |
| Modify | `packages/client/src/router.tsx` | Add 3 parent routes |
| Modify | `packages/client/src/pages/parent-portal/ParentHomePage.tsx` | Add nav tabs + child selector |

---

### Task 1: Server — Parent Service

**Files:**
- Create: `packages/server/src/modules/parent/parent.service.ts`

- [ ] **Step 1: Create the parent service with getChildren**

```typescript
// packages/server/src/modules/parent/parent.service.ts
import prisma from '../../lib/prisma';

export class ParentService {
  async getChildren(parentUserId: string) {
    const students = await prisma.student.findMany({
      where: { parentUserId, isActive: true },
      include: {
        enrollments: {
          orderBy: { enrolledAt: 'desc' },
          take: 1,
          include: { class: { select: { id: true, name: true } } },
        },
      },
    });

    const results = [];
    for (const student of students) {
      const className = student.enrollments[0]?.class?.name || '—';
      const classId = student.enrollments[0]?.class?.id || null;

      // Last average
      const activeTerm = await prisma.term.findFirst({
        where: { academicYear: { school: { students: { some: { id: student.id } } } }, isActive: true },
      });

      let lastAverage: number | null = null;
      if (activeTerm) {
        const grades = await prisma.grade.findMany({
          where: { studentId: student.id, termId: activeTerm.id },
        });
        if (grades.length > 0) {
          lastAverage = Math.round((grades.reduce((s, g) => s + g.score, 0) / grades.length) * 10) / 10;
        }
      }

      // Attendance rate
      const totalAttendance = await prisma.attendance.count({
        where: { studentId: student.id, ...(activeTerm ? { termId: activeTerm.id } : {}) },
      });
      const presentCount = await prisma.attendance.count({
        where: { studentId: student.id, status: 'PRESENT', ...(activeTerm ? { termId: activeTerm.id } : {}) },
      });
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : null;

      // Balance
      const payments = await prisma.payment.findMany({
        where: { studentId: student.id },
        select: { totalDue: true, amountPaid: true },
      });
      const totalDue = payments.reduce((s, p) => s + p.totalDue, 0);
      const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0);
      const balance = totalDue - totalPaid;

      results.push({
        id: student.id,
        nom: student.nom,
        postNom: student.postNom,
        prenom: student.prenom,
        matricule: student.matricule,
        photoUrl: student.photoUrl,
        className,
        classId,
        lastAverage,
        attendanceRate,
        balance,
      });
    }

    return results;
  }

  async verifyParentOwnership(parentUserId: string, studentId: string) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, parentUserId },
    });
    if (!student) throw new Error('Accès refusé : cet élève ne vous appartient pas');
    return student;
  }

  async getGrades(parentUserId: string, studentId: string, termId?: string) {
    await this.verifyParentOwnership(parentUserId, studentId);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          orderBy: { enrolledAt: 'desc' },
          take: 1,
          include: { class: { select: { name: true, sectionId: true } } },
        },
      },
    });
    if (!student) throw new Error('Élève non trouvé');

    const enrollment = student.enrollments[0];
    const className = enrollment?.class?.name || '—';
    const sectionId = enrollment?.class?.sectionId;

    // Get available terms
    const activeYear = await prisma.academicYear.findFirst({
      where: { school: { students: { some: { id: studentId } } }, isActive: true },
      include: { terms: { orderBy: { number: 'asc' } } },
    });
    const availableTerms = activeYear?.terms.map(t => ({ id: t.id, label: t.label, number: t.number })) || [];

    // Resolve termId
    const resolvedTermId = termId || availableTerms.find(t => t.number === activeYear?.terms.find(tt => tt.isActive)?.number)?.id || availableTerms[0]?.id;
    if (!resolvedTermId) return { student: { nom: student.nom, postNom: student.postNom, prenom: student.prenom, className }, term: null, grades: [], summary: { generalAverage: null, rank: null, totalStudents: 0, decision: null }, availableTerms };

    const term = availableTerms.find(t => t.id === resolvedTermId)!;

    // Get subjects for this section
    const subjects = sectionId ? await prisma.subjectSection.findMany({
      where: { sectionId },
      include: { subject: true },
    }) : [];

    // Get grades
    const grades = await prisma.grade.findMany({
      where: { studentId, termId: resolvedTermId },
      include: { subject: { select: { id: true, name: true, abbreviation: true, maxScore: true } } },
    });

    // Group by subject
    const gradesBySubject = subjects.map(ss => {
      const subjectGrades = grades.filter(g => g.subjectId === ss.subjectId);
      const scores = subjectGrades.map(g => ({ evalType: g.evalType, score: g.score }));
      const average = scores.length > 0 ? Math.round((scores.reduce((s, sc) => s + sc.score, 0) / scores.length) * 10) / 10 : null;
      return {
        subjectName: ss.subject.name,
        subjectAbbr: ss.subject.abbreviation,
        maxScore: ss.subject.maxScore,
        scores,
        average,
      };
    });

    // General average
    const validAverages = gradesBySubject.filter(g => g.average !== null).map(g => g.average!);
    const generalAverage = validAverages.length > 0 ? Math.round((validAverages.reduce((s, a) => s + a, 0) / validAverages.length) * 10) / 10 : null;

    // Rank
    const delibResult = await prisma.delibResult.findFirst({
      where: { studentId, deliberation: { termId: resolvedTermId } },
    });

    // Total students in class
    const totalStudents = enrollment ? await prisma.enrollment.count({
      where: { classId: enrollment.classId, academicYear: { isActive: true } },
    }) : 0;

    return {
      student: { nom: student.nom, postNom: student.postNom, prenom: student.prenom, className },
      term,
      grades: gradesBySubject,
      summary: {
        generalAverage,
        rank: delibResult?.rank || null,
        totalStudents,
        decision: delibResult?.decision || null,
      },
      availableTerms,
    };
  }

  async getAttendance(parentUserId: string, studentId: string, termId?: string) {
    await this.verifyParentOwnership(parentUserId, studentId);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          orderBy: { enrolledAt: 'desc' },
          take: 1,
          include: { class: { select: { name: true } } },
        },
      },
    });
    if (!student) throw new Error('Élève non trouvé');
    const className = student.enrollments[0]?.class?.name || '—';

    // Available terms
    const activeYear = await prisma.academicYear.findFirst({
      where: { school: { students: { some: { id: studentId } } }, isActive: true },
      include: { terms: { orderBy: { number: 'asc' } } },
    });
    const availableTerms = activeYear?.terms.map(t => ({ id: t.id, label: t.label, number: t.number })) || [];
    const resolvedTermId = termId || activeYear?.terms.find(t => t.isActive)?.id || availableTerms[0]?.id;

    const where: any = { studentId };
    if (resolvedTermId) where.termId = resolvedTermId;

    const records = await prisma.attendance.findMany({
      where,
      include: {
        justifications: { select: { reason: true, status: true } },
      },
      orderBy: { date: 'desc' },
    });

    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'PRESENT').length;
    const absentRecords = records.filter(r => r.status === 'ABSENT' || r.status === 'LATE');
    const absentJustified = absentRecords.filter(r => r.justifications.some(j => j.status === 'APPROVED')).length;
    const absentUnjustified = absentRecords.filter(r => r.status === 'ABSENT' && !r.justifications.some(j => j.status === 'APPROVED')).length;
    const lateDays = records.filter(r => r.status === 'LATE').length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    const absences = absentRecords.map(r => ({
      date: r.date.toISOString().split('T')[0],
      period: r.period,
      status: r.status,
      justification: r.justifications.find(j => j.status === 'APPROVED')?.reason || null,
      isJustified: r.justifications.some(j => j.status === 'APPROVED'),
    }));

    return {
      student: { nom: student.nom, postNom: student.postNom, prenom: student.prenom, className },
      stats: { totalDays, presentDays, absentJustified, absentUnjustified, lateDays, attendanceRate },
      absences,
      availableTerms,
    };
  }

  async getPayments(parentUserId: string, studentId: string) {
    await this.verifyParentOwnership(parentUserId, studentId);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          orderBy: { enrolledAt: 'desc' },
          take: 1,
          include: { class: { select: { name: true } } },
        },
      },
    });
    if (!student) throw new Error('Élève non trouvé');
    const className = student.enrollments[0]?.class?.name || '—';

    const payments = await prisma.payment.findMany({
      where: { studentId },
      include: {
        feePayments: { include: { fee: { select: { name: true } } } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0);
    const totalDue = payments.reduce((s, p) => s + p.totalDue, 0);

    const paymentList = payments.map(p => ({
      id: p.id,
      date: p.paymentDate.toISOString().split('T')[0],
      feeName: p.feePayments.map(fp => fp.fee.name).join(', '),
      amount: p.amountPaid,
      paymentMethod: p.paymentMethod,
      receiptNumber: p.receiptNumber,
      receiptUrl: `/api/payments/${p.id}/receipt`,
    }));

    // Unpaid fees
    const activeYear = await prisma.academicYear.findFirst({
      where: { school: { students: { some: { id: studentId } } }, isActive: true },
    });
    const feeTypes = activeYear ? await prisma.feeType.findMany({
      where: { schoolId: student.schoolId, academicYearId: activeYear.id, isActive: true },
    }) : [];

    const unpaidFees = feeTypes.map(fee => {
      const paidForThisFee = payments
        .flatMap(p => p.feePayments)
        .filter(fp => fp.feeId === fee.id)
        .reduce((s, fp) => s + fp.amountPaid, 0);
      return {
        feeName: fee.name,
        amount: fee.amount,
        amountPaid: paidForThisFee,
        remaining: Math.max(0, fee.amount - paidForThisFee),
      };
    }).filter(f => f.remaining > 0);

    const totalUnpaid = unpaidFees.reduce((s, f) => s + f.remaining, 0);

    return {
      student: { nom: student.nom, postNom: student.postNom, prenom: student.prenom, className },
      summary: { totalDue: totalPaid + totalUnpaid, totalPaid, balance: totalUnpaid },
      payments: paymentList,
      unpaidFees,
    };
  }
}

export const parentService = new ParentService();
```

- [ ] **Step 2: Commit**

```bash
git add packages/server/src/modules/parent/parent.service.ts
git commit -m "feat(parent): add parent portal service with grades, attendance, payments"
```

---

### Task 2: Server — Parent Routes

**Files:**
- Create: `packages/server/src/modules/parent/parent.routes.ts`
- Modify: `packages/server/src/app.ts`

- [ ] **Step 1: Create routes file**

```typescript
// packages/server/src/modules/parent/parent.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { parentService } from './parent.service';

const router = Router();
router.use(authenticate);
router.use(requireRole('PARENT'));

router.get('/children', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Non autorisé' });
    const children = await parentService.getChildren(userId);
    res.json(children);
  } catch (e) { next(e); }
});

router.get('/children/:studentId/grades', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Non autorisé' });
    const { studentId } = req.params;
    const { termId } = req.query;
    const data = await parentService.getGrades(userId, studentId, termId as string | undefined);
    res.json(data);
  } catch (e) { next(e); }
});

router.get('/children/:studentId/attendance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Non autorisé' });
    const { studentId } = req.params;
    const { termId } = req.query;
    const data = await parentService.getAttendance(userId, studentId, termId as string | undefined);
    res.json(data);
  } catch (e) { next(e); }
});

router.get('/children/:studentId/payments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Non autorisé' });
    const { studentId } = req.params;
    const data = await parentService.getPayments(userId, studentId);
    res.json(data);
  } catch (e) { next(e); }
});

export default router;
```

- [ ] **Step 2: Register in app.ts**

Add after the `usersRoutes` import at the top:
```typescript
import parentRoutes from './modules/parent/parent.routes';
```

Add after `app.use('/api/users', usersRoutes);`:
```typescript
app.use('/api/parent', parentRoutes);
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/server && npx tsc --noEmit --skipLibCheck`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add packages/server/src/modules/parent/parent.routes.ts packages/server/src/app.ts
git commit -m "feat(parent): add parent API routes with role guard"
```

---

### Task 3: Client — useParentPortal Hook

**Files:**
- Create: `packages/client/src/hooks/useParentPortal.ts`

- [ ] **Step 1: Create the hook**

```typescript
// packages/client/src/hooks/useParentPortal.ts
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface ParentChild {
  id: string;
  nom: string;
  postNom: string;
  prenom: string | null;
  matricule: string;
  photoUrl: string | null;
  className: string;
  classId: string | null;
  lastAverage: number | null;
  attendanceRate: number | null;
  balance: number;
}

export interface GradeEntry {
  subjectName: string;
  subjectAbbr: string;
  maxScore: number;
  scores: { evalType: string; score: number }[];
  average: number | null;
}

export interface GradesData {
  student: { nom: string; postNom: string; prenom: string | null; className: string };
  term: { id: string; label: string; number: number } | null;
  grades: GradeEntry[];
  summary: {
    generalAverage: number | null;
    rank: number | null;
    totalStudents: number;
    decision: string | null;
  };
  availableTerms: { id: string; label: string; number: number }[];
}

export interface AbsenceEntry {
  date: string;
  period: string;
  status: string;
  justification: string | null;
  isJustified: boolean;
}

export interface AttendanceData {
  student: { nom: string; postNom: string; prenom: string | null; className: string };
  stats: {
    totalDays: number;
    presentDays: number;
    absentJustified: number;
    absentUnjustified: number;
    lateDays: number;
    attendanceRate: number;
  };
  absences: AbsenceEntry[];
  availableTerms: { id: string; label: string; number: number }[];
}

export interface PaymentEntry {
  id: string;
  date: string;
  feeName: string;
  amount: number;
  paymentMethod: string;
  receiptNumber: string;
  receiptUrl: string | null;
}

export interface PaymentsData {
  student: { nom: string; postNom: string; prenom: string | null; className: string };
  summary: { totalDue: number; totalPaid: number; balance: number };
  payments: PaymentEntry[];
  unpaidFees: { feeName: string; amount: number; amountPaid: number; remaining: number }[];
}

export function useParentChildren() {
  return useQuery<ParentChild[]>({
    queryKey: ['parent-children'],
    queryFn: async () => (await api.get('/parent/children')).data,
    staleTime: 60_000,
  });
}

export function useParentGrades(studentId: string | null, termId?: string) {
  return useQuery<GradesData>({
    queryKey: ['parent-grades', studentId, termId],
    queryFn: async () => {
      const params: any = {};
      if (termId) params.termId = termId;
      return (await api.get(`/parent/children/${studentId}/grades`, { params })).data;
    },
    enabled: !!studentId,
    staleTime: 60_000,
  });
}

export function useParentAttendance(studentId: string | null, termId?: string) {
  return useQuery<AttendanceData>({
    queryKey: ['parent-attendance', studentId, termId],
    queryFn: async () => {
      const params: any = {};
      if (termId) params.termId = termId;
      return (await api.get(`/parent/children/${studentId}/attendance`, { params })).data;
    },
    enabled: !!studentId,
    staleTime: 60_000,
  });
}

export function useParentPayments(studentId: string | null) {
  return useQuery<PaymentsData>({
    queryKey: ['parent-payments', studentId],
    queryFn: async () => (await api.get(`/parent/children/${studentId}/payments`)).data,
    enabled: !!studentId,
    staleTime: 60_000,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/client/src/hooks/useParentPortal.ts
git commit -m "feat(parent): add useParentPortal hooks"
```

---

### Task 4: Client — ParentGradesPage (SCR-037)

**Files:**
- Create: `packages/client/src/pages/parent-portal/ParentGradesPage.tsx`

- [ ] **Step 1: Create the grades page**

```tsx
// packages/client/src/pages/parent-portal/ParentGradesPage.tsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GraduationCap, Download, AlertTriangle } from 'lucide-react';
import { useParentChildren, useParentGrades } from '../../hooks/useParentPortal';
import api from '../../lib/api';

export default function ParentGradesPage() {
  const [searchParams] = useSearchParams();
  const childIdParam = searchParams.get('child');

  const { data: children } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState<string | null>(childIdParam);
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>();

  const activeChildId = selectedChild || children?.[0]?.id || null;
  const { data, isLoading } = useParentGrades(activeChildId, selectedTerm);

  const handleDownloadBulletin = async () => {
    if (!activeChildId || !data?.term) return;
    try {
      const res = await api.get(`/bulletin/${activeChildId}/${data.term.id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin_${data.student.nom}_${data.term.label}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* toast error handled by interceptor */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#1B5E20]" />
          Notes
        </h1>
        {data?.term && (
          <button
            onClick={handleDownloadBulletin}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#2E7D32] text-sm"
          >
            <Download className="w-4 h-4" />
            Télécharger bulletin
          </button>
        )}
      </div>

      {/* Child selector + Term selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        {children && children.length > 1 && (
          <select
            value={activeChildId || ''}
            onChange={(e) => { setSelectedChild(e.target.value); setSelectedTerm(undefined); }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.nom} {c.postNom} ({c.className})</option>
            ))}
          </select>
        )}
        {data?.availableTerms && data.availableTerms.length > 0 && (
          <select
            value={selectedTerm || data.term?.id || ''}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {data.availableTerms.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Summary card */}
      {data?.summary.generalAverage !== null && (
        <div className="bg-white border rounded-lg p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Moyenne générale</p>
              <p className="text-2xl font-bold text-[#1B5E20]">{data.summary.generalAverage}/20</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rang</p>
              <p className="text-2xl font-bold">{data.summary.rank ? `${data.summary.rank}ème` : '—'}/{data.summary.totalStudents}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Matières</p>
              <p className="text-2xl font-bold">{data.grades.length}</p>
            </div>
            {data.summary.decision && (
              <div>
                <p className="text-sm text-gray-500">Décision</p>
                <p className="text-lg font-bold text-[#1B5E20]">{data.summary.decision}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grades table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement des notes...</div>
      ) : !data || data.grades.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Aucune note disponible pour ce trimestre</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3 font-medium">Matière</th>
                {data.grades[0]?.scores.length > 0 && data.grades[0].scores.map((_, i) => (
                  <th key={i} className="text-center p-3 font-medium">{data.grades[0].scores[i]?.evalType || `Eval ${i+1}`}</th>
                ))}
                <th className="text-center p-3 font-medium">Moyenne</th>
                <th className="text-center p-3 font-medium">Max</th>
              </tr>
            </thead>
            <tbody>
              {data.grades.map((grade) => {
                const isLow = grade.average !== null && grade.maxScore > 0 && (grade.average / grade.maxScore) < 0.5;
                return (
                  <tr key={grade.subjectAbbr} className={`border-b ${isLow ? 'bg-red-50' : ''}`}>
                    <td className="p-3 font-medium">
                      {grade.subjectName}
                      {isLow && <AlertTriangle className="inline w-3 h-3 text-red-500 ml-1" />}
                    </td>
                    {grade.scores.map((s, i) => (
                      <td key={i} className="text-center p-3">{s.score}</td>
                    ))}
                    {grade.scores.length === 0 && <td className="text-center p-3 text-gray-400">—</td>}
                    <td className="text-center p-3 font-bold">{grade.average !== null ? grade.average : '—'}</td>
                    <td className="text-center p-3 text-gray-500">{grade.maxScore}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/client/src/pages/parent-portal/ParentGradesPage.tsx
git commit -m "feat(parent): add ParentGradesPage (SCR-037)"
```

---

### Task 5: Client — ParentAttendancePage (SCR-038)

**Files:**
- Create: `packages/client/src/pages/parent-portal/ParentAttendancePage.tsx`

- [ ] **Step 1: Create the attendance page**

```tsx
// packages/client/src/pages/parent-portal/ParentAttendancePage.tsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { useParentChildren, useParentAttendance } from '../../hooks/useParentPortal';

export default function ParentAttendancePage() {
  const [searchParams] = useSearchParams();
  const childIdParam = searchParams.get('child');

  const { data: children } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState<string | null>(childIdParam);
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>();

  const activeChildId = selectedChild || children?.[0]?.id || null;
  const { data, isLoading } = useParentAttendance(activeChildId, selectedTerm);

  const statsCards = data ? [
    { label: 'Présent', value: `${data.stats.presentDays} j`, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Justifié', value: `${data.stats.absentJustified} j`, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
    { label: 'Non justifié', value: `${data.stats.absentUnjustified} j`, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Taux', value: `${data.stats.attendanceRate}%`, icon: CalendarCheck, color: 'text-blue-600 bg-blue-50' },
  ] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <CalendarCheck className="w-5 h-5 text-[#1B5E20]" />
        Absences
      </h1>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-3">
        {children && children.length > 1 && (
          <select
            value={activeChildId || ''}
            onChange={(e) => { setSelectedChild(e.target.value); setSelectedTerm(undefined); }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.nom} {c.postNom} ({c.className})</option>
            ))}
          </select>
        )}
        {data?.availableTerms && data.availableTerms.length > 0 && (
          <select
            value={selectedTerm || data.availableTerms.find(t => t.id)?.id || ''}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {data.availableTerms.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsCards.map((card) => (
            <div key={card.label} className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Absences list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : !data || data.absences.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Aucune absence enregistrée</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Période</th>
                <th className="text-left p-3 font-medium">Statut</th>
                <th className="text-left p-3 font-medium">Motif</th>
              </tr>
            </thead>
            <tbody>
              {data.absences.map((absence, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3">{new Date(absence.date).toLocaleDateString('fr-FR')}</td>
                  <td className="p-3 capitalize">{absence.period}</td>
                  <td className="p-3">
                    {absence.isJustified ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" /> Justifié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                        <XCircle className="w-3 h-3" /> Non justifié
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-gray-600">{absence.justification || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/client/src/pages/parent-portal/ParentAttendancePage.tsx
git commit -m "feat(parent): add ParentAttendancePage (SCR-038)"
```

---

### Task 6: Client — ParentPaymentsPage (SCR-039)

**Files:**
- Create: `packages/client/src/pages/parent-portal/ParentPaymentsPage.tsx`

- [ ] **Step 1: Create the payments page**

```tsx
// packages/client/src/pages/parent-portal/ParentPaymentsPage.tsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wallet, Download, AlertCircle } from 'lucide-react';
import { useParentChildren, useParentPayments } from '../../hooks/useParentPortal';
import { formatFC } from '@edugoma360/shared';
import api from '../../lib/api';

export default function ParentPaymentsPage() {
  const [searchParams] = useSearchParams();
  const childIdParam = searchParams.get('child');

  const { data: children } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState<string | null>(childIdParam);

  const activeChildId = selectedChild || children?.[0]?.id || null;
  const { data, isLoading } = useParentPayments(activeChildId);

  const handleDownloadReceipt = async (paymentId: string, receiptNumber: string) => {
    try {
      const res = await api.get(`/payments/${paymentId}/receipt`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu_${receiptNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* handled by interceptor */ }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Wallet className="w-5 h-5 text-[#1B5E20]" />
        Paiements
      </h1>

      {/* Child selector */}
      {children && children.length > 1 && (
        <select
          value={activeChildId || ''}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.nom} {c.postNom} ({c.className})</option>
          ))}
        </select>
      )}

      {/* Summary */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Total dû</p>
            <p className="text-xl font-bold">{formatFC(data.summary.totalDue)}</p>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Total payé</p>
            <p className="text-xl font-bold text-green-600">{formatFC(data.summary.totalPaid)}</p>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Solde restant</p>
            <p className={`text-xl font-bold ${data.summary.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {data.summary.balance > 0 ? `🔴 ${formatFC(data.summary.balance)}` : '✅ Soldé'}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : !data ? (
        <div className="text-center py-12 text-gray-500">Aucune donnée disponible</div>
      ) : (
        <>
          {/* Payments history */}
          {data.payments.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Historique des paiements</h2>
              <div className="bg-white border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Type de frais</th>
                      <th className="text-right p-3 font-medium">Montant</th>
                      <th className="text-left p-3 font-medium">Mode</th>
                      <th className="text-center p-3 font-medium">Reçu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="p-3">{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                        <td className="p-3">{p.feeName}</td>
                        <td className="p-3 text-right font-medium">{formatFC(p.amount)}</td>
                        <td className="p-3 text-gray-600">{p.paymentMethod}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDownloadReceipt(p.id, p.receiptNumber)}
                            className="text-[#1B5E20] hover:underline text-xs"
                            title="Télécharger reçu"
                          >
                            <Download className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Unpaid fees */}
          {data.unpaidFees.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Frais impayés
              </h2>
              <div className="space-y-2">
                {data.unpaidFees.map((fee, i) => (
                  <div key={i} className="bg-white border border-red-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{fee.feeName}</p>
                      <p className="text-xs text-gray-500">
                        Payé : {formatFC(fee.amountPaid)} / {formatFC(fee.amount)}
                      </p>
                    </div>
                    <p className="font-bold text-red-600">{formatFC(fee.remaining)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/client/src/pages/parent-portal/ParentPaymentsPage.tsx
git commit -m "feat(parent): add ParentPaymentsPage (SCR-039)"
```

---

### Task 7: Client — Update ParentHomePage + Router + Nav

**Files:**
- Modify: `packages/client/src/pages/parent-portal/ParentHomePage.tsx`
- Modify: `packages/client/src/router.tsx`

- [ ] **Step 1: Update ParentHomePage with navigation tabs**

Replace the existing `ParentHomePage.tsx` content. Add a nav bar linking to all 4 parent pages, and use the new `useParentChildren` hook:

```tsx
// packages/client/src/pages/parent-portal/ParentHomePage.tsx
import { NavLink } from 'react-router-dom';
import { User, GraduationCap, Wallet, CalendarCheck, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useParentChildren } from '../../hooks/useParentPortal';
import { formatFC } from '@edugoma360/shared';

const NAV_ITEMS = [
  { to: '/parent/home', label: 'Accueil', icon: Home },
  { to: '/parent/grades', label: 'Notes', icon: GraduationCap },
  { to: '/parent/attendance', label: 'Absences', icon: CalendarCheck },
  { to: '/parent/payments', label: 'Paiements', icon: Wallet },
];

export default function ParentHomePage() {
  const { user } = useAuth();
  const { data: children, isLoading } = useParentChildren();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Portail Parent</h1>
        <p className="text-sm text-neutral-500">Bienvenue, {user?.prenom || user?.nom}</p>
      </div>

      {/* Navigation */}
      <nav className="flex gap-1 border-b overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/parent/home'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                isActive ? 'border-[#1B5E20] text-[#1B5E20]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Children cards */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Chargement...</div>
      ) : children && children.length > 0 ? (
        children.map((child) => (
          <div key={child.id} className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                {child.nom.charAt(0)}{child.postNom.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold">{child.nom.toUpperCase()} {child.postNom.toUpperCase()} {child.prenom || ''}</h2>
                <p className="text-xs text-neutral-500">{child.className} — {child.matricule}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NavLink to={`/parent/grades?child=${child.id}`} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <p className="text-xs text-neutral-500 flex items-center gap-1"><GraduationCap size={12} /> Dernière moyenne</p>
                <p className="text-lg font-bold text-[#1B5E20] mt-1">{child.lastAverage ?? '—'}/20</p>
              </NavLink>
              <NavLink to={`/parent/attendance?child=${child.id}`} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <p className="text-xs text-neutral-500 flex items-center gap-1"><CalendarCheck size={12} /> Présences</p>
                <p className="text-lg font-bold text-green-600 mt-1">{child.attendanceRate ?? '—'}%</p>
              </NavLink>
              <NavLink to={`/parent/payments?child=${child.id}`} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <p className="text-xs text-neutral-500 flex items-center gap-1"><Wallet size={12} /> Solde dû</p>
                <p className={`text-lg font-bold mt-1 ${child.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatFC(child.balance)}
                </p>
              </NavLink>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-neutral-500 text-sm">
          <User size={32} className="mx-auto mb-3 text-neutral-300" />
          Aucun enfant associé à ce compte
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add routes to router.tsx**

Add imports at the top with other parent-portal imports:
```typescript
import ParentGradesPage from './pages/parent-portal/ParentGradesPage';
import ParentAttendancePage from './pages/parent-portal/ParentAttendancePage';
import ParentPaymentsPage from './pages/parent-portal/ParentPaymentsPage';
```

Add routes after the existing `/parent/home` route:
```tsx
<Route path="parent/grades" element={
    <RoleGuard allowedRoles={['PARENT']}>
        <ParentGradesPage />
    </RoleGuard>
} />
<Route path="parent/attendance" element={
    <RoleGuard allowedRoles={['PARENT']}>
        <ParentAttendancePage />
    </RoleGuard>
} />
<Route path="parent/payments" element={
    <RoleGuard allowedRoles={['PARENT']}>
        <ParentPaymentsPage />
    </RoleGuard>
} />
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/client && npx tsc --noEmit --skipLibCheck 2>&1 | grep -i parent`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add packages/client/src/pages/parent-portal/ParentHomePage.tsx packages/client/src/pages/parent-portal/ParentGradesPage.tsx packages/client/src/pages/parent-portal/ParentAttendancePage.tsx packages/client/src/pages/parent-portal/ParentPaymentsPage.tsx packages/client/src/router.tsx
git commit -m "feat(parent): wire up parent portal pages with navigation and routes"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Full TypeScript check**

```bash
cd packages/server && npx tsc --noEmit --skipLibCheck
cd ../client && npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "parent"
```

Expected: 0 errors in parent-related files

- [ ] **Step 2: Verify routes are registered**

```bash
grep -n "parent" packages/server/src/app.ts
grep -n "parent" packages/client/src/router.tsx | head -10
```

Expected: parent routes visible in both files

- [ ] **Step 3: Start dev server and test**

```bash
npm run dev
```

Navigate to `/parent/home` (as PARENT user) and verify:
- Navigation tabs visible (Accueil, Notes, Absences, Paiements)
- Children cards render
- Each tab navigates correctly
- Data loads on each page
