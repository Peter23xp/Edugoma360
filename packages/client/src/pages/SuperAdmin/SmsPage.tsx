import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Loader2, AlertTriangle, MessageSquare, DollarSign, BarChart2 } from 'lucide-react';

interface SmsUsage {
    school: { id: string; name: string; subdomain: string | null; plan: { name: string; maxSmsPerMonth: number } | null };
    sentSMS: number;
    cost: number;
    campaigns: number;
    quota: number;
}

function UsageBar({ sent, quota }: { sent: number; quota: number }) {
    if (quota <= 0) return <span className="text-xs text-neutral-400">Illimité</span>;
    const pct = Math.min((sent / quota) * 100, 100);
    const over = sent > quota;
    const color = over ? 'bg-red-700' : pct >= 80 ? 'bg-error' : pct >= 60 ? 'bg-accent' : 'bg-primary';
    return (
        <div className="flex items-center gap-2 min-w-[140px]">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-xs font-medium tabular-nums ${over ? 'text-error font-bold' : pct >= 80 ? 'text-error' : 'text-neutral-600'}`}>
                {Math.round(pct)}%{over && ' ⚠'}
            </span>
        </div>
    );
}

export default function SmsPage() {
    const { data, isLoading, error } = useQuery<{ data: SmsUsage[]; month: string }>({
        queryKey: ['sa-sms-usage'],
        queryFn: () => api.get('/superadmin/sms-usage').then(r => r.data),
    });

    if (isLoading) return <div className="flex h-72 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
    if (error) return <div className="p-6 text-sm text-error">Erreur de chargement.</div>;

    const rows = data?.data ?? [];
    const month = data?.month ?? '';
    const monthLabel = month ? new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '';

    const totalSMS = rows.reduce((s, r) => s + r.sentSMS, 0);
    const totalCost = rows.reduce((s, r) => s + r.cost, 0);
    const totalCampaigns = rows.reduce((s, r) => s + r.campaigns, 0);
    const alertSchools = rows.filter(r => r.quota > 0 && r.sentSMS / r.quota >= 0.8);

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Usage SMS</h1>
                <p className="mt-1 text-sm text-neutral-700 capitalize">{monthLabel} — consommation SMS par école.</p>
            </div>

            {alertSchools.length > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-accent/40 bg-accent-light p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <div>
                        <p className="text-sm font-semibold text-accent">
                            {alertSchools.length} école{alertSchools.length > 1 ? 's ont' : ' a'} dépassé 80% du quota SMS ce mois
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-700">
                            {alertSchools.map(s => s.school.name).join(', ')}
                        </p>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-600">SMS envoyés</p>
                        <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-neutral-900">{totalSMS.toLocaleString()}</p>
                    <p className="text-xs text-neutral-500">ce mois-ci</p>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-600">Campagnes</p>
                        <BarChart2 className="h-5 w-5 text-info" />
                    </div>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-neutral-900">{totalCampaigns}</p>
                    <p className="text-xs text-neutral-500">toutes écoles confondues</p>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-600">Coût estimé</p>
                        <DollarSign className="h-5 w-5 text-accent" />
                    </div>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-neutral-900">${totalCost.toFixed(2)}</p>
                    <p className="text-xs text-neutral-500">USD ce mois</p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50">
                            <tr>
                                {['École', 'Plan', 'SMS envoyés', 'Quota mensuel', 'Utilisation', 'Campagnes', 'Coût ($)'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-600">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {rows.map(r => {
                                const over = r.quota > 0 && r.sentSMS > r.quota;
                                return (
                                    <tr key={r.school.id} className={`hover:bg-neutral-50 ${over ? 'bg-error-light/30' : ''}`}>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-neutral-900">{r.school.name}</p>
                                            <p className="text-xs text-neutral-500">{r.school.subdomain ?? '—'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600">{r.school.plan?.name ?? 'Sans plan'}</td>
                                        <td className="px-4 py-3 tabular-nums font-medium text-neutral-900">{r.sentSMS.toLocaleString()}</td>
                                        <td className="px-4 py-3 tabular-nums text-neutral-600">{r.quota > 0 ? r.quota.toLocaleString() : '∞'}</td>
                                        <td className="px-4 py-3"><UsageBar sent={r.sentSMS} quota={r.quota} /></td>
                                        <td className="px-4 py-3 tabular-nums text-neutral-600">{r.campaigns}</td>
                                        <td className="px-4 py-3 tabular-nums text-neutral-700">${r.cost.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {rows.length === 0 && (
                        <div className="flex flex-col items-center gap-2 py-12 text-neutral-400">
                            <MessageSquare className="h-8 w-8" />
                            <p className="text-sm">Aucune activité SMS ce mois-ci.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
