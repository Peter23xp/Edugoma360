import React, { useState, useEffect } from 'react';
import { useForm as useRHForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, RefreshCw, Save, X, Phone, Mail, Globe, Hash, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { schoolInfoSchema, SchoolInfoFormData } from '../../schemas/schoolInfoSchema';
import LogoUploadZone from './LogoUploadZone';
import ProvinceVilleSelector from './ProvinceVilleSelector';
import { cn } from '../../lib/utils';
import { SchoolData } from '../../hooks/useSchoolSettings';

interface SchoolInfoFormProps {
    defaultValues?: Partial<SchoolData>;
    onSubmit: (formData: FormData) => Promise<void>;
    isSubmitting: boolean;
}

export default function SchoolInfoForm({ defaultValues, onSubmit, isSubmitting }: SchoolInfoFormProps) {
    const { 
        register, 
        handleSubmit, 
        control, 
        setValue, 
        watch, 
        reset, 
        formState: { errors } 
    } = useRHForm<SchoolInfoFormData>({
        resolver: zodResolver(schoolInfoSchema),
        defaultValues: {
            ...defaultValues,
            dateAgrement: defaultValues?.dateAgrement ? new Date(defaultValues.dateAgrement) : undefined,
        } as any
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        identite: true,
        localisation: true,
        contact: true,
        officiel: true,
        academique: true
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleFormSubmit = async (data: SchoolInfoFormData) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'logoFile' && value !== undefined && value !== null) {
                if (value instanceof Date) {
                    formData.append(key, value.toISOString());
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        
        if (logoFile) {
            formData.append('logoFile', logoFile);
        }

        await onSubmit(formData);
    };

    const handleReset = () => {
        reset();
        setLogoFile(null);
    };

    const labelClass = "block text-sm font-medium text-neutral-900 mb-1";
    const inputClass = "w-full appearance-none h-10 px-4 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-neutral-100 placeholder:text-neutral-400";
    const errorClass = "text-xs text-red-500 mt-1";

    const AccordionHeader = ({ id, title, defaultOpen = true }: { id: string, title: string, defaultOpen?: boolean }) => (
        <button
            type="button"
            onClick={() => toggleSection(id)}
            className="w-full flex justify-between items-center py-4 px-6 bg-neutral-50 hover:bg-neutral-100 transition-colors border-b border-neutral-200"
        >
            <h3 className="font-semibold text-neutral-800 text-sm tracking-wide uppercase flex items-center gap-2">
                <span className={cn("text-primary font-bold", openSections[id] ? "rotate-180" : "rotate-0")}>▼</span>
                {title}
            </h3>
        </button>
    );

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 pb-12">
            {/* EN-TÊTE ACTIONS */}
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm p-4 z-40 border-b border-neutral-200">
                <div className="flex gap-3">
                    <button 
                        type="button" 
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-sm font-medium border border-neutral-300 transition-colors"
                    >
                        <RefreshCw size={16} /> Réinitialiser
                    </button>
                </div>
                <div className="flex gap-3">
                    <button type="button" className="px-6 py-2 text-primary font-medium border border-primary hover:bg-primary-lighter rounded-md text-sm transition-colors">
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        Enregistrer les modifications
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                
                {/* IDENTITÉ */}
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                    <AccordionHeader id="identite" title="IDENTITÉ DE L'ÉCOLE" />
                    {openSections['identite'] && (
                        <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>Logo de l'école :</label>
                                <LogoUploadZone 
                                    currentLogoUrl={defaultValues?.logoUrl}
                                    onUpload={(f) => { setLogoFile(f); setValue('logoFile', f); }}
                                    onRemove={() => { setLogoFile(null); setValue('logoFile', undefined); }}
                                    isUploading={isSubmitting}
                                />
                                {errors.logoFile && <p className={errorClass}>{errors.logoFile.message as string}</p>}
                            </div>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className={labelClass}>
                                        Nom officiel de l'école <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        {...register('nomOfficiel')} 
                                        className={cn(inputClass, errors.nomOfficiel && "border-red-500 focus:ring-red-500/20 focus:border-red-500")}
                                        placeholder="Ex: Institut Supérieur et Secondaire Tumaini" 
                                    />
                                    {errors.nomOfficiel && <p className={errorClass}>{errors.nomOfficiel.message}</p>}
                                </div>
                                
                                <div>
                                    <label className={labelClass}>
                                        Nom court <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        {...register('nomCourt')} 
                                        className={cn(inputClass, errors.nomCourt && "border-red-500")}
                                        placeholder="Ex: ISS Tumaini (affiché dans l'interface)" 
                                    />
                                    {errors.nomCourt && <p className={errorClass}>{errors.nomCourt.message}</p>}
                                </div>
                                
                                <div>
                                    <label className={labelClass}>
                                        Code établissement <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <input 
                                            {...register('code')} 
                                            disabled={!!defaultValues?.code} // Immuable
                                            className={cn(inputClass, "pl-10 uppercase", errors.code && "border-red-500")}
                                            placeholder="Ex: ISS001" 
                                        />
                                    </div>
                                    <div className="flex items-start gap-2 mt-1">
                                        <Info size={14} className="text-info mt-0.5 shrink-0" />
                                        <p className="text-xs text-neutral-500">
                                            Utilisé dans tous les matricules (Ex: NK-GOM-ISS001...). 
                                            <span className="text-red-600 font-semibold ml-1">⚠️ Immuable après création.</span>
                                        </p>
                                    </div>
                                    {errors.code && <p className={errorClass}>{errors.code.message}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* LOCALISATION */}
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                    <AccordionHeader id="localisation" title="LOCALISATION" />
                    {openSections['localisation'] && (
                        <div className="p-6 space-y-5">
                            <Controller
                                control={control}
                                name="province"
                                render={({ field: { value: provValue, onChange: onProvChange } }) => (
                                    <Controller
                                        control={control}
                                        name="ville"
                                        render={({ field: { value: villeValue, onChange: onVilleChange } }) => (
                                            <ProvinceVilleSelector 
                                                provinceValue={provValue}
                                                villeValue={villeValue}
                                                onProvinceChange={onProvChange}
                                                onVilleChange={onVilleChange}
                                                errorProvince={errors.province?.message}
                                                errorVille={errors.ville?.message}
                                            />
                                        )}
                                    />
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Commune/Quartier <span className="text-red-500">*</span></label>
                                    <input {...register('commune')} className={cn(inputClass, errors.commune && "border-red-500")} placeholder="Ex: Himbi" />
                                    {errors.commune && <p className={errorClass}>{errors.commune.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Avenue <span className="text-red-500">*</span></label>
                                    <input {...register('avenue')} className={cn(inputClass, errors.avenue && "border-red-500")} placeholder="Ex: Avenue de la Paix" />
                                    {errors.avenue && <p className={errorClass}>{errors.avenue.message}</p>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Numéro</label>
                                    <input {...register('numero')} className={inputClass} placeholder="Ex: N°12" />
                                </div>
                                <div>
                                    <label className={labelClass}>Point de référence (optionnel)</label>
                                    <input {...register('reference')} className={inputClass} placeholder="Ex: Face à l'église catholique Sainte Marie" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTACT */}
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                    <AccordionHeader id="contact" title="COORDONNÉES DE CONTACT" />
                    {openSections['contact'] && (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Téléphone principal <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <input {...register('telephonePrincipal')} className={cn(inputClass, "pl-10", errors.telephonePrincipal && "border-red-500")} placeholder="+243 XX XXX XXXX" />
                                </div>
                                {errors.telephonePrincipal && <p className={errorClass}>{errors.telephonePrincipal.message}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Téléphone secondaire</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <input {...register('telephoneSecondaire')} className={cn(inputClass, "pl-10")} placeholder="+243 XX XXX XXXX" />
                                </div>
                                {errors.telephoneSecondaire && <p className={errorClass}>{errors.telephoneSecondaire.message}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Email officiel <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <input {...register('email')} type="email" className={cn(inputClass, "pl-10", errors.email && "border-red-500")} placeholder="contact@isstumaini.cd" />
                                </div>
                                <p className="text-xs text-info mt-1 flex items-center gap-1"><Info size={12}/> Utilisé pour les communications officielles</p>
                                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Site web</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <input {...register('siteWeb')} className={cn(inputClass, "pl-10", errors.siteWeb && "border-red-500")} placeholder="https://www.isstumaini.cd" />
                                </div>
                                {errors.siteWeb && <p className={errorClass}>{errors.siteWeb.message}</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* OFFICIEL */}
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                    <AccordionHeader id="officiel" title="INFORMATIONS OFFICIELLES" />
                    {openSections['officiel'] && (
                        <div className="p-6 space-y-6">
                            <div>
                                <label className={labelClass}>Type d'école <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    {[
                                        {v: 'OFFICIELLE', l: 'Publique/Officielle'}, 
                                        {v: 'PRIVEE', l: 'Privée'}, 
                                        {v: 'CONVENTIONNEE', l: 'Conventionnée'}
                                    ].map(t => (
                                        <label key={t.v} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" value={t.v} {...register('type')} className="text-primary h-4 w-4" />
                                            <span className="text-sm text-neutral-700">{t.l}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.type && <p className={errorClass}>{errors.type.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Numéro d'agrément <span className="text-red-500">*</span></label>
                                    <input {...register('numeroAgrement')} className={cn(inputClass, errors.numeroAgrement && "border-red-500")} placeholder="AGR/NK/2010/042" />
                                    <p className="text-xs text-neutral-500 mt-1">Format: AGR/PROVINCE/ANNÉE/NUMÉRO</p>
                                    {errors.numeroAgrement && <p className={errorClass}>{errors.numeroAgrement.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Date d'agrément <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date"
                                        {...register('dateAgrement', { valueAsDate: true })} 
                                        className={cn(inputClass, errors.dateAgrement && "border-red-500")} 
                                    />
                                    {errors.dateAgrement && <p className={errorClass}>{errors.dateAgrement.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Devise de l'école (optionnel)</label>
                                <input {...register('devise')} className={inputClass} placeholder="Ex: Savoir, Discipline, Excellence" />
                            </div>
                        </div>
                    )}
                </div>

                {/* ACADÉMIQUE */}
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                    <AccordionHeader id="academique" title="PARAMÈTRES ACADÉMIQUES" />
                    {openSections['academique'] && (
                        <div className="p-6 space-y-6">
                            <div>
                                <label className={labelClass}>Langue d'enseignement principale <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    {[
                                        {v: 'FRANCAIS', l: 'Français'}, 
                                        {v: 'ANGLAIS', l: 'Anglais'}, 
                                        {v: 'BILINGUE', l: 'Bilingue'}
                                    ].map(t => (
                                        <label key={t.v} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" value={t.v} {...register('langueEnseignement')} className="text-primary h-4 w-4" />
                                            <span className="text-sm text-neutral-700">{t.l}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.langueEnseignement && <p className={errorClass}>{errors.langueEnseignement.message}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Système d'évaluation <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    {[
                                        {v: 'NOTE_20', l: 'Notes sur 20'}, 
                                        {v: 'NOTE_10', l: 'Notes sur 10'}, 
                                        {v: 'MIXTE', l: 'Mixte (selon matière)'}
                                    ].map(t => (
                                        <label key={t.v} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" value={t.v} {...register('systemeEvaluation')} className="text-primary h-4 w-4" />
                                            <span className="text-sm text-neutral-700">{t.l}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.systemeEvaluation && <p className={errorClass}>{errors.systemeEvaluation.message}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Nombre de périodes <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    {[
                                        {v: 'TRIMESTRES', l: '3 trimestres'}, 
                                        {v: 'SEMESTRES', l: '2 semestres'}
                                    ].map(t => (
                                        <label key={t.v} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" value={t.v} {...register('nombrePeriodes')} className="text-primary h-4 w-4" />
                                            <span className="text-sm text-neutral-700">{t.l}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.nombrePeriodes && <p className={errorClass}>{errors.nombrePeriodes.message}</p>}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </form>
    );
}
