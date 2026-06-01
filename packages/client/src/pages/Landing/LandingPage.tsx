import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    BookOpenCheck,
    CalendarCheck,
    Check,
    CheckCircle,
    FileText,
    Loader2,
    MessageSquare,
    ShieldCheck,
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
                <nav className="flex items-center gap-2">
                    <a href="#fonctionnement" className="hidden px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary sm:inline-flex">
                        Fonctionnement
                    </a>
                    <a href="#tarifs" className="hidden px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary sm:inline-flex">
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

function ProductPreview() {
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

function Hero() {
    return (
        <section className="border-b border-neutral-200 bg-[#F7FAF7]">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                    <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-white px-3 py-2 text-sm font-medium text-primary">
                        <ShieldCheck className="h-4 w-4" />
                        Pensé pour les écoles secondaires de Goma
                    </div>
                    <h1 className="max-w-3xl text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl">
                        La gestion scolaire qui reste fiable même quand le réseau coupe.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 sm:text-lg">
                        EduGoma 360 aide les directions à suivre les élèves, les présences, les notes, les paiements et les SMS parents dans un outil unique, adapté au terrain congolais.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link to="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                            Créer l’espace de mon école
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link to="/login" className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100">
                            Accéder à mon compte
                        </Link>
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
                <div className="lg:pl-4">
                    <ProductPreview />
                </div>
            </div>
        </section>
    );
}

function Workflow() {
    return (
        <section id="fonctionnement" className="bg-white py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mb-8 max-w-2xl">
                    <h2 className="text-2xl font-bold text-neutral-900">Une même chaîne de travail, du secrétariat au parent.</h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-700">
                        L’interface suit les gestes réels d’une école : inscrire, contrôler, calculer, encaisser, informer.
                    </p>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                    {WORKFLOW.map(({ icon: Icon, title, text }) => (
                        <div key={title} className="rounded-lg border border-neutral-200 bg-neutral-50 p-5">
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
                        Les présences et certaines saisies restent disponibles localement. EduGoma synchronise dès que la connexion revient, sans refaire le travail.
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

function Footer() {
    return (
        <footer className="border-t border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-neutral-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="" className="h-8 w-8" />
                    <span className="font-semibold text-neutral-900">EduGoma 360</span>
                    <span>Goma, Nord-Kivu, RDC</span>
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="hover:text-primary">Connexion</Link>
                    <Link to="/register" className="hover:text-primary">Créer une école</Link>
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
            <Workflow />
            <OfflineBand />
            <Pricing />
            <Footer />
        </div>
    );
}
