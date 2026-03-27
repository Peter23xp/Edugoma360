import { useState } from 'react';
import { Settings, Trash2, Edit2, Plus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { SectionGroup, Subject } from '../../hooks/useSections';
import SubjectManagementModal from './SubjectManagementModal';

interface SectionCardProps {
    section: SectionGroup;
    onDeleteStr: (id: string) => void;
    onEditStr: (section: SectionGroup) => void;
    onAddSubject: (sectionId: string, subject: any) => void;
    onUpdateSubject: (sectionId: string, subjectId: string, data: any) => void;
    onRemoveSubject: (sectionId: string, subjectId: string) => void;
}

export default function SectionCard({
    section,
    onDeleteStr,
    onEditStr,
    onAddSubject,
    onUpdateSubject,
    onRemoveSubject
}: SectionCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

    const handleOpenAddSubject = () => {
        setSubjectToEdit(null);
        setShowSubjectModal(true);
    };

    const handleOpenEditSubject = (subject: Subject) => {
        setSubjectToEdit(subject);
        setShowSubjectModal(true);
    };

    const handleSubjectSubmit = async (data: any) => {
        if (subjectToEdit) {
            await onUpdateSubject(section.code, subjectToEdit.id, data);
        } else {
            await onAddSubject(section.code, data);
        }
        setShowSubjectModal(false);
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            
            {/* Header / Summary */}
            <div className="p-6 flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xl shadow-inner border border-primary/20">
                        {section.code}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                            {section.name} <span className="text-sm font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">({section.code})</span>
                        </h3>
                        <p className="text-sm text-neutral-500 mt-1">
                            Années : {section.years.map(y => y === 1 ? '1ère' : `${y}ème`).join(', ')}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-neutral-600">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded border border-neutral-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                {section.subjects.length} matières configurées
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded border border-neutral-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                {section.classCount} classes créées
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => onEditStr(section)} className="p-2 text-neutral-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent" title="Modifier la section">
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={() => {
                            if (window.confirm(`Êtes-vous sûr de vouloir supprimer la section ${section.name} ?`)) {
                                onDeleteStr(section.code); // Backend routes currently match by ID, logic adapts to use code
                            }
                        }} 
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer la section"
                        disabled={section.classCount > 0}
                    >
                        <Trash2 size={16} className={section.classCount > 0 ? "opacity-30" : ""} />
                    </button>
                </div>
            </div>

            {/* Expansion Toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-50 border-t border-neutral-100 text-xs font-bold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors uppercase tracking-widest"
            >
                {isExpanded ? (
                    <>Masquer les matières <ChevronUp size={14} /></>
                ) : (
                    <>Voir les matières <ChevronDown size={14} /></>
                )}
            </button>

            {/* Subjects List */}
            {isExpanded && (
                <div className="border-t border-neutral-100 bg-white">
                    <ul className="divide-y divide-neutral-100">
                        {/* THEAD */}
                        <li className="grid grid-cols-[3fr_1fr_1.5fr_1.5fr_1fr] items-center px-6 py-3 text-xs font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/50">
                            <div>Matière</div>
                            <div className="text-center">Coeff</div>
                            <div className="text-center">Note sur</div>
                            <div className="text-center">Obligatoire</div>
                            <div className="text-right">Action</div>
                        </li>
                        
                        {/* TBODY */}
                        {section.subjects.length === 0 ? (
                            <li className="px-6 py-8 text-center bg-orange-50/30">
                                <AlertTriangle size={24} className="mx-auto text-orange-300 mb-2" />
                                <p className="text-sm font-medium text-orange-800">Aucune matière configurée</p>
                                <p className="text-xs text-orange-600/80 mt-1 mb-3">Ajoutez des matières pour construire la grille de cette section.</p>
                                <button 
                                    onClick={handleOpenAddSubject}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 text-xs font-bold rounded-lg hover:bg-orange-200 transition-colors"
                                >
                                    <Plus size={14} /> Ajouter une matière
                                </button>
                            </li>
                        ) : (
                            section.subjects.map(sub => (
                                <li key={sub.id} className="grid grid-cols-[3fr_1fr_1.5fr_1.5fr_1fr] items-center px-6 py-3 text-sm hover:bg-neutral-50 transition-colors group">
                                    <div className="font-semibold text-neutral-800 flex items-center gap-2">
                                        {sub.name} <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200 font-mono">{sub.abbreviation}</span>
                                    </div>
                                    <div className="text-center font-bold text-primary bg-primary/10 py-0.5 rounded border border-primary/20 mx-auto w-10">
                                        {sub.coefficient}
                                    </div>
                                    <div className="text-center text-neutral-600 font-mono text-xs">
                                        /{sub.maxScore}
                                    </div>
                                    <div className="text-center">
                                        {sub.isEliminatory ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                                                ✅ Oui
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 text-xs font-medium border border-neutral-200">
                                                —
                                            </span>
                                        )}
                                        {sub.hasThreshold && (
                                            <span className="block text-[10px] text-red-400 mt-0.5">Seuil: {sub.elimThreshold}</span>
                                        )}
                                    </div>
                                    <div className="text-right flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenEditSubject(sub)} className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Modifier la matière">
                                            <Settings size={14} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm(`Retirer ${sub.name} de ${section.code} ?`)) {
                                                    onRemoveSubject(section.code, sub.id);
                                                }
                                            }}
                                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded" title="Retirer de la section"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                        
                        {/* FOOTER ACTION */}
                        {section.subjects.length > 0 && (
                            <li className="px-6 py-3 bg-neutral-50/50 flex justify-end">
                                <button 
                                    onClick={handleOpenAddSubject}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded border border-primary/20 hover:bg-primary/20 transition-colors"
                                >
                                    <Plus size={14} /> Ajouter matière ({section.code})
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            )}

            <SubjectManagementModal
                isOpen={showSubjectModal}
                onClose={() => setShowSubjectModal(false)}
                onSubmit={handleSubjectSubmit}
                isSubmitting={false} // Would ideally be passed down or handled here
                sectionName={section.name}
                initialData={subjectToEdit}
            />

        </div>
    );
}
