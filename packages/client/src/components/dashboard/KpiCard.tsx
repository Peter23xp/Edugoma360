import { type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: { value: number; direction: 'up' | 'down'; isGood: boolean };
  href?: string;
  isLoading?: boolean;
  alert?: boolean;
}

export default function KpiCard({
  title, value, subtitle, icon: Icon, iconColor,
  trend, href, isLoading, alert,
}: KpiCardProps) {
  const content = (
    <div className={cn(
      'bg-white rounded-lg border p-3 flex items-center gap-3 h-20 transition-shadow',
      alert ? 'border-red-300 bg-red-50' : 'hover:shadow-sm',
      href && 'cursor-pointer',
    )}>
      <div className={cn('p-2 rounded-lg shrink-0', iconColor)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 truncate">{title}</p>
        {isLoading ? (
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-xl font-bold text-gray-900 leading-tight truncate">{value}</p>
        )}
        {subtitle && !isLoading && (
          <p className="text-xs text-gray-400 truncate">{subtitle}</p>
        )}
      </div>
      {trend && !isLoading && (
        <div className={cn(
          'text-xs font-medium shrink-0',
          trend.isGood ? 'text-green-600' : 'text-red-600',
        )}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
        </div>
      )}
    </div>
  );

  if (href) return <Link to={href}>{content}</Link>;
  return content;
}
