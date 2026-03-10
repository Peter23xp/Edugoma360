import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Briefcase, Calendar, School, UserCheck, AlertCircle, BookOpen, CheckSquare } from 'lucide-react';
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
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {/* STATUT */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-700 transition-colors">Statut de l'enseignant *</label>
                    <div className="relative">
                        <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <select
                            {...register('statut')}
                            defaultValue="ACTIF"
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 appearance-none cursor-pointer ${errors.statut ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        >
                            <option value="ACTIF">🟢 Actif</option>
                            <option value="CONGE">🟠 En congé</option>
                            <option value="SUSPENDU">🔴 Suspendu</option>
                            <option value="ARCHIVE">⚪ Archivé</option>
                        </select>
                    </div>
                </div>

                {/* DATE EMBAUCHE */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-700 transition-colors">Date d'embauche *</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <input
                            type="date"
                            {...register('dateEmbauche')}
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 ${errors.dateEmbauche ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        />
                    </div>
                </div>

                {/* TYPE DE CONTRAT */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-700 transition-colors">Type de contrat *</label>
                    <div className="relative">
                        <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <select
                            {...register('typeContrat')}
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 appearance-none cursor-pointer ${errors.typeContrat ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        >
                            <option value="">Sélectionnez le type</option>
                            <option value="PERMANENT">CDI (Permanent)</option>
                            <option value="TEMPORAIRE">CDD (Temporaire)</option>
                            <option value="VACATION">Vacation (Horaire)</option>
                            <option value="STAGIAIRE">Stagiaire</option>
                        </select>
                    </div>
                </div>

                {/* FONCTION ADMINISTRATIVE */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-700 transition-colors">Fonction Administrative</label>
                    <div className="relative">
                        <AlertCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <select
                            {...register('fonction')}
                            defaultValue="AUCUNE"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 appearance-none cursor-pointer"
                        >
                            <option value="AUCUNE">Aucune fonction spécifique</option>
                            <option value="PREFET">Préfet des Études</option>
                            <option value="DIRECTEUR">Directeur des Études</option>
                            <option value="CHEF_TRAVAUX">Chef de Travaux</option>
                            <option value="SURVEILLANT">Surveillant Général</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-gray-50">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-green-50 text-green-700 rounded-lg"><School size={20} /></div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Affectations Classes / Matières</h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">Optionnel pour l'instant</span>
                </div>

                <div className="space-y-10">
                    {selectedSubjects.map((sub, i) => (
                        <div key={sub.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-1 shadow-green-700/5 group hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="p-6 bg-gray-50 flex items-center justify-between border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-700 group-hover:bg-green-700 group-hover:text-white transition-all"><BookOpen size={24} /></div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{sub.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Sélectionnez les classes & volume horaire</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map(cls => {
                                    const assignment = currentAssignments.find((a: any) => a.matiereId === sub.id && a.classeId === cls.id);
                                    return (
                                        <div key={cls.id} className={`p-4 border-2 rounded-2xl flex flex-col gap-4 transition-all ${assignment ? 'border-green-600 bg-white ring-4 ring-green-600/5' : 'border-gray-50 hover:bg-gray-50 hover:border-gray-200 cursor-pointer'}`} onClick={() => !assignment && toggleAssignment(sub.id, cls.id)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${assignment ? 'bg-green-700 border-green-700' : 'bg-white border-gray-200'}`} onClick={(e) => { e.stopPropagation(); toggleAssignment(sub.id, cls.id); }}>
                                                        {assignment && <CheckSquare size={14} className="text-white" />}
                                                    </div>
                                                    <div>
                                                        <div className={`font-black uppercase tracking-tight text-xs ${assignment ? 'text-green-900' : 'text-gray-700'}`}>{cls.name}</div>
                                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{cls.section?.name || 'Section'}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {assignment && (
                                                <div className="flex items-center gap-3 pt-3 border-t border-gray-50 group-hover:border-green-100 transition-colors animate-in zoom-in-95 duration-200">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Vol. Horaire :</div>
                                                    <div className="flex items-center bg-gray-50 rounded-lg p-0.5 flex-1 ring-1 ring-gray-100">
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); updateVolumeHoraire(sub.id, cls.id, Math.max(1, assignment.volumeHoraire - 1)) }} className="w-7 h-7 bg-white text-gray-400 rounded-md hover:text-green-700 shadow-sm font-black">-</button>
                                                        <input
                                                            type="number"
                                                            value={assignment.volumeHoraire}
                                                            onChange={(e) => updateVolumeHoraire(sub.id, cls.id, parseInt(e.target.value))}
                                                            className="w-full text-center bg-transparent text-xs font-black text-green-900 focus:outline-none"
                                                        />
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); updateVolumeHoraire(sub.id, cls.id, Math.min(20, assignment.volumeHoraire + 1)) }} className="w-7 h-7 bg-white text-gray-400 rounded-md hover:text-green-700 shadow-sm font-black">+</button>
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-300">H/S</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {!selectedSubjectIds.length && (
                    <div className="py-20 flex flex-col items-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 opacity-60">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-gray-300 shadow-sm mb-4">
                            <AlertCircle size={40} />
                        </div>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Veuillez d'abord sélectionner des matières à l'étape précédente</p>
                    </div>
                )}
            </div>
        </div>
    );
};
