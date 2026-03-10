import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import PhotoUpload from '../../students/form/PhotoUpload';
import { differenceInYears } from 'date-fns';

interface Step1IdentityProps {
    form: UseFormReturn<any>;
}

export const Step1Identity: React.FC<Step1IdentityProps> = ({ form }) => {
    const { register, formState: { errors }, watch, setValue } = form;
    const dateNaissance = watch('dateNaissance');
    const photoPreview = watch('photoPreview');
    const age = dateNaissance ? differenceInYears(new Date(), new Date(dateNaissance)) : null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Photo */}
            <div className="flex justify-center">
                <PhotoUpload
                    onChange={(file: File | undefined, preview: string | undefined) => {
                        setValue('photoFile', file);
                        setValue('photoPreview', preview);
                    }}
                    preview={photoPreview}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NOM */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Nom de famille <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('nom')}
                        placeholder="EX: MUKASA"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   uppercase ${errors.nom ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.nom && (
                        <p className="text-xs text-red-600 mt-1">{errors.nom.message as string}</p>
                    )}
                </div>

                {/* POST-NOM */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Post-nom <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('postNom')}
                        placeholder="EX: JEAN"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   uppercase ${errors.postNom ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.postNom && (
                        <p className="text-xs text-red-600 mt-1">{errors.postNom.message as string}</p>
                    )}
                </div>

                {/* PRENOM */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Prénom</label>
                    <input
                        {...register('prenom')}
                        placeholder="EX: Pierre"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.prenom ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                </div>

                {/* SEXE */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Sexe <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="M"
                                {...register('sexe')}
                                className="w-4 h-4 text-primary focus:ring-primary/20"
                            />
                            <span className="text-sm text-neutral-700">Masculin</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="F"
                                {...register('sexe')}
                                className="w-4 h-4 text-primary focus:ring-primary/20"
                            />
                            <span className="text-sm text-neutral-700">Féminin</span>
                        </label>
                    </div>
                    {errors.sexe && (
                        <p className="text-xs text-red-600 mt-1">{errors.sexe.message as string}</p>
                    )}
                </div>

                {/* DATE NAISSANCE */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Date de naissance <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        {...register('dateNaissance')}
                        max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        min="1940-01-01"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.dateNaissance ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {age !== null && (
                        <p className="text-xs text-neutral-500 mt-1">({age} ans)</p>
                    )}
                    {errors.dateNaissance && (
                        <p className="text-xs text-red-600 mt-1">{errors.dateNaissance.message as string}</p>
                    )}
                </div>

                {/* LIEU NAISSANCE */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Lieu de naissance <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('lieuNaissance')}
                        placeholder="EX: Bukavu, SK"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.lieuNaissance ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.lieuNaissance && (
                        <p className="text-xs text-red-600 mt-1">{errors.lieuNaissance.message as string}</p>
                    )}
                </div>

                {/* NATIONALITÉ */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Nationalité <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('nationalite')}
                        defaultValue="Congolaise"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   bg-white ${errors.nationalite ? 'border-red-500' : 'border-neutral-300'}`}
                    >
                        <option value="Congolaise">Congolaise</option>
                        <option value="Rwandaise">Rwandaise</option>
                        <option value="Ougandaise">Ougandaise</option>
                        <option value="Burundaise">Burundaise</option>
                        <option value="Kényane">Kényane</option>
                    </select>
                    {errors.nationalite && (
                        <p className="text-xs text-red-600 mt-1">{errors.nationalite.message as string}</p>
                    )}
                </div>

                {/* TÉLÉPHONE */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register('telephone')}
                        placeholder="+243 810 000 000"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.telephone ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.telephone && (
                        <p className="text-xs text-red-600 mt-1">{errors.telephone.message as string}</p>
                    )}
                </div>

                {/* EMAIL */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Personnel</label>
                    <input
                        type="email"
                        {...register('email')}
                        placeholder="exemple@email.com"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.email ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                </div>

                {/* ADRESSE */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Adresse Physique <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        {...register('adresse')}
                        rows={3}
                        placeholder="Saisissez l'adresse complète (Quartier, Avenue, N°, Commune)..."
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.adresse ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.adresse && (
                        <p className="text-xs text-red-600 mt-1">{errors.adresse.message as string}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
