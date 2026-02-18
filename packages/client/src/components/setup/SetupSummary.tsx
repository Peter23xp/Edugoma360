import { CheckCircle2, Edit2 } from 'lucide-react';
import { useSetupWizard } from '../../hooks/useSetupWizard';

export default function SetupSummary() {
    const { formData, goToStep } = useSetupWizard();

    const schoolTypes: Record<string, string> = {
        OFFICIELLE: 'École Officielle',
        CONVENTIONNEE: 'École Conventionnée',
        PRIVEE: 'École Privée Agréée',
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full 
                               bg-green-100 mb-4">
                    <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Configuration terminée
                </h2>
                <p className="text-neutral-600">
                    Vérifiez les informations avant de finaliser la configuration
                </p>
            </div>

            {/* Summary Sections */}
            <div className="space-y-4">
                {/* Identité */}
                <SummarySection
                    title="IDENTITÉ"
                    onEdit={() => goToStep(1)}
                    icon={formData.identity?.logoPreview ? (
                        <img
                            src={formData.identity.logoPreview}
                            alt="Logo"
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                    ) : null}
                >
                    <SummaryItem label="Nom" value={formData.identity?.name} />
                    <SummaryItem
                        label="Type"
                        value={
                            formData.identity?.type
                                ? schoolTypes[formData.identity.type]
                                : undefined
                        }
                    />
                    {formData.identity?.convention && (
                        <SummaryItem label="Convention" value={formData.identity.convention} />
                    )}
                    {formData.identity?.agrement && (
                        <SummaryItem label="Agrément" value={formData.identity.agrement} />
                    )}
                </SummarySection>

                {/* Localisation */}
                <SummarySection title="LOCALISATION" onEdit={() => goToStep(2)}>
                    <SummaryItem
                        label="Adresse"
                        value={`${formData.location?.province}, ${formData.location?.ville}`}
                    />
                    {formData.location?.commune && (
                        <SummaryItem label="Commune" value={formData.location.commune} />
                    )}
                    <SummaryItem label="Adresse physique" value={formData.location?.adresse} />
                    {formData.location?.latitude && formData.location?.longitude && (
                        <SummaryItem
                            label="Coordonnées GPS"
                            value={`${formData.location.latitude}, ${formData.location.longitude}`}
                        />
                    )}
                </SummarySection>

                {/* Contact */}
                <SummarySection title="CONTACT" onEdit={() => goToStep(3)}>
                    <SummaryItem label="Téléphone" value={formData.contact?.telephone} />
                    {formData.contact?.email && (
                        <SummaryItem label="Email" value={formData.contact.email} />
                    )}
                    {formData.contact?.website && (
                        <SummaryItem label="Site web" value={formData.contact.website} />
                    )}
                    {formData.contact?.facebook && (
                        <SummaryItem label="Facebook" value={formData.contact.facebook} />
                    )}
                </SummarySection>

                {/* Année Scolaire */}
                <SummarySection title="ANNÉE SCOLAIRE" onEdit={() => goToStep(4)}>
                    <SummaryItem
                        label="Année"
                        value={`${formData.academicYear?.label} (${
                            formData.academicYear?.startDate
                                ? new Date(formData.academicYear.startDate).toLocaleDateString(
                                      'fr-FR'
                                  )
                                : ''
                        } → ${
                            formData.academicYear?.endDate
                                ? new Date(formData.academicYear.endDate).toLocaleDateString(
                                      'fr-FR'
                                  )
                                : ''
                        })`}
                    />
                    <SummaryItem
                        label="Trimestres"
                        value={`${formData.academicYear?.terms?.length || 0} trimestres configurés`}
                    />
                    {formData.academicYear?.holidays && (
                        <SummaryItem
                            label="Jours fériés"
                            value={`${formData.academicYear.holidays.length} jours fériés`}
                        />
                    )}
                </SummarySection>

                {/* Classes */}
                <SummarySection title="CLASSES" onEdit={() => goToStep(5)}>
                    <SummaryItem
                        label="Total"
                        value={`${formData.classes?.length || 0} classes créées`}
                    />
                    {formData.classes && formData.classes.length > 0 && (
                        <div className="mt-2">
                            <p className="text-sm text-neutral-600 mb-1">Classes :</p>
                            <div className="flex flex-wrap gap-2">
                                {formData.classes.slice(0, 10).map((cls, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center px-2.5 py-1 rounded-full 
                                                   text-xs font-medium bg-primary/10 text-primary"
                                    >
                                        {cls.name}
                                    </span>
                                ))}
                                {formData.classes.length > 10 && (
                                    <span className="text-xs text-neutral-500">
                                        +{formData.classes.length - 10} autres
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    {formData.classes && (
                        <SummaryItem
                            label="Sections"
                            value={[
                                ...new Set(
                                    formData.classes.map((c) => c.sectionCode || c.sectionName)
                                ),
                            ].join(', ')}
                        />
                    )}
                </SummarySection>

                {/* Administrateur */}
                <SummarySection title="ADMINISTRATEUR" onEdit={() => goToStep(6)}>
                    <SummaryItem
                        label="Nom complet"
                        value={`${formData.admin?.nom || ''} ${formData.admin?.postNom || ''} ${
                            formData.admin?.prenom || ''
                        }`.trim()}
                    />
                    <SummaryItem label="Rôle" value="Préfet (Directeur Académique)" />
                    <SummaryItem label="Téléphone" value={formData.admin?.phone} />
                    {formData.admin?.email && (
                        <SummaryItem label="Email" value={formData.admin.email} />
                    )}
                </SummarySection>
            </div>
        </div>
    );
}

function SummarySection({
    title,
    onEdit,
    icon,
    children,
}: {
    title: string;
    onEdit: () => void;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
                </div>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                               text-neutral-600 hover:text-primary hover:bg-primary/5 
                               rounded-lg transition-colors"
                >
                    <Edit2 size={12} />
                    Modifier
                </button>
            </div>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
    if (!value) return null;

    return (
        <div className="flex items-start gap-2">
            <span className="text-sm text-neutral-500 min-w-[120px]">{label} :</span>
            <span className="text-sm text-neutral-900 font-medium">{value}</span>
        </div>
    );
}
