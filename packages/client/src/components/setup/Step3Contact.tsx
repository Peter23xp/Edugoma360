import { Phone, Mail, Globe, Facebook, MessageCircle, Twitter } from 'lucide-react';
import type { Step3Data } from '@edugoma360/shared';

interface Step3ContactProps {
    data: Partial<Step3Data>;
    onChange: (data: Partial<Step3Data>) => void;
    errors: Record<string, string[]>;
}

export default function Step3Contact({ data, onChange, errors }: Step3ContactProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Contacts</h2>
                <p className="text-sm text-neutral-600">
                    Comment peut-on joindre votre établissement ?
                </p>
            </div>

            {/* Téléphone principal */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Phone size={16} className="inline mr-1" />
                    Téléphone principal <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    value={data.telephone || ''}
                    onChange={(e) => onChange({ ...data, telephone: e.target.value })}
                    placeholder="+243 810 000 000"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               transition-colors"
                />
                {errors.telephone && (
                    <p className="mt-1 text-sm text-red-600">{errors.telephone[0]}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">
                    Format: +243XXXXXXXXX (numéro congolais)
                </p>
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Mail size={16} className="inline mr-1" />
                    Email de l'école
                </label>
                <input
                    type="email"
                    value={data.email || ''}
                    onChange={(e) => onChange({ ...data, email: e.target.value })}
                    placeholder="contact@institutgoma.cd"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               transition-colors"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">Optionnel mais recommandé</p>
            </div>

            {/* Site web */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Globe size={16} className="inline mr-1" />
                    Site web
                </label>
                <input
                    type="url"
                    value={data.website || ''}
                    onChange={(e) => onChange({ ...data, website: e.target.value })}
                    placeholder="https://www.institutgoma.cd"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary 
                               transition-colors"
                />
                {errors.website && (
                    <p className="mt-1 text-sm text-red-600">{errors.website[0]}</p>
                )}
            </div>

            {/* Réseaux sociaux */}
            <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                    Réseaux sociaux (optionnel)
                </h3>

                <div className="space-y-4">
                    {/* Facebook */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            <Facebook size={16} className="inline mr-1" />
                            Facebook
                        </label>
                        <input
                            type="text"
                            value={data.facebook || ''}
                            onChange={(e) => onChange({ ...data, facebook: e.target.value })}
                            placeholder="@InstitutGoma ou URL complète"
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       transition-colors"
                        />
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            <MessageCircle size={16} className="inline mr-1" />
                            WhatsApp
                        </label>
                        <input
                            type="tel"
                            value={data.whatsapp || ''}
                            onChange={(e) => onChange({ ...data, whatsapp: e.target.value })}
                            placeholder="+243 810 000 000"
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       transition-colors"
                        />
                        {errors.whatsapp && (
                            <p className="mt-1 text-sm text-red-600">{errors.whatsapp[0]}</p>
                        )}
                    </div>

                    {/* Twitter/X */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            <Twitter size={16} className="inline mr-1" />
                            Twitter / X
                        </label>
                        <input
                            type="text"
                            value={data.twitter || ''}
                            onChange={(e) => onChange({ ...data, twitter: e.target.value })}
                            placeholder="@InstitutGoma"
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                       focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                       transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
