import { useState } from 'react';
import { X, Loader2, AlertTriangle, CheckCircle2, XCircle, Lock, Users, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CloseYearModalProps {
    isOpen: boolean;
    yearId: string;
    yearName: string;
    onClose: () => void;
    onSubmit: (id: string, ignoreDebts: boolean) => Promise<void>;
    isSubmitting: boolean;
}

const checks = [
    { label: 'Tous les trimestres terminés', ok: true },
    { label: 'Délibération T3 approuvée', ok: true },
    { label: 'Bulletins générés', ok: true },
    { label: '12 élèves ont des créances impayées', ok: false },
];

const consequences = [
    'Aucune modification de notes ou de présences ne sera possible',
    "L'année sera archivée en lecture seule permanente",
    'Les élèves admis seront prêts pour le passage en classe supérieure',
    'Les créances non réglées seront figées dans l\'historique',
];

export default function CloseYearModal({ isOpen, yearId, yearName, onClose, onSubmit, isSubmitting }: CloseYearModalProps) {
    const [ignoreDebts, setIgnoreDebts] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const hasIssues = checks.some(c => !c.ok);
    const canClose = !hasIssues || ignoreDebts;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canClose) return;
        try {
            await onSubmit(yearId, ignoreDebts);
            onClose();
        } catch { /* handled by hook */ }
    };

    const handleClose = () => {
        setIgnoreDebts(false);
        setConfirmed(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-red-50 z-10 flex items-center justify-between px-6 py-4 border-b border-red-100 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <Lock size={18} className="text-red-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-red-800 text-base">Clôturer l'année {yearName}</h2>
                            <p className="text-xs text-red-600 mt-0.5">Cette action est irréversible</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                    {/* Warning */}
                    <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
                        <p>
                            <strong>⚠️ Cette action est IRRÉVERSIBLE.</strong> Une fois clôturée, aucune note ni présence ne pourra être modifiée pour cette année scolaire.
                        </p>
                    </div>

                    {/* Checklist */}
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Vérifications préalables</h3>
                        {checks.map((c, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-sm">
                                {c.ok ? (
                                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                                ) : (
                                    <XCircle size={16} className="text-red-500 shrink-0" />
                                )}
                                <span className={c.ok ? 'text-neutral-700' : 'text-red-700 font-medium'}>{c.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats (mock) */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: Users, label: 'Élèves inscrits', value: '847', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { icon: TrendingUp, label: 'Admis estimés', value: '678 (80%)', color: 'text-green-600', bg: 'bg-green-50' },
                            { icon: AlertTriangle, label: 'Ajournés', value: '169 (20%)', color: 'text-orange-600', bg: 'bg-orange-50' },
                        ].map((s, i) => (
                            <div key={i} className="p-3 rounded-xl border border-neutral-100 text-center">
                                <s.icon size={16} className={cn("mx-auto mb-1.5", s.color)} />
                                <p className={cn("text-sm font-bold", s.color)}>{s.value}</p>
                                <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Consequences */}
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Conséquences de la clôture</h3>
                        <ul className="space-y-2">
                            {consequences.map((c, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">{i + 1}</span>
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Handle debts */}
                    {hasIssues && (
                        <div className="p-4 border-2 border-orange-200 bg-orange-50 rounded-xl space-y-3">
                            <p className="text-sm font-semibold text-orange-900">Des créances impayées existent — comment procéder ?</p>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer text-sm text-neutral-700">
                                    <input type="radio" checked={!ignoreDebts} onChange={() => setIgnoreDebts(false)} className="accent-primary" />
                                    <span>Non, je vais corriger les créances d'abord</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer text-sm text-orange-800 font-medium">
                                    <input type="radio" checked={ignoreDebts} onChange={() => setIgnoreDebts(true)} className="accent-orange-600" />
                                    <span>Clôturer malgré les créances impayées</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Final confirmation */}
                    {canClose && (
                        <label className={cn(
                            "flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all",
                            confirmed ? "border-red-400 bg-red-50" : "border-neutral-200 hover:border-red-200"
                        )}>
                            <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={e => setConfirmed(e.target.checked)}
                                className="mt-0.5 accent-red-600"
                            />
                            <span className="text-sm text-neutral-800 font-medium">
                                Je confirme vouloir clôturer définitivement l'année <strong>{yearName}</strong>. Cette action est irréversible.
                            </span>
                        </label>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-2 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2.5 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !canClose || !confirmed}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:opacity-40 transition-all shadow-sm w-full sm:w-auto"
                        >
                            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                            Clôturer définitivement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
