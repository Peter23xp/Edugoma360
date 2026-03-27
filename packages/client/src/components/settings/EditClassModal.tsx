import { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { useTeachersForDropdown, ClassItem } from '../../hooks/useClasses';

interface EditClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: string, data: any) => Promise<void>;
    isSubmitting: boolean;
    classData: ClassItem;
}

const INPUT_CLS = 'w-full border border-neutral-300/50 rounded-md px-4 py-3 text-sm font-normal text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white';
const LABEL_CLS = 'block text-sm font-medium text-neutral-700 mb-2';

export default function EditClassModal({ isOpen, onClose, onSubmit, isSubmitting, classData }: EditClassModalProps) {
    const { data: teachers } = useTeachersForDropdown();

    const [maxStudents, setMaxStudents] = useState(String(classData.maxStudents));
    const [room, setRoom] = useState(classData.room || '');
    const [titulaireId, setTitulaireId] = useState(classData.titulaire?.id || '');

    useEffect(() => {
        setMaxStudents(String(classData.maxStudents));
        setRoom(classData.room || '');
        setTitulaireId(classData.titulaire?.id || '');
    }, [classData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(classData.id, {
            maxStudents: Number(maxStudents),
            room: room || null,
            titulaireId: titulaireId || null,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col">

                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-300/50">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900">Modifier la classe</h2>
                        <p className="text-sm text-neutral-500 mt-0.5">{classData.name} — {classData.section.name}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <div className="px-6 py-5 space-y-6">

                        {/* Max students */}
                        <div>
                            <label className={LABEL_CLS}>Effectif maximum *</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={maxStudents}
                                    onChange={e => setMaxStudents(e.target.value)}
                                    className={`${INPUT_CLS} w-24`}
                                    required
                                />
                                <span className="text-sm text-neutral-500">élèves</span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Actuellement : {classData.currentStudents} élèves inscrits
                            </p>
                        </div>

                        {/* Room */}
                        <div>
                            <label className={LABEL_CLS}>Salle de classe</label>
                            <input
                                value={room}
                                onChange={e => setRoom(e.target.value)}
                                placeholder="ex: 201"
                                className={INPUT_CLS}
                            />
                        </div>

                        <hr className="border-neutral-100" />

                        {/* Titulaire */}
                        <div>
                            <label className={LABEL_CLS}>Enseignant titulaire</label>
                            <select
                                value={titulaireId}
                                onChange={e => setTitulaireId(e.target.value)}
                                className={INPUT_CLS}
                            >
                                <option value="">— Non défini —</option>
                                {teachers?.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.nom} {t.prenom || ''} {t.postNom || ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> Le "papa" responsable de la classe
                            </p>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-neutral-300/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-medium text-neutral-700 bg-white border border-neutral-300/50 rounded-md hover:bg-neutral-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
