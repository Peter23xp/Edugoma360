import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { School, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';
import { SUBJECTS_LIST } from '@edugoma360/shared';

interface Assignment {
    matiereId: string;
    classeId: string;
    volumeHoraire: number;
}

interface Class {
    id: string;
    name: string;
    section?: {
        name: string;
    };
}

interface FormData {
    statut: string;
    dateEmbauche: string;
    typeContrat: string;
    fonction: string;
    matieres: string[];
    affectations: Assignment[];
}

interface Step3AssignmentsProps {
    form: UseFormReturn<FormData | any>;
}

export const Step3Assignments: React.FC<Step3AssignmentsProps> = ({ form }) => {
    const { register, formState: { errors }, watch, setValue } = form;

    const [classes, setClasses] = useState<Class[]>([]);

    const selectedSubjectIds = watch('matieres') || [];
    const currentAssignments = watch('affectations') || [];

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const { data } = await api.get('/classes');
                setClasses(data.data || []);
            } catch (error) {
                console.error('Failed to fetch classes', error);
            }
        };
        fetchClasses();
    }, []);

    const toggleAssignment = (subjId: string, classId: string) => {
        const exists = currentAssignments.find((a: any) => a.matiereId === subjId && a.classeId === classId);
        if (exists) {
            setValue('affectations', currentAssignments.filter((a: any) => !(a.matiereId === subjId && a.classeId === classId)));
        } else {
            setValue('affectations', [...currentAssignments, { matiereId: subjId, classeId: classId, volumeHoraire: 6 }]);
        }
    };

    const updateVolumeHoraire = (subjId: string, classId: string, hours: number) => {
        const newAssignments = currentAssignments.map((a: any) =>
            (a.matiereId === subjId && a.classeId === classId) ? { ...a, volumeHoraire: hours } : a
        );
        setValue('affectations', newAssignments);
    };

    const selectedSubjects = SUBJECTS_LIST.filter(s => selectedSubjectIds.includes(s.id));

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* STATUT */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Statut de l'enseignant <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('statut')}
                        defaultValue="ACTIF"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   bg-white ${errors.statut ? 'border-red-500' : 'border-neutral-300'}`}
                    >
                        <option value="ACTIF">🟢 Actif</option>
                        <option value="CONGE">🟠 En congé</option>
                        <option value="SUSPENDU">🔴 Suspendu</option>
                        <option value="ARCHIVE">⚪ Archivé</option>
                    </select>
                    {errors.statut && (
                        <p className="text-xs text-red-600 mt-1">{errors.statut.message as string}</p>
                    )}
                </div>

                {/* DATE EMBAUCHE */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Date d'embauche <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        {...register('dateEmbauche')}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.dateEmbauche ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.dateEmbauche && (
                        <p className="text-xs text-red-600 mt-1">{errors.dateEmbauche.message as string}</p>
                    )}
                </div>

                {/* TYPE DE CONTRAT */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Type de contrat <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('typeContrat')}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   bg-white ${errors.typeContrat ? 'border-red-500' : 'border-neutral-300'}`}
                    >
                        <option value="">Sélectionnez le type</option>
                        <option value="PERMANENT">CDI (Permanent)</option>
                        <option value="TEMPORAIRE">CDD (Temporaire)</option>
                        <option value="VACATION">Vacation (Horaire)</option>
                        <option value="STAGIAIRE">Stagiaire</option>
                    </select>
                    {errors.typeContrat && (
                        <p className="text-xs text-red-600 mt-1">{errors.typeContrat.message as string}</p>
                    )}
                </div>

                {/* FONCTION ADMINISTRATIVE */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Fonction Administrative</label>
                    <select
                        {...register('fonction')}
                        defaultValue="AUCUNE"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   bg-white ${errors.fonction ? 'border-red-500' : 'border-neutral-300'}`}
                    >
                        <option value="AUCUNE">Aucune fonction spécifique</option>
                        <option value="PREFET">Préfet des Études</option>
                        <option value="DIRECTEUR">Directeur des Études</option>
                        <option value="CHEF_TRAVAUX">Chef de Travaux</option>
                        <option value="SURVEILLANT">Surveillant Général</option>
                    </select>
                    {errors.fonction && (
                        <p className="text-xs text-red-600 mt-1">{errors.fonction.message as string}</p>
                    )}
                </div>
            </div>

            <div className="pt-6 border-t border-neutral-200">
                <div className="flex items-center gap-2 mb-6">
                    <School size={18} className="text-primary" />
                    <h3 className="text-base font-semibold text-neutral-900">Affectations Classes / Matières</h3>
                    <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded ml-2">Optionnel pour l'instant</span>
                </div>

                <div className="space-y-6">
                    {selectedSubjects.map((sub) => (
                        <div key={sub.id} className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <div className="p-4 bg-neutral-50 border-b border-neutral-200">
                                <h4 className="text-sm font-semibold text-neutral-900">{sub.name}</h4>
                                <p className="text-xs text-neutral-500 mt-0.5">Sélectionnez les classes et le volume horaire pour cette matière</p>
                            </div>

                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {classes.map(cls => {
                                    const assignment = currentAssignments.find((a: any) => a.matiereId === sub.id && a.classeId === cls.id);

                                    return (
                                        <div
                                            key={cls.id}
                                            className={`p-3 border rounded-lg transition-colors cursor-pointer ${assignment ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300'}`}
                                            onClick={() => !assignment && toggleAssignment(sub.id, cls.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!assignment}
                                                        onChange={() => toggleAssignment(sub.id, cls.id)}
                                                        className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`text-sm font-medium ${assignment ? 'text-primary' : 'text-neutral-900'}`}>{cls.name}</div>
                                                    <div className="text-xs text-neutral-500">{cls.section?.name || 'Section'}</div>

                                                    {assignment && (
                                                        <div className="mt-3 pt-3 border-t border-primary/20 flex items-center gap-2">
                                                            <span className="text-xs text-neutral-600 font-medium whitespace-nowrap">Vol. Horaire :</span>
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="number"
                                                                    value={assignment.volumeHoraire}
                                                                    onChange={(e) => updateVolumeHoraire(sub.id, cls.id, parseInt(e.target.value) || 1)}
                                                                    min={1}
                                                                    max={40}
                                                                    className="w-16 px-2 py-1 text-sm text-center border border-neutral-300 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                <span className="text-xs text-neutral-500 font-medium">h/sem</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {!selectedSubjectIds.length && (
                    <div className="py-12 border border-neutral-200 border-dashed rounded-lg bg-neutral-50 flex flex-col items-center justify-center">
                        <AlertCircle size={24} className="text-neutral-400 mb-2" />
                        <p className="text-sm text-neutral-500">Veuillez d'abord sélectionner des matières (Étape 2)</p>
                    </div>
                )}
            </div>
        </div>
    );
};
