import React from 'react';
import { BookOpen, Users, Clock, Table, PenSquare } from 'lucide-react';

export const TeacherClassesTab: React.FC<{ teacher: any }> = ({ teacher }) => {
    const assignments = teacher.assignments || [];

    // Group assignments by subject
    const subjectsMap = new Map();
    assignments.forEach((a: any) => {
        if (!subjectsMap.has(a.subject.id)) {
            subjectsMap.set(a.subject.id, {
                name: a.subject.name,
                assignments: []
            });
        }
        subjectsMap.get(a.subject.id).assignments.push(a);
    });

    const subjects = Array.from(subjectsMap.values());
    const totalHours = assignments.reduce((acc: number, curr: any) => acc + (curr.volumeHoraire || 0), 0);

    return (
        <div className="space-y-8">
            {/* —— Stats Summary —— */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-neutral-200 rounded-lg p-4 bg-white/50">
                    <p className="text-xs font-semibold text-neutral-500 mb-1">Matières Enseignées</p>
                    <p className="text-2xl font-bold text-neutral-900">{subjects.length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4 bg-white/50">
                    <p className="text-xs font-semibold text-neutral-500 mb-1">Classes Assurées</p>
                    <p className="text-2xl font-bold text-neutral-900">{assignments.length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4 bg-white/50">
                    <p className="text-xs font-semibold text-neutral-500 mb-1">Volume Horaire Hebdo.</p>
                    <p className="text-2xl font-bold text-neutral-900">{totalHours}h</p>
                </div>
            </div>

            {/* —— Classes by Subject —— */}
            <div className="space-y-6">
                {subjects.map((sub: any, i: number) => (
                    <div key={i}>
                        <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                            <BookOpen size={16} className="text-neutral-500" />
                            {sub.name}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sub.assignments.map((aff: any, j: number) => (
                                <div key={j} className="border border-neutral-200 rounded-lg p-4 flex flex-col justify-between hover:border-primary/50 transition-colors">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-bold text-neutral-900">{aff.class.name}</h4>
                                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs font-medium">
                                                Coeff. {aff.subject.coefficient || 1}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-500 mb-4">{aff.class.section?.name || 'Section Standard'}</p>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-neutral-600 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} className="text-neutral-400" />
                                            — Élèves
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-neutral-400" />
                                            {aff.volumeHoraire}h / sem.
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 py-1.5 bg-neutral-100 text-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5">
                                            <Table size={12} /> Emploi
                                        </button>
                                        <button className="flex-1 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5">
                                            <PenSquare size={12} /> Notes
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {subjects.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-neutral-200 rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                            <BookOpen size={20} className="text-neutral-400" />
                        </div>
                        <p className="text-sm text-neutral-500">
                            Aucune affectation trouvée pour cette année scolaire.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
