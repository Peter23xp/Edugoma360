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
