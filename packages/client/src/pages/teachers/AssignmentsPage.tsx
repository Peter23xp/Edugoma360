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
import api from '../../lib/api';
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
            const res = await api.get('/settings/academic-years');
            const rawData = res.data.data || [];
            if (!Array.isArray(rawData)) return [];
            
            const years = rawData.map((y: any) => ({
                id: y.id,
                label: y.name || y.label,
                isActive: y.isActive
            }));
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
            const res = await api.get('/settings/sections');
            return res.data.data || [];
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

    const { teachersQuery } = useTeachers({ limit: 1000 });
    const allTeachers = teachersQuery.data?.data || [];
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
            await api.put(`/assignments/${conflictData.assignmentId}`, {
                teacherId: conflictData.newTeacherId
            });
            setModals(prev => ({ ...prev, conflict: false }));
            toast.success('Enseignant remplacé');
        } catch (err) {
            toast.error('Erreur lors du remplacement');
        }
    };

    const handleExport = () => {
        if (!matrixData) return;

        const matrixRows = matrixData.classes.map((cls: any) => {
            const row: any = { Classe: cls.name };
            matrixData.subjects.forEach((subj: any) => {
                const assNode = matrixData.assignments.find((a: any) => a.classId === cls.id && a.subjectId === subj.id);
                row[subj.abbreviation] = assNode ? `${assNode.teacherName} (${assNode.volumeHoraire}h)` : '-';
            });
            return row;
        });

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
        <div className="space-y-4 pb-20">
            {/* —— Header —— */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
                        <Layers size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                            Matrice d'affectation
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Gestion des affectations enseignants — matières
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium 
                                   border border-neutral-300 rounded-xl hover:bg-neutral-50 
                                   hover:border-neutral-400 transition-all duration-200 
                                   text-neutral-700 shadow-sm"
                    >
                        <Download size={15} />
                        <span className="hidden sm:inline">Exporter</span>
                    </button>
                    <button
                        onClick={() => setModals(prev => ({ ...prev, bulk: true }))}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium 
                                   bg-gradient-to-r from-primary to-primary-light text-white 
                                   rounded-xl hover:shadow-lg hover:shadow-primary/25 
                                   transition-all duration-200 hover:-translate-y-0.5 shadow-md"
                    >
                        <Settings2 size={15} />
                        <span>Affectation en masse</span>
                    </button>
                </div>
            </div>

            {/* —— Filters —— */}
            <MatrixFilters
                currentFilters={filters}
                onFilterChange={setFilters}
                sections={sections}
                academicYears={academicYears}
            />

            {/* —— Loading —— */}
            {isLoading && (
                <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
                    <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
                        <Loader2 size={32} className="text-primary animate-spin" />
                        <p className="text-sm text-neutral-500">Chargement de la matrice...</p>
                    </div>
                </div>
            )}

            {/* —— Matrix —— */}
            {!isLoading && matrixData && (
                <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden shadow-sm">
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
                </div>
            )}

            {/* —— Empty state —— */}
            {!isLoading && !matrixData && (
                <div className="bg-white rounded-xl border border-neutral-300/50 overflow-hidden">
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                            <Layers size={28} className="text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-700">Aucune donnée trouvée</h3>
                        <p className="text-sm text-neutral-500 mt-1 max-w-sm">
                            Veuillez ajuster vos filtres ou sélectionner une année scolaire.
                        </p>
                    </div>
                </div>
            )}

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
