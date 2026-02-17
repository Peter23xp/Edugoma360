import Dexie, { type Table } from 'dexie';

// ── Offline Database Schema ───────────────────────────────────────────────────
// Tables mirror the server models for offline-first functionality

export interface OfflineStudent {
    id: string;
    schoolId: string;
    matricule: string;
    nom: string;
    postNom: string;
    prenom?: string;
    sexe: 'M' | 'F';
    dateNaissance: string;
    lieuNaissance: string;
    classId?: string;
    className?: string;
    lastSynced?: number;
}

export interface OfflineGrade {
    id?: string; // auto-increment for pending
    serverId?: string; // server UUID once synced
    studentId: string;
    subjectId: string;
    termId: string;
    evalType: string;
    score: number;
    maxScore: number;
    createdById: string;
    syncStatus: 'SYNCED' | 'PENDING' | 'CONFLICT';
    localUpdatedAt: number;
    serverUpdatedAt?: number;
}

export interface OfflineAttendance {
    id?: string;
    serverId?: string;
    studentId: string;
    classId: string;
    termId: string;
    date: string;
    period: 'MATIN' | 'APRES_MIDI';
    status: 'PRESENT' | 'ABSENT' | 'JUSTIFIED' | 'SICK';
    justification?: string;
    recordedById: string;
    syncStatus: 'SYNCED' | 'PENDING' | 'CONFLICT';
    localUpdatedAt: number;
}

export interface OfflinePayment {
    id?: string;
    serverId?: string;
    receiptNumber: string;
    studentId: string;
    feeTypeId: string;
    amountDue: number;
    amountPaid: number;
    currency: 'FC' | 'USD';
    paymentMode: string;
    paidAt: string;
    createdById: string;
    syncStatus: 'SYNCED' | 'PENDING';
    localUpdatedAt: number;
}

export interface SyncQueueItem {
    id?: number;
    entityType: 'grade' | 'attendance' | 'payment' | 'student';
    entityId: string;
    action: 'create' | 'update' | 'delete';
    payload: string; // JSON stringified
    attempts: number;
    lastAttemptAt?: number;
    errorMsg?: string;
    createdAt: number;
}

class EduGomaDB extends Dexie {
    students!: Table<OfflineStudent, string>;
    grades!: Table<OfflineGrade, string>;
    attendances!: Table<OfflineAttendance, string>;
    payments!: Table<OfflinePayment, string>;
    syncQueue!: Table<SyncQueueItem, number>;

    constructor() {
        super('EduGoma360');

        this.version(1).stores({
            students: 'id, schoolId, matricule, nom, classId, [schoolId+classId]',
            grades: '++id, serverId, studentId, subjectId, termId, evalType, syncStatus, [studentId+subjectId+termId+evalType]',
            attendances: '++id, serverId, studentId, classId, date, period, syncStatus, [studentId+date+period]',
            payments: '++id, serverId, receiptNumber, studentId, feeTypeId, syncStatus',
            syncQueue: '++id, entityType, entityId, action, createdAt',
        });
    }
}

const db = new EduGomaDB();

export default db;
