import { AlertCircle, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  href: string;
  createdAt: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
  isLoading?: boolean;
}

export default function AlertsPanel({ alerts, isLoading }: AlertsPanelProps) {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-amber-600" />;
      case 'info':
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getAlertBg = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <h3 className="text-lg font-semibold text-neutral-900">Alertes</h3>
        {alerts.length > 0 && (
          <Badge variant="destructive" className="rounded-full">
            {alerts.length}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-5 h-5 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-sm text-neutral-600">Aucune alerte en cours</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <Link
                key={alert.id}
                to={alert.href}
                className={`flex items-center gap-3 p-3 border rounded-lg transition-all hover:shadow-sm ${getAlertBg(
                  alert.type
                )}`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-900 line-clamp-2">{alert.message}</p>
                </div>
                <ChevronRight size={16} className="text-neutral-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
