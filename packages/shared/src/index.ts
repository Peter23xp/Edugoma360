// ── Shared Types & Constants ─────────────────────────────────────────────────
// EduGoma 360 — Types, constants, and utilities shared between client and server

// Types
export * from './types';
export * from './types/payment';

// Constants
export * from './constants/sections';
export * from './constants/feeTypes';
export * from './constants/paymentMethods';
export * from './constants/roles';
export * from './constants/holidays';
export * from './constants/provinces';
export * from './constants/subjects';
export * from './constants/teacherStatus';
export { DELIB_DECISIONS, type DelibDecision, getDecisionColor, getDecisionBadgeColor } from './constants/decisions';
export { EVAL_TYPES, type EvalType, EVAL_TYPE_OPTIONS } from './constants/evalTypes';

// Utilities
export * from './utils/matricule';
export * from './utils/teacherMatricule';
export * from './utils/gradeCalc';
export * from './utils/teacherStats';
export * from './utils/currency';
export * from './utils/validators';
export * from './utils/names';
export * from './utils/dateUtils';
