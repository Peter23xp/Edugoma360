import {
    Edit, Phone, Mail, Globe, MapPin, Calendar, Award,
    BookOpen, Languages, GraduationCap, Building2, Hash,
    CheckCircle2, Quote
} from 'lucide-react';
import { SchoolData } from '../../hooks/useSchoolSettings';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SchoolInfoDisplayProps {
    school: SchoolData;
    onEdit: () => void;
}

export default function SchoolInfoDisplay({ school, onEdit }: SchoolInfoDisplayProps) {
    // Fallback: map old schema fields to new ones for backward compatibility
    const s = {
        ...school,
        nomOfficiel: school.nomOfficiel || (school as any).name || '',
        nomCourt:    school.nomCourt    || (school as any).name || '',
        telephonePrincipal: school.telephonePrincipal || (school as any).telephone || '',
        email: school.email || '',
        avenue: school.avenue || (school as any).adresse || '',
        commune: school.commune || '',
        type: ((school.type as string) === 'PRIVE' ? 'PRIVEE' : school.type) as any,
    };
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
        } catch {
            return dateString;
        }
    };

    const getTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'OFFICIELLE': 'Publique / Officielle',
            'PRIVEE': 'Privée',
            'CONVENTIONNEE': 'Conventionnée',
        };
        return types[type] || type;
    };

    const getLangueLabel = (langue: string) => {
        const langues: Record<string, string> = {
            'FRANCAIS': 'Français',
            'ANGLAIS': 'Anglais',
            'BILINGUE': 'Bilingue',
        };
        return langues[langue] || langue;
    };

    const getSystemeLabel = (systeme: string) => {
        const systemes: Record<string, string> = {
            'NOTE_20': 'Notes sur 20',
            'NOTE_10': 'Notes sur 10',
            'MIXTE': 'Mixte (selon matière)',
        };
        return systemes[systeme] || systeme;
    };

    const getPeriodesLabel = (periodes: string) => {
        const periodesMap: Record<string, string> = {
            'TRIMESTRES': '3 Trimestres',
            'SEMESTRES': '2 Semestres',
        };
        return periodesMap[periodes] || periodes;
    };

    // ── Sub-components ──────────────────────────────────────────────
    const Section = ({
        title, icon: Icon, color = 'text-[#1B5E20]', bg = 'bg-[#1B5E20]/5', children,
    }: {
        title: string; icon: any; color?: string; bg?: string; children: React.ReactNode;
    }) => (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className={`flex items-center gap-3 px-6 py-4 border-b border-neutral-100 ${bg}`}>
                <Icon className={`h-5 w-5 ${color} flex-shrink-0`} />
                <h3 className={`text-sm font-bold tracking-wide uppercase ${color}`}>{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );

    const Field = ({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: any }) => {
        if (!value) return null;
        return (
            <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</p>
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-neutral-400 flex-shrink-0" />}
                    <p className="text-sm text-neutral-800 font-medium">{value}</p>
                </div>
            </div>
        );
    };

    const Badge = ({ label }: { label: string }) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F5E9] text-[#1B5E20] text-xs font-semibold rounded-full border border-[#1B5E20]/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {label}
        </span>
    );

    // ── Render ──────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* ── HERO BANNER ─────────────────────────────────────── */}
            <div className="relative bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#0D47A1] rounded-2xl overflow-hidden shadow-xl">
                {/* Pattern décoratif */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative z-10 p-8 flex flex-col sm:flex-row items-center gap-6">
                    {/* Logo / Initiales */}
                    <div className="flex-shrink-0">
                        {s.logoUrl ? (
                            <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center p-2 border-2 border-white/30">
                                <img
                                    src={s.logoUrl}
                                    alt={s.nomCourt}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center">
                                <span className="text-3xl font-black text-white">
                                    {s.nomCourt?.slice(0, 2).toUpperCase() || 'EC'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Infos principales */}
                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
                            Établissement configuré
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-1">
                            {s.nomOfficiel}
                        </h2>
                        {s.nomCourt && s.nomCourt !== s.nomOfficiel && (
                            <p className="text-white/80 text-sm font-medium mb-3">
                                « {s.nomCourt} »
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            {s.code && <Badge label={`Code: ${s.code}`} />}
                            <Badge label={getTypeLabel(s.type)} />
                            {(s.ville || s.province) && (
                                <Badge label={[s.ville, s.province].filter(Boolean).join(', ')} />
                            )}
                        </div>
                    </div>

                    {/* Bouton Modifier */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1B5E20] hover:bg-white/90 rounded-xl text-sm font-bold shadow-lg transition-all duration-200 active:scale-95"
                        >
                            <Edit size={16} />
                            Modifier
                        </button>
                    </div>
                </div>

                {/* Devise si elle existe */}
                {s.devise && (
                    <div className="relative z-10 px-8 pb-6">
                        <div className="flex items-center gap-2 text-white/70">
                            <Quote className="h-4 w-4 flex-shrink-0" />
                            <p className="text-sm italic font-medium">{s.devise}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── LOCALISATION ────────────────────────────────────── */}
            <Section title="Localisation" icon={MapPin} color="text-[#0D47A1]" bg="bg-[#0D47A1]/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Field label="Province" value={s.province} />
                    <Field label="Ville" value={s.ville} />
                    <Field label="Commune / Quartier" value={s.commune} />
                    <Field label="Avenue" value={s.avenue} />
                    {s.numero && <Field label="Numéro" value={s.numero} />}
                    {s.reference && <Field label="Point de référence" value={s.reference} />}
                </div>
            </Section>

            {/* ── CONTACT ─────────────────────────────────────────── */}
            <Section title="Coordonnées de contact" icon={Phone} color="text-[#1B5E20]" bg="bg-[#1B5E20]/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {s.telephonePrincipal && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                            <div className="w-10 h-10 rounded-full bg-[#1B5E20]/10 flex items-center justify-center flex-shrink-0">
                                <Phone className="h-5 w-5 text-[#1B5E20]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Téléphone principal</p>
                                <p className="text-sm font-semibold text-neutral-800">{s.telephonePrincipal}</p>
                            </div>
                        </div>
                    )}

                    {s.telephoneSecondaire && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                            <div className="w-10 h-10 rounded-full bg-[#1B5E20]/10 flex items-center justify-center flex-shrink-0">
                                <Phone className="h-5 w-5 text-[#1B5E20]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Téléphone secondaire</p>
                                <p className="text-sm font-semibold text-neutral-800">{s.telephoneSecondaire}</p>
                            </div>
                        </div>
                    )}

                    {s.email && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="w-10 h-10 rounded-full bg-[#0D47A1]/10 flex items-center justify-center flex-shrink-0">
                                <Mail className="h-5 w-5 text-[#0D47A1]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email officiel</p>
                                <p className="text-sm font-semibold text-neutral-800 break-all">{s.email}</p>
                            </div>
                        </div>
                    )}

                    {s.siteWeb && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="w-10 h-10 rounded-full bg-[#0D47A1]/10 flex items-center justify-center flex-shrink-0">
                                <Globe className="h-5 w-5 text-[#0D47A1]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Site web</p>
                                <a
                                    href={s.siteWeb}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-semibold text-[#0D47A1] hover:underline break-all"
                                >
                                    {s.siteWeb}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            {/* ── INFORMATIONS OFFICIELLES ─────────────────────────── */}
            <Section title="Informations officielles" icon={Award} color="text-[#F57F17]" bg="bg-[#F57F17]/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="col-span-full sm:col-span-1">
                        <Field label="Type d'école" value={getTypeLabel(s.type)} icon={Building2} />
                    </div>
                    <div>
                        <Field label="Numéro d'agrément" value={s.numeroAgrement} icon={Hash} />
                    </div>
                    <div>
                        <Field label="Date d'agrément" value={s.dateAgrement ? formatDate(s.dateAgrement) : null} icon={Calendar} />
                    </div>
                    {s.devise && (
                        <div className="col-span-full sm:col-span-1">
                            <Field label="Devise" value={s.devise} icon={Quote} />
                        </div>
                    )}
                </div>
            </Section>

            {/* ── PARAMÈTRES ACADÉMIQUES ───────────────────────────── */}
            {(s.langueEnseignement || s.systemeEvaluation || s.nombrePeriodes) && (
                <Section title="Paramètres académiques" icon={GraduationCap} color="text-[#6A1B9A]" bg="bg-purple-50">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {s.langueEnseignement && (
                            <div className="flex flex-col gap-2 p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
                                <Languages className="h-8 w-8 text-purple-600 mx-auto" />
                                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Langue d'enseignement</p>
                                <p className="text-sm font-bold text-purple-900">{getLangueLabel(s.langueEnseignement)}</p>
                            </div>
                        )}
                        {s.systemeEvaluation && (
                            <div className="flex flex-col gap-2 p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
                                <BookOpen className="h-8 w-8 text-purple-600 mx-auto" />
                                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Système d'évaluation</p>
                                <p className="text-sm font-bold text-purple-900">{getSystemeLabel(s.systemeEvaluation)}</p>
                            </div>
                        )}
                        {s.nombrePeriodes && (
                            <div className="flex flex-col gap-2 p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
                                <Calendar className="h-8 w-8 text-purple-600 mx-auto" />
                                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Organisation</p>
                                <p className="text-sm font-bold text-purple-900">{getPeriodesLabel(s.nombrePeriodes)}</p>
                            </div>
                        )}
                    </div>
                </Section>
            )}

            {/* ── BOUTON MODIFIER EN BAS ────────────────────────────── */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl text-sm font-bold shadow-md transition-all duration-200 active:scale-95"
                >
                    <Edit size={16} />
                    Modifier les informations
                </button>
            </div>
        </div>
    );
}
