import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SchoolState {
    activeSchoolId: string | null;
    activeAcademicYearId: string | null;
    activeTermId: string | null;
    schoolName: string;
    academicYearLabel: string;
    termLabel: string;

    setActiveSchool: (id: string, name: string) => void;
    setActiveAcademicYear: (id: string, label: string) => void;
    setActiveTerm: (id: string, label: string) => void;
}

export const useSchoolStore = create<SchoolState>()(
    persist(
        (set) => ({
            activeSchoolId: null,
            activeAcademicYearId: null,
            activeTermId: null,
            schoolName: '',
            academicYearLabel: '',
            termLabel: '',

            setActiveSchool: (id, name) => set({ activeSchoolId: id, schoolName: name }),
            setActiveAcademicYear: (id, label) => set({ activeAcademicYearId: id, academicYearLabel: label }),
            setActiveTerm: (id, label) => set({ activeTermId: id, termLabel: label }),
        }),
        { name: 'edugoma-school' },
    ),
);
