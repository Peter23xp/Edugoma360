import { useStudentForm } from '../../../hooks/useStudentForm';
import { Phone, User } from 'lucide-react';

export default function Step3Contacts() {
    const { formData, updateFormData, validationErrors } = useStudentForm();

    const handleChange = (field: string, value: any) => {
        updateFormData({ [field]: value });
    };

    const handleTuteurChange = (tuteur: 'pere' | 'mere' | 'tuteur') => {
        updateFormData({ tuteurPrincipal: tuteur });
    };

    const errors = validationErrors;

    // Check if at least one phone is provided
    const hasPhone = formData.telPere || formData.telMere || formData.telTuteur;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-6">
                <p className="text-sm text-neutral-600">
                    Au moins un numéro de téléphone est requis. Sélectionnez le tuteur principal
                    qui recevra les communications SMS.
                </p>
            </div>

            {/* Père */}
            <div className="border border-neutral-200 rounded-lg p-5 bg-neutral-50">
                <div className="flex items-center gap-2 mb-4">
                    <User size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-neutral-900">Père</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Nom complet du père
                        </label>
                        <input
                            type="text"
                            value={formData.nomPere || ''}
                            onChange={(e) => handleChange('nomPere', e.target.value)}
                            placeholder="AMISI KALOMBO Pierre"
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Téléphone du père
                        </label>
                        <div className="relative">
                            <Phone
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <input
                                type="tel"
                                value={formData.telPere || ''}
                                onChange={(e) => handleChange('telPere', e.target.value)}
                                placeholder="+243991234567"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 
                                           focus:ring-primary/20 focus:border-primary transition-colors
                                           ${errors.telPere ? 'border-red-500' : 'border-neutral-300'}`}
                            />
                        </div>
                        {errors.telPere && (
                            <p className="text-xs text-red-600 mt-1">{errors.telPere[0]}</p>
                        )}
                    </div>

                    {formData.telPere && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="tuteurPrincipal"
                                checked={formData.tuteurPrincipal === 'pere'}
                                onChange={() => handleTuteurChange('pere')}
                                className="w-4 h-4 text-primary focus:ring-primary/20"
                            />
                            <span className="text-sm text-neutral-700">
                                Tuteur principal (recevra les SMS)
                            </span>
                        </label>
                    )}
                </div>
            </div>

            {/* Mère */}
            <div className="border border-neutral-200 rounded-lg p-5 bg-neutral-50">
                <div className="flex items-center gap-2 mb-4">
                    <User size={18} className="text-pink-600" />
                    <h3 className="font-semibold text-neutral-900">Mère</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Nom complet de la mère
                        </label>
                        <input
                            type="text"
                            value={formData.nomMere || ''}
                            onChange={(e) => handleChange('nomMere', e.target.value)}
                            placeholder="BAHATI Marie"
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Téléphone de la mère
                        </label>
                        <div className="relative">
                            <Phone
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <input
                                type="tel"
                                value={formData.telMere || ''}
                                onChange={(e) => handleChange('telMere', e.target.value)}
                                placeholder="+243992345678"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 
                                           focus:ring-primary/20 focus:border-primary transition-colors
                                           ${errors.telMere ? 'border-red-500' : 'border-neutral-300'}`}
                            />
                        </div>
                        {errors.telMere && (
                            <p className="text-xs text-red-600 mt-1">{errors.telMere[0]}</p>
                        )}
                    </div>

                    {formData.telMere && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="tuteurPrincipal"
                                checked={formData.tuteurPrincipal === 'mere'}
                                onChange={() => handleTuteurChange('mere')}
                                className="w-4 h-4 text-primary focus:ring-primary/20"
                            />
                            <span className="text-sm text-neutral-700">
                                Tuteur principal (recevra les SMS)
                            </span>
                        </label>
                    )}
                </div>
            </div>

            {/* Tuteur */}
            <div className="border border-neutral-200 rounded-lg p-5 bg-neutral-50">
                <div className="flex items-center gap-2 mb-4">
                    <User size={18} className="text-green-600" />
                    <h3 className="font-semibold text-neutral-900">Tuteur / Autre contact</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Nom complet du tuteur
                        </label>
                        <input
                            type="text"
                            value={formData.nomTuteur || ''}
                            onChange={(e) => handleChange('nomTuteur', e.target.value)}
                            placeholder="MUKENDI Jean"
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Téléphone du tuteur
                        </label>
                        <div className="relative">
                            <Phone
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <input
                                type="tel"
                                value={formData.telTuteur || ''}
                                onChange={(e) => handleChange('telTuteur', e.target.value)}
                                placeholder="+243993456789"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 
                                           focus:ring-primary/20 focus:border-primary transition-colors
                                           ${errors.telTuteur ? 'border-red-500' : 'border-neutral-300'}`}
                            />
                        </div>
                        {errors.telTuteur && (
                            <p className="text-xs text-red-600 mt-1">{errors.telTuteur[0]}</p>
                        )}
                    </div>

                    {formData.telTuteur && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="tuteurPrincipal"
                                checked={formData.tuteurPrincipal === 'tuteur'}
                                onChange={() => handleTuteurChange('tuteur')}
                                className="w-4 h-4 text-primary focus:ring-primary/20"
                            />
                            <span className="text-sm text-neutral-700">
                                Tuteur principal (recevra les SMS)
                            </span>
                        </label>
                    )}
                </div>
            </div>

            {/* Validation message */}
            {!hasPhone && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                        ⚠️ Veuillez fournir au moins un numéro de téléphone
                    </p>
                </div>
            )}
        </div>
    );
}
