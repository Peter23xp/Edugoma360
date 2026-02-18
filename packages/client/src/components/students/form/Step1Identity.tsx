import { useStudentForm } from '../../../hooks/useStudentForm';
import PhotoUpload from './PhotoUpload';

const NATIONALITES = [
    'Congolaise',
    'Rwandaise',
    'Burundaise',
    'Ougandaise',
    '---',
    'Angolaise',
    'Camerounaise',
    'Centrafricaine',
    'Gabonaise',
    'Kenyane',
    'Sud-Africaine',
    'Tanzanienne',
    'Zambienne',
];

export default function Step1Identity() {
    const { formData, updateFormData, validationErrors } = useStudentForm();

    const handleChange = (field: string, value: any) => {
        updateFormData({ [field]: value });
    };

    const handlePhotoChange = (file: File | undefined, preview: string | undefined) => {
        updateFormData({
            photoFile: file,
            photoPreview: preview,
        });
    };

    // Calculate age
    const calculateAge = (birthDate: Date | string): number => {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const age = formData.dateNaissance ? calculateAge(formData.dateNaissance) : null;
    const errors = validationErrors;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Photo */}
            <div className="flex justify-center">
                <PhotoUpload
                    preview={formData.photoPreview}
                    onChange={handlePhotoChange}
                    error={errors.photoFile?.[0]}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nom */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Nom (de famille) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.nom || ''}
                        onChange={(e) => handleChange('nom', e.target.value.toUpperCase())}
                        placeholder="AMISI"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   uppercase ${errors.nom ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.nom && (
                        <p className="text-xs text-red-600 mt-1">{errors.nom[0]}</p>
                    )}
                </div>

                {/* Post-nom */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Post-nom (nom du père) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.postNom || ''}
                        onChange={(e) => handleChange('postNom', e.target.value.toUpperCase())}
                        placeholder="KALOMBO"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   uppercase ${errors.postNom ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.postNom && (
                        <p className="text-xs text-red-600 mt-1">{errors.postNom[0]}</p>
                    )}
                </div>

                {/* Prénom */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Prénom(s)
                    </label>
                    <input
                        type="text"
                        value={formData.prenom || ''}
                        onChange={(e) => handleChange('prenom', e.target.value)}
                        placeholder="Jean-Baptiste"
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg 
                                   focus:ring-2 focus:ring-primary/20 focus:border-primary 
                                   transition-colors"
                    />
                </div>

                {/* Sexe */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Sexe <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="sexe"
                                value="M"
                                checked={formData.sexe === 'M'}
                                onChange={(e) => handleChange('sexe', e.target.value)}
                                className="w-4 h-4 text-primary focus:ring-primary/20"
                            />
                            <span className="text-sm text-neutral-700">Masculin</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="sexe"
                                value="F"
                                checked={formData.sexe === 'F'}
                                onChange={(e) => handleChange('sexe', e.target.value)}
                                className="w-4 h-4 text-primary focus:ring-primary/20"
                            />
                            <span className="text-sm text-neutral-700">Féminin</span>
                        </label>
                    </div>
                    {errors.sexe && (
                        <p className="text-xs text-red-600 mt-1">{errors.sexe[0]}</p>
                    )}
                </div>

                {/* Date de naissance */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Date de naissance <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={
                            formData.dateNaissance
                                ? new Date(formData.dateNaissance).toISOString().split('T')[0]
                                : ''
                        }
                        onChange={(e) => handleChange('dateNaissance', e.target.value)}
                        max={new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .split('T')[0]}
                        min="1990-01-01"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.dateNaissance ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {age !== null && (
                        <p className="text-xs text-neutral-500 mt-1">({age} ans)</p>
                    )}
                    {errors.dateNaissance && (
                        <p className="text-xs text-red-600 mt-1">{errors.dateNaissance[0]}</p>
                    )}
                </div>

                {/* Lieu de naissance */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Lieu de naissance <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.lieuNaissance || ''}
                        onChange={(e) => handleChange('lieuNaissance', e.target.value)}
                        placeholder="Goma, Nord-Kivu"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   ${errors.lieuNaissance ? 'border-red-500' : 'border-neutral-300'}`}
                    />
                    {errors.lieuNaissance && (
                        <p className="text-xs text-red-600 mt-1">{errors.lieuNaissance[0]}</p>
                    )}
                </div>

                {/* Nationalité */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Nationalité <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.nationalite || 'Congolaise'}
                        onChange={(e) => handleChange('nationalite', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 
                                   focus:ring-primary/20 focus:border-primary transition-colors
                                   bg-white ${errors.nationalite ? 'border-red-500' : 'border-neutral-300'}`}
                    >
                        {NATIONALITES.map((nat) =>
                            nat === '---' ? (
                                <option key={nat} disabled>
                                    ───────────
                                </option>
                            ) : (
                                <option key={nat} value={nat}>
                                    {nat}
                                </option>
                            )
                        )}
                    </select>
                    {errors.nationalite && (
                        <p className="text-xs text-red-600 mt-1">{errors.nationalite[0]}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
