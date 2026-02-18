import { useStudentForm } from '../../../hooks/useStudentForm';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { User, GraduationCap, Phone, CheckCircle2 } from 'lucide-react';

export default function Step4Confirm() {
    const { formData } = useStudentForm();

    // Fetch section and class names
    const { data: sections = [] } = useQuery({
        queryKey: ['sections'],
        queryFn: async () => {
            const res = await api.get('/settings/sections');
            return res.data?.data || res.data || [];
        },
    });

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

    const selectedSection = sections.find((s: any) => s.id === formData.sectionId);
    const selectedClass = classes.find((c: any) => c.id === formData.classId);

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

    const STATUT_LABELS: Record<string, string> = {
        NOUVEAU: 'Nouveau',
        REDOUBLANT: 'Redoublant',
        TRANSFERE: 'Transféré',
        DEPLACE: 'Déplacé interne',
        REFUGIE: 'Réfugié',
    };

    // Determine principal tutor contact
    const getPrincipalContact = () => {
        if (formData.tuteurPrincipal === 'pere' && formData.telPere) {
            return { nom: formData.nomPere, tel: formData.telPere, type: 'Père' };
        }
        if (formData.tuteurPrincipal === 'mere' && formData.telMere) {
            return { nom: formData.nomMere, tel: formData.telMere, type: 'Mère' };
        }
        if (formData.tuteurPrincipal === 'tuteur' && formData.telTuteur) {
            return { nom: formData.nomTuteur, tel: formData.telTuteur, type: 'Tuteur' };
        }
        return null;
    };

    const principalContact = getPrincipalContact();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full 
                                bg-green-100 mb-4">
                    <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Vérifiez les informations
                </h2>
                <p className="text-sm text-neutral-600">
                    Assurez-vous que toutes les informations sont correctes avant de soumettre
                </p>
            </div>

            {/* Photo & Identity */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
                <div className="flex items-start gap-6">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                        {formData.photoPreview ? (
                            <img
                                src={formData.photoPreview}
                                alt="Photo élève"
                                className="w-32 h-32 rounded-lg object-cover border-2 border-neutral-200"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-lg bg-neutral-100 flex items-center 
                                            justify-center border-2 border-neutral-200">
                                <User size={48} className="text-neutral-400" />
                            </div>
                        )}
                    </div>

                    {/* Identity Info */}
                    <div className="flex-1 space-y-3">
                        <div>
                            <h3 className="text-2xl font-bold text-neutral-900">
                                {formData.nom} {formData.postNom}{' '}
                                {formData.prenom && formData.prenom}
                            </h3>
                            <p className="text-sm text-neutral-600">
                                {formData.sexe === 'M' ? 'Masculin' : 'Féminin'} •{' '}
                                {age !== null && `${age} ans`} •{' '}
                                {formData.dateNaissance &&
                                    new Date(formData.dateNaissance).toLocaleDateString('fr-FR')}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-neutral-500">Lieu de naissance:</span>
                                <p className="font-medium text-neutral-900">
                                    {formData.lieuNaissance}
                                </p>
                            </div>
                            <div>
                                <span className="text-neutral-500">Nationalité:</span>
                                <p className="font-medium text-neutral-900">
                                    {formData.nationalite}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic Info */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <GraduationCap size={20} className="text-primary" />
                    <h3 className="font-bold text-neutral-900">Informations académiques</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-neutral-500">Section:</span>
                        <p className="font-medium text-neutral-900">
                            {selectedSection?.name || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <span className="text-neutral-500">Classe:</span>
                        <p className="font-medium text-neutral-900">
                            {selectedClass?.name || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <span className="text-neutral-500">Statut:</span>
                        <p className="font-medium text-neutral-900">
                            {STATUT_LABELS[formData.statut || 'NOUVEAU']}
                        </p>
                    </div>
                    {formData.statut === 'TRANSFERE' && formData.ecoleOrigine && (
                        <div>
                            <span className="text-neutral-500">École d'origine:</span>
                            <p className="font-medium text-neutral-900">{formData.ecoleOrigine}</p>
                        </div>
                    )}
                    {formData.resultatTenasosp && (
                        <div>
                            <span className="text-neutral-500">Résultat TENASOSP:</span>
                            <p className="font-medium text-neutral-900">
                                {formData.resultatTenasosp}%
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Contacts */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Phone size={20} className="text-primary" />
                    <h3 className="font-bold text-neutral-900">Contacts</h3>
                </div>

                <div className="space-y-4">
                    {/* Principal Contact Highlight */}
                    {principalContact && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 size={16} className="text-green-600" />
                                <span className="text-sm font-semibold text-green-900">
                                    Tuteur principal ({principalContact.type})
                                </span>
                            </div>
                            <p className="text-sm text-neutral-900">
                                {principalContact.nom || 'Non renseigné'}
                            </p>
                            <p className="text-sm font-mono text-neutral-700">
                                {principalContact.tel}
                            </p>
                            <p className="text-xs text-green-700 mt-2">
                                Ce contact recevra les SMS de l'école
                            </p>
                        </div>
                    )}

                    {/* All Contacts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {/* Père */}
                        <div>
                            <span className="text-neutral-500 font-medium">Père:</span>
                            <p className="text-neutral-900">{formData.nomPere || '—'}</p>
                            <p className="text-neutral-600 font-mono text-xs">
                                {formData.telPere || '—'}
                            </p>
                        </div>

                        {/* Mère */}
                        <div>
                            <span className="text-neutral-500 font-medium">Mère:</span>
                            <p className="text-neutral-900">{formData.nomMere || '—'}</p>
                            <p className="text-neutral-600 font-mono text-xs">
                                {formData.telMere || '—'}
                            </p>
                        </div>

                        {/* Tuteur */}
                        <div>
                            <span className="text-neutral-500 font-medium">Tuteur:</span>
                            <p className="text-neutral-900">{formData.nomTuteur || '—'}</p>
                            <p className="text-neutral-600 font-mono text-xs">
                                {formData.telTuteur || '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                    ℹ️ Un matricule unique sera généré automatiquement lors de l'enregistrement.
                    Un SMS de bienvenue sera envoyé au tuteur principal.
                </p>
            </div>
        </div>
    );
}
