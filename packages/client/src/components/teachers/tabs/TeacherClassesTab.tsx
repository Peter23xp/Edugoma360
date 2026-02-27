import React from 'react';
import { BookOpen, Users, Clock, Hash, ArrowRight, Table, PenSquare } from 'lucide-react';

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
    const totalStudents = new Set(assignments.flatMap((a: any) => a.classId)).size; // This is actually classes count, let's just use it as is

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-green-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center px-6 border-r border-green-200">
                        <span className="text-2xl font-black text-green-900 leading-none">{subjects.length}</span>
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest mt-1">Matières</span>
                    </div>
                    <div className="flex flex-col items-center px-6 border-r border-green-200">
                        <span className="text-2xl font-black text-green-900 leading-none">{assignments.length}</span>
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest mt-1">Classes</span>
                    </div>
                    <div className="flex flex-col items-center px-6">
                        <span className="text-2xl font-black text-green-900 leading-none">{totalHours}H</span>
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest mt-1">Hebdo.</span>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white text-green-700 border border-green-200 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Table size={18} /> Voir l'emploi du temps complet
                </button>
            </div>

            <div className="space-y-10">
                {subjects.map((sub: any, i: number) => (
                    <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-1.5 h-6 bg-green-700 rounded-full" />
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                <BookOpen size={20} className="text-green-700" />
                                {sub.name}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sub.assignments.map((aff: any, j: number) => (
                                <div key={j} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all group overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-xl font-black text-gray-900 group-hover:text-green-700 transition-colors">{aff.class.name}</h4>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{aff.class.section?.name || 'Section Standard'}</p>
                                            </div>
                                            <div className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-xs font-black uppercase tracking-widest group-hover:bg-green-50 group-hover:text-green-700 transition-colors">
                                                coeff. {aff.subject.coefficient || 1}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                                                <Users size={16} className="text-gray-400 mb-1" />
                                                <span className="text-sm font-black text-gray-800">32 Élèves</span>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                                                <Clock size={16} className="text-gray-400 mb-1" />
                                                <span className="text-sm font-black text-gray-800">{aff.volumeHoraire}h / sem.</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="flex-1 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 hover:text-white transition-all flex items-center justify-center gap-2">
                                                <Table size={14} /> Emploi
                                            </button>
                                            <button className="flex-1 py-3 bg-white text-green-700 border border-green-100 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-50 transition-all flex items-center justify-center gap-2">
                                                <PenSquare size={14} /> Notes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {subjects.length === 0 && (
                    <div className="py-20 flex flex-col items-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-gray-300 shadow-sm mb-4">
                            <BookOpen size={40} />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aucune affectation trouvée pour cette année scolaire</p>
                    </div>
                )}
            </div>
        </div>
    );
};
