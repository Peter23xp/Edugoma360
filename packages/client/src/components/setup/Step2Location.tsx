import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { RDC_PROVINCES, NORD_KIVU_CITIES, type Step2Data } from '@edugoma360/shared';

interface Step2LocationProps {
    data: Partial<Step2Data>;
    onChange: (data: Partial<Step2Data>) => void;
    errors: Record<string, string[]>;
}

export default function Step2Location({ data, onChange, errors }: Step2LocationProps) {
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('La géolocalisation n\'est pas supportée par votre navigateur');
            return;
        }

        setIsLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                onChange({
                    ...data,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setIsLoadingLocation(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Impossible d\'obtenir votre position');
                setIsLoadingLocation(false);
            }
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Localisation</h2>
                <p className="text-sm text-neutral-600">
                    Où se trouve votre établissement ?
                </p>
            </div>

            {/* Province */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Province <span className="text-red-500">*</span>
                </label>
                <select
                    value={data.province || 'Nord-Kivu'}
                    onChange={(e) => onChange({ ...data, province: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               transition-colors"
                >
                    {RDC_PROVINCES.map((province) => (
                        <option key={province} value={province}>
                            {province}
                        </option>
                    ))}
                </select>
                {errors.province && (
                    <p className="mt-1 text-sm text-red-600">{errors.province[0]}</p>
                )}
            </div>

            {/* Ville */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Territoire / Ville <span className="text-red-500">*</span>
                </label>
                {data.province === 'Nord-Kivu' ? (
                    <select
                        value={data.ville || 'Goma'}
                        onChange={(e) => onChange({ ...data, ville: e.target.value })}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                   focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                   transition-colors"
                    >
                        {NORD_KIVU_CITIES.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        value={data.ville || ''}
                        onChange={(e) => onChange({ ...data, ville: e.target.value })}
                        placeholder="Nom de la ville ou territoire"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                   focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                   transition-colors"
                    />
                )}
                {errors.ville && (
                    <p className="mt-1 text-sm text-red-600">{errors.ville[0]}</p>
                )}
            </div>

            {/* Commune / Quartier */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Commune / Quartier
                </label>
                <input
                    type="text"
                    value={data.commune || ''}
                    onChange={(e) => onChange({ ...data, commune: e.target.value })}
                    placeholder="Ex: Quartier Himbi"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               transition-colors"
                />
            </div>

            {/* Adresse physique */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Adresse physique <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={data.adresse || ''}
                    onChange={(e) => onChange({ ...data, adresse: e.target.value })}
                    placeholder="Ex: Avenue de la Paix, N°12, près de la Ronde-Point Virunga"
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               transition-colors resize-none"
                />
                {errors.adresse && (
                    <p className="mt-1 text-sm text-red-600">{errors.adresse[0]}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">
                    {data.adresse?.length || 0}/200 caractères
                </p>
            </div>

            {/* Coordonnées GPS */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Coordonnées GPS (optionnel)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input
                            type="number"
                            step="0.0001"
                            value={data.latitude || ''}
                            onChange={(e) =>
                                onChange({ ...data, latitude: parseFloat(e.target.value) || undefined })
                            }
                            placeholder="Latitude (ex: -1.6740)"
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       transition-colors"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            step="0.0001"
                            value={data.longitude || ''}
                            onChange={(e) =>
                                onChange({ ...data, longitude: parseFloat(e.target.value) || undefined })
                            }
                            placeholder="Longitude (ex: 29.2228)"
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       transition-colors"
                        />
                    </div>
                </div>
                <button
                    onClick={handleGetCurrentLocation}
                    disabled={isLoadingLocation}
                    className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-medium 
                               text-primary border border-primary rounded-lg 
                               hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                    <MapPin size={16} />
                    {isLoadingLocation ? 'Localisation...' : 'Utiliser ma position actuelle'}
                </button>
            </div>
        </div>
    );
}
