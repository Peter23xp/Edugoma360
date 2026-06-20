import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    BarChart3,
    BookOpenCheck,
    CalendarCheck,
    Check,
    CheckCircle,
    ClipboardList,
    FileText,
    GraduationCap,
    Loader2,
    MapPin,
    MessageSquare,
    Printer,
    ShieldCheck,
    Smartphone,
    Users,
    Wallet,
    WifiOff,
} from 'lucide-react';
import logo from '../../assets/logo.svg';

interface Plan {
    id: string;
    name: string;
    slug: string;
    priceUSD: number;
    priceCDF: number;
    maxStudents: number;
    maxStudentsLabel: string;
    maxTeachers: number;
    maxSmsPerMonth: number;
    features: string[];
}

// ── Photos authentiques (écoles africaines). Lazy + repli vert si hors-ligne ──
const IMG = {
    heroStudent:
        'https://images.unsplash.com/photo-1536337005238-94b997371b40?auto=format&fit=crop&w=900&q=70',
    classHands:
        'https://images.unsplash.com/photo-1627423896085-e3e694d88e40?auto=format&fit=crop&w=1500&q=70',
    girlReading:
        'https://images.unsplash.com/photo-1632215861513-130b66fe97f4?auto=format&fit=crop&w=900&q=70',
    boyWriting:
        'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=900&q=70',
    windowKids:
        'https://images.unsplash.com/photo-1521493959102-bdd6677fdd81?auto=format&fit=crop&w=1500&q=70',
};

/**
 * Image robuste : conteneur toujours peint en vert institutionnel, la photo se
 * charge par-dessus en lazy. Si le réseau coupe (contexte terrain), le repli
 * vert reste propre — aucune image cassée.
 */
function Photo({
    src,
    alt,
    className = '',
    imgClassName = '',
}: {
    src: string;
    alt: string;
    className?: string;
    imgClassName?: string;
}) {
    const [failed, setFailed] = useState(false);
    return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-primary to-[#0D47A1] ${className}`}>
            {!failed && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailed(true)}
                    className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
                />
            )}
            {failed && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <GraduationCap className="h-10 w-10 text-white/40" aria-hidden />
                </div>
            )}
        </div>
    );
}

const HIGHLIGHTS = [
    { value: '6 rôles', label: 'Préfet, économe, secrétaire, enseignant, parent, admin' },
    { value: 'FC + USD', label: 'Finances et reçus en bi-devise' },
    { value: '2 langues', label: 'SMS parents en français et swahili' },
    { value: 'EPSP-RDC', label: 'Bulletins, palmarès et PV officiels' },
];

const ROLES = [
    {
        icon: ShieldCheck,
        name: 'Préfet / Direction',
        text: 'Pilotage global : effectifs, présences, résultats et finances réunis dans un seul tableau de bord.',
    },
    {
        icon: Wallet,
        name: 'Économe',
        text: 'Encaissements FC/USD, dettes, caisse journalière et rapports financiers fiables.',
    },
    {
        icon: ClipboardList,
        name: 'Secrétaire',
        text: 'Inscriptions, matricules MEPST, dossiers élèves et import en masse.',
    },
    {
        icon: GraduationCap,
        name: 'Enseignant',
        text: 'Saisie des notes et appel des présences, même quand le réseau coupe.',
    },
    {
        icon: Users,
        name: 'Parent',
        text: 'SMS et portail : résultats, présences et paiements de leur enfant.',
    },
];

const WORKFLOW = [
    {
        icon: BookOpenCheck,
        title: 'Dossiers élèves propres',
        text: 'Matricules, classes, sections et historique scolaire restent dans une seule base.',
    },
    {
        icon: CalendarCheck,
        title: 'Présences sans connexion',
        text: 'L’appel continue sur terrain, puis les données se synchronisent au retour du réseau.',
    },
    {
        icon: FileText,
        title: 'Bulletins EPSP rapides',
        text: 'Notes, moyennes, palmarès et PV sortent dans un format prêt à imprimer.',
    },
    {
        icon: MessageSquare,
        title: 'Parents informés',
        text: 'SMS en français et swahili pour retards, résultats, convocations et paiements.',
    },
];

const FAQ = [
    {
        q: 'EduGoma 360 fonctionne-t-il sans Internet ?',
        a: 'Oui. Les présences et plusieurs saisies restent disponibles hors-ligne et se synchronisent automatiquement dès que le réseau revient.',
    },
    {
        q: 'Les bulletins sont-ils conformes à l’EPSP ?',
        a: 'Oui. Bulletins, palmarès et PV de délibération suivent le format officiel EPSP-RDC, prêts à imprimer.',
    },
    {
        q: 'Peut-on travailler en Francs Congolais ?',
        a: 'Oui. La facturation et les paiements gèrent le FC et l’USD, avec reçus, suivi des dettes et rapports.',
    },
    {
        q: 'Les SMS aux parents sont-ils en swahili ?',
        a: 'Oui. Les messages sont disponibles en français et en swahili, pour les retards, résultats et paiements.',
    },
    {
        q: 'Mes données sont-elles protégées ?',
        a: 'Chaque école dispose d’un espace isolé et l’accès est contrôlé par rôle : préfet, économe, secrétaire, enseignant et parent.',
    },
];

const PLAN_STYLES: Record<string, string> = {
    trial: 'border-neutral-200',
    bronze: 'border-accent/30',
    silver: 'border-primary bg-primary-lighter/40',
    gold: 'border-accent bg-accent-light/60',
};

function Header() {
    return (
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link to="/" className="flex items-center gap-3">
                    <img src={logo} alt="EduGoma 360" className="h-9 w-9" />
                    <div>
                        <p className="text-sm font-bold leading-tight text-primary">EduGoma 360</p>
                        <p className="text-xs text-neutral-700">Gestion scolaire RDC</p>
                    </div>
                </Link>
                <nav className="flex items-center gap-1 sm:gap-2">
                    <a href="#pour-qui" className="hidden px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary md:inline-flex">
                        Pour qui
                    </a>
                    <a href="#fonctionnalites" className="hidden px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary md:inline-flex">
                        Fonctionnalités
                    </a>
                    <a href="#tarifs" className="hidden px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary md:inline-flex">
                        Tarifs
                    </a>
                    <Link to="/login" className="px-3 py-2 text-sm font-semibold text-primary hover:text-primary-hover">
                        Se connecter
                    </Link>
                    <Link to="/register" className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                        Créer une école
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </nav>
            </div>
        </header>
    );
}

/* Maquette : tableau de bord direction (Préfet) */
function DirectionMockup() {
    return (
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                <div>
                    <p className="text-xs font-semibold text-primary">Institut Mungano</p>
                    <p className="text-xs text-neutral-700">Tableau de bord, aujourd’hui</p>
                </div>
                <span className="rounded bg-primary-lighter px-2 py-1 text-xs font-medium text-primary">En ligne</span>
            </div>
            <div className="grid grid-cols-3 border-b border-neutral-200">
                {[
                    ['342', 'Élèves'],
                    ['94%', 'Présence'],
                    ['2.4M', 'CDF encaissés'],
                ].map(([value, label]) => (
                    <div key={label} className="border-r border-neutral-200 px-4 py-4 last:border-r-0">
                        <p className="text-2xl font-bold text-neutral-900">{value}</p>
                        <p className="text-xs text-neutral-700">{label}</p>
                    </div>
                ))}
            </div>
            <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-neutral-900">Bulletins à finaliser</p>
                    <span className="text-xs font-medium text-accent">Trimestre 2</span>
                </div>
                <div className="space-y-2">
                    {[
                        ['4e Sciences A', '31/34 notes saisies'],
                        ['3e Pédagogie', '28/28 notes saisies'],
                        ['2e Commerciale', '18/25 notes saisies'],
                    ].map(([classe, status]) => (
                        <div key={classe} className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2">
                            <span className="text-sm font-medium text-neutral-900">{classe}</span>
                            <span className="text-xs text-neutral-700">{status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* Maquette : bulletin EPSP */
function BulletinMockup() {
    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-3">
                <div>
                    <p className="text-xs font-semibold text-neutral-900">Bulletin — 4e Sciences A</p>
                    <p className="text-xs text-neutral-700">Élève : KASEREKA M. · Trimestre 2</p>
                </div>
                <span className="rounded bg-primary-lighter px-2 py-1 text-[10px] font-semibold text-primary">EPSP</span>
            </div>
            <div className="space-y-1.5">
                {[
                    ['Mathématiques', '16/20'],
                    ['Français', '14/20'],
                    ['Biologie', '17/20'],
                    ['Histoire', '13/20'],
                ].map(([m, n]) => (
                    <div key={m} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-700">{m}</span>
                        <span className="font-semibold text-neutral-900">{n}</span>
                    </div>
                ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-md bg-primary-lighter px-3 py-2">
                <span className="text-sm font-semibold text-primary">Moyenne générale</span>
                <span className="text-sm font-bold text-primary">15.0 / 20</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-neutral-700">Place : 3e / 34</span>
                <span className="font-semibold text-accent">Admis · Distinction</span>
            </div>
        </div>
    );
}

/* Maquette : finances FC/USD */
function FinanceMockup() {
    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-900">Caisse du jour</p>
                <div className="flex gap-1">
                    <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">CDF</span>
                    <span className="rounded border border-neutral-300 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">USD</span>
                </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">2 410 000 <span className="text-sm font-medium text-neutral-700">CDF</span></p>
            <div className="mt-3 space-y-2">
                {[
                    ['Frais scolaires', '1 850 000', 'w-[78%]'],
                    ['Frais d’examen', '410 000', 'w-[34%]'],
                    ['Uniformes', '150 000', 'w-[18%]'],
                ].map(([label, amount, width]) => (
                    <div key={label}>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-700">{label}</span>
                            <span className="font-semibold text-neutral-900">{amount}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-neutral-100">
                            <div className={`h-1.5 rounded-full bg-primary ${width}`} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-md border border-accent/30 bg-accent-light px-3 py-2 text-xs">
                <span className="font-medium text-accent">7 élèves en dette</span>
                <span className="font-semibold text-accent">Relancer par SMS</span>
            </div>
        </div>
    );
}

/* Maquette : SMS parents (téléphone) */
function SmsMockup() {
    return (
        <div className="mx-auto w-full max-w-[260px] rounded-[1.75rem] border-4 border-neutral-900 bg-neutral-900 p-2 shadow-lg">
            <div className="rounded-[1.35rem] bg-[#F7FAF7] p-3">
                <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    SMS — Parent
                </p>
                <div className="space-y-2">
                    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-xs text-white">
                        Habari! Mwana wako KASEREKA amepata 15/20 muhula huu. Hongera!
                    </div>
                    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-info px-3 py-2 text-xs text-white">
                        Rappel : solde frais scolaires de 25 000 CDF à régulariser avant le 30.
                    </div>
                    <div className="mr-auto max-w-[85%] rounded-2xl rounded-tl-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-800">
                        Asante sana, nitalipa kesho.
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5">
                    <span className="text-[10px] text-neutral-400">Message…</span>
                    <MessageSquare className="ml-auto h-3.5 w-3.5 text-primary" />
                </div>
            </div>
        </div>
    );
}

function Hero() {
    return (
        <section className="border-b border-neutral-200 bg-[#F7FAF7]">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
                <div>
                    <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-white px-3 py-2 text-sm font-medium text-primary">
                        <MapPin className="h-4 w-4" />
                        Pensé pour les écoles secondaires de Goma & du Nord-Kivu
                    </div>
                    <h1 className="max-w-3xl text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl">
                        La gestion scolaire qui reste fiable même quand le réseau coupe.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 sm:text-lg">
                        EduGoma 360 réunit élèves, présences, notes, bulletins, finances et SMS parents dans un
                        seul outil, adapté au terrain congolais et au travail hors-ligne.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link to="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                            Créer l’espace de mon école
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a href="#fonctionnalites" className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100">
                            Voir les fonctionnalités
                        </a>
                    </div>
                    <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 text-sm text-neutral-700 sm:grid-cols-3">
                        {['Mode hors-ligne', 'Bulletins officiels', 'Finances CDF/USD'].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visuel : photo + carte flottante */}
                <div className="relative lg:pl-4">
                    <Photo
                        src={IMG.heroStudent}
                        alt="Élève souriant dans une salle de classe en RDC"
                        className="h-[300px] rounded-xl border border-neutral-200 shadow-sm sm:h-[380px]"
                    />
                    <div className="absolute -bottom-5 -left-3 hidden w-[210px] rounded-lg border border-neutral-200 bg-white p-3 shadow-md sm:block">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-lighter">
                                <CalendarCheck className="h-4 w-4 text-primary" />
                            </span>
                            <div>
                                <p className="text-xs font-semibold text-neutral-900">Présence 4e Sci. A</p>
                                <p className="text-[11px] text-neutral-700">32 / 34 présents</p>
                            </div>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-neutral-100">
                            <div className="h-1.5 w-[94%] rounded-full bg-primary" />
                        </div>
                    </div>
                    <div className="absolute -top-3 right-2 hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-md sm:flex">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Synchronisé
                    </div>
                </div>
            </div>

            {/* Bande de points forts */}
            <div className="border-t border-neutral-200 bg-white">
                <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-neutral-200 px-4 sm:px-6 lg:grid-cols-4">
                    {HIGHLIGHTS.map((h) => (
                        <div key={h.value} className="px-4 py-5">
                            <p className="text-lg font-bold text-primary">{h.value}</p>
                            <p className="mt-1 text-xs leading-5 text-neutral-700">{h.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Roles() {
    return (
        <section id="pour-qui" className="bg-white py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mb-8 max-w-2xl">
                    <h2 className="text-2xl font-bold text-neutral-900">Un espace pour chaque métier de l’école.</h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-700">
                        Chacun voit ce qui le concerne, avec des droits adaptés à son rôle.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
                    <Photo
                        src={IMG.classHands}
                        alt="Élèves levant la main dans une classe au Nord-Kivu"
                        className="h-56 rounded-xl border border-neutral-200 lg:h-full"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                        {ROLES.map(({ icon: Icon, name, text }) => (
                            <div key={name} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-lighter">
                                        <Icon className="h-4 w-4 text-primary" />
                                    </span>
                                    <h3 className="text-sm font-semibold text-neutral-900">{name}</h3>
                                </div>
                                <p className="text-sm leading-6 text-neutral-700">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function Workflow() {
    return (
        <section className="bg-neutral-50 py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mb-8 max-w-2xl">
                    <h2 className="text-2xl font-bold text-neutral-900">Une même chaîne de travail, du secrétariat au parent.</h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-700">
                        L’interface suit les gestes réels d’une école : inscrire, contrôler, calculer, encaisser, informer.
                    </p>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                    {WORKFLOW.map(({ icon: Icon, title, text }) => (
                        <div key={title} className="rounded-lg border border-neutral-200 bg-white p-5">
                            <Icon className="mb-4 h-6 w-6 text-primary" />
                            <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-neutral-700">{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* Section générique d’approfondissement : texte + visuel alterné */
function FeatureRow({
    eyebrow,
    title,
    text,
    points,
    visual,
    reverse = false,
}: {
    eyebrow: string;
    title: string;
    text: string;
    points: string[];
    visual: React.ReactNode;
    reverse?: boolean;
}) {
    return (
        <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className={reverse ? 'lg:order-2' : ''}>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
                <h3 className="mt-2 text-xl font-bold text-neutral-900 sm:text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-700">{text}</p>
                <ul className="mt-4 space-y-2">
                    {points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm text-neutral-800">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            <span>{p}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={reverse ? 'lg:order-1' : ''}>{visual}</div>
        </div>
    );
}

function Features() {
    return (
        <section id="fonctionnalites" className="bg-white py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mb-12 max-w-2xl">
                    <h2 className="text-2xl font-bold text-neutral-900">Tout l’essentiel d’une direction, sans tableurs dispersés.</h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-700">
                        Des modules pensés pour les réalités de l’EPSP : conformes, bilingues et utilisables sur mobile.
                    </p>
                </div>

                <div className="space-y-16">
                    <FeatureRow
                        eyebrow="Pilotage · Préfet"
                        title="Une vue claire de l’école, chaque jour"
                        text="Le préfet retrouve effectifs, présences, résultats et finances au même endroit, avec les actions urgentes en tête."
                        points={[
                            'Indicateurs clés en temps réel',
                            'Suivi des bulletins à finaliser par classe',
                            'Alertes sur les retards et les dettes',
                        ]}
                        visual={<DirectionMockup />}
                    />

                    <FeatureRow
                        reverse
                        eyebrow="Évaluation"
                        title="Notes, bulletins & délibération conformes EPSP"
                        text="Saisie des notes par classe, calcul automatique des moyennes et des places, puis bulletins, palmarès et PV prêts à imprimer."
                        points={[
                            'Système sur 20, 10 ou mixte selon la matière',
                            'Palmarès et PV de délibération officiels',
                            'Export PDF prêt pour l’impression',
                        ]}
                        visual={
                            <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                                <BulletinMockup />
                                <Photo
                                    src={IMG.girlReading}
                                    alt="Élève lisant en classe"
                                    className="hidden h-full min-h-[180px] rounded-lg border border-neutral-200 sm:block"
                                />
                            </div>
                        }
                    />

                    <FeatureRow
                        eyebrow="Finances · Économe"
                        title="Encaissements et dettes en FC et USD"
                        text="L’économe enregistre les paiements en bi-devise, suit la caisse du jour et identifie les élèves en dette pour les relancer."
                        points={[
                            'Reçus et caisse journalière',
                            'Suivi des dettes par élève et par classe',
                            'Rapports financiers exportables',
                        ]}
                        visual={
                            <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                                <FinanceMockup />
                                <Photo
                                    src={IMG.boyWriting}
                                    alt="Élève écrivant dans son cahier"
                                    className="hidden h-full min-h-[180px] rounded-lg border border-neutral-200 sm:block"
                                />
                            </div>
                        }
                    />

                    <FeatureRow
                        reverse
                        eyebrow="Communication"
                        title="Des parents informés en français et swahili"
                        text="Envoyez résultats, retards, convocations et rappels de paiement par SMS, dans la langue comprise par les familles."
                        points={[
                            'SMS bilingues français / swahili',
                            'Modèles pour résultats, présences et paiements',
                            'Portail parent : notes, présences et soldes',
                        ]}
                        visual={<SmsMockup />}
                    />
                </div>
            </div>
        </section>
    );
}

function OfflineBand() {
    return (
        <section className="border-y border-primary/15 bg-primary text-white">
            <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10">
                    <WifiOff className="h-6 w-6 text-accent" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Le travail continue pendant les coupures.</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
                        Les présences et certaines saisies restent disponibles localement. EduGoma 360 synchronise dès que la connexion revient, sans refaire le travail.
                    </p>
                </div>
                <Link to="/register" className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover">
                    Démarrer
                </Link>
            </div>
        </section>
    );
}

function Pricing() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/public/plans')
            .then((r) => r.json())
            .then((d) => setPlans(d.data ?? []))
            .catch(() => setPlans([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section id="tarifs" className="bg-neutral-50 py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Des formules lisibles pour les écoles.</h2>
                        <p className="mt-3 text-sm text-neutral-700">Commencez par l’essai, puis choisissez selon le nombre d’élèves et le volume SMS.</p>
                    </div>
                    <p className="rounded-md bg-accent-light px-3 py-2 text-sm font-medium text-accent">30 jours d’essai gratuit</p>
                </div>

                {loading ? (
                    <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : plans.length === 0 ? (
                    <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
                        <p className="text-sm text-neutral-700">
                            Les formules seront affichées ici. Contactez-nous pour démarrer l’essai gratuit.
                        </p>
                        <Link to="/register" className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                            Créer une école
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {plans.map((plan) => (
                            <article key={plan.id} className={`flex flex-col rounded-lg border bg-white p-5 ${PLAN_STYLES[plan.slug] ?? 'border-neutral-200'}`}>
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                                    <p className="mt-2 text-3xl font-bold text-primary">
                                        {plan.priceUSD === 0 ? 'Gratuit' : `$${plan.priceUSD}`}
                                        {plan.priceUSD > 0 && <span className="text-sm font-medium text-neutral-700"> / mois</span>}
                                    </p>
                                    {plan.priceCDF > 0 && <p className="mt-1 text-xs text-neutral-700">{plan.priceCDF.toLocaleString()} CDF</p>}
                                </div>
                                <div className="space-y-2 text-sm text-neutral-700">
                                    <p className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {plan.maxStudentsLabel} élèves</p>
                                    <p className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {plan.maxTeachers === -1 ? 'Enseignants illimités' : `${plan.maxTeachers} enseignants`}</p>
                                    <p className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {plan.maxSmsPerMonth} SMS/mois</p>
                                </div>
                                <div className="mt-5 flex-1 space-y-2 border-t border-neutral-200 pt-4">
                                    {(Array.isArray(plan.features) ? plan.features : []).slice(0, 4).map((feature) => (
                                        <p key={feature} className="text-sm leading-5 text-neutral-700">{feature}</p>
                                    ))}
                                </div>
                                <button
                                    onClick={() => navigate(`/register?plan=${plan.slug}`)}
                                    className="mt-5 h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                                >
                                    Choisir {plan.name}
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function Faq() {
    return (
        <section id="faq" className="bg-white py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
                <h2 className="text-2xl font-bold text-neutral-900">Questions fréquentes</h2>
                <div className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
                    {FAQ.map((item) => (
                        <details key={item.q} className="group px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-neutral-900">
                                {item.q}
                                <span className="text-primary transition-transform group-open:rotate-45" aria-hidden>+</span>
                            </summary>
                            <p className="mt-2 text-sm leading-6 text-neutral-700">{item.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FinalCta() {
    return (
        <section className="relative overflow-hidden">
            <Photo
                src={IMG.windowKids}
                alt="Élèves souriant à la fenêtre de leur école"
                className="absolute inset-0 h-full w-full"
            />
            <div className="absolute inset-0 bg-primary/85" aria-hidden />
            <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center text-white sm:px-6">
                <h2 className="text-2xl font-bold sm:text-3xl">Donnez à votre école un outil à sa mesure.</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/85">
                    Créez l’espace de votre établissement en quelques minutes et démarrez avec 30 jours d’essai gratuit.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link to="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-primary transition-colors hover:bg-neutral-100">
                        Créer mon école
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to="/login" className="inline-flex h-12 items-center justify-center rounded-md border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                        Accéder à mon compte
                    </Link>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="border-t border-neutral-200 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
                <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
                    <div>
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="" className="h-8 w-8" />
                            <span className="font-semibold text-neutral-900">EduGoma 360</span>
                        </div>
                        <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-700">
                            Système de gestion d’école secondaire, conçu pour les réalités de Goma et du Nord-Kivu :
                            hors-ligne, bilingue et conforme à l’EPSP.
                        </p>
                        <p className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
                            <MapPin className="h-4 w-4 text-primary" /> Goma, Nord-Kivu, RDC
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Produit</p>
                        <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                            <li><a href="#pour-qui" className="hover:text-primary">Pour qui</a></li>
                            <li><a href="#fonctionnalites" className="hover:text-primary">Fonctionnalités</a></li>
                            <li><a href="#tarifs" className="hover:text-primary">Tarifs</a></li>
                            <li><a href="#faq" className="hover:text-primary">Questions fréquentes</a></li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Accès</p>
                        <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                            <li><Link to="/login" className="hover:text-primary">Connexion</Link></li>
                            <li><Link to="/register" className="hover:text-primary">Créer une école</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 flex flex-col gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} EduGoma 360 — Tous droits réservés.</span>
                    <span className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1"><Printer className="h-3.5 w-3.5" /> EPSP-RDC</span>
                        <span className="inline-flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" /> Mobile</span>
                        <span className="inline-flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> Multi-écoles</span>
                    </span>
                </div>
            </div>
        </footer>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-neutral-900">
            <Header />
            <Hero />
            <Roles />
            <Workflow />
            <Features />
            <OfflineBand />
            <Pricing />
            <Faq />
            <FinalCta />
            <Footer />
        </div>
    );
}
