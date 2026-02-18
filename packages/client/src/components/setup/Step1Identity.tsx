import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import type { Step1Data } from '@edugoma360/shared';

interface Step1IdentityProps {
    data: Partial<Step1Data>;
    onChange: (data: Partial<Step1Data>) => void;
    errors: Record<string, string[]>;
}

export default function Step1Identity({ data, onChange, errors }: Step1IdentityProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file
            if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
                alert('Format non supporté. Utilisez PNG, JPG ou SVG.');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert('Fichier trop volumineux. Maximum 2MB.');
                return;
            }

            // Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            onChange({ ...data, logoFile: file });
        }
    };

    const handleRemoveLogo = () => {
        setLogoPreview(null);
        onChange({ ...data, logoFile: undefined });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Identité de l'école
                </h2>
                <p className="text-sm text-neutral-600">
                    Commençons par les informations de base de votre établissement
                </p>
            </div>

            {/* Nom officiel */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nom officiel de l'école <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={data.name || ''}
                    onChange={(e) => onChange({ ...data, name: e.target.value })}
                    placeholder="Nom complet de l'établissement"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               transition-colors"
                    maxLength={100}
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                )}
            </div>

            {/* Type d'établissement */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Type d'établissement <span className="text-red-500">*</span>
                </label>
                <select
                    value={data.type || ''}
                    onChange={(e) =>
                        onChange({
                            ...data,
                            type: e.target.value as 'OFFICIELLE' | 'CONVENTIONNEE' | 'PRIVEE',
                        })
                    }
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               transition-colors"
                >
                    <option value="">Sélectionnez un type</option>
                    <option value="OFFICIELLE">École Officielle (gérée par l'État)</option>
                    <option value="CONVENTIONNEE">
                        École Conventionnée (gérée par une confession religieuse)
                    </option>
                    <option value="PRIVEE">École Privée Agréée</option>
                </select>
                {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type[0]}</p>
                )}
            </div>

            {/* Convention religieuse (conditional) */}
            {data.type === 'CONVENTIONNEE' && (
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Convention religieuse <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.convention || ''}
                        onChange={(e) => onChange({ ...data, convention: e.target.value as any })}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                   focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                   transition-colors"
                    >
                        <option value="">Sélectionnez une convention</option>
                        <option value="CATHOLIQUE">Catholique</option>
                        <option value="PROTESTANTE">Protestante</option>
                        <option value="KIMBANGUISTE">Kimbanguiste</option>
                        <option value="ISLAMIQUE">Islamique</option>
                        <option value="ARMEE_SALUT">Armée du Salut</option>
                    </select>
                    {errors.convention && (
                        <p className="mt-1 text-sm text-red-600">{errors.convention[0]}</p>
                    )}
                </div>
            )}

            {/* Numéro d'agrément */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Numéro d'agrément MEPST
                </label>
                <input
                    type="text"
                    value={data.agrement || ''}
                    onChange={(e) => onChange({ ...data, agrement: e.target.value })}
                    placeholder="Ex: NK/EPSP/ISS001/2024"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               transition-colors"
                />
                <p className="mt-1 text-xs text-neutral-500">Optionnel mais recommandé</p>
            </div>

            {/* Logo upload */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Logo de l'école
                </label>

                {logoPreview ? (
                    <div className="relative inline-block">
                        <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-32 h-32 object-contain border-2 border-neutral-200 rounded-lg"
                        />
                        <button
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white 
                                       rounded-full flex items-center justify-center hover:bg-red-600 
                                       transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-300 rounded-lg p-8 
                                   text-center cursor-pointer hover:border-primary 
                                   hover:bg-primary/5 transition-colors"
                    >
                        <Upload size={32} className="mx-auto text-neutral-400 mb-2" />
                        <p className="text-sm text-neutral-600 mb-1">
                            Cliquez pour parcourir ou glissez-déposez
                        </p>
                        <p className="text-xs text-neutral-500">
                            PNG, JPG ou SVG • Max 2MB • 512×512px recommandé
                        </p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
}
