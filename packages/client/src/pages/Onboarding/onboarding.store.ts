import { create } from 'zustand';

// ── Onboarding Wizard Store ───────────────────────────────────────────────────
// Persists form data across the 3 onboarding steps in memory.
// No localStorage persistence needed — the wizard is a single session.
// ─────────────────────────────────────────────────────────────────────────────

export interface SchoolData {
    name:              string;
    address:           string;
    phone:             string;
    email:             string;
    estimatedStudents: string;
}

export interface AdminData {
    firstName: string;
    lastName:  string;
    email:     string;
    phone:     string;
    password:  string;
    confirm:   string;
}

export type PlanSlug = 'trial' | 'bronze' | 'silver' | 'gold';

interface OnboardingState {
    step:      1 | 2 | 3;
    school:    Partial<SchoolData>;
    admin:     Partial<AdminData>;
    planSlug:  PlanSlug;

    setStep:    (step: 1 | 2 | 3) => void;
    setSchool:  (data: Partial<SchoolData>) => void;
    setAdmin:   (data: Partial<AdminData>) => void;
    setPlan:    (slug: PlanSlug) => void;
    reset:      () => void;
}

const DEFAULT_STATE = {
    step:     1 as const,
    school:   {},
    admin:    {},
    planSlug: 'trial' as PlanSlug,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
    ...DEFAULT_STATE,
    setStep:   (step)  => set({ step }),
    setSchool: (data)  => set((s) => ({ school: { ...s.school, ...data } })),
    setAdmin:  (data)  => set((s) => ({ admin:  { ...s.admin,  ...data } })),
    setPlan:   (slug)  => set({ planSlug: slug }),
    reset:     ()      => set(DEFAULT_STATE),
}));
