import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import PhotoUpload from '../../students/form/PhotoUpload';
import { User, Phone, Mail, MapPin, Calendar, Map, Flag } from 'lucide-react';
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
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="w-full md:w-auto flex flex-col items-center gap-4">
                    <PhotoUpload
                        onChange={(file: File | undefined, preview: string | undefined) => {
                            setValue('photoFile', file);
                            setValue('photoPreview', preview);
                        }}
                        preview={photoPreview}
                    />
                    <div className="text-center">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Photo de Profil</span>
                        <p className="text-[10px] text-gray-300 font-bold uppercase mt-1">MAX 2MB • JPG, PNG</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* NOM */}
                    <div className="group">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-700 transition-colors">Nom de famille *</label>
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                            <input
                                {...register('nom')}
                                placeholder="EX: MUKASA"
                                className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 placeholder:text-gray-200 uppercase ${errors.nom ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                            />
                        </div>
                        {errors.nom && <p className="text-[10px] font-black text-red-500 mt-2 ml-1 uppercase">{errors.nom.message as string}</p>}
                    </div>

                    {/* POST-NOM */}
                    <div className="group">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-700 transition-colors">Post-nom *</label>
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                            <input
                                {...register('postNom')}
                                placeholder="EX: JEAN"
                                className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 placeholder:text-gray-200 uppercase ${errors.postNom ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                            />
                        </div>
                        {errors.postNom && <p className="text-[10px] font-black text-red-500 mt-2 ml-1 uppercase">{errors.postNom.message as string}</p>}
                    </div>

                    {/* PRENOM */}
                    <div className="group">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-700 transition-colors">Prénom</label>
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                            <input
                                {...register('prenom')}
                                placeholder="EX: Pierre"
                                className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 placeholder:text-gray-200 ${errors.prenom ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                            />
                        </div>
                    </div>

                    {/* SEXE */}
                    <div className="group">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Sexe *</label>
                        <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl border-2 border-gray-50 h-[58px]">
                            <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-xl hover:bg-white font-black text-xs uppercase tracking-widest transition-all has-[:checked]:bg-white has-[:checked]:text-green-700 has-[:checked]:shadow-sm border border-transparent has-[:checked]:border-green-100 group">
                                <input type="radio" value="M" {...register('sexe')} className="hidden" />
                                <span>Masculin</span>
                            </label>
                            <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-xl hover:bg-white font-black text-xs uppercase tracking-widest transition-all has-[:checked]:bg-white has-[:checked]:text-green-700 has-[:checked]:shadow-sm border border-transparent has-[:checked]:border-green-100">
                                <input type="radio" value="F" {...register('sexe')} className="hidden" />
                                <span>Féminin</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-50">
                {/* DATE NAISSANCE */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-700 transition-colors">Date de naissance * {age && <span className="text-green-600">({age} ans)</span>}</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <input
                            type="date"
                            {...register('dateNaissance')}
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 ${errors.dateNaissance ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        />
                    </div>
                </div>

                {/* LIEU NAISSANCE */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-700 transition-colors">Lieu de naissance *</label>
                    <div className="relative">
                        <Map size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <input
                            {...register('lieuNaissance')}
                            placeholder="EX: Bukavu, SK"
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 ${errors.lieuNaissance ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        />
                    </div>
                </div>

                {/* NATIONALITÉ */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-700 transition-colors">Nationalité *</label>
                    <div className="relative">
                        <Flag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <select
                            {...register('nationalite')}
                            defaultValue="Congolaise"
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 appearance-none cursor-pointer ${errors.nationalite ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        >
                            <option value="Congolaise">Congolaise</option>
                            <option value="Rwandaise">Rwandaise</option>
                            <option value="Ougandaise">Ougandaise</option>
                            <option value="Burundaise">Burundaise</option>
                            <option value="Kényane">Kényane</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                {/* TÉLÉPHONE */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-700 transition-colors">Téléphone *</label>
                    <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <input
                            {...register('telephone')}
                            placeholder="+243 810 000 000"
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 ${errors.telephone ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        />
                    </div>
                    {errors.telephone && <p className="text-[10px] font-black text-red-500 mt-2 ml-1 uppercase">{errors.telephone.message as string}</p>}
                </div>

                {/* EMAIL */}
                <div className="group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-700 transition-colors">Email Personnel</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <input
                            type="email"
                            {...register('email')}
                            placeholder="exemple@email.com"
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 ${errors.email ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        />
                    </div>
                </div>

                {/* ADRESSE */}
                <div className="md:col-span-2 group">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-green-700 transition-colors">Adresse Physique *</label>
                    <div className="relative">
                        <MapPin size={18} className="absolute left-4 top-4 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                        <textarea
                            {...register('adresse')}
                            rows={3}
                            placeholder="Saisissez l'adresse complète (Quartier, Avenue, N°, Commune)..."
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-gray-900 ${errors.adresse ? 'border-red-100 bg-red-50/20' : 'border-gray-50 focus:border-green-600'}`}
                        />
                    </div>
                    {errors.adresse && <p className="text-[10px] font-black text-red-500 mt-2 ml-1 uppercase">{errors.adresse.message as string}</p>}
                </div>
            </div>
        </div>
    );
};
