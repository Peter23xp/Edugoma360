import React, { useState } from 'react';
import { X, Layers, UserCheck, BookOpen, Check, Info, AlertCircle } from 'lucide-react';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-neutral-300/50 flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg shadow-md shadow-primary/20">
                            <Layers size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Affectation en masse</h2>
                            <p className="text-xs text-neutral-500">Assigner un enseignant à plusieurs classes pour une matière</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 text-neutral-400 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-5 border-b border-neutral-200">
                        {/* MATIÈRE */}
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                                1. Matière *
                            </label>
                            <div className="relative">
                                <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <select
                                    value={subjectId}
                                    onChange={(e) => {
                                        setSubjectId(e.target.value);
                                        setTeacherId('');
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl 
                                               focus:bg-white focus:border-primary focus:outline-none focus:ring-2 
                                               focus:ring-primary/10 transition-all text-sm text-neutral-900 
                                               appearance-none cursor-pointer"
                                >
                                    <option value="">Sélectionner</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* ENSEIGNANT */}
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                                2. Enseignant *
                            </label>
                            <div className="relative">
                                <UserCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <select
                                    disabled={!subjectId}
                                    value={teacherId}
                                    onChange={(e) => setTeacherId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl 
                                               focus:bg-white focus:border-primary focus:outline-none focus:ring-2 
                                               focus:ring-primary/10 transition-all text-sm text-neutral-900 
                                               appearance-none cursor-pointer 
                                               disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <option value="">Sélectionner</option>
                                    {eligibleTeachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.nom} {t.prenom} ({t.totalHours || 0}h)</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* VOLUME HORAIRE */}
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                                3. Heures/classe/semaine *
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={volumeHoraire}
                                onChange={(e) => setVolumeHoraire(Number(e.target.value))}
                                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl 
                                           focus:bg-white focus:border-primary focus:outline-none focus:ring-2 
                                           focus:ring-primary/10 transition-all text-sm text-neutral-900"
                            />
                        </div>
                    </div>

                    {/* GRILLE DES CLASSES */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-semibold text-neutral-600">
                                4. Classes concernées ({selectedClasses.length})
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedClasses(classes.map(c => c.id))}
                                    className="px-2.5 py-1 text-xs text-neutral-500 hover:text-primary rounded-lg hover:bg-neutral-50 transition-colors"
                                >
                                    Tout sélectionner
                                </button>
                                <button
                                    onClick={() => setSelectedClasses([])}
                                    className="px-2.5 py-1 text-xs text-neutral-500 hover:text-red-600 rounded-lg hover:bg-neutral-50 transition-colors"
                                >
                                    Tout désélectionner
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {classes.map(cls => (
                                <div
                                    key={cls.id}
                                    onClick={() => toggleClass(cls.id)}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${selectedClasses.includes(cls.id)
                                            ? 'bg-primary/5 border-primary shadow-sm'
                                            : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                        }`}
                                >
                                    <div>
                                        <p className={`text-sm font-semibold transition-colors ${selectedClasses.includes(cls.id) ? 'text-primary' : 'text-neutral-800'
                                            }`}>{cls.name}</p>
                                        <p className={`text-[10px] font-normal transition-colors ${selectedClasses.includes(cls.id) ? 'text-primary/70' : 'text-neutral-400'
                                            }`}>{cls.section.name}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${selectedClasses.includes(cls.id)
                                            ? 'bg-primary text-white'
                                            : 'bg-neutral-100 text-neutral-300 group-hover:bg-neutral-200'
                                        }`}>
                                        <Check size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TOTAL HEURES */}
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${totalHoursRequested > 20 ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                                <Info size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500">Heures totales demandées</p>
                                <p className={`text-lg font-bold ${totalHoursRequested > 20 ? 'text-amber-900' : 'text-neutral-900'}`}>
                                    {totalHoursRequested}h <span className="text-xs font-normal text-neutral-400">/ semaine</span>
                                </p>
                            </div>
                        </div>
                        {totalHoursRequested > 20 && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border border-amber-200 rounded-lg">
                                <AlertCircle size={12} className="text-amber-600" />
                                <span className="text-xs text-amber-800 font-medium">Volume élevé</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl 
                                   text-sm font-medium hover:bg-neutral-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        disabled={!teacherId || !subjectId || selectedClasses.length === 0}
                        onClick={handleBulkAssign}
                        className="flex-[2] py-2.5 bg-gradient-to-r from-primary to-primary-light text-white 
                                   rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/25 
                                   transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    >
                        Affecter aux {selectedClasses.length} classes
                    </button>
                </div>
            </div>
        </div>
    );
};
