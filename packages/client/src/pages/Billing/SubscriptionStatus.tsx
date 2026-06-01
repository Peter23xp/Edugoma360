import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Shield, Users, MessageSquare, Calendar, Loader2, CreditCard, RefreshCw } from 'lucide-react';
import RenewModal from './RenewModal';

export default function SubscriptionStatus() {
    const [isRenewOpen, setIsRenewOpen] = useState(false);

    // Fetch the billing information
    const { data: raw, isLoading, refetch } = useQuery({
        queryKey: ['billing-info'],
        queryFn: async () => (await api.get('/billing/info')).data,
        refetchInterval: 15 * 1000, // Refresh context
    });

    const info = raw?.data;

    if (isLoading) {
        return (
            <div className="bg-white border border-neutral-200 shadow-sm rounded-lg p-6 flex flex-col items-center justify-center min-h-[220px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-sm text-neutral-500 font-medium">Chargement des informations d'abonnement...</p>
            </div>
        );
    }

    if (!info) {
        return (
            <div className="bg-white border border-neutral-200 shadow-sm rounded-lg p-6 text-center text-sm text-neutral-500">
                Impossible de charger les données d'abonnement.
            </div>
        );
    }

    const { plan, latestSubscription, trialEndsAt, studentsUsed, smsUsed } = info;

    // Quota calculations
    const maxStudents = plan?.maxStudents ?? 0;
    const maxSms = plan?.maxSmsPerMonth ?? 0;

    const studentPercent = maxStudents === -1 ? 100 : Math.min(100, Math.round((studentsUsed / maxStudents) * 100));
    const smsPercent = maxSms === -1 ? 100 : Math.min(100, Math.round((smsUsed / maxSms) * 100));

    // Expiry and Status Logic
    const isTrial = latestSubscription?.status === 'TRIAL' || (!latestSubscription && trialEndsAt);
    const status = latestSubscription?.status || (trialEndsAt ? 'TRIAL' : 'EXPIRED');

    const expiryDate = latestSubscription?.endDate 
        ? new Date(latestSubscription.endDate) 
        : trialEndsAt 
            ? new Date(trialEndsAt) 
            : null;

    const formattedExpiry = expiryDate 
        ? expiryDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Indéterminée';

    const isExpired = expiryDate ? new Date() > expiryDate : true;

    // Get color theme according to state
    const getStatusBadge = () => {
        if (isExpired && status !== 'ACTIVE') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    ● Expiré
                </span>
            );
        }
        if (isTrial) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    ● Période d'essai
                </span>
            );
        }
        if (status === 'ACTIVE') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    ● Actif
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800">
                ● En attente
            </span>
        );
    };

    return (
        <div className="bg-white border border-neutral-200 shadow-sm rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
            {/* Header section with primary dark-green aesthetic */}
            <div className="bg-gradient-to-r from-primary to-[#2E7D32] p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight">
                                Formule {plan?.name || 'Aucune'}
                            </h2>
                            {getStatusBadge()}
                        </div>
                        <p className="text-sm text-white/80 mt-1 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {isTrial ? "L'essai gratuit se termine le :" : "Date d'expiration :"}{' '}
                            <span className="font-semibold text-white">{formattedExpiry}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => refetch()}
                        className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-150"
                        title="Rafraîchir"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setIsRenewOpen(true)}
                        className="px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold text-sm transition-colors duration-150 flex items-center gap-2 shadow-sm"
                    >
                        <CreditCard className="h-4 w-4" />
                        {isExpired ? 'Activer mon abonnement' : 'Renouveler ou changer de formule'}
                    </button>
                </div>
            </div>

            {/* Quota Indicators */}
            <div className="p-6 bg-neutral-50/50 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-neutral-100">
                {/* Students Quota Card */}
                <div className="bg-white border border-neutral-200/60 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-700">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">Quota d'élèves</span>
                        </div>
                        <span className="text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {studentsUsed} / {maxStudents === -1 ? 'Illimité' : maxStudents}
                        </span>
                    </div>

                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${
                                studentPercent >= 90 ? 'bg-red-500' : 'bg-primary'
                            }`}
                            style={{ width: `${studentPercent}%` }}
                        />
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-neutral-500">
                        <span>Élèves enregistrés</span>
                        <span>{studentPercent}% consommé</span>
                    </div>
                </div>

                {/* SMS Quota Card */}
                <div className="bg-white border border-neutral-200/60 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-700">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">SMS mensuel</span>
                        </div>
                        <span className="text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {smsUsed} / {maxSms === -1 ? 'Illimité' : maxSms}
                        </span>
                    </div>

                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${
                                smsPercent >= 90 ? 'bg-red-500' : 'bg-primary'
                            }`}
                            style={{ width: `${smsPercent}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-xs text-neutral-500">
                        <span>SMS envoyés ce mois</span>
                        <span>{smsPercent}% consommé</span>
                    </div>
                </div>
            </div>

            {/* Modal integration */}
            {isRenewOpen && (
                <RenewModal
                    isOpen={isRenewOpen}
                    onClose={() => setIsRenewOpen(false)}
                    currentPlanSlug={plan?.slug}
                />
            )}
        </div>
    );
}
