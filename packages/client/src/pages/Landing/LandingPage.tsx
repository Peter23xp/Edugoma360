import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    WifiOff, FileText, DollarSign, MessageSquare,
    CheckCircle, ArrowRight, Star, Shield, Globe,
    ChevronDown, Loader2, Check,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Plan {
    id:               string;
    name:             string;
    slug:             string;
    priceUSD:         number;
    priceCDF:         number;
    maxStudents:      number;
    maxStudentsLabel: string;
    maxTeachers:      number;
    maxSmsPerMonth:   number;
    durationDays:     number;
    features:         string[];
}

// ── Feature Cards data ────────────────────────────────────────────────────────
const FEATURES = [
    {
        icon: WifiOff,
        color: 'from-emerald-500 to-emerald-700',
        title: 'Offline-First',
        desc: 'Faites l\'appel et saisissez les notes même sans internet. La synchronisation se fait automatiquement dès le retour du réseau.',
    },
    {
        icon: FileText,
        color: 'from-blue-500 to-blue-700',
        title: 'Bulletins EPSP officiels',
        desc: 'Générés en 1 clic, conformes aux normes du Ministère de l\'EPSP-RDC. Impression directe sans mise en page manuelle.',
    },
    {
        icon: DollarSign,
        color: 'from-amber-500 to-amber-700',
        title: 'Finances bi-devises',
        desc: 'Suivez vos encaissements en CDF et USD avec taux de change dynamique. Reçus automatiques, rapports mensuels en un clic.',
    },
    {
        icon: MessageSquare,
        color: 'from-purple-500 to-purple-700',
        title: 'SMS Parents',
        desc: 'Notifications automatiques en français et swahili via Africa\'s Talking. Convocations, résultats, retards de paiement.',
    },
];

// ── Plan badge colors ─────────────────────────────────────────────────────────
const PLAN_STYLES: Record<string, { border: string; badge?: string; btn: string }> = {
    trial:  { border: 'border-gray-200', btn: 'bg-gray-800 hover:bg-gray-900 text-white' },
    bronze: { border: 'border-amber-300', btn: 'bg-amber-700 hover:bg-amber-800 text-white' },
    silver: {
        border: 'border-[#F57F17] ring-2 ring-[#F57F17]/30',
        badge: 'Recommandé',
        btn: 'bg-[#1B5E20] hover:bg-[#2E7D32] text-white',
    },
    gold: { border: 'border-yellow-400', btn: 'bg-yellow-600 hover:bg-yellow-700 text-white' },
};

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#1B5E20]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <span className="text-white font-bold text-lg tracking-wide">EduGoma <span className="text-[#F57F17]">360</span></span>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="text-white/80 hover:text-white text-sm font-medium transition-colors hidden sm:block">
                        Se connecter
                    </Link>
                    <Link
                        to="/register"
                        className="px-4 py-2 bg-[#F57F17] hover:bg-[#FF8F00] text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                    >
                        Démarrer gratuitement
                    </Link>
                </div>
            </div>
        </nav>
    );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection() {
    return (
        <section className="relative min-h-screen bg-gradient-to-b from-[#1B5E20] via-[#1a3a1e] to-gray-950 flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
            {/* Animated background dots */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle, #4CAF50 1px, transparent 1px)',
                backgroundSize: '40px 40px',
            }} />

            {/* Glow orb */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4CAF50]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center max-w-4xl mx-auto">
                {/* Pre-badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm mb-6 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Conçu pour les réalités de la RDC
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                    Gérez votre école secondaire à{' '}
                    <span className="text-[#F57F17]">Goma</span>,<br className="hidden sm:block" />
                    même sans connexion Internet
                </h1>

                <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                    EduGoma 360 — le système de gestion scolaire tout-en-un conçu pour les écoles secondaires de la RDC : inscriptions, notes, bulletins EPSP, finances et SMS parents.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Link
                        to="/register"
                        id="hero-cta-primary"
                        className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#F57F17] hover:bg-[#FF8F00] text-white text-lg font-bold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-[#F57F17]/30 active:scale-95"
                    >
                        Créer l'espace de mon école
                        <span className="text-sm font-normal opacity-80">(30 jours gratuits)</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a
                        href="#features"
                        id="hero-cta-demo"
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-lg font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm"
                    >
                        Voir les fonctionnalités
                        <ChevronDown className="w-5 h-5" />
                    </a>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {[
                        { icon: Shield,       label: 'Conforme EPSP-RDC' },
                        { icon: WifiOff,      label: 'Mode hors-ligne' },
                        { icon: DollarSign,   label: 'Bi-devise CDF/USD' },
                        { icon: Globe,        label: 'Français & Swahili' },
                    ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-white/80 text-sm border border-white/10">
                            <Icon className="w-3.5 h-3.5 text-[#F57F17]" />
                            {label}
                        </div>
                    ))}
                </div>
            </div>

            {/* App mockup — stylized CSS preview */}
            <div className="relative z-10 mt-16 w-full max-w-3xl mx-auto px-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-sm shadow-2xl">
                    {/* Browser chrome */}
                    <div className="bg-gray-900/80 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
                            <div className="w-3 h-3 rounded-full bg-red-500/60" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                            <div className="ml-4 flex-1 bg-white/10 rounded px-3 py-0.5 text-xs text-white/40 font-mono">
                                mungano.edugoma360.cd/dashboard
                            </div>
                        </div>
                        {/* Dashboard preview */}
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Élèves actifs', val: '342', color: 'bg-emerald-500/20 text-emerald-300' },
                                { label: 'Paiements CDF', val: '2.4M', color: 'bg-blue-500/20 text-blue-300' },
                                { label: 'Présence', val: '94%', color: 'bg-amber-500/20 text-amber-300' },
                                { label: 'SMS envoyés', val: '128', color: 'bg-purple-500/20 text-purple-300' },
                            ].map((s) => (
                                <div key={s.label} className={`${s.color} rounded-xl p-3`}>
                                    <p className="text-xl font-bold">{s.val}</p>
                                    <p className="text-xs opacity-70 mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="px-4 pb-4 grid grid-cols-3 gap-2 opacity-60">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ── Features ──────────────────────────────────────────────────────────────────
function FeaturesSection() {
    return (
        <section id="features" className="bg-gray-950 py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <p className="text-[#F57F17] text-sm font-semibold uppercase tracking-widest mb-3">Fonctionnalités</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Tout ce dont votre école a besoin
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Développé en collaboration avec des préfets et économes de Goma pour coller aux réalités du terrain.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FEATURES.map(({ icon: Icon, color, title, desc }) => (
                        <div key={title} className="group flex gap-5 p-6 bg-gray-900 border border-gray-800 rounded-2xl hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function PricingSection() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/public/plans')
            .then((r) => r.json())
            .then((d) => setPlans(d.data ?? []))
            .catch(() => {/* silent fail — show static fallback */})
            .finally(() => setLoading(false));
    }, []);

    return (
        <section id="pricing" className="bg-gray-950 py-24 px-4 border-t border-gray-900">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <p className="text-[#F57F17] text-sm font-semibold uppercase tracking-widest mb-3">Tarifs</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Commencez gratuitement, grandissez à votre rythme
                    </h2>
                    <p className="text-gray-400">30 jours d'essai gratuit · Pas de carte de crédit requise · Annulation à tout moment</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[#F57F17] animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {plans.map((plan) => {
                            const style = PLAN_STYLES[plan.slug] ?? PLAN_STYLES.trial;
                            const isRecommended = plan.slug === 'silver';
                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col bg-gray-900 border-2 ${style.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                                >
                                    {isRecommended && style.badge && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#F57F17] text-white text-xs font-bold rounded-full whitespace-nowrap flex items-center gap-1">
                                            <Star className="w-3 h-3" />
                                            {style.badge}
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                                        <div className="flex items-end gap-1 mb-3">
                                            {plan.priceUSD === 0 ? (
                                                <span className="text-3xl font-black text-white">Gratuit</span>
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-black text-white">${plan.priceUSD}</span>
                                                    <span className="text-gray-400 text-sm mb-1">/an</span>
                                                </>
                                            )}
                                        </div>
                                        {plan.priceCDF > 0 && (
                                            <p className="text-gray-500 text-xs">{plan.priceCDF.toLocaleString()} CDF/an</p>
                                        )}
                                    </div>

                                    {/* Key limits */}
                                    <div className="space-y-1.5 mb-5 text-sm">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span>{plan.maxStudentsLabel} élèves</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span>{plan.maxTeachers === -1 ? 'Illimité' : plan.maxTeachers} enseignants</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span>{plan.maxSmsPerMonth} SMS/mois</span>
                                        </div>
                                    </div>

                                    {/* Features list */}
                                    <div className="flex-1 space-y-1.5 mb-6">
                                        {(Array.isArray(plan.features) ? plan.features : []).slice(0, 5).map((f, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                                                <CheckCircle className="w-3.5 h-3.5 text-[#F57F17] flex-shrink-0 mt-0.5" />
                                                <span>{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => navigate(`/register?plan=${plan.slug}`)}
                                        className={`w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 ${style.btn}`}
                                    >
                                        {plan.priceUSD === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

// ── Testimonial ───────────────────────────────────────────────────────────────
function TestimonialSection() {
    return (
        <section className="bg-[#1B5E20]/10 border-y border-[#1B5E20]/20 py-20 px-4">
            <div className="max-w-3xl mx-auto text-center">
                <div className="text-4xl mb-6 text-[#F57F17]">"</div>
                <blockquote className="text-xl sm:text-2xl text-white font-medium leading-relaxed mb-8">
                    EduGoma 360 a transformé notre école. Les bulletins qui prenaient 3 jours à préparer sont maintenant prêts en 20 minutes. Nos parents reçoivent les résultats par SMS le soir même de la clôture.
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1B5E20] to-[#4CAF50] flex items-center justify-center text-white font-bold text-xl">
                        JM
                    </div>
                    <div className="text-left">
                        <p className="text-white font-semibold">Jean-Marie BAHATI MUGISHA</p>
                        <p className="text-gray-400 text-sm">Préfet, Collège Saint-Raphaël — Goma</p>
                        <div className="flex gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-[#F57F17] text-[#F57F17]" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function CtaSection() {
    return (
        <section className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] py-24 px-4">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                    Prêt à moderniser votre école ?
                </h2>
                <p className="text-white/70 text-lg mb-10">
                    Rejoignez les écoles qui font confiance à EduGoma 360. Essai gratuit 30 jours, sans engagement.
                </p>
                <Link
                    to="/register"
                    id="final-cta-button"
                    className="inline-flex items-center gap-3 px-10 py-4 bg-white text-[#1B5E20] text-lg font-extrabold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 active:scale-95"
                >
                    Créer mon espace école gratuitement
                    <ArrowRight className="w-6 h-6" />
                </Link>
                <p className="mt-4 text-white/50 text-sm">Aucune carte bancaire requise · Configuration en 5 minutes</p>
            </div>
        </section>
    );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
    return (
        <footer className="bg-gray-950 border-t border-gray-800 py-10 px-4">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold">EduGoma <span className="text-[#F57F17]">360</span></span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-500 text-sm">Goma, Nord-Kivu, RDC</span>
                </div>
                <div className="flex items-center gap-5 text-sm text-gray-500">
                    <a href="#" className="hover:text-white transition-colors">CGU</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                    <a href="#" className="hover:text-white transition-colors">À propos</a>
                    <Link to="/login" className="hover:text-white transition-colors">Connexion</Link>
                </div>
                <p className="text-gray-600 text-xs">© {new Date().getFullYear()} EduGoma 360</p>
            </div>
        </footer>
    );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-950 font-sans antialiased">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <PricingSection />
            <TestimonialSection />
            <CtaSection />
            <Footer />
        </div>
    );
}
