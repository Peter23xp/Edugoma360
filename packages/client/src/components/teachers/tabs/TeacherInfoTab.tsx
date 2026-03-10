import React from 'react';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';

interface TeacherInfoTabProps {
    teacher: any;
}

export const TeacherInfoTab: React.FC<TeacherInfoTabProps> = ({ teacher }) => {
    return (
        <div className="space-y-6">
            {/* —— Identité Civile —— */}
            <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Identité Civile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoField label="Nom de famille" value={teacher.nom} />
                    <InfoField label="Post-nom" value={teacher.postNom} />
                    <InfoField label="Prénom" value={teacher.prenom} />
                    <InfoField label="Sexe" value={teacher.sexe === 'M' ? 'Masculin' : 'Féminin'} />
                    <InfoField
                        label="Date de naissance"
                        value={teacher.dateNaissance ? format(new Date(teacher.dateNaissance), 'dd/MM/yyyy') : ''}
                    />
                    <InfoField label="Lieu de naissance" value={teacher.lieuNaissance} />
                    <InfoField label="Nationalité" value={teacher.nationalite} />
                </div>
            </div>

            <hr className="border-neutral-200" />

            {/* —— Contact —— */}
            <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Contact & Adresse</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoField label="Téléphone" value={teacher.telephone} />
                    <InfoField label="Email" value={teacher.email} />
                    <InfoField label="Adresse physique" value={teacher.adresse} />
                    <InfoField label="Ville / Commune" value={teacher.ville || 'Goma'} />
                </div>
            </div>

            <hr className="border-neutral-200" />

            {/* —— Qualifications —— */}
            <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Formation & Qualifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <InfoField label="Niveau d'études" value={teacher.niveauEtudes} />
                    <InfoField label="Domaine de formation" value={teacher.domaineFormation} />
                    <InfoField label="Université / Institut" value={teacher.universite} />
                    <InfoField label="Année d'obtention" value={teacher.anneeObtention?.toString()} />
                </div>
                {teacher.specialisations && (
                    <div className="mb-4">
                        <InfoField label="Spécialisations" value={teacher.specialisations} />
                    </div>
                )}

                {teacher.certificats && teacher.certificats.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs font-medium text-neutral-500 mb-2">Certificats & Formations</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {teacher.certificats.map((cert: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">{cert.nom}</p>
                                            <p className="text-xs text-neutral-500">{cert.organisme} • {cert.annee}</p>
                                        </div>
                                    </div>
                                    {cert.fichierUrl && (
                                        <a href={cert.fichierUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">
                                            Voir PDF
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <hr className="border-neutral-200" />

            {/* —— Statut Professionnel —— */}
            <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Statut Professionnel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoField label="Matricule Interne" value={teacher.matricule} />
                    <InfoField
                        label="Date d'embauche"
                        value={teacher.dateEmbauche ? format(new Date(teacher.dateEmbauche), 'dd/MM/yyyy') : ''}
                    />
                    <InfoField label="Type de contrat" value={teacher.typeContrat} />
                    <InfoField label="Fonction actuelle" value={teacher.fonction} />
                    <InfoField label="Matricule SECOPE" value={teacher.matriculeMepst} />
                    <InfoField label="Compte Bancaire" value={teacher.compteBancaire} />
                </div>
            </div>
        </div>
    );
};

function InfoField({ label, value }: { label: string; value: string | undefined }) {
    return (
        <div>
            <p className="text-xs font-medium text-neutral-500 mb-1">{label}</p>
            <p className="text-sm text-neutral-900">{value || '—'}</p>
        </div>
    );
}
