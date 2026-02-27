import React, { useState } from 'react';
import { useAssignments } from '../../hooks/useAssignments';
import { useTeachers } from '../../hooks/useTeachers';
import { useClasses } from '../../hooks/useClasses';
import { MatrixFilters } from '../../components/teachers/assignments/MatrixFilters';
import { AssignmentMatrix } from '../../components/teachers/assignments/AssignmentMatrix';
import { QuickAssignModal } from '../../components/teachers/assignments/QuickAssignModal';
import { BulkAssignModal } from '../../components/teachers/assignments/BulkAssignModal';
import { ConflictWarning } from '../../components/teachers/assignments/ConflictWarning';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Download, Settings2, Loader2, Layers } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

const AssignmentsPage: React.FC = () => {
    // 1. STATE & FILTERS
    const [filters, setFilters] = useState({
        academicYearId: '',
        sectionId: '',
        classId: '',
        searchTeacher: ''
    });

    const [modals, setModals] = useState({
        quick: false,
        bulk: false,
        conflict: false
    });

    const [assignmentContext, setAssignmentContext] = useState<any>(null);
    const [conflictData, setConflictData] = useState<any>(null);

    // 2. FETCH CONFIG DATA (Years, Sections)
    const { data: academicYears = [] } = useQuery({
        queryKey: ['academic-years'],
        queryFn: async () => {
            const res = await axios.get('/api/settings/academic-years');
            const years = res.data.data.map((y: any) => ({
                id: y.id,
                label: y.name,
                isActive: y.isActive
            }));
            // Set default active year
            const active = years.find((y: any) => y.isActive);
            if (active && !filters.academicYearId) {
                setFilters(prev => ({ ...prev, academicYearId: active.id }));
            }
            return years;
        }
    });

    const { data: sections = [] } = useQuery({
        queryKey: ['sections'],
        queryFn: async () => {
            const res = await axios.get('/api/settings/sections');
            return res.data.data;
        }
    });

    // 3. FETCH MAIN DATA
    const {
        matrixData,
        isLoading,
        assign,
        bulkAssign,
        remove
    } = useAssignments(filters);

    // Fetch all teachers for modals (no filters)
    const { teachersQuery } = useTeachers({ limit: 1000 });
    const allTeachers = teachersQuery.data?.data || [];

    // Fetch all classes for bulk assign (no filters)
    const { classes: allClasses } = useClasses({ isActive: true });

    // 4. HANDLERS
    const handleOpenAssign = (classId: string, subjectId: string) => {
        const cls = matrixData.classes.find((c: any) => c.id === classId);
        const subj = matrixData.subjects.find((s: any) => s.id === subjectId);

        setAssignmentContext({
            classId,
            className: cls?.name,
            subjectId,
            subjectName: subj?.name
        });
        setModals(prev => ({ ...prev, quick: true }));
    };

    const handleAssign = async (data: any) => {
        try {
            const res = await assign(data);
            if (res.conflict) {
                setConflictData({
                    assignmentId: res.existingAssignment.id,
                    className: assignmentContext.className,
                    subjectName: assignmentContext.subjectName,
                    existingTeacherName: `${res.existingAssignment.teacher.nom} ${res.existingAssignment.teacher.prenom || ''}`,
                    newTeacherName: allTeachers.find((t: any) => t.id === data.teacherId)?.nom,
                    newTeacherId: data.teacherId
                });
                setModals(prev => ({ ...prev, conflict: true }));
            }
        } catch (err) {
            // Error handled by hook toast
        }
    };

    const handleReplace = async () => {
        try {
            await axios.put(`/api/assignments/${conflictData.assignmentId}`, {
                teacherId: conflictData.newTeacherId
            });
            setModals(prev => ({ ...prev, conflict: false }));
            toast.success('Enseignant remplacé');
            // Refresh matrix
        } catch (err) {
            toast.error('Erreur lors du remplacement');
        }
    };

    const handleExport = () => {
        if (!matrixData) return;

        // Sheet 1: Matrix
        const matrixRows = matrixData.classes.map((cls: any) => {
            const row: any = { Classe: cls.name };
            matrixData.subjects.forEach((subj: any) => {
                const assNode = matrixData.assignments.find((a: any) => a.classId === cls.id && a.subjectId === subj.id);
                row[subj.abbreviation] = assNode ? `${assNode.teacherName} (${assNode.volumeHoraire}h)` : '-';
            });
            return row;
        });

        // Sheet 2: List
        const listRows = matrixData.assignments.map((a: any) => ({
            Enseignant: a.teacherName,
            Classe: a.className,
            Matière: a.subjectName,
            'Heures/Sem': a.volumeHoraire
        }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matrixRows), 'Matrice');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(listRows), 'Liste');

        XLSX.writeFile(wb, `Affectations_${academicYears.find((y: any) => y.id === filters.academicYearId)?.label || 'Assign'}.xlsx`);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* HEADER AREA */}
            <div className="bg-white border-b-2 border-slate-50 sticky top-0 z-[40]">
                <div className="max-w-[1600px] mx-auto px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest">Module Enseignants</span>
                                <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Affectations</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Matrice d'Affectation</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleExport}
                                className="px-6 py-4 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all border-2 border-slate-50"
                            >
                                <Download size={18} /> Exporter
                            </button>
                            <button
                                onClick={() => setModals(prev => ({ ...prev, bulk: true }))}
                                className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/20"
                            >
                                <Settings2 size={18} /> Affectation Masse
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-8 py-10">
                <MatrixFilters
                    currentFilters={filters}
                    onFilterChange={setFilters}
                    sections={sections}
                    academicYears={academicYears}
                />

                {isLoading ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                        <Loader2 size={48} className="text-blue-600 animate-spin" />
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chargement de la matrice...</p>
                    </div>
                ) : matrixData ? (
                    <AssignmentMatrix
                        data={matrixData}
                        filters={filters}
                        onAssign={handleOpenAssign}
                        onEdit={(a) => {
                            setAssignmentContext({
                                classId: a.classId,
                                className: a.className,
                                subjectId: a.subjectId,
                                subjectName: a.subjectName
                            });
                            setModals(prev => ({ ...prev, quick: true }));
                        }}
                        onRemove={remove}
                    />
                ) : (
                    <div className="bg-slate-50 rounded-[40px] p-20 flex flex-col items-center justify-center text-center border-4 border-dashed border-slate-100">
                        <Layers size={64} className="text-slate-200 mb-6" />
                        <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tight">Aucune donnée trouvée</h3>
                        <p className="text-slate-400 mt-2 max-w-sm">Veuillez ajuster vos filtres ou sélectionner une année scolaire.</p>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <QuickAssignModal
                isOpen={modals.quick}
                onClose={() => setModals(prev => ({ ...prev, quick: false }))}
                context={assignmentContext}
                teachers={allTeachers}
                onAssign={handleAssign}
            />

            <BulkAssignModal
                isOpen={modals.bulk}
                onClose={() => setModals(prev => ({ ...prev, bulk: false }))}
                teachers={allTeachers}
                subjects={matrixData?.subjects || []}
                classes={allClasses}
                onBulkAssign={bulkAssign}
            />

            <ConflictWarning
                isOpen={modals.conflict}
                onClose={() => setModals(prev => ({ ...prev, conflict: false }))}
                conflictData={conflictData}
                onReplace={handleReplace}
            />
        </div>
    );
};

export default AssignmentsPage;
