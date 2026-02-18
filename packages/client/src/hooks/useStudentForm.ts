import { create } from 'zustand';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface StudentFormData {
    // Step 1: Identity
    nom: string;
    postNom: string;
    prenom?: string;
    sexe: 'M' | 'F';
    dateNaissance: Date | string;
    lieuNaissance: string;
    nationalite: string;
    photoFile?: File;
    photoPreview?: string;

    // Step 2: Academic
    sectionId: string;
    classId: string;
    statut: 'NOUVEAU' | 'REDOUBLANT' | 'TRANSFERE' | 'DEPLACE' | 'REFUGIE';
    ecoleOrigine?: string;
    resultatTenasosp?: number;

    // Step 3: Contacts
    nomPere?: string;
    telPere?: string;
    nomMere?: string;
    telMere?: string;
    nomTuteur?: string;
    telTuteur?: string;
    tuteurPrincipal: 'pere' | 'mere' | 'tuteur';
}

interface StudentFormState {
    mode: 'create' | 'edit';
    studentId?: string;
    currentStep: number;
    formData: Partial<StudentFormData>;
    validationErrors: Record<string, string[]>;
    isSubmitting: boolean;

    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    updateFormData: (data: Partial<StudentFormData>) => void;
    setValidationErrors: (errors: Record<string, string[]>) => void;
    clearValidationErrors: () => void;
    setSubmitting: (isSubmitting: boolean) => void;
    validateStep: (step: number) => boolean;
    resetForm: () => void;
    reset: () => void;
    setMode: (mode: 'create' | 'edit', studentId?: string) => void;
    loadStudentData: (student: any) => void;

    // Draft management
    saveDraft: () => void;
    loadDraft: () => boolean;
    clearDraft: () => void;
}

const DRAFT_KEY = 'edugoma_student_draft';

export const useStudentForm = create<StudentFormState>((set, get) => ({
    mode: 'create',
    currentStep: 1,
    formData: {
        nationalite: 'Congolaise',
        statut: 'NOUVEAU',
        tuteurPrincipal: 'tuteur',
    },
    validationErrors: {},
    isSubmitting: false,

    nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 4) {
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
        if (step >= 1 && step <= 4) {
            set({ currentStep: step });
        }
    },

    updateFormData: (data: Partial<StudentFormData>) => {
        set((state) => ({
            formData: {
                ...state.formData,
                ...data,
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

    setSubmitting: (isSubmitting: boolean) => {
        set({ isSubmitting });
    },

    validateStep: (step: number) => {
        const { formData } = get();
        const errors: Record<string, string[]> = {};

        // Step 1: Identity validation
        if (step === 1) {
            if (!formData.nom?.trim()) {
                errors.nom = ['Le nom est requis'];
            }
            if (!formData.postNom?.trim()) {
                errors.postNom = ['Le post-nom est requis'];
            }
            if (!formData.sexe) {
                errors.sexe = ['Le sexe est requis'];
            }
            if (!formData.dateNaissance) {
                errors.dateNaissance = ['La date de naissance est requise'];
            }
            if (!formData.lieuNaissance?.trim()) {
                errors.lieuNaissance = ['Le lieu de naissance est requis'];
            }
            if (!formData.nationalite?.trim()) {
                errors.nationalite = ['La nationalité est requise'];
            }
        }

        // Step 2: Academic validation
        if (step === 2) {
            if (!formData.sectionId) {
                errors.sectionId = ['La section est requise'];
            }
            if (!formData.classId) {
                errors.classId = ['La classe est requise'];
            }
            if (!formData.statut) {
                errors.statut = ['Le statut est requis'];
            }
            if (formData.statut === 'TRANSFERE' && !formData.ecoleOrigine?.trim()) {
                errors.ecoleOrigine = ['L\'école d\'origine est requise pour un élève transféré'];
            }
        }

        // Step 3: Contacts validation
        if (step === 3) {
            const hasPhone = formData.telPere || formData.telMere || formData.telTuteur;
            if (!hasPhone) {
                errors.telPere = ['Au moins un numéro de téléphone est requis'];
                errors.telMere = ['Au moins un numéro de téléphone est requis'];
                errors.telTuteur = ['Au moins un numéro de téléphone est requis'];
            }

            // Validate phone format if provided
            const phoneRegex = /^\+243[0-9]{9}$/;
            if (formData.telPere && !phoneRegex.test(formData.telPere)) {
                errors.telPere = ['Format invalide (ex: +243991234567)'];
            }
            if (formData.telMere && !phoneRegex.test(formData.telMere)) {
                errors.telMere = ['Format invalide (ex: +243991234567)'];
            }
            if (formData.telTuteur && !phoneRegex.test(formData.telTuteur)) {
                errors.telTuteur = ['Format invalide (ex: +243991234567)'];
            }

            // Ensure tuteur principal is set if phone exists
            if (hasPhone && !formData.tuteurPrincipal) {
                errors.tuteurPrincipal = ['Sélectionnez le tuteur principal'];
            }
        }

        set({ validationErrors: errors });
        return Object.keys(errors).length === 0;
    },

    resetForm: () => {
        set({
            currentStep: 1,
            formData: {
                nationalite: 'Congolaise',
                statut: 'NOUVEAU',
                tuteurPrincipal: 'tuteur',
            },
            validationErrors: {},
            isSubmitting: false,
        });
        get().clearDraft();
    },

    setMode: (mode: 'create' | 'edit', studentId?: string) => {
        set({ mode, studentId });
    },

    loadStudentData: (student: any) => {
        set({
            formData: {
                nom: student.nom,
                postNom: student.postNom,
                prenom: student.prenom,
                sexe: student.sexe,
                dateNaissance: student.dateNaissance,
                lieuNaissance: student.lieuNaissance,
                nationalite: student.nationalite,
                photoPreview: student.photoUrl,
                sectionId: student.currentEnrollment?.class?.sectionId,
                classId: student.currentEnrollment?.classId,
                statut: student.statut,
                ecoleOrigine: student.currentEnrollment?.ecoleOrigine,
                resultatTenasosp: student.currentEnrollment?.resultatTenasosp,
                nomPere: student.nomPere,
                telPere: student.telPere,
                nomMere: student.nomMere,
                telMere: student.telMere,
                nomTuteur: student.nomTuteur,
                telTuteur: student.telTuteur,
                tuteurPrincipal: student.telPere
                    ? 'pere'
                    : student.telMere
                    ? 'mere'
                    : 'tuteur',
            },
        });
    },

    reset: () => {
        set({
            mode: 'create',
            studentId: undefined,
            currentStep: 1,
            formData: {
                nationalite: 'Congolaise',
                statut: 'NOUVEAU',
                tuteurPrincipal: 'tuteur',
            },
            validationErrors: {},
            isSubmitting: false,
        });
        get().clearDraft();
    },

    saveDraft: () => {
        try {
            const { formData, currentStep, mode } = get();
            if (mode === 'create') {
                // Only save draft in create mode
                localStorage.setItem(
                    DRAFT_KEY,
                    JSON.stringify({ formData, currentStep, timestamp: Date.now() })
                );
            }
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

/**
 * Hook to load student data in edit mode
 */
export function useStudentData(studentId?: string) {
    return useQuery({
        queryKey: ['student', studentId],
        queryFn: async () => {
            const res = await api.get(`/students/${studentId}`);
            return res.data.student;
        },
        enabled: !!studentId,
    });
}
