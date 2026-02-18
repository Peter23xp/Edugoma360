import { create } from 'zustand';
import type { SetupWizardData } from '@edugoma360/shared';

// Alias for better readability in components
export interface FormDataAliases {
    identity?: SetupWizardData['step1'] & { logoPreview?: string };
    location?: SetupWizardData['step2'];
    contact?: SetupWizardData['step3'];
    academicYear?: SetupWizardData['step4'];
    classes?: SetupWizardData['step5']['classes'];
    admin?: SetupWizardData['step6'];
}

interface SetupWizardState {
    currentStep: number;
    formData: FormDataAliases;
    validationErrors: Record<string, string[]>;
    
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    updateFormData: (step: keyof FormDataAliases, data: any) => void;
    setValidationErrors: (errors: Record<string, string[]>) => void;
    clearValidationErrors: () => void;
    reset: () => void;
    
    // Draft management
    saveDraft: () => void;
    loadDraft: () => boolean;
    clearDraft: () => void;
}

const DRAFT_KEY = 'edugoma_setup_draft';

export const useSetupWizard = create<SetupWizardState>((set, get) => ({
    currentStep: 1,
    formData: {},
    validationErrors: {},
    
    nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 6) {
            set({ currentStep: currentStep + 1 });
            get().saveDraft();
        }
    },
    
    prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
            set({ currentStep: currentStep - 1 });
        }
    },
    
    goToStep: (step: number) => {
        if (step >= 1 && step <= 6) {
            set({ currentStep: step });
        }
    },
    
    updateFormData: (step: keyof FormDataAliases, data: any) => {
        set((state) => ({
            formData: {
                ...state.formData,
                [step]: data,
            },
        }));
        get().saveDraft();
    },
    
    setValidationErrors: (errors: Record<string, string[]>) => {
        set({ validationErrors: errors });
    },
    
    clearValidationErrors: () => {
        set({ validationErrors: {} });
    },
    
    reset: () => {
        set({
            currentStep: 1,
            formData: {},
            validationErrors: {},
        });
        get().clearDraft();
    },
    
    saveDraft: () => {
        try {
            const { formData, currentStep } = get();
            localStorage.setItem(
                DRAFT_KEY,
                JSON.stringify({ formData, currentStep, timestamp: Date.now() })
            );
        } catch (error) {
            console.error('Failed to save draft:', error);
        }
    },
    
    loadDraft: () => {
        try {
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
                const { formData, currentStep, timestamp } = JSON.parse(draft);
                
                // Only load draft if it's less than 7 days old
                const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                if (timestamp > sevenDaysAgo) {
                    set({ formData, currentStep });
                    return true;
                }
            }
        } catch (error) {
            console.error('Failed to load draft:', error);
        }
        return false;
    },
    
    clearDraft: () => {
        try {
            localStorage.removeItem(DRAFT_KEY);
        } catch (error) {
            console.error('Failed to clear draft:', error);
        }
    },
}));
