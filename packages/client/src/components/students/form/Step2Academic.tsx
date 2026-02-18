import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStudentForm } from '../../../hooks/useStudentForm';
import api from '../../../lib/api';

export default function Step2Academic() {
    const { formData, updateFormData, validationErrors } = useStudentForm();

    // Fetch sections
    const { data: sections = [] } = useQuery({
        queryKey: ['sections'],
        queryFn: async () => {
            const res = await api.get('/settings/sections');
            return res.data?.data || res.data || [];
        },
    });

    // Fetch classes filtered by section
    const { data: classes = [] } = useQuery({
        queryKey: ['classes', formData.sectionId],
        queryFn: async () => {
            const res = await api.get('/settings/classes', {
                params: { sectionId: formData.sectionId },
            });
            return res.data?.data || res.data || [];
        },
        enabled: !!formData.sectionId,
    });

    // Reset classId when section changes
    useEffect(() => {
        if (formData.sectionId && formData.classId) {
            const classExists = classes.some((c: any) => c.id === formData.classId);
            if (!classExists) {
                updateFormData({ classId: '' });
            }
        }
    }, [formData.sectionId, classes]);

    const handleChange = (field: string, value: any) => {
        updateFormData({ [field]: value });
    };

    // Check if class is 3rd year or higher for TENASOSP
    const selectedClass = classes.find((c: any) => c.id === formData.classId);
    const showTenasosp = selectedClass?.name?.match(/^[3-6]/);

    const errors = validationErrors;

    const STATUTS = [
        { value: 'NOUVEAU', label: 'Nouveau' },
        { value: 'REDOUBLANT', label: 'Redoublant' },
        { value: 'TRANSFERE', label: 'Transféré' },
        { value: 'DEPLACE', label: 'Déplacé interne' },
        { value: 'REFUGIE', label: 'Réfugié' },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-5">
                {/* Section */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Section <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.sectionId || ''}
                        onChange={(e) => handleChange('sectionId', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   bg-white ${errors.sectionId ? 'border-red-500' : 'border-neutral-300'}`}
                    >
                        <option value="">Sélectionnez une section</option>
                        {sections.map((section: any) => (
                            <option key={section.id} value={section.id}>
                                {section.name}
                            </option>
                        ))}
                    </select>
                    {errors.sectionId && (
                        <p className="text-xs text-red-600 mt-1">{errors.sectionId[0]}</p>
                    )}
                </div>

                {/* Classe */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Classe <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.classId || ''}
                        onChange={(e) => handleChange('classId', e.target.value)}
                        disabled={!formData.sectionId}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   bg-white disabled:bg-neutral-100 disabled:cursor-not-allowed
                                   ${errors.classId ? 'border-red-500' : 'border-neutral-300'}`}
                    >
                        <option value="">
                            {formData.sectionId
                                ? 'Sélectionnez une classe'
                                : 'Sélectionnez d\'abord une section'}
                        </option>
                        {classes.map((classe: any) => (
                            <option key={classe.id} value={classe.id}>
                                {classe.name}
                            </option>
                        ))}
                    </select>
                    {errors.classId && (
                        <p className="text-xs text-red-600 mt-1">{errors.classId[0]}</p>
                    )}
                </div>

                {/* Statut */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Statut de l'élève <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.statut || 'NOUVEAU'}
                        onChange={(e) => handleChange('statut', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   bg-white ${errors.statut ? 'border-red-500' : 'border-neutral-300'}`}
                    >
                        {STATUTS.map((statut) => (
                            <option key={statut.value} value={statut.value}>
                                {statut.label}
                            </option>
                        ))}
                    </select>
                    {errors.statut && (
                        <p className="text-xs text-red-600 mt-1">{errors.statut[0]}</p>
                    )}
                </div>

                {/* École d'origine (si transféré) */}
                {formData.statut === 'TRANSFERE' && (
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            École d'origine <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.ecoleOrigine || ''}
                            onChange={(e) => handleChange('ecoleOrigine', e.target.value)}
                            placeholder="Complexe Scolaire de Nyiragongo"
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                       focus:ring-primary/20 focus:border-primary transition-colors
                                       ${errors.ecoleOrigine ? 'border-red-500' : 'border-neutral-300'}`}
                        />
                        {errors.ecoleOrigine && (
                            <p className="text-xs text-red-600 mt-1">{errors.ecoleOrigine[0]}</p>
                        )}
                    </div>
                )}

                {/* Résultat TENASOSP (si classe ≥ 3ème) */}
                {showTenasosp && (
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Résultat TENASOSP
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.resultatTenasosp || ''}
                            onChange={(e) =>
                                handleChange(
                                    'resultatTenasosp',
                                    e.target.value ? parseFloat(e.target.value) : undefined
                                )
                            }
                            placeholder="67"
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                       focus:ring-primary/20 focus:border-primary transition-colors
                                       ${errors.resultatTenasosp ? 'border-red-500' : 'border-neutral-300'}`}
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                            Pourcentage obtenu au TENASOSP (0 à 100)
                        </p>
                        {errors.resultatTenasosp && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.resultatTenasosp[0]}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
