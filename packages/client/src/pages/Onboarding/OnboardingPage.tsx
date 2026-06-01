import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOnboardingStore } from './onboarding.store';
import {
    Building2, UserCircle, CreditCard,
    CheckCircle, Check, Loader2, ArrowRight,
    ArrowLeft, Eye, EyeOff, AlertCircle,
    ExternalLink, Copy, Star,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Plan {
    id:               string;
    name:             string;
    slug:             string;
    priceUSD:         number;
    priceCDF:         number;
    maxStudentsLabel: string;
    maxSmsPerMonth:   number;
    durationDays:     number;
    features:         string[];
}

// ── slugify helper (same logic as backend) ────────────────────────────────────
const ACCENT_MAP: Record<string, string> = {
    à:'a',â:'a',ä:'a',á:'a',ã:'a',è:'e',é:'e',ê:'e',ë:'e',
    ì:'i',î:'i',ï:'i',í:'i',ò:'o',ô:'o',ö:'o',ó:'o',õ:'o',
    ù:'u',û:'u',ü:'u',ú:'u',ç:'c',ñ:'n',
    À:'a',Â:'a',Á:'a',È:'e',É:'e',Ê:'e',Î:'i',Ô:'o',Ù:'u',Û:'u',Ç:'c',
};
function slugify(text: string): string {
    return text.split('').map(c => ACCENT_MAP[c] ?? c).join('')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
}

// ── Validation schemas ────────────────────────────────────────────────────────
const PHONE_RE = /^\+243(81|82|83|84|85|86|87|88|89|90|97|98|99)\d{7}$/;
const PWD_RE   = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const schoolSchema = z.object({
    name:              z.string().min(4, 'Minimum 4 caractères').max(120),
    address:           z.string().max(200).optional(),
    phone:             z.string().regex(PHONE_RE, 'Format : +243XXXXXXXXX'),
    email:             z.string().email('Email invalide').optional().or(z.literal('')),
    estimatedStudents: z.string().min(1, 'Sélectionnez une fourchette'),
});

const adminSchema = z.object({
    firstName: z.string().min(2, 'Minimum 2 caractères'),
    lastName:  z.string().min(2, 'Minimum 2 caractères'),
    email:     z.string().email('Email invalide').optional().or(z.literal('')),
    phone:     z.string().regex(PHONE_RE, 'Format : +243XXXXXXXXX'),
    password:  z.string().regex(PWD_RE, '8 caractères min, 1 majuscule, 1 chiffre'),
    confirm:   z.string().min(8, 'Confirmez votre mot de passe'),
}).refine(d => d.password === d.confirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm'],
});

type SchoolForm = z.infer<typeof schoolSchema>;
type AdminForm  = z.infer<typeof adminSchema>;

// ── Stepper ───────────────────────────────────────────────────────────────────
const STEPS = [
    { label: 'Mon institution', icon: Building2 },
    { label: 'Administrateur', icon: UserCircle },
    { label: 'Ma formule',     icon: CreditCard },
];

function Stepper({ current }: { current: number }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-10">
            {STEPS.map((s, i) => {
                const done    = i < current - 1;
                const active  = i === current - 1;
                const Icon    = s.icon;
                return (
                    <div key={i} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                done   ? 'bg-[#1B5E20] border-[#1B5E20] text-white' :
                                active ? 'bg-white border-[#1B5E20] text-[#1B5E20]' :
                                         'bg-gray-100 border-gray-300 text-gray-400'
                            }`}>
                                {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span className={`mt-1.5 text-xs font-medium hidden sm:block ${active ? 'text-[#1B5E20]' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`w-16 sm:w-24 h-0.5 mx-2 transition-all duration-500 ${done ? 'bg-[#1B5E20]' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Input field wrapper ───────────────────────────────────────────────────────
function Field({
    label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
        </div>
    );
}

const inputCls = (err?: string) =>
    `w-full px-3.5 py-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 ${
        err ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-[#1B5E20] focus:ring-[#1B5E20]/20'
    }`;

// ── STEP 1 — School Info ──────────────────────────────────────────────────────
function Step1School({ onNext }: { onNext: () => void }) {
    const { school, setSchool } = useOnboardingStore();
    const [slugPreview, setSlugPreview] = useState('');
    const [slugStatus, setSlugStatus]   = useState<'idle'|'checking'|'ok'|'taken'>('idle');

    const { register, handleSubmit, watch, formState: { errors } } = useForm<SchoolForm>({
        resolver: zodResolver(schoolSchema),
        defaultValues: { ...school, estimatedStudents: school.estimatedStudents ?? '' },
    });

    const nameValue = watch('name') ?? '';

    // Live slug preview + availability check
    useEffect(() => {
        const slug = slugify(nameValue);
        setSlugPreview(slug);
        if (slug.length < 3) { setSlugStatus('idle'); return; }

        setSlugStatus('checking');
        const t = setTimeout(async () => {
            try {
                const r = await fetch(`/api/public/onboarding/check-subdomain?slug=${encodeURIComponent(slug)}`);
                const d = await r.json();
                setSlugStatus(d.available ? 'ok' : 'taken');
            } catch { setSlugStatus('idle'); }
        }, 500);
        return () => clearTimeout(t);
    }, [nameValue]);

    const onSubmit = (data: SchoolForm) => {
        setSchool(data);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Field label="Nom de l'établissement" error={errors.name?.message} required>
                <input {...register('name')} placeholder="ex: Collège Saint-Raphaël de Goma" className={inputCls(errors.name?.message)} autoFocus />
            </Field>

            {/* Subdomain preview */}
            {slugPreview && (
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border ${
                    slugStatus === 'ok'    ? 'bg-green-50 border-green-300 text-green-700' :
                    slugStatus === 'taken' ? 'bg-red-50 border-red-300 text-red-600' :
                                            'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                    {slugStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
                    {slugStatus === 'ok'        && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                    {slugStatus === 'taken'     && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    <span className="font-mono font-semibold">{slugPreview}.edugoma360.cd</span>
                    <span className="ml-auto text-xs">
                        {slugStatus === 'ok' ? '✓ Disponible' : slugStatus === 'taken' ? 'Pris' : '…'}
                    </span>
                </div>
            )}

            <Field label="Adresse à Goma" error={errors.address?.message}>
                <input {...register('address')} placeholder="Av. Birere, Commune de Goma" className={inputCls(errors.address?.message)} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Téléphone de l'école" error={errors.phone?.message} required>
                    <input {...register('phone')} placeholder="+243810000000" className={inputCls(errors.phone?.message)} />
                </Field>
                <Field label="Email de contact" error={errors.email?.message}>
                    <input {...register('email')} type="email" placeholder="direction@ecole.cd" className={inputCls(errors.email?.message)} />
                </Field>
            </div>

            <Field label="Nombre estimé d'élèves" error={errors.estimatedStudents?.message} required>
                <select {...register('estimatedStudents')} className={inputCls(errors.estimatedStudents?.message)}>
                    <option value="">-- Sélectionnez --</option>
                    <option value="150">Moins de 150</option>
                    <option value="300">Entre 150 et 300</option>
                    <option value="600">Entre 300 et 600</option>
                    <option value="1000">Entre 600 et 1 000</option>
                    <option value="1001">Plus de 1 000</option>
                </select>
            </Field>

            <button type="submit" className="w-full h-11 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-lg transition-all hover:shadow-md flex items-center justify-center gap-2 group">
                Continuer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </form>
    );
}

// ── STEP 2 — Admin ────────────────────────────────────────────────────────────
function Step2Admin({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
    const { admin, setAdmin } = useOnboardingStore();
    const [showPwd, setShowPwd]   = useState(false);
    const [showConf, setShowConf] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<AdminForm>({
        resolver: zodResolver(adminSchema),
        defaultValues: { ...admin } as any,
    });

    const onSubmit = (data: AdminForm) => {
        setAdmin(data);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                <UserCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Le <strong>Préfet / Directeur</strong> sera l'administrateur principal de l'espace école.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Prénom" error={errors.firstName?.message} required>
                    <input {...register('firstName')} placeholder="Jean-Marie" className={inputCls(errors.firstName?.message)} autoFocus />
                </Field>
                <Field label="Nom de famille" error={errors.lastName?.message} required>
                    <input {...register('lastName')} placeholder="BAHATI" className={inputCls(errors.lastName?.message)} />
                </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email professionnel" error={errors.email?.message}>
                    <input {...register('email')} type="email" placeholder="directeur@ecole.cd" className={inputCls(errors.email?.message)} />
                </Field>
                <Field label="Téléphone (+243)" error={errors.phone?.message} required>
                    <input {...register('phone')} placeholder="+243810000000" className={inputCls(errors.phone?.message)} />
                </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Mot de passe" error={errors.password?.message} required>
                    <div className="relative">
                        <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="Min. 8 car., 1 maj., 1 chiffre" className={`${inputCls(errors.password?.message)} pr-10`} />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </Field>
                <Field label="Confirmer le mot de passe" error={errors.confirm?.message} required>
                    <div className="relative">
                        <input {...register('confirm')} type={showConf ? 'text' : 'password'} placeholder="••••••••" className={`${inputCls(errors.confirm?.message)} pr-10`} />
                        <button type="button" onClick={() => setShowConf(!showConf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </Field>
            </div>

            <div className="flex gap-3">
                <button type="button" onClick={onBack} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button type="submit" className="flex-1 h-11 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 group">
                    Continuer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </form>
    );
}

// ── STEP 3 — Plan + Submit ────────────────────────────────────────────────────
function Step3Plan({ onBack }: { onBack: () => void }) {
    const { school, admin, planSlug, setPlan } = useOnboardingStore();
    const [plans,    setPlans]   = useState<Plan[]>([]);
    const [loading,  setLoading] = useState(true);
    const [submitting, setSub]   = useState(false);
    const [error,    setError]   = useState<string | null>(null);
    const [result,   setResult]  = useState<{ schoolName: string; subdomain: string; loginUrl: string; message: string } | null>(null);
    const [copied,   setCopied]  = useState(false);

    useEffect(() => {
        fetch('/api/public/plans')
            .then(r => r.json())
            .then(d => setPlans(d.data ?? []))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = useCallback(async () => {
        setSub(true);
        setError(null);
        try {
            const estimatedStudents = parseInt(school.estimatedStudents ?? '300') || 300;
            const body = {
                school: {
                    name:    school.name,
                    address: school.address,
                    city:    'Goma',
                    province:'Nord-Kivu',
                    phone:   school.phone,
                    email:   school.email || undefined,
                    estimatedStudents,
                },
                admin: {
                    firstName: admin.firstName,
                    lastName:  admin.lastName,
                    email:     admin.email || undefined,
                    phone:     admin.phone,
                    password:  admin.password,
                },
                planSlug,
            };
            const res = await fetch('/api/public/onboarding/register', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                const msg = data.error?.fields?.[0]?.message
                    ?? data.error?.message
                    ?? 'Une erreur inattendue s\'est produite.';
                setError(msg);
                return;
            }
            setResult({
                schoolName: data.school.name,
                subdomain:  data.school.subdomain,
                loginUrl:   data.loginUrl,
                message:    data.message,
            });
        } catch {
            setError('Impossible de joindre le serveur. Vérifiez votre connexion.');
        } finally {
            setSub(false);
        }
    }, [school, admin, planSlug]);

    // ── SUCCESS screen ──────────────────────────────────────────────────────
    if (result) {
        const handleCopy = () => {
            navigator.clipboard.writeText(result.loginUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-[#1B5E20]" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre espace est prêt !</h2>
                    <p className="text-gray-600">{result.message}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Lien de connexion</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono text-[#1B5E20] break-all">{result.loginUrl}</code>
                        <button onClick={handleCopy} className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                        </button>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left space-y-1">
                    <p className="font-semibold">📋 Prochaines étapes :</p>
                    <p>1. Connectez-vous avec le téléphone et le mot de passe que vous venez de créer</p>
                    <p>2. Configurez vos classes et matières dans Paramètres → Académique</p>
                    <p>3. Inscrivez vos premiers élèves</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <a href={result.loginUrl} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1B5E20] text-white font-semibold rounded-xl hover:bg-[#2E7D32] transition-colors"
                    >
                        Accéder à mon espace <ExternalLink className="w-4 h-4" />
                    </a>
                    <Link to="/login" className="flex-1 flex items-center justify-center py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                        Se connecter ici
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Plans grid */}
            {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-7 h-7 text-[#1B5E20] animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plans.map((p) => {
                        const active = planSlug === p.slug;
                        const isRecommended = p.slug === 'silver';
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setPlan(p.slug as any)}
                                className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                                    active ? 'border-[#1B5E20] bg-[#1B5E20]/5' : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {isRecommended && (
                                    <span className="absolute -top-2.5 right-3 flex items-center gap-1 px-2 py-0.5 bg-[#F57F17] text-white text-xs font-bold rounded-full">
                                        <Star className="w-3 h-3" /> Recommandé
                                    </span>
                                )}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-gray-900">{p.name}</span>
                                    {active && <CheckCircle className="w-5 h-5 text-[#1B5E20]" />}
                                </div>
                                <p className="text-2xl font-black text-gray-900 mb-1">
                                    {p.priceUSD === 0 ? 'Gratuit' : `$${p.priceUSD}/an`}
                                </p>
                                <p className="text-xs text-gray-500 mb-2">{p.maxStudentsLabel} élèves · {p.maxSmsPerMonth} SMS/mois</p>
                                <div className="space-y-0.5">
                                    {p.features?.slice(0, 3).map((f, i) => (
                                        <div key={i} className="flex items-start gap-1.5 text-xs text-gray-500">
                                            <Check className="w-3 h-3 text-[#1B5E20] flex-shrink-0 mt-0.5" />
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Recap */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm space-y-1.5">
                <p className="font-semibold text-gray-700 mb-2">Récapitulatif</p>
                <div className="flex justify-between"><span className="text-gray-500">École</span><span className="font-medium truncate max-w-[60%] text-right">{school.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Administrateur</span><span className="font-medium">{admin.firstName} {admin.lastName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Formule</span><span className="font-medium capitalize">{planSlug}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Sous-domaine</span><span className="font-mono text-[#1B5E20] text-xs">{slugify(school.name ?? '')}.edugoma360.cd</span></div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex gap-3">
                <button type="button" onClick={onBack} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 h-11 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-60 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Création en cours…</> : <><CheckCircle className="w-4 h-4" /> Créer mon espace école</>}
                </button>
            </div>
        </div>
    );
}

// ── OnboardingPage ─────────────────────────────────────────────────────────────
export default function OnboardingPage() {
    const [searchParams] = useSearchParams();
    const { step, setStep, setPlan } = useOnboardingStore();

    // Pre-select plan from URL ?plan=xxx
    useEffect(() => {
        const p = searchParams.get('plan');
        if (p && ['trial','bronze','silver','gold'].includes(p)) {
            setPlan(p as any);
        }
        // Reset on fresh mount
        return () => { /* don't reset — user navigating back should keep data */ };
    }, []);

    const goNext = () => setStep((step < 3 ? step + 1 : 3) as any);
    const goBack = () => setStep((step > 1 ? step - 1 : 1) as any);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-[#1B5E20] font-extrabold text-xl">EduGoma <span className="text-[#F57F17]">360</span></span>
                </Link>
                <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    Déjà inscrit ? Se connecter →
                </Link>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-start justify-center px-4 py-10">
                <div className="w-full max-w-xl">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                            Créer l'espace de votre école
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {step === 1 && 'Étape 1/3 — Informations sur votre établissement'}
                            {step === 2 && 'Étape 2/3 — Compte du Préfet / Directeur'}
                            {step === 3 && 'Étape 3/3 — Choisissez votre formule'}
                        </p>
                    </div>

                    {/* Stepper */}
                    <Stepper current={step} />

                    {/* Form card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                        {step === 1 && <Step1School onNext={goNext} />}
                        {step === 2 && <Step2Admin onNext={goNext} onBack={goBack} />}
                        {step === 3 && <Step3Plan onBack={goBack} />}
                    </div>

                    {/* Footer note */}
                    <p className="text-center text-xs text-gray-400 mt-6">
                        En créant votre espace, vous acceptez nos{' '}
                        <a href="#" className="underline hover:text-gray-600">Conditions d'utilisation</a>.
                        <br />Vos données restent sur les serveurs d'EduGoma 360 et ne sont jamais revendues.
                    </p>
                </div>
            </main>
        </div>
    );
}
