import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Download, CheckCircle, XCircle, Clock, Loader2,
  Calendar, Search, Send,
  BarChart3, AlertTriangle, ArrowRight
} from 'lucide-react';
import { useSMS } from '../../hooks/useSMS';

// ── Component ────────────────────────────────────────────────────────
export function SMSHistory() {
  const { history, isLoadingHistory } = useSMS();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7days');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter history
  const filteredHistory = (history as any[]).filter(campaign => {
    // Status filter
    if (statusFilter !== 'all' && campaign.status !== statusFilter) return false;

    // Date filter
    if (dateFilter !== 'all') {
      const campaignDate = new Date(campaign.createdAt || campaign.date);
      const now = new Date();
      const diffDays = (now.getTime() - campaignDate.getTime()) / (1000 * 60 * 60 * 24);
      if (dateFilter === '7days' && diffDays > 7) return false;
      if (dateFilter === '30days' && diffDays > 30) return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const name = (campaign.name || campaign.template || '').toLowerCase();
      if (!name.includes(search)) return false;
    }

    return true;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: CheckCircle,
          label: 'Complété',
          className: 'bg-green-50 text-green-700 border-green-200',
          iconColor: 'text-green-500',
        };
      case 'FAILED':
        return {
          icon: XCircle,
          label: 'Échoué',
          className: 'bg-red-50 text-red-700 border-red-200',
          iconColor: 'text-red-500',
        };
      case 'SENDING':
        return {
          icon: Loader2,
          label: 'En cours',
          className: 'bg-blue-50 text-blue-700 border-blue-200',
          iconColor: 'text-blue-500',
        };
      case 'QUEUED':
        return {
          icon: Clock,
          label: 'En attente',
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          iconColor: 'text-yellow-500',
        };
      case 'SCHEDULED':
        return {
          icon: Calendar,
          label: 'Programmé',
          className: 'bg-[#E8F5E9] text-[#1B5E20] border-[#1B5E20]/30',
          iconColor: 'text-[#0D47A1]',
        };
      default:
        return {
          icon: Clock,
          label: status,
          className: 'bg-gray-50 text-gray-700 border-gray-200',
          iconColor: 'text-gray-500',
        };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#1B5E20]/5 to-transparent border-b border-gray-100 pb-4 space-y-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <BarChart3 className="h-5 w-5 text-[#1B5E20]" />
          Historique des envois
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          <div className="flex gap-2">
            <select
              className="text-xs px-2 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20] transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous statuts</option>
              <option value="COMPLETED">Complété</option>
              <option value="SENDING">En cours</option>
              <option value="QUEUED">En attente</option>
              <option value="SCHEDULED">Programmé</option>
              <option value="FAILED">Échoué</option>
            </select>

            <select
              className="text-xs px-2 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20] transition-all"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="7days">7 derniers jours</option>
              <option value="30days">Ce mois</option>
              <option value="all">Tout</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
        {isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
            <p className="text-sm text-gray-500">Chargement de l'historique...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Send className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 text-center">
              {searchTerm || statusFilter !== 'all'
                ? 'Aucun résultat pour ces filtres.'
                : "Aucun envoi dans l'historique."
              }
            </p>
          </div>
        ) : (
          filteredHistory.map((campaign: any) => {
            const statusConfig = getStatusConfig(campaign.status);
            const StatusIcon = statusConfig.icon;
            const successRate = campaign.sentSMS > 0
              ? Math.round((campaign.sentSMS / (campaign.sentSMS + (campaign.failedSMS || 0))) * 100)
              : 0;

            return (
              <div
                key={campaign.id}
                className="
                  group rounded-xl border border-gray-200 bg-white p-4 space-y-3
                  hover:shadow-md hover:border-gray-300 transition-all duration-200
                "
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-500 text-xs">
                        {formatDate(campaign.createdAt || campaign.date)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-800 mt-1 truncate">
                      {campaign.name || 'Campagne SMS'}
                    </h4>
                  </div>

                  <Badge
                    className={`
                      text-[10px] px-2 py-0.5 font-medium border flex-shrink-0 flex items-center gap-1
                      ${statusConfig.className}
                    `}
                  >
                    <StatusIcon className={`h-3 w-3 ${statusConfig.iconColor} ${campaign.status === 'SENDING' ? 'animate-spin' : ''}`} />
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Send className="h-3 w-3 text-green-500" />
                    <span className="font-medium">{campaign.sentSMS || 0}</span> envoyés
                  </span>
                  {(campaign.failedSMS || 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-red-400" />
                      <span className="font-medium text-red-600">{campaign.failedSMS}</span> échecs
                    </span>
                  )}
                  <span className="flex items-center gap-1 ml-auto">
                    <span className="font-semibold text-gray-800">
                      {(campaign.cost || 0).toLocaleString('fr-FR')} FC
                    </span>
                  </span>
                </div>

                {/* Progress bar for active campaigns */}
                {['SENDING', 'QUEUED'].includes(campaign.status) && (
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1B5E20] to-[#4CAF50] rounded-full transition-all duration-500"
                      style={{
                        width: `${campaign.totalRecipients > 0
                          ? Math.round(((campaign.sentSMS || 0) / campaign.totalRecipients) * 100)
                          : 0}%`
                      }}
                    />
                  </div>
                )}

                {/* Success rate bar for completed */}
                {campaign.status === 'COMPLETED' && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          successRate >= 90 ? 'bg-green-500' : successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${successRate}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">{successRate}%</span>
                  </div>
                )}

                {/* Creator */}
                {(campaign.createdBy || campaign.createdByName) && (
                  <p className="text-[10px] text-gray-400">
                    Par : {typeof campaign.createdBy === 'object' ? campaign.createdBy.name : (campaign.createdBy || campaign.createdByName)}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button variant="link" className="p-0 h-auto text-[#1B5E20] text-xs font-medium gap-1">
                    Voir détails <ArrowRight className="h-3 w-3" />
                  </Button>
                  <Button variant="link" className="p-0 h-auto text-[#0D47A1] text-xs font-medium gap-1">
                    <Download className="h-3 w-3" /> Rapport
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
