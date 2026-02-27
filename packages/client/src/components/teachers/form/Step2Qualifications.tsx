import React, { useRef } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { GraduationCap, BookOpen, Plus, Trash2, FileText, School, Calendar, Globe, Upload, CheckCircle2 } from 'lucide-react';
import { SUBJECTS_LIST } from '@edugoma360/shared';

interface Step2QualificationsProps {
    form: UseFormReturn<any>;
}

export const Step2Qualifications: React.FC<Step2QualificationsProps> = ({ form }) => {
    const { register, formState: { errors }, watch, control, setValue } = form;
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "certificats"
    });

    const selectedSubjects = watch('matieres') || [];
    const certificatFiles = watch('certificatFiles') || [];

    const handleFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newFiles = [...certificatFiles];
            newFiles[index] = file;
            setValue('certificatFiles', newFiles);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {/* NIVEAU D'ÉTUDES */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-700 transition-colors">Niveau d'études *</label>
                    <div className="relative">
                        <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <select
                            {...register('niveauEtudes')}
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 appearance-none cursor-pointer ${errors.niveauEtudes ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        >
                            <option value="">Sélectionnez le niveau</option>
                            <option value="D6">D6 (Diplôme d'État)</option>
                            <option value="GRADUAT">Graduat (Bac+3)</option>
                            <option value="LICENCE">Licence (Bac+5)</option>
                            <option value="MASTER">Master (Bac+7)</option>
                            <option value="DOCTORAT">Doctorat (Bac+8)</option>
                        </select>
                    </div>
                </div>

                {/* DOMAINE DE FORMATION */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-700 transition-colors">Domaine de formation *</label>
                    <div className="relative">
                        <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <input
                            {...register('domaineFormation')}
                            placeholder="EX: Mathématiques et Physique"
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 placeholder:text-gray-200 ${errors.domaineFormation ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        />
                    </div>
                </div>

                {/* UNIVERSITÉ */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-700 transition-colors">Université / Institut *</label>
                    <div className="relative">
                        <School size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <input
                            {...register('universite')}
                            placeholder="EX: UNIKIN"
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 placeholder:text-gray-200 ${errors.universite ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        />
                    </div>
                </div>

                {/* ANNÉE OBTENTION */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-green-700 transition-colors">Année d'obtention *</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <input
                            type="number"
                            {...register('anneeObtention')}
                            min="1980"
                            max={new Date().getFullYear()}
                            placeholder="EX: 2008"
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 placeholder:text-gray-200 ${errors.anneeObtention ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-gray-50">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-50 text-green-700 rounded-lg"><BookOpen size={20} /></div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Matières Enseignées *</h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">Min. 1 requis</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {SUBJECTS_LIST.map((subj) => (
                        <label key={subj.id} className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all hover:border-green-200 ${selectedSubjects.includes(subj.id) ? 'bg-green-50 border-green-600 shadow-sm' : 'bg-white border-gray-50 hover:bg-gray-50'}`}>
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${selectedSubjects.includes(subj.id) ? 'bg-green-700' : 'bg-gray-100 border-2 border-gray-200 group-hover:border-green-300'}`}>
                                <input
                                    type="checkbox"
                                    value={subj.id}
                                    {...register('matieres')}
                                    className="hidden"
                                />
                                {selectedSubjects.includes(subj.id) && <Plus size={14} className="text-white rotate-45" />}
                            </div>
                            <div>
                                <p className={`text-xs font-black uppercase tracking-tight ${selectedSubjects.includes(subj.id) ? 'text-green-900' : 'text-gray-700'}`}>{subj.name}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{subj.category.replace('_', ' ')}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-8 border-t border-gray-50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-700 rounded-lg"><FileText size={20} /></div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Certificats & Formations Additionnelles</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => append({ nom: '', organisme: '', annee: new Date().getFullYear() })}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-green-100 transition-colors border-2 border-green-100"
                    >
                        <Plus size={16} /> Ajouter un certificat
                    </button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-gray-50/50 border-2 border-gray-50 rounded-2xl items-center relative group">
                            <div className="md:col-span-1">
                                <input
                                    {...register(`certificats.${index}.nom` as const)}
                                    placeholder="Nom du certificat"
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-bold text-xs uppercase tracking-tight focus:border-green-600 focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <input
                                    {...register(`certificats.${index}.organisme` as const)}
                                    placeholder="Organisme"
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-bold text-xs uppercase tracking-tight focus:border-green-600 focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <input
                                    type="number"
                                    {...register(`certificats.${index}.annee` as const)}
                                    placeholder="Année"
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-bold text-xs uppercase tracking-tight focus:border-green-600 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    ref={el => fileInputRefs.current[index] = el}
                                    onChange={(e) => handleFileSelect(index, e)}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRefs.current[index]?.click()}
                                    className={`flex-1 py-2.5 border-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${certificatFiles[index] ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-gray-100 text-gray-400 hover:text-green-700'}`}
                                >
                                    {certificatFiles[index] ? <CheckCircle2 size={14} /> : <Upload size={14} />}
                                    {certificatFiles[index] ? 'Fichier joint' : 'Joindre PDF'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            {certificatFiles[index] && (
                                <div className="md:col-span-4 mt-2 px-4 py-1.5 bg-white/50 rounded-lg flex items-center justify-between border border-green-50">
                                    <span className="text-[10px] font-bold text-green-700 truncate max-w-[200px]">{certificatFiles[index].name}</span>
                                    <button onClick={() => {
                                        const newFiles = [...certificatFiles];
                                        delete newFiles[index];
                                        setValue('certificatFiles', newFiles);
                                    }} className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase">supprimer le fichier</button>
                                </div>
                            )}
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center opacity-40">
                            <FileText size={32} className="text-gray-300 mb-2" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Aucun document additionnel</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
