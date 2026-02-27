import React, { useState } from 'react';
import { X, Layers, UserCheck, BookOpen, Plus, Check, Info } from 'lucide-react';

interface BulkAssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBulkAssign: (data: any) => void;
    teachers: any[];
    subjects: any[];
    classes: any[];
}

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
    isOpen,
    onClose,
    onBulkAssign,
    teachers,
    subjects,
    classes
}) => {
    const [teacherId, setTeacherId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [volumeHoraire, setVolumeHoraire] = useState(6);

    if (!isOpen) return null;

    // Filter teachers who teach the selected subject
    const eligibleTeachers = subjectId && teachers ? teachers.filter(t =>
        t.subjects.some((s: any) => s.id === subjectId)
    ) : [];

    const toggleClass = (id: string) => {
        if (selectedClasses.includes(id)) {
            setSelectedClasses(selectedClasses.filter(c => c !== id));
        } else {
            setSelectedClasses([...selectedClasses, id]);
        }
    };

    const handleBulkAssign = () => {
        if (!teacherId || !subjectId || selectedClasses.length === 0) return;
        onBulkAssign({
            teacherId,
            subjectId,
            volumeHoraire,
            classes: selectedClasses.map(cId => ({ classId: cId, volumeHoraire }))
        });
        onClose();
    };

    const totalHoursRequested = selectedClasses.length * volumeHoraire;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-2 border-slate-50 animate-in zoom-in-95 duration-300 flex flex-col">

                <div className="p-8 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20"><Layers size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Affectation en Masse</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigner un enseignant à plusieurs classes pour une matière</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 text-slate-300 rounded-2xl transition-all border border-slate-50"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b-2 border-slate-50">
                        {/* MATIÈRE */}
                        <div className="group">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-indigo-600 transition-colors">1. Sélectionner une matière *</label>
                            <div className="relative">
                                <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                <select
                                    value={subjectId}
                                    onChange={(e) => {
                                        setSubjectId(e.target.value);
                                        setTeacherId(''); // Reset teacher
                                    }}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                                >
                                    <option value="">Matière</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* ENSEIGNANT */}
                        <div className="group">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-indigo-600 transition-colors">2. Sélectionner l'enseignant *</label>
                            <div className="relative">
                                <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                <select
                                    disabled={!subjectId}
                                    value={teacherId}
                                    onChange={(e) => setTeacherId(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <option value="">Enseignant</option>
                                    {eligibleTeachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.nom} {t.prenom} ({t.totalHours || 0}h)</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* VOLUME HORAIRE */}
                        <div className="group">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-indigo-600 transition-colors">3. Volume/Classe (heures/sem) *</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={volumeHoraire}
                                    onChange={(e) => setVolumeHoraire(Number(e.target.value))}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* GRILLE DES CLASSES */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 leading-none">4. Sélectionner les classes concernées ({selectedClasses.length})</label>
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedClasses(classes.map(c => c.id))} className="px-3 py-1 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-lg hover:text-indigo-600">Tout sélectionner</button>
                                <button onClick={() => setSelectedClasses([])} className="px-3 py-1 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-lg hover:text-red-600">Tout désélectionner</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {classes.map(cls => (
                                <div
                                    key={cls.id}
                                    onClick={() => toggleClass(cls.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${selectedClasses.includes(cls.id) ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-600/5' : 'bg-white border-slate-50 hover:border-slate-100 hover:bg-slate-50/50'}`}
                                >
                                    <div>
                                        <p className={`text-sm font-black transition-colors ${selectedClasses.includes(cls.id) ? 'text-indigo-900' : 'text-slate-800'}`}>{cls.name}</p>
                                        <p className={`text-[9px] font-bold uppercase transition-colors ${selectedClasses.includes(cls.id) ? 'text-indigo-600' : 'text-slate-400'}`}>{cls.section.name}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedClasses.includes(cls.id) ? 'bg-indigo-600 text-white rotate-0' : 'bg-slate-100 text-slate-200 rotate-45 group-hover:rotate-0 group-hover:bg-slate-200'}`}>
                                        <Check size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TOTAL HEURES / WARNING */}
                    <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${totalHoursRequested > 20 ? 'bg-orange-600/10 text-orange-600' : 'bg-indigo-600/10 text-indigo-600'}`}><Info size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Heures totales demandées</p>
                                <p className={`text-2xl font-black leading-none ${totalHoursRequested > 20 ? 'text-orange-900' : 'text-slate-900'}`}>{totalHoursRequested}h <span className="text-[10px] font-bold text-slate-400 opacity-50 uppercase tracking-widest">/ semaine</span></p>
                            </div>
                        </div>
                        {totalHoursRequested > 20 && (
                            <div className="flex items-center gap-2 px-6 py-2 bg-orange-100/50 border border-orange-200 rounded-full">
                                <AlertCircle size={14} className="text-orange-600" />
                                <span className="text-[10px] font-black text-orange-900 uppercase tracking-widest">Attention: Volume élevé</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 border-t-2 border-slate-50 flex gap-4 bg-slate-50/30">
                    <button onClick={onClose} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                        Annuler
                    </button>
                    <button
                        disabled={!teacherId || !subjectId || selectedClasses.length === 0}
                        onClick={handleBulkAssign}
                        className="flex-[2] py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20"
                    >
                        Affecter aux {selectedClasses.length} classes
                    </button>
                </div>
            </div>
        </div>
    );
};
