import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: { value: number; label: string; positive: boolean };
  isLoading?: boolean;
  onClick?: () => void;
  href?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'bg-blue-100 text-blue-600',
  trend,
  isLoading,
  onClick,
  href,
}: StatCardProps) {
  const content = (
    <Card
      className={`p-5 transition-all ${
        (onClick || href) ? 'hover:shadow-md cursor-pointer' : ''
      }`}
    >
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${iconColor}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{title}</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
              </div>
            </div>
          </div>

          {subtitle && (
            <p className="text-xs text-neutral-500">{subtitle}</p>
          )}

          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {trend.positive ? (
                <TrendingUp size={14} className="text-green-600" />
              ) : (
                <TrendingDown size={14} className="text-red-600" />
              )}
              <span className={trend.positive ? 'text-green-600' : 'text-red-600'}>
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-neutral-500">{trend.label}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  if (href) {
    return (
      <Link to={href} onClick={onClick}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick}>
        {content}
      </div>
    );
  }

  return content;
}
