import React, { useRef } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, GraduationCap, Upload, FileText } from 'lucide-react';
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
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NIVEAU D'ÉTUDES */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Niveau d'études <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('niveauEtudes')}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   bg-white ${errors.niveauEtudes ? 'border-red-500' : 'border-neutral-300'}`}
                    >
                        <option value="">Sélectionnez le niveau</option>
                        <option value="D6">D6 (Diplôme d'État)</option>
                        <option value="GRADUAT">Graduat (Bac+3)</option>
                        <option value="LICENCE">Licence (Bac+5)</option>
                        <option value="MASTER">Master (Bac+7)</option>
                        <option value="DOCTORAT">Doctorat (Bac+8)</option>
                    </select>
                    {errors.niveauEtudes && (
                        <p className="text-xs text-red-600 mt-1">{errors.niveauEtudes.message as string}</p>
                    )}
                </div>

                {/* DOMAINE DE FORMATION */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Domaine de formation <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('domaineFormation')}
                        placeholder="EX: Mathématiques et Physique"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.domaineFormation ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.domaineFormation && (
                        <p className="text-xs text-red-600 mt-1">{errors.domaineFormation.message as string}</p>
                    )}
                </div>

                {/* UNIVERSITÉ */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Université / Institut <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('universite')}
                        placeholder="EX: UNIKIN"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.universite ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.universite && (
                        <p className="text-xs text-red-600 mt-1">{errors.universite.message as string}</p>
                    )}
                </div>

                {/* ANNÉE OBTENTION */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Année d'obtention <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        {...register('anneeObtention')}
                        min="1980"
                        max={new Date().getFullYear()}
                        placeholder="EX: 2008"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.anneeObtention ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.anneeObtention && (
                        <p className="text-xs text-red-600 mt-1">{errors.anneeObtention.message as string}</p>
                    )}
                </div>
            </div>

            {/* MATIÈRES */}
            <div className="pt-6 border-t border-neutral-200">
                <div className="flex items-center gap-2 mb-4">
                    <GraduationCap size={18} className="text-primary" />
                    <h3 className="text-base font-semibold text-neutral-900">Matières Enseignées <span className="text-red-500">*</span></h3>
                    <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded ml-2">Min. 1 requis</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SUBJECTS_LIST.map((subj) => {
                        const isSelected = selectedSubjects.includes(subj.id);
                        return (
                            <label key={subj.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-neutral-200 hover:border-neutral-300'}`}>
                                <div className="mt-0.5">
                                    <input
                                        type="checkbox"
                                        value={subj.id}
                                        {...register('matieres')}
                                        className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-neutral-700'}`}>{subj.name}</p>
                                    <p className="text-xs text-neutral-500 capitalize">{subj.category.replace('_', ' ')}</p>
                                </div>
                            </label>
                        );
                    })}
                </div>
                {errors.matieres && (
                    <p className="text-xs text-red-600 mt-2">{errors.matieres.message as string}</p>
                )}
            </div>

            {/* CERTIFICATS */}
            <div className="pt-6 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-primary" />
                        <h3 className="text-base font-semibold text-neutral-900">Certificats & Formations Additionnelles</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => append({ nom: '', organisme: '', annee: new Date().getFullYear() })}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                        <Plus size={16} /> Ajouter
                    </button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="relative p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">Nom du certificat</label>
                                    <input
                                        {...register(`certificats.${index}.nom` as const)}
                                        placeholder="Ex: Pédagogie active"
                                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">Organisme</label>
                                    <input
                                        {...register(`certificats.${index}.organisme` as const)}
                                        placeholder="Ex: UNICEF"
                                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">Année</label>
                                    <input
                                        type="number"
                                        {...register(`certificats.${index}.annee` as const)}
                                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-200">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    ref={el => fileInputRefs.current[index] = el}
                                    onChange={(e) => handleFileSelect(index, e)}
                                />
                                <div className="flex items-center gap-3 w-full">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRefs.current[index]?.click()}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors text-neutral-700"
                                    >
                                        <Upload size={14} />
                                        {certificatFiles[index] ? 'Changer le fichier' : 'Joindre un scan (Optionnel)'}
                                    </button>

                                    {certificatFiles[index] && (
                                        <div className="flex items-center justify-between flex-1 bg-white border border-neutral-200 px-3 py-1 rounded text-xs">
                                            <span className="text-neutral-600 truncate max-w-[200px]">{certificatFiles[index].name}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newFiles = [...certificatFiles];
                                                    delete newFiles[index];
                                                    setValue('certificatFiles', newFiles);
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <div className="text-center py-8 bg-neutral-50 border border-neutral-200 border-dashed rounded-lg">
                            <p className="text-sm text-neutral-500">Aucun certificat additionnel ajouté</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
