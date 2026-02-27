import React from 'react';
import { User, Phone, Mail, MapPin, Map, GraduationCap, Briefcase, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface InfoSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, icon, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-green-50 text-green-700 rounded-lg">{icon}</div>
            <h3 className="font-bold text-gray-900 uppercase tracking-tight text-sm">{title}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mt-2">
            {children}
        </div>
    </div>
);

const InfoItem: React.FC<{ label: string; value: string | number | undefined; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex flex-col gap-1">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2 group cursor-default">
            {icon && <div className="text-gray-400 group-hover:text-green-600 transition-colors">{icon}</div>}
            <span className="text-sm font-bold text-gray-800 uppercase group-hover:text-green-900 transition-colors">
                {value || '—'}
            </span>
        </div>
    </div>
);

export const TeacherInfoTab: React.FC<{ teacher: any }> = ({ teacher }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoSection title="Identité Civile" icon={<User size={20} />}>
                <InfoItem label="Nom de famille" value={teacher.nom} />
                <InfoItem label="Post-nom" value={teacher.postNom} />
                <InfoItem label="Prénom" value={teacher.prenom} />
                <InfoItem label="Sexe" value={teacher.sexe === 'M' ? 'Masculin' : 'Féminin'} />
                <InfoItem label="Date naissance" value={teacher.dateNaissance ? format(new Date(teacher.dateNaissance), 'dd/MM/yyyy') : undefined} />
                <InfoItem label="Lieu naissance" value={teacher.lieuNaissance} />
                <InfoItem label="Nationalité" value={teacher.nationalite} />
            </InfoSection>

            <InfoSection title="Contact" icon={<Phone size={20} />}>
                <InfoItem label="Téléphone" value={teacher.telephone} icon={<Phone size={16} />} />
                <InfoItem label="Email" value={teacher.email} icon={<Mail size={16} />} />
                <InfoItem label="Adresse physique" value={teacher.adresse} icon={<MapPin size={16} />} />
                <InfoItem label="Ville / Commune" value={teacher.ville || 'Goma'} icon={<Map size={16} />} />
            </InfoSection>

            <InfoSection title="Qualifications" icon={<GraduationCap size={20} />}>
                <InfoItem label="Niveau d'études" value={teacher.niveauEtudes} />
                <InfoItem label="Domaine formation" value={teacher.domaineFormation} />
                <InfoItem label="Université / Institut" value={teacher.universite} />
                <InfoItem label="Année d'obtention" value={teacher.anneeObtention} />
                <div className="md:col-span-2">
                    <InfoItem label="Spécialisations" value={teacher.specialisations} />
                </div>
                <div className="md:col-span-2 mt-4">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Certificats & Formations</label>
                    <div className="space-y-3">
                        {teacher.certificats?.length > 0 ? teacher.certificats.map((cert: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md hover:border-green-200 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg group-hover:text-green-700 transition-colors shadow-sm"><FileText size={16} /></div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-800 uppercase">{cert.nom}</div>
                                        <div className="text-xs text-gray-500 font-medium lowercase tracking-wide">{cert.organisme} • {cert.annee}</div>
                                    </div>
                                </div>
                                {cert.fichierUrl && (
                                    <button className="text-xs font-bold text-green-700 hover:underline px-3 py-1.5 bg-green-50 rounded-lg hover:bg-green-100">Voir PDF</button>
                                )}
                            </div>
                        )) : (
                            <div className="text-xs text-gray-400 font-medium italic">Aucun certificat renseigné</div>
                        )}
                    </div>
                </div>
            </InfoSection>

            <InfoSection title="Statut Professionnel" icon={<Briefcase size={20} />}>
                <InfoItem label="Matricule" value={teacher.matricule} />
                <InfoItem label="Date d'embauche" value={teacher.dateEmbauche ? format(new Date(teacher.dateEmbauche), 'dd/MM/yyyy') : undefined} />
                <InfoItem label="Type de contrat" value={teacher.typeContrat} />
                <InfoItem label="Fonction actuelle" value={teacher.fonction} />
                <InfoItem label="Matricule National" value={teacher.matriculeMepst} />
                <InfoItem label="Compte Bancaire" value={teacher.compteBancaire} />
                <InfoItem label="Statut compte" value={teacher.isActive ? 'ACTIF' : 'INACTIF'} />
                <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Droit de Congés</span>
                        <span className="text-xl font-black text-blue-900">{teacher.congeGlobal || 20} Jours</span>
                        <p className="text-[9px] font-bold text-blue-400 uppercase mt-1">Standard RDC</p>
                    </div>
                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">Jour Consommés</span>
                        <span className="text-xl font-black text-amber-900">{teacher.congePris || 0} Jours</span>
                        <p className="text-[9px] font-bold text-amber-400 uppercase mt-1">Solde: {(teacher.congeGlobal || 20) - (teacher.congePris || 0)}j</p>
                    </div>
                </div>
            </InfoSection>
        </div>
    );
};
