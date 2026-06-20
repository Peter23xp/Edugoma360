import { useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FileSpreadsheet, FileText, Download, Loader2, Building2, CreditCard, MessageSquare, TrendingUp } from 'lucide-react';

interface ExportConfig {
    key: string;
    label: string;
    description: string;
    icon: any;
    format: 'xlsx' | 'pdf';
    endpoint: string;
    hasMonthPicker?: boolean;
    hasSchoolPicker?: boolean;
}

const EXPORTS: ExportConfig[] = [
    {
        key: 'schools',
        label: 'Liste des écoles',
        description: 'Toutes les écoles avec plan, statut abonnement, élèves, enseignants.',
        icon: Building2,
        format: 'xlsx',
        endpoint: '/superadmin/exports/schools',
    },
    {
        key: 'subscriptions',
        label: 'Historique abonnements',
        description: 'Tous les abonnements avec montants, méthodes de paiement et références.',
        icon: CreditCard,
        format: 'xlsx',
        endpoint: '/superadmin/exports/subscriptions',
    },
    {
        key: 'sms',
        label: 'Usage SMS',
        description: 'Consommation SMS par école pour un mois donné.',
        icon: MessageSquare,
        format: 'xlsx',
        endpoint: '/superadmin/exports/sms',
        hasMonthPicker: true,
    },
    {
        key: 'financial',
        label: 'Rapport financier mensuel',
        description: 'MRR, paiements reçus, nouvelles écoles — rapport PDF de direction.',
        icon: TrendingUp,
        format: 'pdf',
        endpoint: '/superadmin/exports/financial',
        hasMonthPicker: true,
    },
];

function currentMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function ExportsPage() {
    const [months, setMonths] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    async function download(exp: ExportConfig) {
        setLoading(p => ({ ...p, [exp.key]: true }));
        try {
            const params: any = {};
            if (exp.hasMonthPicker) params.month = months[exp.key] ?? currentMonth();

            const res = await api.get(exp.endpoint, { params, responseType: 'blob' });
            const ext  = exp.format;
            const url  = URL.createObjectURL(new Blob([res.data]));
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `${exp.key}-${params.month ?? new Date().toISOString().slice(0, 10)}.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`${exp.label} téléchargé.`);
        } catch (err: any) {
            toast.error(err.response?.data?.error ?? 'Erreur lors du téléchargement.');
        } finally {
            setLoading(p => ({ ...p, [exp.key]: false }));
        }
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Exports & Rapports</h1>
                <p className="mt-1 text-sm text-neutral-700">Générez et téléchargez des rapports PDF ou Excel à la demande.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                {EXPORTS.map(exp => {
                    const Icon = exp.icon;
                    const busy = loading[exp.key] ?? false;
                    return (
                        <div key={exp.key} className="flex flex-col rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-lighter">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold text-neutral-900">{exp.label}</h3>
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${exp.format === 'pdf' ? 'bg-error-light text-error' : 'bg-info-light text-info'}`}>
                                            {exp.format === 'pdf' ? <FileText className="h-2.5 w-2.5" /> : <FileSpreadsheet className="h-2.5 w-2.5" />}
                                            {exp.format.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-neutral-500">{exp.description}</p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                {exp.hasMonthPicker && (
                                    <input
                                        type="month"
                                        value={months[exp.key] ?? currentMonth()}
                                        onChange={e => setMonths(p => ({ ...p, [exp.key]: e.target.value }))}
                                        className="h-9 flex-1 rounded-md border border-neutral-300 px-3 text-sm focus:border-primary focus:outline-none"
                                    />
                                )}
                                <button
                                    onClick={() => download(exp)}
                                    disabled={busy}
                                    className="ml-auto inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
                                >
                                    {busy
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Génération...</>
                                        : <><Download className="h-4 w-4" /> Télécharger</>
                                    }
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-lg border border-info/30 bg-info-light p-4">
                <p className="text-sm font-medium text-info">💡 Les fichiers sont générés à la demande et téléchargés directement — aucun stockage côté serveur.</p>
            </div>
        </div>
    );
}
